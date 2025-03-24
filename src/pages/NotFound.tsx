
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <Button asChild>
              <Link to="/">
                Return to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Project Linker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
