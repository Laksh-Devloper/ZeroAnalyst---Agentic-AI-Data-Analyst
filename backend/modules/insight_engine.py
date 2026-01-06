import pandas as pd
import numpy as np
from typing import Dict, Any, List


class InsightEngine:
    """Generate automated insights from data analysis."""
    
    def __init__(self, df: pd.DataFrame, column_types: Dict[str, str], stats: Dict[str, Any]):
        self.df = df
        self.column_types = column_types
        self.stats = stats
        self.insights = []
    
    def generate_insights(self) -> List[str]:
        """
        Generate rule-based insights from the data.
        
        Returns:
            List of insight strings
        """
        self._analyze_numeric_columns()
        self._analyze_categorical_columns()
        self._analyze_trends()
        self._analyze_correlations()
        self._analyze_data_quality()
        
        return self.insights[:7]  # Return top 7 insights
    
    def _analyze_numeric_columns(self):
        """Generate insights from numeric columns."""
        numeric_stats = self.stats.get('numeric_stats', {})
        
        for col, col_stats in numeric_stats.items():
            # Identify highest and lowest values
            max_val = col_stats['max']
            min_val = col_stats['min']
            mean_val = col_stats['mean']
            
            # Check for significant outliers
            std_val = col_stats['std']
            if std_val > 0:
                cv = (std_val / mean_val) * 100  # Coefficient of variation
                if cv > 50:
                    self.insights.append(
                        f"⚠️ High variability detected in '{col}' (CV: {cv:.1f}%) - data ranges from {min_val:.2f} to {max_val:.2f}"
                    )
                else:
                    self.insights.append(
                        f"📊 '{col}' shows consistent values with average of {mean_val:.2f} (±{std_val:.2f})"
                    )
    
    def _analyze_categorical_columns(self):
        """Generate insights from categorical columns."""
        categorical_stats = self.stats.get('categorical_stats', {})
        
        for col, col_stats in categorical_stats.items():
            most_common = col_stats['most_common']
            most_common_count = col_stats['most_common_count']
            total_rows = self.stats['overview']['total_rows']
            
            percentage = (most_common_count / total_rows) * 100
            
            if percentage > 50:
                self.insights.append(
                    f"🎯 '{most_common}' dominates '{col}' category with {percentage:.1f}% of all records"
                )
            else:
                unique_count = col_stats['unique_values']
                self.insights.append(
                    f"🔍 '{col}' has {unique_count} unique values, with '{most_common}' being most common ({percentage:.1f}%)"
                )
    
    def _analyze_trends(self):
        """Detect trends in numeric data."""
        numeric_cols = [col for col, type_ in self.column_types.items() if type_ == 'numeric']
        
        for col in numeric_cols[:2]:  # Analyze first 2 numeric columns
            values = self.df[col].values
            
            if len(values) < 3:
                continue
            
            # Calculate simple trend (first half vs second half)
            mid_point = len(values) // 2
            first_half_mean = np.mean(values[:mid_point])
            second_half_mean = np.mean(values[mid_point:])
            
            if first_half_mean > 0:
                change_pct = ((second_half_mean - first_half_mean) / first_half_mean) * 100
                
                if abs(change_pct) > 10:
                    trend = "upward" if change_pct > 0 else "downward"
                    self.insights.append(
                        f"📈 '{col}' shows {trend} trend with {abs(change_pct):.1f}% change over time"
                    )
    
    def _analyze_correlations(self):
        """Generate insights from correlations."""
        correlations = self.stats.get('correlations', {})
        top_corr = correlations.get('top_correlations', [])
        
        if top_corr:
            strongest = top_corr[0]
            corr_val = strongest['correlation']
            
            if abs(corr_val) > 0.7:
                relationship = "strong positive" if corr_val > 0 else "strong negative"
                self.insights.append(
                    f"🔗 {relationship.capitalize()} correlation ({corr_val:.2f}) found between '{strongest['col1']}' and '{strongest['col2']}'"
                )
    
    def _analyze_data_quality(self):
        """Analyze overall data quality."""
        overview = self.stats['overview']
        total_rows = overview['total_rows']
        total_cols = overview['total_columns']
        
        self.insights.append(
            f"✅ Dataset contains {total_rows:,} rows and {total_cols} columns with clean, processed data"
        )
