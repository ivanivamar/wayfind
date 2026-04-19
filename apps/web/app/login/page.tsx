"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/ui/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { Input } from "@/components/ui/Input";
import { Wordmark } from "@/components/ui/Wordmark";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { mapAuthError } from "@/lib/firebase/errors";

type FieldErrors = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already signed in, bounce to /home
  useEffect(() => {
    if (!authLoading && user) router.replace("/home");
  }, [user, authLoading, router]);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      router.replace("/home");
    } catch (err) {
      setErrors({ form: mapAuthError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrors({});
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/home");
    } catch (err) {
      setErrors({ form: mapAuthError(err) });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card>
        <Wordmark subtitle="Welcome back" />

        <Button
          variant="secondary"
          onClick={handleGoogle}
          loading={googleLoading}
          loadingText="Connecting…"
          leftIcon={<GoogleIcon />}
        >
          Continue with Google
        </Button>

        <Divider />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((er) => ({ ...er, email: undefined, form: undefined }));
            }}
            error={errors.email}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((er) => ({
                  ...er,
                  password: undefined,
                  form: undefined,
                }));
              }}
              error={errors.password}
            />
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-fg-2 no-underline hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {errors.form && (
            <p className="text-xs text-danger" role="alert">
              {errors.form}
            </p>
          )}

          <Button
            type="submit"
            loading={submitting}
            loadingText="Signing in…"
            className="mt-1"
          >
            Log in
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-fg-3">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary no-underline hover:underline"
          >
            Create one
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
