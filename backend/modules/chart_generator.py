import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from typing import Dict, Any, List, Optional


class ChartGenerator:
    """Generate charts from dataset using Matplotlib."""
    
    def __init__(self, df: pd.DataFrame, column_types: Dict[str, str]):
        self.df = df
        self.column_types = column_types
        
        # Set style for dark theme compatibility
        plt.style.use('dark_background')
        self.colors = ['#00D9FF', '#FF6B9D', '#C0FF00', '#FFA500', '#9D4EDD']
    
    def generate_all(self) -> Dict[str, str]:
        """
        Generate all chart types.
        
        Returns:
            Dictionary with chart names as keys and base64 images as values
        """
        charts = {}
        
        bar_chart = self.generate_bar_chart()
        if bar_chart:
            charts['bar'] = bar_chart
        
        line_chart = self.generate_line_chart()
        if line_chart:
            charts['line'] = line_chart
        
        pie_chart = self.generate_pie_chart()
        if pie_chart:
            charts['pie'] = pie_chart
        
        return charts
    
    def generate_bar_chart(self) -> Optional[str]:
        """Generate bar chart for top categories."""
        # Find best column for bar chart (categorical with reasonable unique values)
        categorical_cols = [col for col, type_ in self.column_types.items() if type_ == 'categorical']
        numeric_cols = [col for col, type_ in self.column_types.items() if type_ == 'numeric']
        
        if not categorical_cols:
            return None
        
        # Use first categorical column
        cat_col = categorical_cols[0]
        value_counts = self.df[cat_col].value_counts().head(10)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        bars = ax.bar(range(len(value_counts)), value_counts.values, color=self.colors[0], alpha=0.8)
        
        ax.set_xlabel(cat_col, fontsize=12, fontweight='bold')
        ax.set_ylabel('Count', fontsize=12, fontweight='bold')
        ax.set_title(f'Top 10 {cat_col} Distribution', fontsize=14, fontweight='bold', pad=20)
        ax.set_xticks(range(len(value_counts)))
        ax.set_xticklabels(value_counts.index, rotation=45, ha='right')
        ax.grid(axis='y', alpha=0.3)
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def generate_line_chart(self) -> Optional[str]:
        """Generate line chart for time series or sequential data."""
        numeric_cols = [col for col, type_ in self.column_types.items() if type_ == 'numeric']
        datetime_cols = [col for col, type_ in self.column_types.items() if type_ == 'datetime']
        
        if not numeric_cols:
            return None
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # If we have datetime, use it as x-axis
        if datetime_cols:
            x_col = datetime_cols[0]
            y_col = numeric_cols[0]
            
            # Sort by datetime
            df_sorted = self.df.sort_values(x_col)
            ax.plot(df_sorted[x_col], df_sorted[y_col], color=self.colors[1], linewidth=2, marker='o', markersize=4)
            ax.set_xlabel(x_col, fontsize=12, fontweight='bold')
            plt.xticks(rotation=45, ha='right')
        else:
            # Just plot first numeric column against index
            y_col = numeric_cols[0]
            ax.plot(self.df.index, self.df[y_col], color=self.colors[1], linewidth=2, marker='o', markersize=4)
            ax.set_xlabel('Index', fontsize=12, fontweight='bold')
        
        ax.set_ylabel(y_col, fontsize=12, fontweight='bold')
        ax.set_title(f'{y_col} Trend', fontsize=14, fontweight='bold', pad=20)
        ax.grid(alpha=0.3)
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def generate_pie_chart(self) -> Optional[str]:
        """Generate pie chart for category distribution."""
        categorical_cols = [col for col, type_ in self.column_types.items() if type_ == 'categorical']
        
        if not categorical_cols:
            return None
        
        # Use first categorical column
        cat_col = categorical_cols[0]
        value_counts = self.df[cat_col].value_counts().head(5)
        
        fig, ax = plt.subplots(figsize=(10, 8))
        wedges, texts, autotexts = ax.pie(
            value_counts.values,
            labels=value_counts.index,
            autopct='%1.1f%%',
            colors=self.colors,
            startangle=90,
            textprops={'fontsize': 11, 'fontweight': 'bold'}
        )
        
        ax.set_title(f'{cat_col} Distribution (Top 5)', fontsize=14, fontweight='bold', pad=20)
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string."""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight', facecolor='#1a1a1a')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
