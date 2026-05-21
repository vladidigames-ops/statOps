import pytest


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["app"] == "statOps"


@pytest.mark.asyncio
async def test_health_liveness(client):
    response = await client.get("/api/v1/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_readiness(client):
    response = await client.get("/api/v1/readyz")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


@pytest.mark.asyncio
async def test_register_login_me_flow(client):
    register_payload = {
        "email": "owner@example.com",
        "password": "supersecret123",
        "full_name": "Owner Test",
        "account_name": "Test Restaurant",
    }
    response = await client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201, response.text
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@example.com", "password": "supersecret123"},
    )
    assert login_response.status_code == 200
    login_tokens = login_response.json()

    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {login_tokens['access_token']}"},
    )
    assert me_response.status_code == 200
    me = me_response.json()
    assert me["email"] == "owner@example.com"
    assert me["role"] == "owner"
    assert me["account_name"] == "Test Restaurant"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {
        "email": "dup@example.com",
        "password": "supersecret123",
        "account_name": "Acc",
    }
    first = await client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    second = await client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


@pytest.mark.asyncio
async def test_establishment_crud_isolates_tenants(client):
    user_a = await _register(client, "a@example.com", "Account A")
    user_b = await _register(client, "b@example.com", "Account B")

    create = await client.post(
        "/api/v1/establishments",
        json={"name": "Cafe A", "type": "cafe"},
        headers=_auth(user_a),
    )
    assert create.status_code == 201
    establishment_id = create.json()["id"]

    list_a = await client.get("/api/v1/establishments", headers=_auth(user_a))
    assert list_a.status_code == 200
    assert len(list_a.json()) == 1

    list_b = await client.get("/api/v1/establishments", headers=_auth(user_b))
    assert list_b.status_code == 200
    assert list_b.json() == []

    get_from_b = await client.get(
        f"/api/v1/establishments/{establishment_id}", headers=_auth(user_b)
    )
    assert get_from_b.status_code == 404


async def _register(client, email: str, account_name: str) -> dict:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "supersecret123",
            "account_name": account_name,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def _auth(tokens: dict) -> dict:
    return {"Authorization": f"Bearer {tokens['access_token']}"}
