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
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Wordmark } from "@/components/ui/Wordmark";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebase/auth";
import { mapAuthError } from "@/lib/firebase/errors";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/home");
  }, [user, authLoading, router]);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Use at least 6 characters";
    return e;
  };

  const clearField = (key: keyof FieldErrors) =>
    setErrors((er) => ({ ...er, [key]: undefined, form: undefined }));

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
      await signUpWithEmail(name.trim(), email, password);
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
        <Wordmark subtitle="Create your account" />

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
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearField("name");
            }}
            error={errors.name}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearField("email");
            }}
            error={errors.email}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearField("password");
              }}
              error={errors.password}
            />
            {!errors.password && <PasswordStrength password={password} />}
          </div>

          {errors.form && (
            <p className="text-xs text-danger" role="alert">
              {errors.form}
            </p>
          )}

          <Button
            type="submit"
            loading={submitting}
            loadingText="Creating account…"
            className="mt-1"
          >
            Create account
          </Button>
        </form>

        <p className="mt-3.5 text-center text-[11px] leading-relaxed text-fg-3">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-fg-2 underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-fg-2 underline">
            Privacy Policy
          </Link>
        </p>

        <p className="mt-4 text-center text-[13px] text-fg-3">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary no-underline hover:underline"
          >
            Log in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
