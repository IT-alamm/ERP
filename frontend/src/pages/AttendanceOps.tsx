import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, unwrap } from "../lib/api";
import { Btn, Card, CardHeader, ErrorText, Input, Select, extractError } from "../components/ui";

interface Attendance {
  id: number;
  labourId: number;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workingHours: number | null;
  overtimeHours: number | null;
  remarks: string | null;
}

interface Labour {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string | null;
  joiningDate: string | null;
}

interface Profile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string | null;
  joiningDate: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

const dayStyle: Record<string, string> = {
  PRESENT: "bg-emerald-500 text-white hover:bg-emerald-600",
  ABSENT: "bg-red-500 text-white hover:bg-red-600",
  HALF_DAY: "bg-orange-400 text-white hover:bg-orange-500",
  LEAVE: "bg-purple-400 text-white hover:bg-purple-500",
  HOLIDAY: "bg-sky-400 text-white hover:bg-sky-500",
  WEEK_OFF: "bg-slate-400 text-white hover:bg-slate-500",
};

export default function AttendanceOps() {
  const { isAdmin } = useAuth();
  const [labours, setLabours] = useState<Labour[]>([]);
  const [monthData, setMonthData] = useState<Attendance[]>([]);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthMap, setMonthMap] = useState<Record<string, Attendance>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  useEffect(() => {
    if (isAdmin) {
      api.get("/admin/labours", { params: { page: 0, size: 100 } })
        .then((r) => setLabours(unwrap<{ content: Labour[] }>(r).content))
        .catch((e) => setError(extractError(e)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      loadMyMonth();
      api.get("/labour/profile").then((r) => setProfile(unwrap<Profile>(r))).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const loadMyMonth = async () => {
    try {
      const r = await api.get("/labour/attendance/month", { params: { year, month } });
      const list = unwrap<Attendance[]>(r);
      const map: Record<string, Attendance> = {};
      list.forEach((a) => { map[a.attendanceDate] = a; });
      setMonthMap(map);
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    if (isAdmin) loadRegister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, labours]);

  const loadRegister = async () => {
    try {
      const r = await api.get("/admin/attendance/month", { params: { year, month } });
      setMonthData(unwrap<Attendance[]>(r));
      setPending({});
    } catch (e) {
      setError(extractError(e));
    }
  };

  const flipDay = (labourId: number, date: string, dbStatus: string | null) => {
    if (date > todayISO) return;
    const key = `${labourId}|${date}`;
    setPending((p) => {
      const next = { ...p };
      const effective = p[key] ?? dbStatus ?? "ABSENT";
      const flipped = effective === "PRESENT" ? "ABSENT" : "PRESENT";
      if (flipped === dbStatus) delete next[key];
      else next[key] = flipped as "PRESENT" | "ABSENT";
      return next;
    });
    setOk(null);
  };

  const saveAll = async () => {
    const items = Object.entries(pending).map(([key, status]) => {
      const [labourId, attendanceDate] = key.split("|");
      return { labourId: Number(labourId), attendanceDate, status };
    });
    if (!items.length || saving) return;
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      await api.post("/admin/attendance/bulk", { items });
      setPending({});
      setOk(`${items.length} record${items.length > 1 ? "s" : ""} marked.`);
      loadRegister();
    } catch (e) {
      setError(extractError(e));
    } finally {
      setSaving(false);
    }
  };

  const shiftMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const present = Object.values(monthMap).filter((a) => a.status === "PRESENT").length;
  const absent = Object.values(monthMap).filter((a) => a.status === "ABSENT").length;
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1);
  const tillDateDays = isFutureMonth ? 0 : isCurrentMonth ? today.getDate() : daysInMonth;

  const byLabour: Record<number, Attendance[]> = {};
  monthData.forEach((a) => { (byLabour[a.labourId] ??= []).push(a); });

  const q = search.trim().toLowerCase();
  const filteredLabours = labours.filter((l) =>
    !q || `${l.firstName} ${l.lastName ?? ""} ${l.employeeCode}`.toLowerCase().includes(q));

  const totalPresent = monthData.filter((a) => a.status === "PRESENT").length;
  const avgAttendance = labours.length && tillDateDays ? (totalPresent / (labours.length * tillDateDays)) * 100 : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">{isAdmin ? "Attendance Operations" : "My Attendance & Shift History"}</h1>

      {isAdmin && (
        <Card>
          <CardHeader title="Labour attendance register" sub={`${monthName} · Toggle P/A then click Mark Attendance below`} />
          <div className="flex flex-wrap items-center gap-3 p-5">
            <div className="w-56">
              <Input placeholder="Search name / code…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="w-56">
              <Select value={`${year}-${pad(month)}`} onChange={(e) => { const [y, m] = e.target.value.split("-").map(Number); setYear(y); setMonth(m); }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                  const y = d.getFullYear(), m = d.getMonth() + 1;
                  return <option key={`${y}-${m}`} value={`${y}-${m}`}>{d.toLocaleString("en-IN", { month: "long", year: "numeric" })}</option>;
                })}
              </Select>
            </div>
          </div>
          <div className="grid gap-3 px-5 pb-2 md:grid-cols-3">
            <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-inset ring-teal-100">
              <p className="text-2xl font-extrabold text-slate-900">{daysInMonth}</p>
              <p className="text-xs text-slate-500">Total working days</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-100">
              <p className="text-2xl font-extrabold text-slate-900">{tillDateDays}</p>
              <p className="text-xs text-slate-500">Till date working days</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4 ring-1 ring-inset ring-purple-100">
              <p className="text-2xl font-extrabold text-slate-900">{avgAttendance.toFixed(2)}%</p>
              <p className="text-xs text-slate-500">Average Attendance</p>
            </div>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-xs tracking-wide text-indigo-600 uppercase">
                  <th className="border border-slate-200 px-3 py-2">S.No.</th>
                  <th className="border border-slate-200 px-3 py-2">Labour Name</th>
                  <th className="border border-slate-200 px-3 py-2">Code</th>
                  <th className="border border-slate-200 px-3 py-2">Present</th>
                  <th className="border border-slate-200 px-3 py-2">Absent</th>
                  <th className="border border-slate-200 px-3 py-2">%</th>
                  <th className="border border-slate-200 px-3 py-2">Criteria</th>
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <th key={i} className="border border-slate-200 px-2 py-2 text-center">{pad(i + 1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLabours.map((l, idx) => {
                  const recs = byLabour[l.id] ?? [];
                  const dayLookup: Record<string, Attendance> = {};
                  recs.forEach((a) => { dayLookup[a.attendanceDate] = a; });
                  const joinDate = l.joiningDate ?? `${year}-${pad(month)}-01`;
                  const joinMonth = joinDate.slice(0, 7);
                  const joinDay = joinMonth === `${year}-${pad(month)}` ? parseInt(joinDate.slice(8, 10), 10) : 1;
                  const eff = (date: string): "PRESENT" | "ABSENT" =>
                    (pending[`${l.id}|${date}`] ?? dayLookup[date]?.status ?? "ABSENT") === "PRESENT" ? "PRESENT" : "ABSENT";
                  let p = 0, ab = 0;
                  for (let d = 1; d <= daysInMonth; d++) {
                    if (d < joinDay) continue;
                    const dt = toISO(year, month, d);
                    const status = dt > todayISO ? "ABSENT" : eff(dt);
                    if (status === "PRESENT") p++;
                    else ab++;
                  }
                  const activeDays = daysInMonth - joinDay + 1;
                  const pct = activeDays > 0 ? (p / activeDays) * 100 : 0;
                  const okCriteria = pct >= 75;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2">{idx + 1}</td>
                      <td className="border border-slate-200 px-3 py-2 font-medium">{l.firstName} {l.lastName ?? ""}</td>
                      <td className="border border-slate-200 px-3 py-2 font-mono text-xs">{l.employeeCode}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-emerald-700">{p}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-red-700">{ab}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">{pct.toFixed(2)}</td>
                      <td className={`border border-slate-200 px-3 py-2 text-xs font-semibold ${okCriteria ? "text-slate-600" : "bg-red-100 text-red-700"}`}>
                        {okCriteria ? "Satisfied" : "Not Satisfied"}
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = toISO(year, month, day);
                        if (day < joinDay) {
                          return <td key={i} className="border border-slate-200 bg-slate-50 px-1 py-2 text-center text-xs text-slate-300">–</td>;
                        }
                        const rec = dayLookup[date];
                        const future = date > todayISO;
                        const cur = future ? "ABSENT" : (eff(date));
                        const changed = !future && pending[`${l.id}|${date}`] !== undefined;
                        return (
                          <td key={i} className={`border border-slate-200 px-1 py-2 ${future ? "bg-slate-50" : ""} ${changed ? "bg-amber-50" : ""}`}>
                            <div className="flex items-center justify-center">
                              {future ? (
                                <span
                                  title={`${date}: Absent (upcoming)`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white bg-red-500"
                                >
                                  A
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => flipDay(l.id, date, rec?.status ?? null)}
                                  title={`${date}: ${cur === "PRESENT" ? "Present" : "Absent"} (click to flip)`}
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow transition active:scale-90 ${
                                    cur === "PRESENT" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                                  } ${changed ? "outline outline-2 outline-offset-1 outline-amber-400" : ""}`}
                                >
                                  {cur === "PRESENT" ? "P" : "A"}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {filteredLabours.length === 0 && <tr><td colSpan={7 + daysInMonth} className="border border-slate-200 px-3 py-8 text-center text-sm text-slate-500">No labours found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-amber-600">{Object.keys(pending).length}</span> unsaved selection{Object.keys(pending).length === 1 ? "" : "s"}
            </p>
            <Btn onClick={saveAll} disabled={!Object.keys(pending).length || saving} className="ml-auto px-8 py-2.5">
              {saving ? "Marking…" : `Mark Attendance${Object.keys(pending).length ? ` (${Object.keys(pending).length})` : ""} →`}
            </Btn>
          </div>
          <div className="px-5 pb-4"><ErrorText message={error} />{ok && <p className="text-sm font-medium text-emerald-600">{ok}</p>}</div>
        </Card>
      )}

      {!isAdmin && (
        <Card>
          <CardHeader title="My attendance register" sub={`${monthName} · Read-only view`} />
          <div className="flex flex-wrap items-center gap-3 p-5">
            <div className="flex items-center gap-2">
              <Btn variant="ghost" onClick={() => shiftMonth(-1)}>←</Btn>
              <span className="min-w-40 text-center text-sm font-bold text-slate-800">{monthName}</span>
              <Btn variant="ghost" onClick={() => shiftMonth(1)}>→</Btn>
            </div>
            <div className="ml-auto flex gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-200">P: {present}</span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-inset ring-red-200">A: {absent}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{present + absent ? ((present / (present + absent)) * 100).toFixed(1) : "0.0"}%</span>
            </div>
          </div>
          <div className="grid gap-3 px-5 pb-2 md:grid-cols-3">
            <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-inset ring-teal-100">
              <p className="text-2xl font-extrabold text-slate-900">{daysInMonth}</p>
              <p className="text-xs text-slate-500">Total working days</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-100">
              <p className="text-2xl font-extrabold text-slate-900">{tillDateDays}</p>
              <p className="text-xs text-slate-500">Till date working days</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4 ring-1 ring-inset ring-purple-100">
              <p className="text-2xl font-extrabold text-slate-900">{daysInMonth ? ((present / daysInMonth) * 100).toFixed(2) : "0.00"}%</p>
              <p className="text-xs text-slate-500">My Attendance %</p>
            </div>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-xs tracking-wide text-indigo-600 uppercase">
                  <th className="border border-slate-200 px-3 py-2">S.No.</th>
                  <th className="border border-slate-200 px-3 py-2">Labour Name</th>
                  <th className="border border-slate-200 px-3 py-2">Code</th>
                  <th className="border border-slate-200 px-3 py-2">Present</th>
                  <th className="border border-slate-200 px-3 py-2">Absent</th>
                  <th className="border border-slate-200 px-3 py-2">%</th>
                  <th className="border border-slate-200 px-3 py-2">Criteria</th>
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <th key={i} className="border border-slate-200 px-2 py-2 text-center">{pad(i + 1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile && (() => {
                  const joinDate = profile.joiningDate ?? `${year}-${pad(month)}-01`;
                  const joinMonth = joinDate.slice(0, 7);
                  const joinDay = joinMonth === `${year}-${pad(month)}` ? parseInt(joinDate.slice(8, 10), 10) : 1;
                  let p = 0, ab = 0;
                  const dayLookup: Record<string, Attendance> = {};
                  Object.values(monthMap).forEach((a) => { dayLookup[a.attendanceDate] = a; });
                  for (let d = 1; d <= daysInMonth; d++) {
                    if (d < joinDay) continue;
                    const date = toISO(year, month, d);
                    const status = date > todayISO ? "ABSENT" : (dayLookup[date]?.status === "PRESENT" ? "PRESENT" : "ABSENT");
                    if (status === "PRESENT") p++; else ab++;
                  }
                  const activeDays = daysInMonth - joinDay + 1;
                  const pct = activeDays > 0 ? (p / activeDays) * 100 : 0;
                  const okCriteria = pct >= 75;
                  return (
                    <tr className="hover:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2">1</td>
                      <td className="border border-slate-200 px-3 py-2 font-medium">{profile.firstName} {profile.lastName ?? ""}</td>
                      <td className="border border-slate-200 px-3 py-2 font-mono text-xs">{profile.employeeCode}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-emerald-700">{p}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-red-700">{ab}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">{pct.toFixed(2)}</td>
                      <td className={`border border-slate-200 px-3 py-2 text-xs font-semibold ${okCriteria ? "text-slate-600" : "bg-red-100 text-red-700"}`}>
                        {okCriteria ? "Satisfied" : "Not Satisfied"}
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = toISO(year, month, day);
                        if (day < joinDay) {
                          return <td key={i} className="border border-slate-200 bg-slate-50 px-1 py-2 text-center text-xs text-slate-300">–</td>;
                        }
                        const future = date > todayISO;
                        const rec = dayLookup[date];
                        const cur = future ? "ABSENT" : (rec?.status === "PRESENT" ? "PRESENT" : "ABSENT");
                        return (
                          <td key={i} className={`border border-slate-200 px-1 py-2 ${future ? "bg-slate-50" : ""}`}>
                            <div className="flex items-center justify-center">
                              <span
                                title={`${date}: ${cur === "PRESENT" ? "Present" : "Absent"}${future ? " (upcoming)" : ""}`}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                                  cur === "PRESENT" ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              >
                                {cur === "PRESENT" ? "P" : "A"}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })()}
                {!profile && (
                  <tr><td colSpan={7 + daysInMonth} className="border border-slate-200 px-3 py-8 text-center text-sm text-slate-500">Loading profile…</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-4"><ErrorText message={error} /></div>
        </Card>
      )}
    </div>
  );
}
