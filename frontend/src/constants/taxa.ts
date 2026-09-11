import type { Taxon } from "../types/biodiversity";

export interface TaxonInfo {
    id: Taxon;
    label: string;
    singular: string;
    icon: string;
}

export const TAXA: TaxonInfo[] = [
    {
        id: "bird",
        label: "Birds",
        singular: "Bird",
        icon: "🐦",
    },
    {
        id: "amphibian",
        label: "Amphibians",
        singular: "Amphibian",
        icon: "🐸",
    },
    {
        id: "bat",
        label: "Bats",
        singular: "Bat",
        icon: "🦇",
    },
];

export function getTaxon(
    taxon: Taxon
): TaxonInfo | undefined {
    return TAXA.find((item) => item.id === taxon);
}