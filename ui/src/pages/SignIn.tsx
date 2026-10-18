import { Layout } from "../components/layout/Layout";
import {
  AuthCard,
  GitHubButton,
  LoginForm,
  OrDivider,
  SignUpLink,
} from "../components/Auth";

const SignIn = () => {
  return (
    <Layout title="login">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your beampipe account"
        footer={<SignUpLink />}
      >
        <GitHubButton onClick={() => window.beampipe("login")}>
          Sign in with GitHub
        </GitHubButton>
        <OrDivider />
        <LoginForm />
      </AuthCard>
    </Layout>
  );
};

export default SignIn;
