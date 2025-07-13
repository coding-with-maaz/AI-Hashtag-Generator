import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary shadow-md',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full flex-1 rounded-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-gradient-x transition-all duration-500 shadow-lg"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Add keyframes for animated gradient
const style = document.createElement('style');
style.innerHTML = `
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 2s linear infinite;
}
`;
if (typeof window !== 'undefined' && !document.getElementById('progress-gradient-style')) {
  style.id = 'progress-gradient-style';
  document.head.appendChild(style);
}

export { Progress };
