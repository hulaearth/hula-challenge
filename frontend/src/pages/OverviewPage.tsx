import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getBiodiversity, listDetections } from "../api/generated/sdk.gen";
import type {
    BiodiversityResponse,
    SpeciesSummary,
    Taxon,
} from "../api/generated/types.gen";

import DistributionCard from "../components/DistributionCard";
import StatCard from "../components/StatCard";
import TopSpecies from "../components/TopSpecies";
import BiodiversityChart from "../components/BiodiversityChart";

const TAXA: Array<{
    id: Taxon;
    label: string;
    icon: string;
}> = [
        {
            id: "bird",
            label: "Birds",
            icon: "🐦",
        },
        {
            id: "amphibian",
            label: "Amphibians",
            icon: "🐸",
        },
        {
            id: "bat",
            label: "Bats",
            icon: "🦇",
        },
    ];

export default function OverviewPage() {
    const [species, setSpecies] = useState<SpeciesSummary[]>(
        []
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [biodiversity, setBiodiversity] =
        useState<BiodiversityResponse | null>(null);
    useEffect(() => {
        async function loadData() {
            try {
                const [speciesResponse, biodiversityResponse] =
                    await Promise.all([
                        listDetections({
                            query: {
                                page_size: 100,
                            },
                        }),
                        getBiodiversity(),
                    ]);

                if (!speciesResponse.data) {
                    throw new Error(
                        "No species data returned"
                    );
                }

                if (!biodiversityResponse.data) {
                    throw new Error(
                        "No biodiversity score returned"
                    );
                }

                setSpecies(speciesResponse.data.items);
                setBiodiversity(biodiversityResponse.data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load biodiversity data"
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const distribution = useMemo(
        () =>
            TAXA.map((taxon) => ({
                ...taxon,
                count: species.filter(
                    (item) => item.taxon === taxon.id
                ).length,
            })),
        [species]
    );

    const totalDetections = useMemo(
        () =>
            species.reduce(
                (total, item) => total + item.detection_count,
                0
            ),
        [species]
    );

    const topSpecies = useMemo(
        () =>
            [...species]
                .sort(
                    (a, b) =>
                        b.detection_count - a.detection_count
                )
                .slice(0, 3),
        [species]
    );

    if (loading) {
        return (
            <div className="py-16 text-center text-slate-500">
                Loading biodiversity data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <h2 className="font-semibold">
                    Failed to load biodiversity data
                </h2>

                <p className="mt-1 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <p className="text-sm font-medium tracking-wide text-emerald-600">
                    OVERVIEW
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                    Today's biodiversity
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                    Explore species detected by the BioT sensor
                    network.
                </p>
            </section>

            {/* Stats */}
            <section className="grid gap-6 md:grid-cols-3">
                <StatCard
                    label="Species detected"
                    value={species.length}
                />

                <StatCard
                    label="Recorded detections"
                    value={totalDetections.toLocaleString()}
                />

                <StatCard
                    label="Taxa monitored"
                    value={TAXA.length}
                />
            </section>

            {/* Distribution + top species */}
            <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                <DistributionCard
                    distribution={distribution}
                />

                <TopSpecies species={topSpecies} />
            </section>

            {/* Biodiversity score */}
            {biodiversity && (
                <section>
                    <BiodiversityChart data={biodiversity} />
                </section>
            )}

            {/* Taxon navigation */}
            <section>
                <h2 className="text-xl font-bold">
                    Explore biodiversity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Browse detected species by taxon.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {distribution.map((taxon) => (
                        <Link
                            key={taxon.id}
                            to={`/taxa/${taxon.id}`}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span className="text-3xl">
                                {taxon.icon}
                            </span>

                            <h3 className="mt-5 font-semibold">
                                {taxon.label}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {taxon.count} species detected
                            </p>

                            <p className="mt-4 text-sm font-medium text-emerald-600">
                                Learn more →
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}