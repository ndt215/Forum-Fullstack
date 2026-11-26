/**
 * Nhận diện link video phổ biến và chuyển sang URL nhúng iframe.
 *
 * Hỗ trợ: YouTube (watch / youtu.be / shorts / live / embed),
 *        TikTok (@user/video/ID, embed/v2/ID), Vimeo (vimeo.com/ID).
 */

const ID_YOUTUBE = /^[A-Za-z0-9_-]{6,}$/;

function themGiaoThuc(url) {
  const text = String(url || "").trim();
  if (!text) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`;
}

export function parseVideoLink(url) {
  const raw = String(url || "").trim();
  if (!raw) return null;

  let parsed;

  try {
    parsed = new URL(themGiaoThuc(raw));
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  const path = parsed.pathname.replace(/\/+$/, "");

  // ----- YouTube -----
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    let id = parsed.searchParams.get("v");

    if (!id) {
      const match = path.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]+)/);
      id = match ? match[1] : null;
    }

    if (id && ID_YOUTUBE.test(id)) {
      return {
        provider: "YouTube",
        id,
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0];
    if (id && ID_YOUTUBE.test(id)) {
      return {
        provider: "YouTube",
        id,
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  // ----- TikTok -----
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const match = path.match(/\/(?:@[^/]+\/video|embed\/v2)\/(\d+)/);
    if (match) {
      return {
        provider: "TikTok",
        id: match[1],
        embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
        watchUrl: raw,
      };
    }
  }

  // ----- Vimeo -----
  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const match = path.match(/(?:video\/)?(\d{5,})/);
    if (match) {
      return {
        provider: "Vimeo",
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        watchUrl: `https://vimeo.com/${match[1]}`,
      };
    }
  }

  return null;
}

export function laLinkVideoHopLe(url) {
  return Boolean(parseVideoLink(url));
}
