interface BadgeProps {
    children: React.ReactNode;
}

export default function Badge({
    children,
}: BadgeProps) {
    return (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-600">
            {children}
        </span>
    );
}