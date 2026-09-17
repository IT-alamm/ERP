import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/attendance", label: "Attendance" },
];

const labourLinks = [
  { to: "/home", label: "Dashboard", end: true },
  { to: "/my/attendance", label: "My Attendance" },
];

export default function Layout() {
  const { role, username, logout, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : labourLinks;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col bg-[#0a1633] text-slate-300">
        <div className="px-5 pt-6 pb-4">
          <p className="text-lg font-extrabold tracking-tight text-white">
            Labour<span className="text-sky-400">Ops</span>
          </p>
          <p className="mt-0.5 text-[11px] tracking-widest text-slate-400 uppercase">Workforce Terminal</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-[#1b5bd7] text-white" : "hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs">
          <p className="truncate font-semibold text-white">{username}</p>
          <p className="text-slate-400">{role === "ROLE_ADMIN" ? "Administrator" : "Field Personnel"}</p>
          <button onClick={logout} className="mt-2 w-full rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white hover:bg-white/20">
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            {isAdmin ? "Secure Gateway v1.0 — Admin" : "Field Deployment Portal"}
          </p>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            ● Live
          </span>
        </header>
        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
