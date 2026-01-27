// ==UserScript==
// @name            Unit3D – Emoji & Media Picker (ThatNeoByte Edition)
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         1.0.3-tnb.2
// @description     Discord-style emoji, sticker, and GIF picker for Unit3D-based sites. Includes a small patch by ThatNeoByte; original script by ZukoXZoku.
//
// @author          ZukoXZoku
// @license         MIT
// @copyright       2025, ZukoXZoku
//
// @credits         Original script by ZukoXZoku
// @source          https://openuserjs.org/scripts/ZukoXZoku/Ultimate_Emojis
// @modified-by     ThatNeoByte (minor change)
//
// @icon            https://ptpimg.me/91xfz9.gif
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-EmojiMediaPicker.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-EmojiMediaPicker.user.js
//
// @include         *://darkpeers.org/*
// @include         *://upload.cx/*
// @include         *://rastastugan.org/*
// @include         *://lat-team.com/*
// @include         *://yu-scene.net/*
// @include         *://seedpool.org/*
// @include         *://infinityhd.net/*
// @include         *://generation-free.org/*
// @include         *://nordicq.org/*
// @include         *://infinitylibrary.net/*
// @include         *://malayabits.cc/*
// @include         *://samaritano.cc/*
// @include         *://sextorrent.myds.me/*
// @include         *://skipthecommercials.xyz/*
// @include         *://oldtoons.world/*
// @include         *://upscalevault.com/*
// @include         *://itatorrents.xyz/*
// @include         *://aither.cc/*
// @include         *://blutopia.cc/*
// @include         *://fearnopeer.com/*
// @include         *://lst.gg/*
// @include         *://reelflix.cc/*
// @include         *://homiehelpdesk.net/*
// @include         *://hd-united.vn/*
// @include         *://luminarr.me/*
// @include         *://rotorrent.info/*
// @include         *://onlyencodes.cc/*
// @exclude         *://onlyencodes.cc/widgets/*
//
// @grant           GM_addStyle
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_xmlhttpRequest
// @grant           GM_setClipboard
//
// @connect         raw.githubusercontent.com
// @connect         openuserjs.org
// @connect         tenor.googleapis.com
// @connect         api.giphy.com
// @connect         api.imgur.com
// @connect         api.tumblr.com
// @connect         reddit.com
// @connect         www.reddit.com
// ==/UserScript==

/* Note

Feel free to collaborate with me, I could use some help on this project.
I’m still learning JavaScript and sometimes use AI to maintain the script.
I’m not perfect, but I want to create something people can have fun with.
I do most of the work myself, and since I’m new to JavaScript, there are still things I’m figuring out.
I promise I’ll rely less on AI as I learn more; for now, I only use it for parts I don’t fully understand yet.

Thank you everyone!

Regards, ZukoXZoku ❤️✌️

*/

