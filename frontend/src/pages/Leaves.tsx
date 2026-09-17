import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Badge, Btn, Card, CardHeader, ErrorText, Field, Input, Select, extractError } from "../components/ui";

interface Leave {
  id: number;
  labourId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export default function Leaves({ mode }: { mode: "admin" | "labour" }) {
  const [rows, setRows] = useState<Leave[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });

  const load = async () => {
    try {
      const url = mode === "admin" ? "/admin/leaves/pending" : "/labour/leaves";
      const r = await api.get(url, { params: { page: 0, size: 20 } });
      setRows(unwrap<{ content: Leave[] }>(r).content);
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/labour/leaves", form);
      setForm({ leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const decide = async (id: number, decision: string) => {
    try {
      await api.patch(`/admin/leaves/${id}`, null, { params: { decision } });
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">{mode === "admin" ? "Leave Approvals" : "Apply Leave & Balances"}</h1>
      <ErrorText message={error} />

      {mode === "labour" && (
        <Card>
          <CardHeader title="New leave request" sub="Goes to PENDING for admin approval" />
          <form onSubmit={apply} className="grid grid-cols-2 gap-3 p-5 xl:grid-cols-5">
            <Field label="Type">
              <Select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                {["CASUAL", "SICK", "EARNED", "UNPAID", "OTHER"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Start"><Input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="End"><Input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            <Field label="Reason"><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
            <div className="flex items-end"><Btn type="submit" className="w-full">Apply</Btn></div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader title={mode === "admin" ? "Pending requests" : "My requests"} sub={`${rows.length} records`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">ID</th>
                {mode === "admin" && <th className="px-5 py-3">Labour</th>}
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                {mode === "admin" && <th className="px-5 py-3">Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">#{l.id}</td>
                  {mode === "admin" && <td className="px-5 py-3">#{l.labourId}</td>}
                  <td className="px-5 py-3">{l.leaveType}</td>
                  <td className="px-5 py-3">{l.startDate} → {l.endDate}</td>
                  <td className="px-5 py-3">{l.reason ?? "—"}</td>
                  <td className="px-5 py-3"><Badge value={l.status} /></td>
                  {mode === "admin" && (
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => decide(l.id, "APPROVED")} className="text-xs font-semibold text-emerald-600 hover:underline">Approve</button>
                        <button onClick={() => decide(l.id, "REJECTED")} className="text-xs font-semibold text-red-600 hover:underline">Reject</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">No records.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
