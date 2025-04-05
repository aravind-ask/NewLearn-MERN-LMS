import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  useForgotPasswordMutation,
  useLoginMutation,
  useSendOTPMutation,
} from "@/redux/services/authApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import GoogleAuth from "@/components/OAuth";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { OTPModal } from "@/components/otpModal";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

export default function Component() {
  const [sendOtp] = useSendOTPMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.error) {
      setFormErrors(location.state.error);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormErrors("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = () => {
    setIsOtpSent(false);
    setIsForgotPasswordModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.email || !form.password) {
        setFormErrors("All fields are required");
        return;
      }
      const response = await login(form).unwrap();
      console.log("Login Response:", response);

      if (response?.data?.requiresVerification) {
        setIsOtpModalOpen(true);
        toast({
          title: "Verification Required",
          description: "Please verify your email with the OTP sent.",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        if (response?.data?.user?.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login Error", err);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.data?.message || "Invalid credentials",
      });
    }
  };

  const handleSendOtp = async () => {
    setIsOtpSent(false);
    setErrors({});
    setFormData({ otp: "", newPassword: "", confPassword: "" });
    if (!email) {
      setErrors({ ...errors, email: "Email is required" });
      return;
    }
    try {
      await sendOtp({ email }).unwrap();
      setIsOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the OTP.",
      });
    } catch (error) {
      setErrors({ ...errors, otp: "Error sending OTP" });
      console.error("Error sending OTP", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP",
      });
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
        newPassword: "",
        confPassword: "",
        otp: "",
      });
      setIsForgotPasswordModalOpen(false);
      setIsOtpSent(false);
      toast({
        title: "Success",
        description: "Password reset successfully!",
      });
    } catch (error) {
      setErrors({ ...errors, otp: "Error submitting OTP" });
      console.error("Error submitting OTP", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-8 lg:py-0"
    >
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center mb-8 lg:mb-0 lg:p-8"
      >
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome Back!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-md mx-auto">
            Unlock your potential with our world-class learning platform.
          </p>
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8"
      >
        <Card className="w-full max-w-md shadow-lg rounded-lg bg-white">
          <CardHeader className="space-y-1 p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Login
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              Enter your email and password to login
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <p className="text-red-500 text-sm">
                  {(error as any).data?.message || "Login failed"}
                </p>
              )}
              {formErrors && (
                <p className="text-red-500 text-sm">{formErrors}</p>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="Enter your Email"
                    onChange={handleChange}
                    className={`w-full ${
                      formErrors ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your Password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full ${
                        formErrors ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="w-full">
                  <GoogleAuth />
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-2">
                  <span>
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Register
                    </Link>
                  </span>
                  <span
                    className="cursor-pointer text-teal-600 hover:text-teal-700 transition-colors"
                    onClick={handleForgotPasswordClick}
                  >
                    Forgot password?
                  </span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
      >
        <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Forgot Password
            </DialogTitle>
            {!isOtpSent ? (
              <DialogDescription className="text-gray-600">
                Enter your email to receive an OTP.
              </DialogDescription>
            ) : (
              <DialogDescription className="text-gray-600">
                Enter the OTP sent to your email.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!isOtpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-gray-300"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSendOtp}
                    className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white"
                  >
                    Send OTP
                  </Button>
                  <Button
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                    className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700">
                    OTP
                  </Label>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    value={formData.otp}
                    onChange={(value) =>
                      setFormData({ ...formData, otp: value })
                    }
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
                  {errors.otp && (
                    <p className="text-red-500 text-sm">{errors.otp}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleOtpChange}
                    className="w-full border-gray-300"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm">{errors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confPassword" className="text-gray-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confPassword"
                    type="password"
                    name="confPassword"
                    value={formData.confPassword}
                    onChange={handleOtpChange}
                    className="w-full border-gray-300"
                  />
                  {errors.confPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confPassword}
                    </p>
                  )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSubmitOtp}
                    className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white"
                  >
                    Submit OTP
                  </Button>
                  <Button
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                    className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* OTP Modal for Verification */}
      {isOtpModalOpen && (
        <OTPModal
          email={form.email}
          open={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
