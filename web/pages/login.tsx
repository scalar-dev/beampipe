import { Layout } from "../components/Layout";
import { BoldButton } from "../components/BoldButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Card } from "../components/Card";
import { Title } from "../components/Title";

export default () => {
  return (
    <Layout title="beampipe - login">
      <div className="m-auto w-full md:max-w-xl">
        <Card>
          <Title>Login</Title>

          <p className="text-sm">
            We only request minimal permissions to your GitHub account so that we can
            authenticate you.
          </p>

          <div className="w-64 p-4 flex flex-col m-auto">
            <BoldButton href="/oauth/login/github">
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faGithub}
              />
              Login with GitHub
            </BoldButton>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
