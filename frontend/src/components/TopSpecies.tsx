import type { SpeciesSummary } from "../types/biodiversity";
import SpeciesRow from "./SpeciesRow";

interface TopSpeciesProps {
    species: SpeciesSummary[];
}

export default function TopSpecies({
    species,
}: TopSpeciesProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
                Top 3 species
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Most frequently detected species.
            </p>

            <div className="mt-6 divide-y divide-slate-100">
                {species.map((item, index) => (
                    <SpeciesRow
                        key={item.id}
                        species={item}
                        rank={index + 1}
                    />
                ))}
            </div>
        </div>
    );
}