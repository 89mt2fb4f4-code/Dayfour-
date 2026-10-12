"use client";

/*
 * Not included with the 21st.dev component; written to match its imports. Catches a
 * render error from the WebGL carousel and shows a quiet message in its place.
 */
import { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function WebGLFallback({ className, message }: { className?: string; message: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8 text-center font-sans text-sm text-white/60", className)}>
      <p>{message}</p>
    </div>
  );
}

export class WebGLErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
