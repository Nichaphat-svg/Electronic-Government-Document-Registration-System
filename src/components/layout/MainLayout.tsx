import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Main content: adjust padding for mobile header and desktop sidebar */}
      <main className="min-h-screen p-4 pt-20 lg:ml-64 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
