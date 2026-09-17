import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Badge, Btn, Card, CardHeader, ErrorText, Field, Input, extractError } from "../components/ui";

interface Payroll {
  id: number;
  labourId: number;
  payPeriod: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  basicAmount: number;
  overtimeAmount: number;
  bonus: number;
  deduction: number;
  grossSalary: number;
  netSalary: number;
  status: string;
}

export default function Payroll({ mode }: { mode: "admin" | "labour" }) {
  const [rows, setRows] = useState<Payroll[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ labourId: "", payPeriod: new Date().toISOString().slice(0, 7), bonus: "", deduction: "" });

  const load = async () => {
    if (mode !== "labour") return;
    try {
      const r = await api.get("/labour/payroll", { params: { page: 0, size: 20 } });
      setRows(unwrap<{ content: Payroll[] }>(r).content);
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post("/admin/payroll/generate", {
        labourId: Number(form.labourId),
        payPeriod: form.payPeriod,
        bonus: form.bonus ? Number(form.bonus) : null,
        deduction: form.deduction ? Number(form.deduction) : null,
      });
      const p = unwrap<Payroll>(r);
      alert(`Generated. Net salary: ₹${p.netSalary}`);
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">{mode === "admin" ? "Payroll Generation" : "My Payslips & Wages"}</h1>
      <ErrorText message={error} />

      {mode === "admin" && (
        <Card>
          <CardHeader title="Generate payroll" sub="Calculated from attendance. No online payment — PAID is a manual record." />
          <form onSubmit={generate} className="grid grid-cols-2 gap-3 p-5 xl:grid-cols-5">
            <Field label="Labour ID"><Input required value={form.labourId} onChange={(e) => setForm({ ...form, labourId: e.target.value })} /></Field>
            <Field label="Period (YYYY-MM)"><Input required value={form.payPeriod} onChange={(e) => setForm({ ...form, payPeriod: e.target.value })} /></Field>
            <Field label="Bonus (₹)"><Input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} /></Field>
            <Field label="Deduction (₹)"><Input type="number" value={form.deduction} onChange={(e) => setForm({ ...form, deduction: e.target.value })} /></Field>
            <div className="flex items-end"><Btn type="submit" className="w-full">Generate</Btn></div>
          </form>
          <div className="px-5 pb-4 text-xs text-slate-500">
            Status flow: DRAFT → GENERATED → APPROVED → PAID. Update via <code>PATCH /api/v1/admin/payroll/{"{id}"}?status=APPROVED</code>.
          </div>
        </Card>
      )}

      {mode === "labour" && (
        <Card>
          <CardHeader title="Payslips" sub={`${rows.length} records`} />
          <div className="space-y-3 p-5">
            {rows.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">{p.payPeriod}</p>
                  <Badge value={p.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm xl:grid-cols-4">
                  <p>Present: <b>{p.presentDays}</b> / {p.totalDays}</p>
                  <p>Basic: <b>₹{p.basicAmount}</b></p>
                  <p>Overtime: <b>₹{p.overtimeAmount}</b> ({p.overtimeHours}h)</p>
                  <p>Net: <b className="text-[#1b5bd7]">₹{p.netSalary}</b></p>
                </div>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-slate-500">No payslips yet.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
