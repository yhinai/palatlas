from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
import sys

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, origins=["*"])

# Basic health check endpoint (always works)
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Palatlas API - Hybrid Test'})

@app.route('/api', methods=['GET'])
def api_root():
    return jsonify({
        'message': 'Palatlas API is running - Hybrid Test',
        'version': '1.0.0',
        'endpoints': [
            '/api/health',
            '/api/visualizations',
            '/api/chatgpt-analysis',
            '/api/chat-response'
        ]
    })

@app.route('/test', methods=['GET'])
def test_frontend():
    """Serve the frontend test page"""
    return send_from_directory('.', 'test_frontend.html')

# Serve React app for all other routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    print(f"🌐 Serving request for path: '{path}'")
    print(f"📁 Static folder: {app.static_folder}")
    print(f"📁 Static folder exists: {os.path.exists(app.static_folder)}")
    
    if os.path.exists(app.static_folder):
        static_files = os.listdir(app.static_folder)
        print(f"📄 Static files available: {static_files}")
    
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        print(f"✅ Serving static file: {path}")
        return send_from_directory(app.static_folder, path)
    else:
        print(f"📄 Serving index.html for path: {path}")
        return send_from_directory(app.static_folder, 'index.html')

# Try to import and add complex endpoints
try:
    print("🔍 Testing visualizations import...")
    from visualizations import QlooVisualizer
    print("✅ QlooVisualizer imported successfully")
    
    @app.route('/api/visualizations', methods=['POST'])
    def generate_visualizations():
        # Generate unique request ID for tracking
        request_id = str(uuid.uuid4())[:8]
        
        try:
            data = request.get_json()
            city = data.get('city')
            country = data.get('country')
            limit = data.get('limit', 20)
            print(f"[{request_id}] 🔍 NEW REQUEST - City: {city}, Country: {country}, Limit: {limit}")
            
            # Create a FRESH instance for each request to prevent caching issues
            visualizer = QlooVisualizer()
            print(f"[{request_id}] ✅ Created fresh QlooVisualizer instance")
            
            # Fetch Qloo API data ONCE
            print(f"[{request_id}] 📡 Fetching brands data for {city}, {country}...")
            from qloo_analysis import get_brands
            raw_brands = get_brands(city, country, limit)
            
            # Debug: Check brands data content
            if raw_brands and 'results' in raw_brands and 'entities' in raw_brands['results']:
                brand_names = [brand.get('name', 'Unknown') for brand in raw_brands['results']['entities'][:3]]
                print(f"[{request_id}] 📊 Brands data received: {len(raw_brands['results']['entities'])} brands")
                print(f"[{request_id}] 📊 First 3 brands: {brand_names}")
            else:
                print(f"[{request_id}] ⚠️ No valid brands data received")
            
            print(f"[{request_id}] 📡 Fetching places data for {city}, {country}...")
            from qloo_analysis import get_places
            raw_places = get_places(city, country, limit)
            
            # Debug: Check places data content
            if raw_places and 'results' in raw_places and 'entities' in raw_places['results']:
                place_names = [place.get('name', 'Unknown') for place in raw_places['results']['entities'][:3]]
                print(f"[{request_id}] 🏢 Places data received: {len(raw_places['results']['entities'])} places")
                print(f"[{request_id}] 🏢 First 3 places: {place_names}")
            else:
                print(f"[{request_id}] ⚠️ No valid places data received")
            
            # Set the pre-fetched data in the visualizer
            print(f"[{request_id}] 🔄 Setting data in visualizer...")
            visualizer.set_data(raw_brands, raw_places)
            
            # Now generate all visualizations using the pre-fetched data
            print(f"[{request_id}] 🎨 Generating visualizations...")
            viz_data = visualizer.generate_all_visualizations(city, country, limit)
            print(f"[{request_id}] ✅ Generated visualizations for {city}, {country}")
            
            # Debug: Check what visualizations were generated
            viz_keys = list(viz_data.keys()) if viz_data else []
            print(f"[{request_id}] 📈 Generated visualizations: {viz_keys}")
            
            return jsonify(viz_data)
        except Exception as e:
            print(f"[{request_id}] ❌ Exception: {e}")
            return jsonify({'error': str(e)}), 500
    
    print("✅ Visualizations endpoint added successfully")
    
except Exception as e:
    print(f"❌ Failed to import visualizations: {e}")
    print("⚠️ Visualizations endpoint not available")

