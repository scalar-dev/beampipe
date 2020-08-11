import { Layout } from "../components/Layout";
import { BoldButton } from "../components/BoldButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Card } from "../components/Card";
import { Title } from "../components/Title";
import { LoginForm } from "../components/Auth";

export default () => {
  return (
    <Layout title="beampipe - login">
      <div className="m-auto w-full p-8 md:max-w-xl">
        <Card>
          <Title>Sign in</Title>

          <div className="w-64 p-4 flex flex-col m-auto">
            <BoldButton
              href="/oauth/login/github"
              onClick={() => window.beampipe("login")}
            >
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faGithub}
              />
              Sign in with GitHub
            </BoldButton>
          </div>

          <LoginForm />
        </Card>
      </div>
    </Layout>
  );
};
