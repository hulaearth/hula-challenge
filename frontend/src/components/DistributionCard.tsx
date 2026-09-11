import { Link } from "react-router-dom";

import type { TaxonInfo } from "../constants/taxa";

interface DistributionItem extends TaxonInfo {
    count: number;
}

interface DistributionCardProps {
    distribution: DistributionItem[];
}

const COLORS = [
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
];

export default function DistributionCard({
    distribution,
}: DistributionCardProps) {
    const total = distribution.reduce(
        (sum, item) => sum + item.count,
        0
    );

    let current = 0;

    const segments = distribution.map((item, index) => {
        const percentage =
            total === 0 ? 0 : (item.count / total) * 100;

        const start = current;
        const end = current + percentage * 3.6;

        current = end;

        return {
            ...item,
            percentage,
            start,
            end,
            color: COLORS[index % COLORS.length],
        };
    });

    const gradient =
        total === 0
            ? "conic-gradient(#e2e8f0 0deg 360deg)"
            : `conic-gradient(${segments
                .map(
                    (item) =>
                        `${item.color} ${item.start}deg ${item.end}deg`
                )
                .join(", ")})`;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
                Species distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Share of detected species by taxon.
            </p>

            <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
                <div
                    className="h-44 w-44 shrink-0 rounded-full"
                    style={{ background: gradient }}
                />

                <div className="w-full space-y-3">
                    {segments.map((item) => (
                        <Link
                            key={item.id}
                            to={`/taxa/${item.id}`}
                            className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />

                                <span className="text-xl">
                                    {item.icon}
                                </span>

                                <div>
                                    <p className="font-medium">
                                        {item.label}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {item.count} species
                                    </p>
                                </div>
                            </div>

                            <span className="font-semibold">
                                {Math.round(item.percentage)}%
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}