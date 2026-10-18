import { Logo } from "./Logo";

// The beampipe wordmark used in the header, shared by the marketing site and
// the app so the two navs match.
export const BrandMark = ({ href }: { href: string }) => (
  <a
    href={href}
    className="text-2xl font-extrabold tracking-tight text-green-600 hover:text-green-500"
  >
    <Logo />
  </a>
);
