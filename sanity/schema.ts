import { defineField, defineType } from "sanity";
import { youtubeId } from "@/lib/youtube";

const youtubeField = defineField({
  name: "youtubeUrl",
  title: "YouTube link",
  description: "Unlisted is fine.",
  type: "url",
  validation: (r) =>
    r.required().custom((v) => (!v || youtubeId(v) ? true : "Paste a YouTube video link (youtu.be/… or youtube.com/watch?v=…).")),
});

const orderField = defineField({
  name: "order",
  title: "Position",
  description: "Optional. Lower numbers show first; otherwise newest first.",
  type: "number",
});

export const project = defineType({
  name: "project",
  title: "DɅYFOVR Original",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    youtubeField,
    defineField({
      name: "meta",
      title: "Line under the title",
      description: "Optional, e.g. “Commercial. New York. 2026.”",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional. A couple of sentences shown under the card.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cover",
      title: "Cover still",
      description: "Optional. Shown before the video plays; without one, YouTube's thumbnail is used.",
      type: "image",
      options: { hotspot: true },
    }),
    orderField,
  ],
  preview: { select: { title: "title", subtitle: "meta", media: "cover" } },
});

/** Client work: the glass carousel, and the detail view that opens from it. */
export const clientProject = defineType({
  name: "clientProject",
  title: "Client work",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "subtitle",
      title: "Client / category",
      description: "Optional, e.g. “Nike — Commercial — 2026”.",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional. A few lines about the project, shown when it is opened.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "instagram",
      title: "Instagram to credit",
      description: "Optional. The handle without the @, e.g. “zack.lashawn”. Shown as a link.",
      type: "string",
    }),
    youtubeField,
    defineField({
      name: "poster",
      title: "Poster",
      description: "A landscape still from the video. It is cropped to 16:9; drag the hotspot to choose the centre.",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    orderField,
  ],
  preview: { select: { title: "title", subtitle: "subtitle", media: "poster" } },
});
