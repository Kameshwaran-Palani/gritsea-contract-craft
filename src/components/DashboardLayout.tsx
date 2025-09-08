
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, FileText, Bot, CreditCard, Settings, LogOut, Menu, User, Users, Bookmark, Zap, PanelLeft } from 'lucide-react';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const {
    user,
    signOut
  } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigation = [{
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  }, {
    name: 'Contracts',
    href: '/contracts',
    icon: FileText
  }, {
    name: 'Templates',
    href: '/templates',
    icon: Bookmark
  }, {
    name: 'Revisions',
    href: '/revisions',
    icon: FileText
  }, {
    name: 'AI Prompt',
    href: '/ai-prompt',
    icon: Zap
  }, {
    name: 'Community',
    href: '/community',
    icon: Users
  }, {
    name: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot
  }, {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard
  }, {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }];
  const isActive = (href: string) => location.pathname === href;
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const Sidebar = ({
    mobile = false
  }: {
    mobile?: boolean;
  }) => <div className="flex h-full flex-col bg-card border-r">
      {!mobile && <div className="px-4 border-b py-[13px]">
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`rounded-2xl ${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'}`}>
            <PanelLeft className="h-5 w-5" />
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>}

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map(item => {
        const Icon = item.icon;
        return <Link key={item.name} to={item.href} onClick={() => mobile && setSidebarOpen(false)} className={`group flex items-center ${sidebarCollapsed && !mobile ? 'px-3 py-3 justify-center' : 'px-3 py-2'} text-sm font-medium rounded-2xl transition-all duration-200 ${isActive(item.href) ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`} title={sidebarCollapsed && !mobile ? item.name : undefined}>
              <Icon className={`h-5 w-5 shrink-0 ${sidebarCollapsed && !mobile ? '' : 'mr-3'}`} />
              {(!sidebarCollapsed || mobile) && item.name}
            </Link>;
      })}
      </nav>

      {(!sidebarCollapsed || mobile) && user && <div className="border-t p-4">
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
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground rounded-2xl" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>}

      {sidebarCollapsed && !mobile && user && <div className="border-t p-4 flex justify-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-white text-xs">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>}
    </div>;
  return <div className="flex h-screen bg-background w-full">
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 z-30 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <Sidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <header className="grid grid-cols-3 h-16 shrink-0 items-center border-b bg-card/50 backdrop-blur-sm px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-start ">
            <Button variant="ghost" size="sm" className="lg:hidden rounded-2xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-sm font-heading">A</span>
              </div>
              <span className="text-xl font-bold gradient-text font-heading">Agrezy</span>
            </Link>
          </div>

          <div></div>

          <div className="flex items-center justify-end space-x-4">
            <Badge variant="outline" className="hidden sm:flex">
              3 free contracts left
            </Badge>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="rounded-2xl">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/20">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>;
};
export default DashboardLayout;
