import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PublicGuardProps {
  component: React.ComponentType; // Component to render if the user is not an admin
}

export default function PublicGuard({
  component: Component,
}: PublicGuardProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user && user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Component />;
}
