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

export default function Component() {
  const [register, { isLoading, error }] = useRegisterMutation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormErrors("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors("");

    try {
      const { confirmPassword, ...formData } = form;
      if (!form.email || !form.password || !form.name) {
        setFormErrors("All fields are required");
        return;
      }
      if (formData.password !== confirmPassword) {
        setFormErrors("Passwords do not match");
        return;
      }
      await register(formData).unwrap();
      console.log("Registration successful, check email for OTP");
      setOtpModalOpen(true);
    } catch (err) {
      console.error("Registration failed", err);
    }
  };
  return (
    <div>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Register</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            {formErrors && <p className="text-red-500">{formErrors}</p>}
            {error && (
              <p className="text-red-500">
                {(error as any).data?.message || "Registration failed"}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                name="name"
                value={form.name}
                placeholder="Enter your Full Name"
                onChange={handleChange}
                className={formErrors ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your Email"
                className={formErrors ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your Password"
                value={form.password}
                onChange={handleChange}
                className={formErrors ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your Password"
                  value={form.confirmPassword}
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
            <Button className="w-full mt-5" disabled={isLoading}>
              Register
            </Button>
            <GoogleAuth />
            <span>
              Already have an account? <Link to={"/login"}>Login</Link>
            </span>
          </form>
        </CardContent>
      </Card>
      {otpModalOpen && (
        <OTPModal
          email={form.email}
          open={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
        />
      )}
    </div>
  );
}
