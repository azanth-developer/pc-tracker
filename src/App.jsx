import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login        from "./pages/Login";
import AppShell     from "./pages/AppShell";
import EmployeeView from "./pages/EmployeeView";

const ADMIN_EMAILS = ["admin@attendance.com", "admin@pctracker.com"];
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

function Inner() {
  const { currentUser, isAdmin, profileLoading } = useAuth();

  // Auto-start monitor signal for Electron
  useEffect(() => {
    if (currentUser && isElectron) {
      // Start monitor engine in Electron main process.
      currentUser.getIdToken().then((token) => {
        window.electronAPI.sendLoginSuccess({
          uid: currentUser.uid,
          email: currentUser.email,
          token,
        });
      });
    }
  }, [currentUser]);

  if (DEMO_MODE) return <AppShell />;

  if (!currentUser) return <Login />;
  
  if (profileLoading) return <div className="page-loading"><div className="page-spinner" /></div>;

  // Strict RBAC: Only Firebase users with role='admin' can see the dashboard
  if (isAdmin) {
    return <AppShell />;
  }

  // Everyone else sees the Employee Status view
  return <EmployeeView />;
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}
