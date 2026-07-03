import Link from 'next/link';

import { Footer } from '@/components/layout/footer';
import { MarketingHeader } from '@/components/layout/marketing-header';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <AppShell header={<MarketingHeader />}>
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Enterprise scaffold</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{siteConfig.name}</h1>
          <p className="text-lg text-muted-foreground">{siteConfig.description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/api/health">Health check</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </AppShell>
  );
}
