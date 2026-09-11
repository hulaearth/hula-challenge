import pytest

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_pagination_covers_all_species_without_duplicates():
    first = client.get(
        "/api/detections",
        params={"page_size": 5},
    ).json()

    ids = []

    for page in range(1, first["total_pages"] + 1):
        response = client.get(
            "/api/detections",
            params={"page": page, "page_size": 5},
        )

        assert response.status_code == 200

        data = response.json()

        assert data["total"] == first["total"]

        ids.extend(item["id"] for item in data["items"])

    assert len(ids) == len(set(ids)) == first["total"] == 24

    assert client.get(
        "/api/detections",
        params={"page": 999},
    ).json()["items"] == []


def test_search_sort_and_empty_results():
    result = client.get(
        "/api/detections",
        params={"search": "LANIUS"},
    ).json()

    assert [item["id"] for item in result["items"]] == [
        "red-backed-shrike"
    ]

    result = client.get(
        "/api/detections",
        params={"search": "unknown-species"},
    ).json()

    assert result["items"] == []
    assert result["total"] == 0
    assert result["total_pages"] == 0

    result = client.get(
        "/api/detections",
        params={
            "sort_by": "common_name",
            "order": "asc",
        },
    ).json()

    names = [item["common_name"] for item in result["items"]]

    assert names == sorted(names)

    result = client.get(
        "/api/detections",
        params={
            "sort_by": "detection_count",
            "order": "desc",
        },
    ).json()

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
        "taxon=invalid",
        "search=" + "x" * 101,
    ],
)
def test_invalid_query_returns_422(query):
    assert client.get(
        "/api/detections?" + query
    ).status_code == 422


@pytest.mark.parametrize(
    ("taxon", "expected_count"),
    [
        ("bird", 16),
        ("amphibian", 4),
        ("bat", 4),
    ],
)
def test_taxon_filter(taxon, expected_count):
    response = client.get(
        "/api/detections",
        params={
            "taxon": taxon,
            "page_size": 100,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == expected_count
    assert len(data["items"]) == expected_count
    assert all(item["taxon"] == taxon for item in data["items"])


def test_taxon_filter_combines_with_search():
    response = client.get(
        "/api/detections",
        params={
            "taxon": "amphibian",
            "search": "frog",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert [item["id"] for item in data["items"]] == [
        "common-frog"
    ]


def test_all_list_entries_have_consistent_details():
    rows = client.get(
        "/api/detections",
        params={"page_size": 100},
    ).json()["items"]

    for row in rows:
        response = client.get(
            "/api/species/" + row["id"]
        )

        assert response.status_code == 200

        species = response.json()

        assert all(
            species[key] == value
            for key, value in row.items()
        )

        assert (
            sum(
                point["detection_count"]
                for point in species["activity"]
            )
            == species["detection_count"]
        )

        assert all(
            1 <= month <= 12
            for month in species["breeding_months"]
        )


def test_get_species_for_each_taxon():
    species_by_taxon = {
        "bird": "common-firecrest",
        "amphibian": "common-frog",
        "bat": "common-pipistrelle",
    }

    for taxon, species_id in species_by_taxon.items():
        response = client.get(
            f"/api/species/{species_id}"
        )

        assert response.status_code == 200

        data = response.json()

        assert data["id"] == species_id
        assert data["taxon"] == taxon


def test_species_not_found():
    response = client.get(
        "/api/species/not-a-species"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Species not found"


@pytest.mark.parametrize(
    "species_id",
    [
        "common-frog",
        "common-toad",
        "smooth-newt",
        "fire-salamander",
        "common-pipistrelle",
        "brown-long-eared-bat",
        "common-noctule",
        "serotine-bat",
    ],
)
def test_new_species_are_available(species_id):
    response = client.get(
        f"/api/species/{species_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == species_id
