import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyOtpMutation } from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";

interface OTPModalProps {
  email: string;
  open: boolean;
  onClose: () => void;
}

export function OTPModal({ email, open, onClose }: OTPModalProps) {
  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const handleResend = () => {
    setTimer(60);
    setIsResendDisabled(true);
  };

  const handleSubmit = () => {
    try {
      if (!otp) {
        console.log("OTP is required");
        setFormErrors("OTP is required");
        return;
      }
      verifyOtp({ email, otp }).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white opacity-100">
        <AlertDialogHeader>
          <AlertDialogTitle>Enter OTP</AlertDialogTitle>
          <AlertDialogDescription>
            Please enter the OTP sent to your email. The OTP is valid for 1
            minute.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
          />
          <div>Time remaining: {timer}s</div>
        </div>
        <AlertDialogFooter>
          <Button onClick={handleResend} disabled={isResendDisabled}>
            Resend OTP
          </Button>
          <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
        {formErrors && <div className="text-red-500">{formErrors}</div>}
        {error && (
          <p>
            {(error as { data?: { message?: string } }).data?.message ||
              "OTP validation failed"}
          </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
