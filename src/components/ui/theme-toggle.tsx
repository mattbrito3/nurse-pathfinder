import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'icon' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  size = 'default',
  className 
}) => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 transition-all" />;
      case 'dark':
        return <Moon className="h-4 w-4 transition-all" />;
      default:
        return <Monitor className="h-4 w-4 transition-all" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Modo Escuro';
      case 'dark':
        return 'Modo Claro';
      default:
        return 'Sistema';
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : 'icon'}
        onClick={toggleTheme}
        className={cn(
          "relative transition-all duration-300 hover:scale-105",
          "hover:bg-primary/10 dark:hover:bg-primary/20",
          className
        )}
        title={getLabel()}
      >
        <div className="relative flex items-center justify-center">
          {theme === 'light' && (
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          )}
          {theme === 'dark' && (
            <Moon className="h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          )}
        </div>
        <span className="sr-only">{getLabel()}</span>
      </Button>
    );
  }

  if (variant === 'default') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          className
        )}
      >
        {getIcon()}
        <span className="hidden sm:inline">{getLabel()}</span>
      </Button>
    );
  }

  // Dropdown variant (for future implementation)
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("transition-all duration-300", className)}
    >
      {getIcon()}
    </Button>
  );
};

// Alternative compact toggle
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
        "bg-gray-200 dark:bg-gray-700",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      role="switch"
      aria-checked={theme === 'dark'}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300",
          "flex items-center justify-center",
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        )}
      >
        {theme === 'dark' ? (
          <Moon className="h-2.5 w-2.5 text-gray-700" />
        ) : (
          <Sun className="h-2.5 w-2.5 text-yellow-500" />
        )}
      </span>
    </button>
  );
};