(function () {
  'use strict';

  if (typeof window.GM_addStyle !== 'function') {
    window.GM_addStyle = function (css) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    };
  }

  const STICKERS_JSON_URLS = [
    'https://raw.githubusercontent.com/ZukoXZoku/Ultimate-Emojis/refs/heads/main/stickers/stkrs.json'
  ];
  const VERSION = '1.0.3';
  const UI_VERSION = '1.0';

  const DEFAULTS = {
    emojiSize: 48,
    stickerSize: 256,
    gifSize: 140,
    gifInsertSize: 140,
    gifPerPage: 24,
    gifMinCol: 128,
    gifShowTitles: false,
    menuMinWidth: 370,
    menuMaxWidth: 700,
    menuMinHeight: 650,
    menuMaxHeightVh: 75,
    menuRadius: 10,
    tileRadius: 10,
    gapEmoji: 8,
    gapLarge: 10,
    bg: '#2f3136',
    bgAlpha: 1.0,
    text: '#dcddde',
    accent: '#5865f2',
    borderColor: '#3a3b41',
    borderWidth: 1,
    shadow: 0.6,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    uiFontSize: 14,
    tileBg: '#202225',
    hoverScale: 1.02,
    glowStrength: 10,
    starColor: '#f1c40f',
    starBg: 'rgba(0,0,0,.35)',
    starBorder: '#3a3b41',
    starTop: 6,
    starRight: 6,
    starSize: 28,
    starSmSize: 22,
    btnRadius: 8,
    searchRadius: 10,
    searchBorder: '#444',
    paginationBg: '#202225',
    paginationActiveBg: '#5865f2',
    paginationColor: '#b9bbbe',
    backdropBlur: 0,
    zIndex: 9999999,
    showGifStar: true,
    gifProvider: 'local',
    apiScope: 'global',
    redditSubs: 'gifs, HighQualityGifs, reactiongifs, wholesomegifs, aww_gifs, CatGifs, DogGifs, animegifs, gaminggifs, cinemagraphs',
    provTenor: true,
    provGiphy: true,
    provImgur: true,
    provTumblr: true,
    redditIncludeImages: false,
    localGifUrls: ''
  };

  const SETTINGS_KEY = 'uni_settings';
  const CUSTOM_CSS_KEY = 'uni_custom_css';
  function GM_GetValueSafe(k, d) { try { return GM_getValue(k, d); } catch { return d; } }
  function GM_SetValueSafe(k, v) { try { GM_setValue(k, v); } catch {} }
  const settings = Object.assign({}, DEFAULTS, (function () { try { return JSON.parse(GM_GetValueSafe(SETTINGS_KEY, '{}')); } catch { return {}; } })());
  const saveSettings = () => GM_SetValueSafe(SETTINGS_KEY, JSON.stringify(settings));

  const API_STORE_GLOBAL = 'uni_api_global';
  const API_STORE_SITE = `uni_api_site:${location.host}`;
  function readApiStore(scope) { const key = scope === 'site' ? API_STORE_SITE : API_STORE_GLOBAL; try { return JSON.parse(GM_GetValueSafe(key, '{}')) || {}; } catch { return {}; } }
  function writeApiStore(scope, obj) { const key = scope === 'site' ? API_STORE_SITE : API_STORE_GLOBAL; GM_SetValueSafe(key, JSON.stringify(obj || {})); }
  function getApiKey(provider) {
    const scope = settings.apiScope || 'global';
    const s1 = readApiStore(scope);
    const s2 = readApiStore(scope === 'site' ? 'global' : 'site');
    const pick = (s) => {
      if (provider === 'giphy') return s.giphyKey || '';
      if (provider === 'tenor') return s.tenorKey || '';
      if (provider === 'imgur') return s.imgurClientId || '';
      if (provider === 'tumblr') return s.tumblrKey || '';
      return '';
    };
    return pick(s1) || pick(s2) || '';
  }
  function setApiKey(provider, value) {
    const scope = settings.apiScope || 'global';
    const store = readApiStore(scope);
    if (provider === 'giphy') store.giphyKey = value || '';
    if (provider === 'tenor') store.tenorKey = value || '';
    if (provider === 'imgur') store.imgurClientId = value || '';
    if (provider === 'tumblr') store.tumblrKey = value || '';
    writeApiStore(scope, store);
  }

  const getEmojiInsertSize = () => Number(settings.emojiSize) || DEFAULTS.emojiSize;
  const getStickerInsertSize = () => Number(settings.stickerSize) || DEFAULTS.stickerSize;
  const getGifInsertSize = () => Number(settings.gifInsertSize || settings.gifSize) || DEFAULTS.gifSize;

  const EMOJI_COUNT = 29;
  const EMOJI_ORIGINS = [
    'https://raw.githubusercontent.com/ZukoXZoku/Ultimate-Emojis/main/emojis/emj',
    'https://cdn.jsdelivr.net/gh/ZukoXZoku/Ultimate-Emojis@main/emojis/emj'
  ];
  const EMOJI_URL_GROUPS = Array.from({ length: EMOJI_COUNT }, (_, i) => {
    const n = i + 1;
    return EMOJI_ORIGINS.map(base => `${base}${n}.json`);
  });
  EMOJI_URL_GROUPS.unshift(["https://raw.githubusercontent.com/ThatNeoByte/Emoji-s/refs/heads/main/emoji1.json", "https://raw.githubusercontent.com/ThatNeoByte/Emoji-s/refs/heads/main/emoji1.json"]);

  let allEmojis = [], filteredEmojis = [], currentEmojiPage = 1;
  let allStickers = [], filteredStickers = [], currentStickerPage = 1;
  let allGifs = [], gifsLoaded = false, localGifStatus = '';
  let currentGifPage = 1;
  let activeTab = 'emoji';
  let favOnlyEmoji = false, favOnlyStickers = false, favOnlyGifs = false;

  const FAV_KEYS = {
    emojiV2: 'uni_favoriteEmojis_v2',
    stickerV2: 'uni_favoriteStickers_v2',
    gifV2: 'uni_favoriteGifs_v2',
    emojiLegacy: 'uni_favoriteEmojis',
    stickerLegacy: 'uni_favoriteStickers',
    gifLegacy: 'uni_favoriteGifs',
    meta: 'uni_favMeta_v1'
  };
  const favEmojiV2 = new Set(JSON.parse(GM_GetValueSafe(FAV_KEYS.emojiV2, '[]')));
  const favStickerV2 = new Set(JSON.parse(GM_GetValueSafe(FAV_KEYS.stickerV2, '[]')));
  const favGifV2 = new Set(JSON.parse(GM_GetValueSafe(FAV_KEYS.gifV2, '[]')));
  const favEmojiLegacy = new Set(JSON.parse(GM_GetValueSafe(FAV_KEYS.emojiLegacy, '[]')));
  const favStickerLegacy = new Set(JSON.parse(GM_GetValueSafe(FAV_KEYS.stickerLegacy, '[]')));
  const favGifLegacy = new Set(JSON.parse(GM_GetValueSafe(FAV_KEYS.gifLegacy, '[]')));
  let favMeta = (function(){ try { return JSON.parse(GM_GetValueSafe(FAV_KEYS.meta, '{}')) || {}; } catch { return {}; } })();
  const saveFavV2 = (k, set) => GM_SetValueSafe(k, JSON.stringify([...set]));
  const saveFavLegacy = (k, set) => GM_SetValueSafe(k, JSON.stringify([...set]));
  const saveFavMeta = () => GM_SetValueSafe(FAV_KEYS.meta, JSON.stringify(favMeta || {}));

  function isFav(type, item) {
    if (!item) return false;
    if (type === 'emoji') return favEmojiV2.has(item.url) || favEmojiLegacy.has(item.name);
    if (type === 'sticker') return favStickerV2.has(item.url) || favStickerLegacy.has(item.name);
    if (type === 'gif') return favGifV2.has(item.url) || favGifLegacy.has(item.name);
    return false;
  }
  function favAdd(type, item) {
    if (!item || !item.url) return;
    const now = Date.now();
    if (type === 'emoji') { favEmojiV2.add(item.url); saveFavV2(FAV_KEYS.emojiV2, favEmojiV2); }
    if (type === 'sticker') { favStickerV2.add(item.url); saveFavV2(FAV_KEYS.stickerV2, favStickerV2); }
    if (type === 'gif') { favGifV2.add(item.url); saveFavV2(FAV_KEYS.gifV2, favGifV2); }
    favMeta[item.url] = { name: item.name || item.url.split('/').pop(), type, ts: now };
    saveFavMeta();
  }
  function favRemove(type, item) {
    if (!item) return;
    if (type === 'emoji') { favEmojiV2.delete(item.url); favEmojiLegacy.delete(item.name); saveFavV2(FAV_KEYS.emojiV2, favEmojiV2); saveFavLegacy(FAV_KEYS.emojiLegacy, favEmojiLegacy); }
    else if (type === 'sticker') { favStickerV2.delete(item.url); favStickerLegacy.delete(item.name); saveFavV2(FAV_KEYS.stickerV2, favStickerV2); saveFavLegacy(FAV_KEYS.stickerLegacy, favStickerLegacy); }
    else if (type === 'gif') { favGifV2.delete(item.url); favGifLegacy.delete(item.name); saveFavV2(FAV_KEYS.gifV2, favGifV2); saveFavLegacy(FAV_KEYS.gifLegacy, favGifLegacy); }
    if (favMeta[item.url]) { delete favMeta[item.url]; saveFavMeta(); }
  }
  function favToggle(type, item) { isFav(type, item) ? favRemove(type, item) : favAdd(type, item); }
  function sortFavFirstStable(arr, favSetV2, legacyNames) {
    return arr.slice().sort((a, b) => {
      const af = favSetV2.has(a.url) || legacyNames?.has(a.name);
      const bf = favSetV2.has(b.url) || legacyNames?.has(b.name);
      if (af && !bf) return -1;
      if (!af && bf) return 1;
      return a.originalIndex - b.originalIndex;
    });
  }

  const old = document.getElementById('uni-emoji-menu');
  if (old) old.remove();
  const container = document.createElement('div');
  container.id = 'uni-emoji-menu';
  document.body.appendChild(container);

  function showSoftNotice(msg) {
    try {
      let n = document.getElementById('uni-soft-notice');
      if (!n) {
        n = document.createElement('div');
        n.id = 'uni-soft-notice';
        Object.assign(n.style, { position: 'absolute', top: '6px', left: '12px', background: 'rgba(0,0,0,.55)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', zIndex: 1, pointerEvents: 'none' });
        container.appendChild(n);
      }
      n.textContent = msg;
      n.style.display = 'block';
      clearTimeout(n.__t);
      n.__t = setTimeout(() => (n.style.display = 'none'), 4500);
    } catch {}
  }

  function hexToRgba(hex, alpha) {
    const m = String(hex).trim().replace('#', '');
    const s = m.length === 3 ? m.split('').map(ch => ch+ch).join('') : m;
    const bigint = parseInt(s || '000000', 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    const a = Math.max(0, Math.min(1, Number(alpha) || 1));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  const cssBase = `
#uni-emoji-menu{
  --menu-min-width:${settings.menuMinWidth}px;
  --menu-max-width:${settings.menuMaxWidth}px;
  --menu-min-height:${settings.menuMinHeight}px;
  --menu-max-heightVh:${settings.menuMaxHeightVh}vh;
  --menu-radius:${settings.menuRadius}px;
  --tile-radius:${settings.tileRadius}px;
  --bg-rgba:${hexToRgba(settings.bg, settings.bgAlpha)};
  --text:${settings.text};
  --accent:${settings.accent};
  --border-color:${settings.borderColor};
  --border-width:${settings.borderWidth}px;
  --shadow:${settings.shadow};
  --emoji-tile:${settings.emojiSize}px;
  --sticker-tile-height:${settings.stickerSize}px;
  --gif-tile-height:${settings.gifSize}px;
  --media-tile-height:${settings.gifSize}px;
  --gif-min-col:${settings.gifMinCol}px;
  --gap-emoji:${settings.gapEmoji}px;
  --gap-large:${settings.gapLarge}px;
  --font-family:${settings.fontFamily};
  --ui-font-size:${settings.uiFontSize}px;
  --tile-bg:${settings.tileBg};
  --hover-scale:${settings.hoverScale};
  --glow-strength:${settings.glowStrength}px;
  --star-color:${settings.starColor};
  --star-bg:${settings.starBg};
  --star-border:${settings.starBorder};
  --star-top:${settings.starTop}px;
  --star-right:${settings.starRight}px;
  --star-size:${settings.starSize}px;
  --star-sm-size:${settings.starSmSize}px;
  --btn-radius:${settings.btnRadius}px;
  --search-radius:${settings.searchRadius}px;
  --search-border:${settings.searchBorder};
  --pagination-bg:${settings.paginationBg};
  --pagination-active-bg:${settings.paginationActiveBg};
  --pagination-color:${settings.paginationColor};
  --backdrop-blur:${settings.backdropBlur}px;
  --z:${settings.zIndex}
}
#uni-emoji-menu{
  position:fixed;
  top: calc(50% - max(var(--menu-min-height), 70vh) / 2);
  left: calc(50% - max(var(--menu-min-width), 50vw) / 2);
  width: 50vw;
  height: 70vh;
  min-width: var(--menu-min-width);
  max-width: var(--menu-max-width);
  min-height: var(--menu-min-height);
  max-height: var(--menu-max-heightVh);
  background-color:var(--bg-rgba);color:var(--text);
  border-radius:var(--menu-radius);
  border:var(--border-width) solid var(--border-color);
  box-shadow:0 8px 24px rgba(0,0,0,var(--shadow));
  padding:12px;display:none;
  font-family:var(--font-family);font-size:var(--ui-font-size);
  user-select:none;flex-direction:column;z-index:var(--z);
  backdrop-filter:blur(var(--backdrop-blur));
  overflow:hidden
}
#uni-emoji-menu .uni-header{display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:6px}
#uni-emoji-menu .uni-title{font-weight:700;font-size:16px;letter-spacing:.3px}
#uni-emoji-menu .uni-version{margin-left:6px;color:#aeb0b4;font-weight:600}
#uni-emoji-menu .uni-status{margin-left:8px;width:8px;height:8px;display:inline-block;border-radius:50%;background:#43b581;box-shadow:0 0 6px #43b581}
#uni-emoji-menu .dragbtn{color:#fefefe;left:8px;position:absolute;font-size:16px;cursor:move}
#uni-emoji-menu .exitbtn{color:#ff7373;cursor:pointer;right:8px;position:absolute;font-size:18px}
#uni-emoji-menu .topsearchbarbuttons{display:flex;gap:10px;margin:6px 0 8px 2px}
#uni-emoji-menu .hometab,#uni-emoji-menu .emojistab,#uni-emoji-menu .stickerstab,#uni-emoji-menu .giftab,#uni-emoji-menu .settingstab{
  font-weight:600;font-size:14px;color:#fff;background:none;border:none;border-radius:8px;padding:4px 12px;cursor:pointer;opacity:.85;transition:background .18s,color .18s,opacity .18s
}
#uni-emoji-menu .hometab:hover,#uni-emoji-menu .emojistab:hover,#uni-emoji-menu .stickerstab:hover,#uni-emoji-menu .giftab:hover,#uni-emoji-menu .settingstab:hover{background-color:#46484c;opacity:1}
#uni-emoji-menu .hometab.active,#uni-emoji-menu .emojistab.active,#uni-emoji-menu .stickerstab.active,#uni-emoji-menu .giftab.active,#uni-emoji-menu .settingstab.active{background:#46484c;opacity:1}
#uni-emoji-menu .settingstab{margin-left:auto}
#uni-emoji-menu #uni-emoji-toolbar,#uni-emoji-menu #uni-gif-toolbar,#uni-emoji-menu #uni-sticker-toolbar{display:flex;align-items:center;gap:10px;margin:6px 8px;flex-wrap:wrap}
#uni-emoji-menu #uni-emoji-search{
  z-index:998;position:sticky;top:0;background:linear-gradient(135deg,rgba(0,0,0,0),rgba(255,255,255,0.04));
  color:var(--text);height:36px;border:2px solid var(--search-border);border-radius:var(--search-radius);
  width:100%;padding:8px 14px;box-sizing:border-box;font-size:14px;box-shadow:0 2px 5px rgba(0,0,0,0.25);
  transition:all .2s ease;margin:5px 0 12px 0
}
#uni-emoji-menu #uni-emoji-search::placeholder{color:#8f93a2}
#uni-emoji-menu #uni-emoji-search:focus{background-color:rgba(255,255,255,0.05);box-shadow:0 0 6px var(--accent);color:#fff}
#uni-emoji-menu .srchxbtn{display:flex}
#uni-emoji-menu .uni-emoji-grid{display:grid;grid-template-columns:repeat(auto-fill,var(--emoji-tile));gap:var(--gap-emoji);justify-content:start;overflow-y:auto;flex-grow:1;padding:6px 8px 10px 8px}
#uni-emoji-menu .uni-emoji-tile{position:relative;width:var(--emoji-tile);height:var(--emoji-tile);display:flex;align-items:center;justify-content:center;background:var(--tile-bg);border-radius:6px}
#uni-emoji-menu .uni-emoji-tile img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;cursor:pointer;filter:drop-shadow(0 0 1px #000)}
#uni-emoji-menu .uni-emoji-tile:hover{transform:scale(var(--hover-scale));box-shadow:0 0 var(--glow-strength) var(--accent)}
#uni-emoji-menu .uni-sticker-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:var(--gap-large);
  justify-content:start;overflow-y:auto;flex-grow:1;padding:10px 8px 14px 8px;position:relative
}
#uni-emoji-menu .uni-gif-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--gif-min-col),1fr));gap:var(--gap-large);
  justify-content:start;overflow-y:auto;flex-grow:1;padding:10px 8px 14px 8px;position:relative
}
#uni-emoji-menu .uni-tile{
  position:relative;width:100%;height:var(--media-tile-height);background:var(--tile-bg);
  border-radius:var(--tile-radius);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.35)
}
#uni-emoji-menu .uni-tile img{max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--tile-radius);cursor:pointer}
#uni-emoji-menu .uni-tile:hover{transform:scale(var(--hover-scale));box-shadow:0 0 var(--glow-strength) var(--accent)}
#uni-emoji-menu .uni-star,#uni-emoji-menu .uni-star-sm{
  position:absolute;top:var(--star-top);right:var(--star-right);display:grid;place-items:center;background:var(--star-bg);
  border:1px solid var(--star-border);color:var(--star-color);border-radius:999px;cursor:pointer;line-height:1;user-select:none;
  opacity:0;transform:scale(.9);pointer-events:none;transition:opacity .14s ease,transform .14s ease
}
#uni-emoji-menu .uni-star{width:var(--star-size);height:var(--star-size);font-size:calc(var(--star-size)57)}
#uni-emoji-menu .uni-star-sm{width:var(--star-sm-size);height:var(--star-sm-size);font-size:calc(var(--star-sm-size)59)}
#uni-emoji-menu .uni-emoji-tile:hover .uni-star-sm,#uni-emoji-menu .uni-tile:hover .uni-star{opacity:1;transform:scale(1);pointer-events:auto}
#uni-emoji-menu .gif-title{position:absolute;left:8px;right:8px;bottom:8px;font-size:12px;color:#fff;background:rgba(0,0,0,.35);padding:4px 6px;border-radius:6px;max-height:44px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none}
#uni-emoji-menu .uni-pill{background:#202225;border:1px solid var(--border-color);color:#e3e5e8;border-radius:var(--btn-radius);padding:6px 12px;cursor:pointer;font-weight:600;font-size:13px;line-height:1.2}
#uni-emoji-menu .uni-pill.active{background:var(--accent);border-color:var(--accent);color:#fff}
#uni-emoji-menu .uni-pill:hover{background:#36393f}
#uni-emoji-menu .provider-btn{background:#202225;border:1px solid var(--border-color);color:#e3e5e8;border-radius:var(--btn-radius);padding:6px 10px;cursor:pointer;font-weight:600;font-size:13px;line-height:1.2}
#uni-emoji-menu .provider-btn:hover{background:#36393f}
#uni-emoji-menu .provider-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}
#uni-emoji-menu .uni-pagination{display:flex;justify-content:center;gap:6px;margin-top:8px;flex-wrap:wrap;user-select:none}
#uni-emoji-menu .uni-pagination button{background:var(--pagination-bg);border:none;border-radius:3px;color:var(--pagination-color);padding:6px 12px;font-size:14px;cursor:pointer;transition:background .2s,color .2s,box-shadow .2s;min-width:34px;font-weight:600}
#uni-emoji-menu .uni-pagination button:hover:not(.active){background:#36393f;color:#fff;box-shadow:0 0 5px var(--accent)}
#uni-emoji-menu .uni-pagination button.active{background:var(--pagination-active-bg);color:#fff;box-shadow:0 0 10px var(--accent)}
#uni-emoji-menu #uni-page-jump-container{display:flex;justify-content:center;gap:8px;margin-top:12px;user-select:none}
#uni-emoji-menu #uni-page-jump-container input[type="number"]{width:100px;padding:6px 8px;font-size:15px;border:none;border-radius:20px;background:#202225;color:#dcddde;box-shadow:inset 0 0 4px #000;text-align:center}
#uni-emoji-menu #uni-page-jump-container button{background:var(--accent);border:none;border-radius:5px;padding:6px 14px;color:#fff;font-weight:600;font-size:15px;cursor:pointer;box-shadow:0 0 8px var(--accent)}
#uni-emoji-menu #uni-page-jump-container button:hover{filter:brightness(.95)}
#uni-emoji-menu #uni-settings-panel{display:none;overflow-y:auto;flex-grow:1;padding:12px 10px}
#uni-emoji-menu .uni-section{background:rgba(0,0,0,.15);border:1px solid var(--border-color);border-radius:10px;padding:14px;margin:10px 0}
#uni-emoji-menu .uni-section h3{margin:0 0 10px 0;font-size:15px;color:#fff;line-height:1.3}
#uni-emoji-menu .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
#uni-emoji-menu .form{display: contents;}
#uni-emoji-menu .form label{min-width:auto}
#uni-emoji-menu .form .field-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
#uni-emoji-menu .api-form{display:grid;grid-template-columns:180px minmax(240px,1fr);gap:8px 12px;align-items:center}
#uni-emoji-menu .api-form label{min-width:auto}
#uni-emoji-menu .api-form .api-actions{grid-column:1 / -1;display:grid;grid-template-columns:auto auto auto 1fr;gap:8px;align-items:center}
#uni-emoji-menu input[type="number"].mini{width:100px}
#uni-emoji-menu input.api-key{width:100%}
#uni-emoji-menu input[type="text"].font-input{width:420px;max-width:100%}
#uni-emoji-menu input[type="color"]{width:36px;height:28px;padding:0;border:none;border-radius:6px}
#uni-emoji-menu select.font-input{height:30px;padding:4px 8px;border-radius:6px;border:1px solid var(--border-color);background:#202225;color:#e3e5e8}
#uni-emoji-menu .range{display:flex;align-items:center;gap:10px}
#uni-emoji-menu .range input[type="range"]{width:220px}
#uni-emoji-menu .help{opacity:.75;font-size:12px}
#uni-emoji-menu .btn{background:var(--accent);border:none;border-radius:8px;padding:6px 12px;color:#fff;font-weight:600;font-size:13px;cursor:pointer;line-height:1.2}
#uni-emoji-menu .btn.secondary{background:#202225;border:1px solid var(--border-color);color:#e3e5e8}
#uni-emoji-menu .btn.warn{background:#b93131}
#uni-emoji-menu .btn:hover{filter:brightness(.95)}
#uni-emoji-menu textarea.blockarea,#uni-emoji-menu textarea#styleJson,#uni-emoji-menu textarea#customCssArea{width:100%;min-height:120px;background:#1f2124;color:#e8e8e8;border:1px solid var(--border-color);border-radius:8px;padding:8px}
#uni-emoji-menu .status-badge{font-size:12px;margin-left:8px;opacity:.95}
#uni-emoji-menu .badge-ok{color:#43b581}
#uni-emoji-menu .badge-err{color:#ff6464}
#uni-emoji-menu #uni-changelog{max-height:180px;overflow:auto;margin-top:8px;background:#1f2023;border:1px solid #2a2c30;border-radius:6px;padding:8px}
#uni-emoji-menu .uni-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;opacity:.85;padding:16px}
#uni-emoji-menu #uni-home-panel{display:none;overflow-y:auto;flex-grow:1;padding:12px 10px}
#uni-emoji-menu .home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
#uni-emoji-menu .home-card{background:rgba(0,0,0,.15);border:1px solid var(--border-color);border-radius:8px;padding:12px;margin:10px;}
#uni-emoji-menu .home-card h4{margin:0 0 8px 0;font-size:14px}
#uni-emoji-menu .chip{display:inline-block;background:#202225;border:1px solid var(--border-color);border-radius:999px;padding:4px 10px;font-size:12px;margin-right:6px}
@media (max-width:1200px){
  #uni-emoji-menu .api-form{grid-template-columns:160px minmax(200px,1fr)}
  #uni-emoji-menu .api-form .api-actions{grid-template-columns:auto auto auto 1fr}
}
@media (max-width:900px){
  #uni-emoji-menu .form{grid-template-columns:1fr}
  #uni-emoji-menu .form .field-row{grid-template-columns:1fr}
  #uni-emoji-menu .form .field-row .btn{width:100%}
  #uni-emoji-menu .api-form{grid-template-columns:1fr}
  #uni-emoji-menu .api-form .api-actions{grid-template-columns:1fr 1fr 1fr}
  #uni-emoji-menu .api-form .api-actions .btn{width:100%}
  #uni-emoji-menu .api-form .api-actions .status-badge{grid-column:1 / -1;justify-self:start;margin-top:4px}
  #uni-emoji-menu .range input[type="range"]{width:100%}
}
@media (max-width:520px){
  #uni-emoji-menu .api-form .api-actions{grid-template-columns:1fr}
}
#uni-ctx-menu{position:fixed;z-index:2147483647;background:#2b2d31;color:#e3e5e8;border:1px solid #2a2c30;border-radius:8px;min-width:200px;box-shadow:0 8px 30px rgba(0,0,0,.5);padding:6px;display:none}
#uni-ctx-menu button{width:100%;text-align:left;background:transparent;border:none;color:#e3e5e8;padding:8px 10px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px}
#uni-ctx-menu button:hover{background:#3a3c43}
#global-emoji-button.emoji-button{position:fixed;right:15px;bottom:35px;z-index:2147483647;cursor:pointer;font-size:38px;display:inline-flex;align-items:center;justify-content:center;transition:transform .2s,filter .2s;user-select:none;filter:grayscale(100%)}
#global-emoji-button.emoji-button:hover{transform:scale(1.1);filter:grayscale(0%)}
  `;
  GM_addStyle(cssBase);
  let CURRENT_CSS_BASE = cssBase;

  container.innerHTML = `
    <div class="uni-header">
      <div class="dragbtn" title="Drag"><i class="fa-solid fa-up-down-left-right"></i></div>
      <div class="uni-title">Ultimate Emojis [Beta]<span class="uni-version">v${VERSION}</span><span class="uni-status"></span></div>
      <div class="exitbtn" title="Close">✕</div>
    </div>

    <div class="topsearchbarbuttons">
      <div class="hometab">Home</div>
      <div class="giftab">GIFs</div>
      <div class="stickerstab">Stickers</div>
      <div class="emojistab active">Emojis</div>
      <div class="settingstab" title="Settings"><i class="fa-solid fa-toolbox"></i></div>
    </div>

    <div id="uni-home-panel">
      <div class="uni-section">
        <h3>Ultimate Emojis - Stats</h3>
        <div class="home-grid">
          <div class="home-card">
            <h4>Menu</h4>
            <div>Name: <b>Ultimate Emojis - Beta</b></div>
            <div>Description: This is a beta version but everything works fine, <b>DON'T PANIC</b></div>
            <div>Version: <span id="home-version">v${VERSION}</span></div>
            <div style="margin:10px;display:flex;gap:8px;">
              <button class="btn" id="home-check-update">Check for Updates</button>
              <button class="btn secondary" id="home-open-download">Download Page</button>
              <span class="status-badge" id="home-update-status"></span>
            </div>
          </div>
          <div class="home-card">
            <h4>Content status</h4>
            <div class="chip">Emojis: <span id="home-emoji-count">loading…</span></div>
            <div class="chip">Stickers: <span id="home-sticker-count">loading…</span></div>
            <div class="chip">Local GIFs: <span id="home-localgifs-status">–</span></div>
          </div>
          <div class="home-card">
            <h4>Providers</h4>
            <div>Tenor: <span id="home-prov-tenor">–</span></div>
            <div>GIPHY: <span id="home-prov-giphy">–</span></div>
            <div>Imgur: <span id="home-prov-imgur">–</span></div>
            <div>Tumblr: <span id="home-prov-tumblr">–</span></div>
          </div>
        </div>
          <div><h3>📝Note:</h3>
            <b style="color: #df9328">I’m leaving this project open so anyone can contribute, improve, and create their own version.
            I don’t have time to keep developing it myself, and I’d rather not rely on AI to make the fixes.
            Now it’s your turn, jump in, support the project, and make it amazing!</b>
          </div>
      </div>
    </div>

    <div id="uni-emoji-toolbar" class="uni-toolbar" style="display:none">
      <button class="uni-pill" id="emojiFavOnly">Favorites only</button>
    </div>

    <div class="srchxbtn" style="display:none">
      <input type="text" id="uni-emoji-search" placeholder="Search...">
    </div>

    <div class="uni-emoji-grid" id="uni-emoji-grid" style="display:none"></div>

    <div id="uni-gif-toolbar" class="uni-toolbar" style="display:none">
      <span style="opacity:.7;font-size:12px;">Provider:</span>
      <button class="provider-btn" data-provider="local">Local</button>
      <button class="provider-btn" data-provider="tenor">Tenor</button>
      <button class="provider-btn" data-provider="giphy">GIPHY</button>
      <button class="provider-btn" data-provider="imgur">Imgur</button>
      <button class="provider-btn" data-provider="reddit">Reddit</button>
      <button class="provider-btn" data-provider="tumblr">Tumblr</button>
      <span style="flex:1"></span>
      <button class="uni-pill" id="gifFavOnly">Favorites only</button>
    </div>

    <div id="uni-sticker-toolbar" class="uni-toolbar" style="display:none">
      <button class="uni-pill" id="stickerFavOnly">Favorites only</button>
    </div>

    <div class="uni-sticker-grid" id="uni-sticker-grid" style="display:none"></div>
    <div class="uni-gif-grid" id="uni-gif-grid" style="display:none"></div>

    <div class="uni-pagination" id="uni-emoji-pagination" style="display:none"></div>
    <div id="uni-page-jump-container" style="display:none">
      <input type="number" id="uni-page-jump-input" min="1" placeholder="Page" />
      <button id="uni-page-jump-button">Go</button>
    </div>

    <div id="uni-settings-panel" style="display:none">
      <div class="uni-section">
        <h3>Local GIF packs</h3>
        <div class="row">
          <label>Pack URLs</label>
          <div style="flex:1"></div>
        </div>
        <textarea id="localGifUrlsArea" class="blockarea" placeholder="One URL per line (JSON packs)"></textarea>
        <div class="row" style="gap:8px;margin-top:8px;">
          <button class="btn" id="saveLocalGifs">Save</button>
          <button class="btn secondary" id="reloadLocalGifs">Reload</button>
          <span class="status-badge" id="st-localgifs"></span>
        </div>
      </div>

      <div class="uni-section">
        <h3>GIFs page</h3>
        <div class="row range">
          <label>Tile height</label>
          <input type="range" id="gifSize" min="100" max="360" step="4"><span id="gifSizeVal"></span>
        </div>
        <div class="row range">
          <label>Items per page</label>
          <input type="range" id="gifPerPage" min="12" max="60" step="12"><span id="gifPerPageVal"></span>
        </div>
        <div class="row range">
          <label>Min column width</label>
          <input type="range" id="gifMinCol" min="100" max="240" step="4"><span id="gifMinColVal"></span>
        </div>
        <div class="row" style="gap:14px;">
          <label class="radio"><input type="checkbox" id="showGifStar"> Show Favorite star</label>
          <label class="radio"><input type="checkbox" id="gifShowTitles"> Show titles overlay</label>
        </div>
        <div class="row" style="gap:10px;">
          <label>Default provider</label>
          <select id="defaultGifProvider" class="font-input" style="max-width:260px;">
            <option value="local">Local</option>
            <option value="tenor">Tenor</option>
            <option value="giphy">GIPHY</option>
            <option value="imgur">Imgur</option>
            <option value="reddit">Reddit</option>
            <option value="tumblr">Tumblr</option>
          </select>
        </div>
      </div>

      <div class="uni-section">
        <h3>GIF insert size</h3>
        <div class="row">
          <label class="radio"><input type="radio" name="gifInsertSize" value="120">120px</label>
          <label class="radio"><input type="radio" name="gifInsertSize" value="140">140px</label>
          <label class="radio"><input type="radio" name="gifInsertSize" value="180">180px</label>
          <label class="radio">Custom <input type="number" class="mini" id="gifInsertSizeCustom" min="50" max="1024" step="1" placeholder="px"></label>
        </div>
        <div class="help">Controls the [img=...] size when inserting GIFs.</div>
      </div>

      <div class="uni-section">
        <h3>GIF Providers</h3>
        <div class="row" style="gap:14px;">
          <label class="radio"><input type="checkbox" id="sw-tenor"> Tenor</label>
          <label class="radio"><input type="checkbox" id="sw-giphy"> GIPHY</label>
          <label class="radio"><input type="checkbox" id="sw-imgur"> Imgur</label>
          <label class="radio"><input type="checkbox" id="sw-tumblr"> Tumblr</label>
        </div>
        <div class="help">These toggles enable/disable buttons in the GIF tab. Local and Reddit are always available.</div>
      </div>

      <div class="uni-section">
        <h3>Import APIs</h3>
        <div class="row">
          <label>Scope</label>
          <label class="radio"><input type="radio" name="apiScope" value="global">Global</label>
          <label class="radio"><input type="radio" name="apiScope" value="site">Per-site (${location.host})</label>
          <span style="margin-left:auto;opacity:.8;font-size:12px;">Stored locally on this device only</span>
        </div>

        <div class="api-form" style="margin-top:6px;">
          <label>Tenor API key</label>
          <input type="password" class="api-key" id="tenorKey" placeholder="Enter Tenor API key">
          <div class="api-actions">
            <button class="btn secondary" id="showTenor">Show</button>
            <button class="btn secondary" id="saveTenor">Save</button>
            <button class="btn" id="testTenor">Test</button>
            <span class="status-badge" id="st-tenor"></span>
          </div>
        </div>

        <div class="api-form" style="margin-top:6px;">
          <label>GIPHY API key</label>
          <input type="password" class="api-key" id="giphyKey" placeholder="Enter GIPHY API key">
          <div class="api-actions">
            <button class="btn secondary" id="showGiphy">Show</button>
            <button class="btn secondary" id="saveGiphy">Save</button>
            <button class="btn" id="testGiphy">Test</button>
            <span class="status-badge" id="st-giphy"></span>
          </div>
        </div>

        <div class="api-form" style="margin-top:6px;">
          <label>Imgur Client-ID</label>
          <input type="password" class="api-key" id="imgurKey" placeholder="Enter Imgur Client-ID">
          <div class="api-actions">
            <button class="btn secondary" id="showImgur">Show</button>
            <button class="btn secondary" id="saveImgur">Save</button>
            <button class="btn" id="testImgur">Test</button>
            <span class="status-badge" id="st-imgur"></span>
          </div>
        </div>

        <div class="api-form" style="margin-top:6px;">
          <label>Tumblr API key</label>
          <input type="password" class="api-key" id="tumblrKey" placeholder="Enter Tumblr API key">
          <div class="api-actions">
            <button class="btn secondary" id="showTumblr">Show</button>
            <button class="btn secondary" id="saveTumblr">Save</button>
            <button class="btn" id="testTumblr">Test</button>
            <span class="status-badge" id="st-tumblr"></span>
          </div>
        </div>
      </div>

      <div class="uni-section">
        <h3>Reddit provider</h3>
        <div class="form reddit-form">
          <label>Subreddits</label>
          <div class="field-row">
            <input type="text" id="redditSubs" class="font-input" placeholder="gifs, HighQualityGifs, reactiongifs">
            <button class="btn secondary" id="saveRedditSubs">Save</button>
          </div>
        </div>
        <div class="row" style="margin-top:6px;">
          <label class="radio"><input type="checkbox" id="redditIncludeImages"> Include images (jpg/png/webp)</label>
        </div>
      </div>

      <div class="uni-section">
        <h3>Emoji size</h3>
        <div class="row">
          <label class="radio"><input type="radio" name="emojiSize" value="38">38px</label>
          <label class="radio"><input type="radio" name="emojiSize" value="48">48px</label>
          <label class="radio"><input type="radio" name="emojiSize" value="58">58px</label>
          <label class="radio">Custom <input type="number" class="mini" id="emojiSizeCustom" min="12" max="256" step="1" placeholder="px"></label>
        </div>
      </div>

      <div class="uni-section">
        <h3>Sticker size</h3>
        <div class="row">
          <label class="radio"><input type="radio" name="stickerSize" value="128">128px</label>
          <label class="radio"><input type="radio" name="stickerSize" value="256">256px</label>
          <label class="radio"><input type="radio" name="stickerSize" value="512">512px</label>
          <label class="radio">Custom <input type="number" class="mini" id="stickerSizeCustom" min="64" max="1024" step="1" placeholder="px"></label>
        </div>
      </div>

      <div class="uni-section">
        <h3>Appearance (Basic)</h3>
        <div class="row range"><label>Menu width</label><input type="range" id="menuWidth" min="480" max="1100" step="10"><span id="menuWidthVal"></span></div>
        <div class="row range"><label>Menu height</label><input type="range" id="menuHeightPx" min="360" max="1000" step="10"><span id="menuHeightPxVal"></span></div>
        <div class="row range"><label>Max height (vh)</label><input type="range" id="menuMaxHeightVh" min="40" max="95" step="1"><span id="menuMaxHeightVhVal"></span></div>
        <div class="row range"><label>Menu radius</label><input type="range" id="menuRadius" min="0" max="24" step="1"><span id="menuRadiusVal"></span></div>
        <div class="row range"><label>Tile radius</label><input type="range" id="tileRadius" min="0" max="20" step="1"><span id="tileRadiusVal"></span></div>
        <div class="row range"><label>UI font size</label><input type="range" id="uiFontSize" min="12" max="18" step="1"><span id="uiFontSizeVal"></span></div>
        <div class="row range"><label>Shadow</label><input type="range" id="shadow" min="0" max="1" step="0.05"><span id="shadowVal"></span></div>
        <div class="row range"><label>Emoji gap</label><input type="range" id="gapEmoji" min="2" max="20" step="1"><span id="gapEmojiVal"></span></div>
        <div class="row range"><label>Large gap</label><input type="range" id="gapLarge" min="4" max="30" step="1"><span id="gapLargeVal"></span></div>
        <div class="row" style="margin-top:6px;">
          <label>Background</label><input type="color" id="bgColor">
          <label>Opacity</label><input type="range" id="bgAlpha" min="0.3" max="1" step="0.05"><span id="bgAlphaVal"></span>
          <label style="margin-left:10px;">Text</label><input type="color" id="textColor">
          <label style="margin-left:10px;">Accent</label><input type="color" id="accentColor">
        </div>
        <div class="row" style="margin-top:6px;">
          <label>Border</label><input type="color" id="borderColor">
          <label>Width</label><input type="range" id="borderWidth" min="0" max="6" step="1"><span id="borderWidthVal"></span>
        </div>
        <div class="row" style="margin-top:6px; gap:6px;">
          <label>Font family</label><input type="text" id="fontFamily" class="font-input" placeholder='"gg sans", "Noto Sans", "Helvetica Neue", Arial, sans-serif'>
        </div>
      </div>

      <div class="uni-section">
        <h3>Appearance (Advanced)</h3>
        <div class="row" style="gap:14px;">
          <label>Tile BG</label><input type="color" id="tileBg">
          <label>Hover scale</label><input type="range" id="hoverScale" min="1.00" max="1.20" step="0.01"><span id="hoverScaleVal"></span>
          <label>Glow strength</label><input type="range" id="glowStrength" min="0" max="30" step="1"><span id="glowStrengthVal"></span>
        </div>
        <div class="row" style="gap:14px;">
          <label>Star color</label><input type="color" id="starColor">
          <label>Star BG</label><input type="text" id="starBg" class="font-input" placeholder="rgba(0,0,0,.35)">
          <label>Star border</label><input type="color" id="starBorder">
        </div>
        <div class="row" style="gap:14px;">
          <label>Star size</label><input type="range" id="starSize" min="16" max="40" step="1"><span id="starSizeVal"></span>
          <label>Star (small)</label><input type="range" id="starSmSize" min="12" max="32" step="1"><span id="starSmSizeVal"></span>
        </div>
        <div class="row" style="gap:14px;">
          <label>Star top</label><input type="range" id="starTop" min="0" max="24" step="1"><span id="starTopVal"></span>
          <label>Star right</label><input type="range" id="starRight" min="0" max="24" step="1"><span id="starRightVal"></span>
        </div>
        <div class="row" style="gap:14px;">
          <label>Button radius</label><input type="range" id="btnRadius" min="0" max="16" step="1"><span id="btnRadiusVal"></span>
          <label>Search radius</label><input type="range" id="searchRadius" min="0" max="24" step="1"><span id="searchRadiusVal"></span>
          <label>Search border</label><input type="color" id="searchBorder">
        </div>
        <div class="row" style="gap:14px;">
          <label>Backdrop blur</label><input type="range" id="backdropBlur" min="0" max="14" step="1"><span id="backdropBlurVal"></span>
          <label>Z-index</label><input type="number" class="mini" id="zIndex" min="1000" max="2147483647" step="1">
        </div>
        <div class="row" style="gap:14px;">
          <label>Pagination bg</label><input type="color" id="paginationBg">
          <label>Active bg</label><input type="color" id="paginationActiveBg">
          <label>Text</label><input type="color" id="paginationColor">
        </div>
      </div>

      <div class="uni-section">
        <h3>Custom CSS</h3>
        <div class="row" style="gap:8px; margin-bottom:8px;">
          <button class="btn secondary" id="loadDefaultCss">Load default CSS</button>
          <button class="btn" id="applyCustomCss">Save & Apply</button>
          <button class="btn secondary" id="exportCustomCss">Export CSS</button>
          <button class="btn secondary" id="clearCustomCss">Clear CSS</button>
        </div>
        <textarea id="customCssArea" placeholder=""></textarea>
      </div>

      <div class="uni-section">
        <h3>Export / Import style</h3>
        <div class="row" style="gap:6px; margin-bottom:6px;">
          <button class="btn" id="exportStyle">Copy style JSON</button>
          <button class="btn secondary" id="resetStyle">Reset to defaults</button>
        </div>
        <textarea id="styleJson" placeholder='Paste style JSON here, e.g. {"emojiSize":58,"tileBg":"#111"}'></textarea>
        <div class="row" style="gap:6px; margin-top:6px;">
          <button class="btn" id="importStyle">Import</button>
        </div>
        <div id="importSummary" class="help"></div>
      </div>

      <div class="uni-section">
        <h3>Change logs</h3>
        <button class="btn" id="toggleChangelog">View change logs</button>
        <div id="uni-changelog" style="display:none;">
          <div><b>${UI_VERSION}</b></div>
          <ul style="padding-left:16px;margin:8px 0">
            <li>Added Reelflix new domain</li>
          </ul>
        </div>
      </div>

      <div class="uni-section">
        <h3>Quick actions</h3>
        <div class="row" style="gap:8px;">
          <button class="btn warn" id="resetAll">Reset All (appearance)</button>
          <button class="btn secondary" id="resetAllData">Reset EVERYTHING (incl. favorites, API keys)</button>
        </div>
      </div>
    </div>
  `;

  const gridEmoji = document.getElementById('uni-emoji-grid');
  const gridStickers = document.getElementById('uni-sticker-grid');
  const gridGifs = document.getElementById('uni-gif-grid');
  const pagination = document.getElementById('uni-emoji-pagination');
  const searchInput = document.getElementById('uni-emoji-search');
  const pageJumpInput = document.getElementById('uni-page-jump-input');
  const pageJumpButton = document.getElementById('uni-page-jump-button');
  const homeTab = container.querySelector('.hometab');
  const emojiTab = container.querySelector('.emojistab');
  const stickerTab = container.querySelector('.stickerstab');
  const gifTab = container.querySelector('.giftab');
  const settingsTab = container.querySelector('.settingstab');
  const emojiToolbar = document.getElementById('uni-emoji-toolbar');
  const stickerToolbar = document.getElementById('uni-sticker-toolbar');
  const gifToolbar = document.getElementById('uni-gif-toolbar');
  const emojiFavOnlyBtn = document.getElementById('emojiFavOnly');
  const stickerFavOnlyBtn = document.getElementById('stickerFavOnly');
  const gifFavOnlyBtn = document.getElementById('gifFavOnly');
  const pageJumpDiv = document.querySelector('#uni-page-jump-container');
  const searchBarDiv = container.querySelector('.srchxbtn');
  const settingsPanel = document.getElementById('uni-settings-panel');
  const toggleChangelogBtn = document.getElementById('toggleChangelog');
  const homePanel = document.getElementById('uni-home-panel');

  const homeVersion = document.getElementById('home-version');
  const homeUpdateBtn = document.getElementById('home-check-update');
  const homeDownloadBtn = document.getElementById('home-open-download');
  const homeUpdateStatus = document.getElementById('home-update-status');
  const homeEmojiCount = document.getElementById('home-emoji-count');
  const homeStickerCount = document.getElementById('home-sticker-count');
  const homeLocalGifsStatus = document.getElementById('home-localgifs-status');
  const homeProvTenor = document.getElementById('home-prov-tenor');
  const homeProvGiphy = document.getElementById('home-prov-giphy');
  const homeProvImgur = document.getElementById('home-prov-imgur');
  const homeProvTumblr = document.getElementById('home-prov-tumblr');

  const emojiSizeCustom = document.getElementById('emojiSizeCustom');
  const stickerSizeCustom = document.getElementById('stickerSizeCustom');
  const gifSizeRange = document.getElementById('gifSize');
  const gifSizeVal = document.getElementById('gifSizeVal');

  const gifPerPageRange = document.getElementById('gifPerPage');
  const gifPerPageVal = document.getElementById('gifPerPageVal');
  const gifMinColRange = document.getElementById('gifMinCol');
  const gifMinColVal = document.getElementById('gifMinColVal');
  const showGifStarCb = document.getElementById('showGifStar');
  const gifShowTitlesCb = document.getElementById('gifShowTitles');
  const defaultGifProviderSel = document.getElementById('defaultGifProvider');
  const gifInsertSizeCustom = document.getElementById('gifInsertSizeCustom');

  const menuWidthRange = document.getElementById('menuWidth');
  const menuHeightPxRange = document.getElementById('menuHeightPx');
  const menuHeightPxVal = document.getElementById('menuHeightPxVal');
  const menuMaxHeightVhRange = document.getElementById('menuMaxHeightVh');
  const menuMaxHeightVhVal = document.getElementById('menuMaxHeightVhVal');
  const menuRadiusRange = document.getElementById('menuRadius');
  const tileRadiusRange = document.getElementById('tileRadius');
  const uiFontSizeRange = document.getElementById('uiFontSize');
  const uiFontSizeVal = document.getElementById('uiFontSizeVal');
  const shadowRange = document.getElementById('shadow');
  const gapEmojiRange = document.getElementById('gapEmoji');
  const gapLargeRange = document.getElementById('gapLarge');
  const menuWidthVal = document.getElementById('menuWidthVal');
  const menuRadiusVal = document.getElementById('menuRadiusVal');
  const tileRadiusVal = document.getElementById('tileRadiusVal');
  const shadowVal = document.getElementById('shadowVal');
  const gapEmojiVal = document.getElementById('gapEmojiVal');
  const gapLargeVal = document.getElementById('gapLargeVal');

  const bgColorPicker = document.getElementById('bgColor');
  const bgAlphaRange = document.getElementById('bgAlpha');
  const bgAlphaVal = document.getElementById('bgAlphaVal');
  const textColorPicker = document.getElementById('textColor');
  const accentColorPicker = document.getElementById('accentColor');
  const borderColorPicker = document.getElementById('borderColor');
  const borderWidthRange = document.getElementById('borderWidth');
  const borderWidthVal = document.getElementById('borderWidthVal');
  const fontFamilyInput = document.getElementById('fontFamily');

  const tileBgInput = document.getElementById('tileBg');
  const hoverScaleRange = document.getElementById('hoverScale');
  const hoverScaleVal = document.getElementById('hoverScaleVal');
  const glowStrengthRange = document.getElementById('glowStrength');
  const glowStrengthVal = document.getElementById('glowStrengthVal');
  const starColorPicker = document.getElementById('starColor');
  const starBgInput = document.getElementById('starBg');
  const starBorderPicker = document.getElementById('starBorder');
  const starSizeRange = document.getElementById('starSize');
  const starSmSizeRange = document.getElementById('starSmSize');
  const starSizeVal = document.getElementById('starSizeVal');
  const starSmSizeVal = document.getElementById('starSmSizeVal');
  const starTopRange = document.getElementById('starTop');
  const starRightRange = document.getElementById('starRight');
  const starTopVal = document.getElementById('starTopVal');
  const starRightVal = document.getElementById('starRightVal');
  const btnRadiusRange = document.getElementById('btnRadius');
  const btnRadiusVal = document.getElementById('btnRadiusVal');
  const searchRadiusRange = document.getElementById('searchRadius');
  const searchRadiusVal = document.getElementById('searchRadiusVal');
  const searchBorderPicker = document.getElementById('searchBorder');
  const backdropBlurRange = document.getElementById('backdropBlur');
  const backdropBlurVal = document.getElementById('backdropBlurVal');
  const zIndexInput = document.getElementById('zIndex');
  const paginationBgPicker = document.getElementById('paginationBg');
  const paginationActiveBgPicker = document.getElementById('paginationActiveBg');
  const paginationColorPicker = document.getElementById('paginationColor');

  const customCssArea = document.getElementById('customCssArea');
  const applyCustomCssBtn = document.getElementById('applyCustomCss');
  const exportCustomCssBtn = document.getElementById('exportCustomCss');
  const clearCustomCssBtn = document.getElementById('clearCustomCss');
  const loadDefaultCssBtn = document.getElementById('loadDefaultCss');

  const exportStyleBtn = document.getElementById('exportStyle');
  const importStyleBtn = document.getElementById('importStyle');
  const resetStyleBtn = document.getElementById('resetStyle');
  const resetAllBtn = document.getElementById('resetAll');
  const resetAllDataBtn = document.getElementById('resetAllData');
  const styleJsonArea = document.getElementById('styleJson');
  const importSummary = document.getElementById('importSummary');

  const tenorKeyInput = document.getElementById('tenorKey');
  const giphyKeyInput = document.getElementById('giphyKey');
  const imgurKeyInput = document.getElementById('imgurKey');
  const tumblrKeyInput = document.getElementById('tumblrKey');
  const saveTenorBtn = document.getElementById('saveTenor');
  const saveGiphyBtn = document.getElementById('saveGiphy');
  const saveImgurBtn = document.getElementById('saveImgur');
  const saveTumblrBtn = document.getElementById('saveTumblr');
  const testTenorBtn = document.getElementById('testTenor');
  const testGiphyBtn = document.getElementById('testGiphy');
  const testImgurBtn = document.getElementById('testImgur');
  const testTumblrBtn = document.getElementById('testTumblr');
  const showTenorBtn = document.getElementById('showTenor');
  const showGiphyBtn = document.getElementById('showGiphy');
  const showImgurBtn = document.getElementById('showImgur');
  const showTumblrBtn = document.getElementById('showTumblr');

  const redditSubsInput = document.getElementById('redditSubs');
  const saveRedditSubsBtn = document.getElementById('saveRedditSubs');
  const redditIncludeImagesCb = document.getElementById('redditIncludeImages');

  const swTenor = document.getElementById('sw-tenor');
  const swGiphy = document.getElementById('sw-giphy');
  const swImgur = document.getElementById('sw-imgur');
  const swTumblr = document.getElementById('sw-tumblr');

  const localGifUrlsArea = document.getElementById('localGifUrlsArea');
  const saveLocalGifsBtn = document.getElementById('saveLocalGifs');
  const reloadLocalGifsBtn = document.getElementById('reloadLocalGifs');
  const stLocalGifs = document.getElementById('st-localgifs');

  function fetchJson(url, headers) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        headers: headers || {},
        onload: (res) => {
          try { resolve(JSON.parse(res.responseText)); }
          catch (e) { reject(e); }
        },
        onerror: () => reject(new Error("Request failed"))
      });
    });
  }
  function fetchText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: (res) => resolve(res.responseText),
        onerror: () => reject(new Error('Request failed'))
      });
    });
  }
  const mergeJsonObjects = (list) => Object.assign({}, ...list);
  function toArrayFromMerged(merged, type = 'emoji') {
    let idx = 0;
    return Object.entries(merged).map(([name, val]) => {
      const url = val && typeof val === 'object' ? (val.url || '') : (val || '');
      if (!url) return null;
      const tags = val && typeof val === 'object' && Array.isArray(val.tags) ? val.tags : [];
      const animated = val && typeof val === 'object' && typeof val.animated === 'boolean'
        ? val.animated : /\.gif($|\?)/i.test(url) || /\.apng($|\?)/i.test(url);
      const originalIndex = idx++;
      return { name, url, tags, animated, type, originalIndex };
    }).filter(Boolean);
  }
  function insertBBCode(bbcode) {
    const ids = ['chatbox__messages-create','new-comment__textarea','reply-comment','bbcode-message','bbcode-content','bbcode-signature','bbcode-about'];
    const input = document.querySelector(ids.map(id => `textarea#${id}`).join(', '));
    if (!input) return;
    const s = input.selectionStart, e = input.selectionEnd;
    if (typeof s === 'number' && typeof e === 'number' && typeof input.setRangeText === 'function') {
      input.setRangeText(bbcode, s, e, 'end');
    } else {
      const val = input.value || '';
      input.value = val.slice(0, s || val.length) + bbcode + val.slice(e || val.length);
    }
    input.focus();
  }
  async function copyText(text) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch {}
    try { if (typeof GM_setClipboard === 'function') { GM_setClipboard(text, 'text'); return true; } } catch {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      return true;
    } catch {}
    return false;
  }
  function ensurePage(len, perPage, page) {
    const totalPages = Math.max(1, Math.ceil(len / perPage));
    return { totalPages, page: Math.min(Math.max(page, 1), totalPages) };
  }
  function showEmpty(el, text) {
    el.innerHTML = `<div class="uni-empty">${text}</div>`;
  }

  let ctxMenuEl = null;
  function ensureCtxMenu() {
    if (ctxMenuEl) return ctxMenuEl;
    ctxMenuEl = document.createElement('div');
    ctxMenuEl.id = 'uni-ctx-menu';
    ctxMenuEl.addEventListener('contextmenu', (e) => e.preventDefault());
    document.body.appendChild(ctxMenuEl);
    document.addEventListener('click', hideCtxMenu, true);
    window.addEventListener('scroll', hideCtxMenu, true);
    window.addEventListener('resize', hideCtxMenu, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideCtxMenu(); });
    return ctxMenuEl;
  }
  function hideCtxMenu() { if (ctxMenuEl) ctxMenuEl.style.display = 'none'; }
  function showCtxMenu(items, x, y) {
    const el = ensureCtxMenu();
    el.innerHTML = '';
    (items || []).forEach(it => {
      const btn = document.createElement('button');
      btn.textContent = it.label;
      btn.onclick = () => { hideCtxMenu(); it.onClick && it.onClick(); };
      el.appendChild(btn);
    });
    el.style.display = 'block';
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const left = Math.min(x, window.innerWidth - rect.width - 8);
      const top = Math.min(y, window.innerHeight - rect.height - 8);
      el.style.left = `${left}px`; el.style.top = `${top}px`;
    });
  }

  function renderPagination(totalPages, currentPage, goToPage) {
    pagination.innerHTML = '';
    totalPages = Math.max(1, totalPages);
    const mk = (label, title, fn, active=false) => {
      const b = document.createElement('button');
      b.textContent = label; if (title) b.title = title; if (active) b.classList.add('active'); b.onclick = fn; return b;
    };
    if (currentPage > 1) pagination.appendChild(mk('‹ Prev', 'Previous', () => goToPage(currentPage - 1)));
    let s = Math.max(1, currentPage - 2), e = Math.min(totalPages, s + 4); if (e - s < 4) s = Math.max(1, e - 4);
    for (let i = s; i <= e; i++) pagination.appendChild(mk(String(i), '', () => goToPage(i), i === currentPage));
    if (currentPage < totalPages) pagination.appendChild(mk('Next ›', 'Next', () => goToPage(currentPage + 1)));
  }

  function applyCssVars() {
    container.style.setProperty('--menu-max-width', `${settings.menuMaxWidth}px`);
    container.style.setProperty('--menu-min-width', `${settings.menuMinWidth}px`);
    container.style.setProperty('--menu-max-height', `${settings.menuMinHeight}px`);
    container.style.setProperty('--menu-max-height', `${settings.menuMaxHeightVh}vh`);
    container.style.setProperty('--menu-radius', `${settings.menuRadius}px`);
    container.style.setProperty('--tile-radius', `${settings.tileRadius}px`);
    container.style.setProperty('--bg-rgba', hexToRgba(settings.bg, settings.bgAlpha));
    container.style.setProperty('--text', settings.text);
    container.style.setProperty('--accent', settings.accent);
    container.style.setProperty('--border-color', settings.borderColor);
    container.style.setProperty('--border-width', `${settings.borderWidth}px`);
    container.style.setProperty('--shadow', `${settings.shadow}`);
    container.style.setProperty('--emoji-tile', `${settings.emojiSize}px`);
    container.style.setProperty('--sticker-tile-height', `${settings.stickerSize}px`);
    container.style.setProperty('--gif-tile-height', `${settings.gifSize}px`);
    container.style.setProperty('--media-tile-height', `${settings.gifSize}px`);
    container.style.setProperty('--gif-min-col', `${settings.gifMinCol}px`);
    container.style.setProperty('--gap-emoji', `${settings.gapEmoji}px`);
    container.style.setProperty('--gap-large', `${settings.gapLarge}px`);
    container.style.setProperty('--font-family', settings.fontFamily);
    container.style.setProperty('--ui-font-size', `${settings.uiFontSize}px`);
    container.style.setProperty('--tile-bg', settings.tileBg);
    container.style.setProperty('--hover-scale', `${settings.hoverScale}`);
    container.style.setProperty('--glow-strength', `${settings.glowStrength}px`);
    container.style.setProperty('--star-color', settings.starColor);
    container.style.setProperty('--star-bg', settings.starBg);
    container.style.setProperty('--star-border', settings.starBorder);
    container.style.setProperty('--star-top', `${settings.starTop}px`);
    container.style.setProperty('--star-right', `${settings.starRight}px`);
    container.style.setProperty('--star-size', `${settings.starSize}px`);
    container.style.setProperty('--star-sm-size', `${settings.starSmSize}px`);
    container.style.setProperty('--btn-radius', `${settings.btnRadius}px`);
    container.style.setProperty('--search-radius', `${settings.searchRadius}px`);
    container.style.setProperty('--search-border', settings.searchBorder);
    container.style.setProperty('--pagination-bg', settings.paginationBg);
    container.style.setProperty('--pagination-active-bg', settings.paginationActiveBg);
    container.style.setProperty('--pagination-color', settings.paginationColor);
    container.style.setProperty('--backdrop-blur', `${settings.backdropBlur}px`);
    container.style.setProperty('--z', settings.zIndex);
  }
  function ensureCustomCssTag() {
    let tag = document.getElementById('uni-custom-css');
    if (!tag) { tag = document.createElement('style'); tag.id = 'uni-custom-css'; document.head.appendChild(tag); }
    return tag;
  }
  function applyCustomCss(css) { const tag = ensureCustomCssTag(); tag.textContent = css || ''; GM_SetValueSafe(CUSTOM_CSS_KEY, css || ''); }
  (function initCustomCssFromStore() { const css = GM_GetValueSafe(CUSTOM_CSS_KEY, ''); if (css && css.trim()) applyCustomCss(css); })();

  async function fetchJsonRetry(url, tries = 2) {
    let lastErr;
    for (let i = 0; i < tries; i++) {
      try {
        const j = await fetchJson(url);
        if (!j || typeof j !== 'object') throw new Error('Invalid JSON object');
        return j;
      } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 150 * (i + 1))); }
    }
    throw lastErr || new Error('Request failed');
  }
  async function loadEmojiJsons() {
    const loaded = [];
    const failures = [];
    for (const group of EMOJI_URL_GROUPS) {
      let ok = false, lastErr = null;
      for (const url of group) {
        try { const json = await fetchJsonRetry(url, 2); loaded.push(json); ok = true; break; } catch (e) { lastErr = e; }
      }
      if (!ok) failures.push({ group, error: lastErr });
    }
    if (loaded.length === 0) throw new Error(`No emoji packs loaded`);
    if (failures.length) { console.warn(`[Ultimate Emojis] ${failures.length} pack(s) failed to load.`, failures); showSoftNotice(`Emojis: loaded ${loaded.length}/${EMOJI_COUNT} packs. Some failed — see console.`); }
    return Object.assign({}, ...loaded);
  }

  loadEmojiJsons()
    .then(merged => {
      allEmojis = toArrayFromMerged(merged, 'emoji');
      if (activeTab === 'emoji') showEmojiLibraryPage(currentEmojiPage || 1);
      refreshHomeStatus();
    })
    .catch(err => {
      console.error('Emoji load failed:', err);
      showSoftNotice('Failed to load emojis. Check console.');
      if (activeTab === 'emoji') gridEmoji.innerHTML = '<div style="opacity:.8;padding:14px;text-align:center;">Could not load emoji packs.</div>';
      refreshHomeStatus();
    });

  function showEmojiLibraryPage(page) {
    activeTab = 'emoji';
    homeTab.classList.remove('active'); emojiTab.classList.add('active'); stickerTab.classList.remove('active'); gifTab.classList.remove('active'); settingsTab.classList.remove('active');

    const term = searchInput.value.trim().toLowerCase();
    let list = !term ? allEmojis : allEmojis.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.tags.some(t => (''+t).toLowerCase().includes(term))
    );
    if (favOnlyEmoji) list = list.filter(e => isFav('emoji', e));
    filteredEmojis = sortFavFirstStable(list, favEmojiV2, favEmojiLegacy);
    const { totalPages, page: newPage } = ensurePage(filteredEmojis.length, 108, page);
    currentEmojiPage = newPage;
    const start = (currentEmojiPage - 1) * 108;
    const pageItems = filteredEmojis.slice(start, start + 108);

    homePanel.style.display = 'none';
    gridEmoji.innerHTML = '';
    gridEmoji.style.display = '';
    gridStickers.style.display = 'none';
    gridGifs.style.display = 'none';
    settingsPanel.style.display = 'none';
    emojiToolbar.style.display = '';
    stickerToolbar.style.display = 'none';
    gifToolbar.style.display = 'none';
    searchBarDiv.style.display = '';
    pagination.style.display = '';
    pageJumpDiv.style.display = '';

    pageItems.forEach(item => {
      const tile = document.createElement('div');
      tile.className = 'uni-emoji-tile';
      const img = document.createElement('img');
      img.src = item.url; img.alt = item.name; img.title = item.name; img.loading = 'lazy';

      const star = document.createElement('button');
      star.className = 'uni-star-sm' + (isFav('emoji', item) ? ' active' : '');
      star.title = isFav('emoji', item) ? 'Unfavorite' : 'Favorite';
      star.textContent = '★';

      star.addEventListener('click', (e) => {
        e.stopPropagation();
        const prevTotal = filteredEmojis.length;
        favToggle('emoji', item);
        showEmojiLibraryPage(currentEmojiPage);
        if (favOnlyEmoji && prevTotal > 0 && filteredEmojis.length === 0 && currentEmojiPage > 1) {
          showEmojiLibraryPage(currentEmojiPage - 1);
        }
      });

      img.addEventListener('click', () => {
        insertBBCode(`[img=${getEmojiInsertSize()}]${item.url}[/img] `);
        tile.style.opacity = '0.6'; setTimeout(()=> tile.style.opacity = '1', 200);
      });
      img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const favNow = isFav('emoji', item);
        showCtxMenu([
          { label: favNow ? 'Unfavorite Emoji' : 'Favorite Emoji', onClick: () => {
              const prevTotal = filteredEmojis.length;
              favToggle('emoji', item);
              showEmojiLibraryPage(currentEmojiPage);
              if (favOnlyEmoji && prevTotal > 0 && filteredEmojis.length === 0 && currentEmojiPage > 1) {
                showEmojiLibraryPage(currentEmojiPage - 1);
              }
            }},
          { label: 'Copy Emoji URL', onClick: () => copyText(item.url) },
          { label: 'Copy Emoji Name', onClick: () => copyText(item.name) }
        ], e.clientX, e.clientY);
      });

      tile.appendChild(img);
      tile.appendChild(star);
      gridEmoji.appendChild(tile);
    });

    renderPagination(totalPages, currentEmojiPage, (p) => showEmojiLibraryPage(p));
    searchInput.placeholder = "Search emojis…";
  }

  let stickersLoaded = false;
  Promise.all(STICKERS_JSON_URLS.map(url => fetchJson(url)))
    .then(results => {
      if (!results || results.length === 0) { stickersLoaded = true; refreshHomeStatus(); return; }
      const merged = mergeJsonObjects(results);
      allStickers = toArrayFromMerged(merged, 'sticker');
      stickersLoaded = true;
      refreshHomeStatus();
    })
    .catch(err => { console.error("Stickers JSON error:", err); stickersLoaded = true; refreshHomeStatus(); });

  function showStickerPage(page) {
    activeTab = 'stickers';
    homeTab.classList.remove('active'); emojiTab.classList.remove('active'); stickerTab.classList.add('active'); gifTab.classList.remove('active'); settingsTab.classList.remove('active');

    if (!stickersLoaded && STICKERS_JSON_URLS.length > 0) {
      homePanel.style.display = 'none';
      gridEmoji.style.display = 'none'; gridGifs.style.display = 'none'; settingsPanel.style.display = 'none';
      gridStickers.style.display = ''; showEmpty(gridStickers, 'Loading stickers…');
      pagination.innerHTML = ''; return;
    }
    const term = searchInput.value.trim().toLowerCase();
    let list = allStickers;
    if (term) list = list.filter(e => e.name.toLowerCase().includes(term) || (e.tags && e.tags.some(t => (''+t).toLowerCase().includes(term))));
    if (favOnlyStickers) list = list.filter(e => isFav('sticker', e));
    filteredStickers = sortFavFirstStable(list, favStickerV2, favStickerLegacy);

    const { totalPages, page: newPage } = ensurePage(filteredStickers.length, 24, page);
    currentStickerPage = newPage;
    const start = (currentStickerPage - 1) * 24;
    const pageItems = filteredStickers.slice(start, start + 24);

    homePanel.style.display = 'none';
    gridEmoji.style.display = 'none'; gridGifs.style.display = 'none'; settingsPanel.style.display = 'none';
    gridStickers.style.display = ''; gridStickers.innerHTML = '';
    emojiToolbar.style.display = 'none';
    stickerToolbar.style.display = '';
    gifToolbar.style.display = 'none';
    searchBarDiv.style.display = ''; pagination.style.display = ''; pageJumpDiv.style.display = '';

    if (!pageItems.length) showEmpty(gridStickers, 'No results');
    pageItems.forEach(item => {
      const tile = document.createElement('div'); tile.className = 'uni-tile';
      const img = document.createElement('img');
      img.src = item.url; img.alt = item.name; img.title = item.name; img.loading = 'lazy';

      const star = document.createElement('button');
      star.className = 'uni-star' + (isFav('sticker', item) ? ' active' : '');
      star.title = isFav('sticker', item) ? 'Unfavorite' : 'Favorite';
      star.textContent = '★';

      star.addEventListener('click', (e) => {
        e.stopPropagation();
        const prevTotal = filteredStickers.length;
        favToggle('sticker', item);
        showStickerPage(currentStickerPage);
        if (favOnlyStickers && prevTotal > 0 && filteredStickers.length === 0 && currentStickerPage > 1) {
          showStickerPage(currentStickerPage - 1);
        }
      });

      img.addEventListener('click', () => {
        insertBBCode(`[img=${getStickerInsertSize()}]${item.url}[/img] `);
        tile.style.opacity = '0.6'; setTimeout(() => (tile.style.opacity = '1'), 200);
      });
      img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const favNow = isFav('sticker', item);
        showCtxMenu([
          { label: favNow ? 'Unfavorite Sticker' : 'Favorite Sticker', onClick: () => {
              const prevTotal = filteredStickers.length;
              favToggle('sticker', item);
              showStickerPage(currentStickerPage);
              if (favOnlyStickers && prevTotal > 0 && filteredStickers.length === 0 && currentStickerPage > 1) {
                showStickerPage(currentStickerPage - 1);
              }
            }},
          { label: 'Copy Sticker URL', onClick: () => copyText(item.url) },
          { label: 'Copy Sticker Name', onClick: () => copyText(item.name) }
        ], e.clientX, e.clientY);
      });

      tile.appendChild(img); tile.appendChild(star);
      gridStickers.appendChild(tile);
    });

    renderPagination(totalPages, currentStickerPage, (p) => showStickerPage(p));
    searchInput.placeholder = "Search stickers…";
  }

  function parseLocalGifUrls(str) {
    return String(str || '')
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  async function loadLocalGifs() {
    const urls = parseLocalGifUrls(settings.localGifUrls);
    if (!urls.length) {
      allGifs = [];
      gifsLoaded = true;
      localGifStatus = 'No packs configured';
      refreshHomeStatus();
      return;
    }
    try {
      const results = await Promise.allSettled(urls.map(u => fetchJson(u)));
      const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const merged = mergeJsonObjects(ok);
      allGifs = toArrayFromMerged(merged, 'gif');
      gifsLoaded = true;
      localGifStatus = `Loaded ${ok.length}/${urls.length} pack(s)`;
      refreshHomeStatus();
    } catch {
      allGifs = [];
      gifsLoaded = true;
      localGifStatus = 'Failed to load packs';
      refreshHomeStatus();
    }
  }

  const tenorState = new Map();
  function tenorKeyFor(q, limit) { return `${q || ''}::${limit}`; }
  async function fetchTenorPage(q, page, limit) {
    const key = getApiKey('tenor'); if (!key) throw new Error('Missing Tenor API key.');
    const qKey = tenorKeyFor(q, limit);
    if (!tenorState.has(qKey)) tenorState.set(qKey, { pages: new Map(), nextByPage: new Map() });
    const state = tenorState.get(qKey);
    if (state.pages.has(page)) return { items: state.pages.get(page), hasNext: !!state.nextByPage.get(page) };
    let pos = null;
    if (page > 1) {
      for (let p = 1; p < page; p++) {
        if (!state.pages.has(p)) {
          const prevPos = p === 1 ? null : state.nextByPage.get(p - 1) || null;
          const { items, next } = await tenorCall(q, limit, prevPos, key);
          state.pages.set(p, items); state.nextByPage.set(p, next || '');
        }
      }
      pos = state.nextByPage.get(page - 1) || null;
    }
    const { items, next } = await tenorCall(q, limit, pos, key);
    state.pages.set(page, items);
    state.nextByPage.set(page, next || '');
    return { items, hasNext: !!next };
  }
  async function tenorCall(q, limit, pos, key) {
    const base = 'https://tenor.googleapis.com/v2';
    const endpoint = q ? 'search' : 'featured';
    const params = [ `key=${encodeURIComponent(key)}`, `limit=${limit}`, 'media_filter=gif', 'contentfilter=medium' ];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (pos) params.push(`pos=${encodeURIComponent(pos)}`);
    const url = `${base}/${endpoint}?${params.join('&')}`;
    const json = await fetchJson(url);
    const results = json?.results || json?.gifs || [];
    const items = results.map((r, i) => {
      const mf = r.media_formats || {};
      const url = mf.gif?.url || mf.mediumgif?.url || mf.tinygif?.url || '';
      const name = r.content_description || r.id || 'tenor';
      return { name, url, tags: [], animated: true, type: 'gif', originalIndex: i };
    }).filter(x => x.url);
    const next = json?.next || '';
    return { items, next };
  }
  async function fetchGiphy({ q, page, limit }) {
    const key = getApiKey('giphy'); if (!key) throw new Error('Missing GIPHY API key.');
    const offset = (page - 1) * limit;
    const base = 'https://api.giphy.com/v1/gifs';
    const params = q
      ? `search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=pg-13&lang=en`
      : `trending?api_key=${encodeURIComponent(key)}&limit=${limit}&offset=${offset}&rating=pg-13`;
    const url = `${base}/${params}`;
    const json = await fetchJson(url);
    if (!json?.meta || json.meta.status !== 200) throw new Error(`GIPHY error (${json?.meta?.status||'n/a'}): ${json?.meta?.msg||'Unknown'}`);
    const data = Array.isArray(json.data) ? json.data : [];
    const total = Math.max(1, Math.min(json.pagination?.total_count || (page * limit + data.length), 1000));
    const items = data.map((g, i) => {
      const images = g.images || {};
      const u = images.downsized_medium?.url || images.original?.url || images.fixed_width?.url || '';
      const name = g.title || g.slug || g.id || 'giphy';
      return { name, url: u, tags: [], animated: true, type: 'gif', originalIndex: i };
    }).filter(x => x.url);
    return { items, total };
  }
  function parseRedditSubs() {
    return String(settings.redditSubs || '').split(/[, ]+/).map(s => s.trim()).filter(Boolean).slice(0, 50);
  }
  async function fetchReddit({ q, page, limit }) {
    const subs = parseRedditSubs();
    const subsStr = subs.length ? subs.join('+') : 'gifs';
    const perPage = Math.min(limit * page, 100);
    const base = `https://www.reddit.com/r/${subsStr}`;
    const url = q
      ? `${base}/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=relevance&t=year&limit=${perPage}&raw_json=1`
      : `${base}/hot.json?limit=${perPage}&raw_json=1`;
    const json = await fetchJson(url);
    const posts = json?.data?.children || [];
    const allowImg = !!settings.redditIncludeImages;
    const list = [];
    posts.forEach((ch, i) => {
      const d = ch?.data || {};
      const u = d.url_overridden_by_dest || d.url || '';
      if (/\.gif($|\?)/i.test(u) || (allowImg && /\.(jpe?g|png|webp)($|\?)/i.test(u))) {
        list.push({ name: d.title || d.id || 'reddit', url: u, tags: [], animated: /\.gif($|\?)/i.test(u), type: 'gif', originalIndex: i });
      }
    });
    const start = (page - 1) * limit;
    return { items: list.slice(start, start + limit), total: Math.max(perPage, list.length) };
  }
  async function fetchTumblr({ q, page, limit }) {
    const key = getApiKey('tumblr'); if (!key) throw new Error('Missing Tumblr API key.');
    const tag = (q || 'gif').trim();
    const url = `https://api.tumblr.com/v2/tagged?tag=${encodeURIComponent(tag)}&api_key=${encodeURIComponent(key)}&limit=${limit}`;
    const json = await fetchJson(url);
    const arr = json?.response || [];
    const items = [];
    arr.forEach((p, i) => {
      (p.photos || []).forEach(ph => {
        const u = ph?.original_size?.url || '';
        if (/\.gif($|\?)/i.test(u)) items.push({ name: p.summary || p.blog_name || 'tumblr', url: u, tags: [], animated: true, type: 'gif', originalIndex: i });
      });
    });
    return { items: items.slice(0, limit), total: page * limit + items.length };
  }
  async function fetchImgur({ q, page, limit }) {
    const cid = getApiKey('imgur'); if (!cid) throw new Error('Missing Imgur Client-ID.');
    if (q && q.trim()) {
      const url = `https://api.imgur.com/3/gallery/search/?q=${encodeURIComponent(q)}`;
      const data = await fetchJson(url, { Authorization: `Client-ID ${cid}` });
      const list = (data.data || []).flatMap(entry => {
        if (entry.images && entry.images.length) {
          return entry.images.filter(im => (im.type || '').toLowerCase() === 'image/gif').map(im => im.link);
        }
        if ((entry.type || '').toLowerCase() === 'image/gif' && entry.link) return [entry.link];
        return [];
      });
      const items = list.slice((page - 1) * limit, (page - 1) * limit + limit).map((u, i) => ({ name: 'imgur', url: u, tags: [], animated: true, type: 'gif', originalIndex: i }));
      return { items, total: list.length };
    } else {
      const pageIndex = Math.max(0, page - 1);
      const url = `https://api.imgur.com/3/gallery/hot/viral/${pageIndex}.json`;
      const data = await fetchJson(url, { Authorization: `Client-ID ${cid}` });
      const arr = (data.data || []).flatMap(entry => {
        if (entry.images && entry.images.length) {
          return entry.images.filter(im => (im.type || '').toLowerCase() === 'image/gif').map(im => im.link);
        }
        if ((entry.type || '').toLowerCase() === 'image/gif' && entry.link) return [entry.link];
        return [];
      });
      const items = arr.slice(0, limit).map((u, i) => ({ name: 'imgur', url: u, tags: [], animated: true, type: 'gif', originalIndex: i }));
      return { items, total: page * limit + items.length };
    }
  }

  function providerEnabled(p) {
    if (p === 'local' || p === 'reddit') return true;
    if (p === 'tenor') return !!settings.provTenor;
    if (p === 'giphy') return !!settings.provGiphy;
    if (p === 'imgur') return !!settings.provImgur;
    if (p === 'tumblr') return !!settings.provTumblr;
    return true;
  }
  function updateProviderButtons() {
    gifToolbar.querySelectorAll('.provider-btn').forEach(btn => {
      const p = btn.getAttribute('data-provider');
      btn.style.display = providerEnabled(p) ? '' : 'none';
    });
    if (!providerEnabled(settings.gifProvider)) {
      const order = ['tenor','giphy','imgur','tumblr','reddit','local'];
      const next = order.find(p => providerEnabled(p)) || 'local';
      settings.gifProvider = next;
      saveSettings();
    }
    syncGifProviderUI();
    refreshHomeStatus();
  }
  function syncGifProviderUI() {
    gifToolbar.querySelectorAll('.provider-btn').forEach(b => {
      const val = b.getAttribute('data-provider');
      b.classList.toggle('active', val === settings.gifProvider);
    });
    gifFavOnlyBtn?.classList.toggle('active', favOnlyGifs);
  }
  function favMetaAdd(item) {
    if (!item || !item.url) return;
    favMeta[item.url] = favMeta[item.url] || { name: item.name || '', type: 'gif', ts: Date.now() };
    if (!favMeta[item.url].name && item.name) favMeta[item.url].name = item.name; favMeta[item.url].ts = Date.now();
    saveFavMeta();
  }
  function favMetaRemove(url) { if (url && favMeta[url]) { delete favMeta[url]; saveFavMeta(); } }
  function getFavList(typeFilter) {
    const arr = [];
    Object.entries(favMeta).forEach(([url, meta]) => {
      if (typeFilter && meta.type !== typeFilter) return;
      arr.push({ url, name: meta.name || url.split('/').pop(), type: meta.type, originalIndex: meta.ts || 0, animated: true });
    });
    arr.sort((a,b) => (b.originalIndex - a.originalIndex));
    return arr;
  }

  async function showGifPage(page) {
    activeTab = 'gifs';
    homeTab.classList.remove('active'); emojiTab.classList.remove('active'); stickerTab.classList.remove('active'); gifTab.classList.add('active'); settingsTab.classList.remove('active');

    const perPage = Math.max(1, Number(settings.gifPerPage) || 24);

    homePanel.style.display = 'none';
    gridEmoji.style.display = 'none'; gridStickers.style.display = 'none'; settingsPanel.style.display = 'none';
    gridGifs.style.display = ''; gridGifs.innerHTML = '';
    emojiToolbar.style.display = 'none';
    stickerToolbar.style.display = 'none';
    gifToolbar.style.display = '';
    searchBarDiv.style.display = ''; pageJumpDiv.style.display = '';
    updateProviderButtons();

    if (favOnlyGifs) {
      const q = searchInput.value.trim().toLowerCase();
      let favs = getFavList('gif');
      if (q) favs = favs.filter(x => (x.name || '').toLowerCase().includes(q));
      const { totalPages, page: newPage } = ensurePage(favs.length, perPage, page);
      currentGifPage = newPage;
      const start = (currentGifPage - 1) * perPage;
      const pageItems = favs.slice(start, start + perPage);
      if (!pageItems.length) showEmpty(gridGifs, 'No favorites yet'); else pageItems.forEach(renderGifTile);
      renderPagination(totalPages, currentGifPage, (p) => showGifPage(p));
      searchInput.placeholder = "Favorites (all providers)";
      return;
    }

    const q = searchInput.value.trim();
    try {
      if (settings.gifProvider === 'local') {
        if (!gifsLoaded) await loadLocalGifs();
        const urls = parseLocalGifUrls(settings.localGifUrls);
        if (!urls.length) {
          showEmpty(gridGifs, 'Add Local GIF pack URLs in Settings → Local GIF packs');
          renderPagination(1, 1, ()=>{});
          searchInput.placeholder = "Local GIFs — add URLs in Settings";
          return;
        }
        const term = q.toLowerCase();
        let list = !term ? allGifs : allGifs.filter(e =>
          e.name.toLowerCase().includes(term) ||
          (e.tags && e.tags.some(t => (''+t).toLowerCase().includes(term)))
        );
        list = sortFavFirstStable(list, favGifV2, favGifLegacy);
        const { totalPages, page: newPage } = ensurePage(list.length, perPage, page);
        currentGifPage = newPage;
        const start = (currentGifPage - 1) * perPage;
        const pageItems = list.slice(start, start + perPage);
        if (!pageItems.length) showEmpty(gridGifs, 'No results'); else pageItems.forEach(renderGifTile);
        renderPagination(totalPages, currentGifPage, (p) => showGifPage(p));
        searchInput.placeholder = "Search GIFs — Provider: Local";
      } else if (settings.gifProvider === 'tenor') {
        const { items, hasNext } = await fetchTenorPage(q, page, perPage);
        currentGifPage = page;
        if (!items.length) showEmpty(gridGifs, 'No results'); else items.forEach(renderGifTile);
        const totalPages = currentGifPage + (hasNext ? 1 : 0);
        renderPagination(totalPages, currentGifPage, (p) => showGifPage(p));
        searchInput.placeholder = `Search GIFs — Provider: Tenor (${q ? 'search' : 'featured'})`;
      } else if (settings.gifProvider === 'giphy') {
        const { items, total } = await fetchGiphy({ q, page, limit: perPage });
        currentGifPage = page;
        if (!items.length) showEmpty(gridGifs, 'No results'); else items.forEach(renderGifTile);
        renderPagination(Math.max(1, Math.ceil(total / perPage)), currentGifPage, (p) => showGifPage(p));
        searchInput.placeholder = `Search GIFs — Provider: GIPHY (${q ? 'search' : 'trending'})`;
      } else if (settings.gifProvider === 'imgur') {
        const { items, total } = await fetchImgur({ q, page, limit: perPage });
        currentGifPage = page;
        if (!items.length) showEmpty(gridGifs, 'No results'); else items.forEach(renderGifTile);
        renderPagination(Math.max(1, Math.ceil(total / perPage)), currentGifPage, (p) => showGifPage(p));
        searchInput.placeholder = `Search GIFs — Provider: Imgur`;
      } else if (settings.gifProvider === 'reddit') {
        const { items, total } = await fetchReddit({ q, page, limit: perPage });
        currentGifPage = page;
        if (!items.length) showEmpty(gridGifs, 'No results'); else items.forEach(renderGifTile);
        renderPagination(Math.max(1, Math.ceil(total / perPage)), currentGifPage, (p) => showGifPage(p));
        searchInput.placeholder = `Search ${settings.redditIncludeImages ? 'GIFs/Images' : 'GIFs'} — Provider: Reddit`;
      } else if (settings.gifProvider === 'tumblr') {
        const { items, total } = await fetchTumblr({ q, page, limit: perPage });
        currentGifPage = page;
        if (!items.length) showEmpty(gridGifs, 'No results'); else items.forEach(renderGifTile);
        renderPagination(Math.max(1, Math.ceil(total / perPage)), currentGifPage, (p) => showGifPage(p));
        searchInput.placeholder = `Search GIFs — Provider: Tumblr`;
      }
    } catch (e) {
      showEmpty(gridGifs, (e.message || 'Provider error') + '<br/><span style="opacity:.7;font-size:12px;">Check API keys in Settings → Import APIs</span>');
    }
  }

  function renderGifTile(item) {
    const tile = document.createElement('div'); tile.className = 'uni-tile';
    const img = document.createElement('img'); img.src = item.url; img.alt = item.name; img.title = item.name; img.loading = 'lazy';

    if (settings.gifShowTitles) {
      const title = document.createElement('div');
      title.className = 'gif-title';
      title.textContent = item.name || '';
      tile.appendChild(title);
    }

    if (settings.showGifStar) {
      const star = document.createElement('button');
      star.className = 'uni-star' + (isFav('gif', item) ? ' active' : '');
      star.title = isFav('gif', item) ? 'Unfavorite' : 'Favorite';
      star.textContent = '★';

      star.addEventListener('click', (e) => {
        e.stopPropagation();
        const perPage = Math.max(1, Number(settings.gifPerPage) || 24);
        const pageSlice = favOnlyGifs ? getFavList('gif').slice((currentGifPage - 1) * perPage, currentGifPage * perPage).length : null;
        favToggle('gif', item);
        if (isFav('gif', item)) favMetaAdd(item); else favMetaRemove(item.url);
        if (favOnlyGifs) {
          const afterSlice = getFavList('gif').slice((currentGifPage - 1) * perPage, currentGifPage * perPage).length;
          if (pageSlice && afterSlice === 0 && currentGifPage > 1) showGifPage(currentGifPage - 1);
          else showGifPage(currentGifPage);
        } else {
          showGifPage(currentGifPage);
        }
      });

      tile.appendChild(star);
    }

    img.addEventListener('click', () => {
      insertBBCode(`[img=${getGifInsertSize()}]${item.url}[/img] `);
      tile.style.opacity = '0.6'; setTimeout(()=> tile.style.opacity = '1', 200);
    });
    img.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showCtxMenu([
        { label: 'Copy URL', onClick: () => copyText(item.url) },
        { label: 'Copy Name', onClick: () => copyText(item.name) }
      ], e.clientX, e.clientY);
    });

    tile.appendChild(img);
    gridGifs.appendChild(tile);
  }

  gifToolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.provider-btn'); if (!btn) return;
    const provider = btn.getAttribute('data-provider');
    if (!providerEnabled(provider)) return;
    if (provider === 'tenor' && !getApiKey('tenor')) { settingsTab.click(); alert('Add your Tenor API key in Settings → Import APIs.'); return; }
    if (provider === 'giphy' && !getApiKey('giphy')) { settingsTab.click(); alert('Add your GIPHY API key in Settings → Import APIs.'); return; }
    if (provider === 'imgur' && !getApiKey('imgur')) { settingsTab.click(); alert('Add your Imgur Client-ID in Settings → Import APIs.'); return; }
    if (provider === 'tumblr' && !getApiKey('tumblr')) { settingsTab.click(); alert('Add your Tumblr API key in Settings → Import APIs.'); return; }
    settings.gifProvider = provider; saveSettings(); showGifPage(1);
  });
  gifFavOnlyBtn.addEventListener('click', () => { favOnlyGifs = !favOnlyGifs; gifFavOnlyBtn.classList.toggle('active', favOnlyGifs); showGifPage(1); });
  stickerFavOnlyBtn.addEventListener('click', () => { favOnlyStickers = !favOnlyStickers; stickerFavOnlyBtn.classList.toggle('active', favOnlyStickers); showStickerPage(1); });
  emojiFavOnlyBtn.addEventListener('click', () => { favOnlyEmoji = !favOnlyEmoji; emojiFavOnlyBtn.classList.toggle('active', favOnlyEmoji); showEmojiLibraryPage(1); });

  searchInput.addEventListener('input', () => {
    if (activeTab === 'emoji') showEmojiLibraryPage(1);
    else if (activeTab === 'stickers') showStickerPage(1);
    else if (activeTab === 'gifs') showGifPage(1);
  });
  pageJumpButton.addEventListener('click', () => {
    let val = parseInt(pageJumpInput.value, 10); if (isNaN(val) || val < 1) val = 1;
    if (activeTab === 'emoji') showEmojiLibraryPage(val);
    else if (activeTab === 'stickers') showStickerPage(val);
    else if (activeTab === 'gifs') showGifPage(val);
  });
  pageJumpInput.addEventListener('input', function () { this.value = this.value.replace(/[^0-9]/g, ''); });
  pageJumpInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') pageJumpButton.click(); });

  function showSettings() {
    activeTab = 'settings';
    homeTab.classList.remove('active'); emojiTab.classList.remove('active'); stickerTab.classList.remove('active'); gifTab.classList.remove('active'); settingsTab.classList.add('active');
    homePanel.style.display = 'none';
    gridEmoji.style.display = 'none'; gridStickers.style.display = 'none'; gridGifs.style.display = 'none';
    pagination.style.display = 'none'; pageJumpDiv.style.display = 'none'; searchBarDiv.style.display = 'none';
    emojiToolbar.style.display = 'none'; stickerToolbar.style.display = 'none'; gifToolbar.style.display = 'none';
    settingsPanel.style.display = 'block';
  }

  function refreshHomeStatus() {
    try {
      if (homeEmojiCount) homeEmojiCount.textContent = (allEmojis && allEmojis.length) ? String(allEmojis.length) : '0';
      if (homeStickerCount) homeStickerCount.textContent = (allStickers && allStickers.length) ? String(allStickers.length) : (STICKERS_JSON_URLS.length ? (stickersLoaded ? '0' : 'loading…') : '0');
      if (homeLocalGifsStatus) homeLocalGifsStatus.textContent = localGifStatus || (settings.localGifUrls ? 'loading…' : 'none');
      if (homeProvTenor) homeProvTenor.textContent = getApiKey('tenor') ? 'key saved' : 'not set';
      if (homeProvGiphy) homeProvGiphy.textContent = getApiKey('giphy') ? 'key saved' : 'not set';
      if (homeProvImgur) homeProvImgur.textContent = getApiKey('imgur') ? 'client id saved' : 'not set';
      if (homeProvTumblr) homeProvTumblr.textContent = getApiKey('tumblr') ? 'key saved' : 'not set';
    } catch {}
  }

  function showHome() {
    activeTab = 'home';
    homeTab.classList.add('active'); emojiTab.classList.remove('active'); stickerTab.classList.remove('active'); gifTab.classList.remove('active'); settingsTab.classList.remove('active');
    homePanel.style.display = 'block';
    gridEmoji.style.display = 'none';
    gridStickers.style.display = 'none';
    gridGifs.style.display = 'none';
    settingsPanel.style.display = 'none';
    emojiToolbar.style.display = 'none';
    stickerToolbar.style.display = 'none';
    gifToolbar.style.display = 'none';
    searchBarDiv.style.display = 'none';
    pagination.style.display = 'none';
    pageJumpDiv.style.display = 'none';
    homeVersion.textContent = `v${VERSION}`;
    refreshHomeStatus();
  }

  homeTab.addEventListener('click', showHome);
  emojiTab.addEventListener('click', () => { showEmojiLibraryPage(currentEmojiPage); });
  stickerTab.addEventListener('click', () => { showStickerPage(currentStickerPage); });
  gifTab.addEventListener('click', () => { showGifPage(currentGifPage); });
  settingsTab.addEventListener('click', showSettings);

  homeUpdateBtn.addEventListener('click', () => { checkForUpdate(); });
  homeDownloadBtn.addEventListener('click', () => { window.open('https://openuserjs.org/install/ZukoXZoku/Ultimate_Emojis.user.js','_blank'); });
  let __homeUpdateHideT = null;
  async function checkForUpdate() {
    try {
      homeUpdateStatus.style.display = 'inline';
      homeUpdateStatus.className = 'status-badge badge-ok';
      homeUpdateStatus.textContent = 'Checking…';
      clearTimeout(__homeUpdateHideT);
      const metaUrl = 'https://openuserjs.org/meta/ZukoXZoku/Ultimate_Emojis.meta.js';
      const txt = await fetchText(metaUrl);
      const m = txt.match(/@version\s+([^\r\n]+)/);
      const remote = m ? (m[1] || '').trim() : '';
      if (!remote) {
        homeUpdateStatus.className = 'status-badge badge-err';
        homeUpdateStatus.textContent = 'Failed to read version';
      } else {
        homeUpdateStatus.className = 'status-badge badge-ok';
        homeUpdateStatus.textContent = `Latest: v${remote}`;
      }
    } catch (e) {
      homeUpdateStatus.className = 'status-badge badge-err';
      homeUpdateStatus.textContent = 'Update check failed';
    } finally {
      clearTimeout(__homeUpdateHideT);
      __homeUpdateHideT = setTimeout(() => { homeUpdateStatus.style.display = 'none'; }, 3000);
    }
  }

  function initSettingsUI() {
    const er = settingsPanel.querySelectorAll('input[name="emojiSize"]');
    let me = false; er.forEach(r => { if (Number(r.value) === Number(settings.emojiSize)) { r.checked = true; me = true; } });
    emojiSizeCustom.value = me ? '' : (settings.emojiSize || '');
    const sr = settingsPanel.querySelectorAll('input[name="stickerSize"]');
    let ms = false; sr.forEach(r => { if (Number(r.value) === Number(settings.stickerSize)) { r.checked = true; ms = true; } });
    stickerSizeCustom.value = ms ? '' : (settings.stickerSize || '');

    const gir = settingsPanel.querySelectorAll('input[name="gifInsertSize"]');
    let giMatch = false;
    gir.forEach(r => { if (Number(r.value) === Number(settings.gifInsertSize)) { r.checked = true; giMatch = true; } });
    gifInsertSizeCustom.value = giMatch ? '' : (settings.gifInsertSize || '');

    gifSizeRange.value = settings.gifSize; gifSizeVal.textContent = `${settings.gifSize}px`;
    gifPerPageRange.value = settings.gifPerPage; gifPerPageVal.textContent = `${settings.gifPerPage}`;
    gifMinColRange.value = settings.gifMinCol; gifMinColVal.textContent = `${settings.gifMinCol}px`;
    showGifStarCb.checked = !!settings.showGifStar;
    gifShowTitlesCb.checked = !!settings.gifShowTitles;
    defaultGifProviderSel.value = settings.gifProvider || 'local';

    menuWidthRange.value = settings.menuWidth; menuWidthVal.textContent = `${settings.menuWidth}px`;
    menuHeightPxRange.value = settings.menuHeightPx; menuHeightPxVal.textContent = `${settings.menuHeightPx}px`;
    menuMaxHeightVhRange.value = settings.menuMaxHeightVh; menuMaxHeightVhVal.textContent = `${settings.menuMaxHeightVh}vh`;
    menuRadiusRange.value = settings.menuRadius; menuRadiusVal.textContent = `${settings.menuRadius}px`;
    tileRadiusRange.value = settings.tileRadius; tileRadiusVal.textContent = `${settings.tileRadius}px`;
    uiFontSizeRange.value = settings.uiFontSize; uiFontSizeVal.textContent = `${settings.uiFontSize}px`;
    shadowRange.value = settings.shadow; shadowVal.textContent = settings.shadow.toFixed(2);
    gapEmojiRange.value = settings.gapEmoji; gapEmojiVal.textContent = `${settings.gapEmoji}px`;
    gapLargeRange.value = settings.gapLarge; gapLargeVal.textContent = `${settings.gapLarge}px`;

    bgColorPicker.value = settings.bg; bgAlphaRange.value = settings.bgAlpha; bgAlphaVal.textContent = settings.bgAlpha.toFixed(2);
    textColorPicker.value = settings.text; accentColorPicker.value = settings.accent;
    borderColorPicker.value = settings.borderColor; borderWidthRange.value = settings.borderWidth; borderWidthVal.textContent = `${settings.borderWidth}px`;
    fontFamilyInput.value = settings.fontFamily;

    tileBgInput.value = settings.tileBg;
    hoverScaleRange.value = settings.hoverScale; hoverScaleVal.textContent = settings.hoverScale.toFixed(2);
    glowStrengthRange.value = settings.glowStrength; glowStrengthVal.textContent = `${settings.glowStrength}px`;

    starColorPicker.value = settings.starColor;
    starBgInput.value = settings.starBg;
    starBorderPicker.value = settings.starBorder;
    starSizeRange.value = settings.starSize; starSizeVal.textContent = `${settings.starSize}px`;
    starSmSizeRange.value = settings.starSmSize; starSmSizeVal.textContent = `${settings.starSmSize}px`;
    starTopRange.value = settings.starTop; starTopVal.textContent = `${settings.starTop}px`;
    starRightRange.value = settings.starRight; starRightVal.textContent = `${settings.starRight}px`;
    btnRadiusRange.value = settings.btnRadius; btnRadiusVal.textContent = `${settings.btnRadius}px`;
    searchRadiusRange.value = settings.searchRadius; searchRadiusVal.textContent = `${settings.searchRadius}px`;
    searchBorderPicker.value = settings.searchBorder;
    backdropBlurRange.value = settings.backdropBlur; backdropBlurVal.textContent = `${settings.backdropBlur}px`;
    zIndexInput.value = settings.zIndex;
    paginationBgPicker.value = settings.paginationBg;
    paginationActiveBgPicker.value = settings.paginationActiveBg;
    paginationColorPicker.value = settings.paginationColor;

    settingsPanel.querySelectorAll('input[name="apiScope"]').forEach(r => { r.checked = (r.value === (settings.apiScope || 'global')); });
    redditSubsInput.value = settings.redditSubs || DEFAULTS.redditSubs;
    redditIncludeImagesCb.checked = !!settings.redditIncludeImages;
    swTenor.checked = !!settings.provTenor;
    swGiphy.checked = !!settings.provGiphy;
    swImgur.checked = !!settings.provImgur;
    swTumblr.checked = !!settings.provTumblr;
    localGifUrlsArea.value = settings.localGifUrls || '';
    refreshApiUI();
  }

  settingsPanel.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'emojiSize') { settings.emojiSize = Number(t.value); emojiSizeCustom.value = ''; saveSettings(); applyCssVars(); if (activeTab === 'emoji') showEmojiLibraryPage(currentEmojiPage); }
    if (t.name === 'stickerSize') { settings.stickerSize = Number(t.value); stickerSizeCustom.value = ''; saveSettings(); applyCssVars(); if (activeTab === 'stickers') showStickerPage(currentStickerPage); }
    if (t.name === 'apiScope') { settings.apiScope = t.value; saveSettings(); refreshApiUI(); refreshHomeStatus(); }
    if (t.name === 'gifInsertSize') { settings.gifInsertSize = Number(t.value); gifInsertSizeCustom.value = ''; saveSettings(); }
  });
  emojiSizeCustom.addEventListener('input', () => {
    const val = Number(emojiSizeCustom.value);
    if (!isNaN(val) && val >= 12 && val <= 256) { settings.emojiSize = val; saveSettings(); applyCssVars(); if (activeTab==='emoji') showEmojiLibraryPage(currentEmojiPage); settingsPanel.querySelectorAll('input[name="emojiSize"]').forEach(r => r.checked = false); }
  });
  stickerSizeCustom.addEventListener('input', () => {
    const val = Number(stickerSizeCustom.value);
    if (!isNaN(val) && val >= 64 && val <= 1024) { settings.stickerSize = val; saveSettings(); applyCssVars(); if (activeTab==='stickers') showStickerPage(currentStickerPage); settingsPanel.querySelectorAll('input[name="stickerSize"]').forEach(r => r.checked = false); }
  });

  gifInsertSizeCustom.addEventListener('input', () => {
    const val = Number(gifInsertSizeCustom.value);
    if (!isNaN(val) && val >= 50 && val <= 1024) {
      settings.gifInsertSize = val;
      saveSettings();
      settingsPanel.querySelectorAll('input[name="gifInsertSize"]').forEach(r => r.checked = false);
    }
  });

  gifSizeRange.addEventListener('input', () => {
    settings.gifSize = Number(gifSizeRange.value);
    gifSizeVal.textContent = `${settings.gifSize}px`;
    saveSettings();
    applyCssVars();
    if (activeTab === 'gifs') showGifPage(currentGifPage);
    if (activeTab === 'stickers') showStickerPage(currentStickerPage);
  });
  gifPerPageRange.addEventListener('input', () => {
    settings.gifPerPage = Number(gifPerPageRange.value);
    gifPerPageVal.textContent = `${settings.gifPerPage}`;
    saveSettings();
    if (activeTab === 'gifs') showGifPage(1);
  });
  gifMinColRange.addEventListener('input', () => {
    settings.gifMinCol = Number(gifMinColRange.value);
    gifMinColVal.textContent = `${settings.gifMinCol}px`;
    saveSettings(); applyCssVars();
    if (activeTab === 'gifs') showGifPage(currentGifPage);
  });
  showGifStarCb.addEventListener('change', () => {
    settings.showGifStar = !!showGifStarCb.checked;
    saveSettings();
    if (activeTab === 'gifs') showGifPage(currentGifPage);
  });
  gifShowTitlesCb.addEventListener('change', () => {
    settings.gifShowTitles = !!gifShowTitlesCb.checked;
    saveSettings();
    if (activeTab === 'gifs') showGifPage(currentGifPage);
  });
  defaultGifProviderSel.addEventListener('change', () => {
    settings.gifProvider = defaultGifProviderSel.value;
    saveSettings();
    updateProviderButtons();
    if (activeTab === 'gifs') showGifPage(1);
  });

  menuWidthRange.addEventListener('input', () => { settings.menuWidth = Number(menuWidthRange.value); menuWidthVal.textContent = `${settings.menuWidth}px`; saveSettings(); applyCssVars(); CURRENT_CSS_BASE = cssBase; });
  menuHeightPxRange.addEventListener('input', () => { settings.menuHeightPx = Number(menuHeightPxRange.value); menuHeightPxVal.textContent = `${settings.menuHeightPx}px`; saveSettings(); applyCssVars(); });
  menuMaxHeightVhRange.addEventListener('input', () => { settings.menuMaxHeightVh = Number(menuMaxHeightVhRange.value); menuMaxHeightVhVal.textContent = `${settings.menuMaxHeightVh}vh`; saveSettings(); applyCssVars(); });
  menuRadiusRange.addEventListener('input', () => { settings.menuRadius = Number(menuRadiusRange.value); menuRadiusVal.textContent = `${settings.menuRadius}px`; saveSettings(); applyCssVars(); });
  tileRadiusRange.addEventListener('input', () => { settings.tileRadius = Number(tileRadiusRange.value); tileRadiusVal.textContent = `${settings.tileRadius}px`; saveSettings(); applyCssVars(); });
  uiFontSizeRange.addEventListener('input', () => { settings.uiFontSize = Number(uiFontSizeRange.value); uiFontSizeVal.textContent = `${settings.uiFontSize}px`; saveSettings(); applyCssVars(); });
  shadowRange.addEventListener('input', () => { settings.shadow = Number(shadowRange.value); shadowVal.textContent = settings.shadow.toFixed(2); saveSettings(); applyCssVars(); });
  gapEmojiRange.addEventListener('input', () => { settings.gapEmoji = Number(gapEmojiRange.value); gapEmojiVal.textContent = `${settings.gapEmoji}px`; saveSettings(); applyCssVars(); if (activeTab==='emoji') showEmojiLibraryPage(currentEmojiPage); });
  gapLargeRange.addEventListener('input', () => { settings.gapLarge = Number(gapLargeRange.value); gapLargeVal.textContent = `${settings.gapLarge}px`; saveSettings(); applyCssVars(); if (activeTab==='stickers') showStickerPage(currentStickerPage); if (activeTab==='gifs') showGifPage(currentGifPage); });

  bgColorPicker.addEventListener('input', () => { settings.bg = bgColorPicker.value; saveSettings(); applyCssVars(); });
  bgAlphaRange.addEventListener('input', () => { settings.bgAlpha = Number(bgAlphaRange.value); bgAlphaVal.textContent = settings.bgAlpha.toFixed(2); saveSettings(); applyCssVars(); });
  textColorPicker.addEventListener('input', () => { settings.text = textColorPicker.value; saveSettings(); applyCssVars(); });
  accentColorPicker.addEventListener('input', () => { settings.accent = accentColorPicker.value; saveSettings(); applyCssVars(); });
  borderColorPicker.addEventListener('input', () => { settings.borderColor = borderColorPicker.value; saveSettings(); applyCssVars(); });
  borderWidthRange.addEventListener('input', () => { settings.borderWidth = Number(borderWidthRange.value); borderWidthVal.textContent = `${settings.borderWidth}px`; saveSettings(); applyCssVars(); });
  fontFamilyInput.addEventListener('change', () => { const v = fontFamilyInput.value.trim(); if (v) { settings.fontFamily = v; saveSettings(); applyCssVars(); } });

  tileBgInput.addEventListener('input', () => { settings.tileBg = tileBgInput.value; saveSettings(); applyCssVars(); });
  hoverScaleRange.addEventListener('input', () => { settings.hoverScale = Number(hoverScaleRange.value); hoverScaleVal.textContent = settings.hoverScale.toFixed(2); saveSettings(); applyCssVars(); });
  glowStrengthRange.addEventListener('input', () => { settings.glowStrength = Number(glowStrengthRange.value); glowStrengthVal.textContent = `${settings.glowStrength}px`; saveSettings(); applyCssVars(); });

  starColorPicker.addEventListener('input', () => { settings.starColor = starColorPicker.value; saveSettings(); applyCssVars(); });
  starBgInput.addEventListener('input', () => { settings.starBg = starBgInput.value || 'rgba(0,0,0,.35)'; saveSettings(); applyCssVars(); });
  starBorderPicker.addEventListener('input', () => { settings.starBorder = starBorderPicker.value; saveSettings(); applyCssVars(); });
  starSizeRange.addEventListener('input', () => { settings.starSize = Number(starSizeRange.value); starSizeVal.textContent = `${settings.starSize}px`; saveSettings(); applyCssVars(); });
  starSmSizeRange.addEventListener('input', () => { settings.starSmSize = Number(starSmSizeRange.value); starSmSizeVal.textContent = `${settings.starSmSize}px`; saveSettings(); applyCssVars(); });
  starTopRange.addEventListener('input', () => { settings.starTop = Number(starTopRange.value); starTopVal.textContent = `${settings.starTop}px`; saveSettings(); applyCssVars(); });
  starRightRange.addEventListener('input', () => { settings.starRight = Number(starRightRange.value); starRightVal.textContent = `${settings.starRight}px`; saveSettings(); applyCssVars(); });

  btnRadiusRange.addEventListener('input', () => { settings.btnRadius = Number(btnRadiusRange.value); btnRadiusVal.textContent = `${settings.btnRadius}px`; saveSettings(); applyCssVars(); });
  searchRadiusRange.addEventListener('input', () => { settings.searchRadius = Number(searchRadiusRange.value); searchRadiusVal.textContent = `${settings.searchRadius}px`; saveSettings(); applyCssVars(); });
  searchBorderPicker.addEventListener('input', () => { settings.searchBorder = searchBorderPicker.value; saveSettings(); applyCssVars(); });
  backdropBlurRange.addEventListener('input', () => { settings.backdropBlur = Number(backdropBlurRange.value); backdropBlurVal.textContent = `${settings.backdropBlur}px`; saveSettings(); applyCssVars(); });
  zIndexInput.addEventListener('change', () => { settings.zIndex = Number(zIndexInput.value) || DEFAULTS.zIndex; saveSettings(); applyCssVars(); });

  paginationBgPicker.addEventListener('input', () => { settings.paginationBg = paginationBgPicker.value; saveSettings(); applyCssVars(); });
  paginationActiveBgPicker.addEventListener('input', () => { settings.paginationActiveBg = paginationActiveBgPicker.value; saveSettings(); applyCssVars(); });
  paginationColorPicker.addEventListener('input', () => { settings.paginationColor = paginationColorPicker.value; saveSettings(); applyCssVars(); });

  loadDefaultCssBtn.addEventListener('click', () => {
    customCssArea.value = CURRENT_CSS_BASE || cssBase;
  });
  applyCustomCssBtn.addEventListener('click', () => { applyCustomCss(customCssArea.value || ''); });
  exportCustomCssBtn.addEventListener('click', async () => { await copyText(customCssArea.value || ''); exportCustomCssBtn.textContent = 'Copied!'; setTimeout(() => exportCustomCssBtn.textContent = 'Export CSS', 900); });
  clearCustomCssBtn.addEventListener('click', () => { customCssArea.value = ''; applyCustomCss(''); });

  const STYLE_KEYS = Object.keys(DEFAULTS);
  exportStyleBtn.addEventListener('click', async () => {
    const data = {}; STYLE_KEYS.forEach(k => data[k] = settings[k]);
    data.customCss = GM_GetValueSafe(CUSTOM_CSS_KEY, '');
    const txt = JSON.stringify(data, null, 2);
    styleJsonArea.value = txt;
    await copyText(txt);
    exportStyleBtn.textContent = 'Copied!'; setTimeout(()=>exportStyleBtn.textContent='Copy style JSON', 900);
  });
  resetStyleBtn.addEventListener('click', () => {
    Object.assign(settings, DEFAULTS);
    saveSettings(); applyCssVars(); initSettingsUI();
    showAfterReset(); refreshHomeStatus();
  });
  importStyleBtn.addEventListener('click', () => {
    importSummary.textContent = '';
    let obj = null;
    try { obj = JSON.parse(styleJsonArea.value); } catch (e) { alert('Invalid JSON'); return; }
    if (!obj || typeof obj !== 'object') { alert('Invalid JSON'); return; }
    let applied = 0, ignored = 0;
    STYLE_KEYS.forEach(k => { if (k in obj) { settings[k] = obj[k]; applied++; } });
    Object.keys(obj).forEach(k => { if (!STYLE_KEYS.includes(k) && k !== 'customCss') ignored++; });
    saveSettings(); applyCssVars(); initSettingsUI();
    if ('customCss' in obj) { applyCustomCss(String(obj.customCss || '')); }
    importSummary.textContent = `Applied ${applied} keys${ignored ? `, ignored ${ignored}` : ''}.`;
    showAfterReset(); refreshHomeStatus();
  });
  function showAfterReset() {
    if (activeTab === 'emoji') showEmojiLibraryPage(currentEmojiPage);
    if (activeTab === 'stickers') showStickerPage(currentStickerPage);
    if (activeTab === 'gifs') showGifPage(currentGifPage);
    if (activeTab === 'home') showHome();
  }

  resetAllBtn.addEventListener('click', () => {
    if (!confirm('Reset appearance to defaults?')) return;
    Object.assign(settings, DEFAULTS);
    saveSettings(); applyCssVars(); initSettingsUI(); showAfterReset(); refreshHomeStatus();
    alert('Appearance reset to defaults.');
  });
  resetAllDataBtn.addEventListener('click', () => {
    if (!confirm('Reset EVERYTHING?\nThis will clear appearance, favorites, API keys, custom CSS and caches.')) return;
    Object.assign(settings, DEFAULTS); saveSettings(); applyCssVars();
    favEmojiV2.clear(); favStickerV2.clear(); favGifV2.clear();
    favEmojiLegacy.clear(); favStickerLegacy.clear(); favGifLegacy.clear();
    favMeta = {};
    saveFavV2(FAV_KEYS.emojiV2, favEmojiV2);
    saveFavV2(FAV_KEYS.stickerV2, favStickerV2);
    saveFavV2(FAV_KEYS.gifV2, favGifV2);
    saveFavLegacy(FAV_KEYS.emojiLegacy, favEmojiLegacy);
    saveFavLegacy(FAV_KEYS.stickerLegacy, favStickerLegacy);
    saveFavLegacy(FAV_KEYS.gifLegacy, favGifLegacy);
    saveFavMeta();
    writeApiStore('global', {});
    writeApiStore('site', {});
    applyCustomCss(''); customCssArea.value = '';
    initSettingsUI(); showAfterReset(); refreshHomeStatus();
    alert('All data has been reset.');
  });

  function setStatus(el, ok, msg) { el.textContent = msg || (ok ? 'OK' : 'Error'); el.className = 'status-badge ' + (ok ? 'badge-ok' : 'badge-err'); }
  function refreshApiUI() {
    const t = getApiKey('tenor'); const g = getApiKey('giphy'); const i = getApiKey('imgur'); const u = getApiKey('tumblr');
    tenorKeyInput.value = t; giphyKeyInput.value = g; imgurKeyInput.value = i; tumblrKeyInput.value = u;
    setStatus(document.getElementById('st-tenor'), !!t, t ? 'Saved' : 'Not set');
    setStatus(document.getElementById('st-giphy'), !!g, g ? 'Saved' : 'Not set');
    setStatus(document.getElementById('st-imgur'), !!i, i ? 'Saved' : 'Not set');
    setStatus(document.getElementById('st-tumblr'), !!u, u ? 'Saved' : 'Not set');
  }
  saveTenorBtn.addEventListener('click', () => { setApiKey('tenor', tenorKeyInput.value.trim()); refreshApiUI(); refreshHomeStatus(); });
  saveGiphyBtn.addEventListener('click', () => { setApiKey('giphy', giphyKeyInput.value.trim()); refreshApiUI(); refreshHomeStatus(); });
  saveImgurBtn.addEventListener('click', () => { setApiKey('imgur', imgurKeyInput.value.trim()); refreshApiUI(); refreshHomeStatus(); });
  saveTumblrBtn.addEventListener('click', () => { setApiKey('tumblr', tumblrKeyInput.value.trim()); refreshApiUI(); refreshHomeStatus(); });

  function attachShow(btn, input) { btn.addEventListener('click', () => { input.type = input.type === 'password' ? 'text' : 'password'; btn.textContent = input.type === 'password' ? 'Show' : 'Hide'; }); }
  attachShow(showTenorBtn, tenorKeyInput);
  attachShow(showGiphyBtn, giphyKeyInput);
  attachShow(showImgurBtn, imgurKeyInput);
  attachShow(showTumblrBtn, tumblrKeyInput);

  testTenorBtn.addEventListener('click', async () => {
    const el = document.getElementById('st-tenor');
    setStatus(el, true, 'Testing...');
    testTenorBtn.disabled = true;
    try {
      const key = tenorKeyInput.value.trim() || getApiKey('tenor'); if (!key) throw new Error('No Tenor key.');
      const r = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(key)}&limit=1&media_filter=gif`);
      setStatus(el, !!r?.results, r?.results ? 'OK' : 'Failed');
    } catch(e){ setStatus(el, false, 'Failed'); } finally { testTenorBtn.disabled = false; }
  });
  testGiphyBtn.addEventListener('click', async () => {
    const el = document.getElementById('st-giphy');
    setStatus(el, true, 'Testing...');
    testGiphyBtn.disabled = true;
    try {
      const key = giphyKeyInput.value.trim() || getApiKey('giphy'); if (!key) throw new Error('No GIPHY key.');
      const r = await fetchJson(`https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(key)}&limit=1`);
      setStatus(el, !!r?.data, r?.data ? 'OK' : 'Failed');
    } catch(e){ setStatus(el, false, 'Failed'); } finally { testGiphyBtn.disabled = false; }
  });
  testImgurBtn.addEventListener('click', async () => {
    const el = document.getElementById('st-imgur');
    setStatus(el, true, 'Testing...');
    testImgurBtn.disabled = true;
    try {
      const id = imgurKeyInput.value.trim() || getApiKey('imgur'); if (!id) throw new Error('No Imgur Client-ID.');
      const r = await fetchJson(`https://api.imgur.com/3/credits`, { 'Authorization': `Client-ID ${id}` });
      setStatus(el, !!r?.data, r?.data ? 'OK' : 'Failed');
    } catch(e){ setStatus(el, false, 'Failed'); } finally { testImgurBtn.disabled = false; }
  });
  testTumblrBtn.addEventListener('click', async () => {
    const el = document.getElementById('st-tumblr');
    setStatus(el, true, 'Testing...');
    testTumblrBtn.disabled = true;
    try {
      const key = tumblrKeyInput.value.trim() || getApiKey('tumblr'); if (!key) throw new Error('No Tumblr key.');
      const r = await fetchJson(`https://api.tumblr.com/v2/tagged?tag=gif&api_key=${encodeURIComponent(key)}&limit=1`);
      setStatus(el, !!r?.response, r?.response ? 'OK' : 'Failed');
    } catch(e){ setStatus(el, false, 'Failed'); } finally { testTumblrBtn.disabled = false; }
  });

  saveRedditSubsBtn.addEventListener('click', () => {
    const raw = redditSubsInput.value || '';
    settings.redditSubs = raw;
    saveSettings();
    saveRedditSubsBtn.textContent = 'Saved';
    setTimeout(()=> saveRedditSubsBtn.textContent = 'Save', 900);
    if (activeTab === 'gifs' && settings.gifProvider === 'reddit') showGifPage(1);
  });
  redditIncludeImagesCb.addEventListener('change', () => {
    settings.redditIncludeImages = !!redditIncludeImagesCb.checked;
    saveSettings();
    if (activeTab === 'gifs' && settings.gifProvider === 'reddit') showGifPage(1);
  });

  swTenor.addEventListener('change', () => { settings.provTenor = !!swTenor.checked; saveSettings(); updateProviderButtons(); if (activeTab==='gifs') showGifPage(1); });
  swGiphy.addEventListener('change', () => { settings.provGiphy = !!swGiphy.checked; saveSettings(); updateProviderButtons(); if (activeTab==='gifs') showGifPage(1); });
  swImgur.addEventListener('change', () => { settings.provImgur = !!swImgur.checked; saveSettings(); updateProviderButtons(); if (activeTab==='gifs') showGifPage(1); });
  swTumblr.addEventListener('change', () => { settings.provTumblr = !!swTumblr.checked; saveSettings(); updateProviderButtons(); if (activeTab==='gifs') showGifPage(1); });

  saveLocalGifsBtn.addEventListener('click', async () => {
    settings.localGifUrls = localGifUrlsArea.value.trim();
    saveSettings();
    stLocalGifs.textContent = 'Saved';
    gifsLoaded = false;
    localGifStatus = '';
    await loadLocalGifs();
    stLocalGifs.textContent = localGifStatus;
    if (activeTab === 'gifs' && settings.gifProvider === 'local') showGifPage(1);
  });
  reloadLocalGifsBtn.addEventListener('click', async () => {
    stLocalGifs.textContent = 'Reloading…';
    gifsLoaded = false;
    await loadLocalGifs();
    stLocalGifs.textContent = localGifStatus;
    if (activeTab === 'gifs' && settings.gifProvider === 'local') showGifPage(1);
  });

  toggleChangelogBtn.addEventListener('click', () => {
    const el = document.getElementById('uni-changelog');
    const vis = window.getComputedStyle(el).display !== 'none';
    el.style.display = vis ? 'none' : 'block';
  });

  const emojisButtonEmojis = [
    '😀'];
  let emojiButton = document.getElementById('global-emoji-button');
  if (!emojiButton) {
    emojiButton = document.createElement('span');
    emojiButton.id = 'global-emoji-button';
    emojiButton.className = 'emoji-button';
    emojiButton.innerHTML = '😀';
    emojiButton.setAttribute('role', 'button');
    emojiButton.setAttribute('aria-label', 'Insert emoji');
    emojiButton.tabIndex = 0;
    document.body.appendChild(emojiButton);
  }
  const textareaSelector = 'textarea:not([type="search"]):not([role="searchbox"])';
  function getActiveTextarea() { const el = document.activeElement; if (el && el.matches && el.matches(textareaSelector)) return el; return document.querySelector(textareaSelector); }
  emojiButton.onmouseenter = () => { const r = emojisButtonEmojis[Math.floor(Math.random() * emojisButtonEmojis.length)]; emojiButton.innerHTML = r; emojiButton.style.filter = 'grayscale(0%)'; emojiButton.style.transform = 'scale(1.1)'; };
  emojiButton.onmouseleave = () => { emojiButton.style.filter = 'grayscale(80%)'; emojiButton.style.transform = 'scale(1)'; };
  emojiButton.onclick = (e) => {
    e.stopPropagation();
    const input = getActiveTextarea(); if (!input) return;
    const menu = document.getElementById('uni-emoji-menu');
    if (menu) {
      const isHidden = window.getComputedStyle(menu).display === 'none';
      menu.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) showEmojiLibraryPage(currentEmojiPage);
    }
  };
  emojiButton.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emojiButton.click(); } };

  (function addGlobalDismissHandlers() {
    const FLAG = '__emojiHandlersAdded__'; if (window[FLAG]) return; window[FLAG] = true;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const menu = document.getElementById('uni-emoji-menu'); if (menu) menu.style.display = 'none'; hideCtxMenu(); } });
  })();

  container.querySelectorAll('.exitbtn').forEach(button => {
    button.addEventListener('click', function () {
      const menu = document.getElementById('uni-emoji-menu'); if (menu) menu.style.display = 'none';
    });
  });

  document.addEventListener('keydown', (e) => {
    const isWinLinCombo = e.ctrlKey && e.altKey && !e.metaKey && e.key.toLowerCase() === 'e';
    const isMacCombo = e.metaKey && e.altKey && !e.ctrlKey && e.key.toLowerCase() === 'e';
    if (isWinLinCombo || isMacCombo) {
      const menu = document.getElementById('uni-emoji-menu'); if (menu) {
        const isHidden = window.getComputedStyle(menu).display === 'none';
        menu.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) showEmojiLibraryPage(currentEmojiPage);
      }
      e.preventDefault();
    }
  });

  (function enableDraggableMenuFromTop() {
    let isDragging = false; let offsetX = 0, offsetY = 0;
    function init() {
      const frame = document.getElementById("uni-emoji-menu"); if (!frame) return;
      const header = frame.querySelector(".dragbtn"); if (!header) return;
      header.style.cursor = "move";
      header.addEventListener("mousedown", function (e) {
        isDragging = true; const rect = frame.getBoundingClientRect();
        offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
        document.addEventListener("mousemove", onMouseMove); document.addEventListener("mouseup", onMouseUp); e.preventDefault();
      });
      function onMouseMove(e) { if (!isDragging) return; frame.style.left = (e.clientX - offsetX) + "px"; frame.style.top = (e.clientY - offsetY) + "px"; frame.style.right = "auto"; frame.style.bottom = "auto"; }
      function onMouseUp() { isDragging = false; document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("mouseup", onMouseUp); }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else setTimeout(init, 0);
  })();

  applyCssVars();
  initSettingsUI();
  showEmojiLibraryPage(currentEmojiPage);
})();