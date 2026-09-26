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
  youtubeUrl: string;
  /** Still shown before the video plays. Defaults to YouTube's thumbnail. */
  cover?: string;
};

export const projects: Project[] = [
  { id: "nyc", title: "NYC", youtubeUrl: "https://youtu.be/5WUmVpoOXDY", cover: "/assets/work/nyc.jpg" },
];
