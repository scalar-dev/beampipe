import { Layout } from "../components/Layout"

export default () => {
    return (
      <Layout title="alysis.io - login">
        <div className="text-center m-16">
          <a
            href="/oauth/login/github"
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
          >
            Login with GitHub
          </a>
        </div>
      </Layout>
    );
}