import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <Link to="/">
                    <div className="text-sm font-medium text-emerald-600">
                        HULA · BioT
                    </div>

                    <h1 className="text-xl font-bold">
                        Biodiversity Monitor
                    </h1>
                </Link>

                <span className="text-sm text-slate-500">
                    Experience Day
                </span>
            </div>
        </header>
    );
}