import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ProtectedRoute = () => {
  const location = useLocation();
  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const redirectPath = user?.role === "admin" ? "/dashboard" : "/";

  return <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
