import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useLogoutMutation } from "../redux/services/authApi";
import { useGetUserStatusQuery } from "../redux/services/authApi";
import Popup from "./PopUp";
import { logout } from "@/redux/slices/authSlice";
import { toast } from "@/hooks/use-toast";

export default function ProtectedRoute() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isBlocked, setIsBlocked] = useState(false);
  const [logoutMutation] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: userStatus, refetch } = useGetUserStatusQuery(
    {},
    {
      pollingInterval: 500000,
      skip: !user,
    }
  );

  useEffect(() => {
    if (userStatus?.isBlocked) {
      setIsBlocked(true);
      toast({
        title: "error",
        description: "You are blocked by the Admin!",
        variant: "destructive",
      });
    }
  }, [userStatus]);

  const handleClosePopup = async () => {
    if (user) {
      await logoutMutation({ userId: user.id });
      localStorage.removeItem("user");
      dispatch(logout());
      toast({
        title: "error",
        description: "You are blocked, logging out!",
        variant: "destructive",
      });
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
    navigate("/dashboard");
    return;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}
