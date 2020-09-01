import { Layout } from "../components/layout/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Card } from "../components/Card";
import { Title } from "../components/Title";
import { SignupForm } from "../components/Auth";
import { AuthProvider } from "../utils/auth";

const SignUp = () => {
  return (
    <AuthProvider>
      <Layout title="sign up">
        <div className="m-auto w-full p-8 md:max-w-xl">
          <Card>
            <Title>Sign up</Title>

            <p className="text-md text-gray-600 font-bold">
              Registration is free and doesn't require a credit card. Cancel at
              any time.
            </p>

            <div className="border-b-2 pt-4 pb-4">
              <SignupForm />
            </div>

            <div className="w-64 p-4 flex flex-col m-auto text-center">
              <a
                className="text-green-600 hover:text-green-500 font-bold"
                href="/oauth/login/github"
                onClick={() => window.beampipe("signup")}
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faGithub}
                />
                Sign up with GitHub
              </a>
            </div>
          </Card>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default SignUp;