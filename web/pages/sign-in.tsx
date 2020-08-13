import { Layout } from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Card } from "../components/Card";
import { Title } from "../components/Title";
import { LoginForm } from "../components/Auth";

const SignIn = () => {
  return (
    <Layout title="beampipe - login">
      <div className="m-auto w-full p-8 md:max-w-xl">
        <Card>
          <Title>Sign in</Title>

          <div className="border-b-2 pb-4">
            <LoginForm />
          </div>

          <div className="w-64 p-4 flex flex-col m-auto text-center">
            <a
              className="text-green-600 hover:text-green-500"
              href="/oauth/login/github"
              onClick={() => window.beampipe("login")}
            >
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faGithub}
              />
              Sign in with GitHub
            </a>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SignIn;
