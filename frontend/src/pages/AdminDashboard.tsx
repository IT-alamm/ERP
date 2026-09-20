import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Modal, Stat, extractError } from "../components/ui";
import LabourDirectory from "./LabourDirectory";

interface Stats {
  totalLabours: number;
  activeLabours: number;
  totalProjects: number;
  pendingLeaves: number;
  presentToday: number;
}

interface PresentLabour {
  id: number;
  firstName: string;
  lastName: string | null;
  employeeCode: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPresent, setShowPresent] = useState(false);
  const [presentList, setPresentList] = useState<PresentLabour[]>([]);
  const [presentLoading, setPresentLoading] = useState(false);
  const [presentError, setPresentError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/dashboard/stats")
      .then((r) => setStats(unwrap<Stats>(r)))
      .catch((e) => setError(extractError(e)));
  }, []);

  const openPresentList = async () => {
    setShowPresent(true);
    setPresentLoading(true);
    setPresentError(null);
    try {
      const r = await api.get("/admin/attendance/today-present");
      setPresentList(unwrap<PresentLabour[]>(r));
    } catch (e) {
      setPresentError(extractError(e));
    } finally {
      setPresentLoading(false);
    }
  };

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
        <Stat label="Present today" value={String(stats?.presentToday ?? "—")} hint="Punch ingress · click to view" onClick={openPresentList} />
      </div>
      {showPresent && (
        <Modal title={`Present Today (${presentList.length})`} onClose={() => setShowPresent(false)}>
          {presentLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading…</p>
          ) : presentError ? (
            <p className="py-4 text-center text-sm text-red-600">{presentError}</p>
          ) : presentList.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Aaj koi present nahi hai</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {presentList.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{l.firstName} {l.lastName ?? ""}</p>
                    <p className="font-mono text-xs text-slate-500">{l.employeeCode}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
      <LabourDirectory />
    </div>
  );
}
