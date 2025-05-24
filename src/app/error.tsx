'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001085] via-[#006bff] to-[#00d2ff]">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-lg shadow-2xl text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-white/80 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="space-x-4">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
} 