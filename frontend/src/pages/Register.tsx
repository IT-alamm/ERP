import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Btn, ErrorText, Field, Input, extractError } from "../components/ui";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/register", { username, email, password, role: "ROLE_ADMIN" });
      navigate("/login", { replace: true });
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
          <h1 className="mt-2 text-4xl font-extrabold leading-tight">Join the Platform</h1>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Create your account to get started. Once registered, you can log in and access your dashboard.
          </p>
        </div>
        <p className="text-xs text-slate-500">© 2026 LabourOps Systems — Indian Shops Act compliant</p>
      </div>

      <div className="flex w-full items-center justify-center bg-[#eef2f7] p-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Create Account</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Register</h2>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                minLength={3}
                maxLength={30}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </Field>
            <Field label="Confirm Password">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </Field>
            <ErrorText message={error} />
            <Btn type="submit" disabled={busy} className="w-full py-2.5">
              {busy ? "Creating Account…" : "Create Account →"}
            </Btn>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#1b5bd7] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
