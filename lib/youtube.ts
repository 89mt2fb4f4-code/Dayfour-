/** Pulls the video id out of any common YouTube link shape. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

export function youtubeEmbed(id: string) {
  const params = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}
