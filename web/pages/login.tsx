import { Layout } from "../components/Layout"
import Link from "next/link";

export default () => {
    return (
      <Layout title="alysis.io - login">
        <a
          href="http://localhost:8080/oauth/login/github"
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
        >
          Login with GitHub
        </a>
      </Layout>
    );
}