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
import { useSendOTPMutation, useVerifyOtpMutation } from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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
  const [sendOTP] = useSendOTPMutation();

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
    sendOTP({ email });
    setTimer(60);
    setIsResendDisabled(true);
  };

  const handleSubmit = async () => {
    try {
      if (!otp) {
        console.log("OTP is required");
        setFormErrors("OTP is required");
        return;
      }
      await verifyOtp({ email, otp }).unwrap();
      toast.success("OTP verified successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed", err);
      // setFormErrors("Invalid OTP. Please try again.");
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
          {formErrors && <div className="text-red-500">{formErrors}</div>}
          {error && (
            <p className="text-red-500">
              {(error as { data?: { message?: string } }).data?.message ||
                "OTP validation failed"}
            </p>
          )}
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
          <Button onClick={handleSubmit}>Submit</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
