import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const AuthGuard = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  return token ? <Navigate to="/" replace /> : <Outlet />;
};

export default AuthGuard;
