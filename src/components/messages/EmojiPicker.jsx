import React from "react";

const EMOJIS = [
  "😀","😄","😁","😂","🤣","😊","😍","😘","😎","🤩","🥳","😜",
  "🤔","🤨","😅","😭","😢","😡","👍","👎","👏","🙏","💪","🎉",
  "🔥","✨","❤️","💔","💯","👀","🙌","🤝","👑","🎶","📸","🥂",
  "☕","🍕","🍔","🌮","🏁","⚽","🏀","🏆","🎁","💡","⭐","✅"
];

export default function EmojiPicker({ onPick }) {
  return (
    <div className="border-t bg-white p-2 max-h-44 overflow-y-auto grid grid-cols-8 gap-1">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onPick(e)}
          className="text-2xl leading-none rounded-lg hover:bg-gray-100 py-1"
        >
          {e}
        </button>
      ))}
    </div>
  );
}