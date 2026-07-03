import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>{siteConfig.name}</p>
        <p>{siteConfig.description}</p>
      </div>
    </footer>
  );
}
