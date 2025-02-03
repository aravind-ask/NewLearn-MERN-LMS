import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log("Current User: ", user);
  if (user?.role === "admin") {
    <Navigate to="/dashboard" />;
  }
  return user ? <Outlet /> : <Navigate to="/login" />;
}

