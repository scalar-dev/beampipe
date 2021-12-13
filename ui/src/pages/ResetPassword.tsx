import { Layout } from "../components/layout/Layout";
import { Card } from "../components/Card";
import { Title } from "../components/Title";
import { ResetPasswordLinkForm } from "../components/Auth";

const ResetPassword = () => {
  return (
    <Layout title="reset password">
      <div className="m-auto w-full p-4 md:max-w-xl">
        <Card>
          <Title>Reset Password</Title>

          <div className="pb-4">
            <ResetPasswordLinkForm />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export { ResetPassword };
