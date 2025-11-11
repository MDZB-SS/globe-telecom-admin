import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface ToastProps {
  title: string;
  description?: string;
  id?: string;
  action?: string; // Action qui a déclenché la notification
}

export const toastSuccess = ({ title, description, id, action }: ToastProps) => {
  // Ajouter à l'historique des notifications
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('addNotification', {
      detail: { title, description, type: 'success', action }
    });
    window.dispatchEvent(event);
  }

  return toast.success(title, {
    description,
    id,
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    style: {
      border: '1px solid #10b981',
      borderLeft: '4px solid #10b981',
    },
  });
};

export const toastError = ({ title, description, id, action }: ToastProps) => {
  // Ajouter à l'historique des notifications
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('addNotification', {
      detail: { title, description, type: 'error', action }
    });
    window.dispatchEvent(event);
  }

  return toast.error(title, {
    description,
    id,
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    style: {
      border: '1px solid #ef4444',
      borderLeft: '4px solid #ef4444',
    },
  });
};

export const toastInfo = ({ title, description, id, action }: ToastProps) => {
  // Ajouter à l'historique des notifications
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('addNotification', {
      detail: { title, description, type: 'info', action }
    });
    window.dispatchEvent(event);
  }

  return toast.info(title, {
    description,
    id,
    icon: <Info className="h-5 w-5 text-blue-600" />,
    style: {
      border: '1px solid #3b82f6',
      borderLeft: '4px solid #3b82f6',
    },
  });
};

export const toastWarning = ({ title, description, id, action }: ToastProps) => {
  // Ajouter à l'historique des notifications
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('addNotification', {
      detail: { title, description, type: 'warning', action }
    });
    window.dispatchEvent(event);
  }

  return toast.warning(title, {
    description,
    id,
    icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    style: {
      border: '1px solid #f59e0b',
      borderLeft: '4px solid #f59e0b',
    },
  });
};

export const toastLoading = ({ title, description, id, action }: ToastProps) => {
  // Les notifications de loading ne sont pas ajoutées à l'historique automatiquement
  // car elles sont temporaires et remplacées par success/error
  
  return toast.loading(title, {
    description,
    id,
    icon: <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />,
    style: {
      border: '1px solid #3b82f6',
      borderLeft: '4px solid #3b82f6',
    },
    duration: Infinity,
  });
};
