import psycopg2
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/dashboard', methods=['GET'])
def get_npl2sql():
    try:
        # Load environment variables
        load_dotenv()

        # Access request headers
        headers = {
            'Application-Name': request.headers.get('Application-Name'),
            'Correlation-Id': request.headers.get('Correlation-Id'),
            'Status': request.headers.get('Status'),
            'From-Date': request.headers.get('From-Date'),
            'To-Date': request.headers.get('To-Date'),
            'Platform': request.headers.get('Platform'),
            'Search-Value': request.headers.get('Search-Value'),
            'Error': request.headers.get('Error'),
            'Payload-Search': request.headers.get('Payload-Search')
        }

        # Map headers to column names
        header_to_column = {
            'Application-Name': '"APPLICATION_NAME"',
            'Correlation-Id': '"CORRELATION_ID"',
            'Status': '"STATUS"',
            'From-Date': '"CREATE_DATE"',
            'To-Date': '"CREATE_DATE"',
            'Platform': '"PLATFORM"',
            'Search-Value': '"SEARCHVALUE"',
            'Error': '"ERROR_MESSAGE"',
            'Payload-Search': '"REQUEST_PAYLOAD"'  # Assuming you want to search in REQUEST_PAYLOAD
        }

        # Establish database connection
        conn = psycopg2.connect(
            database=os.getenv("DATABASE"),
            user=os.getenv("DB_USER"),
            password=os.getenv("PASSWORD"),
            host=os.getenv("HOST"),
            port=os.getenv("PORT")
        )
        cursor = conn.cursor()
        db_table_name = os.getenv("DB_TableName")

        # Construct the base query
        query = f"SELECT * FROM {db_table_name}"
        params = []

        # Add conditions based on headers
        conditions = []
        for header, value in headers.items():
            if value:
                column_name = header_to_column.get(header)
                if header == 'From-Date' and headers.get('To-Date'):
                    conditions.append(f"{column_name} BETWEEN %s AND %s")
                    params.append(headers['From-Date'])
                    params.append(headers['To-Date'])
                elif header not in ['From-Date', 'To-Date']:
                    conditions.append(f"{column_name} = %s")
                    params.append(value)

        # Add the conditions to the query
        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        # Print the query and parameters for debugging
        print("Executing query:", query)
        print("With parameters:", params)

        # Execute the query with parameters
        cursor.execute(query, tuple(params))
        value_from_table = cursor.fetchall()

        # Get column names from cursor description
        col_names = [desc[0] for desc in cursor.description]

        # Structure the result as a list of dictionaries
        result = [dict(zip(col_names, row)) for row in value_from_table]

        # Close the cursor and connection
        cursor.close()
        conn.close()

        return jsonify({'Answer': result})

    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message})

@app.route('/listapplicationlist', methods=['GET'])
def get_app_list():
    try:
        # Load environment variables
        load_dotenv()

         # Establish database connection
        conn = psycopg2.connect(
            database=os.getenv("DATABASE"),
            user=os.getenv("DB_USER"),
            password=os.getenv("PASSWORD"),
            host=os.getenv("HOST"),
            port=os.getenv("PORT")
        )
        cursor = conn.cursor()
        db_table_name = os.getenv("DB_TableName")

        # Construct the base query
        query = f"SELECT DISTINCT \"APPLICATION_NAME\" FROM {db_table_name}"

        cursor.execute(query)
        value_from_table = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'Answer': value_from_table})

    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message})
    
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8000)
