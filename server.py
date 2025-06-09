from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

port = 8000
print(f"Starting server on port {port}...")
print(f"Open http://localhost:{port} in your browser")
httpd = HTTPServer(('localhost', port), CORSRequestHandler)
httpd.serve_forever() 