import { useSyncExternalStore } from "react";
import { subscribeVerified, getVerifiedSnapshot } from "@/lib/verified";

export default function useVerified() {
  return useSyncExternalStore(subscribeVerified, getVerifiedSnapshot, getVerifiedSnapshot);
}