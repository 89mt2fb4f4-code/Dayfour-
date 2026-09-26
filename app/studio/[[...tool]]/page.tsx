import type { Metadata } from "next";
import Studio from "./studio";

export const metadata: Metadata = { title: "DɅYFOVR admin", robots: { index: false, follow: false } };

// One prebuilt page; the admin handles its own routes in the browser.
export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  return <Studio />;
}
