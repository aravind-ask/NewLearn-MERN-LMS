import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useLogoutMutation } from "../redux/services/authApi";
import Popup from "./PopUp"; 

export default function ProtectedRoute() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isBlocked, setIsBlocked] = useState(false);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isBlocked) {
      setIsBlocked(true);
    }
  }, [user]);

  const handleClosePopup = async () => {
    setIsBlocked(false);
    if (user) {
      await logout({ userId: user.id }).unwrap();
      localStorage.removeItem("user");
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
