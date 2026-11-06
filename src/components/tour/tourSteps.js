/* The onboarding walk. Each step points at something already on screen (marked
   with data-tour) or moves to the page it needs, so the tour stays short. */
export const TOUR_KEY = "sk_tour_done_v1";

export const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Social Kingdom",
    body: "A 20-second look around: your profile, your stream, the map and how to start your own gathering.",
    cta: "Start the tour",
  },
  {
    id: "profile",
    route: "/",
    target: '[data-tour="profile-link"]',
    title: "This is you",
    body: "Tap your photo any time to open your personal profile — your photos, events and videos all live there.",
  },
  {
    id: "feed",
    route: "/",
    target: '[data-tour="hub-feed"]',
    title: "Your stream",
    body: "Videos, events, artists and CliQs from people near you, all in one feed.",
  },
  {
    id: "map",
    route: "/map",
    target: '[data-tour="categories"]',
    title: "The map",
    body: "Every local party, gathering and get-together around you — so you can meet new people nearby.",
  },
  {
    id: "events",
    route: "/map",
    target: '[data-tour="event-list"]',
    title: "Who's going",
    body: "Tap a gathering to see who's going, the photos and posts, and get directions.",
  },
  {
    id: "create",
    route: "/map",
    target: '[data-tour="create-button"]',
    title: "Start your own",
    body: "Tap the + to create a party or get-together and invite your friends.",
  },
  {
    id: "signup",
    title: "Ready to join?",
    body: "Create a profile with Google, Apple, Facebook or email. It takes a few seconds.",
    cta: "Create my profile",
    action: "signup",
  },
];