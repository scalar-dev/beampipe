import { Layout } from "../components/layout/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Card } from "../components/Card";
import { SignupForm } from "../components/Auth";
import { AuthProvider } from "../utils/auth";
import { BasicBullets } from "../components/marketing/Pricing";

const SignUp = () => {
  return (
    <AuthProvider>
      <Layout title="sign up">
        <div className="m-auto w-full p-4 md:max-w-4xl">
          <Card>
            <div className="px-2 md:px-8">
              <div className="text-4xl font-black leading-tight">
                Get beampipe
              </div>

              <p className="text-sm pb-4 pt-2 text-gray-600 font-bold md:pb-8">
                Registration is free and doesn't require a credit card. Cancel
                at any time.
              </p>

              <div className="flex flex-col md:flex-row">
                <div>
                  <div className="p-4 mr-0 md:mr-12 mb-4 md:mb-0 font-bold text-sm text-gray-700 border">
                    <div className="font-bold text-xl">Basic - free tier</div>
                    <BasicBullets />
                  </div>
                </div>

                <div>
                  <SignupForm />

                  <div className="border-t-2 md:border-none mt-4 p-4 flex flex-col m-auto text-center">
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
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default SignUp;