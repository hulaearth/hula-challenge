interface StatCardProps {
    label: string;
    value: string | number;
}

export default function StatCard({
    label,
    value,
}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>

            <p className="mt-2 text-3xl font-bold">
                {value}
            </p>
        </div>
    );
}