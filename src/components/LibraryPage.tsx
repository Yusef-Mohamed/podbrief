import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSaved } from "@/contexts/SavedContext";
import MainLayout from "./layout/MainLayout";
import { useFollowed } from "@/hooks/useFollowed";
import type { UserSubscription } from "@/types/podcast";
import EpisodeCard from "./home/EpisodeCard";

const LibraryPage: React.FC = () => {
  const { episodes } = useSaved();
  const { followed, subscriptions } = useFollowed();

  // No longer formatting inline rows here; EpisodeCard handles rendering.

  const followedList = useMemo(() => followed.slice(0, 12), [followed]);

  type FollowedDisplayItem = {
    id: number | string;
    title: string;
    author: string;
    image: string;
  };

  const displayItems: FollowedDisplayItem[] = useMemo(() => {
    if (subscriptions && subscriptions.length > 0) {
      return (subscriptions as UserSubscription[]).map((sub) => ({
        id: sub.podcastId,
        title: sub.title,
        author: sub.author,
        image: sub.imageUrl,
      }));
    }
    return followedList.map((feed) => ({
      id: feed.id,
      title: feed.title,
      author: feed.author || feed.ownerName,
      image: feed.image,
    }));
  }, [subscriptions, followedList]);

  return (
    <MainLayout>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold">Your Library</h1>

        {/* Saved Episodes */}
        <section>
          <div>
            <h2>Saved Episodes</h2>
            <div className="pt-4 space-y-4">
              {episodes.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  You have no saved episodes yet.
                </div>
              ) : (
                episodes.map((ep, idx) => (
                  <EpisodeCard key={`${ep.id ?? idx}`} episode={ep} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Followed Podcasts */}
        <section>
          <div>
            <h2>Followed Podcasts</h2>
            <div className="pt-4">
              {displayItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  You are not following any podcasts yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {displayItems.map((feed) => (
                    <Link
                      key={feed.id}
                      to={`/podcast/${feed.id}`}
                      className="group block rounded-2xl bg-card border p-4 text-center hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={feed.image}
                        alt="art"
                        className="w-28 h-28 mx-auto rounded-xl object-cover bg-muted shadow-sm"
                      />
                      <div className="mt-3 text-sm font-medium truncate group-hover:underline">
                        {feed.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {feed.author}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default LibraryPage;
