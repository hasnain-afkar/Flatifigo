"""
Flatifigo — pytest test suite
Run with:  pytest tests/ -v
"""

import os
import tempfile
import pytest

# Use a temporary database so tests never touch the real one
_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DEBUG"] = "false"

import server  # noqa: E402 — must come after env vars are set


# ── Fixtures ─────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def init_database():
    """Initialise the test database once for the entire session."""
    server.init_db()
    yield
    os.close(_db_fd)
    os.unlink(_db_path)


@pytest.fixture()
def client():
    server.app.config["TESTING"] = True
    with server.app.test_client() as c:
        yield c


@pytest.fixture()
def auth_headers(client):
    """Register a fresh owner user per test and return auth headers."""
    email = f"owner_{os.urandom(4).hex()}@test.com"
    resp = client.post("/api/register", json={
        "fullName": "Test Owner",
        "email": email,
        "password": "password123",
        "confirmPassword": "password123",
        "role": "owner",
    })
    assert resp.json.get("success"), f"Register failed: {resp.json}"
    token = resp.json["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def student_headers(client):
    """Register a student user and return auth headers."""
    resp = client.post("/api/register", json={
        "fullName": "Test Student",
        "email": f"student_{os.urandom(4).hex()}@test.com",
        "password": "password123",
        "confirmPassword": "password123",
        "role": "student",
    })
    token = resp.json["token"]
    return {"Authorization": f"Bearer {token}"}


# ── Health Check ─────────────────────────────────────────────────

class TestHealth:
    def test_health_returns_ok(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json["status"] == "ok"
        assert r.json["service"] == "flatifigo"


# ── Authentication ────────────────────────────────────────────────

class TestAuth:
    def test_register_success(self, client):
        r = client.post("/api/register", json={
            "fullName": "Alice",
            "email": f"alice_{os.urandom(4).hex()}@example.com",
            "password": "secret1",
            "confirmPassword": "secret1",
            "role": "student",
        })
        assert r.status_code == 200
        assert r.json["success"] is True
        assert "token" in r.json
        assert r.json["user"]["role"] == "student"

    def test_register_missing_fields(self, client):
        r = client.post("/api/register", json={"email": "x@y.com"})
        assert r.status_code == 400
        assert r.json["success"] is False

    def test_register_short_name(self, client):
        r = client.post("/api/register", json={
            "fullName": "A",
            "email": "a@b.com",
            "password": "pass123",
            "confirmPassword": "pass123",
            "role": "student",
        })
        assert r.status_code == 400

    def test_register_password_mismatch(self, client):
        r = client.post("/api/register", json={
            "fullName": "Bob",
            "email": "bob@example.com",
            "password": "pass1",
            "confirmPassword": "pass2",
            "role": "student",
        })
        assert r.status_code == 400

    def test_register_duplicate_email(self, client):
        email = f"dup_{os.urandom(4).hex()}@example.com"
        payload = {
            "fullName": "Carol",
            "email": email,
            "password": "password1",
            "confirmPassword": "password1",
            "role": "student",
        }
        client.post("/api/register", json=payload)
        r = client.post("/api/register", json=payload)
        assert r.status_code == 409

    def test_login_success(self, client):
        email = f"login_{os.urandom(4).hex()}@example.com"
        client.post("/api/register", json={
            "fullName": "Dave", "email": email,
            "password": "pass123", "confirmPassword": "pass123", "role": "student",
        })
        r = client.post("/api/login", json={"email": email, "password": "pass123"})
        assert r.status_code == 200
        assert r.json["success"] is True
        assert "token" in r.json

    def test_login_wrong_password(self, client):
        email = f"wrongpw_{os.urandom(4).hex()}@example.com"
        client.post("/api/register", json={
            "fullName": "Eve", "email": email,
            "password": "correct", "confirmPassword": "correct", "role": "student",
        })
        r = client.post("/api/login", json={"email": email, "password": "wrong"})
        assert r.status_code == 401
        assert r.json["success"] is False

    def test_login_unknown_email(self, client):
        r = client.post("/api/login", json={
            "email": "nobody@example.com", "password": "anything"
        })
        assert r.status_code == 401

    def test_session_valid_jwt(self, client, auth_headers):
        r = client.get("/api/session", headers=auth_headers)
        assert r.json["loggedIn"] is True
        assert r.json["user"]["role"] == "owner"

    def test_session_no_token(self, client):
        r = client.get("/api/session")
        assert r.json["loggedIn"] is False

    def test_session_bad_token(self, client):
        r = client.get("/api/session", headers={"Authorization": "Bearer bad.token.here"})
        assert r.json["loggedIn"] is False

    def test_logout(self, client, auth_headers):
        r = client.post("/api/logout", headers=auth_headers)
        assert r.json["success"] is True


# ── Profile ───────────────────────────────────────────────────────

class TestProfile:
    def test_get_profile_authenticated(self, client, auth_headers):
        r = client.get("/api/profile", headers=auth_headers)
        assert r.status_code == 200
        assert r.json["success"] is True

    def test_get_profile_unauthenticated(self, client):
        r = client.get("/api/profile")
        assert r.status_code == 401

    def test_update_profile(self, client, auth_headers):
        r = client.put("/api/profile", headers=auth_headers, json={
            "occupation": "Engineer",
            "bio": "Looking for a flat",
            "budgetMin": 5000,
            "budgetMax": 15000,
            "preferredCity": "islamabad",
        })
        assert r.status_code == 200
        assert r.json["success"] is True


# ── Listings ──────────────────────────────────────────────────────

LISTING_PAYLOAD = {
    "title": "Test Flat",
    "description": "A nice test flat near the university",
    "rent": 12000,
    "city": "islamabad",
    "area": "G-11",
    "rooms": 2,
    "amenities": ["wifi", "parking"],
    "images": [],
    "contactName": "Test Owner",
    "contactPhone": "0300-1234567",
}


class TestListings:
    def test_get_listings_public(self, client):
        r = client.get("/api/listings")
        assert r.status_code == 200
        assert r.json["success"] is True
        assert isinstance(r.json["listings"], list)

    def test_get_listings_filter_city(self, client):
        r = client.get("/api/listings?city=islamabad")
        assert r.status_code == 200
        for listing in r.json["listings"]:
            assert listing["city"] == "islamabad"

    def test_create_listing_authenticated(self, client, auth_headers):
        r = client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        assert r.status_code == 200
        assert r.json["success"] is True
        assert "id" in r.json

    def test_create_listing_unauthenticated(self, client):
        r = client.post("/api/listings", json=LISTING_PAYLOAD)
        assert r.status_code == 401

    def test_create_listing_missing_fields(self, client, auth_headers):
        r = client.post("/api/listings", json={"title": "Incomplete"}, headers=auth_headers)
        assert r.status_code == 400

    def test_get_listing_by_id(self, client, auth_headers):
        create_r = client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        lid = create_r.json["id"]
        r = client.get(f"/api/listings/{lid}")
        assert r.status_code == 200
        assert r.json["listing"]["id"] == lid

    def test_get_listing_not_found(self, client):
        r = client.get("/api/listings/nonexistent-id")
        assert r.status_code == 404

    def test_update_listing(self, client, auth_headers):
        create_r = client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        lid = create_r.json["id"]
        updated = {**LISTING_PAYLOAD, "title": "Updated Title", "rent": 15000}
        r = client.put(f"/api/listings/{lid}", json=updated, headers=auth_headers)
        assert r.status_code == 200
        assert r.json["success"] is True

    def test_update_listing_wrong_owner(self, client, auth_headers, student_headers):
        create_r = client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        lid = create_r.json["id"]
        r = client.put(f"/api/listings/{lid}", json=LISTING_PAYLOAD, headers=student_headers)
        assert r.status_code == 404  # not found for this user

    def test_delete_listing(self, client, auth_headers):
        create_r = client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        lid = create_r.json["id"]
        r = client.delete(f"/api/listings/{lid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json["success"] is True
        # Confirm it's gone
        r2 = client.get(f"/api/listings/{lid}")
        assert r2.status_code == 404

    def test_delete_listing_unauthenticated(self, client, auth_headers):
        create_r = client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        lid = create_r.json["id"]
        r = client.delete(f"/api/listings/{lid}")
        assert r.status_code == 401

    def test_my_listings(self, client, auth_headers):
        client.post("/api/listings", json=LISTING_PAYLOAD, headers=auth_headers)
        r = client.get("/api/my-listings", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json["listings"], list)
        assert len(r.json["listings"]) >= 1

    def test_my_listings_unauthenticated(self, client):
        r = client.get("/api/my-listings")
        assert r.status_code == 401


# ── Roommates ─────────────────────────────────────────────────────

class TestRoommates:
    def test_get_roommates_public(self, client):
        r = client.get("/api/roommates")
        assert r.status_code == 200
        assert r.json["success"] is True
        assert isinstance(r.json["roommates"], list)
