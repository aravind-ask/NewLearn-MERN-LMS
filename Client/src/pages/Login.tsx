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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useDispatch } from "react-redux";
import {
  useForgotPasswordMutation,
  useLoginMutation,
  useSendOTPMutation,
} from "@/redux/services/authApi";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import GoogleAuth from "@/components/OAuth";
import { useToast } from "../hooks/use-toast";

export default function Component() {
  const [sendOtp] = useSendOTPMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

      console.log("Login Successful", response);
      console.log("User Role", response.data.user.role);
      if (response.data.user.role === "admin") {
        <Navigate to="/dashboard" />;
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error", err);
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
        newPassword: "",
        confPassword: "",
        otp: "",
      });
      setIsForgotPasswordModalOpen(false);
      setIsOtpSent(false);
      toast({ title: "OTP submitted successfully!" });
    } catch (error) {
      setErrors({ ...errors, otp: "Error submitting OTP" });
      console.error("Error submitting OTP", error);
    }
  };

  return (
    <>
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-red-500">
                {(error as any).data?.message || "Login failed"}
              </p>
            )}
            {formErrors && <p className="text-red-500">{formErrors}</p>}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="Enter your Email"
                  onChange={handleChange}
                  className={formErrors ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your Password"
                    value={form.password}
                    onChange={handleChange}
                    className={formErrors ? "border-red-500" : ""}
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
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                Login
              </Button>
              <div className="w-full">
                <GoogleAuth />
              </div>
              <span>
                Don't have an account? <Link to={"/signup"}>Register</Link>
              </span>
              <br></br>
              <span
                className="cursor-pointer"
                onClick={handleForgotPasswordClick}
              >
                Forgot password?
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
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
                    onChange={handleOtpChange}
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
                    onChange={handleOtpChange}
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
                    onChange={handleOtpChange}
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
