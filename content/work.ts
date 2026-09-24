/*
 * The work shown on the site. While this list is empty, the work section shows
 * "Coming soon". Each project needs a YouTube link (unlisted is fine).
 *
 * This file is the stand-in until the Sanity admin is connected; then the same
 * fields come from the /studio form instead.
 */
export type Project = {
  id: string;
  title: string;
  /** One line under the title, e.g. "Fashion. New York. 2026." */
  meta: string;
  youtubeUrl: string;
  /** Still shown before the video plays. Defaults to YouTube's thumbnail. */
  cover?: string;
};

// TEMPORARY SAMPLES so the work section can be previewed. Blender open films, not DAYFOUR work.
// To remove: set this back to `export const projects: Project[] = [];`
export const projects: Project[] = [
  { id: "sample-sintel", title: "Sintel", meta: "Sample. Short film.", youtubeUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ" },
  { id: "sample-tears-of-steel", title: "Tears of Steel", meta: "Sample. Short film.", youtubeUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8" },
  { id: "sample-big-buck-bunny", title: "Big Buck Bunny", meta: "Sample. Short film.", youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
];
