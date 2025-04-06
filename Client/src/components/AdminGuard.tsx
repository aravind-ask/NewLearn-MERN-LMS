import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface AdminGuardProps {
  component: React.ComponentType; // Component to render if the user is an admin
}

export default function AdminGuard({ component: Component }: AdminGuardProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Component />;
}
