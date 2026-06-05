import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background lg:flex-row">
      <Sidebar />
      {/* main is the scroll container (h-screen shell). min-w-0 lets tables shrink;
          overflow-y-auto guarantees the page bottom is always reachable and lets
          the form's sticky action bar pin to the visible bottom. */}
      <main className="min-w-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
