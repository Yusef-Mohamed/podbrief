export type PodcastCategoryMap = Record<string, string>;

export type PodcastFeed = {
  id: number;
  title: string;
  url: string;
  originalUrl: string;
  link: string;
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;
  lastCrawlTime: number;
  lastParseTime: number;
  inPollingQueue: number;
  priority: number;
  lastGoodHttpStatusTime: number;
  lastHttpStatus: number;
  contentType: string;
  itunesId?: number;
  itunesType?: string;
  generator?: string;
  language: string;
  type: number;
  dead: number;
  crawlErrors: number;
  parseErrors: number;
  categories: PodcastCategoryMap;
  locked: number;
  explicit: boolean;
  podcastGuid: string;
  medium: string;
  episodeCount: number;
  imageUrlHash?: number;
  chash?: string;
  newestItemPubdate?: number;
  funding?: {
    url: string;
    message: string;
  };
};

export type PodcastSearchResponse = {
  status: string;
  feeds: PodcastFeed[];
  count: number;
  query: string;
  description: string;
  pagination?: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    returned_count: number;
  };
};

export type PodcastDetailsResponse = {
  status: string;
  query: { id: string };
  feed: PodcastFeed | null | undefined;
  description: string;
};

export type PodcastEpisode = {
  id?: number | string;
  title?: string;
  link?: string;
  description?: string;
  guid?: string;
  datePublished?: number; // epoch seconds
  datePublishedPretty?: string;
  dateCrawled?: number;
  enclosureUrl?: string;
  enclosureType?: string;
  enclosureLength?: number;
  duration?: number; // seconds
  explicit?: 0 | 1 | boolean;
  episode?: number;
  episodeType?: string;
  season?: number;
  image?: string;
  feedItunesId?: number | null;
  feedUrl?: string;
  feedImage?: string;
  feedId?: number;
  podcastGuid?: string;
  feedLanguage?: string;
  feedTitle?: string;
  feedDead?: number;
  feedDuplicateOf?: number | null;
  chaptersUrl?: string | null;
  transcriptUrl?: string | null;
  summary_info?: string | null;
};

export type PodcastEpisodesResponse = {
  status: string;
  liveItems?: PodcastEpisode[];
  items: PodcastEpisode[];
  count: number;
  query: string | { id: string };
  description: string;
  pagination?: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    returned_count: number;
  };
};

export type EpisodeDetailsResponse = {
  status: string;
  episode: PodcastEpisode | null | undefined;
  count?: number;
  id: string;
  description: string;
};

// Subscriptions types
export type UserSubscription = {
  podcastId: number;
  title: string;
  description: string;
  author: string;
  imageUrl: string;
  subscribedAt: string; // ISO date string
  summarizedEpisodesCount: number;
};

export type SubscriptionsResponse = {
  subscriptions: UserSubscription[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
};
