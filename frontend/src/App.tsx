import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AttendanceOps from "./pages/AttendanceOps";
import Projects from "./pages/Projects";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Documents from "./pages/Documents";
import LabourDashboard from "./pages/LabourDashboard";
import Notifications from "./pages/Notifications";

function RequireAuth({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) {
  const { role, isAdmin } = useAuth();
  if (!role) return <Navigate to="/register" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/home" replace />;
  if (!adminOnly && role === "ROLE_ADMIN" && window.location.pathname.startsWith("/my"))
    return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route
            path="/admin"
            element={
              <RequireAuth adminOnly>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <RequireAuth adminOnly>
                <AttendanceOps />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <RequireAuth adminOnly>
                <Projects />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/leaves"
            element={
              <RequireAuth adminOnly>
                <Leaves mode="admin" />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/payroll"
            element={
              <RequireAuth adminOnly>
                <Payroll mode="admin" />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <RequireAuth adminOnly>
                <Documents mode="admin" />
              </RequireAuth>
            }
          />
          <Route path="/home" element={<LabourDashboard />} />
          <Route path="/my/attendance" element={<AttendanceOps />} />
          <Route path="/my/leaves" element={<Leaves mode="labour" />} />
          <Route path="/my/payroll" element={<Payroll mode="labour" />} />
          <Route path="/my/projects" element={<Projects />} />
          <Route path="/my/documents" element={<Documents mode="labour" />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </AuthProvider>
  );
}
