import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getSpecies } from "../api/generated/sdk.gen";
import type {
    SpeciesDetail,
    Taxon,
} from "../api/generated/types.gen";

import ActivityChart from "../components/ActivityChart";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";

const TAXA: Record<
    Taxon,
    {
        label: string;
        singular: string;
        icon: string;
    }
> = {
    bird: {
        label: "Birds",
        singular: "Bird",
        icon: "🐦",
    },
    amphibian: {
        label: "Amphibians",
        singular: "Amphibian",
        icon: "🐸",
    },
    bat: {
        label: "Bats",
        singular: "Bat",
        icon: "🦇",
    },
};

export default function SpeciesPage() {
    const { speciesId } = useParams<{
        speciesId: string;
    }>();

    const [species, setSpecies] =
        useState<SpeciesDetail | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!speciesId) {
            setLoading(false);
            setError("No species ID provided");
            return;
        }

        async function loadSpecies() {
            try {
                setLoading(true);
                setError(null);

                const response = await getSpecies({
                    path: {
                        species_id: speciesId,
                    },
                });

                if (!response.data) {
                    throw new Error("Species not found");
                }

                setSpecies(response.data);
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
    }, [speciesId]);

    if (loading) {
        return (
            <div className="py-16 text-center text-slate-500">
                Loading species...
            </div>
        );
    }

    if (error || !species) {
        return (
            <div className="py-16 text-center">
                <h2 className="text-2xl font-bold">
                    Species not found
                </h2>

                <p className="mt-2 text-slate-500">
                    {error}
                </p>

                <Link
                    to="/"
                    className="mt-4 inline-block text-emerald-600"
                >
                    Back to overview
                </Link>
            </div>
        );
    }

    const taxon = TAXA[species.taxon];

    return (
        <div className="space-y-8">
            {/* Back */}
            <Link
                to={`/taxa/${species.taxon}`}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                ← Back to {taxon.label}
            </Link>

            {/* Hero */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid lg:grid-cols-[360px_1fr]">
                    {/* Image */}
                    <div className="flex min-h-[360px] items-center justify-center bg-slate-100">
                        {species.image_url ? (
                            <img
                                src={species.image_url}
                                alt={species.common_name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-7xl">
                                {taxon.icon}
                            </span>
                        )}
                    </div>

                    {/* Main information */}
                    <div className="p-8">
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                            <span>{taxon.icon}</span>
                            <span>{taxon.singular}</span>
                        </div>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight">
                            {species.common_name}
                        </h1>

                        <p className="mt-2 text-lg italic text-slate-500">
                            {species.scientific_name}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <Badge>
                                {formatStatus(
                                    species.conservation_status
                                )}
                            </Badge>

                            <Badge>
                                {formatStatus(species.presence)}
                            </Badge>
                        </div>

                        <p className="mt-8 leading-7 text-slate-600">
                            {species.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="grid gap-6 md:grid-cols-3">
                <StatCard
                    label="Total detections"
                    value={species.detection_count.toLocaleString()}
                />

                <StatCard
                    label="Monitoring sites"
                    value={species.detected_on.length}
                />

                <StatCard
                    label="Sensors"
                    value={species.detected_by.length}
                />
            </section>

            {/* Information + activity */}
            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">
                        Species information
                    </h2>

                    <dl className="mt-6 space-y-5">
                        <InfoRow
                            label="Habitat"
                            value={species.habitat}
                        />

                        <InfoRow
                            label="Population trend"
                            value={species.population_trend}
                        />

                        <InfoRow
                            label="Presence"
                            value={formatStatus(species.presence)}
                        />

                        <InfoRow
                            label="Last detected"
                            value={formatDate(
                                species.last_detected_at
                            )}
                        />

                        <InfoRow
                            label="Breeding months"
                            value={
                                species.breeding_months.length > 0
                                    ? species.breeding_months.join(", ")
                                    : "Not specified"
                            }
                        />
                    </dl>
                </div>

                <ActivityChart
                    activity={species.activity}
                />
            </section>

            {/* Sensors / sites */}
            <section className="grid gap-6 md:grid-cols-2">
                <ListCard
                    title="Detected by"
                    items={species.detected_by}
                />

                <ListCard
                    title="Detected on"
                    items={species.detected_on}
                />
            </section>

            {/* Audio */}
            {species.audio_url && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">
                        Species call
                    </h2>

                    <audio
                        controls
                        className="mt-4 w-full"
                        src={species.audio_url}
                    >
                        Your browser does not support audio playback.
                    </audio>
                </section>
            )}
        </div>
    );
}

function formatStatus(value: string): string {
    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

interface InfoRowProps {
    label: string;
    value: string;
}

function InfoRow({
    label,
    value,
}: InfoRowProps) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </dt>

            <dd className="mt-1 text-slate-700">
                {value}
            </dd>
        </div>
    );
}

interface ListCardProps {
    title: string;
    items: string[];
}

function ListCard({
    title,
    items,
}: ListCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
                {title}
            </h2>

            <div className="mt-4 space-y-2">
                {items.map((item) => (
                    <div
                        key={item}
                        className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}