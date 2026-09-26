"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { projectId } from "@/sanity/env";

export default function Studio() {
  if (!projectId) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black p-8 text-center font-sans text-sm text-white/70">
        The admin isn’t connected yet. Add the Sanity project ID in sanity/env.ts.
      </main>
    );
  }
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <NextStudio config={config} />
    </div>
  );
}
