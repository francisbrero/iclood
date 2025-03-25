from app import create_app
import logging
from werkzeug.serving import run_simple
import argparse

# Set up logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

def parse_args():
    parser = argparse.ArgumentParser(description='Run the server')
    parser.add_argument('-p', '--port', type=int, default=8080,
                      help='Port to run the server on (default: 8080)')
    return parser.parse_args()

app = create_app()

if __name__ == '__main__':
    args = parse_args()
    PORT = args.port
    logger.info(f"Starting server on 0.0.0.0:{PORT}...")
    try:
        # Use Werkzeug's run_simple instead of app.run
        run_simple(
            '0.0.0.0',
            PORT,
            app,
            use_reloader=False,
            use_debugger=False,
            threaded=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}") 