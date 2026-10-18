import { Layout } from "../components/layout/Layout";
import {
  AuthCard,
  GitHubButton,
  OrDivider,
  SignInLink,
  SignupForm,
} from "../components/Auth";
import { BasicBullets } from "@beampipe/components";

const SignUp = () => {
  return (
    <Layout title="sign up">
      <AuthCard
        title="Create your account"
        subtitle="Free for small sites. No credit card required."
        footer={<SignInLink />}
      >
        <div className="mb-6 rounded-lg bg-primary/5 px-4 py-3 text-sm text-foreground ring-1 ring-primary/15">
          <p className="pb-1 font-semibold">The free plan includes</p>
          <BasicBullets />
        </div>

        <GitHubButton onClick={() => window.beampipe("signup")}>
          Sign up with GitHub
        </GitHubButton>
        <OrDivider />
        <SignupForm />
      </AuthCard>
    </Layout>
  );
};

export default SignUp;
