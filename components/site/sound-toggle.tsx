"use client";

import { useEffect, useState } from "react";
import { getSound } from "@/lib/sound";

/**
 * Starts the sound on the visitor's first tap or key press (browsers block it before that),
 * and gives them a quiet way to turn it off.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sound = getSound();
    const off = sound.subscribe(setOn);
    const first = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-sound-toggle]")) return;
      sound.gesture();
    };
    const types = ["pointerdown", "keydown", "touchend"] as const;
    types.forEach((t) => addEventListener(t, first, { passive: true }));
    return () => {
      off();
      types.forEach((t) => removeEventListener(t, first));
    };
  }, []);

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => getSound().toggle()}
      aria-pressed={on}
      className="fixed right-4 z-[60] py-2 font-sans text-[11px] font-light tracking-[0.12em] text-df-grey-light transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
