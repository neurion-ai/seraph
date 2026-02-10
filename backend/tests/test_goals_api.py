"""Tests for goals HTTP endpoints (src/api/goals.py)."""

import pytest

from src.goals.repository import GoalRepository


@pytest.fixture
def repo():
    return GoalRepository()


class TestCreateGoal:
    async def test_success(self, client, async_db):
        res = await client.post("/api/goals", json={
            "title": "Learn Python",
            "level": "daily",
            "domain": "growth",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "Learn Python"
        assert "id" in data

    async def test_missing_title(self, client):
        res = await client.post("/api/goals", json={
            "title": "",
            "level": "daily",
        })
        assert res.status_code == 422


class TestListGoals:
    async def test_empty(self, client):
        res = await client.get("/api/goals")
        assert res.status_code == 200
        assert res.json() == []

    async def test_with_filter(self, client, async_db, repo):
        await repo.create("A", level="daily", domain="health")
        await repo.create("B", level="weekly", domain="growth")
        res = await client.get("/api/goals?level=daily")
        assert res.status_code == 200
        goals = res.json()
        assert len(goals) == 1
        assert goals[0]["level"] == "daily"


class TestGetTree:
    async def test_returns_tree(self, client, async_db, repo):
        parent = await repo.create("Vision", level="vision")
        await repo.create("Annual", level="annual", parent_id=parent.id)
        res = await client.get("/api/goals/tree")
        assert res.status_code == 200
        tree = res.json()
        assert len(tree) == 1
        assert len(tree[0]["children"]) == 1


class TestGetDashboard:
    async def test_returns_dashboard(self, client, async_db, repo):
        await repo.create("A", domain="health")
        res = await client.get("/api/goals/dashboard")
        assert res.status_code == 200
        data = res.json()
        assert data["total_count"] == 1
        assert "health" in data["domains"]


class TestUpdateGoal:
    async def test_success(self, client, async_db, repo):
        goal = await repo.create("Test")
        res = await client.patch(f"/api/goals/{goal.id}", json={"title": "Updated"})
        assert res.status_code == 200

    async def test_not_found(self, client):
        res = await client.patch("/api/goals/nope", json={"title": "X"})
        assert res.status_code == 404


class TestDeleteGoal:
    async def test_success(self, client, async_db, repo):
        goal = await repo.create("Test")
        res = await client.delete(f"/api/goals/{goal.id}")
        assert res.status_code == 200

    async def test_not_found(self, client):
        res = await client.delete("/api/goals/nope")
        assert res.status_code == 404
