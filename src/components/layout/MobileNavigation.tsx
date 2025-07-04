import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Feed', icon: '🏠' },
  { path: '/scan', label: 'Scan', icon: '📱' },
  { path: '/map', label: 'Map', icon: '🗺️' },
  { path: '/claims', label: 'Claims', icon: '👻' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border z-50">
      <div className="flex justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="mobile"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 h-16 px-3 ${
                isActive 
                  ? 'text-primary glow-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}