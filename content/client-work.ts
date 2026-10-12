/*
 * Client work: added in the admin (dayfour.studio/studio → Client work).
 *
 * While the admin has no client projects yet, the section shows the TEMPORARY SAMPLES
 * below so the layout can be seen. They disappear on their own as soon as the first
 * client project is published. Stock photos and Blender open films, not DAYFOUR work.
 */
export type ClientProject = {
  id: string;
  title: string;
  /** Client, category or year, e.g. "Nike — Commercial — 2026". */
  subtitle?: string;
  description?: string;
  youtubeUrl: string;
  /** Landscape (16:9) still for the carousel and the detail view. */
  poster: string;
};

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&h=900&q=80&auto=format&fit=crop`;
const SAMPLE_NOTE = "Temporary sample so the layout can be seen. Add client work in the admin and these disappear.";

export const sampleClientProjects: ClientProject[] = [
  { id: "sample-1", title: "Sample One", subtitle: "Client — Commercial", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ", poster: photo("1600585154340-be6161a56a0c") },
  { id: "sample-2", title: "Sample Two", subtitle: "Client — Short", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8", poster: photo("1514906689926-25ba6dcb584b") },
  { id: "sample-3", title: "Sample Three", subtitle: "Client — Documentary", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", poster: photo("1568557412756-7d219873dd11") },
  { id: "sample-4", title: "Sample Four", subtitle: "Client — Commercial", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ", poster: photo("1581892805885-73bdd91beff0") },
  { id: "sample-5", title: "Sample Five", subtitle: "Client — Short", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8", poster: photo("1482938289607-e9573fc25ebb") },
];
