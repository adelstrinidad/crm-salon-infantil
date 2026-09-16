// Shared chrome for the unauthenticated screens (login, password recovery) so
// they read as one surface instead of three different cards.
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6 bg-card rounded-xl shadow-md p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-medium">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
