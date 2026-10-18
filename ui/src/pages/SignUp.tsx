import { Layout } from "../components/layout/Layout";
import { AnonymousOnly } from "../components/Secure";
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
      <AnonymousOnly>
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
      </AnonymousOnly>
    </Layout>
  );
};

export default SignUp;
