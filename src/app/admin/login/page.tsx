"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token"); // Changed to generic "token"
    const user = localStorage.getItem("user");
    if (token && user) {
      // Redirect to dashboard for any authenticated user
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { access_token, user } = res.data;

      // Store token & user info using generic keys for universal roles
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user)); // Main universal key

      toast.success("Login successful!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center">
          <Image
            src="/svg/da-Salon-logo.svg"
            alt="Admin Logo"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Welcome Back 👋
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to your admin dashboard
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Forgot your password?{" "}
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset here
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
