"""
RAGPipeline - Retrieval Augmented Generation for Dataset Understanding
Converts CSV/Excel data into vector embeddings for semantic search
"""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()


class RAGPipeline:
    """
    RAG system for understanding and querying datasets.
    Creates vector embeddings of data and metadata for semantic search.
    """
    
    def __init__(self, persist_directory: Optional[str] = None):
        """
        Initialize the RAG pipeline.
        
        Args:
            persist_directory: Directory to persist ChromaDB data
        """
        self.persist_dir = persist_directory or os.getenv('CHROMA_PERSIST_DIR', './chroma_db')
        
        # Initialize ChromaDB
        self.client = chromadb.Client(Settings(
            persist_directory=self.persist_dir,
            anonymized_telemetry=False
        ))
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Collection for current dataset
        self.collection = None
        self.collection_name = None
        
    def index_dataset(
        self,
        df: pd.DataFrame,
        filename: str,
        column_types: Dict[str, str],
        statistics: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Index a dataset for semantic search.
        
        Args:
            df: Pandas DataFrame to index
            filename: Name of the file
            column_types: Dictionary mapping column names to types
            statistics: Optional statistics about the dataset
            
        Returns:
            Dictionary with indexing results
        """
        try:
            # Create or get collection
            collection_name = f"dataset_{filename.replace('.', '_')}"
            
            # Delete existing collection if it exists
            try:
                self.client.delete_collection(collection_name)
            except:
                pass
            
            self.collection = self.client.create_collection(
                name=collection_name,
                metadata={"filename": filename}
            )
            self.collection_name = collection_name
            
            # Create documents to embed
            documents = []
            metadatas = []
            ids = []
            
            # 1. Index column metadata
            for col_name, col_type in column_types.items():
                doc_text = self._create_column_document(df, col_name, col_type, statistics)
                documents.append(doc_text)
                metadatas.append({
                    'type': 'column_metadata',
                    'column_name': col_name,
                    'column_type': col_type
                })
                ids.append(f"col_{col_name}")
            
            # 2. Index sample rows (for context)
            sample_size = min(100, len(df))
            sample_df = df.sample(n=sample_size, random_state=42)
            
            for idx, row in sample_df.iterrows():
                doc_text = self._create_row_document(row, column_types)
                documents.append(doc_text)
                metadatas.append({
                    'type': 'data_row',
                    'row_index': int(idx)
                })
                ids.append(f"row_{idx}")
            
            # 3. Index overall dataset summary
            summary_doc = self._create_dataset_summary(df, column_types, statistics)
            documents.append(summary_doc)
            metadatas.append({'type': 'dataset_summary'})
            ids.append('summary')
            
            # Add to collection
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            return {
                'success': True,
                'collection_name': collection_name,
                'documents_indexed': len(documents),
                'columns_indexed': len(column_types),
                'rows_sampled': sample_size
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _create_column_document(
        self,
        df: pd.DataFrame,
        col_name: str,
        col_type: str,
        statistics: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a text document describing a column."""
        doc_parts = [f"Column: {col_name}"]
        doc_parts.append(f"Type: {col_type}")
        
        col_data = df[col_name]
        
        if col_type == 'numeric':
            doc_parts.append(f"Mean: {col_data.mean():.2f}")
            doc_parts.append(f"Median: {col_data.median():.2f}")
            doc_parts.append(f"Min: {col_data.min():.2f}")
            doc_parts.append(f"Max: {col_data.max():.2f}")
            doc_parts.append(f"Std Dev: {col_data.std():.2f}")
            
        elif col_type == 'categorical':
            value_counts = col_data.value_counts()
            top_values = value_counts.head(5)
            doc_parts.append(f"Unique values: {col_data.nunique()}")
            doc_parts.append(f"Most common: {', '.join([f'{v} ({c})' for v, c in top_values.items()])}")
        
        elif col_type == 'datetime':
            doc_parts.append(f"Earliest: {col_data.min()}")
            doc_parts.append(f"Latest: {col_data.max()}")
            doc_parts.append(f"Range: {(col_data.max() - col_data.min()).days} days")
        
        return ". ".join(doc_parts)
    
    def _create_row_document(self, row: pd.Series, column_types: Dict[str, str]) -> str:
        """Create a text document for a data row."""
        doc_parts = []
        for col_name, value in row.items():
            if pd.notna(value):
                doc_parts.append(f"{col_name}: {value}")
        return ". ".join(doc_parts)
    
    def _create_dataset_summary(
        self,
        df: pd.DataFrame,
        column_types: Dict[str, str],
        statistics: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create an overall dataset summary document."""
        doc_parts = [
            f"Dataset with {len(df)} rows and {len(df.columns)} columns",
            f"Numeric columns: {', '.join([k for k, v in column_types.items() if v == 'numeric'])}",
            f"Categorical columns: {', '.join([k for k, v in column_types.items() if v == 'categorical'])}",
        ]
        
        if statistics and 'overview' in statistics:
            overview = statistics['overview']
            if 'missing_percentage' in overview:
                doc_parts.append(f"Missing data: {overview['missing_percentage']:.1f}%")
        
        return ". ".join(doc_parts)
    
    def query(self, query_text: str, n_results: int = 5) -> Dict[str, Any]:
        """
        Query the indexed dataset.
        
        Args:
            query_text: Natural language query
            n_results: Number of results to return
            
        Returns:
            Dictionary with query results
        """
        if not self.collection:
            return {
                'success': False,
                'error': 'No dataset indexed. Please upload and index a dataset first.'
            }
        
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            
            return {
                'success': True,
                'documents': results['documents'][0],
                'metadatas': results['metadatas'][0],
                'distances': results['distances'][0]
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_relevant_context(self, query_text: str, max_context_length: int = 1000) -> str:
        """
        Get relevant context for a query as a formatted string.
        
        Args:
            query_text: Natural language query
            max_context_length: Maximum length of context string
            
        Returns:
            Formatted context string
        """
        result = self.query(query_text, n_results=3)
        
        if not result['success']:
            return ""
        
        context_parts = []
        for doc, metadata in zip(result['documents'], result['metadatas']):
            if metadata['type'] == 'column_metadata':
                context_parts.append(f"📊 {doc}")
            elif metadata['type'] == 'dataset_summary':
                context_parts.append(f"📋 {doc}")
        
        context = "\n".join(context_parts)
        
        # Truncate if too long
        if len(context) > max_context_length:
            context = context[:max_context_length] + "..."
        
        return context
    
    def clear(self):
        """Clear the current collection."""
        if self.collection_name:
            try:
                self.client.delete_collection(self.collection_name)
                self.collection = None
                self.collection_name = None
            except:
                pass


if __name__ == "__main__":
    # Test the RAG pipeline
    print("🔍 Testing RAG Pipeline...")
    
    # Create sample data
    sample_data = {
        'date': pd.date_range('2024-01-01', periods=100),
        'product': np.random.choice(['A', 'B', 'C'], 100),
        'revenue': np.random.uniform(100, 1000, 100),
        'quantity': np.random.randint(1, 50, 100),
        'region': np.random.choice(['North', 'South', 'East', 'West'], 100)
    }
    df = pd.DataFrame(sample_data)
    
    column_types = {
        'date': 'datetime',
        'product': 'categorical',
        'revenue': 'numeric',
        'quantity': 'numeric',
        'region': 'categorical'
    }
    
    # Initialize RAG
    rag = RAGPipeline()
    
    # Index dataset
    print("\n📥 Indexing dataset...")
    result = rag.index_dataset(df, 'sales.csv', column_types)
    print(f"Result: {result}")
    
    # Test queries
    print("\n🔎 Testing queries...")
    queries = [
        "What are the revenue statistics?",
        "Tell me about the products",
        "What regions are in the data?"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        context = rag.get_relevant_context(query)
        print(f"Context:\n{context}")
