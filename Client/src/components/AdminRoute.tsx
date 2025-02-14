import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const AdminRoute: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role == "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default AdminRoute;
