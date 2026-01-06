import plotly.graph_objects as go
import plotly.express as px
from typing import Optional, Dict
import pandas as pd


class PlotlyChartGenerator:
    """Generate interactive Plotly charts."""
    
    def __init__(self, df: pd.DataFrame, column_types: dict):
        self.df = df
        self.column_types = column_types
        
        # Dark theme configuration - Teal/Sage palette
        self.layout_config = {
            'paper_bgcolor': '#031926',  # Dark Navy
            'plot_bgcolor': '#0a2533',   # Slightly lighter navy
            'font': {'color': '#F4E8CD', 'family': 'Inter, sans-serif'},  # Cream text
            'title_font': {'size': 20, 'color': '#77ACA2'},  # Sage green
            'xaxis': {
                'gridcolor': 'rgba(119, 172, 162, 0.1)',
                'zerolinecolor': 'rgba(119, 172, 162, 0.2)',
                'color': '#9DBEBB'  # Light sage
            },
            'yaxis': {
                'gridcolor': 'rgba(119, 172, 162, 0.1)',
                'zerolinecolor': 'rgba(119, 172, 162, 0.2)',
                'color': '#9DBEBB'  # Light sage
            },
            'hovermode': 'closest',
            'showlegend': True,
            'legend': {
                'bgcolor': 'rgba(15, 46, 61, 0.8)',
                'bordercolor': 'rgba(119, 172, 162, 0.3)',
                'borderwidth': 1,
                'font': {'color': '#F4E8CD'}
            }
        }
    
    def generate_line_chart(self, column_name: str) -> Optional[Dict]:
        """Generate interactive line chart for numeric column."""
        if column_name not in self.df.columns:
            return None
        
        if self.column_types.get(column_name) != 'numeric':
            return None
        
        # Check for datetime column
        datetime_cols = [col for col, type_ in self.column_types.items() if type_ == 'datetime']
        
        if datetime_cols:
            x_col = datetime_cols[0]
            df_sorted = self.df.sort_values(x_col)
            x_data = df_sorted[x_col].astype(str).tolist()  # Convert datetime to string
            y_data = df_sorted[column_name].tolist()
        else:
            x_data = list(range(len(self.df)))  # Use index as list
            y_data = self.df[column_name].tolist()
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=x_data,
            y=y_data,
            mode='lines+markers',
            name=column_name,
            line=dict(color='#77ACA2', width=3),
            marker=dict(size=8, color='#4663B9', line=dict(width=2, color='#77ACA2')),
            hovertemplate='<b>%{y:.2f}</b><br>%{x}<extra></extra>'
        ))
        
        fig.update_layout(
            title=f'Trend Analysis: {column_name}',
            xaxis_title=datetime_cols[0] if datetime_cols else 'Index',
            yaxis_title=column_name,
            **self.layout_config
        )
        
        return fig.to_dict()
    
    def generate_bar_chart(self, column_name: str) -> Optional[Dict]:
        """Generate interactive bar chart for categorical column."""
        if column_name not in self.df.columns:
            return None
        
        if self.column_types.get(column_name) != 'categorical':
            return None
        
        value_counts = self.df[column_name].value_counts().head(10)
        
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=value_counts.index.tolist(),  # Convert to list
            y=value_counts.values.tolist(),  # Convert to list
            marker=dict(
                color='#77ACA2',
                line=dict(color='#4663B9', width=1.5)
            ),
            hovertemplate='<b>%{x}</b><br>Count: %{y}<extra></extra>'
        ))
        
        fig.update_layout(
            title=f'Distribution: {column_name}',
            xaxis_title=column_name,
            yaxis_title='Count',
            **self.layout_config
        )
        
        return fig.to_dict()
    
    def generate_histogram(self, column_name: str) -> Optional[Dict]:
        """Generate interactive histogram for numeric column."""
        if column_name not in self.df.columns:
            return None
        
        if self.column_types.get(column_name) != 'numeric':
            return None
        
        data = self.df[column_name].dropna().tolist()  # Convert to list
        mean_val = self.df[column_name].mean()
        median_val = self.df[column_name].median()
        
        fig = go.Figure()
        
        fig.add_trace(go.Histogram(
            x=data,
            nbinsx=30,
            name='Distribution',
            marker=dict(
                color='#77ACA2',
                line=dict(color='#4663B9', width=1)
            ),
            hovertemplate='Range: %{x}<br>Count: %{y}<extra></extra>'
        ))
        
        # Add mean line
        fig.add_vline(
            x=mean_val,
            line_dash="dash",
            line_color="#F4E8CD",
            annotation_text=f"Mean: {mean_val:.2f}",
            annotation_position="top"
        )
        
        # Add median line
        fig.add_vline(
            x=median_val,
            line_dash="dot",
            line_color="#9DBEBB",
            annotation_text=f"Median: {median_val:.2f}",
            annotation_position="bottom"
        )
        
        fig.update_layout(
            title=f'Distribution: {column_name}',
            xaxis_title=column_name,
            yaxis_title='Frequency',
            **self.layout_config
        )
        
        return fig.to_dict()
    
    def generate_scatter(self, x_col: str, y_col: str) -> Optional[Dict]:
        """Generate scatter plot for two numeric columns."""
        if x_col not in self.df.columns or y_col not in self.df.columns:
            return None
        
        if (self.column_types.get(x_col) != 'numeric' or 
            self.column_types.get(y_col) != 'numeric'):
            return None
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=self.df[x_col],
            y=self.df[y_col],
            mode='markers',
            marker=dict(
                size=10,
                color=self.df[y_col],
                colorscale='Viridis',
                showscale=True,
                line=dict(width=1, color='#00D9FF')
            ),
            hovertemplate=f'<b>{x_col}</b>: %{{x:.2f}}<br><b>{y_col}</b>: %{{y:.2f}}<extra></extra>'
        ))
        
        fig.update_layout(
            title=f'{x_col} vs {y_col}',
            xaxis_title=x_col,
            yaxis_title=y_col,
            **self.layout_config
        )
        
        return fig.to_dict()
    
    def generate_box_plot(self, column_name: str) -> Optional[Dict]:
        """Generate interactive box plot for numeric column."""
        if column_name not in self.df.columns:
            return None
        
        if self.column_types.get(column_name) != 'numeric':
            return None
        
        data = self.df[column_name].dropna().tolist()  # Convert to list
        
        fig = go.Figure()
        
        fig.add_trace(go.Box(
            y=data,
            name=column_name,
            marker=dict(color='#77ACA2'),
            line=dict(color='#4663B9'),
            boxmean='sd',
            hovertemplate='<b>%{y:.2f}</b><extra></extra>'
        ))
        
        fig.update_layout(
            title=f'Box Plot: {column_name}',
            yaxis_title=column_name,
            **self.layout_config
        )
        
        return fig.to_dict()
    
    def generate_pie_chart(self, column_name: str) -> Optional[Dict]:
        """Generate interactive pie chart for categorical column."""
        try:
            if column_name not in self.df.columns:
                return None
            
            if self.column_types.get(column_name) != 'categorical':
                return None
            
            value_counts = self.df[column_name].value_counts().head(10)
            
            # Custom color palette - teal/sage theme
            colors = ['#77ACA2', '#4663B9', '#9DBEBB', '#F4E8CD', '#5A8A7F',
                     '#6B8FB8', '#B3D4CF', '#E8DCC4', '#3D7269', '#3952A3']
            
            fig = go.Figure()
            
            fig.add_trace(go.Pie(
                labels=value_counts.index.tolist(),
                values=value_counts.values.tolist(),
                marker=dict(
                    colors=colors[:len(value_counts)],
                    line=dict(color='#031926', width=2)
                ),
                textinfo='label+percent',
                textfont=dict(color='#F4E8CD', size=12),
                hovertemplate='<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
            ))
            
            fig.update_layout(
                title=f'Proportion: {column_name}',
                **self.layout_config
            )
            
            return fig.to_dict()
        except Exception as e:
            print(f"Error generating pie chart: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
