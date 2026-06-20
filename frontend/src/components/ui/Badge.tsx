'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'glass';
  colorTheme?: 'pink' | 'lavender' | 'sky' | 'mint' | 'peach';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, children, variant = 'glass', colorTheme = 'lavender', ...props }, ref) => {
    
    const themes = {
      pink: {
        solid: 'bg-brand-pink text-white',
        outline: 'border border-brand-pink text-brand-pink',
        glass: 'bg-brand-pink/10 text-brand-pink border border-brand-pink/20',
      },
      lavender: {
        solid: 'bg-brand-lavender text-white',
        outline: 'border border-brand-lavender text-[#8C52FF]',
        glass: 'bg-brand-lavender/10 text-[#8C52FF] border border-brand-lavender/20',
      },
      sky: {
        solid: 'bg-brand-sky text-white',
        outline: 'border border-brand-sky text-brand-sky',
        glass: 'bg-brand-sky/10 text-brand-sky border border-brand-sky/20',
      },
      mint: {
        solid: 'bg-brand-mint text-emerald-950',
        outline: 'border border-brand-mint text-emerald-800',
        glass: 'bg-brand-mint/15 text-emerald-800 border border-brand-mint/25',
      },
      peach: {
        solid: 'bg-sec-peach text-amber-950',
        outline: 'border border-sec-peach text-amber-950',
        glass: 'bg-sec-peach/15 text-amber-900 border border-sec-peach/25',
      },
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-colors duration-200 select-none font-sans',
          themes[colorTheme][variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
