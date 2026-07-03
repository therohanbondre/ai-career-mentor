'use client';

import { Button } from '@/components/ui/button';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Application error</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          A critical error occurred. Please refresh the page or try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </body>
    </html>
  );
}
