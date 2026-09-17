import { useEffect, useState } from "react";
import { api, unwrap } from "../lib/api";
import { Btn, Card, CardHeader, ErrorText, extractError } from "../components/ui";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await api.get("/notifications", { params: { page: 0, size: 20 } });
      setRows(unwrap<{ content: Notification[] }>(r).content);
    } catch (e) {
      setError(extractError(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
      <ErrorText message={error} />
      <Card>
        <CardHeader title="Inbox" sub={`${rows.length} messages`} />
        <div className="divide-y divide-slate-100">
          {rows.map((n) => (
            <div key={n.id} className={`flex items-start justify-between gap-3 px-5 py-3 ${n.read ? "" : "bg-blue-50/50"}`}>
              <div>
                <p className="text-sm font-bold text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="mt-0.5 text-xs text-slate-400">{n.type} · {n.createdAt?.replace("T", " ").slice(0, 16)}</p>
              </div>
              {!n.read && <Btn variant="ghost" onClick={() => markRead(n.id)}>Mark read</Btn>}
            </div>
          ))}
          {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">No notifications.</p>}
        </div>
      </Card>
    </div>
  );
}
