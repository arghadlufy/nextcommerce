import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto px-4 pb-4 pt-16 sm:p-6 md:pt-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
