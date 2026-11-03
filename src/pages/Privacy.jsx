import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const FB = "#1877f2";
const CONTACT_EMAIL = "afterthefallbb@gmail.com";

// Plain-language privacy policy. Written against what the app actually does:
// account + social sign-in, profiles, events/CliQs, posts/photos/videos,
// messages, reactions, listings, map location, and private selfie verification.
const SECTIONS = [
  {
    title: "1. Who we are",
    body: [
      "Social Kingdom is a community app for finding and hosting local gatherings, sharing posts, photos and videos, and messaging people nearby.",
      "Social Kingdom is the controller of the information described here. Questions or requests: " + CONTACT_EMAIL + ".",
      "This policy was last updated on November 3, 2026.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Account information: your email address, your name, and how you sign in (email and password, Google, Microsoft, Facebook or Apple). Passwords are stored in hashed form by our hosting provider; we never see them.",
      "Profile information you choose to add: profile photo, cover photo, bio, interests and tags, city, birthday, and relationship status.",
      "Content you create: events and CliQs (including the place you pin on the map), posts, photos, videos, comments, reactions, listings, group memberships, and friend connections.",
      "Messages: the messages you send to other people in the app, including any images you attach.",
      "Location: the map coordinates you set for an event or listing, and the city you add to your profile. If you allow it, your device location is used to centre the map near you; we do not store your device location as a location history.",
      "Camera, photos and microphone: only when you choose to take or upload a photo, record a video, or capture a verification selfie.",
      "Verification selfie (if you complete verification): see section 4.",
      "Technical information: device and browser type, IP address, and error/diagnostic logs needed to keep the app working and safe.",
    ],
  },
  {
    title: "3. How we use your information",
    body: [
      "To create and run your account, and to show you and other people the content you choose to share.",
      "To place events, CliQs and listings on the map so people can find gatherings near them.",
      "To deliver your messages and notifications, and to show reactions and comments on posts and videos.",
      "To keep the community safe: age-based contact limits for younger members, blocking, duplicate-account detection, and reviewing reports of abuse.",
      "To fix problems, prevent fraud and abuse, and meet legal obligations.",
      "We do not sell your personal information, and we do not use your content or messages for advertising.",
    ],
  },
  {
    title: "4. Verification selfies",
    body: [
      "If you complete identity verification, your selfie is uploaded to private storage (never a public link). An automated vision system checks that the image shows a real, live person.",
      "A successful selfie is kept privately as your reference photo. It is used only to stop one face being used for multiple accounts and to confirm that a profile photo you upload matches you. It is never shown on your profile, in the map, or to other members.",
      "You can ask us to delete your verification selfie at any time by emailing " + CONTACT_EMAIL + ", and it is deleted when you delete your account.",
    ],
  },
  {
    title: "5. What other people can see",
    body: [
      "Public: your name, profile photo, bio, public events and CliQs, posts, videos, comments, reactions, listings, and friend connections.",
      "Private events and CliQs are visible only to the people you invite or approve, and personal gatherings are kept off the public map.",
      "Messages and group chats are visible only to the people in that conversation.",
      "Never public: your email address, your password, your verification selfie, and your device location.",
    ],
  },
  {
    title: "6. Who we share information with",
    body: [
      "Our platform provider, which hosts the app, database and file storage on our behalf.",
      "Sign-in providers you choose (Google, Microsoft, Facebook, Apple), which confirm your identity to us. They receive only what is needed to sign you in.",
      "Embedded players: when you watch a YouTube or TikTok clip inside the app, or open a Spotify link, that provider's player loads and may set its own cookies and collect data under its own privacy policy.",
      "Automated processing providers used for verification and moderation, which receive only the specific image or content being checked.",
      "Authorities, only where the law requires it, or where it is necessary to protect someone's safety.",
      "We do not sell or rent your personal information to anyone.",
    ],
  },
  {
    title: "7. Children and younger members",
    body: [
      "Social Kingdom is not intended for children under 13, and we do not knowingly collect information from them. If you believe a child under 13 has created an account, email us and we will remove it.",
      "Members under 18 should use the app with a parent or guardian's permission.",
      "Safety limits are built in: a member aged 15 or younger can only message or add people aged 19 or younger, and cannot contact adults.",
    ],
  },
  {
    title: "8. Your choices and rights",
    body: [
      "You can edit or delete your profile, posts, photos, videos, events, listings and comments in the app at any time.",
      "You can block another member, and you can delete your account in the app (Profile > account settings > delete account). Deleting your account removes your profile and content, and your verification selfie.",
      "You can ask us for a copy of your information, or ask us to correct or delete it, by emailing " + CONTACT_EMAIL + ".",
      "If you are in a region with privacy laws such as the GDPR or CCPA, you also have the right to object to or restrict certain processing and to complain to your local data protection authority.",
    ],
  },
  {
    title: "9. How long we keep information",
    body: [
      "We keep your account and content while your account is open. When you delete your account, we delete your personal information and content, except where we must keep limited records to meet legal, tax or safety obligations, or to resolve an open report.",
      "Diagnostic logs are kept for a short period and then deleted.",
    ],
  },
  {
    title: "10. Security",
    body: [
      "Data is sent over encrypted connections and stored with our platform provider, which restricts access to it.",
      "Profile photos and event images you post publicly have public links. Verification selfies, messages and private events are stored with restricted access.",
      "No service can promise perfect security, but we limit who can access data and review our practices as the app grows.",
    ],
  },
  {
    title: "11. Cookies and local storage",
    body: [
      "We use your browser's local storage to keep you signed in and to remember that you have seen onboarding and welcome screens.",
      "Embedded YouTube, TikTok and Spotify players may set their own cookies when you play something. Blocking cookies in your browser will not stop you using the rest of the app.",
    ],
  },
  {
    title: "12. Changes to this policy",
    body: [
      "If we make a material change, we will update this page and change the date at the top, and where appropriate tell you in the app.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <Link to="/browse" className="p-1" aria-label="Back">
          <ChevronLeft size={24} style={{ color: FB }} />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Privacy Policy</span>
      </div>

      <div className="px-4 mt-5 space-y-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          This policy explains what Social Kingdom collects, why, who can see it, and the choices you have.
        </p>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="font-bold text-gray-900 text-base mb-2">{section.title}</h2>
            <div className="space-y-2">
              {section.body.map((p) => (
                <p key={p} className="text-sm text-gray-600 leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Questions about your privacy? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline" style={{ color: FB }}>
              {CONTACT_EMAIL}
            </a>{" "}
            or visit our{" "}
            <Link to="/support" className="font-semibold underline" style={{ color: FB }}>
              Support
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}