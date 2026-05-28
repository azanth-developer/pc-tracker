import React, { useState, lazy, Suspense } from "react";
import Sidebar from "../components/Sidebar";
import Header  from "../components/Header";

const DashboardPage  = lazy(() => import("./Dashboard"));
const Employees      = lazy(() => import("./Employees"));
const AttendancePage = lazy(() => import("./Attendance"));
const Workstations   = lazy(() => import("./AllDevices")); // Reusing AllDevices as Workstations
const Analytics      = lazy(() => import("./Analytics"));
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
    dashboard:    <DashboardPage />,
    employees:    <Employees />,
    attendance:   <AttendancePage />,
    devices:      <Workstations />,
    analytics:    <Analytics />,
    settings:     <SettingsPage />,
  };

  return (
    <div className={`shell${sidebarOpen ? "" : " sidebar-collapsed"}`}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="shell-main">
        <Header 
          activePage={activePage} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          onSearch={() => {}} 
          setActivePage={setActivePage}
        />
        <main className="shell-content">
          <Suspense fallback={<PageLoader />}>
            {Object.keys(pages).includes(activePage) 
              ? React.cloneElement(pages[activePage], { setActivePage }) 
              : React.cloneElement(pages.dashboard, { setActivePage })}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
