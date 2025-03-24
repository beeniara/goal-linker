
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import { Menu, X, User, LogOut, Settings, ChevronDown, BarChart, Briefcase, CheckSquare, Flag, Bell } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart className="h-4 w-4 mr-2" /> },
    { path: '/projects', label: 'Projects', icon: <Briefcase className="h-4 w-4 mr-2" /> },
    { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4 mr-2" /> },
    { path: '/goals', label: 'Goals', icon: <Flag className="h-4 w-4 mr-2" /> },
    { path: '/reminders', label: 'Reminders', icon: <Bell className="h-4 w-4 mr-2" /> },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-6">
              <span className="text-xl font-bold">TaskFlow</span>
            </Link>
            
            {currentUser && !isMobile && (
              <nav className="hidden md:flex items-center space-x-1 md:space-x-2">
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant={location.pathname === link.path ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to={link.path} className="flex items-center">
                      {link.icon}
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            ) : (
              <>
                {isMobile ? (
                  <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Menu">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b">
                          <span className="text-lg font-semibold">Menu</span>
                          <Button variant="ghost" size="icon" onClick={closeMenu}>
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <nav className="flex flex-col space-y-2 flex-1">
                          {navLinks.map((link) => (
                            <Button
                              key={link.path}
                              variant={location.pathname === link.path ? "default" : "ghost"}
                              onClick={closeMenu}
                              asChild
                            >
                              <Link to={link.path} className="flex items-center justify-start">
                                {link.icon}
                                {link.label}
                              </Link>
                            </Button>
                          ))}
                        </nav>
                        <div className="pt-4 mt-4 border-t">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex cursor-pointer items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile?tab=settings" className="flex cursor-pointer items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
