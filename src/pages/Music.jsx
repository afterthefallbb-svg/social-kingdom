import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import SpotifyPlayer from "@/components/music/SpotifyPlayer";
import SpotifyLinkForm from "@/components/music/SpotifyLinkForm";
import MusicGenres from "@/components/music/MusicGenres";
import { SPOTIFY_GENRES } from "@/components/music/spotifySources";

export default function Music() {
  const navigate = useNavigate();
  const [source, setSource] = useState({ ...SPOTIFY_GENRES[0], type: "playlist" });
  return (
    <div className="min-h-screen bg-background pb-28 font-body">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button type="button" onClick={() => navigate("/browse")} aria-label="Back to browse" className="p-1 text-black">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Music</h1>
      </div>
      <div className="ml-4 mt-2 h-[3px] w-12 rounded-full bg-foreground" />
      <div className="mt-5 px-4">
        <p className="text-sm text-muted-foreground">
          Listen with Spotify here. Choose a genre or load a Spotify link, then press Play in the player.
        </p>
        <SpotifyLinkForm onLoadSource={setSource} />
        <SpotifyPlayer key={`${source.type}/${source.id}`} source={source} />
        <MusicGenres genres={SPOTIFY_GENRES} source={source} onSelect={setSource} />
      </div>
    </div>
  );
}