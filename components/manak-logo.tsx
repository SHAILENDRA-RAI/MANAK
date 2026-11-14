import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

const sizeConfig = {
  sm: { icon: 'h-7 w-7', text: 'text-lg', sub: 'text-[10px]' },
  md: { icon: 'h-9 w-9', text: 'text-xl', sub: 'text-[11px]' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl', sub: 'text-xs' },
};

export function ManakLogo({
  className,
  iconOnly = false,
  size = 'md',
  variant = 'light',
}: LogoProps) {
  const cfg = sizeConfig[size];
  const textColor = variant === 'light' ? 'text-primary' : 'text-white';
  const subColor = variant === 'light' ? 'text-muted-foreground' : 'text-white/60';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md',
          cfg.icon
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-2/3 w-2/3 text-white"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-6h6v6" />
          <circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <path d="M19 10l2-2-2-2" opacity="0.7" />
          <path d="M19 14l2 2-2 2" opacity="0.7" />
        </svg>
      </div>
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight', cfg.text, textColor)}>
            MANAK
          </span>
          <span className={cn('font-medium tracking-wide uppercase', cfg.sub, subColor)}>
            Valuation Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
