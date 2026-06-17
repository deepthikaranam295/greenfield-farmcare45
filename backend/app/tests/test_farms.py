import uuid


def _create_customer(client):
    uid = str(uuid.uuid4())[:8]
    client.post("/api/auth/register", json={
        "name": f"Customer {uid}", "email": f"cust{uid}@test.com",
        "password": "pass123", "role": "customer",
    })
    resp = client.post("/api/auth/login", json={"email": f"cust{uid}@test.com", "password": "pass123"})
    token = resp.json()["data"]["access_token"]
    user_id = resp.json()["data"]["user"]["id"]
    return token, user_id


def test_create_farm(client, auth_headers):
    _, cust_id = _create_customer(client)
    resp = client.post("/api/farms", json={
        "customer_id": cust_id, "name": "Test Farm", "district": "Anantapur", "size_acres": 10.0,
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "Test Farm"


def test_list_farms(client, auth_headers):
    resp = client.get("/api/farms", headers=auth_headers)
    assert resp.status_code == 200
    assert "data" in resp.json()


def test_get_farm_not_found(client, auth_headers):
    resp = client.get(f"/api/farms/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


def test_customer_cannot_create_farm(client):
    token, cust_id = _create_customer(client)
    resp = client.post("/api/farms", json={
        "customer_id": cust_id, "name": "Unauthorized Farm",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403
