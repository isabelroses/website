import { ATPROTO, LASTFM_PROFILE } from "./consts";

type Fetch = (url: string) => Promise<Response>;

interface PlayRecord {
  trackName?: string;
  artists?: (string | { artistName?: string })[];
  releaseName?: string;
  releaseMbId?: string;
  originUri?: string;
}

interface StatusRecord {
  value?: { item?: PlayRecord; expiry?: string };
}

interface PlayList {
  records?: { value: PlayRecord }[];
}

interface ItunesSearch {
  results?: { artistName: string; artworkUrl100?: string }[];
}

export interface Track {
  title: string;
  artist: string;
  album: string;
  live: boolean;
  href: string;
  coverArt: string;
  firstArtist: string;
}

const { did, pds } = ATPROTO;
const STATUS_URL = `${pds}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=fm.teal.actor.status&rkey=self`;
const PLAY_URL = `${pds}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=fm.teal.feed.play&limit=1`;

async function getJson<T>(fetchFn: Fetch, url: string): Promise<T> {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// drop "(feat. …)", "[…]" and " - 2021 Remaster" style suffixes
const baseTitle = (s: string) => s.replace(/\s*[([].*?[)\]]|\s+-\s+.*$/g, "");

const artistNames = (artists: PlayRecord["artists"]): string =>
  Array.isArray(artists)
    ? artists
        .map((a) => (typeof a === "string" ? a : a?.artistName))
        .filter(Boolean)
        .join(", ")
    : "";

const coverArt = (releaseMbId?: string) => {
  const id = (releaseMbId || "").replace(/^mbid:/, "");
  return id ? `https://coverartarchive.org/release/${id}/front-500` : "";
};

// null when nothing has been played; throws when the PDS can't be reached
export async function currentTrack(
  fetchFn: Fetch,
  now = Date.now(),
): Promise<Track | null> {
  // request both at once so a stale status doesn't cost a second round trip
  const playsReq = getJson<PlayList>(fetchFn, PLAY_URL);
  playsReq.catch(() => {});
  const status = await getJson<StatusRecord>(fetchFn, STATUS_URL).catch(
    () => null,
  );
  const item = status?.value?.item;
  const expiry = status?.value?.expiry;
  const live = !!item?.trackName && (!expiry || Date.parse(expiry) > now);
  const record = live ? item : (await playsReq).records?.[0]?.value;
  const title = record?.trackName;
  if (!record || !title) return null;

  return {
    title,
    artist: artistNames(record.artists) || "unknown artist",
    album: record.releaseName || title,
    live,
    href: record.originUri || LASTFM_PROFILE,
    coverArt: coverArt(record.releaseMbId),
    firstArtist: artistNames(record.artists?.slice(0, 1)),
  };
}

// keyless fallback for tracks musicbrainz couldn't match; only trust
// results from the same artist so we never show someone else's cover
export async function itunesArt(fetchFn: Fetch, track: Track) {
  if (!track.firstArtist) return "";
  const term = encodeURIComponent(
    `${track.firstArtist} ${baseTitle(track.title)}`,
  );
  const data = await getJson<ItunesSearch>(
    fetchFn,
    `https://itunes.apple.com/search?media=music&entity=song&limit=10&term=${term}`,
  ).catch(() => null);
  const hit = data?.results?.find(
    (r) => norm(r.artistName) === norm(track.firstArtist),
  );
  return hit?.artworkUrl100?.replace(/100x100bb\.\w+$/, "500x500bb.webp") ?? "";
}
