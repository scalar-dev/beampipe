import { Layout } from "../components/layout/Layout";
import { AuthCard, ResetPasswordLinkForm } from "../components/Auth";

const ResetPassword = () => {
  return (
    <Layout title="reset password">
      <AuthCard
        title="Reset your password"
        subtitle="Choose a new password for your account"
      >
        <ResetPasswordLinkForm />
      </AuthCard>
    </Layout>
  );
};

export { ResetPassword };
