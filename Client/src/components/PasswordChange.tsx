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
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordChange({ eMail }: { eMail: string | undefined }) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [sendOtp] = useSendOTPMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    curPassword: "",
    newPassword: "",
    confPassword: "",
    otp: "",
  });
  const [email, setEmail] = useState(eMail);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { toast } = useToast();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = () => {
    setIsChangePasswordModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleChangePassword = async () => {
    try {
      if (
        !formData.curPassword ||
        !formData.newPassword ||
        !formData.confPassword
      ) {
        setErrors({ ...errors, formError: "Please fill all the fields" });
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
    } catch (error) {
      console.error("Error changing password", error);
    }
  };

  const handleSendOtp = async () => {
    try {
      await sendOtp({ email }).unwrap();
      setIsOtpSent(true);
      toast({ title: "OTP sent successfully!" });
    } catch (error) {
      setErrors({ ...errors, otp: "Error sending OTP" });
      console.error("Error sending OTP", error);
    }
  };

  const handleSubmitOtp = async () => {
    try {
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
    } catch (error) {
      setErrors({ ...errors, otp: "Error submitting OTP" });
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
              {/* <Input
                id="curPassword"
                type="password"
                name="curPassword"
                value={formData.curPassword}
                onChange={handleChange}
                className="col-span-3"
              /> */}
              <div className="relative">
                <Input
                  id="curPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  name="curPassword"
                  placeholder="Enter your Current Password"
                  value={formData.curPassword}
                  onChange={handleChange}
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
                className="col-span-3"
              />
              {errors.newPassword && (
                <p className="text-red-500 col-span-4">{errors.newPassword}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confPassword" className="text-right">
                Confirm Password
              </Label>
              {/* <Input
                id="confPassword"
                type="text"
                name="confPassword"
                value={formData.confPassword}
                onChange={handleChange}
                className="col-span-3"
              /> */}
              <div className="relative">
                <Input
                  id="confPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  name="confPassword"
                  placeholder="Re-Enter new Password"
                  value={formData.confPassword}
                  onChange={handleChange}
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
                  <Label htmlFor="otp" className="text-right">
                    OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                  {errors.otp && (
                    <p className="text-red-500 col-span-4">{errors.otp}</p>
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
                    onChange={handleChange}
                    className="col-span-3"
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
                    className="col-span-3"
                  />
                  {errors.confPassword && (
                    <p className="text-red-500 col-span-4">
                      {errors.confPassword}
                    </p>
                  )}
                </div>
                <DialogFooter>
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
