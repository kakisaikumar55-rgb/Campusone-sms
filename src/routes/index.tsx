import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — CampusOne Student Management System" },
      {
        name: "description",
        content:
          "Secure administrator sign-in for CampusOne, a Student Management System for students, courses, marks and attendance.",
      },
      { property: "og:title", content: "Sign In — CampusOne Student Management System" },
      {
        property: "og:description",
        content: "Secure administrator sign-in for the CampusOne Student Management System.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@campus.edu");
  const [password, setPassword] = useState("admin123");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      login(email);
      setLoading(false);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="bg-brand-gradient relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
            <GraduationCap className="size-6" />
          </span>
          <span className="font-display text-lg font-semibold">CampusOne</span>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-4xl leading-tight font-semibold">
            One platform for every campus record.
          </h2>
          <p className="mt-4 text-sm/relaxed opacity-85">
            Manage students, courses, departments, marks and attendance from a single professional
            console — built for enterprise-grade academic operations.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6">
            {[
              ["30+", "Students"],
              ["6", "Courses"],
              ["5", "Departments"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-semibold">{v}</dt>
                <dd className="text-xs opacity-75">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="flex items-center gap-2 text-xs opacity-75">
          <ShieldCheck className="size-4" /> Role-based access • Audit ready
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="bg-brand-gradient grid size-10 place-items-center rounded-xl text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">CampusOne</span>
          </div>

          <h1 className="text-2xl font-semibold">Administrator sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your campus credentials to continue.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email or username</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="admin@campus.edu"
                  autoComplete="username"
                />
              </div>
              {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked /> Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("A reset link would be emailed by the backend.")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo credentials are pre-filled. <Link to="/dashboard" className="text-primary hover:underline">Skip to dashboard</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
