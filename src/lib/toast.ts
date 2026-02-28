import { toast } from 'sonner';

export const showToast = {
  success: (message: string, options?: { description?: string }) => {
    toast.success(message, { description: options?.description, duration: 3000 });
  },
  error: (message: string, options?: { description?: string; retry?: () => void }) => {
    toast.error(message, {
      description: options?.description,
      duration: 5000,
      action: options?.retry ? { label: 'Retry', onClick: options.retry } : undefined,
    });
  },
  info: (message: string) => {
    toast.info(message, { duration: 4000 });
  },
  warning: (message: string) => {
    toast.warning(message, { duration: 4000 });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => {
    return toast.promise(promise, messages);
  },
};
