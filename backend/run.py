from app import create_app
import logging
from werkzeug.serving import run_simple

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = create_app()

if __name__ == '__main__':
    PORT = 8080
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