import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "@/lib/axios.config";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
type LoginResponse = {
  token: string;
  user: { user_id: string; email: string };
};

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignInValues = z.infer<typeof signInSchema>;

const SignIn: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values: SignInValues) => {
    try {
      const { data } = await apiClient.post<LoginResponse>("/auth/login", {
        email: values.email,
        password: values.password,
      });
      signIn({ token: data.token, user: data.user });
      reset();
      toast.success("Signed in successfully");
      navigate("/home");
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        (error instanceof Error
          ? error.message
          : "An unexpected error occurred.");
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
      <div className="w-full max-w-md space-y-8">
        {/* App Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
              <span className="text-primary text-xl font-bold">i</span>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your PodBrief account
          </p>
        </div>
        <Card>
          <CardHeader className="text-center hidden">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your PodBrief account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sign In Form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? "true" : "false"}
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  aria-invalid={errors.password ? "true" : "false"}
                  disabled={isSubmitting}
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Sign In
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        <Link
          to="/"
          className="text-sm text-primary text-center  hover:underline block w-fit mx-auto"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
