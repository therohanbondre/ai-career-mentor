import { AppHeader } from '@/components/layout/app-header';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell header={<AppHeader />}>{children}</AppShell>;
}
