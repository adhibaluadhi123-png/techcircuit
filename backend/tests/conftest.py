"""Pytest configuration and test database fixtures."""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.seed.synthetic_brand import seed_database, WORKSPACE_ID
from app.db.models import Workspace, User, Rulebook, Rule, Fact

TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    """In-memory SQLite database session for fast, isolated test execution."""
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()

    # Seed test database with synthetic brand data
    seed_database(session)

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)
