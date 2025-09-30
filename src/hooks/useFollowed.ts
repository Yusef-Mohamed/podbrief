import { useContext } from "react";
import { FollowedContext } from "@/contexts/FollowedContext";

export function useFollowed() {
  const ctx = useContext(FollowedContext);
  if (!ctx) throw new Error("useFollowed must be used within FollowedProvider");
  return ctx;
}
