type AppShellProps = {
  children: React.ReactNode;
  header: React.ReactNode;
};

export function AppShell({ children, header }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header}
      <main className="flex-1">{children}</main>
    </div>
  );
}
