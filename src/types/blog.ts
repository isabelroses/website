export interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  file: string;
  date: string;
  slug: string;
  content: string;
  title_image?: string;
  pinned?: number;
}

export interface BlogMeta {
  tags: [string, number];
  pins: any[];
  posts: BlogPost[];
}
