import { ToastProvider as ShadcnToastProvider } from "@/components/ui/toast";

const ToastProvider = ({ children }) => {
  return <ShadcnToastProvider>{children}</ShadcnToastProvider>;
};

export default ToastProvider;
