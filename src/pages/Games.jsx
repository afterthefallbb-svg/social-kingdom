import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { GAME_GENRES } from "@/lib/gameCategories";
import GameRow from "@/components/games/GameRow";
import GamePlayer from "@/components/games/GamePlayer";
import { Image } from "@/components/ui/image";
import { Play, Gamepad2 } from "lucide-react";

const FB = "#1877f2";
const MY_GAMES_KEY = "sk_my_games";
const CURRENT_GAMES_KEY = "sk_current_games";

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export default function Games() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all"); // all | my | current
  const [activeGame, setActiveGame] = useState(null);
  const [myGames, setMyGames] = useState([]);
  const [currentGames, setCurrentGames] = useState([]);

  useEffect(() => {
    setMyGames(readList(MY_GAMES_KEY));
    setCurrentGames(readList(CURRENT_GAMES_KEY));
  }, []);

  // When a game opens: add it to current games (remove from my games while playing)
  function handleGameOpen(game) {
    const cur = readList(CURRENT_GAMES_KEY).filter((g) => g.embed !== game.embed);
    cur.unshift({ title: game.title, embed: game.embed, image: game.image, openedAt: Date.now() });
    writeList(CURRENT_GAMES_KEY, cur.slice(0, 20));
    setCurrentGames(cur);
  }

  // When a game closes: move it from current to my games (history)
  function handleGameClose() {
    if (!activeGame) return;
    const cur = readList(CURRENT_GAMES_KEY).filter((g) => g.embed !== activeGame.embed);
    writeList(CURRENT_GAMES_KEY, cur);
    setCurrentGames(cur);

    const my = readList(MY_GAMES_KEY).filter((g) => g.embed !== activeGame.embed);
    my.unshift({ title: activeGame.title, embed: activeGame.embed, image: activeGame.image, playedAt: Date.now() });
    writeList(MY_GAMES_KEY, my.slice(0, 50));
    setMyGames(my);
    setActiveGame(null);
  }

  const tabs = [
    { key: "all", label: "All Games" },
    { key: "my", label: "My Games" },
    { key: "current", label: "Current Games" },
  ];

  const displayedGames = tab === "my" ? myGames : tab === "current" ? currentGames : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#000000" }}>
            <ChevronLeft size={22} /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">Games</h1>
          <div className="w-9" />
        </div>

        {/* Scrollable toggle bar */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-3 pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                tab === t.key ? "text-white" : "bg-gray-100 text-gray-600"
              }`}
              style={tab === t.key ? { background: FB } : {}}
            >
              {t.label}
              {t.key === "current" && currentGames.length > 0 && (
                <span className="ml-1.5 text-xs opacity-80">{currentGames.length}</span>
              )}
              {t.key === "my" && myGames.length > 0 && (
                <span className="ml-1.5 text-xs opacity-80">{myGames.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "all" ? (
        <div className="pt-3 space-y-4">
          {GAME_GENRES.map((g) => (
            <GameRow key={g.name} genre={g} onPlay={setActiveGame} />
          ))}
        </div>
      ) : (
        <div className="pt-3 px-3">
          {displayedGames.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: FB + "18" }}>
                <Gamepad2 size={30} color={FB} />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {tab === "my"
                  ? "You haven't played any games yet. Tap a game to start playing!"
                  : "No games in progress right now. Pick one from All Games to start playing!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5">
              {displayedGames.map((g) => (
                <button
                  key={g.embed}
                  onClick={() => setActiveGame(g)}
                  className="flex flex-col items-center"
                >
                  <span className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                    {g.image ? (
                      <Image src={g.image} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl">🎮</span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play size={18} className="text-white fill-white" />
                    </span>
                    {tab === "current" && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </span>
                  <span className="text-[10px] text-gray-700 text-center leading-tight line-clamp-2 w-full mt-1">
                    {g.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full-screen game player */}
      <GamePlayer
        game={activeGame}
        onClose={handleGameClose}
        onOpen={handleGameOpen}
      />
    </div>
  );
}