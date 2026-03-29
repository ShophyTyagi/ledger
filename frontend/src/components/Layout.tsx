import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div className="main-content">
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
