/* Category markers are illustrated as the thing the event actually is — a car,
   a football, a martini glass, a church — modelled with volume: lit tops,
   shaded undersides, specular sweeps and a soft contact shadow, so each one
   lifts off the map like a small object resting on it. Nothing is wrapped in a
   pin, disc, cone or outline: the object IS the marker. */

let uid = 0;

const GROUND = (p, cx, rx, ry) =>
  `<ellipse cx="${cx}" cy="45.4" rx="${rx}" ry="${ry}" fill="url(#${p}-ground)"/>`;

const ART = {
  /* ---------------- automotive: glossy sports sedan ---------------- */
  automotive(p) {
    const defs = `
    <linearGradient id="${p}-body" x1="9" y1="13" x2="27" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FF7B85"/><stop offset=".22" stop-color="#E0394C"/>
      <stop offset=".55" stop-color="#B01328"/><stop offset=".82" stop-color="#78081A"/>
      <stop offset="1" stop-color="#4A0410"/>
    </linearGradient>
    <linearGradient id="${p}-glass" x1="17" y1="16" x2="31" y2="25" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#BFE3F7"/><stop offset=".45" stop-color="#5C90B4"/>
      <stop offset="1" stop-color="#152A3D"/>
    </linearGradient>
    <linearGradient id="${p}-rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FDFEFF"/><stop offset=".5" stop-color="#C3CBD4"/>
      <stop offset="1" stop-color="#6C7683"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 19, 4)}
    <path d="M4.4 33.4c0-4 1.9-6.4 5.4-7.4l5.3-1.6 4.4-6.1c1.4-2 3.4-3 6-3h8c2.9 0 5.1 1.3 6.5 3.7l3.5 6.1c2.2 1.1 3.4 3.2 3.4 6v3.3c0 1.6-1 2.5-2.6 2.5H7c-1.7 0-2.6-.9-2.6-2.5z" fill="url(#${p}-body)"/>
    <path d="M18.2 22.4l3.8-5.5c.7-1 1.6-1.5 2.8-1.5h4.1c1.4 0 2.5.6 3.2 1.8l3.2 5.2z" fill="url(#${p}-glass)"/>
    <path d="M27.6 15.5v6.9" stroke="#7E0A1C" stroke-width="1.3" opacity=".85"/>
    <path d="M8.1 26.6c6.2-1.7 14.6-2.5 22.6-2.1" stroke="#FFDCE1" stroke-width="1" opacity=".6" fill="none"/>
    <path d="M5.1 30.4c7-1.2 17-1.6 26.2-1.2" stroke="#2A0309" stroke-width=".8" opacity=".35" fill="none"/>
    <ellipse cx="41" cy="27.6" rx="2.1" ry="1.35" fill="#FFF6D2"/>
    <ellipse cx="7" cy="28.4" rx="1.6" ry="1.15" fill="#FF5A5A" opacity=".9"/>
    <circle cx="14.6" cy="34.4" r="5.1" fill="#14161A"/>
    <circle cx="33.6" cy="34.4" r="5.1" fill="#14161A"/>
    <circle cx="14.6" cy="34.4" r="2.7" fill="url(#${p}-rim)"/>
    <circle cx="33.6" cy="34.4" r="2.7" fill="url(#${p}-rim)"/>
    <circle cx="14.6" cy="34.4" r=".95" fill="#2B3440"/>
    <circle cx="33.6" cy="34.4" r=".95" fill="#2B3440"/>`;
    return { defs, body };
  },

  /* ---------------- sports: leather football ---------------- */
  sports(p) {
    const defs = `
    <radialGradient id="${p}-skin" cx=".36" cy=".26" r=".92">
      <stop offset="0" stop-color="#D79A5E"/><stop offset=".38" stop-color="#B06A2F"/>
      <stop offset=".74" stop-color="#8A481C"/><stop offset="1" stop-color="#4F270A"/>
    </radialGradient>`;
    const body = `
    ${GROUND(p, 24, 15, 3.2)}
    <g transform="rotate(-20 24 25)">
      <ellipse cx="24" cy="25" rx="17.2" ry="10.4" fill="url(#${p}-skin)"/>
      <path d="M11.6 17.6C8 19.3 6.8 22 6.8 25s1.2 5.7 4.8 7.4" fill="none" stroke="#F6E8D2" stroke-width="1.5" opacity=".85"/>
      <path d="M36.4 17.6c3.6 1.7 4.8 4.4 4.8 7.4s-1.2 5.7-4.8 7.4" fill="none" stroke="#3F1F07" stroke-width="1.4" opacity=".45"/>
      <path d="M18.1 25h11.8" stroke="#FBF7EC" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M19.6 22.3v5.4M22.9 22.3v5.4M26.2 22.3v5.4M29.5 22.3v5.4" stroke="#FBF7EC" stroke-width="1.15" stroke-linecap="round"/>
      <ellipse cx="18.6" cy="19.9" rx="6.4" ry="2.7" fill="#FFFFFF" opacity=".22"/>
      <path d="M24 14.6c6.6 0 11.6 2.6 14.4 6" fill="none" stroke="#FFE0BE" stroke-width=".9" opacity=".5"/>
    </g>`;
    return { defs, body };
  },

  /* ---------------- drinks: martini glass, nothing else ---------------- */
  drinks(p) {
    const defs = `
    <linearGradient id="${p}-glass" x1="8" y1="10" x2="34" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".92"/>
      <stop offset=".42" stop-color="#DCEFFB" stop-opacity=".55"/>
      <stop offset=".72" stop-color="#9FCADF" stop-opacity=".45"/>
      <stop offset="1" stop-color="#EAF7FF" stop-opacity=".7"/>
    </linearGradient>
    <linearGradient id="${p}-stem" x1="22.9" y1="0" x2="25.1" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#B9D8E8"/><stop offset=".45" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#8FB4C8"/>
    </linearGradient>
    <linearGradient id="${p}-liquid" x1="10" y1="12" x2="28" y2="26" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF6D8"/><stop offset=".5" stop-color="#EFCE84"/>
      <stop offset="1" stop-color="#C79A45"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 11, 2.6)}
    <ellipse cx="24" cy="41.2" rx="8.9" ry="2.5" fill="url(#${p}-stem)"/>
    <ellipse cx="24" cy="40.6" rx="8.9" ry="2.5" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width=".6"/>
    <path d="M23.15 26.6h1.7v13.2h-1.7z" fill="url(#${p}-stem)"/>
    <path d="M7.4 11.1h33.2L24 28.6z" fill="url(#${p}-glass)"/>
    <path d="M11.8 13.3h24.4L24 25.8z" fill="url(#${p}-liquid)" opacity=".95"/>
    <path d="M11.8 13.3h24.4" stroke="#FFFDF2" stroke-width="1.1" opacity=".9"/>
    <ellipse cx="24" cy="11.1" rx="16.6" ry="1.85" fill="none" stroke="#FFFFFF" stroke-opacity=".95" stroke-width="1"/>
    <path d="M13.6 14.2 22 24.4" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.05" stroke-linecap="round"/>
    <path d="M32.2 13.9 25.6 22.2" stroke="#FFFFFF" stroke-opacity=".4" stroke-width=".9" stroke-linecap="round"/>
    <path d="M9.2 11.1h2.2" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>`;
    return { defs, body };
  },

  /* ---------------- religious: stone church with gold cross ---------------- */
  religious(p) {
    const defs = `
    <linearGradient id="${p}-stone" x1="12" y1="28" x2="34" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFDF6"/><stop offset=".5" stop-color="#EFE5D2"/>
      <stop offset="1" stop-color="#C6B79C"/>
    </linearGradient>
    <linearGradient id="${p}-slate" x1="10" y1="16" x2="34" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#93A5B8"/><stop offset=".45" stop-color="#5C6E82"/>
      <stop offset="1" stop-color="#2A3846"/>
    </linearGradient>
    <linearGradient id="${p}-gold" x1="21" y1="2" x2="27" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF4C9"/><stop offset=".5" stop-color="#E8C25B"/>
      <stop offset="1" stop-color="#A9761B"/>
    </linearGradient>
    <linearGradient id="${p}-door" x1="21" y1="36" x2="27" y2="45" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8A5B31"/><stop offset="1" stop-color="#3A2312"/>
    </linearGradient>
    <linearGradient id="${p}-lit" x1="0" y1="32" x2="0" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF0BE"/><stop offset="1" stop-color="#F0BB4E"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 16, 3.2)}
    <rect x="20.8" y="9.4" width="6.4" height="16" rx=".8" fill="url(#${p}-stone)"/>
    <path d="M19.4 9.4 24 4.6l4.6 4.8z" fill="url(#${p}-slate)"/>
    <rect x="23.5" y="1.6" width="1.1" height="7" rx=".4" fill="url(#${p}-gold)"/>
    <rect x="21.5" y="3.5" width="5.1" height="1.1" rx=".4" fill="url(#${p}-gold)"/>
    <path d="M9 29.2 24 17.6 39 29.2z" fill="url(#${p}-slate)"/>
    <path d="M24 17.6 39 29.2" stroke="#B3C4D6" stroke-width=".85" opacity=".7" fill="none"/>
    <path d="M24 17.6 9 29.2" stroke="#1C2733" stroke-width=".85" opacity=".45" fill="none"/>
    <rect x="11.8" y="28.6" width="24.4" height="16.2" rx="1" fill="url(#${p}-stone)"/>
    <path d="M11.8 28.6h24.4" stroke="#FFFFFF" stroke-opacity=".75" stroke-width=".9"/>
    <rect x="14.6" y="33" width="4" height="6.4" rx="2" fill="url(#${p}-lit)"/>
    <rect x="29.4" y="33" width="4" height="6.4" rx="2" fill="url(#${p}-lit)"/>
    <path d="M14.6 36.2h4M29.4 36.2h4" stroke="#B98A2E" stroke-width=".5" opacity=".7"/>
    <path d="M20.7 44.8v-6.3a3.3 3.3 0 0 1 6.6 0v6.3z" fill="url(#${p}-door)"/>
    <circle cx="26.2" cy="41.4" r=".55" fill="#E8C25B"/>
    <rect x="18.6" y="44.4" width="10.8" height="1.6" rx=".6" fill="#B8AB92"/>`;
    return { defs, body };
  },

  /* ---------------- barbecue: kettle grill ---------------- */
  barbecue(p) {
    const defs = `
    <linearGradient id="${p}-char" x1="6" y1="12" x2="32" y2="26" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5B646F"/><stop offset=".3" stop-color="#333A43"/>
      <stop offset=".72" stop-color="#1B1F25"/><stop offset="1" stop-color="#0C0F13"/>
    </linearGradient>
    <linearGradient id="${p}-steel" x1="0" y1="23" x2="0" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F2F5F8"/><stop offset=".45" stop-color="#B7C0CA"/>
      <stop offset="1" stop-color="#6C7683"/>
    </linearGradient>
    <linearGradient id="${p}-bowl" x1="8" y1="26" x2="34" y2="35" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3B434D"/><stop offset=".55" stop-color="#1C2127"/>
      <stop offset="1" stop-color="#0A0D11"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 17, 3.2)}
    <path d="M13.4 31.4 9.6 45" stroke="#98A2AD" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M34.6 31.4 38.4 45" stroke="#98A2AD" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M24 33v11.4" stroke="#6E7883" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M4.8 25.2a19.2 9.4 0 0 0 38.4 0z" fill="url(#${p}-bowl)"/>
    <ellipse cx="24" cy="25.2" rx="19.2" ry="3.4" fill="url(#${p}-steel)"/>
    <path d="M4.8 25.2a19.2 12.2 0 0 1 38.4 0z" fill="url(#${p}-char)"/>
    <path d="M9.6 21.6a15.2 8.6 0 0 1 28.8 0" fill="none" stroke="#A9B4C0" stroke-opacity=".5" stroke-width="1.15"/>
    <path d="M20.6 12.2a4 3.1 0 0 1 6.8 0" fill="none" stroke="#1A1E24" stroke-width="1.7" stroke-linecap="round"/>
    <ellipse cx="24" cy="11.4" rx="1.5" ry=".85" fill="#0E1013"/>
    <path d="M6.4 25.2a17.6 2.9 0 0 0 35.2 0" fill="none" stroke="#D9A63C" stroke-opacity=".55" stroke-width=".9"/>
    <ellipse cx="24" cy="27.6" rx="14.6" ry="2" fill="#F08A2A" opacity=".22"/>`;
    return { defs, body };
  },

  /* ---------------- daycare: an adult with two toddlers ---------------- */
  daycare(p) {
    const defs = `
    <linearGradient id="${p}-skin" x1="0" y1="8" x2="0" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FBD9BC"/><stop offset="1" stop-color="#D9A277"/>
    </linearGradient>
    <linearGradient id="${p}-adult" x1="19" y1="16" x2="29" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2E9DB2"/><stop offset=".6" stop-color="#1A7386"/>
      <stop offset="1" stop-color="#0C4654"/>
    </linearGradient>
    <linearGradient id="${p}-kid1" x1="8" y1="24" x2="16" y2="35" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFD265"/><stop offset="1" stop-color="#D08E14"/>
    </linearGradient>
    <linearGradient id="${p}-kid2" x1="32" y1="24" x2="40" y2="35" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F98A7C"/><stop offset="1" stop-color="#BF3D33"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 18, 3.4)}
    <circle cx="24" cy="10.6" r="3.6" fill="url(#${p}-skin)"/>
    <path d="M20.4 10.2a3.7 3.7 0 0 1 7.3-.6c-1.3-.5-4.6-.7-7.3.6z" fill="#2B2119"/>
    <path d="M19.4 30.6v-9.4a4.9 4.9 0 0 1 9.8 0v9.4z" fill="url(#${p}-adult)"/>
    <path d="M21 30.6v9.6h2.6v-9.6zM24.4 30.6v9.6H27v-9.6z" fill="#123C48"/>
    <circle cx="11.8" cy="18.2" r="2.9" fill="url(#${p}-skin)"/>
    <path d="M8.9 17.9a3 3 0 0 1 5.9-.4c-1.1-.4-3.7-.6-5.9.4z" fill="#3B2A1C"/>
    <path d="M8.5 34.2v-9.8a3.35 3.35 0 0 1 6.7 0v9.8z" fill="url(#${p}-kid1)"/>
    <path d="M9.8 34.2v5.6h1.9v-5.6zM12.1 34.2v5.6h1.9v-5.6z" fill="#8A5A0C"/>
    <circle cx="36.2" cy="18.2" r="2.9" fill="url(#${p}-skin)"/>
    <path d="M33.3 17.9a3 3 0 0 1 6-.4c-1.2-.4-3.8-.6-6 .4z" fill="#3B2A1C"/>
    <path d="M32.9 34.2v-9.8a3.35 3.35 0 0 1 6.7 0v9.8z" fill="url(#${p}-kid2)"/>
    <path d="M34.2 34.2v5.6H36v-5.6zM36.5 34.2v5.6h1.9v-5.6z" fill="#7C231C"/>
    <path d="M20.6 21.6c-1.6 1-2.3 2.4-2.4 4M27.4 21.6c1.6 1 2.3 2.4 2.4 4" fill="none" stroke="#0C4654" stroke-width="1.5" stroke-linecap="round"/>`;
    return { defs, body };
  },

  /* ---------------- kids: plush teddy bear ---------------- */
  kids(p) {
    const defs = `
    <radialGradient id="${p}-fur" cx=".34" cy=".24" r=".92">
      <stop offset="0" stop-color="#EFB875"/><stop offset=".45" stop-color="#C98B49"/>
      <stop offset=".8" stop-color="#9E6428"/><stop offset="1" stop-color="#6B3E12"/>
    </radialGradient>
    <radialGradient id="${p}-muzzle" cx=".4" cy=".3" r=".85">
      <stop offset="0" stop-color="#FFF3DE"/><stop offset="1" stop-color="#DCC09A"/>
    </radialGradient>`;
    const body = `
    ${GROUND(p, 24, 12, 3)}
    <ellipse cx="15" cy="31.2" rx="3.1" ry="5" transform="rotate(18 15 31.2)" fill="url(#${p}-fur)"/>
    <ellipse cx="33" cy="31.2" rx="3.1" ry="5" transform="rotate(-18 33 31.2)" fill="url(#${p}-fur)"/>
    <ellipse cx="18.4" cy="41.4" rx="4.2" ry="3.2" fill="url(#${p}-fur)"/>
    <ellipse cx="29.6" cy="41.4" rx="4.2" ry="3.2" fill="url(#${p}-fur)"/>
    <ellipse cx="24" cy="34" rx="9.2" ry="9.4" fill="url(#${p}-fur)"/>
    <ellipse cx="24" cy="35.6" rx="5.6" ry="6.2" fill="url(#${p}-muzzle)" opacity=".85"/>
    <circle cx="16.6" cy="12.6" r="3.9" fill="url(#${p}-fur)"/>
    <circle cx="31.4" cy="12.6" r="3.9" fill="url(#${p}-fur)"/>
    <circle cx="16.6" cy="12.6" r="1.9" fill="#E4B183"/>
    <circle cx="31.4" cy="12.6" r="1.9" fill="#E4B183"/>
    <circle cx="24" cy="19" r="8.4" fill="url(#${p}-fur)"/>
    <ellipse cx="24" cy="22.4" rx="4.7" ry="3.5" fill="url(#${p}-muzzle)"/>
    <ellipse cx="24" cy="20.9" rx="1.4" ry="1.05" fill="#33221A"/>
    <path d="M24 21.9v1.4M22.3 23.5c.6.8 2.8.8 3.4 0" fill="none" stroke="#5A3A22" stroke-width=".7" stroke-linecap="round"/>
    <circle cx="20.9" cy="17.4" r=".95" fill="#302019"/>
    <circle cx="27.1" cy="17.4" r=".95" fill="#302019"/>
    <circle cx="21.2" cy="17.1" r=".32" fill="#FFFFFF" opacity=".8"/>
    <circle cx="27.4" cy="17.1" r=".32" fill="#FFFFFF" opacity=".8"/>
    <ellipse cx="19.8" cy="15.6" rx="3.4" ry="1.8" fill="#FFFFFF" opacity=".16"/>`;
    return { defs, body };
  },

  /* ---------------- professional: leather briefcase ---------------- */
  professional(p) {
    const defs = `
    <linearGradient id="${p}-leather" x1="6" y1="18" x2="30" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#B87B3F"/><stop offset=".28" stop-color="#93552A"/>
      <stop offset=".68" stop-color="#63320F"/><stop offset="1" stop-color="#381B06"/>
    </linearGradient>
    <linearGradient id="${p}-gold" x1="20" y1="27" x2="28" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF1C2"/><stop offset=".5" stop-color="#E2B455"/>
      <stop offset="1" stop-color="#A2721A"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 17, 3)}
    <path d="M17.6 20.4v-3a6.4 6.4 0 0 1 12.8 0v3" fill="none" stroke="#6B3A14" stroke-width="2.6" stroke-linecap="round"/>
    <rect x="4.8" y="19.6" width="38.4" height="21.8" rx="3.4" fill="url(#${p}-leather)"/>
    <path d="M4.8 26.9h38.4" stroke="#3F1E07" stroke-width="1.1" opacity=".6"/>
    <path d="M4.8 23.6h38.4" stroke="#FFD9A8" stroke-width=".7" opacity=".28"/>
    <rect x="20.4" y="25.2" width="7.2" height="5" rx="1.3" fill="url(#${p}-gold)"/>
    <circle cx="24" cy="27.2" r=".85" fill="#5A3E0B"/>
    <path d="M8 22.4c4-1.1 9-1.7 14-1.8" stroke="#FFE6C4" stroke-width=".8" opacity=".35" fill="none"/>
    <path d="M5.6 38.4h36.8" stroke="#240F02" stroke-width="1" opacity=".45"/>`;
    return { defs, body };
  },

  /* ---------------- resource fairs: folder of documents ---------------- */
  resource_fairs(p) {
    const defs = `
    <linearGradient id="${p}-manila" x1="7" y1="12" x2="30" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F6CE7C"/><stop offset=".5" stop-color="#DCA442"/>
      <stop offset="1" stop-color="#A5701C"/>
    </linearGradient>
    <linearGradient id="${p}-paper" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DEE3E8"/>
    </linearGradient>
    <linearGradient id="${p}-front" x1="6" y1="22" x2="30" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#E8B45C"/><stop offset=".55" stop-color="#C58D2C"/>
      <stop offset="1" stop-color="#8E5F14"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 18, 3)}
    <g transform="rotate(-6 24 20)">
      <rect x="9.4" y="9.4" width="29" height="20.4" rx="1.4" fill="url(#${p}-paper)"/>
      <path d="M14 15.2h19M14 19h19M14 22.8h13" stroke="#A9B4BF" stroke-width="1.1" stroke-linecap="round"/>
    </g>
    <g transform="rotate(4 24 20)">
      <rect x="10.6" y="11" width="27" height="18" rx="1.4" fill="#F3F6F8"/>
      <path d="M14.8 16h18M14.8 19.6h18M14.8 23.2h12" stroke="#B4BFC9" stroke-width="1" stroke-linecap="round"/>
    </g>
    <path d="M5.4 15.6h12.8l2.9 3.3h22.5v24.4a2.6 2.6 0 0 1-2.6 2.6H8a2.6 2.6 0 0 1-2.6-2.6z" fill="url(#${p}-manila)"/>
    <path d="M5.4 23.4h38.2v20.2a2.4 2.4 0 0 1-2.4 2.4H7.8a2.4 2.4 0 0 1-2.4-2.4z" fill="url(#${p}-front)"/>
    <path d="M5.4 23.4h38.2" stroke="#FFE6BC" stroke-width=".9" opacity=".65"/>
    <path d="M9 30.6h30" stroke="#8A5C12" stroke-width=".8" opacity=".35"/>`;
    return { defs, body };
  },

  /* ---------------- activities: hot air balloon ---------------- */
  activities(p) {
    const defs = `
    <linearGradient id="${p}-env" x1="10" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FF8F72"/><stop offset=".34" stop-color="#E2453F"/>
      <stop offset=".72" stop-color="#A6192E"/><stop offset="1" stop-color="#5F0A1C"/>
    </linearGradient>
    <linearGradient id="${p}-wood" x1="20" y1="37" x2="28" y2="45" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#D3A165"/><stop offset=".55" stop-color="#9A6530"/>
      <stop offset="1" stop-color="#5C3711"/>
    </linearGradient>
    <clipPath id="${p}-clip">
      <path d="M24 5.6c9.7 0 17.1 6.8 17.1 15.3 0 7.3-6.5 12.4-14.3 16.6h-5.6C13.4 33.3 6.9 28.2 6.9 20.9 6.9 12.4 14.3 5.6 24 5.6z"/>
    </clipPath>`;
    const body = `
    ${GROUND(p, 24, 13, 3)}
    <path d="M19.6 37.2 16 34M28.4 37.2 32 34M20.6 37.4l-1-3.1M27.4 37.4l1-3.1" stroke="#4A3A2A" stroke-width=".8" opacity=".8"/>
    <g clip-path="url(#${p}-clip)">
      <rect x="6.9" y="5.6" width="34.2" height="32" fill="url(#${p}-env)"/>
      <path d="M17.6 5.6c-3.4 3.8-5.4 9-5.4 14.9 0 4.9 1.5 9.4 4.2 13.1h-4.4C10.3 30 8.4 25.7 8.4 20.7c0-6.4 3.6-11.8 9.2-15.1z" fill="#FFE9B8" opacity=".5"/>
      <path d="M30.4 5.6c3.4 3.8 5.4 9 5.4 14.9 0 4.9-1.5 9.4-4.2 13.1h4.4c1.7-3.6 3.6-7.9 3.6-12.9 0-6.4-3.6-11.8-9.2-15.1z" fill="#3B0512" opacity=".45"/>
      <ellipse cx="18" cy="15.4" rx="5.4" ry="7" fill="#FFFFFF" opacity=".2"/>
    </g>
    <rect x="20.3" y="37" width="7.4" height="6.6" rx="1.4" fill="url(#${p}-wood)"/>
    <path d="M20.3 38.6h7.4M20.3 40.6h7.4M20.3 42.4h7.4" stroke="#4E2E0E" stroke-width=".55" opacity=".6"/>
    <path d="M19.9 37.2h8.2" stroke="#E8C25B" stroke-width="1" stroke-linecap="round"/>`;
    return { defs, body };
  },

  /* ---------------- parties: balloon cluster ---------------- */
  parties(p) {
    const defs = `
    <radialGradient id="${p}-red" cx=".34" cy=".26" r=".9">
      <stop offset="0" stop-color="#FF8D8D"/><stop offset=".45" stop-color="#E02F3C"/>
      <stop offset="1" stop-color="#8A0C1D"/>
    </radialGradient>
    <radialGradient id="${p}-gold" cx=".34" cy=".26" r=".9">
      <stop offset="0" stop-color="#FFEFB6"/><stop offset=".45" stop-color="#E9B93F"/>
      <stop offset="1" stop-color="#9C6E10"/>
    </radialGradient>
    <radialGradient id="${p}-teal" cx=".34" cy=".26" r=".9">
      <stop offset="0" stop-color="#9BEDE2"/><stop offset=".45" stop-color="#2AA79A"/>
      <stop offset="1" stop-color="#0A5A54"/>
    </radialGradient>`;
    const body = `
    ${GROUND(p, 24, 14, 3)}
    <path d="M10.8 31c2.6 3.4 5.6 6 8.4 9.2M37.2 31c-2.6 3.4-5.6 6-8.4 9.2M24 29v13.4" fill="none" stroke="#5F6B79" stroke-width=".75" opacity=".85"/>
    <ellipse cx="10.8" cy="24" rx="6.9" ry="8.1" fill="url(#${p}-gold)"/>
    <path d="M9.9 31.6h1.8l-.5 1.7h-.8z" fill="#8A6110"/>
    <ellipse cx="8.3" cy="20.4" rx="2" ry="2.7" transform="rotate(-22 8.3 20.4)" fill="#FFFFFF" opacity=".4"/>
    <ellipse cx="37.2" cy="24" rx="6.9" ry="8.1" fill="url(#${p}-teal)"/>
    <path d="M36.3 31.6h1.8l-.5 1.7h-.8z" fill="#0A4A45"/>
    <ellipse cx="34.7" cy="20.4" rx="2" ry="2.7" transform="rotate(-22 34.7 20.4)" fill="#FFFFFF" opacity=".4"/>
    <ellipse cx="24" cy="16.6" rx="9.6" ry="11.2" fill="url(#${p}-red)"/>
    <path d="M22.9 27.2h2.2l-.6 2h-1z" fill="#7A0A19"/>
    <ellipse cx="20.6" cy="12" rx="2.7" ry="3.6" transform="rotate(-24 20.6 12)" fill="#FFFFFF" opacity=".42"/>
    <circle cx="12.4" cy="14.6" r=".9" fill="#FFD77A" opacity=".8"/>
    <circle cx="35.2" cy="13.4" r=".8" fill="#8EE7DC" opacity=".8"/>`;
    return { defs, body };
  },

  /* ---------------- family: warm home ---------------- */
  family(p) {
    const defs = `
    <linearGradient id="${p}-wall" x1="10" y1="24" x2="34" y2="45" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF6E4"/><stop offset=".55" stop-color="#E8D3B4"/>
      <stop offset="1" stop-color="#BCA181"/>
    </linearGradient>
    <linearGradient id="${p}-roof" x1="8" y1="8" x2="34" y2="26" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#E1735A"/><stop offset=".45" stop-color="#B33F32"/>
      <stop offset="1" stop-color="#6E1C18"/>
    </linearGradient>
    <linearGradient id="${p}-light" x1="0" y1="30" x2="0" y2="38" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFEDB8"/><stop offset="1" stop-color="#EFB44C"/>
    </linearGradient>
    <linearGradient id="${p}-heart" x1="21" y1="26" x2="27" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FF7C86"/><stop offset="1" stop-color="#B4172C"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 17, 3.2)}
    <path d="M8.4 24.2 24 10.2l15.6 14V42a2.6 2.6 0 0 1-2.6 2.6H11a2.6 2.6 0 0 1-2.6-2.6z" fill="url(#${p}-wall)"/>
    <path d="M22.4 10.2h3.6l1.6 3.4h-6.8z" fill="#9C7F5E"/>
    <path d="M4.6 25.4 24 7.6l19.4 17.8-2.3 2.9L24 13.1 6.9 28.3z" fill="url(#${p}-roof)"/>
    <rect x="30.6" y="12.4" width="4" height="7.4" rx=".7" fill="#8A5B47"/>
    <rect x="11.8" y="30" width="5.2" height="5.6" rx="1" fill="url(#${p}-light)"/>
    <rect x="31" y="30" width="5.2" height="5.6" rx="1" fill="url(#${p}-light)"/>
    <path d="M14.4 30v5.6M11.8 32.8h5.2M33.6 30v5.6M31 32.8h5.2" stroke="#A9772A" stroke-width=".55" opacity=".8"/>
    <path d="M20.6 44.6v-8.2a3.4 3.4 0 0 1 6.8 0v8.2z" fill="#7A4A25"/>
    <circle cx="26" cy="40.4" r=".6" fill="#F0C766"/>
    <path d="M24 32.1c-1.4-1.5-3.6-.5-3.6 1.3 0 1.6 2.3 3.2 3.6 4.2 1.3-1 3.6-2.6 3.6-4.2 0-1.8-2.2-2.8-3.6-1.3z" fill="url(#${p}-heart)"/>
    <path d="M8.4 24.2 24 10.2" stroke="#FFD3C4" stroke-width=".7" opacity=".35"/>`;
    return { defs, body };
  },

  /* ---------------- artists: canvas on an easel ---------------- */
  artists(p) {
    const defs = `
    <linearGradient id="${p}-wood" x1="12" y1="10" x2="34" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#D9A96D"/><stop offset=".5" stop-color="#A5722F"/>
      <stop offset="1" stop-color="#5C3A12"/>
    </linearGradient>
    <linearGradient id="${p}-canvas" x1="11" y1="12" x2="34" y2="31" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFDF7"/><stop offset="1" stop-color="#E2E7EC"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 15, 3)}
    <path d="M14.4 44.4 19.6 26M33.6 44.4 28.4 26M24 44.4V25.4" stroke="url(#${p}-wood)" stroke-width="2" stroke-linecap="round"/>
    <rect x="11.4" y="11.6" width="25.2" height="18.4" rx="1.2" fill="url(#${p}-wood)"/>
    <rect x="12.9" y="13.1" width="22.2" height="15.4" rx=".7" fill="url(#${p}-canvas)"/>
    <path d="M15.4 24.6c2.6-4.4 5.2-6.6 7.8-6.6 3 0 3.6 3.4 6.4 3.4 1.6 0 3-1 4.3-3" fill="none" stroke="#2C8FB0" stroke-width="1.9" stroke-linecap="round"/>
    <circle cx="18.6" cy="16.6" r="1.9" fill="#E0443B"/>
    <circle cx="26.6" cy="20.4" r="1.5" fill="#E8B93C"/>
    <circle cx="22.8" cy="17.8" r="1.1" fill="#2E9E72"/>
    <rect x="10.4" y="9.4" width="27.2" height="2.6" rx="1.1" fill="url(#${p}-wood)"/>
    <path d="M20.6 30h6.8" stroke="url(#${p}-wood)" stroke-width="1.9" stroke-linecap="round"/>`;
    return { defs, body };
  },

  /* ---------------- local sales: shopping bag ---------------- */
  local_sale(p) {
    const defs = `
    <linearGradient id="${p}-bag" x1="9" y1="17" x2="33" y2="45" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#2FA98A"/><stop offset=".4" stop-color="#12775F"/>
      <stop offset=".78" stop-color="#0A4E3E"/><stop offset="1" stop-color="#04291F"/>
    </linearGradient>
    <linearGradient id="${p}-gold" x1="16" y1="12" x2="30" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF3C8"/><stop offset=".5" stop-color="#E2B455"/>
      <stop offset="1" stop-color="#A2721A"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 17, 3)}
    <path d="M18.2 18v-2.8a5.8 5.8 0 0 1 11.6 0V18" fill="none" stroke="url(#${p}-gold)" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M9.8 17.4h28.4l2.4 24.4a2.6 2.6 0 0 1-2.6 2.8H10a2.6 2.6 0 0 1-2.6-2.8z" fill="url(#${p}-bag)"/>
    <path d="M9.8 17.4h28.4l.6 5.4H9.2z" fill="#0B3D31" opacity=".85"/>
    <path d="M9.8 17.4h28.4" stroke="#8EE7C9" stroke-width=".8" opacity=".5"/>
    <path d="M13.6 23.4c1 7.2 1.6 13.6 1.8 19.4" stroke="#7FE0C1" stroke-width="1.1" opacity=".28" fill="none"/>
    <path d="M30.8 23.6c-.8 6.8-1.3 13-1.5 18.6" stroke="#001A13" stroke-width="1.4" opacity=".35" fill="none"/>
    <g transform="rotate(14 35 27)">
      <path d="M31.8 24.4h5.6v7.4h-5.6z" fill="#FBF6EA"/>
      <circle cx="32.9" cy="26" r=".8" fill="#0A4E3E"/>
    </g>`;
    return { defs, body };
  },

  /* ---------------- fallback: faceted gold gem ---------------- */
  general(p) {
    const defs = `
    <linearGradient id="${p}-gem" x1="13" y1="16" x2="31" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFF6D2"/><stop offset=".34" stop-color="#F0CB6B"/>
      <stop offset=".72" stop-color="#C08A22"/><stop offset="1" stop-color="#7A5010"/>
    </linearGradient>`;
    const body = `
    ${GROUND(p, 24, 11, 2.8)}
    <path d="M14.4 16.6h19.2L24 40.4z" fill="url(#${p}-gem)"/>
    <path d="M14.4 16.6 24 40.4 24 16.6z" fill="#FFFFFF" opacity=".18"/>
    <path d="M9.4 16.6 24 7.6l14.6 9z" fill="#FFF3C4"/>
    <path d="M9.4 16.6 24 7.6 24 16.6z" fill="#FFFFFF" opacity=".45"/>
    <path d="M14.4 16.6h19.2" stroke="#8A5E12" stroke-width=".7" opacity=".55"/>`;
    return { defs, body };
  },
};

export function pinArtSvg(categoryId, width, height) {
  const p = `skp${uid++}`;
  const make = ART[categoryId] || ART.general;
  const { defs, body } = make(p);
  return `<svg viewBox="0 0 48 48" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="sk-pin-svg" shape-rendering="geometricPrecision">
  <defs>
    ${defs}
    <radialGradient id="${p}-ground" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#050B24" stop-opacity=".42"/>
      <stop offset=".62" stop-color="#050B24" stop-opacity=".16"/>
      <stop offset="1" stop-color="#050B24" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${body}
</svg>`;
}