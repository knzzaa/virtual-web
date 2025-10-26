// Response types
export interface MaterialListItem {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isLikedByUser: boolean;
}

export interface MaterialDetail {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  contentHtml: string;
  isLikedByUser: boolean;
}

export interface MaterialLikeResponse {
  liked: boolean;
}
