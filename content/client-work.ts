/*
 * Client work: added in the admin (dayfour.studio/studio → Client work) or listed in
 * `clientProjects` below. Admin projects show first, then these.
 *
 * Only when both are empty does the section show the TEMPORARY SAMPLES, so the layout
 * can be seen. Stock photos and Blender open films, not DAYFOUR work.
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
  /** Instagram handle to credit, without the @, e.g. "zack.lashawn". */
  instagram?: string;
};

export const clientProjects: ClientProject[] = [
  {
    id: "chapter-1-possession",
    title: "Chapter 1 — Possession",
    subtitle: "Zack Leshauwn — Model",
    description:
      "A woman's hands emerge from Zack Leshauwn's own shadow, as if the darkness itself has claimed him. Conceived as the first chapter of his rebrand, Possession borrows the language of horror to look past the surface and show that modelling is not what defines him. The man, not the image.",
    youtubeUrl: "https://youtu.be/BxitAGhxmTY",
    poster: "/assets/work/chapter-1-possession.jpg",
    instagram: "zack.leshauwn",
  },
];

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&h=900&q=80&auto=format&fit=crop`;
const SAMPLE_NOTE = "Temporary sample so the layout can be seen. Add client work in the admin and these disappear.";

export const sampleClientProjects: ClientProject[] = [
  { id: "sample-1", title: "Sample One", subtitle: "Client — Commercial", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ", poster: photo("1600585154340-be6161a56a0c") },
  { id: "sample-2", title: "Sample Two", subtitle: "Client — Short", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8", poster: photo("1514906689926-25ba6dcb584b") },
  { id: "sample-3", title: "Sample Three", subtitle: "Client — Documentary", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", poster: photo("1568557412756-7d219873dd11") },
  { id: "sample-4", title: "Sample Four", subtitle: "Client — Commercial", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ", poster: photo("1581892805885-73bdd91beff0") },
  { id: "sample-5", title: "Sample Five", subtitle: "Client — Short", description: SAMPLE_NOTE, youtubeUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8", poster: photo("1482938289607-e9573fc25ebb") },
];
