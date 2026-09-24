"use client";

import MetallicButton from "@/components/ui/metallic-button";
import { INSTAGRAM_DM } from "@/lib/links";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-8 bg-black px-6 pb-[calc(88px+env(safe-area-inset-bottom,0px))] pt-[14svh] text-center">
      <p className="font-serif text-3xl font-light tracking-[0.15em] text-white" style={{ paddingLeft: "0.15em" }}>
        DɅYFOVR
      </p>
      <MetallicButton
        label="Message us"
        redFringe={0}
        blueFringe={0}
        onClick={() => window.open(INSTAGRAM_DM, "_blank", "noopener,noreferrer")}
      />
      <div className="space-y-1 font-sans text-xs font-light tracking-[0.08em] text-df-grey-light">
        <p>@dayfour.studio</p>
        <p>@god.kagari</p>
      </div>
    </footer>
  );
}
