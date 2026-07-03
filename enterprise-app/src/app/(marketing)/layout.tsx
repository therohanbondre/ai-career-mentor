import { AppShell } from '@/components/layout/app-shell';
import { MarketingHeader } from '@/components/layout/marketing-header';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <AppShell header={<MarketingHeader />}>{children}</AppShell>;
}
