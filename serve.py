#!/usr/bin/env python3
import io
import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
DEFAULT_PORT = 8000

RELOAD_SCRIPT = """
<script>
(function() {
  if (!window.EventSource) return;
  const source = new EventSource('/livereload');
  source.addEventListener('message', function() {
    window.location.reload();
  });
  source.addEventListener('error', function() {
    console.log('Live reload connection lost. Reconnecting...');
  });
})();
</script>
"""

clients = []
clients_lock = threading.Lock()


def inject_reload_script(html_text):
    if '/livereload' in html_text:
        return html_text
    if '</body>' in html_text.lower():
        index = html_text.lower().rfind('</body>')
        return html_text[:index] + RELOAD_SCRIPT + html_text[index:]
    if '</html>' in html_text.lower():
        index = html_text.lower().rfind('</html>')
        return html_text[:index] + RELOAD_SCRIPT + html_text[index:]
    return html_text + RELOAD_SCRIPT


def notify_reload():
    with clients_lock:
        for handler in clients[:]:
            try:
                handler.wfile.write(b'data: reload\n\n')
                handler.wfile.flush()
            except Exception:
                try:
                    clients.remove(handler)
                except ValueError:
                    pass


def watch_files():
    mtimes = {}
    while True:
        changed = False
        current = {}
        for path in ROOT.rglob('*'):
            if path.is_file():
                try:
                    current[path] = path.stat().st_mtime
                except OSError:
                    continue
        if mtimes and current != mtimes:
            changed = True
        mtimes = current
        if changed:
            notify_reload()
        time.sleep(0.8)


class LiveReloadHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/livereload':
            self.handle_livereload()
            return

        if parsed.path in ('/', '/index.html') or parsed.path.endswith(('.html', '.htm')):
            self.serve_html(parsed.path)
            return

        super().do_GET()

    def serve_html(self, path):
        if path == '/':
            path = '/index.html'
        file_path = self.translate_path(path)
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, 'index.html')

        if not os.path.exists(file_path):
            self.send_error(404, 'File not found')
            return

        try:
            with open(file_path, 'rb') as f:
                raw = f.read()
        except OSError:
            self.send_error(404, 'File not found')
            return

        try:
            html = raw.decode('utf-8')
        except UnicodeDecodeError:
            html = raw.decode('latin-1')

        html = inject_reload_script(html)
        encoded = html.encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def handle_livereload(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'retry: 1000\n\n')
        self.wfile.flush()

        with clients_lock:
            clients.append(self)

        try:
            while True:
                time.sleep(10)
        except (ConnectionResetError, BrokenPipeError):
            pass
        finally:
            with clients_lock:
                if self in clients:
                    clients.remove(self)

    def log_message(self, format, *args):
        print(format % args)


def get_port():
    raw = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('PORT')
    if not raw:
        return DEFAULT_PORT
    try:
        return int(raw)
    except ValueError:
        raise SystemExit(f'Invalid port: {raw}')


def run_server():
    port = get_port()
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, LiveReloadHandler)
    print(f'Serving on http://127.0.0.1:{port}')
    print('Live reload enabled. Edit files in the workspace to refresh the browser automatically.')
    watch_thread = threading.Thread(target=watch_files, daemon=True)
    watch_thread.start()
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
