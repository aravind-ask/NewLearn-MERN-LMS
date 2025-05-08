import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/redux/services/authApi";
import { useState } from "react";
import { OTPModal } from "@/components/otpModal";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import GoogleAuth from "@/components/OAuth";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { validatePassword } from "@/utils/validatePassword";

export default function Register() {
  const [register, { isLoading, error }] = useRegisterMutation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormErrors([]);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!form.email || !form.password || !form.name || !form.confirmPassword) {
      setFormErrors(["All fields are required"]);
      return;
    }

    const passwordErrors = validatePassword(
      form.password,
      form.confirmPassword
    );
    if (passwordErrors.length > 0) {
      setFormErrors(passwordErrors);
      return;
    }

    try {
      const { confirmPassword, ...formData } = form;
      const response = await register(formData).unwrap();
      console.log("Registration response:", response);
      setOtpModalOpen(true);
      toast({
        title: "Registration Successful",
        description: "Please check your email for the OTP.",
      });
    } catch (err: any) {
      console.error("Registration failed", err);
      if (
        err.status === 409 &&
        err.data?.message === "User already exists and is verified"
      ) {
        setFormErrors(["User already exists and is verified. Please log in."]);
      } else {
        setFormErrors([err.data?.message || "Registration failed"]);
      }
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.data?.message || "Something went wrong",
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
            Join Us Today!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-md mx-auto">
            Start your journey with our world-class learning platform.
          </p>
        </div>
      </motion.div>

      {/* Registration Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8"
      >
        <Card className="w-full max-w-md shadow-lg rounded-lg bg-white">
          <CardHeader className="space-y-1 p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Register
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formErrors.length > 0 && (
                <ul className="text-red-500 text-sm space-y-1">
                  {formErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              )}
              {error && (
                <p className="text-red-500 text-sm">
                  {(error as any).data?.message || "Registration failed"}
                </p>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    name="name"
                    value={form.name}
                    placeholder="Enter your Full Name"
                    onChange={handleChange}
                    className={`w-full ${
                      formErrors.length > 0
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    className={`w-full ${
                      formErrors.length > 0
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your Password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full ${
                      formErrors.length > 0
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your Password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`w-full ${
                        formErrors.length > 0
                          ? "border-red-500"
                          : "border-gray-300"
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
                  {isLoading ? "Registering..." : "Register"}
                </Button>
                <div className="w-full">
                  <GoogleAuth />
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <OTPModal
          email={form.email}
          open={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
