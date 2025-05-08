import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useSendOTPMutation,
  useVerifyOtpMutation,
} from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

interface OTPModalProps {
  email: string;
  open: boolean;
  onClose: () => void;
  fromLogin?: boolean;
  onVerifySuccess?: () => void; // New callback for login flow
}

export function OTPModal({
  email,
  open,
  onClose,
  fromLogin = false,
  onVerifySuccess,
}: OTPModalProps) {
  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const navigate = useNavigate();
  const [sendOTP] = useSendOTPMutation();
  const { toast } = useToast();

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

  const handleResend = async () => {
    try {
      await sendOTP({ email }).unwrap();
      setTimer(60);
      setIsResendDisabled(true);
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email.",
      });
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      setFormErrors("Failed to resend OTP");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!otp) {
        console.log("OTP is required");
        setFormErrors("OTP is required");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter the OTP.",
        });
        return;
      }
      await verifyOtp({ email, otp }).unwrap();
      toast({
        title: "Success",
        description: "OTP verified successfully!",
      });
      setOtp("");
      setFormErrors("");
      if (fromLogin && onVerifySuccess) {
        onVerifySuccess(); // Trigger login in parent component
      } else {
        onClose();
        if (!fromLogin) {
          navigate("/login");
        }
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      setFormErrors(
        (err as any).data?.message || "Invalid OTP. Please try again."
      );
      toast({
        variant: "destructive",
        title: "Error",
        description:
          (err as any).data?.message || "Invalid OTP. Please try again.",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white opacity-100">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
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
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <div>Time remaining: {timer}s</div>
        </div>
        <AlertDialogFooter>
          <Button onClick={handleResend} disabled={isResendDisabled}>
            Resend OTP
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Submit"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
