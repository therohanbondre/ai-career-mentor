import { env } from '@/config/env';

export const siteConfig = {
  name: env.appName,
  url: env.appUrl,
  description: 'Production-ready enterprise application scaffold.',
  links: {
    github: 'https://github.com',
  },
  nav: {
    marketing: [
      { href: '/', label: 'Home' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
    app: [{ href: '/dashboard', label: 'Dashboard' }],
  },
} as const;
