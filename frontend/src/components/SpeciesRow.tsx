import { Link } from "react-router-dom";

import { getTaxon } from "../constants/taxa";
import type { SpeciesSummary } from "../api/generated/types.gen";

interface SpeciesRowProps {
    species: SpeciesSummary;
    rank?: number;
}

export default function SpeciesRow({
    species,
    rank,
}: SpeciesRowProps) {
    const taxon = getTaxon(species.taxon);

    return (
        <Link
            to={`/species/${species.id}`}
            className="group flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
        >
            {rank && (
                <span className="w-6 text-center text-sm font-bold text-slate-400">
                    {rank}
                </span>
            )}

            {species.image_url ? (
                <img
                    src={species.image_url}
                    alt={species.common_name}
                    className="h-14 w-14 rounded-xl object-cover"
                />
            ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                    {taxon?.icon}
                </div>
            )}

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                        {species.common_name}
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {taxon?.singular}
                    </span>
                </div>

                <p className="text-sm italic text-slate-500">
                    {species.scientific_name}
                </p>
            </div>

            <div className="hidden text-right sm:block">
                <p className="font-semibold">
                    {species.detection_count.toLocaleString()}
                </p>

                <p className="text-xs text-slate-500">
                    detections
                </p>
            </div>

            <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-800">
                →
            </span>
        </Link>
    );
}