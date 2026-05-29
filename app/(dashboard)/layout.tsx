import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      <Sidebar />
      {/* min-w-0 lets flex children (tables) shrink and scroll instead of overflowing */}
      <main className="flex-1 min-w-0 bg-background p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
