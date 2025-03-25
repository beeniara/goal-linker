
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start md:gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="bg-primary text-primary-foreground p-1 rounded text-sm">TF</span>
            <span className="font-semibold">TaskFlow</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link to="/privacy" className="text-sm text-muted-foreground hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-sm text-muted-foreground hover:underline">
            Terms
          </Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:underline">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
};
