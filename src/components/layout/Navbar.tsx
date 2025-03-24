
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Bell, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

export const Navbar = () => {
  const { currentUser, userData, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const getInitials = () => {
    if (!userData?.displayName) return 'U';
    return userData.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Projects', path: '/projects' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Goals', path: '/goals' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="font-semibold text-xl flex items-center space-x-2">
            <span className="bg-primary text-primary-foreground p-1 rounded text-sm">PL</span>
            <span>Project Linker</span>
          </Link>
          
          {!isMobile && (
            <nav className="ml-6 hidden md:block">
              <ul className="flex space-x-4">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        
        {currentUser ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    2
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  <DropdownMenuItem className="p-4 cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Task due soon</span>
                      <span className="text-sm text-muted-foreground">Your task "Finish project report" is due tomorrow</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-4 cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">New collaboration</span>
                      <span className="text-sm text-muted-foreground">Alex has invited you to collaborate on "Marketing Campaign"</span>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || 'User'} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/settings')}
                  className="cursor-pointer"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <span className="font-semibold">Menu</span>
                      <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <nav className="flex-1 mt-4">
                      <ul className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                          <li key={link.path}>
                            <Link 
                              to={link.path}
                              className="flex items-center px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="mt-auto pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm font-medium text-foreground"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
