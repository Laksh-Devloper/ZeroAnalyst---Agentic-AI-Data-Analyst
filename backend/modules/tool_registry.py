"""
ToolRegistry - Data Analysis Helper Functions
Provides analysis functions that can be called by the AI agent
"""

import pandas as pd
import json
from typing import Dict, Any, Optional, List


class ToolRegistry:
    """
    Registry of tools for the AI agent.
    Wraps existing analysis modules as LangChain tools.
    """
    
    def __init__(
        self,
        df: pd.DataFrame,
        column_types: Dict[str, str],
        stats_engine: Any,
        chart_generator: Any
    ):
        """
        Initialize the tool registry.
        
        Args:
            df: Pandas DataFrame
            column_types: Dictionary mapping column names to types
            stats_engine: StatsEngine instance
            chart_generator: PlotlyChartGenerator instance
        """
        self.df = df
        self.column_types = column_types
        self.stats_engine = stats_engine
        self.chart_generator = chart_generator
        
    def _analyze_column(self, column_name: str, analysis_type: str) -> str:
        """Analyze a specific column."""
        try:
            if column_name not in self.df.columns:
                return f"❌ Column '{column_name}' not found. Available columns: {', '.join(self.df.columns)}"
            
            col_type = self.column_types.get(column_name, 'unknown')
            col_data = self.df[column_name]
            
            if analysis_type == 'statistics':
                if col_type == 'numeric':
                    stats = {
                        'mean': float(col_data.mean()),
                        'median': float(col_data.median()),
                        'std': float(col_data.std()),
                        'min': float(col_data.min()),
                        'max': float(col_data.max()),
                        'q25': float(col_data.quantile(0.25)),
                        'q75': float(col_data.quantile(0.75))
                    }
                    return f"📊 Statistics for {column_name}:\n" + "\n".join([f"- {k}: {v:.2f}" for k, v in stats.items()])
                elif col_type == 'categorical':
                    value_counts = col_data.value_counts()
                    top_5 = value_counts.head(5)
                    return f"📊 Top values for {column_name}:\n" + "\n".join([f"- {k}: {v} ({v/len(col_data)*100:.1f}%)" for k, v in top_5.items()])
            
            elif analysis_type == 'distribution':
                value_counts = col_data.value_counts()
                return f"📊 Distribution of {column_name}:\n{value_counts.head(10).to_string()}"
            
            elif analysis_type == 'trend':
                if col_type == 'numeric':
                    # Simple trend analysis
                    first_half = col_data[:len(col_data)//2].mean()
                    second_half = col_data[len(col_data)//2:].mean()
                    change = ((second_half - first_half) / first_half) * 100
                    trend = "increasing" if change > 0 else "decreasing"
                    return f"📈 Trend for {column_name}: {trend} ({change:+.1f}% change from first half to second half)"
            
            elif analysis_type == 'correlation':
                if col_type == 'numeric':
                    # Find correlations with other numeric columns
                    numeric_cols = [c for c, t in self.column_types.items() if t == 'numeric' and c != column_name]
                    if numeric_cols:
                        correlations = {}
                        for other_col in numeric_cols:
                            corr = col_data.corr(self.df[other_col])
                            correlations[other_col] = float(corr)
                        
                        # Sort by absolute correlation
                        sorted_corr = sorted(correlations.items(), key=lambda x: abs(x[1]), reverse=True)
                        result = f"🔗 Correlations with {column_name}:\n"
                        for col, corr in sorted_corr[:5]:
                            result += f"- {col}: {corr:.3f}\n"
                        return result
                    else:
                        return f"No other numeric columns to correlate with {column_name}"
            
            return f"Analysis type '{analysis_type}' not supported for {col_type} column"
            
        except Exception as e:
            return f"❌ Error analyzing column: {str(e)}"
    
    def _generate_chart(self, column_name: str, chart_type: str) -> str:
        """Generate a chart for a column."""
        try:
            if column_name not in self.df.columns:
                return f"❌ Column '{column_name}' not found"
            
            # Generate chart using existing chart generator
            chart_config = None
            
            if chart_type == 'line':
                chart_config = self.chart_generator.generate_line_chart(column_name)
            elif chart_type == 'bar':
                chart_config = self.chart_generator.generate_bar_chart(column_name)
            elif chart_type == 'histogram':
                chart_config = self.chart_generator.generate_histogram(column_name)
            elif chart_type == 'box':
                chart_config = self.chart_generator.generate_box_plot(column_name)
            elif chart_type == 'pie':
                chart_config = self.chart_generator.generate_pie_chart(column_name)
            else:
                return f"❌ Chart type '{chart_type}' not supported. Use: line, bar, histogram, box, or pie"
            
            if chart_config:
                return f"✅ Generated {chart_type} chart for {column_name}. Chart data: {json.dumps(chart_config)[:200]}..."
            else:
                return f"❌ Could not generate {chart_type} chart for {column_name}"
                
        except Exception as e:
            return f"❌ Error generating chart: {str(e)}"
    
    def _query_data(self, query: str) -> str:
        """Query the data using natural language."""
        try:
            # Simple query parsing (can be enhanced with SQL generation)
            query_lower = query.lower()
            
            # Handle "how many" queries
            if 'how many' in query_lower:
                if 'rows' in query_lower or 'records' in query_lower:
                    return f"📊 The dataset has {len(self.df):,} rows"
                if 'columns' in query_lower:
                    return f"📊 The dataset has {len(self.df.columns)} columns: {', '.join(self.df.columns)}"
            
            # Handle "what are" queries
            if 'what are' in query_lower or 'list' in query_lower:
                if 'columns' in query_lower:
                    return f"📋 Columns:\n" + "\n".join([f"- {col} ({self.column_types.get(col, 'unknown')})" for col in self.df.columns])
            
            # Handle "show me" queries
            if 'show' in query_lower or 'display' in query_lower:
                if 'first' in query_lower or 'top' in query_lower:
                    n = 5
                    return f"📋 First {n} rows:\n{self.df.head(n).to_string()}"
            
            # Handle "average" or "mean" queries
            if 'average' in query_lower or 'mean' in query_lower:
                numeric_cols = [c for c, t in self.column_types.items() if t == 'numeric']
                if numeric_cols:
                    means = {col: float(self.df[col].mean()) for col in numeric_cols}
                    return f"📊 Averages:\n" + "\n".join([f"- {col}: {val:.2f}" for col, val in means.items()])
            
            return f"🤔 I understand you want to know: '{query}'. Could you be more specific? Try asking about specific columns or statistics."
            
        except Exception as e:
            return f"❌ Error querying data: {str(e)}"
    
    def _compare_segments(self, segment1_filter: str, segment2_filter: str, metric: str) -> str:
        """Compare two data segments."""
        try:
            if metric not in self.df.columns:
                return f"❌ Metric column '{metric}' not found"
            
            # Simple filter parsing (can be enhanced)
            # For now, just return a message
            return f"📊 Comparing {metric} between segments:\n- Segment 1: {segment1_filter}\n- Segment 2: {segment2_filter}\n(Advanced filtering coming soon)"
            
        except Exception as e:
            return f"❌ Error comparing segments: {str(e)}"
    
    
    def _get_data_summary(self) -> str:
        """Get a summary of the dataset."""
        numeric_cols = [c for c, t in self.column_types.items() if t == 'numeric']
        categorical_cols = [c for c, t in self.column_types.items() if t == 'categorical']
        datetime_cols = [c for c, t in self.column_types.items() if t == 'datetime']
        
        summary = f"""📊 Dataset Summary:
- Total Rows: {len(self.df):,}
- Total Columns: {len(self.df.columns)}
- Numeric Columns ({len(numeric_cols)}): {', '.join(numeric_cols[:5])}{'...' if len(numeric_cols) > 5 else ''}
- Categorical Columns ({len(categorical_cols)}): {', '.join(categorical_cols[:5])}{'...' if len(categorical_cols) > 5 else ''}
- DateTime Columns ({len(datetime_cols)}): {', '.join(datetime_cols[:3])}{'...' if len(datetime_cols) > 3 else ''}
- Missing Values: {self.df.isnull().sum().sum()}
"""
        return summary


if __name__ == "__main__":
    # Test the tool registry
    print("🔧 Testing Tool Registry...")
    
    import numpy as np
    from modules.stats_engine import StatsEngine
    from modules.plotly_chart_generator import PlotlyChartGenerator
    
    # Create sample data
    sample_data = {
        'date': pd.date_range('2024-01-01', periods=100),
        'product': np.random.choice(['A', 'B', 'C'], 100),
        'revenue': np.random.uniform(100, 1000, 100),
        'quantity': np.random.randint(1, 50, 100),
    }
    df = pd.DataFrame(sample_data)
    
    column_types = {
        'date': 'datetime',
        'product': 'categorical',
        'revenue': 'numeric',
        'quantity': 'numeric',
    }
    
    # Initialize engines
    stats_engine = StatsEngine(df, column_types)
    chart_gen = PlotlyChartGenerator(df, column_types)
    
    # Create tool registry
    registry = ToolRegistry(df, column_types, stats_engine, chart_gen)
    
    # Test tools
    print("\n📊 Testing analyze_column:")
    print(registry._analyze_column('revenue', 'statistics'))
    
    print("\n📋 Testing query_data:")
    print(registry._query_data('How many rows are in the dataset?'))
    
    print("\n📈 Testing get_data_summary:")
    print(registry._get_data_summary())
