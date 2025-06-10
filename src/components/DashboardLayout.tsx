
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  FileText, 
  Bot, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  Home,
  User,
  Users,
  Bookmark,
  Zap
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contracts', href: '/contracts', icon: FileText },
    { name: 'Templates', href: '/templates', icon: Bookmark },
    { name: 'AI Prompt', href: '/prompt', icon: Zap },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-sm font-heading">A</span>
          </div>
          <span className="text-xl font-bold gradient-text font-heading">Agrezy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-white">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">Free Plan</Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground rounded-2xl"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center border-b bg-card/50 backdrop-blur-sm px-4 lg:px-8 sticky top-0 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden rounded-2xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 justify-between items-center ml-4 lg:ml-0">
            <div className="flex items-center space-x-4">
              <Link to="/" className="lg:hidden">
                <Button variant="ghost" size="sm" className="rounded-2xl">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:flex">
                3 free contracts left
              </Badge>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="rounded-2xl">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/20">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
