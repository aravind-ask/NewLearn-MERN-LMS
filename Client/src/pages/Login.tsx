import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/redux/services/authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Component() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(form).unwrap();
      console.log("Login Successful", response);
      navigate("/");
    } catch (err) {
      console.error("Login Error", err);
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                placeholder="m@example.com"
                required
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                required
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              Login
            </Button>
            {error && <p>{(error as any).data?.message || "Login failed"}</p>}
            <span>
              Don't have an account? <Link to={"/signup"}>Register</Link>
            </span>
            <br></br>
            <span>
              Forgot password? <a href="">Reset Password</a>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
