import pandas as pd
import numpy as np
from typing import Dict, Any, List


class StatsEngine:
    """Calculate comprehensive statistics for datasets."""
    
    def __init__(self, df: pd.DataFrame, column_types: Dict[str, str]):
        self.df = df
        self.column_types = column_types
    
    def calculate_all(self) -> Dict[str, Any]:
        """
        Calculate comprehensive statistics for the dataset.
        
        Returns:
            Dictionary containing all statistics
        """
        stats = {
            'overview': self._get_overview(),
            'numeric_stats': self._get_numeric_stats(),
            'categorical_stats': self._get_categorical_stats(),
            'correlations': self._get_correlations()
        }
        
        return stats
    
    def _get_overview(self) -> Dict[str, Any]:
        """Get basic dataset overview."""
        return {
            'total_rows': len(self.df),
            'total_columns': len(self.df.columns),
            'numeric_columns': sum(1 for t in self.column_types.values() if t == 'numeric'),
            'categorical_columns': sum(1 for t in self.column_types.values() if t == 'categorical'),
            'datetime_columns': sum(1 for t in self.column_types.values() if t == 'datetime')
        }
    
    def _get_numeric_stats(self) -> Dict[str, Dict[str, float]]:
        """Calculate statistics for numeric columns."""
        numeric_cols = [col for col, type_ in self.column_types.items() if type_ == 'numeric']
        
        if not numeric_cols:
            return {}
        
        stats = {}
        for col in numeric_cols:
            try:
                stats[col] = {
                    'mean': float(self.df[col].mean()),
                    'median': float(self.df[col].median()),
                    'mode': float(self.df[col].mode()[0]) if not self.df[col].mode().empty else 0,
                    'std': float(self.df[col].std()),
                    'min': float(self.df[col].min()),
                    'max': float(self.df[col].max()),
                    'q1': float(self.df[col].quantile(0.25)),
                    'q3': float(self.df[col].quantile(0.75)),
                    'sum': float(self.df[col].sum()),
                    'count': int(self.df[col].count())
                }
            except Exception as e:
                print(f"Error calculating stats for {col}: {e}")
                continue
        
        return stats
    
    def _get_categorical_stats(self) -> Dict[str, Dict[str, Any]]:
        """Calculate statistics for categorical columns."""
        categorical_cols = [col for col, type_ in self.column_types.items() if type_ == 'categorical']
        
        if not categorical_cols:
            return {}
        
        stats = {}
        for col in categorical_cols:
            try:
                value_counts = self.df[col].value_counts()
                stats[col] = {
                    'unique_values': int(self.df[col].nunique()),
                    'most_common': str(value_counts.index[0]) if len(value_counts) > 0 else 'N/A',
                    'most_common_count': int(value_counts.iloc[0]) if len(value_counts) > 0 else 0,
                    'top_5': value_counts.head(5).to_dict()
                }
            except Exception as e:
                print(f"Error calculating stats for {col}: {e}")
                continue
        
        return stats
    
    def _get_correlations(self) -> Dict[str, Any]:
        """Calculate correlation matrix for numeric columns."""
        numeric_cols = [col for col, type_ in self.column_types.items() if type_ == 'numeric']
        
        if len(numeric_cols) < 2:
            return {}
        
        try:
            corr_matrix = self.df[numeric_cols].corr()
            
            # Find strongest correlations
            correlations = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i + 1, len(corr_matrix.columns)):
                    correlations.append({
                        'col1': corr_matrix.columns[i],
                        'col2': corr_matrix.columns[j],
                        'correlation': float(corr_matrix.iloc[i, j])
                    })
            
            # Sort by absolute correlation value
            correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
            
            return {
                'matrix': corr_matrix.to_dict(),
                'top_correlations': correlations[:5]
            }
        except Exception as e:
            print(f"Error calculating correlations: {e}")
            return {}
