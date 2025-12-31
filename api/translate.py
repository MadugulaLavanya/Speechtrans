from http.server import BaseHTTPRequestHandler
import urllib.request
import urllib.error
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Read environment variable
        api_key = os.environ.get("GROQ_API_KEY")
        
        if not api_key:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'Server Error: API Key not configured in Vercel Environment Variables')
            return

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
            
            # Send to Groq
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
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
