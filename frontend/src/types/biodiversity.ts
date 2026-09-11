export type Taxon = "bird" | "amphibian" | "bat";

export type ConservationStatus =
    | "least_concern"
    | "near_threatened"
    | "vulnerable"
    | "endangered";

export type Presence =
    | "resident"
    | "breeding"
    | "passing"
    | "unknown";

export interface ActivityPoint {
    date: string;
    detection_count: number;
}

export interface SpeciesSummary {
    id: string;
    taxon: Taxon;
    common_name: string;
    scientific_name: string;
    image_url: string | null;

    conservation_status: ConservationStatus;
    presence: Presence;

    detected_by: string[];
    detected_on: string[];

    last_detected_at: string;
    detection_count: number;
}

export interface SpeciesDetail extends SpeciesSummary {
    description: string;
    habitat: string;
    breeding_months: number[];
    audio_url: string | null;
    population_trend: string;
    activity: ActivityPoint[];
}

export interface DetectionPage {
    items: SpeciesSummary[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}