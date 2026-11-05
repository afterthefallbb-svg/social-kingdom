import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/* Whether the person looking at the app has an account. Anyone without one can
   look around the hub and the example map, but nothing real is shown to them. */
export default function useGuest() {
  const [state, setState] = useState({ checking: true, me: null });

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((me) => alive && setState({ checking: false, me }))
      .catch(() => alive && setState({ checking: false, me: null }));
    return () => {
      alive = false;
    };
  }, []);

  return { checking: state.checking, me: state.me, guest: !state.checking && !state.me };
}