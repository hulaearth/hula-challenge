import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_pagination_covers_all_species_without_duplicates():
    first = client.get("/api/detections", params={"page_size": 5}).json()
    ids = []
    for page in range(1, first["total_pages"] + 1):
        response = client.get("/api/detections", params={"page": page, "page_size": 5})
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == first["total"]
        ids.extend(item["id"] for item in data["items"])
    assert len(ids) == len(set(ids)) == first["total"] == 16
    assert client.get("/api/detections?page=999").json()["items"] == []


def test_search_sort_and_empty_results():
    result = client.get("/api/detections?search=LANIUS").json()
    assert [item["id"] for item in result["items"]] == ["red-backed-shrike"]
    result = client.get("/api/detections?search=unknown-species").json()
    assert result["items"] == []
    assert result["total"] == result["total_pages"] == 0
    result = client.get("/api/detections?sort_by=common_name&order=asc").json()
    names = [item["common_name"] for item in result["items"]]
    assert names == sorted(names)
    result = client.get("/api/detections?sort_by=detection_count&order=desc").json()
    assert result["items"][0]["id"] == "common-chiffchaff"


@pytest.mark.parametrize(
    "query",
    [
        "page=0",
        "page=-1",
        "page_size=0",
        "page_size=101",
        "page=abc",
        "sort_by=invalid",
        "order=invalid",
        "search=" + "x" * 101,
    ],
)
def test_invalid_query_returns_422(query):
    assert client.get("/api/detections?" + query).status_code == 422


def test_all_list_entries_have_consistent_details():
    rows = client.get("/api/detections?page_size=100").json()["items"]
    for row in rows:
        response = client.get("/api/birds/" + row["id"])
        assert response.status_code == 200
        bird = response.json()
        assert all(bird[key] == value for key, value in row.items())
        assert (
            sum(point["detection_count"] for point in bird["activity"])
            == bird["detection_count"]
        )
        assert all(1 <= month <= 12 for month in bird["breeding_months"])
    assert client.get("/api/birds/not-a-bird").status_code == 404
