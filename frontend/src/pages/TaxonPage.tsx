import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listDetections } from "../api/generated/sdk.gen";
import type {
    SpeciesSummary,
    Taxon,
} from "../api/generated/types.gen";

import SpeciesRow from "../components/SpeciesRow";
import StatCard from "../components/StatCard";

const TAXA: Record<
    Taxon,
    {
        label: string;
        icon: string;
    }
> = {
    bird: {
        label: "Birds",
        icon: "🐦",
    },
    amphibian: {
        label: "Amphibians",
        icon: "🐸",
    },
    bat: {
        label: "Bats",
        icon: "🦇",
    },
};

function isTaxon(value: string | undefined): value is Taxon {
    return (
        value === "bird" ||
        value === "amphibian" ||
        value === "bat"
    );
}

export default function TaxonPage() {
    const { taxon: taxonParam } = useParams<{
        taxon: string;
    }>();

    const [species, setSpecies] = useState<
        SpeciesSummary[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const validTaxon = isTaxon(taxonParam);

    const taxon = validTaxon
        ? TAXA[taxonParam]
        : null;

    useEffect(() => {
        if (!validTaxon || !taxonParam) {
            setLoading(false);
            return;
        }

        async function loadSpecies() {
            try {
                setLoading(true);
                setError(null);

                const response = await listDetections({
                    query: {
                        taxon: taxonParam,
                        page_size: 100,
                        sort_by: "detection_count",
                        order: "desc",
                    },
                });

                if (!response.data) {
                    throw new Error("No species data returned");
                }

                setSpecies(response.data.items);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load species"
                );
            } finally {
                setLoading(false);
            }
        }

        loadSpecies();
    }, [taxonParam, validTaxon]);

    const totalDetections = useMemo(
        () =>
            species.reduce(
                (total, item) => total + item.detection_count,
                0
            ),
        [species]
    );

    const topSpecies = species.slice(0, 3);

    if (!validTaxon || !taxon) {
        return (
            <div className="py-16 text-center">
                <h2 className="text-2xl font-bold">
                    Taxon not found
                </h2>

                <Link
                    to="/"
                    className="mt-4 inline-block text-emerald-600"
                >
                    Back to overview
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-16 text-center text-slate-500">
                Loading {taxon.label.toLowerCase()}...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <h2 className="font-semibold">
                    Failed to load species
                </h2>

                <p className="mt-1 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Back */}
            <Link
                to="/"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                ← Back to overview
            </Link>

            {/* Header */}
            <section>
                <div className="flex items-center gap-4">
                    <span className="text-5xl">
                        {taxon.icon}
                    </span>

                    <div>
                        <p className="text-sm font-medium tracking-wide text-emerald-600">
                            SPECIES GROUP
                        </p>

                        <h1 className="text-3xl font-bold">
                            {taxon.label}
                        </h1>
                    </div>
                </div>

                <p className="mt-4 max-w-2xl text-slate-500">
                    All {taxon.label.toLowerCase()} species detected
                    by the BioT monitoring network.
                </p>
            </section>

            {/* Stats */}
            <section className="grid gap-6 md:grid-cols-3">
                <StatCard
                    label="Species"
                    value={species.length}
                />

                <StatCard
                    label="Total detections"
                    value={totalDetections.toLocaleString()}
                />

                <StatCard
                    label="Average detections / species"
                    value={
                        species.length > 0
                            ? Math.round(
                                totalDetections / species.length
                            )
                            : 0
                    }
                />
            </section>

            {/* Top 3 */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                    <h2 className="text-xl font-bold">
                        Top 3 species
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Species with the highest recorded detection
                        counts.
                    </p>
                </div>

                <div className="divide-y divide-slate-100">
                    {topSpecies.map((item, index) => (
                        <SpeciesRow
                            key={item.id}
                            species={item}
                            rank={index + 1}
                        />
                    ))}
                </div>
            </section>

            {/* All species */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                    <h2 className="text-xl font-bold">
                        All {taxon.label.toLowerCase()}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Select a species to view its complete profile.
                    </p>
                </div>

                <div className="divide-y divide-slate-100">
                    {species.map((item) => (
                        <SpeciesRow
                            key={item.id}
                            species={item}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}