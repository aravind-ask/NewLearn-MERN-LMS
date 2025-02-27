import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useLogoutMutation } from "../redux/services/authApi";
import { useGetUserStatusQuery } from "../redux/services/authApi"; // Add this import
import Popup from "./PopUp";
import { logout } from "@/redux/slices/authSlice";

export default function ProtectedRoute() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isBlocked, setIsBlocked] = useState(false);
  const [logoutMutation] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: userStatus, refetch } = useGetUserStatusQuery(
    {},
    {
      pollingInterval: 5000,
      skip: !user,
    }
  );

  useEffect(() => {
    if (userStatus?.isBlocked) {
      setIsBlocked(true);
    }
  }, [userStatus]);

  const handleClosePopup = async () => {
    if (user) {
      await logoutMutation({ userId: user.id });
      localStorage.removeItem("user");
      dispatch(logout());
      setIsBlocked(false);
      navigate("/login");
    }
  };

  if (isBlocked) {
    return (
      <Popup
        message="You are blocked by the admin."
        onClose={handleClosePopup}
      />
    );
  }

  if (user?.role === "admin") {
    return <Navigate to="/dashboard" />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}
