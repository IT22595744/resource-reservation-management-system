
import {
  CircleUserRound,
  LayoutDashboard,
} from "lucide-react";

type HeaderProps = {
  name: string;
  role: string;
};

export default function Header({
  name,
  role,
}: HeaderProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 pl-17 backdrop-blur-md sm:px-7 sm:pl-17 md:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <LayoutDashboard size={14} />
          <span>Workspace</span>
          <span>/</span>
          <span className="text-blue-600">Overview</span>
        </div>

        <h1 className="mt-1 truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
          ReserveHub Dashboard
        </h1>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-48 truncate text-sm font-bold text-slate-900">
            {name}
          </p>

          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {isAdmin ? "Administrator" : "Member"}
          </p>
        </div>

        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 font-extrabold text-blue-700 ring-1 ring-blue-100">
          {initial}

          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
            <CircleUserRound size={11} className="text-white" />
          </span>
        </div>
      </div>
    </header>
  );
}
