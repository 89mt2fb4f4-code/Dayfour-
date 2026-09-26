import type { Project } from "@/content/work";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const QUERY = `*[_type == "project" && defined(youtubeUrl)] | order(coalesce(order, 1e9) asc, _createdAt desc) {
  _id, title, meta, youtubeUrl, "cover": cover.asset->url
}`;

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
