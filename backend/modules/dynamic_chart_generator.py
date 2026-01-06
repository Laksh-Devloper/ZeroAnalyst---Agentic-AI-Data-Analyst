import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from typing import Optional


class DynamicChartGenerator:
    """Generate charts for specific columns on demand."""
    
    def __init__(self, df: pd.DataFrame, column_types: dict):
        self.df = df
        self.column_types = column_types
        plt.style.use('dark_background')
        self.colors = ['#00D9FF', '#FF6B9D', '#C0FF00', '#FFA500', '#9D4EDD']
    
    def generate_trend_chart(self, column_name: str) -> Optional[str]:
        """
        Generate a trend/line chart for a specific column.
        
        Args:
            column_name: Name of the column to visualize
            
        Returns:
            Base64 encoded image or None if column not found
        """
        if column_name not in self.df.columns:
            return None
        
        # Check if column is numeric
        if self.column_types.get(column_name) != 'numeric':
            return None
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Check if we have a datetime column for x-axis
        datetime_cols = [col for col, type_ in self.column_types.items() if type_ == 'datetime']
        
        if datetime_cols:
            x_col = datetime_cols[0]
            df_sorted = self.df.sort_values(x_col)
            ax.plot(df_sorted[x_col], df_sorted[column_name], 
                   color=self.colors[0], linewidth=2.5, marker='o', markersize=6)
            ax.set_xlabel(x_col, fontsize=13, fontweight='bold')
            plt.xticks(rotation=45, ha='right')
        else:
            # Use index as x-axis
            ax.plot(self.df.index, self.df[column_name], 
                   color=self.colors[0], linewidth=2.5, marker='o', markersize=6)
            ax.set_xlabel('Index', fontsize=13, fontweight='bold')
        
        ax.set_ylabel(column_name, fontsize=13, fontweight='bold')
        ax.set_title(f'Trend Analysis: {column_name}', fontsize=16, fontweight='bold', pad=20)
        ax.grid(alpha=0.3, linestyle='--')
        
        # Add value labels on points
        for i, val in enumerate(self.df[column_name]):
            if i % max(1, len(self.df) // 10) == 0:  # Show every nth label to avoid clutter
                ax.annotate(f'{val:.0f}', 
                           xy=(i if not datetime_cols else df_sorted[datetime_cols[0]].iloc[i], val),
                           xytext=(0, 10), textcoords='offset points',
                           ha='center', fontsize=9, color='#C0FF00')
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def generate_bar_chart(self, column_name: str) -> Optional[str]:
        """Generate bar chart for a categorical column."""
        if column_name not in self.df.columns:
            return None
        
        if self.column_types.get(column_name) != 'categorical':
            return None
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        value_counts = self.df[column_name].value_counts().head(15)
        bars = ax.bar(range(len(value_counts)), value_counts.values, 
                     color=self.colors[1], alpha=0.8, edgecolor='white', linewidth=1.5)
        
        ax.set_xlabel(column_name, fontsize=13, fontweight='bold')
        ax.set_ylabel('Count', fontsize=13, fontweight='bold')
        ax.set_title(f'Distribution: {column_name}', fontsize=16, fontweight='bold', pad=20)
        ax.set_xticks(range(len(value_counts)))
        ax.set_xticklabels(value_counts.index, rotation=45, ha='right')
        ax.grid(axis='y', alpha=0.3, linestyle='--')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{int(height)}',
                   ha='center', va='bottom', fontsize=10, color='#C0FF00')
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def generate_histogram(self, column_name: str) -> Optional[str]:
        """Generate histogram for a numeric column."""
        if column_name not in self.df.columns:
            return None
        
        if self.column_types.get(column_name) != 'numeric':
            return None
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        n, bins, patches = ax.hist(self.df[column_name], bins=20, 
                                   color=self.colors[2], alpha=0.7, 
                                   edgecolor='white', linewidth=1.5)
        
        ax.set_xlabel(column_name, fontsize=13, fontweight='bold')
        ax.set_ylabel('Frequency', fontsize=13, fontweight='bold')
        ax.set_title(f'Distribution: {column_name}', fontsize=16, fontweight='bold', pad=20)
        ax.grid(axis='y', alpha=0.3, linestyle='--')
        
        # Add mean and median lines
        mean_val = self.df[column_name].mean()
        median_val = self.df[column_name].median()
        
        ax.axvline(mean_val, color='#FF6B9D', linestyle='--', linewidth=2, label=f'Mean: {mean_val:.2f}')
        ax.axvline(median_val, color='#00D9FF', linestyle='--', linewidth=2, label=f'Median: {median_val:.2f}')
        ax.legend(fontsize=11)
        
        plt.tight_layout()
        return self._fig_to_base64(fig)
    
    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string."""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor='#1a1a1a')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
