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

export const projects: Project[] = [];
