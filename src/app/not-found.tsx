import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001085] via-[#006bff] to-[#00d2ff]">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-lg shadow-2xl text-center max-w-md">
        <h2 className="text-4xl font-bold text-white mb-4">404</h2>
        <h3 className="text-2xl font-semibold text-white mb-4">Page Not Found</h3>
        <p className="text-white/80 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 