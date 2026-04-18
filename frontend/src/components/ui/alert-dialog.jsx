import React from 'react';
import { cn } from '@/lib/utils';

export function AlertDialog({ open, onOpenChange, children }) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

const AlertDialogContext = React.createContext({
  open: false,
  onOpenChange: () => {},
});

function useAlertDialogContext() {
  return React.useContext(AlertDialogContext);
}

export function AlertDialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = useAlertDialogContext();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('space-y-2 text-left', className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }) {
  return <div className={cn('mt-4 flex justify-end gap-2', className)} {...props} />;
}

export function AlertDialogCancel({ className, onClick, ...props }) {
  const { onOpenChange } = useAlertDialogContext();

  return (
    <button
      type="button"
      className={cn('inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm', className)}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, onClick, ...props }) {
  const { onOpenChange } = useAlertDialogContext();

  return (
    <button
      type="button"
      className={cn('inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm text-primary-foreground', className)}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
}
