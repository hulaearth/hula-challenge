import type { ActivityPoint } from "../api/generated/types.gen";

interface ActivityChartProps {
    activity: ActivityPoint[];
}

export default function ActivityChart({
    activity,
}: ActivityChartProps) {
    const max = Math.max(
        ...activity.map((item) => item.detection_count),
        1
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-xl font-bold">
                    Detection activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Monthly recorded detections.
                </p>
            </div>

            <div className="mt-8 flex h-56 items-end gap-2">
                {activity.map((item) => {
                    const height =
                        (item.detection_count / max) * 100;

                    const month = new Intl.DateTimeFormat("en", {
                        month: "short",
                    }).format(new Date(item.date));

                    return (
                        <div
                            key={item.date}
                            className="group flex h-full flex-1 flex-col justify-end"
                        >
                            {/* Bar area */}
                            <div className="relative flex flex-1 items-end">
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                                    {item.detection_count.toLocaleString()} detections
                                </div>

                                {/* Bar */}
                                <div
                                    className="w-full min-w-[8px] rounded-t-md bg-emerald-500 transition-all duration-200 group-hover:bg-emerald-600"
                                    style={{
                                        height: `${Math.max(height, 3)}%`,
                                    }}
                                />
                            </div>

                            {/* Month */}
                            <span className="mt-3 text-center text-xs text-slate-400">
                                {month}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">
                    Detection count
                </p>
            </div>
        </div>
    );
}