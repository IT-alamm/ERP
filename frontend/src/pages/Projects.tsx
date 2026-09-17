import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, unwrap } from "../lib/api";
import { Badge, Btn, Card, CardHeader, ErrorText, Field, Input, Modal, extractError } from "../components/ui";

interface Project {
  id: number;
  projectCode: string;
  name: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [assign, setAssign] = useState({ projectId: "", labourId: "" });
  const [form, setForm] = useState({ projectCode: "", name: "", clientName: "", location: "", startDate: "", endDate: "", description: "" });

  const load = async () => {
    try {
      const url = isAdmin ? "/admin/projects" : "/labour/projects";
      setRows(unwrap<Project[]>(await api.get(url)));
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/projects", { ...form, startDate: form.startDate || null, endDate: form.endDate || null });
      setShow(false);
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const assignLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/admin/projects/${assign.projectId}/assign/${assign.labourId}`);
      setAssign({ projectId: "", labourId: "" });
      setError(null);
      alert("Labour assigned.");
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{isAdmin ? "Projects & Site Allocation" : "My Sites"}</h1>
          <p className="text-sm text-slate-500">Site deployment and worker allocation.</p>
        </div>
        {isAdmin && <Btn onClick={() => setShow(true)}>+ New Project</Btn>}
      </div>
      <ErrorText message={error} />

      {isAdmin && (
        <Card>
          <CardHeader title="Allocate worker to site" />
          <form onSubmit={assignLabour} className="flex flex-wrap gap-3 p-5">
            <div className="w-44"><Input placeholder="Project ID" value={assign.projectId} onChange={(e) => setAssign({ ...assign, projectId: e.target.value })} /></div>
            <div className="w-44"><Input placeholder="Labour ID" value={assign.labourId} onChange={(e) => setAssign({ ...assign, labourId: e.target.value })} /></div>
            <Btn type="submit">Assign</Btn>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold text-slate-500">#{p.id} · {p.projectCode}</p>
                <p className="mt-1 font-bold text-slate-900">{p.name}</p>
              </div>
              <Badge value={p.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{p.description ?? "—"}</p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>Client: {p.clientName ?? "—"}</p>
              <p>Location: {p.location ?? "—"}</p>
              <p>Period: {p.startDate ?? "?"} → {p.endDate ?? "?"}</p>
            </div>
          </Card>
        ))}
      </div>
      {rows.length === 0 && <p className="text-sm text-slate-500">No projects yet.</p>}

      {show && (
        <Modal title="New project" onClose={() => setShow(false)}>
          <form onSubmit={create} className="grid grid-cols-2 gap-3">
            <Field label="Project code"><Input required value={form.projectCode} onChange={(e) => setForm({ ...form, projectCode: e.target.value })} /></Field>
            <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Client"><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></Field>
            <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Start"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="End"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            <div className="col-span-2"><Field label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div>
            <div className="col-span-2"><Btn type="submit" className="w-full">Create</Btn></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
