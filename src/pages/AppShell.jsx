import { useState, lazy, Suspense } from "react";
import Sidebar from "../components/Sidebar";
import Header  from "../components/Header";

const DashboardPage  = lazy(() => import("./Dashboard"));
const AllDevices     = lazy(() => import("./AllDevices"));
const AttendancePage = lazy(() => import("./Attendance"));
const SettingsPage   = lazy(() => import("./Settings"));

function PageLoader() {
  return (
    <div className="page-loading">
      <div className="page-spinner" />
      <p>Loading...</p>
    </div>
  );
}

export default function AppShell() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = {
    dashboard:   <DashboardPage />,
    alldevices:  <AllDevices />,
    attendance:  <AttendancePage />,
    settings:    <SettingsPage />,
  };

  return (
    <div className={`shell${sidebarOpen ? "" : " sidebar-collapsed"}`}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="shell-main">
        <Header activePage={activePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="shell-content">
          <Suspense fallback={<PageLoader />}>
            {pages[activePage] || pages.dashboard}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
