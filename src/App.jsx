import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login        from "./pages/Login";
import AppShell     from "./pages/AppShell";
import EmployeeView from "./pages/EmployeeView";

const ADMIN_EMAILS = ["admin@attendance.com", "admin@pctracker.com"];
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
let ipcRenderer = null;
if (isElectron) {
  try {
    ipcRenderer = window.require('electron').ipcRenderer;
  } catch (e) {}
}

function Inner() {
  const { currentUser } = useAuth();

  // Auto-start monitor signal for Electron
  useEffect(() => {
    if (currentUser && ipcRenderer) {
      // Start monitor engine in Electron main process.
      // (Avoid noisy logs in production builds.)
      currentUser.getIdToken().then((token) => {
        ipcRenderer.send('auth-success-start-monitor', {
          uid: currentUser.uid,
          email: currentUser.email,
          token,
        });
      });
    }
  }, [currentUser]);


  if (DEMO_MODE) return <AppShell />;

  if (!currentUser) return <Login />;

  // Allow both emails to see the dashboard
  if (ADMIN_EMAILS.includes(currentUser.email)) {
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
