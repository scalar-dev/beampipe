import Link from "next/link";

const IndexPage = () => {
  return (
    <div className="container m-auto p-4">
      <h1 className="text-2xl">alysis</h1>
      <div>
        <Link href="/domain/[domain]" as="/domain/alysis.alexsparrow.dev">
          <a>alysis.alexsparrow.dev</a>
        </Link>
      </div>
    </div>
  );
};

export default IndexPage;
