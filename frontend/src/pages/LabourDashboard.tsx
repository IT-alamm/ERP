import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Badge, Card, CardHeader, Stat, extractError } from "../components/ui";

interface Profile {
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  department: string;
  dailyWage: number;
  joiningDate: string;
  status: string;
}

interface ExpenseTotal {
  labourId: number;
  total: number;
}

interface Expense {
  id: number;
  labourId: number;
  amount: number;
  expenseDate: string;
  remarks: string | null;
}

export default function LabourDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [counts, setCounts] = useState({ attendance: 0, payslips: 0, leaves: 0, projects: 0 });
  const [presentDays, setPresentDays] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProfile(unwrap<Profile>(await api.get("/labour/profile")));
        const [att, pay, lev, proj] = await Promise.all([
          api.get("/labour/attendance", { params: { page: 0, size: 1 } }).catch(() => null),
          api.get("/labour/payroll", { params: { page: 0, size: 100 } }).catch(() => null),
          api.get("/labour/leaves", { params: { page: 0, size: 100 } }).catch(() => null),
          api.get("/labour/projects").catch(() => null),
        ]);
        setCounts({
          attendance: att?.data?.data?.totalElements ?? 0,
          payslips: pay?.data?.data?.totalElements ?? pay?.data?.data?.content?.length ?? 0,
          leaves: lev?.data?.data?.totalElements ?? lev?.data?.data?.content?.length ?? 0,
          projects: Array.isArray(proj?.data?.data) ? proj.data.data.length : 0,
        });
        const now = new Date();
        const monthR = await api.get("/labour/attendance/month", { params: { year: now.getFullYear(), month: now.getMonth() + 1 } }).catch(() => null);
        if (monthR) {
          const records = unwrap<{ status: string }[]>(monthR);
          const presentCount = records.filter((r) => r.status === "PRESENT").length;
          setPresentDays(presentCount);
        }
        const expR = await api.get("/labour/expenses/total").catch(() => null);
        if (expR) {
          const data = unwrap<{ labourId: number; total: number }>(expR);
          setExpenseTotal(data.total ?? 0);
        }
        const expListR = await api.get("/labour/expenses").catch(() => null);
        if (expListR) {
          setExpenses(unwrap<Expense[]>(expListR));
        }
      } catch (e) {
        setError(extractError(e));
      }
    })();
  }, []);

  const totalWages = profile?.dailyWage && presentDays ? profile.dailyWage * presentDays : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Good day</p>
        <h1 className="text-xl font-bold text-slate-900">
          {profile ? `${profile.firstName} ${profile.lastName ?? ""}` : "Loading…"}
          {profile && <span className="ml-2 font-mono text-xs font-semibold text-slate-500">{profile.employeeCode}</span>}
        </h1>
        {profile && <div className="mt-1"><Badge value={profile.status} /></div>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Total Wages" value={`₹${totalWages.toLocaleString("en-IN")}`} hint={`${presentDays} days × ₹${profile?.dailyWage ?? 0}`} />
        <Stat label="Expenses" value={`₹${expenseTotal.toLocaleString("en-IN")}`} hint="Monthly deductions" />
        <Stat label="Attendance logs" value={String(counts.attendance)} hint="Punch history" />
        <Stat label="Leave requests" value={String(counts.leaves)} hint="Applied" />
      </div>

      <Card>
        <CardHeader title="Primary assignment snapshot" sub="Profile & deployment" />
        <div className="grid gap-2 p-5 text-sm sm:grid-cols-2">
          <p>Designation: <b>{profile?.designation ?? "—"}</b></p>
          <p>Department: <b>{profile?.department ?? "—"}</b></p>
          <p>Daily wage: <b>₹{profile?.dailyWage ?? "—"}</b></p>
          <p>Phone: <b>{profile?.phone ?? "—"}</b></p>
          <p>Joined: <b>{profile?.joiningDate ?? "—"}</b></p>
        </div>
      </Card>

      <Card>
        <CardHeader title="My Expenses" sub={`Total: ₹${expenseTotal.toLocaleString("en-IN")}`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-5 py-3">{e.expenseDate}</td>
                  <td className="px-5 py-3 font-semibold text-amber-700">₹{e.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-slate-600">{e.remarks ?? "—"}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
