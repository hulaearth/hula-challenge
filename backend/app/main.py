import json
from math import ceil
from pathlib import Path
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException, Query

from app.models import BirdDetail, BirdSummary, DetectionPage

app = FastAPI(
    title="Hula bird API",
    version="0.1.0",
    description="Deterministic, fictional bird observations for the experience day.",
)

# Parse and validate once. No database, randomness, or wall-clock dependency.
BIRDS = [
    BirdDetail.model_validate(item)
    for item in json.loads(Path(__file__).with_name("mock_data.json").read_text())
]


@app.get("/api/detections", operation_id="listDetections")
def list_detections(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    search: Annotated[str, Query(max_length=100)] = "",
    sort_by: Literal["last_detected_at", "common_name", "detection_count"] = (
        "last_detected_at"
    ),
    order: Literal["asc", "desc"] = "desc",
) -> DetectionPage:
    """One aggregated row per detected species, as in the reference table.

    Search matches common or scientific names (case insensitive). Out-of-range
    pages return an empty items array and retain the matching total.
    """
    term = search.strip().casefold()
    matches = [
        bird
        for bird in BIRDS
        if term in bird.common_name.casefold()
        or term in bird.scientific_name.casefold()
    ]
    # ID breaks ties so pagination remains deterministic.
    matches.sort(
        key=lambda bird: (
            bird.common_name.casefold()
            if sort_by == "common_name"
            else getattr(bird, sort_by),
            bird.id,
        ),
        reverse=order == "desc",
    )
    offset = (page - 1) * page_size
    return DetectionPage(
        items=[
            BirdSummary.model_validate(bird.model_dump())
            for bird in matches[offset : offset + page_size]
        ],
        total=len(matches),
        page=page,
        page_size=page_size,
        total_pages=ceil(len(matches) / page_size),
    )


@app.get("/api/birds/{bird_id}", operation_id="getBird")
def get_bird(bird_id: str) -> BirdDetail:
    """Get species information and monthly detection activity by stable ID."""
    for bird in BIRDS:
        if bird.id == bird_id:
            return bird
    raise HTTPException(status_code=404, detail="Bird not found")
