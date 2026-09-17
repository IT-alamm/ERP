import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Stat, extractError } from "../components/ui";
import LabourDirectory from "./LabourDirectory";

interface Stats {
  totalLabours: number;
  activeLabours: number;
  totalProjects: number;
  pendingLeaves: number;
  presentToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/dashboard/stats")
      .then((r) => setStats(unwrap<Stats>(r)))
      .catch((e) => setError(extractError(e)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Operational Command Center</h1>
        <p className="text-sm text-slate-500">Real-time workforce deployment, biometric ingress, and safety compliance.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <Stat label="Total workforce" value={String(stats?.totalLabours ?? "—")} hint="Registered personnel" />
        <Stat label="Active today" value={String(stats?.activeLabours ?? "—")} hint="Enabled accounts" />
        <Stat label="Active sites" value={String(stats?.totalProjects ?? "—")} hint="Full capacity" />
        <Stat label="Pending leaves" value={String(stats?.pendingLeaves ?? "—")} hint="Awaiting approval" />
        <Stat label="Present today" value={String(stats?.presentToday ?? "—")} hint="Punch ingress" />
      </div>
      <LabourDirectory />
    </div>
  );
}
