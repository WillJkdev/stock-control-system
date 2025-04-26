// components/ui/customToasts.ts
import { toast } from 'sonner';

export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
    classNames: {
      toast: 'bg-green-50 border-green-500 dark:bg-green-900/80 dark:border-green-700',
      title: 'text-green-800 dark:text-green-100',
      description: '!text-gray-700 dark:!text-green-200',
      icon: 'text-green-500 dark:text-green-300',
    },
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast.error(title, {
    description,
    classNames: {
      toast: 'bg-red-50 border-red-500 dark:bg-red-900/80 dark:border-red-700',
      title: 'text-red-800 dark:text-red-100',
      description: '!text-red-600 dark:!text-red-200',
      icon: 'text-red-500 dark:text-red-300',
    },
  });
};

// Ejemplo de otros tipos que podrías necesitar
export const showWarningToast = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    classNames: {
      toast: 'bg-amber-50 border-amber-500 dark:bg-amber-900/80 dark:border-amber-700',
      title: 'text-amber-800 dark:text-amber-100',
      description: '!text-amber-600 dark:!text-amber-200',
      icon: 'text-amber-500 dark:text-amber-300',
    },
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
    classNames: {
      toast: 'bg-blue-50 border-blue-500 dark:bg-blue-900/80 dark:border-blue-700',
      title: 'text-blue-800 dark:text-blue-100',
      description: '!text-blue-600 dark:!text-blue-200',
      icon: 'text-blue-500 dark:text-blue-300',
    },
  });
};
