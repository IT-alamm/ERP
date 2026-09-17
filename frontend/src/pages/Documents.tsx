import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, unwrap } from "../lib/api";
import { Badge, Btn, Card, CardHeader, ErrorText, Field, Input, Select, extractError } from "../components/ui";

interface Doc {
  id: number;
  labourId: number;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

const TYPES = ["AADHAAR", "PAN", "BANK_PASSBOOK", "JOINING_LETTER", "CONTRACT", "CERTIFICATE", "PHOTO", "OTHER"];

export default function Documents({ mode }: { mode: "admin" | "labour" }) {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<Doc[]>([]);
  const [labourId, setLabourId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("AADHAAR");

  const load = async (id?: string) => {
    const lid = id ?? labourId;
    if (mode === "admin" && !lid) return;
    try {
      if (mode === "labour") {
        const profile = unwrap<{ id: number }>(await api.get("/labour/profile"));
        const r = await api.get(`/admin/documents/labour/${profile.id}`).catch(() => null);
        // Labour self-view uses admin endpoint only if permitted; fallback: empty
        setRows(r ? unwrap<Doc[]>(r) : []);
      } else {
        setRows(unwrap<Doc[]>(await api.get(`/admin/documents/labour/${lid}`)));
      }
      setError(null);
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    if (isAdmin) return;
    load("self");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !labourId) return;
    setError(null);
    setOk(null);
    try {
      const fd = new FormData();
      fd.append("labourId", labourId);
      fd.append("type", type);
      fd.append("file", file);
      await api.post("/admin/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setOk("Uploaded.");
      setFile(null);
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">
        {mode === "admin" ? "Upload Document & Certifications" : "My Documents & Safety Certifications"}
      </h1>
      <ErrorText message={error} />
      {ok && <p className="text-sm text-emerald-600">{ok}</p>}

      {mode === "admin" && (
        <Card>
          <CardHeader title="Upload" sub="Stored on local disk (./uploads). S3 later." />
          <form onSubmit={upload} className="grid grid-cols-2 gap-3 p-5 xl:grid-cols-4">
            <Field label="Labour ID"><Input required value={labourId} onChange={(e) => setLabourId(e.target.value)} /></Field>
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="File"><Input required type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
            <div className="flex items-end"><Btn type="submit" className="w-full">Upload</Btn></div>
          </form>
          <div className="px-5 pb-4">
            <Btn variant="ghost" onClick={() => load()}>Refresh list</Btn>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Documents" sub={`${rows.length} files`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">File</th>
                <th className="px-5 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">#{d.id}</td>
                  <td className="px-5 py-3"><Badge value={d.documentType} /></td>
                  <td className="px-5 py-3">{d.fileName}</td>
                  <td className="px-5 py-3">{d.fileSize ? `${(d.fileSize / 1024).toFixed(1)} KB` : "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No documents.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
