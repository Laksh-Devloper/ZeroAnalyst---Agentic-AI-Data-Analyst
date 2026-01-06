@app.route('/api/download-cleaned-data', methods=['POST'])
def download_cleaned_data():
    """
    Download the cleaned dataset as CSV.
    
    Expected JSON body:
        {
            "filepath": "path/to/uploaded/file.csv"
        }
    
    Returns:
        CSV file download
    """
    try:
        data = request.get_json()
        filepath = data.get('filepath')
        
        if not filepath:
            return jsonify({'error': 'Filepath is required'}), 400
        
        # Convert to absolute path if relative
        if not os.path.isabs(filepath):
            filepath = os.path.abspath(filepath)
            
        if not os.path.exists(filepath):
            return jsonify({'error': f'File not found: {filepath}'}), 400
        
        # Read file
        file_ext = filepath.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        
        # Clean data
        cleaner = DataCleaner(df)
        cleaned_df, cleaning_report = cleaner.clean()
        
        # Convert to CSV
        csv_data = cleaned_df.to_csv(index=False)
        
        # Create response with file download
        response = make_response(csv_data)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=cleaned_{os.path.basename(filepath)}'
        
        return response
    
    except Exception as e:
        import traceback
        print(f"Download cleaned data error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Error downloading cleaned data: {str(e)}'}), 500
