import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Btn, ErrorText, Field, Input, extractError } from "../components/ui";

type RoleType = "admin" | "labour";

const roleLabels: Record<RoleType, string> = {
  admin: "Administrator",
  labour: "Labour",
};

export default function Login() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchRole = (role: RoleType) => {
    setSelectedRole(role);
    setUsername("");
    setPassword("");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password, selectedRole);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[#0a1633] p-10 text-white lg:flex">
        <div>
          <p className="text-xl font-extrabold tracking-tight">
            Labour<span className="text-sky-400">Ops</span>
          </p>
          <p className="mt-1 text-xs tracking-widest text-slate-400 uppercase">Workforce Deployment Cloud</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-sky-300 uppercase">Enterprise Workforce Terminal</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight">Mission Critical Field Deployment Portal</h1>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            High-throughput multi-site gate management, verified Aadhaar & biometric ingress sync, and real-time shift
            deployment across active civil works.
          </p>
        </div>
        <p className="text-xs text-slate-500">© 2026 LabourOps Systems — Indian Shops Act compliant</p>
      </div>

      <div className="flex w-full items-center justify-center bg-[#eef2f7] p-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Secure Gateway v1.0</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Verify & Sign In</h2>

          <div className="mt-5 flex rounded-lg bg-slate-100 p-1">
            {(["admin", "labour"] as RoleType[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => switchRole(role)}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                  selectedRole === role
                    ? "bg-[#0a1633] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Username">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Field>
            <ErrorText message={error} />
            <Btn type="submit" disabled={busy} className="w-full py-2.5">
              {busy ? "Verifying…" : `Sign In as ${roleLabels[selectedRole]} →`}
            </Btn>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#1b5bd7] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
