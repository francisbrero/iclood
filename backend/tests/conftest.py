import os
import pytest
from app import create_app, db
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

def get_test_db_url():
    """Get test database URL from environment or use default"""
    return os.environ.get(
        'TEST_DATABASE_URL',
        'postgresql://iclooduser:iclood123@localhost:5432/iclood_test'
    )

def get_superuser_db_url():
    """Get superuser database URL for schema setup"""
    return os.environ.get(
        'SUPERUSER_DATABASE_URL',
        'postgresql://postgres@localhost:5432/iclood_test'
    )

def pytest_configure(config):
    """Register database marker"""
    config.addinivalue_line(
        "markers",
        "db: mark test as requiring database access"
    )

def setup_db_schema():
    """Set up database schema with proper permissions using superuser"""
    engine = create_engine(get_superuser_db_url())
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO iclooduser"))
        conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO iclooduser"))
        conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO iclooduser"))
        conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO iclooduser"))
        conn.commit()

@pytest.fixture(scope="session", autouse=True)
def check_db_connection(request):
    """Check database connection before running tests"""
    # Set up schema with superuser
    try:
        setup_db_schema()
    except (OperationalError, ProgrammingError) as e:
        pytest.skip(f"Database schema setup failed: {str(e)}")
        return

    # Now test connection as iclooduser
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': get_test_db_url()
    })
    
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                conn.execute(text("SELECT 1")).scalar()
        except (OperationalError, ProgrammingError) as e:
            pytest.skip(f"Database connection failed: {str(e)}")
            return
        
        yield

@pytest.fixture(scope='session')
def app():
    """Create a Flask application configured with PostgreSQL for tests"""
    upload_dir = '/tmp/iclood_test_uploads'
    os.makedirs(upload_dir, exist_ok=True)
    
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': get_test_db_url(),
        'UPLOAD_FOLDER': upload_dir
    })
    
    # Create tables
    with app.app_context():
        # Set up schema and create tables
        setup_db_schema()
        db.create_all()
        yield app
        
        # Cleanup after tests
        setup_db_schema()  # Reset schema to clean state
    
    # Cleanup upload directory
    if os.path.exists(upload_dir):
        for root, dirs, files in os.walk(upload_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(upload_dir)

@pytest.fixture
def client(app):
    """Test client that uses PostgreSQL"""
    return app.test_client() 