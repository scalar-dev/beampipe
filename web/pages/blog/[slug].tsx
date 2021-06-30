import React from "react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Layout } from "../../components/layout/Layout";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Post = ({ content, frontmatter }: { content: any; frontmatter: any }) => {
  return (
      <Layout title={frontmatter.title}>
        <div className="bg-gradient-to-b from-gray-100 to-white">
          <div className="container mx-auto">
            <article className="max-w-screen-sm mx-auto text-gray-700 leading-7 mt-8">
              <div className="text-purple-600 font-bold text-sm hover:text-purple-500">
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="fill-current mr-2"
                />
                <Link href="/blog">Back to posts</Link>
              </div>
              <div className="text-5xl text-purple-600 font-black leading-tight">
                {frontmatter.title}
              </div>
              <div className="text-lg font-bold font-gray-600">
                {frontmatter.date} - By {frontmatter.author}
              </div>
              <ReactMarkdown
                escapeHtml={false}
                source={content}
                renderers={{
                  heading: ({ children, level }) => {
                    if (level === 1) {
                      return null;
                    }
                    return (
                      <div className="text-2xl text-gray-700 font-black leading-tight">
                        {children}
                      </div>
                    );
                  },
                  list: ({ children }) => (
                    <div className="list-disc">{children}</div>
                  ),
                  paragraph: ({ children }) => (
                    <div className="my-4">{children}</div>
                  ),
                  link: ({ children, href }) => (
                    <a href={href} className="font-bold hover:text-purple-600">
                      {children}
                    </a>
                  ),
                  image: ({ src, alt, ...other }) => {
                    console.log(other);
                    return (
                      <div className="my-8">
                        <img src={src} className="mx-auto" />
                        <div className="mt-2 text-center font-bold">{alt}</div>
                      </div>
                    );
                  },
                }}
              />
            </article>
          </div>
        </div>
      </Layout>
  );
};

export default Post;

export async function getStaticPaths() {
  const files = fs.readdirSync("content/posts");

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({
  params: { slug },
}: {
  params: { slug: any };
}) {
  const markdownWithMetadata = fs
    .readFileSync(path.join("content/posts", slug + ".md"))
    .toString();

  const { data, content } = matter(markdownWithMetadata);

  // Convert post date to format: Month day, Year
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = data.date.toLocaleDateString("en-US", options);

  const frontmatter = {
    ...data,
    date: formattedDate,
  };

  return {
    props: {
      content: `# ${data.title}\n${content}`,
      frontmatter,
    },
  };
}
