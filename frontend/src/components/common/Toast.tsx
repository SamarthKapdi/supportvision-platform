// React Hot Toast is used, so we just export a dummy or custom wrapper if needed.
// For now, it's configured in main.tsx
import { toast } from 'react-hot-toast';

export const Toast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  dismiss: toast.dismiss,
};
