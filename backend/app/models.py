import datetime as dt
from typing import Literal
from enum import StrEnum
from pydantic import BaseModel, Field

class Taxon(StrEnum):
    BIRD = "bird"
    AMPHIBIAN = "amphibian"
    BAT = "bat"


class ConservationStatus(StrEnum):
    LEAST_CONCERN = "least_concern"
    NEAR_THREATENED = "near_threatened"
    VULNERABLE = "vulnerable"
    ENDANGERED = "endangered"


class Presence(StrEnum):
    RESIDENT = "resident"
    BREEDING = "breeding"
    PASSING = "passing"
    UNKNOWN = "unknown"


class SpeciesSummary(BaseModel):
    id: str
    taxon: Taxon
    common_name: str
    scientific_name: str
    image_url: str | None = None

    conservation_status: ConservationStatus
    presence: Presence

    detected_by: list[str] = Field(
        description="BioT sensor names"
    )
    detected_on: list[str] = Field(
        description="Site names"
    )

    last_detected_at: dt.datetime
    detection_count: int = Field(
        ge=0,
        description="Recorded events, not individuals"
    )


class ActivityPoint(BaseModel):
    date: dt.date = Field(
        description="First day of the month, UTC"
    )
    detection_count: int = Field(ge=0)


class SpeciesDetail(SpeciesSummary):
    description: str
    habitat: str

    breeding_months: list[int] = Field(
        default_factory=list,
        description="Month numbers, January = 1"
    )

    audio_url: str | None = None
    population_trend: str

    activity: list[ActivityPoint]


class DetectionPage(BaseModel):
    items: list[SpeciesSummary]

    total: int = Field(
        description="Total species matching the filter before pagination"
    )

    page: int
    page_size: int
    total_pages: int


Trend = Literal["improving", "declining", "stable"]

class LastYearBiodiversity(BaseModel):
    date: str
    score: float
    difference: float
    difference_percent: float
    trend: Trend


class DailyBiodiversityComparison(BaseModel):
    date: str
    score: float
    last_year: LastYearBiodiversity


class BiodiversityWeeklyPeriod(BaseModel):
    week_start: str
    week_end: str
    average_score: float


class BiodiversityWeeklyComparison(BaseModel):
    difference: float
    difference_percent: float
    trend: Trend


class BiodiversityWeekly(BaseModel):
    current: BiodiversityWeeklyPeriod
    last_year: BiodiversityWeeklyPeriod
    comparison: BiodiversityWeeklyComparison


class BiodiversityResponse(BaseModel):
    daily: list[DailyBiodiversityComparison]
    weekly: BiodiversityWeekly