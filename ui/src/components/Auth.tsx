import { FormEvent, PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { gql, useMutation } from "urql";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScalarCredit } from "./layout/Layout";
import { onApiError } from "../utils/errors";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};

const login = async (email: string, password: string): Promise<boolean> => {
  const result = await fetch("/login", {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password: password,
    }),
  });

  window.beampipe("login");

  // The login endpoint answers with a redirect we can't inspect (redirect:
  // "manual" gives an opaque response), so ask the API whether the session
  // cookie it set is valid.
  if (result.type !== "opaqueredirect" && !result.ok) {
    return false;
  }

  const me = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "{ user { id } }" }),
  });
  const body = await me.json();
  return body?.data?.user?.id != null;
};

const logout = async (): Promise<void> => {
  await fetch("/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const SignoutPage = () => {
  useEffect(() => {
    logout().then(() => window.location.assign("/"));
  });

  return null;
};

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
}

export const AuthCard: React.FunctionComponent<PropsWithChildren<AuthCardProps>> = ({
  title,
  subtitle,
  footer,
  children,
}) => (
  <div className="flex justify-center px-4 py-12 md:py-20">
    <div className="w-full max-w-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <Card className="mt-8">
        <CardContent className="sm:px-8 sm:py-2">{children}</CardContent>
      </Card>

      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        <ScalarCredit />
      </p>
    </div>
  </div>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export const GitHubButton: React.FunctionComponent<PropsWithChildren<{
  onClick: () => void;
}>> = ({ onClick, children }) => (
  <Button asChild variant="outline" size="lg" className="w-full">
    <a href="/oauth/login/github" onClick={onClick}>
      <GitHubIcon />
      {children}
    </a>
  </Button>
);

export const OrDivider = () => (
  <FieldSeparator className="my-6">or continue with email</FieldSeparator>
);

interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

const TextField: React.FunctionComponent<TextFieldProps> = ({
  label,
  hint,
  id,
  ...inputProps
}) => (
  <Field>
    <div className="flex items-center justify-between">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {hint}
    </div>
    <Input id={id} className="h-10" {...inputProps} />
  </Field>
);

const FormError = ({ error }: { error: string | null }) =>
  error ? (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  ) : null;

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailOk, setEmailOk] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [, executeMutation] = useMutation(gql`
    mutation SignUp($email: String!, $password: String!, $emailOk: Boolean!) {
      createUser(email: $email, password: $password, emailOk: $emailOk)
    }
  `);

  const signUp = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError("Please enter a valid password (at least 8 characters)");
      return;
    }

    setSubmitting(true);
    const result = await executeMutation({ email, password, emailOk });

    const error = onApiError(
      result.error,
      "There was an errror creating your account :-(. Please get in touch hello@beampipe.io",
      setError
    );

    if (!error) {
      if (await login(email, password)) {
        window.location.assign("/");
      } else {
        setError("Exception while logging in");
      }
    }

    setSubmitting(false);
    window.beampipe("signup");
  };

  return (
    <form className="space-y-5" onSubmit={signUp} noValidate>
      <TextField
        label="Email address"
        id="username"
        name="username"
        type="email"
        autoComplete="email"
        data-cy="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        data-cy="password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Field orientation="horizontal">
        <Checkbox
          id="email-ok"
          checked={emailOk}
          onCheckedChange={(checked) => setEmailOk(checked === true)}
        />
        <FieldLabel htmlFor="email-ok" className="font-normal text-muted-foreground">
          It's ok to email me occasionally with updates on Beampipe
        </FieldLabel>
      </Field>

      <FormError error={error} />

      <Button data-cy="submit" type="submit" size="lg" className="w-full" disabled={submitting}>
        Create account
      </Button>
    </form>
  );
};

export const ResetPasswordLinkForm = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [, executeMutation] = useMutation(gql`
    mutation ResetPassword($token: String!, $password: String!) {
      resetPassword(token: $token, password: $password)
    }
  `);

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchParams.get("token")) {
      setError(
        "The token you have provided is invalid. Please request a new one."
      );
      return;
    }

    if (!validatePassword(password)) {
      setError("Please enter a valid password (at least 8 characters)");
      return;
    }

    setSubmitting(true);
    const result = await executeMutation({
      token: searchParams.get("token"),
      password,
    });

    const error = onApiError(
      result.error,
      "There was an errror creating your account :-(. Please get in touch hello@beampipe.io",
      setError
    );

    if (!error) {
      window.location.assign("/sign-in");
    }
    setSubmitting(false);
  };

  return (
    <form className="space-y-5" onSubmit={resetPassword} noValidate>
      <TextField
        label="New password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        data-cy="password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <FormError error={error} />

      <Button data-cy="submit" type="submit" size="lg" className="w-full" disabled={submitting}>
        Reset password
      </Button>
    </form>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (await login(email, password)) {
      // For some reason this is needed to trigger a full page refresh
      // or logging out and then logging in causes the redirect not to happen
      // at all. Also see above.
      window.location.assign("/");
    } else {
      setError("Invalid username or password");
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={signIn}>
      <TextField
        label="Email address"
        id="username"
        name="username"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={
          <a
            className="text-sm font-medium text-primary hover:text-primary/80"
            href="mailto:hello@beampipe.io"
          >
            Forgot password?
          </a>
        }
      />

      <FormError error={error} />

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        Sign in
      </Button>
    </form>
  );
};

export const SignInLink = () => (
  <>
    Already have an account?{" "}
    <Link to="/sign-in" className="font-semibold text-primary hover:text-primary/80">
      Sign in
    </Link>
  </>
);

export const SignUpLink = () => (
  <>
    Don't have an account?{" "}
    <Link to="/sign-up" className="font-semibold text-primary hover:text-primary/80">
      Sign up free
    </Link>
  </>
);
