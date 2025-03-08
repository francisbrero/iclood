import os
import click
from main import create_app
from werkzeug.serving import WSGIRequestHandler

# Configure request handler to be more resilient
class CustomRequestHandler(WSGIRequestHandler):
    def handle_error(self, request, client_address):
        # Ignore connection reset errors
        import sys
        type, value, traceback = sys.exc_info()
        if isinstance(value, (ConnectionResetError, BrokenPipeError)):
            return
        super().handle_error(request, client_address)

def create_cli_app():
    return create_app()

@click.group()
def cli():
    """Management script for the iClood application."""
    pass

@cli.command('run')
@click.option('--host', default='0.0.0.0', help='The interface to bind to.')
@click.option('--port', default=5001, help='The port to bind to.')
def run(host, port):
    """Run the Flask development server"""
    app = create_cli_app()
    # Configure the server for better network handling
    app.config.update(
        PROPAGATE_EXCEPTIONS=True,
        PRESERVE_CONTEXT_ON_EXCEPTION=True
    )
    app.run(
        host=host,
        port=port,
        threaded=True,
        request_handler=CustomRequestHandler
    )

if __name__ == '__main__':
    cli() 