import { Sidebar } from "@/components/student/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-shell">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
