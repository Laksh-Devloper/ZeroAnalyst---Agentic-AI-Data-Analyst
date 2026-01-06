from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
import base64
from datetime import datetime


class PDFReportGenerator:
    """Generate PDF reports from analysis results."""
    
    def __init__(self, filename: str):
        self.buffer = BytesIO()
        self.doc = SimpleDocTemplate(self.buffer, pagesize=letter,
                                     rightMargin=72, leftMargin=72,
                                     topMargin=72, bottomMargin=18)
        self.styles = getSampleStyleSheet()
        self.story = []
        self.filename = filename
        
        # Custom styles
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#00D9FF'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#00D9FF'),
            spaceAfter=12,
            spaceBefore=12
        )
    
    def add_title(self):
        """Add report title."""
        title = Paragraph("📊 InsightFlow Analysis Report", self.title_style)
        self.story.append(title)
        
        # Add metadata
        meta_style = ParagraphStyle('Meta', parent=self.styles['Normal'],
                                    fontSize=10, textColor=colors.grey,
                                    alignment=TA_CENTER)
        meta = Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>File: {self.filename}",
                        meta_style)
        self.story.append(meta)
        self.story.append(Spacer(1, 0.3*inch))
    
    def add_cleaning_report(self, cleaning_report: dict):
        """Add data cleaning summary."""
        self.story.append(Paragraph("🧹 Data Cleaning Summary", self.heading_style))
        
        data = [
            ['Metric', 'Value'],
            ['Original Rows', str(cleaning_report['original_rows'])],
            ['Original Columns', str(cleaning_report['original_cols'])],
            ['Cleaned Rows', str(cleaning_report['cleaned_rows'])],
            ['Cleaned Columns', str(cleaning_report['cleaned_cols'])],
        ]
        
        table = Table(data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00D9FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        self.story.append(table)
        
        # Add cleaning actions
        if cleaning_report.get('actions'):
            self.story.append(Spacer(1, 0.2*inch))
            self.story.append(Paragraph("Actions Taken:", self.styles['Heading3']))
            for action in cleaning_report['actions']:
                bullet = Paragraph(f"• {action}", self.styles['Normal'])
                self.story.append(bullet)
        
        self.story.append(Spacer(1, 0.3*inch))
    
    def add_statistics(self, stats: dict):
        """Add statistics summary."""
        self.story.append(Paragraph("📊 Statistical Summary", self.heading_style))
        
        overview = stats['overview']
        data = [
            ['Metric', 'Value'],
            ['Total Rows', f"{overview['total_rows']:,}"],
            ['Total Columns', str(overview['total_columns'])],
            ['Numeric Columns', str(overview['numeric_columns'])],
            ['Categorical Columns', str(overview['categorical_columns'])],
        ]
        
        table = Table(data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#C0FF00')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        self.story.append(table)
        self.story.append(Spacer(1, 0.3*inch))
    
    def add_charts(self, charts: dict):
        """Add charts to the report."""
        self.story.append(Paragraph("📈 Visualizations", self.heading_style))
        
        chart_titles = {
            'bar': 'Category Distribution',
            'line': 'Trend Analysis',
            'pie': 'Proportion Breakdown'
        }
        
        for chart_type, chart_data in charts.items():
            if chart_data:
                # Remove base64 prefix
                img_data = chart_data.split(',')[1]
                img_buffer = BytesIO(base64.b64decode(img_data))
                
                # Add chart title
                title = Paragraph(chart_titles.get(chart_type, chart_type.title()),
                                self.styles['Heading3'])
                self.story.append(title)
                
                # Add image
                img = Image(img_buffer, width=5*inch, height=3*inch)
                self.story.append(img)
                self.story.append(Spacer(1, 0.2*inch))
        
        self.story.append(PageBreak())
    
    def add_insights(self, insights: list):
        """Add insights to the report."""
        self.story.append(Paragraph("💡 Key Insights", self.heading_style))
        
        for i, insight in enumerate(insights, 1):
            # Clean emoji from insight text for PDF
            clean_insight = insight.replace('📈', '').replace('📊', '').replace('🎯', '')
            clean_insight = clean_insight.replace('🔗', '').replace('⚠️', '').replace('✅', '')
            
            bullet = Paragraph(f"{i}. {clean_insight.strip()}", self.styles['Normal'])
            self.story.append(bullet)
            self.story.append(Spacer(1, 0.1*inch))
        
        self.story.append(Spacer(1, 0.3*inch))
    
    def add_footer(self):
        """Add footer."""
        footer_style = ParagraphStyle('Footer', parent=self.styles['Normal'],
                                     fontSize=8, textColor=colors.grey,
                                     alignment=TA_CENTER)
        footer = Paragraph("Generated by InsightFlow - Transform Data into Wisdom", footer_style)
        self.story.append(Spacer(1, 0.5*inch))
        self.story.append(footer)
    
    def generate(self, analysis_results: dict) -> bytes:
        """Generate the complete PDF report."""
        self.add_title()
        self.add_cleaning_report(analysis_results['cleaning_report'])
        self.add_statistics(analysis_results['statistics'])
        self.add_charts(analysis_results['charts'])
        self.add_insights(analysis_results['insights'])
        self.add_footer()
        
        # Build PDF
        self.doc.build(self.story)
        
        # Get PDF data
        pdf_data = self.buffer.getvalue()
        self.buffer.close()
        
        return pdf_data
