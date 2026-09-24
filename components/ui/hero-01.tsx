"use client";

/*
 * Adapted from 21st.dev "Agency Hero Section" (hero-01, ShadcnSpace). Only the header
 * (burger button and full-screen menu) is used; the site has its own opening, so the
 * hero text and brand slider are left out. Links point at this site's sections.
 */
import Header, { type NavigationSection } from "@/components/ui/hero-01-utils/header";
import { INSTAGRAM_DM } from "@/lib/links";

const navigationData: NavigationSection[] = [
  { title: "Home", href: "top", isActive: true },
  { title: "About", href: "about", offset: 0.3 },
  { title: "What we make", href: "what-we-make" },
  { title: "Our work", href: "work" },
  { title: "Let's work", href: "contact" },
];

export default function AgencyHeroSection() {
  return (
    <Header
      navigationData={navigationData}
      collaborateHref={INSTAGRAM_DM}
      instagramHref="https://www.instagram.com/dayfour.studio/"
    />
  );
}
