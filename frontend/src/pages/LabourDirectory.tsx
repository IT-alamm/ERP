import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Badge, Btn, Card, ErrorText, Field, Input, Modal, Select, extractError } from "../components/ui";

interface Labour {
  id: number;
  employeeCode: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  department: string;
  dailyWage: number;
  status: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

interface Summary {
  labourId: number;
  present: number;
  absent: number;
  marked: number;
}

interface ExpenseTotal {
  labourId: number;
  total: number;
}

export default function LabourDirectory() {
  const [rows, setRows] = useState<Labour[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<Record<number, Summary>>({});
  const [expenses, setExpenses] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expenseFor, setExpenseFor] = useState<Labour | null>(null);
  const [expenseForm, setExpenseForm] = useState({ amount: "", expenseDate: new Date().toISOString().slice(0, 10), remarks: "" });
  const [form, setForm] = useState({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", designation: "", department: "", dailyWage: "" });
  const [editing, setEditing] = useState<Labour | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", designation: "", department: "", dailyWage: "" });
  const [deleting, setDeleting] = useState<Labour | null>(null);
  const [selected, setSelected] = useState<Labour | null>(null);

  const load = async () => {
    try {
      const r = await api.get("/admin/labours", { params: { search: search || undefined, status: status || undefined, page, size: 10 } });
      const data = unwrap<Page<Labour>>(r);
      setRows(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const now = new Date();
    api.get("/admin/attendance/summary", { params: { year: now.getFullYear(), month: now.getMonth() + 1 } })
      .then((r) => {
        const map: Record<number, Summary> = {};
        unwrap<Summary[]>(r).forEach((s) => { map[s.labourId] = s; });
        setSummary(map);
      })
      .catch(() => {});
    api.get("/admin/expenses/totals")
      .then((r) => {
        const map: Record<number, number> = {};
        unwrap<ExpenseTotal[]>(r).forEach((t) => { map[t.labourId] = t.total; });
        setExpenses(map);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/labours", { ...form, dailyWage: form.dailyWage ? Number(form.dailyWage) : null });
      setShowCreate(false);
      setForm({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", designation: "", department: "", dailyWage: "" });
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const openEdit = (l: Labour) => {
    setEditing(l);
    setEditForm({ firstName: l.firstName, lastName: l.lastName ?? "", phone: l.phone ?? "", designation: l.designation ?? "", department: l.department ?? "", dailyWage: String(l.dailyWage ?? "") });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/admin/labours/${editing.id}`, { ...editForm, dailyWage: editForm.dailyWage ? Number(editForm.dailyWage) : null });
      setEditing(null);
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/admin/labours/${deleting.id}`);
      setDeleting(null);
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const toggleStatus = async (l: Labour) => {
    const next = l.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await api.patch(`/admin/labours/${l.id}/status`, null, { params: { status: next } });
    load();
  };

  const openExpense = (l: Labour) => {
    setExpenseFor(l);
    setExpenseForm({ amount: "", expenseDate: new Date().toISOString().slice(0, 10), remarks: "" });
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFor) return;
    try {
      await api.post("/admin/expenses", {
        labourId: expenseFor.id,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate || null,
        remarks: expenseForm.remarks || null,
      });
      setExpenseFor(null);
      const r = await api.get("/admin/expenses/totals");
      const map: Record<number, number> = {};
      unwrap<ExpenseTotal[]>(r).forEach((t) => { map[t.labourId] = t.total; });
      setExpenses(map);
      setError(null);
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Labour Directory</h1>
          <p className="text-sm text-slate-500">Search, onboard and manage field personnel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn onClick={() => setShowCreate(true)}>+ Add Labour</Btn>
          <Btn variant="ghost" disabled={!selected} onClick={() => selected && openEdit(selected)}>Update</Btn>
          <Btn variant="danger" disabled={!selected} onClick={() => selected && setDeleting(selected)}>Delete</Btn>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="min-w-52 flex-1">
            <Input placeholder="Search name / employee code…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Btn onClick={() => { setPage(0); load(); }}>Search</Btn>
        </div>
      </Card>

      <ErrorText message={error} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3">Daily wage</th>
                <th className="px-5 py-3">Present</th>
                <th className="px-5 py-3">Wages ₹</th>
                <th className="px-5 py-3">Expense ₹</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const present = summary[l.id]?.present ?? 0;
                const wage = l.dailyWage ? present * l.dailyWage : 0;
                const expense = expenses[l.id] ?? 0;
                return (
                <tr key={l.id} onClick={() => setSelected(selected?.id === l.id ? null : l)} className={`border-b border-slate-50 last:border-0 cursor-pointer transition ${selected?.id === l.id ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-slate-50/60"}`}>
                  <td className="px-5 py-3 font-medium">{l.firstName} {l.lastName}</td>
                  <td className="px-5 py-3">{l.phone ?? "—"}</td>
                  <td className="px-5 py-3">{l.designation ?? "—"}</td>
                  <td className="px-5 py-3">₹{l.dailyWage ?? "—"}</td>
                  <td className="px-5 py-3 font-bold text-emerald-700">{present}d</td>
                  <td className="px-5 py-3 font-semibold">₹{wage.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-amber-700">₹{expense.toLocaleString("en-IN")}</span>
                    <button onClick={(e) => { e.stopPropagation(); openExpense(l); }} className="ml-2 rounded-md bg-[#1b5bd7] px-2 py-0.5 text-xs font-bold text-white hover:bg-[#1549ad]">
                      + Add
                    </button>
                  </td>
                  <td className="px-5 py-3"><Badge value={l.status} /></td>
                </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-sm">
          <span className="text-slate-500">Page {page + 1} of {Math.max(totalPages, 1)}</span>
          <div className="flex gap-2">
            <Btn variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Btn>
            <Btn variant="ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Btn>
          </div>
        </div>
      </Card>

      {showCreate && (
        <Modal title="Onboard labour" onClose={() => setShowCreate(false)}>
          <form onSubmit={create} className="grid grid-cols-2 gap-3">
            <Field label="Username"><Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
            <Field label="Email"><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Password"><Input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
            <Field label="First name"><Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Designation"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
            <Field label="Department"><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
            <div className="col-span-2">
              <Field label="Daily wage (₹)"><Input type="number" value={form.dailyWage} onChange={(e) => setForm({ ...form, dailyWage: e.target.value })} /></Field>
            </div>
            <div className="col-span-2"><Btn type="submit" className="w-full">Create account</Btn></div>
          </form>
        </Modal>
      )}
      {expenseFor && (
        <Modal title={`Add expense — ${expenseFor.firstName} ${expenseFor.lastName ?? ""}`} onClose={() => setExpenseFor(null)}>
          <form onSubmit={addExpense} className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)"><Input required type="number" min="1" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></Field>
            <Field label="Date"><Input required type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} /></Field>
            <div className="col-span-2">
              <Field label="Remarks"><Input value={expenseForm.remarks} onChange={(e) => setExpenseForm({ ...expenseForm, remarks: e.target.value })} placeholder="What is this expense for…" /></Field>
            </div>
            <div className="col-span-2"><Btn type="submit" className="w-full">Save Expense</Btn></div>
          </form>
        </Modal>
      )}
      {editing && (
        <Modal title={`Update labour — ${editing.firstName} ${editing.lastName ?? ""}`} onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="grid grid-cols-2 gap-3">
            <Field label="First name"><Input required value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></Field>
            <Field label="Phone"><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></Field>
            <Field label="Designation"><Input value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} /></Field>
            <Field label="Department"><Input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} /></Field>
            <Field label="Daily wage (₹)"><Input type="number" value={editForm.dailyWage} onChange={(e) => setEditForm({ ...editForm, dailyWage: e.target.value })} /></Field>
            <div className="col-span-2"><Btn type="submit" className="w-full">Save Changes</Btn></div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Confirm delete" onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">Are you sure you want to delete <b>{deleting.firstName} {deleting.lastName ?? ""}</b> ({deleting.employeeCode})? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setDeleting(null)} className="flex-1">Cancel</Btn>
              <Btn variant="danger" onClick={confirmDelete} className="flex-1">Delete</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
