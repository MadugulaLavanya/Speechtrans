import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os

PORT = 8000
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Load API Key from .env
api_key = os.environ.get("GROQ_API_KEY")
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not api_key and os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                if key == 'GROQ_API_KEY':
                    api_key = value
                    break

if not api_key:
    print("WARNING: GROQ_API_KEY not found in .env or environment variables!")

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/translate':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                if not api_key:
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b'Server Error: API Key not configured')
                    return

                # Send to Groq using server-side key
                req = urllib.request.Request(GROQ_URL, data=post_data, method='POST')
                req.add_header('Content-Type', 'application/json')
                req.add_header('Authorization', f'Bearer {api_key}')
                
                with urllib.request.urlopen(req) as response:
                    response_body = response.read()
                    self.send_response(response.status)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_body)
                    
            except urllib.error.HTTPError as e:
                # Forward API errors 
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                print(f"Proxy Error: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_error(404, "Not Found")

print(f"Starting VoiceStream Server on http://localhost:{PORT}")
# Allow address reuse to prevents "Address already in use" errors on restart
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
