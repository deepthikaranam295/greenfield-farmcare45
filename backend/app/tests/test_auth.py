def test_register(client):
    resp = client.post("/api/auth/register", json={
        "name": "Alice", "email": "alice@test.com", "password": "secret123", "role": "customer",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["data"]["email"] == "alice@test.com"


def test_register_duplicate(client):
    client.post("/api/auth/register", json={"name": "Bob", "email": "bob@test.com", "password": "secret123", "role": "customer"})
    resp = client.post("/api/auth/register", json={"name": "Bob", "email": "bob@test.com", "password": "secret123", "role": "customer"})
    assert resp.status_code == 409


def test_login_success(client):
    client.post("/api/auth/register", json={"name": "Carol", "email": "carol@test.com", "password": "pass123", "role": "customer"})
    resp = client.post("/api/auth/login", json={"email": "carol@test.com", "password": "pass123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()["data"]


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={"name": "Dave", "email": "dave@test.com", "password": "pass123", "role": "customer"})
    resp = client.post("/api/auth/login", json={"email": "dave@test.com", "password": "wrong"})
    assert resp.status_code == 401


def test_logout(client, auth_headers):
    resp = client.post("/api/auth/logout", headers=auth_headers)
    assert resp.status_code == 200


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
