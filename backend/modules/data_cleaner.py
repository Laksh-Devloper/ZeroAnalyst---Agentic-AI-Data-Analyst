import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple


class DataCleaner:
    """Handles data cleaning operations for uploaded datasets."""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.original_shape = df.shape
        self.cleaning_report = []
    
    def clean(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Perform comprehensive data cleaning.
        
        Returns:
            Tuple of (cleaned_dataframe, cleaning_report)
        """
        self._remove_duplicates()
        self._handle_missing_values()
        self._detect_column_types()
        
        report = {
            'original_rows': self.original_shape[0],
            'original_cols': self.original_shape[1],
            'cleaned_rows': self.df.shape[0],
            'cleaned_cols': self.df.shape[1],
            'actions': self.cleaning_report,
            'column_types': self.column_types
        }
        
        return self.df, report
    
    def _remove_duplicates(self):
        """Remove duplicate rows."""
        before = len(self.df)
        self.df = self.df.drop_duplicates()
        after = len(self.df)
        
        if before > after:
            removed = before - after
            self.cleaning_report.append(f"Removed {removed} duplicate row(s)")
    
    def _handle_missing_values(self):
        """Handle missing values intelligently based on column type."""
        for col in self.df.columns:
            missing_count = self.df[col].isna().sum()
            
            if missing_count == 0:
                continue
            
            missing_pct = (missing_count / len(self.df)) * 100
            
            # If more than 50% missing, drop the column
            if missing_pct > 50:
                self.df = self.df.drop(columns=[col])
                self.cleaning_report.append(
                    f"Dropped column '{col}' ({missing_pct:.1f}% missing)"
                )
                continue
            
            # Handle based on data type
            if pd.api.types.is_numeric_dtype(self.df[col]):
                # Fill numeric with median
                median_val = self.df[col].median()
                self.df[col] = self.df[col].fillna(median_val)
                self.cleaning_report.append(
                    f"Filled {missing_count} missing values in '{col}' with median ({median_val:.2f})"
                )
            else:
                # Fill categorical with mode or 'Unknown'
                if self.df[col].mode().empty:
                    self.df[col] = self.df[col].fillna('Unknown')
                    self.cleaning_report.append(
                        f"Filled {missing_count} missing values in '{col}' with 'Unknown'"
                    )
                else:
                    mode_val = self.df[col].mode()[0]
                    self.df[col] = self.df[col].fillna(mode_val)
                    self.cleaning_report.append(
                        f"Filled {missing_count} missing values in '{col}' with mode ('{mode_val}')"
                    )
    
    def _detect_column_types(self):
        """Detect and categorize column types."""
        self.column_types = {}
        
        for col in self.df.columns:
            if pd.api.types.is_numeric_dtype(self.df[col]):
                self.column_types[col] = 'numeric'
            elif pd.api.types.is_datetime64_any_dtype(self.df[col]):
                self.column_types[col] = 'datetime'
            else:
                # Try to convert to datetime
                try:
                    pd.to_datetime(self.df[col], errors='raise')
                    self.df[col] = pd.to_datetime(self.df[col])
                    self.column_types[col] = 'datetime'
                except:
                    self.column_types[col] = 'categorical'
    
    def get_preview(self, rows: int = 10) -> Dict[str, Any]:
        """Get a preview of the cleaned data."""
        return {
            'columns': list(self.df.columns),
            'data': self.df.head(rows).to_dict(orient='records'),
            'shape': self.df.shape,
            'column_types': self.column_types
        }
