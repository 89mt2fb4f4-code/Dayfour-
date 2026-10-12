/*
 * Work that lives in the code. Projects added in the admin (dayfour.studio/studio) are
 * shown first, then these. While both are empty, the work section shows "Coming soon".
 * Each project needs a YouTube link (unlisted is fine).
 */
export type Project = {
  id: string;
  title: string;
  /** One line under the title, e.g. "Fashion. New York. 2026." */
  meta?: string;
  /** A couple of sentences, shown when the card is opened. */
  description?: string;
  youtubeUrl: string;
  /** Still shown before the video plays. Defaults to YouTube's thumbnail. */
  cover?: string;
};

export const projects: Project[] = [
  {
    id: "escape",
    title: "ESCAPE",
    description:
      "A deeply personal piece about leaving the familiar behind and stepping into a new world. ESCAPE renders a surreal life suspended in wonder, where the ordinary gives way to something stranger and more beautiful.",
    youtubeUrl: "https://youtu.be/9Firu_m20hE",
    cover: "/assets/work/escape.jpg",
  },
];
