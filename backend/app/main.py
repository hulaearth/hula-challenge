import json
from math import ceil
from pathlib import Path
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException, Query

from app.models import DetectionPage, SpeciesDetail, SpeciesSummary, Taxon, BiodiversityResponse

app = FastAPI(
    title="Hula biodiversity API",
    version="0.1.0",
    description=(
        "Deterministic, fictional biodiversity observations for the experience day."
    ),
)

# Parse and validate once. No database, randomness, or wall-clock dependency.
SPECIES = [
    SpeciesDetail.model_validate(item)
    for item in json.loads(
        Path(__file__).with_name("mock_data.json").read_text()
    )
]

BIODIVERSITY = BiodiversityResponse.model_validate(
    json.loads(
        Path(__file__)
        .with_name("biodiversity_mock_data.json")
        .read_text()
    )
)


@app.get("/api/detections", operation_id="listDetections")
def list_detections(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    search: Annotated[str, Query(max_length=100)] = "",
    taxon: Taxon | None = None,
    sort_by: Literal[
        "last_detected_at",
        "common_name",
        "detection_count",
    ] = "last_detected_at",
    order: Literal["asc", "desc"] = "desc",
) -> DetectionPage:
    """One aggregated row per detected species.

    Search matches common or scientific names (case insensitive).
    The optional taxon filter limits results to birds, amphibians, or bats.

    Out-of-range pages return an empty items array and retain the
    matching total.
    """
    term = search.strip().casefold()

    matches = [
        species
        for species in SPECIES
        if (
            taxon is None or species.taxon == taxon
        )
        and (
            term in species.common_name.casefold()
            or term in species.scientific_name.casefold()
        )
    ]

    # ID breaks ties so pagination remains deterministic.
    matches.sort(
        key=lambda species: (
            species.common_name.casefold()
            if sort_by == "common_name"
            else getattr(species, sort_by),
            species.id,
        ),
        reverse=order == "desc",
    )

    offset = (page - 1) * page_size

    return DetectionPage(
        items=[
            SpeciesSummary.model_validate(species.model_dump())
            for species in matches[offset : offset + page_size]
        ],
        total=len(matches),
        page=page,
        page_size=page_size,
        total_pages=ceil(len(matches) / page_size),
    )


@app.get("/api/species/{species_id}", operation_id="getSpecies")
def get_species(species_id: str) -> SpeciesDetail:
    """Get species information and monthly detection activity by stable ID."""
    for species in SPECIES:
        if species.id == species_id:
            return species

    raise HTTPException(
        status_code=404,
        detail="Species not found",
    )
    
    
@app.get(
    "/api/biodiversity",
    operation_id="getBiodiversity",
)
def get_biodiversity() -> BiodiversityResponse:
    """Get biodiversity score and year-over-year comparison."""
    return BIODIVERSITY