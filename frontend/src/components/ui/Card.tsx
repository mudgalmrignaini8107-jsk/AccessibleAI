'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  accent?: 'pink' | 'lavender' | 'sky' | 'mint' | 'peach' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverEffect = true, accent = 'none', padding = 'md', ...props }, ref) => {
    
    const accentColors = {
      pink: 'before:bg-brand-pink',
      lavender: 'before:bg-brand-lavender',
      sky: 'before:bg-brand-sky',
      mint: 'before:bg-brand-mint',
      peach: 'before:bg-sec-peach',
      none: '',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8 md:p-10',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel relative overflow-hidden transition-all duration-300',
          hoverEffect ? 'glass-panel-hover' : '',
          accent !== 'none' ? 'before:content-[""] before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5' : '',
          accentColors[accent],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
