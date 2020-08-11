import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "urql";
import gql from "graphql-tag";

const login = (
  email: string,
  password: string,
  onSuccess: () => void,
  onFailure: () => void
) => {
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password: password,
    }),
  }).then((resp) => {
    if (resp.url.endsWith("/app")) {
      onSuccess();
    } else {
      onFailure();
    }
  });
  window.beampipe("login");
};

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [, executeMutation] = useMutation(gql`
    mutation SignUp($email: String!, $password: String!) {
      createUser(email: $email, password: $password)
    }
  `);

  const signUp = async () => {
    const result = await executeMutation({ email, password });

    if (result.error) {
      setError(result.error.graphQLErrors[0].extensions?.userMessage);
    } else {
      login(
        email,
        password,
        () => router.push("/app"),
        () => setError("Exception while logging in")
      );
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
      <div className="mb-6">
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
        <button
          className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          onClick={signUp}
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      <div className="mb-6">
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
        <button
          className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          onClick={() =>
            login(
              email,
              password,
              () => router.push("/app"),
              () => setError("Invalid username or password")
            )
          }
        >
          Sign In
        </button>
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
