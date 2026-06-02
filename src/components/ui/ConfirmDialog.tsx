import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-[fadeIn_0.15s_ease-out]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          bg-canvas rounded-xl shadow-lg p-6 w-[calc(100vw-2rem)] max-w-sm
          animate-[toast-in_0.2s_ease-out]">
          <AlertDialog.Title className="text-lg font-semibold text-ink mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-ink-body leading-relaxed mb-6">
            {description}
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 text-sm font-medium text-ink-muted rounded-lg
                hover:bg-surface-card transition-colors active:scale-[0.98]">
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors active:scale-[0.98]
                  ${variant === 'danger' ? 'bg-error hover:bg-red-700' : 'bg-primary hover:bg-primary-active'}`}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}