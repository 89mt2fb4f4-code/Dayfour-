import { defineField, defineType } from "sanity";
import { youtubeId } from "@/lib/youtube";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube link",
      description: "Unlisted is fine.",
      type: "url",
      validation: (r) =>
        r.required().custom((v) => (!v || youtubeId(v) ? true : "Paste a YouTube video link (youtu.be/… or youtube.com/watch?v=…).")),
    }),
    defineField({
      name: "meta",
      title: "Line under the title",
      description: "Optional, e.g. “Commercial. New York. 2026.”",
      type: "string",
    }),
    defineField({
      name: "cover",
      title: "Cover still",
      description: "Optional. Shown before the video plays; without one, YouTube's thumbnail is used.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Position",
      description: "Optional. Lower numbers show first; otherwise newest first.",
      type: "number",
    }),
  ],
  preview: { select: { title: "title", subtitle: "meta", media: "cover" } },
});
