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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
            <div className="space-y-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                name="name"
                value={form.name}
                placeholder="John Doe"
                required
                onChange={handleChange}
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
                placeholder="me@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button className="w-full" disabled={isLoading}>
              Register
            </Button>
            {error && (
              <p>{(error as any).data?.message || "Registration failed"}</p>
            )}
            {formErrors && <p className="text-red-500">{formErrors}</p>}
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
