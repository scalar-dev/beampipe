import { Logo } from "./Logo";
import { SCALAR_URL } from "./scalar";

// The beampipe wordmark with a "by Scalar" byline, shared by the marketing
// site and the app so the two navs match.
export const BrandMark = ({ href }: { href: string }) => (
  <div className="flex flex-col leading-none">
    <a
      href={href}
      className="text-2xl font-extrabold tracking-tight text-green-600 hover:text-green-500"
    >
      <Logo />
    </a>
    <a
      href={SCALAR_URL}
      className="mt-1 ml-[1.8125rem] w-fit text-xs font-medium text-gray-500 hover:text-gray-900"
      data-scalar-link
    >
      by Scalar
    </a>
  </div>
);
