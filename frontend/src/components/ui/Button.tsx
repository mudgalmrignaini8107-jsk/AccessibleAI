'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'ghost';
  colorTheme?: 'pink' | 'lavender' | 'sky' | 'mint' | 'peach';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', colorTheme = 'lavender', size = 'md', fullWidth = false, ...props }, ref) => {
    // Theme styling configurations
    const themes = {
      pink: {
        bg: 'bg-brand-pink text-white hover:bg-[#ff55bb] active:bg-[#e044a3] focus:ring-brand-pink/30 shadow-[0_4px_14px_0_rgba(255,110,199,0.35)] hover:shadow-[0_6px_20px_0_rgba(255,110,199,0.5)]',
        outline: 'border-2 border-brand-pink text-brand-pink hover:bg-brand-pink/10 focus:ring-brand-pink/20',
        glass: 'bg-brand-pink/20 text-slate-800 border border-brand-pink/30 hover:bg-brand-pink/30 active:bg-brand-pink/40',
      },
      lavender: {
        bg: 'bg-brand-lavender text-white hover:bg-[#a273f5] active:bg-[#915ee3] focus:ring-brand-lavender/30 shadow-[0_4px_14px_0_rgba(179,136,255,0.35)] hover:shadow-[0_6px_20px_0_rgba(179,136,255,0.5)]',
        outline: 'border-2 border-brand-lavender text-[#8C52FF] hover:bg-brand-lavender/10 focus:ring-brand-lavender/20',
        glass: 'bg-brand-lavender/20 text-slate-800 border border-brand-lavender/30 hover:bg-brand-lavender/30 active:bg-brand-lavender/40',
      },
      sky: {
        bg: 'bg-brand-sky text-white hover:bg-[#5bb7f5] active:bg-[#48a5e3] focus:ring-brand-sky/30 shadow-[0_4px_14px_0_rgba(110,198,255,0.35)] hover:shadow-[0_6px_20px_0_rgba(110,198,255,0.5)]',
        outline: 'border-2 border-brand-sky text-brand-sky hover:bg-brand-sky/10 focus:ring-brand-sky/20',
        glass: 'bg-brand-sky/20 text-slate-800 border border-brand-sky/30 hover:bg-brand-sky/30 active:bg-brand-sky/40',
      },
      mint: {
        bg: 'bg-brand-mint text-emerald-900 hover:bg-[#6be4b7] active:bg-[#57d0a3] focus:ring-brand-mint/30 shadow-[0_4px_14px_0_rgba(126,242,198,0.35)] hover:shadow-[0_6px_20px_0_rgba(126,242,198,0.5)]',
        outline: 'border-2 border-brand-mint text-emerald-800 hover:bg-brand-mint/10 focus:ring-brand-mint/20',
        glass: 'bg-brand-mint/20 text-emerald-900 border border-brand-mint/30 hover:bg-brand-mint/30 active:bg-brand-mint/40',
      },
      peach: {
        bg: 'bg-sec-peach text-amber-950 hover:bg-[#ffd194] active:bg-[#ebb573] focus:ring-sec-peach/30 shadow-[0_4px_14px_0_rgba(255,214,165,0.35)] hover:shadow-[0_6px_20px_0_rgba(255,214,165,0.5)]',
        outline: 'border-2 border-sec-peach text-amber-900 hover:bg-sec-peach/10 focus:ring-sec-peach/20',
        glass: 'bg-sec-peach/20 text-amber-950 border border-sec-peach/30 hover:bg-sec-peach/30 active:bg-sec-peach/40',
      },
    };

    const sizeClasses = {
      sm: 'px-4 py-1.5 text-xs font-semibold rounded-full',
      md: 'px-6 py-2.5 text-sm font-bold rounded-full',
      lg: 'px-8 py-3.5 text-base font-bold rounded-full',
    };

    let variantClasses = '';
    if (variant === 'primary') {
      variantClasses = themes[colorTheme].bg;
    } else if (variant === 'outline') {
      variantClasses = themes[colorTheme].outline;
    } else if (variant === 'glass') {
      variantClasses = themes[colorTheme].glass;
    } else if (variant === 'secondary') {
      variantClasses = 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-100 shadow-sm';
    } else if (variant === 'ghost') {
      variantClasses = 'bg-transparent text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 focus:ring-slate-100';
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98 focus:outline-none focus:ring-4 font-sans tracking-wide cursor-pointer',
          sizeClasses[size],
          variantClasses,
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
