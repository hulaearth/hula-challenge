import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { BiodiversityResponse } from "../api/generated/types.gen";

type BiodiversityChartProps = {
    data: BiodiversityResponse;
};

function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
        }
    );
}

export default function BiodiversityChart({
    data,
}: BiodiversityChartProps) {
    const today = data.daily[data.daily.length - 1];

    const chartData = data.daily.map((item) => ({
        date: item.date,
        label: formatDate(item.date),
        current: item.score,
        lastYear: item.last_year.score,
    }));

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <p className="text-sm font-medium text-emerald-600">
                    BIODIVERSITY
                </p>

                <h2 className="mt-1 text-xl font-bold">
                    Biodiversity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Current biodiversity compared with the same
                    period last year.
                </p>
            </div>

            {/* Today + Weekly */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Today
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                            {today.score}
                        </span>

                        <span className="text-sm text-slate-500">
                            score
                        </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                        Last year:{" "}
                        <span className="font-medium text-slate-700">
                            {today.last_year.score}
                        </span>
                    </p>

                    <p className="mt-3 text-sm font-semibold text-emerald-600">
                        ↑ {today.last_year.difference_percent}%
                        {" "}vs last year
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">
                        This week
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                            {data.weekly.current.average_score}
                        </span>

                        <span className="text-sm text-slate-500">
                            average
                        </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                        Last year:{" "}
                        <span className="font-medium text-slate-700">
                            {data.weekly.last_year.average_score}
                        </span>
                    </p>

                    <p className="mt-3 text-sm font-semibold text-emerald-600">
                        ↑ {data.weekly.comparison.difference_percent}%
                        {" "}vs last year
                    </p>
                </div>
            </div>

            {/* Daily chart */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">
                            Daily biodiversity
                        </h3>

                        <p className="text-sm text-slate-500">
                            This week compared with last year
                        </p>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            This year
                        </span>

                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                            Last year
                        </span>
                    </div>
                </div>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 12,
                                }}
                            />

                            <YAxis
                                domain={["dataMin - 5", "dataMax + 5"]}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 12,
                                }}
                            />

                            <Tooltip
                                formatter={(value, name) => [
                                    value,
                                    name === "current"
                                        ? "This year"
                                        : "Last year",
                                ]}
                            />

                            <Line
                                type="monotone"
                                dataKey="current"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{
                                    r: 4,
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="lastYear"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{
                                    r: 3,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}