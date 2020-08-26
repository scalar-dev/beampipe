import { useState } from "react";
import { useMutation } from "urql";
import gql from "graphql-tag";
import { Button } from "./Buttons";
import Link from "next/link";
import { onApiError } from "../utils/errors";

const validateEmail = (email: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const login = async (email: string, password: string): Promise<boolean> => {
  const result = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password: password,
    }),
  });

  window.beampipe("login");
  return result.url.endsWith("/app");
};

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailOk, setEmailOk] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [, executeMutation] = useMutation(gql`
    mutation SignUp($email: String!, $password: String!, $emailOk: Boolean!) {
      createUser(email: $email, password: $password, emailOk: $emailOk)
    }
  `);

  const signUp = async () => {
    const result = await executeMutation({ email, password, emailOk });

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const error = onApiError(
      result.error,
      "There was an errror creating your account :-(. Please get in touch hello@beampipe.io",
      setError
    );

    if (!error) {
      if (await login(email, password)) {
        window.location.assign("/app");
      } else {
        setError("Exception while logging in");
      }
    }

    window.beampipe("signup");
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="username"
        >
          Email address
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          name="username"
          type="text"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          name="password"
          id="password"
          type="password"
          placeholder="******************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="md:flex md:items-center mb-6">
        <label className="md:w-full block text-gray-500 font-bold">
          <input
            className="mr-2 leading-tight"
            type="checkbox"
            checked={emailOk}
            onChange={(e) => setEmailOk(e.target.checked)}
          />
          <span className="text-md">
            It's ok to email me occasionally with updates on Beampipe
          </span>
        </label>
      </div>

      {error && <p className="text-red-500 pb-4 italic">{error}</p>}
      <div className="flex items-center justify-between">
        <Button onClick={signUp}>Sign up</Button>
        <div className="font-bold text-sm text-gray-600 inline-block align-baseline">
          Already signed up?{" "}
          <Link href="/sign-in">
            <a className="font-bold text-sm text-blue-600 hover:text-blue-800 underline">
              Login
            </a>
          </Link>
        </div>
      </div>
    </form>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="username"
        >
          Email address
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          name="username"
          type="text"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          name="password"
          id="password"
          type="password"
          placeholder="******************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 pb-4 italic">{error}</p>}
      <div className="flex items-center justify-between">
        <Button
          onClick={async () => {
            if (await login(email, password)) {
              // For some reason this is needed to trigger a full page refresh
              // or logging out and then logging in causes the redirect not to happen
              // at all. Also see above.
              window.location.assign("/app");
            } else {
              setError("Invalid username or password");
            }
          }}
        >
          Sign In
        </Button>
        <a
          className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          href="mailto:hello@beampipe.io"
        >
          Forgot Password?
        </a>
      </div>
    </form>
  );
};
