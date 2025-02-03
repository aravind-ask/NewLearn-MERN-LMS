import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSendOTPMutation,
} from "@/redux/services/authApi";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordChange({ eMail }: { eMail: string | undefined }) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [sendOtp] = useSendOTPMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [formData, setFormData] = useState({
    curPassword: "",
    newPassword: "",
    confPassword: "",
    otp: "",
  });
  const [email, setEmail] = useState(eMail);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { toast } = useToast();
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowConfPassword = () => {
    setShowConfPassword(!showConfPassword);
  };

  const handleForgotPasswordClick = () => {
    setIsChangePasswordModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async () => {
    try {
      if (!formData.curPassword) {
        setErrors({ ...errors, curPassword: "Current password is required" });
        return;
      }
      if (!formData.newPassword) {
        setErrors({ ...errors, newPassword: "New password is required" });
        return;
      }
      if (!formData.confPassword) {
        setErrors({ ...errors, confPassword: "Confirm password is required" });
        return;
      }
      if (formData.newPassword !== formData.confPassword) {
        setErrors({ ...errors, confPassword: "Passwords do not match" });
        return;
      }
      await resetPassword({
        curPassword: formData.curPassword,
        newPassword: formData.newPassword,
      }).unwrap();
      setIsChangePasswordModalOpen(false);
      setIsForgotPasswordModalOpen(false);
      setFormData({
        ...formData,
        curPassword: "",
        newPassword: "",
        confPassword: "",
        otp: "",
      });
      toast({ title: "Password changed successfully!" });
    } catch (error: any) {
      setErrors({
        ...errors,
        curPassword: error.data?.message || "Error changing password",
      });
      console.error("Error changing password", error);
    }
  };

  const handleSendOtp = async () => {
    try {
      if (!email) {
        setErrors({ ...errors, email: "Email is required" });
        return;
      }
      await sendOtp({ email }).unwrap();
      setTimer(60);
      setIsResendDisabled(true);
      setIsOtpSent(true);
      toast({ title: "OTP sent successfully!" });
    } catch (error: any) {
      setErrors({ ...errors, otp: error.data?.message || "Error sending OTP" });
      console.error("Error sending OTP", error);
    }
  };

  const handleSubmitOtp = async () => {
    try {
      if (!formData.otp) {
        setErrors({ ...errors, otp: "OTP is required" });
        return;
      }
      if (!formData.newPassword) {
        setErrors({ ...errors, newPassword: "New password is required" });
        return;
      }
      if (!formData.confPassword) {
        setErrors({ ...errors, confPassword: "Confirm password is required" });
        return;
      }
      if (formData.newPassword !== formData.confPassword) {
        setErrors({ ...errors, confPassword: "Passwords do not match" });
        return;
      }
      await forgotPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      }).unwrap();
      setFormData({
        ...formData,
        curPassword: "",
        newPassword: "",
        confPassword: "",
        otp: "",
      });
      setIsForgotPasswordModalOpen(false);
      setIsChangePasswordModalOpen(false);
      setIsOtpSent(false);
      toast({ title: "OTP submitted successfully!" });
    } catch (error: any) {
      setErrors({
        ...errors,
        otp: error.data?.message || "Error submitting OTP",
      });
      console.error("Error submitting OTP", error);
    }
  };

  return (
    <>
      <Dialog
        open={isChangePasswordModalOpen}
        onOpenChange={setIsChangePasswordModalOpen}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Change Password</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {errors.formError && (
                <p className="text-red-500 col-span-4">{errors.formError}</p>
              )}
              <Label htmlFor="curPassword" className="text-right">
                Password
              </Label>
              <div className="relative col-span-3">
                <Input
                  id="curPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  name="curPassword"
                  placeholder="Enter your Current Password"
                  value={formData.curPassword}
                  onChange={handleChange}
                  className={`col-span-3 ${
                    errors.curPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.curPassword && (
                <p className="text-red-500 col-span-4">{errors.curPassword}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                placeholder="Enter new Password"
                onChange={handleChange}
                className={`col-span-3 ${
                  errors.newPassword ? "border-red-500" : ""
                }`}
              />
              {errors.newPassword && (
                <p className="text-red-500 col-span-4">{errors.newPassword}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confPassword" className="text-right">
                Confirm Password
              </Label>
              <div className="relative col-span-3">
                <Input
                  id="confPassword"
                  type={showConfPassword ? "text" : "password"}
                  required
                  name="confPassword"
                  placeholder="Re-Enter new Password"
                  value={formData.confPassword}
                  onChange={handleChange}
                  className={`col-span-3 ${
                    errors.confPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleShowConfPassword}
                  className="absolute inset-y-0 right-0 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showConfPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confPassword && (
                <p className="text-red-500 col-span-4">{errors.confPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <span
              className="text-blue-500 cursor-pointer"
              onClick={handleForgotPasswordClick}
            >
              Forgot Current Password?
            </span>{" "}
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
      >
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            {!isOtpSent ? (
              <DialogDescription>
                Enter your email to receive a one-time password (OTP).
              </DialogDescription>
            ) : (
              <DialogDescription>
                Enter the OTP sent to your email.
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Add your forgot password form here */}
          <div className="grid gap-4 py-4">
            {!isOtpSent ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                  />
                  {errors.email && (
                    <p className="text-red-500 col-span-4">{errors.email}</p>
                  )}
                  {errors.otp && (
                    <p className="text-red-500 col-span-4">{errors.otp}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleSendOtp}>Send OTP</Button>
                  <Button onClick={() => setIsForgotPasswordModalOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  {errors.otp && (
                    <p className="text-red-500 col-span-4">{errors.otp}</p>
                  )}
                  <Label htmlFor="otp" className="text-right">
                    OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className={`col-span-3 ${
                      errors.otp ? "border-red-500" : ""
                    }`}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newPassword" className="text-right">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`col-span-3 ${
                      errors.newPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 col-span-4">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confPassword" className="text-right">
                    Confirm Password
                  </Label>
                  <Input
                    id="confPassword"
                    type="text"
                    name="confPassword"
                    value={formData.confPassword}
                    onChange={handleChange}
                    className={`col-span-3 ${
                      errors.confPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.confPassword && (
                    <p className="text-red-500 col-span-4">
                      {errors.confPassword}
                    </p>
                  )}
                </div>
                <div>Time remaining: {timer}s</div>
                <DialogFooter>
                  <Button onClick={handleResend} disabled={isResendDisabled}>
                    Resend OTP
                  </Button>
                  <Button onClick={handleSubmitOtp}>Submit OTP</Button>
                  <Button onClick={() => setIsForgotPasswordModalOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