try:
    print("🤖 Testing chatgpt_analysis import...")
    from chatgpt_analysis import analyze_business_environment, get_chat_response
    print("✅ chatgpt_analysis imported successfully")
    
    @app.route('/api/chatgpt-analysis', methods=['POST'])
    def chatgpt_analysis():
        """Generate ChatGPT analysis of business environment"""
        request_id = str(uuid.uuid4())[:8]
        
        try:
            data = request.get_json()
            city = data.get('city')
            country = data.get('country')
            limit = data.get('limit', 30)
            
            print(f"[{request_id}] 🤖 ChatGPT Analysis Request - City: {city}, Country: {country}, Limit: {limit}")
            
            # Generate business environment analysis
            print(f"[{request_id}] 🔄 Calling analyze_business_environment...")
            result = analyze_business_environment(city, country, limit)
            
            print(f"[{request_id}] 📊 Analysis result: {result}")
            
            if result.get("error"):
                print(f"[{request_id}] ❌ ChatGPT Analysis Error: {result['error']}")
                return jsonify({'error': result['error']}), 500
            
            print(f"[{request_id}] ✅ ChatGPT Analysis completed successfully")
            return jsonify(result)
            
        except Exception as e:
            print(f"[{request_id}] 💥 ChatGPT Analysis Exception: {e}")
            import traceback
            print(f"[{request_id}] 💥 Full traceback: {traceback.format_exc()}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/chat-response', methods=['POST'])
    def chat_response():
        """Get chat response from ChatGPT about business environment"""
        request_id = str(uuid.uuid4())[:8]
        
        try:
            data = request.get_json()
            city = data.get('city')
            country = data.get('country')
            message = data.get('message')
            
            if not message:
                return jsonify({'error': 'Message is required'}), 400
            
            print(f"[{request_id}] 💬 Chat Request - City: {city}, Country: {country}, Message: {message[:50]}...")
            
            # Get chat response
            result = get_chat_response(message, city, country)
            
            if result.get("error"):
                print(f"[{request_id}] ❌ Chat Response Error: {result['error']}")
                return jsonify({'error': result['error']}), 500
            
            print(f"[{request_id}] ✅ Chat Response generated successfully")
            return jsonify(result)
            
        except Exception as e:
            print(f"[{request_id}] ❌ Chat Response Exception: {e}")
            return jsonify({'error': str(e)}), 500
    
    print("✅ ChatGPT analysis endpoints added successfully")
    
except Exception as e:
    print(f"❌ Failed to import chatgpt_analysis: {e}")
    print("⚠️ ChatGPT analysis endpoints not available")

print("🎉 Hybrid app setup complete!")

if __name__ == '__main__':
    try:
        # Get port from environment variable or default to 5000
        port = int(os.environ.get('PORT', 5000))
        print(f"🚀 Starting Hybrid Palatlas Flask app on port {port}")
        print(f"🌐 Binding to 0.0.0.0:{port}")
        print(f"📁 Static folder: {app.static_folder}")
        print(f"🔧 Debug mode: {app.debug}")
        print(f"🏥 Health check endpoint: /api/health")
        
        # Check if static folder exists
        if not os.path.exists(app.static_folder):
            print(f"⚠️ Warning: Static folder {app.static_folder} does not exist!")
        else:
            print(f"✅ Static folder {app.static_folder} exists")
            static_files = os.listdir(app.static_folder)
            print(f"📄 Static files: {static_files[:5]}...")  # Show first 5 files
        
        # Check environment variables
        print(f"🔑 Environment check:")
        print(f"   QLOO_API_KEY: {'✅ Set' if os.environ.get('QLOO_API_KEY') else '❌ Missing'}")
        print(f"   OPENAI_API_KEY: {'✅ Set' if os.environ.get('OPENAI_API_KEY') else '❌ Missing'}")
        print(f"   MAPBOX_ACCESS_TOKEN: {'✅ Set' if os.environ.get('MAPBOX_ACCESS_TOKEN') else '❌ Missing'}")
        
        # Use 0.0.0.0 to bind to all available network interfaces
        print(f"🌐 Starting Flask server...")
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except Exception as e:
        print(f"❌ Failed to start Flask app: {e}")
        import traceback
        print(f"💥 Full traceback: {traceback.format_exc()}")
        sys.exit(1) 