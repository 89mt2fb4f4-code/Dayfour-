import type { Project } from "@/content/work";
import type { ClientProject } from "@/content/client-work";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const QUERY = `*[_type == "project" && defined(youtubeUrl)] | order(coalesce(order, 1e9) asc, _createdAt desc) {
  _id, title, meta, youtubeUrl, "cover": cover.asset->url
}`;

async function query<T>(groq: string): Promise<T[] | null> {
  if (!projectId) return null;
  const url = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(groq)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return ((await res.json()) as { result: T[] }).result;
  } catch {
    return null;
  }
}

const CLIENT_QUERY = `*[_type == "clientProject" && defined(youtubeUrl) && defined(poster.asset)] | order(coalesce(order, 1e9) asc, _createdAt desc) {
  _id, title, subtitle, description, instagram, youtubeUrl, "poster": poster.asset->url, "hotspot": poster.hotspot
}`;

/** Client work from the admin; posters cropped to 16:9 around the chosen hotspot. */
export async function fetchClientProjects(): Promise<ClientProject[] | null> {
  const rows = await query<{
    _id: string;
    title?: string;
    subtitle?: string;
    description?: string;
    instagram?: string;
    youtubeUrl: string;
    poster: string;
    hotspot?: { x: number; y: number };
  }>(CLIENT_QUERY);
  return (
    rows?.map((d) => {
      const focus = d.hotspot ? `&crop=focalpoint&fp-x=${d.hotspot.x.toFixed(3)}&fp-y=${d.hotspot.y.toFixed(3)}` : "";
      return {
        id: d._id,
        title: d.title ?? "",
        subtitle: d.subtitle,
        description: d.description,
        instagram: d.instagram?.replace(/^@/, "").trim() || undefined,
        youtubeUrl: d.youtubeUrl,
        poster: `${d.poster}?w=1600&h=900&fit=crop${focus}&auto=format`,
      };
    }) ?? null
  );
}

/** Work added in the admin. Read in the browser, so publishing shows up without a rebuild. */
export async function fetchCmsProjects(): Promise<Project[] | null> {
  if (!projectId) return null;
  const url = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(QUERY)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const { result } = (await res.json()) as {
      result: { _id: string; title?: string; meta?: string; youtubeUrl: string; cover?: string }[];
    };
    return result.map((d) => ({
      id: d._id,
      title: d.title ?? "",
      meta: d.meta,
      youtubeUrl: d.youtubeUrl,
      cover: d.cover ? `${d.cover}?w=1280&auto=format` : undefined,
    }));
  } catch {
    return null;
  }
}
