import React from "react";
import { Layout } from "../../components/layout/Layout";
import fs from "fs";
import matter from "gray-matter";
import Link from "next/link";
import { Footer, TakeBackControl } from "..";

const Blog = ({ posts }: { posts: any }) => (
    <Layout title="Blog">
      <div className="container mx-auto max-w-screen-sm mt-8">
        {posts.map(
          ({ frontmatter, slug }: { frontmatter: any; slug: string }) => (
            <article key={frontmatter.title}>
              <header>
                <h3 className="mb-1 text-3xl font-semibold text-purple-600">
                  <Link href={"/blog/[slug]"} as={`/blog/${slug}`}>
                    <a className="text-4xl font-black text-purple-600 no-underline">
                      {frontmatter.title}
                    </a>
                  </Link>
                </h3>
                <span className="mb-4 text-sm">{frontmatter.date}</span>
              </header>
              <section className="leading-7 text-gray-700">
                <p className="mb-8">{frontmatter.description}</p>
              </section>
            </article>
          )
        )}
      </div>

      <div className="my-16">
        <TakeBackControl />
      </div>

      <Footer />
    </Layout>
);

export async function getStaticProps() {
  const files = fs.readdirSync(`${process.cwd()}/content/posts`);

  const posts = files.map((filename) => {
    const markdownWithMetadata = fs
      .readFileSync(`content/posts/${filename}`)
      .toString();

    const { data } = matter(markdownWithMetadata);

    // Convert post date to format: Month day, Year
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = data.date.toLocaleDateString("en-US", options);

    const frontmatter = {
      ...data,
      date: formattedDate,
    };

    return {
      slug: filename.replace(".md", ""),
      frontmatter,
    };
  });

  return {
    props: {
      posts,
    },
  };
}

export default Blog;