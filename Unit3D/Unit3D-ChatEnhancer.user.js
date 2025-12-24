// ==UserScript==
// @name            Unit3D – Chat Enhancer (ThatNeoByte Edition)
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         2.1.6-tnb.1
// @description     Chat enhancements for Unit3D-based sites. Includes reply, message, gift buttons, BBCode helpers, and a toggle menu. Contains a small patch by ThatNeoByte; original script by ZukoXZoku.
//
// @author          ZukoXZoku
// @license         MIT
//
// @credits         Original script by ZukoXZoku
// @source          https://openuserjs.org/scripts/ZukoXZoku/Enhanced_Chat_Unit3D
// @modified-by     ThatNeoByte (minor patch)
//
// @icon            https://ptpimg.me/883q39.png
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-ChatEnhancer.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-ChatEnhancer.user.js
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
// @include         *://onlyencodes.cc/*
// @exclude         *://onlyencodes.cc/widgets/*
//
// @grant           GM_addStyle
// ==/UserScript==

// Additional credits
// ZukoXZoku@OTW
if (window.__U3D_ENHANCED_CHAT_INIT__) {
  // prevent double init
}
else {
  window.__U3D_ENHANCED_CHAT_INIT__ = true;

  GM_addStyle(`
    :root {
      --u3d-bg:#0f172a;
      --u3d-surface:#1e2738;
      --u3d-surface2:#2a3550;
      --u3d-border:#3f495f;
      --u3d-text:#eaeaea;
      --u3d-muted:#a7b0c4;
      --u3d-link:#8cc0ff;
      --u3d-link-hover:#cfe3ff;

      --u3d-reply-1:#2dd4bf; --u3d-reply-2:#14b8a6;
      --u3d-dm-1:#60a5fa;    --u3d-dm-2:#3b82f6;
      --u3d-gift-1:#f59e0b;  --u3d-gift-2:#ec4899;
      --u3d-action-radius:8px;
    }

    .fa-solid.fa-gear:hover { animation: spin 1.3s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    #chatbox_header.u3d-hide-actions .panel__action,
    .u3d-chat-header.u3d-hide-actions .panel__action { display: none !important; }

    #chatbox_header { position: relative; border-radius: 15px 15px 0 0; }
    #chatbox_header .panel__heading { border-radius: 15px 15px 0 0; color: var(--u3d-text); }

    .u3d-settings-anchor { margin-right: 5px; z-index: 1; padding: 7px; }
    #settingsButton {
      cursor: pointer; color: var(--u3d-text); display: inline-flex; align-items: center; justify-content: center;
      font-size: 16px; width: 28px; height: 28px; border-radius: 6px; background: transparent;
    }
    #settingsButton:hover { background: rgba(255,255,255,0.08); }

    #settingsPanel {
      display: none; position: absolute; top: calc(100% + 8px); right: 0;
      background: var(--u3d-surface); border-radius: 12px; border: 1px solid var(--u3d-border);
      padding: 16px; color: var(--u3d-text); z-index: 10011; width: 360px; font-family: 'Segoe UI', sans-serif;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-size: 14px;
    }
    #settingsPanel .title { color: var(--u3d-text); display:flex; justify-content:space-between; align-items:center; }
    #settingsPanel .title .ver { font-size: 12px; color: var(--u3d-muted); }
    #settingsPanel .row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; gap: 10px; }
    #settingsPanel .row .label { min-width: 110px; color: var(--u3d-muted); }
    #settingsPanel .row input[type="number"], #settingsPanel .row input[type="text"], #settingsPanel .row select, #settingsPanel .row button, #settingsPanel .row input[type="color"] {
      background: var(--u3d-surface2); border:1px solid var(--u3d-border); color: var(--u3d-text); border-radius:6px;
      padding:6px 8px; cursor: pointer;
    }
    #settingsPanel .row .inline { display:flex; gap:8px; align-items:center; flex-wrap: wrap; }
    #settingsPanel .section { border: 1px solid var(--u3d-border); border-radius: 10px; padding: 10px; margin: 10px 0; }
    #settingsPanel .section .section-title { font-weight: 700; margin-bottom: 6px; color: var(--u3d-text); }

    .switch { position: relative; display: inline-block; width: 38px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #444c64; border-radius: 20px; transition: 0.3s; }
    .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px;
      background-color: var(--u3d-text); border-radius: 50%; transition: 0.3s; }
    .switch input:checked + .slider { background-color: #5b43d1; }
    .switch input:checked + .slider:before { transform: translateX(18px); }

    .u3d-btn {
      cursor: pointer; background: var(--u3d-surface2); color: var(--u3d-text); border: 1px solid var(--u3d-border); border-radius: 8px;
      padding: 6px 10px; font-size: 13px;
    }
    .u3d-btn:hover { background: #344261; }

    .bbcode-button {
      cursor: pointer; padding: 6px 10px 2px 10px; border-radius: 8px; color: var(--u3d-text); transition: 0.2s ease;
      display: inline-flex; align-items: center; justify-content: center; min-width: 34px; min-height: 30px; border: 1px solid transparent;
    }
    .bbcode-button:hover { background-color: var(--u3d-surface2); border-color: var(--u3d-border); }

    #bbCodesPanelShell { position: relative; display: inline-flex; width: 100%; }
    #bbCodesPanelShell > div { width: 100%; }

    .u3d-bb-more { position: relative; }
    #bbCodeDropdown {
      color: var(--u3d-text); display: inline-flex; align-items: center; justify-content: center;
      padding: 8px 10px; border-radius: 8px; transition: 0.2s ease; cursor: pointer;
    }
    #bbCodeDropdown:hover { background: var(--u3d-surface2); border: 1px solid var(--u3d-border); }
    #bbCodeDropdown.open { background: var(--u3d-surface2); }
    #bbCodeDropdown i { transition: transform 0.2s ease; }
    #bbCodeDropdown.open i { transform: rotate(90deg); }
    #bbCodeDropdownMenu {
      position: absolute; top: calc(100% + 8px); background: #151d29; padding: 10px; border: 1px solid var(--u3d-border);
      border-radius: 10px; box-shadow: 0 6px 16px rgba(0,0,0,0.45); z-index: 10015; display: none;
      width: max-content; min-width: 260px; max-width: 560px;
    }
    #bbCodeDropdownMenu.open { display: block; }
    #bbCodeDropdownMenu .grid {
      display: grid; grid-template-columns: repeat(8, 36px); gap: 8px; align-items: center; justify-items: center;
    }
    #bbCodeDropdownMenu .bbcode-button { width: 36px; height: 32px; padding: 0; }

    .u3d-action-bar { display: inline-flex; gap: 6px; margin-left: 6px; align-items: center; vertical-align: middle; }
    .u3d-action-btn {
      cursor: pointer; width: 28px; height: 28px; border-radius: var(--u3d-action-radius); display: inline-flex; align-items: center; justify-content: center;
      color: var(--u3d-text); background: transparent; border: 1px solid transparent;
      transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease;
    }
    .u3d-action-btn:hover { transform: translateY(-1px); }

    html.u3d-action-fancy .u3d-action-btn--reply { background: linear-gradient(135deg,var(--u3d-reply-1),var(--u3d-reply-2)); color: #041512; }
    html.u3d-action-fancy .u3d-action-btn--dm    { background: linear-gradient(135deg,var(--u3d-dm-1),var(--u3d-dm-2));    color: #031226; }
    html.u3d-action-fancy .u3d-action-btn--gift  { background: linear-gradient(135deg,var(--u3d-gift-1),var(--u3d-gift-2));  color: #170a03; }
    html:not(.u3d-action-fancy) .u3d-action-btn:hover { background: rgba(255,255,255,.08); }

    html.u3d-actions-hover .u3d-action-bar { opacity: 0; pointer-events: none; transition: opacity .15s ease; }
    html.u3d-actions-hover .chatbox-message:hover .u3d-action-bar,
    html.u3d-actions-hover .message:hover .u3d-action-bar { opacity: 1; pointer-events: auto; }

    #settingsThemes .radio-group { display: flex; flex-wrap: wrap; gap: 10px; }
    #settingsThemes .radio-group label { background: rgba(255,255,255,0.04); border: 1px solid var(--u3d-border); padding: 6px 10px; border-radius: 8px; cursor:pointer; }
    #settingsThemes .radio-group input { margin-right: 6px; }
    #settingsThemes .palette { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    #settingsThemes .palette .row { justify-content: space-between; }
    #settingsThemes .buttons { display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr); padding: 10px; }

    .u3d-textarea { width: 100%; min-height: 160px; resize: vertical; background: #0d1422; color: var(--u3d-text);
      border: 1px solid var(--u3d-border); border-radius: 8px; padding: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12.5px; line-height: 1.45;
    }

    #settingsChangelog .changelog-entry { border: 1px solid var(--u3d-border); border-radius: 10px; padding: 10px; margin-bottom: 10px; }
    #settingsChangelog .changelog-entry .ver { font-weight: 700; color: var(--u3d-text); margin-bottom: 6px; }
    #settingsChangelog .changelog-entry ul { margin: 0 0 0 18px; padding: 0; color: var(--u3d-muted); }

.chatbox-message__menu {
    margin: 1px 10px 0 0;
    padding: 0;
    display: inline;
  }

.chatbox-message__delete-button {
   color: #91919185;
   margin: 5px;
   font-size: inherit !important;
  }

.chatbox-message__delete-button .fa.fa-trash {
  color: #a01919;
}

.chatbox-message__delete-button .fa.fa-trash:hover {
  color: #ca1717;
}
  `);

  (function () {
    "use strict";

    const SCRIPT_VERSION = "2.1.5";

    const SELECTORS = {
      chatbox: ['#chatbox__messages-create', '#chatbox__message', 'textarea[name="message"]', 'textarea#message'],
      messages: ['.chatroom__messages', '.chatbox__messages', '.chatroom-messages'],
      header: ['#chatbox_header', '.chatbox__header', '.chatroom__header']
    };

    const K = {
      TOGGLE_BBCODES: "toggleBBCodes",
      TOGGLE_MSG_GIFT: "toggleMessageGift",
      TOGGLE_REPLY: "toggleReply",
      TOGGLE_PANEL: "togglePanel",
      AUTO_DELETE_ENABLED: "autoDeleteEnabled",
      AUTO_DELETE_INTERVAL: "autoDeleteIntervalSec",
      ACTIONS_HOVER: "u3dActionsHover",
      FANCY_ACTIONS: "u3dFancyActions",
      THEME_ACTIVE: "u3dThemeActive",
      THEME_CUSTOM: "u3dThemeCustom",
      USERCSS_ENABLED: "u3dUserCssEnabled",
      USERCSS_CODE: "u3dUserCssCode"
    };

    const DEFAULTS = {
      [K.TOGGLE_BBCODES]: true,
      [K.TOGGLE_MSG_GIFT]: true,
      [K.TOGGLE_REPLY]: true,
      [K.TOGGLE_PANEL]: false,
      [K.AUTO_DELETE_ENABLED]: false,
      [K.AUTO_DELETE_INTERVAL]: 5,
      [K.ACTIONS_HOVER]: false,
      [K.FANCY_ACTIONS]: false,
      [K.THEME_ACTIVE]: "default",
      [K.THEME_CUSTOM]: JSON.stringify({
        bg: "#0f172a",
        surface: "#1e2738",
        surface2: "#2a3550",
        border: "#3f495f",
        text: "#eaeaea",
        muted: "#a7b0c4",
        link: "#8cc0ff",
        linkHover: "#cfe3ff",
        reply1: "#2dd4bf",
        reply2: "#14b8a6",
        dm1: "#60a5fa",
        dm2: "#3b82f6",
        gift1: "#f59e0b",
        gift2: "#ec4899",
        radius: 8
      }),
      [K.USERCSS_ENABLED]: false,
      [K.USERCSS_CODE]: `/* Custom CSS (example)
#chatbox_header .panel__heading { text-transform: none; }
*/`
    };

    const THEMES = {
      default: {
        bg: "#0f172a",
        surface: "#1e2738",
        surface2: "#2a3550",
        border: "#3f495f",
        text: "#eaeaea",
        muted: "#a7b0c4",
        link: "#8cc0ff",
        linkHover: "#cfe3ff",
        reply1: "#2dd4bf",
        reply2: "#14b8a6",
        dm1: "#60a5fa",
        dm2: "#3b82f6",
        gift1: "#f59e0b",
        gift2: "#ec4899",
        radius: 8
      },
      ocean: {
        bg: "#0b1220",
        surface: "#0f1a2e",
        surface2: "#15223c",
        border: "#21304a",
        text: "#e7f6ff",
        muted: "#b2c9e0",
        link: "#6ed3ff",
        linkHover: "#bfeaff",
        reply1: "#34d399",
        reply2: "#0ea5e9",
        dm1: "#67e8f9",
        dm2: "#3b82f6",
        gift1: "#22c55e",
        gift2: "#06b6d4",
        radius: 8
      },
      neon: {
        bg: "#120f20",
        surface: "#1c1530",
        surface2: "#261c46",
        border: "#3a2f63",
        text: "#f0eaff",
        muted: "#cbbff0",
        link: "#b794f4",
        linkHover: "#e9ddff",
        reply1: "#22d3ee",
        reply2: "#a78bfa",
        dm1: "#f472b6",
        dm2: "#fb7185",
        gift1: "#facc15",
        gift2: "#34d399",
        radius: 10
      },
      rose: {
        bg: "#1d1216",
        surface: "#28171c",
        surface2: "#341a21",
        border: "#50303a",
        text: "#ffeef3",
        muted: "#f3c3cf",
        link: "#ff9fc0",
        linkHover: "#ffd1e0",
        reply1: "#fda4af",
        reply2: "#f43f5e",
        dm1: "#f5d0fe",
        dm2: "#e879f9",
        gift1: "#fecaca",
        gift2: "#fb7185",
        radius: 10
      },
      midnight: {
        bg: "#0c0f14",
        surface: "#121720",
        surface2: "#18202c",
        border: "#243043",
        text: "#e4ecf5",
        muted: "#aab8cc",
        link: "#7fb6ff",
        linkHover: "#cfe0ff",
        reply1: "#1f2937",
        reply2: "#374151",
        dm1: "#0ea5e9",
        dm2: "#3b82f6",
        gift1: "#8b5cf6",
        gift2: "#22d3ee",
        radius: 8
      }
    };

    const CHANGELOG = [{
                ver: "2.1.5",
        items: [
          "Added DarkPeers"
        ]
      }
    ];

    const MIN_INTERVAL_SEC = 1;
    const MAX_DELETE_PER_TICK = 12;
    const CUSTOM_COLOR = "#4a2d84";

    const bbCodesPanelID = "bbCodesPanel";
    const settingsButtonID = "settingsButton";
    const settingsPanelID = "settingsPanel";

    let autoDeleteTimerId = null;
    let userCssStyleEl = null;

    const gChat = {
      box: null,
      messages: null,
      header: null
    };

    const BBCODES_PANEL_HTML = `
    <div id="${bbCodesPanelID}" style="position: relative; display: flex; flex-wrap: wrap; gap: 6px; background-color: #0000; border-radius: 8px; z-index: 1; margin: 10px 0 0 0; padding: 6px;">
      <span class="bbcode-button" data-bbcode="[img][/img]" title="Image"><i class="fa-solid fa-image"></i></span>
      <span class="bbcode-button" data-bbcode="[url][/url]" title="Link"><i class="fa-solid fa-link"></i></span>
      <span class="bbcode-button" data-bbcode="[b][/b]" title="Bold"><i class="fa-solid fa-bold"></i></span>
      <span class="bbcode-button" data-bbcode="[i][/i]" title="Italic"><i class="fa-solid fa-italic"></i></span>
      <span class="bbcode-button" data-bbcode="[u][/u]" title="Underline"><i class="fa-solid fa-underline"></i></span>
      <div class="u3d-bb-more">
        <span id="bbCodeDropdown" class="bbcode-button" title="More"><i class="fa-solid fa-angle-right"></i></span>
        <div id="bbCodeDropdownMenu">
          <div class="grid">
            <span class="bbcode-button" data-bbcode="[code][/code]" title="Code"><i class="fa-solid fa-code"></i></span>
            <span class="bbcode-button" data-bbcode="[spoiler][/spoiler]" title="Spoiler"><i class="fa-solid fa-eye-slash"></i></span>
            <span class="bbcode-button" data-bbcode="[quote][/quote]" title="Quote"><i class="fa-solid fa-quote-left"></i></span>
            <span class="bbcode-button" data-action="color" title="Text color"><i class="fa-solid fa-palette"></i></span>
            <span class="bbcode-button" data-bbcode="[youtube][/youtube]" title="YouTube"><i class="fa-brands fa-youtube"></i></span>
            <span class="bbcode-button" data-bbcode="[s][/s]" title="Strike"><i class="fa-solid fa-strikethrough"></i></span>
            <span class="bbcode-button" data-bbcode="[left][/left]" title="Align left"><i class="fa-solid fa-align-left"></i></span>
            <span class="bbcode-button" data-bbcode="[center][/center]" title="Align center"><i class="fa-solid fa-align-center"></i></span>
            <span class="bbcode-button" data-bbcode="[right][/right]" title="Align right"><i class="fa-solid fa-align-right"></i></span>
            <span class="bbcode-button" data-action="size" title="Text size"><i class="fa-solid fa-text-height"></i></span>
            <span class="bbcode-button" data-action="list-ul" title="Unordered List"><i class="fa-solid fa-list-ul"></i></span>
            <span class="bbcode-button" data-action="list-ol" title="Ordered List"><i class="fa-solid fa-list-ol"></i></span>
            <span class="bbcode-button" data-action="list-item" title="[*]"><i class="fa-solid fa-asterisk"></i></span>
            <span class="bbcode-button" data-action="hr" title="Horizontal Line"><i class="fa-solid fa-minus"></i></span>
            <span class="bbcode-button" data-bbcode="/msg" title="/msg username message"><i class="fa-solid fa-envelope"></i></span>
            <span class="bbcode-button" data-bbcode="/gift" title="/gift username number message"><i class="fa-solid fa-gift"></i></span>
          </div>
        </div>
      </div>
    </div>`;

    // Utils
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const loadSetting = (key) => {
      const v = localStorage.getItem(key);
      if (v === null || v === undefined) return DEFAULTS[key];
      if (v === "true") return true;
      if (v === "false") return false;
      if (!isNaN(v) && v.trim() !== "") return Number(v);
      return v;
    };
    const saveSetting = (key, value) => localStorage.setItem(key, String(value));
    const toInt = (val, def) => {
      const n = parseInt(val, 10);
      return Number.isFinite(n) ? n : def;
    };

    function waitForAny(selectors, interval = 300, timeout = 20000) {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) return resolve(el);
          }
          if (Date.now() - start > timeout) return reject(new Error(`Timeout: ${selectors.join(", ")}`));
          setTimeout(tick, interval);
        };
        tick();
      });
    }

    function getMessageUserInfo(msg) {
      let a = msg.querySelector('.chatbox-message__header .user-tag__link, .message-header .user-tag__link, .chatbox-message__address .user-tag__link, .user-tag__link');
      if (!a) a = msg.querySelector('a[href*="/users/"], a[href*="/user/"], a[href*="/profile/"]');
      let name = "",
        profileUrl = "";
      if (a) {
        name = (a.textContent || "").trim();
        if (a.href) profileUrl = new URL(a.href, location.origin).href;
      }
      return {
        name,
        profileUrl
      };
    }

    function findDeleteButton(msg) {
      return msg.querySelector("button.chatbox-message__delete-button") || null;
    }

    function isVisible(el) {
      if (!el) return false;
      const st = window.getComputedStyle(el);
      return st.display !== "none" && st.visibility !== "hidden" && el.offsetParent !== null;
    }

    // Theme
    function getActiveThemeObject() {
      const active = String(loadSetting(K.THEME_ACTIVE) || "default");
      if (active === "custom") {
        try {
          return JSON.parse(loadSetting(K.THEME_CUSTOM) || "{}") || THEMES.default;
        }
        catch {
          return THEMES.default;
        }
      }
      return THEMES[active] || THEMES.default;
    }

    function applyThemeFromObj(t) {
      const root = document.documentElement;
      root.style.setProperty('--u3d-bg', t.bg);
      root.style.setProperty('--u3d-surface', t.surface);
      root.style.setProperty('--u3d-surface2', t.surface2);
      root.style.setProperty('--u3d-border', t.border);
      root.style.setProperty('--u3d-text', t.text);
      root.style.setProperty('--u3d-muted', t.muted);
      root.style.setProperty('--u3d-link', t.link);
      root.style.setProperty('--u3d-link-hover', t.linkHover);
      root.style.setProperty('--u3d-reply-1', t.reply1);
      root.style.setProperty('--u3d-reply-2', t.reply2);
      root.style.setProperty('--u3d-dm-1', t.dm1);
      root.style.setProperty('--u3d-dm-2', t.dm2);
      root.style.setProperty('--u3d-gift-1', t.gift1);
      root.style.setProperty('--u3d-gift-2', t.gift2);
      root.style.setProperty('--u3d-action-radius', (t.radius || 8) + 'px');
    }

    function applyThemeFromSettings() {
      applyThemeFromObj(getActiveThemeObject());
    }

    // Custom CSS
    function ensureUserCssStyleEl() {
      if (!userCssStyleEl) {
        userCssStyleEl = document.createElement("style");
        userCssStyleEl.id = "u3d-user-css";
        document.head.appendChild(userCssStyleEl);
      }
      return userCssStyleEl;
    }

    function applyUserCssIfEnabled() {
      const enabled = !!loadSetting(K.USERCSS_ENABLED);
      const css = String(loadSetting(K.USERCSS_CODE) || "");
      ensureUserCssStyleEl().textContent = enabled ? css : "";
    }

    // Auto-delete
    function stopAutoDeleteTimer() {
      if (autoDeleteTimerId) {
        clearInterval(autoDeleteTimerId);
        autoDeleteTimerId = null;
      }
    }

    function deleteVisibleMessagesOnce() {
      if (!gChat.messages) return;
      let deleted = 0;
      const messages = gChat.messages.querySelectorAll(".chatbox-message, .message");
      for (const msg of messages) {
        if (deleted >= MAX_DELETE_PER_TICK) break;
        const delBtn = findDeleteButton(msg);
        if (!delBtn || !isVisible(delBtn) || msg.dataset.u3dAutodeleting === "1") continue;
        msg.dataset.u3dAutodeleting = "1";
        try {
          delBtn.click();
          deleted++;
        }
        catch (e) {
          delete msg.dataset.u3dAutodeleting;
        }
      }
    }

    function startAutoDeleteTimer() {
      stopAutoDeleteTimer();
      if (!loadSetting(K.AUTO_DELETE_ENABLED)) return;
      const intervalSec = Math.max(MIN_INTERVAL_SEC, toInt(loadSetting(K.AUTO_DELETE_INTERVAL), 5));
      autoDeleteTimerId = setInterval(() => {
        try {
          deleteVisibleMessagesOnce();
        }
        catch {}
      }, intervalSec * 1000);
      try {
        deleteVisibleMessagesOnce();
      }
      catch {}
    }

    // Actions
    function buildActionBar() {
      const bar = document.createElement("div");
      bar.className = "u3d-action-bar";
      const mkBtn = (cls, title, iconHtml) => {
        const b = document.createElement("span");
        b.className = `u3d-action-btn ${cls}`;
        b.title = title;
        b.innerHTML = iconHtml;
        return b;
      };
      const replyBtn = mkBtn("u3d-action-btn--reply", "Reply", '<i class="fa-solid fa-reply"></i>');
      const dmBtn = mkBtn("u3d-action-btn--dm", "Direct Message", '<i class="fa-solid fa-envelope"></i>');
      const giftBtn = mkBtn("u3d-action-btn--gift", "Gift", '<i class="fa-solid fa-gift"></i>');
      bar.append(replyBtn, dmBtn, giftBtn);
      return bar;
    }

    function setupReplyFeatures() {
      const newMessageTextArea = gChat.box;
      const processed = new WeakSet();

      function quoteMessage(name, profileUrl, rawMessage) {
        const clean = (s) => (s || "").replace(/\r?\n+/g, " ").replace(/\s+/g, " ").trim();
        let displayName = clean(name).replace(/\bUnknown\b/gi, "").replace(/\s{2,}/g, " ").trim();
        if (!displayName && profileUrl) {
          try {
            const u = new URL(profileUrl, location.origin);
            const parts = u.pathname.split("/").filter(Boolean);
            displayName = clean(decodeURIComponent(parts[parts.length - 1] || ""));
          }
          catch {}
        }
        if (!displayName) return;
        const label = profileUrl ? `[url=${profileUrl}]${displayName}[/url]` : displayName;
        const msg = clean(rawMessage);
        const quote = `[b]${label} :[/b][color=#999999] "[i]${msg}[/i]"[/color]\n\n`;
        newMessageTextArea.setRangeText(quote, newMessageTextArea.selectionStart, newMessageTextArea.selectionEnd, "end");
        newMessageTextArea.focus();
      }

      function addIconsIfNeeded(message) {
        if (!(message instanceof Element) || processed.has(message)) return;
        const header = message.querySelector(".chatbox-message__header, .message-header");
        if (header && !header.querySelector(".u3d-action-bar")) {
          const bar = buildActionBar();
          header.appendChild(bar);
          const showMG = !!loadSetting(K.TOGGLE_MSG_GIFT);
          const showReply = !!loadSetting(K.TOGGLE_REPLY);
          bar.querySelector(".u3d-action-btn--reply").style.display = showReply ? "inline-flex" : "none";
          bar.querySelector(".u3d-action-btn--dm").style.display = showMG ? "inline-flex" : "none";
          bar.querySelector(".u3d-action-btn--gift").style.display = showMG ? "inline-flex" : "none";
        }
        processed.add(message);
      }

      $$(".chatbox-message, .message").forEach(addIconsIfNeeded);

      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (!(node instanceof Element)) continue;
            if (node.matches(".chatbox-message, .message")) addIconsIfNeeded(node);
            node.querySelectorAll?.(".chatbox-message, .message").forEach(addIconsIfNeeded);
          }
        }
      });
    if (gChat.messages) observer.observe(gChat.messages, {
        childList: true,
        subtree: true
      });

      gChat.messages?.addEventListener("click", (e) => {
        const action = e.target.closest(".u3d-action-btn");
        if (!action) return;
        const msgEl = action.closest(".chatbox-message, .message");
        const {
          name,
          profileUrl
        } = getMessageUserInfo(msgEl);
        if (!name) return;
        const content = msgEl.querySelector(".chatbox-message__content, .message-content")?.innerText || "";
        if (action.classList.contains("u3d-action-btn--reply")) {
          quoteMessage(name, profileUrl, content);
        }
       else if (action.classList.contains("u3d-action-btn--dm") || action.classList.contains("u3d-action-btn--gift")) {

           const nameNode = msgEl.querySelector(".user-tag__name");
           const clean = (s) => (s || "")
           .replace(/\r?\n/g, " ")
           .replace(/\s+/g, " ")
           .replace(/\bUnknown\b/gi, "")
           .trim();

           let uname = nameNode ? nameNode.textContent : name;
           uname = clean(uname);

           // Fallback: derive from profile URL path if needed
           if (!uname && profileUrl) {
               try {
                   const u = new URL(profileUrl, location.origin);
                   const parts = u.pathname.split("/").filter(Boolean);
                   uname = clean(decodeURIComponent(parts[parts.length - 1] || ""));
               } catch {}
           }

           if (!uname) return;

           const cmd = `${action.classList.contains("u3d-action-btn--dm") ? "/msg" : "/gift"} ${uname}`;
           newMessageTextArea.value = cmd; // replace entire content (avoids leftover “Unknown”)
           newMessageTextArea.setSelectionRange(cmd.length, cmd.length);
           newMessageTextArea.focus();
           newMessageTextArea.dispatchEvent(new Event("input", { bubbles: true }));
       }
      });
    }

    // BBCode helpers
    function splitBB(bb) {
      const startTag = bb.substring(0, bb.indexOf("]") + 1);
      const endTag = bb.substring(bb.lastIndexOf("["));
      return {
        startTag,
        endTag
      };
    }

    function insertBBCode(chatbox, bbCode) {
      const selStart = chatbox.selectionStart,
        selEnd = chatbox.selectionEnd;
      const selected = chatbox.value.substring(selStart, selEnd);
      const {
        startTag,
        endTag
      } = splitBB(bbCode);
      const toInsert = selected ? (startTag + selected + endTag + " ") : (startTag + endTag + " ");
      chatbox.setRangeText(toInsert, selStart, selEnd, "end");
      chatbox.focus();
    }

    function insertBBCodeWithClipboard(tag, chatbox) {
      const {
        startTag,
        endTag
      } = splitBB(tag);
      navigator.clipboard.readText().then(clipText => {
        const content = (clipText || "").trim();
        chatbox.setRangeText(startTag + content + endTag + " ", chatbox.selectionStart, chatbox.selectionEnd, "end");
        chatbox.focus();
      }).catch(() => {
        chatbox.setRangeText(startTag + endTag + " ", chatbox.selectionStart, chatbox.selectionEnd, "end");
        chatbox.focus();
      });
    }

    function insertImgBBCodeWithClipboard(tag, chatbox) {
      const {
        startTag,
        endTag
      } = splitBB(tag);
      navigator.clipboard.readText().then(clipText => {
        const content = (clipText || "").trim();
        chatbox.setRangeText(startTag + content + endTag + "\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
        chatbox.focus();
      }).catch(() => {
        chatbox.setRangeText(startTag + endTag + "\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
        chatbox.focus();
      });
    }

    function insertWrapWithArg(chatbox, tagBase, promptText, defaultVal) {
      const selStart = chatbox.selectionStart,
        selEnd = chatbox.selectionEnd;
      const selected = chatbox.value.substring(selStart, selEnd);
      const arg = window.prompt(promptText, defaultVal);
      if (arg === null) return;
      const open = `[${tagBase}=${arg}]`,
        close = `[/${tagBase}]`;
      const toInsert = selected ? (open + selected + close + " ") : (open + close + " ");
      chatbox.setRangeText(toInsert, selStart, selEnd, "end");
      chatbox.focus();
    }

    function parseYouTubeId(input) {
      if (!input) return null;
      const s = input.trim();
      if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
      let urlStr = s;
      if (!/^https?:\/\//i.test(urlStr)) urlStr = "https://" + urlStr;
      try {
        const u = new URL(urlStr);
        if (/youtu\.be$/.test(u.hostname)) {
          const seg = u.pathname.split("/").filter(Boolean)[0];
          if (/^[A-Za-z0-9_-]{11}$/.test(seg)) return seg;
        }
        const v = u.searchParams.get("v");
        if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length >= 2 && ["shorts", "embed", "v", "live", "watch"].includes(parts[0])) {
          const cand = parts[1].split(/[?#&]/)[0];
          if (/^[A-Za-z0-9_-]{11}$/.test(cand)) return cand;
        }
      }
      catch {}
      return null;
    }

    function insertYouTubeBBCodeSmart(tag, chatbox) {
      const {
        startTag,
        endTag
      } = splitBB(tag);
      const insertId = (id) => {
        if (!id) return;
        chatbox.setRangeText(startTag + id + endTag + "\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
        chatbox.focus();
      };
      const selected = chatbox.value.substring(chatbox.selectionStart, chatbox.selectionEnd).trim();
      let id = parseYouTubeId(selected);
      if (id) return insertId(id);
      navigator.clipboard.readText().then(clip => {
        const got = parseYouTubeId(clip || "");
        if (got) insertId(got);
        else {
          const manual = prompt("Paste YouTube link or 11-char video ID:");
          insertId(parseYouTubeId(manual || ""));
        }
      }).catch(() => {
        const manual = prompt("Paste YouTube link or 11-char video ID:");
        insertId(parseYouTubeId(manual || ""));
      });
    }

    function settingsPanelHTML() {
      const sw = (id, label) => `
        <div class="row">
          <div class="label">${label}</div>
          <label class="switch">
            <input type="checkbox" id="${id}">
            <span class="slider"></span>
          </label>
        </div>`;
      return `
        <div id="${settingsPanelID}">
          <div class="title">
            <div>Unit3D Chatbox Enhanced</div>
            <div class="ver">Version ${SCRIPT_VERSION}</div>
          </div>

          <div id="settingsHome">
            <div class="section">
              <div class="section-title">Settings</div>
              ${sw("toggleBBCodes", "BBCodes")}
              ${sw("toggleMessageGift", "Direct Message - Gift buttons")}
              ${sw("toggleReply", "Reply button")}
              ${sw("togglePanel", "Show top Panel buttons")}
            </div>

            <div class="section">
              <div class="section-title">Auto-delete</div>
              ${sw("autoDeleteToggle", "Auto-delete messages")}
              <div class="row">
                <div class="label">Time (seconds)</div>
                <div class="inline">
                  <input type="number" id="autoDeleteInterval" min="1" step="1" value="5" style="cursor: text;">
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Actions</div>
              ${sw("fancyActions", "Fancy action buttons")}
              ${sw("actionsHover", "Show action buttons on hover")}
            </div>

            <div class="row" style="justify-content:flex-end; gap:8px;">
              <button id="openThemesBtn" class="u3d-btn" type="button" style="cursor: pointer">Themes</button>
              <button id="openChangelogBtn" class="u3d-btn" type="button" style="cursor: pointer">Changelog</button>
            </div>
          </div>

          <div id="settingsThemes" style="display:none;">
            <div class="section">
              <div class="section-title">Theme Presets</div>
              <div class="radio-group">
                ${Object.keys(THEMES).map(n => `<label><input type="radio" name="themePreset" value="${n}"> ${n}</label>`).join("")}
                <label><input type="radio" name="themePreset" value="custom"> custom</label>
              </div>
            </div>

            <div class="section" id="themeCustomEditor" style="display:none;">
              <div class="section-title">Custom Palette</div>
              <div class="palette">
                <div class="row"><div class="label">Background</div><div class="inline"><input type="color" id="tBg"></div></div>
                <div class="row"><div class="label">Surface</div><div class="inline"><input type="color" id="tSurface"></div></div>
                <div class="row"><div class="label">Surface 2</div><div class="inline"><input type="color" id="tSurface2"></div></div>
                <div class="row"><div class="label">Border</div><div class="inline"><input type="color" id="tBorder"></div></div>
                <div class="row"><div class="label">Text</div><div class="inline"><input type="color" id="tText"></div></div>
                <div class="row"><div class="label">Muted</div><div class="inline"><input type="color" id="tMuted"></div></div>
                <div class="row"><div class="label">Link</div><div class="inline"><input type="color" id="tLink"></div></div>
                <div class="row"><div class="label">Link Hover</div><div class="inline"><input type="color" id="tLinkHover"></div></div>
                <div class="row"><div class="label">Reply gradient</div><div class="inline"><input type="color" id="tReply1"><input type="color" id="tReply2"></div></div>
                <div class="row"><div class="label">DM gradient</div><div class="inline"><input type="color" id="tDm1"><input type="color" id="tDm2"></div></div>
                <div class="row"><div class="label">Gift gradient</div><div class="inline"><input type="color" id="tGift1"><input type="color" id="tGift2"></div></div>
                <div class="row"><div class="label">Action radius (px)</div><div class="inline"><input type="number" id="tRadius" min="4" max="20" step="1" value="8"></div></div>
              </div>
              <div class="buttons">
                <button id="themeApplyBtn" class="u3d-btn" type="button">Apply</button>
                <button id="themeSaveBtn" class="u3d-btn" type="button">Save as Custom</button>
                <button id="themeResetBtn" class="u3d-btn" type="button">Reset default</button>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Custom CSS</div>
              <div class="row">
                <div class="label">Enable custom CSS</div>
                <label class="switch">
                  <input type="checkbox" id="userCssEnable">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="row">
                <div class="label">CSS code</div>
                <div style="flex:1;">
                  <textarea id="userCssText" class="u3d-textarea" spellcheck="false"></textarea>
                </div>
              </div>
              <div class="buttons">
                <button id="userCssApplyBtn" class="u3d-btn" type="button">Apply</button>
                <button id="userCssSaveBtn" class="u3d-btn" type="button">Save</button>
                <button id="userCssDefaultBtn" class="u3d-btn" type="button">Load default</button>
                <button id="userCssExportBtn" class="u3d-btn" type="button">Export CSS</button>
                <button id="userCssImportBtn" class="u3d-btn" type="button">Import CSS</button>
                <button id="userCssClearBtn" class="u3d-btn" type="button">Clear</button>
              </div>
            </div>

            <div class="row" style="justify-content:flex-end; gap:8px;">
              <button id="backFromThemesBtn" class="u3d-btn" type="button">Back</button>
            </div>
          </div>

          <div id="settingsChangelog" style="display:none;">
            <div class="section">
              <div class="section-title">Changelog</div>
              <div id="changelogContent"></div>
            </div>
            <div class="row" style="justify-content:flex-end; gap:8px;">
              <button id="backFromChangelogBtn" class="u3d-btn" type="button">Back</button>
            </div>
          </div>
        </div>
      `;
    }

    function showSettingsView(view) {
      const home = document.getElementById("settingsHome");
      const themes = document.getElementById("settingsThemes");
      const log = document.getElementById("settingsChangelog");
      if (!home || !themes || !log) return;
      home.style.display = (view === "home") ? "block" : "none";
      themes.style.display = (view === "themes") ? "block" : "none";
      log.style.display = (view === "changelog") ? "block" : "none";
    }

    function renderChangelog() {
      const wrap = document.getElementById("changelogContent");
      if (!wrap) return;
      wrap.innerHTML = CHANGELOG.map(c => `
        <div class="changelog-entry">
          <div class="ver">v${c.ver}</div>
          <ul>${c.items.map(i => `<li>${i}</li>`).join("")}</ul>
        </div>
      `).join("");
    }

    function applySettings() {
      const toggleBBCodes = !!loadSetting(K.TOGGLE_BBCODES);
      const toggleMessageGift = !!loadSetting(K.TOGGLE_MSG_GIFT);
      const toggleReply = !!loadSetting(K.TOGGLE_REPLY);
      const togglePanel = !!loadSetting(K.TOGGLE_PANEL);
      const autoDeleteEnabled = !!loadSetting(K.AUTO_DELETE_ENABLED);
      const intervalSec = Math.max(MIN_INTERVAL_SEC, toInt(loadSetting(K.AUTO_DELETE_INTERVAL), 5));

      if (gChat.header) {
        gChat.header.classList.add("u3d-chat-header");
        gChat.header.classList.toggle("u3d-hide-actions", !togglePanel);
      }

      const bbToggle = document.getElementById("toggleBBCodes");
      if (bbToggle) bbToggle.checked = toggleBBCodes;
      const bbShell = document.getElementById("bbCodesPanelShell");
      if (bbShell) bbShell.style.display = toggleBBCodes ? "inline-flex" : "none";

      const mgToggle = document.getElementById("toggleMessageGift");
      if (mgToggle) mgToggle.checked = toggleMessageGift;
      const replyToggle = document.getElementById("toggleReply");
      if (replyToggle) replyToggle.checked = toggleReply;
      $$(".u3d-action-btn--reply").forEach(el => el.style.display = toggleReply ? "inline-flex" : "none");
      $$(".u3d-action-btn--dm, .u3d-action-btn--gift").forEach(el => el.style.display = toggleMessageGift ? "inline-flex" : "none");

      document.documentElement.classList.toggle("u3d-action-fancy", !!loadSetting(K.FANCY_ACTIONS));
      document.documentElement.classList.toggle("u3d-actions-hover", !!loadSetting(K.ACTIONS_HOVER));

      applyThemeFromSettings();
      applyUserCssIfEnabled();

      const autoDelToggleEl = document.getElementById("autoDeleteToggle");
      if (autoDelToggleEl) autoDelToggleEl.checked = autoDeleteEnabled;
      const autoDelIntervalEl = document.getElementById("autoDeleteInterval");
      if (autoDelIntervalEl) autoDelIntervalEl.value = intervalSec;

      if (autoDeleteEnabled) startAutoDeleteTimer();
      else stopAutoDeleteTimer();
    }

    function getEditorThemeFromInputs() {
      const t = (id, def) => (document.getElementById(id)?.value || def);
      return {
        bg: t("tBg", "#0f172a"),
        surface: t("tSurface", "#1e2738"),
        surface2: t("tSurface2", "#2a3550"),
        border: t("tBorder", "#3f495f"),
        text: t("tText", "#eaeaea"),
        muted: t("tMuted", "#a7b0c4"),
        link: t("tLink", "#8cc0ff"),
        linkHover: t("tLinkHover", "#cfe3ff"),
        reply1: t("tReply1", "#2dd4bf"),
        reply2: t("tReply2", "#14b8a6"),
        dm1: t("tDm1", "#60a5fa"),
        dm2: t("tDm2", "#3b82f6"),
        gift1: t("tGift1", "#f59e0b"),
        gift2: t("tGift2", "#ec4899"),
        radius: Math.max(4, Math.min(20, parseInt(t("tRadius", "8"), 10) || 8))
      };
    }

    function initThemesUI() {
      const active = String(loadSetting(K.THEME_ACTIVE) || "default");
      const radio = document.querySelector(`input[name="themePreset"][value="${active}"]`);
      if (radio) radio.checked = true;

      const customEditor = document.getElementById("themeCustomEditor");
      if (customEditor) {
        const isCustom = active === "custom";
        customEditor.style.display = isCustom ? "block" : "none";
        if (isCustom) {
          try {
            const obj = JSON.parse(loadSetting(K.THEME_CUSTOM) || "{}");
            const set = (id, val) => {
              const el = document.getElementById(id);
              if (el && val !== undefined) el.value = val;
            };
            if (obj) {
              set("tBg", obj.bg);
              set("tSurface", obj.surface);
              set("tSurface2", obj.surface2);
              set("tBorder", obj.border);
              set("tText", obj.text);
              set("tMuted", obj.muted);
              set("tLink", obj.link);
              set("tLinkHover", obj.linkHover);
              set("tReply1", obj.reply1);
              set("tReply2", obj.reply2);
              set("tDm1", obj.dm1);
              set("tDm2", obj.dm2);
              set("tGift1", obj.gift1);
              set("tGift2", obj.gift2);
              const r = document.getElementById("tRadius");
              if (r) r.value = obj.radius || 8;
            }
          }
          catch {}
        }
      }

      const cssEnabledEl = document.getElementById("userCssEnable");
      const cssTextEl = document.getElementById("userCssText");
      if (cssEnabledEl) cssEnabledEl.checked = !!loadSetting(K.USERCSS_ENABLED);
      if (cssTextEl) cssTextEl.value = String(loadSetting(K.USERCSS_CODE) || "");
    }

    function setupSettingsListeners() {
      const mapSwitch = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", e => {
          saveSetting(key, e.target.checked);
          applySettings();
        });
      };
      const mapInput = (id, key, normalize) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", e => {
          const val = normalize ? normalize(e.target.value) : e.target.value;
          saveSetting(key, val);
          applySettings();
        });
      };

      mapSwitch("toggleBBCodes", K.TOGGLE_BBCODES);
      mapSwitch("toggleMessageGift", K.TOGGLE_MSG_GIFT);
      mapSwitch("toggleReply", K.TOGGLE_REPLY);
      mapSwitch("togglePanel", K.TOGGLE_PANEL);
      mapSwitch("fancyActions", K.FANCY_ACTIONS);
      mapSwitch("actionsHover", K.ACTIONS_HOVER);

      const autoDelToggle = document.getElementById("autoDeleteToggle");
      if (autoDelToggle) autoDelToggle.addEventListener("change", (e) => {
        saveSetting(K.AUTO_DELETE_ENABLED, e.target.checked);
        applySettings();
      });
      mapInput("autoDeleteInterval", K.AUTO_DELETE_INTERVAL, v => Math.max(MIN_INTERVAL_SEC, toInt(v, 5)));

      // Event delegation for all Settings buttons/toggles inside the panel
      const panel = document.getElementById(settingsPanelID);
      if (!panel) return;

      panel.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        switch (btn.id) {
          case "openThemesBtn":
            initThemesUI();
            showSettingsView("themes");
            break;
          case "openChangelogBtn":
            renderChangelog();
            showSettingsView("changelog");
            break;
          case "backFromThemesBtn":
          case "backFromChangelogBtn":
            showSettingsView("home");
            break;

            // Theme editor
          case "themeApplyBtn": {
            const obj = getEditorThemeFromInputs();
            applyThemeFromObj(obj); // preview only
            break;
          }
          case "themeSaveBtn": {
            const obj = getEditorThemeFromInputs();
            saveSetting(K.THEME_CUSTOM, JSON.stringify(obj));
            saveSetting(K.THEME_ACTIVE, "custom");
            applySettings(); // apply + persist
            initThemesUI(); // update radios/editor state
            break;
          }
          case "themeResetBtn": {
            saveSetting(K.THEME_ACTIVE, "default");
            applySettings();
            initThemesUI();
            break;
          }

          // Custom CSS
          case "userCssApplyBtn": {
            const css = $("#userCssText")?.value || "";
            ensureUserCssStyleEl().textContent = css;
            break;
          }
          case "userCssSaveBtn": {
            const css = $("#userCssText")?.value || "";
            saveSetting(K.USERCSS_CODE, css);
            applyUserCssIfEnabled();
            break;
          }
          case "userCssDefaultBtn": {
            const def = String(DEFAULTS[K.USERCSS_CODE] || "");
            const ta = $("#userCssText");
            if (ta) ta.value = def;
            break;
          }
          case "userCssExportBtn": {
            const t = getActiveThemeObject();
            const rootCss = `:root{
  --u3d-bg:${t.bg}; --u3d-surface:${t.surface}; --u3d-surface2:${t.surface2}; --u3d-border:${t.border};
  --u3d-text:${t.text}; --u3d-muted:${t.muted}; --u3d-link:${t.link}; --u3d-link-hover:${t.linkHover};
  --u3d-reply-1:${t.reply1}; --u3d-reply-2:${t.reply2};
  --u3d-dm-1:${t.dm1}; --u3d-dm-2:${t.dm2};
  --u3d-gift-1:${t.gift1}; --u3d-gift-2:${t.gift2};
  --u3d-action-radius:${t.radius}px;
}
/* Custom CSS */\n`;
            const custom = String(loadSetting(K.USERCSS_CODE) || "");
            const bundle = rootCss + custom;
            try {
              await navigator.clipboard.writeText(bundle);
              alert("Theme CSS copied to clipboard.");
            }
            catch {
              prompt("Copy your CSS:", bundle);
            }
            break;
          }
          case "userCssImportBtn": {
            try {
              const clip = await navigator.clipboard.readText();
              if (clip) $("#userCssText").value = clip;
              else {
                const manual = prompt("Paste CSS here:", "");
                if (manual !== null) $("#userCssText").value = manual;
              }
            }
            catch {
              const manual = prompt("Paste CSS here:", "");
              if (manual !== null) $("#userCssText").value = manual;
            }
            break;
          }
          case "userCssClearBtn": {
            const ta = $("#userCssText");
            if (ta) ta.value = "";
            ensureUserCssStyleEl().textContent = "";
            saveSetting(K.USERCSS_CODE, "");
            break;
          }
        }
      });

      // Delegated changes (theme preset radios and CSS enable switch)
      panel.addEventListener("change", (e) => {
        const t = e.target;
        if (!t) return;

        if (t.name === "themePreset") {
          saveSetting(K.THEME_ACTIVE, t.value);
          applySettings(); // apply theme
          initThemesUI(); // show/hide editor
        }
        else if (t.id === "userCssEnable") {
          saveSetting(K.USERCSS_ENABLED, t.checked);
          applyUserCssIfEnabled();
        }
      });
    }

    function setupChatFeatures(chatbox) {
      if (!document.getElementById(bbCodesPanelID)) {
        const shell = document.createElement("div");
        shell.id = "bbCodesPanelShell";
        chatbox.parentNode.insertBefore(shell, chatbox.nextSibling);

        const holder = document.createElement("div");
        holder.innerHTML = BBCODES_PANEL_HTML;
        shell.appendChild(holder);

        const moreBtn = holder.querySelector("#bbCodeDropdown");
        const menu = holder.querySelector("#bbCodeDropdownMenu");
        if (moreBtn && menu) {
          const toggleMenu = (force) => {
            const wantOpen = typeof force === "boolean" ? force : !menu.classList.contains("open");
            menu.classList.toggle("open", wantOpen);
            moreBtn.classList.toggle("open", wantOpen);
          };
          moreBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
          });
          menu.addEventListener("click", (e) => e.stopPropagation());
          document.addEventListener("click", () => toggleMenu(false));
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") toggleMenu(false);
          });
        }

        holder.querySelectorAll("[data-bbcode],[data-action]").forEach(span => {
          span.addEventListener("click", (e) => {
            e.stopPropagation();
            const bbCode = span.getAttribute("data-bbcode");
            const action = span.getAttribute("data-action");
            if (bbCode) {
              if (bbCode === "[img][/img]") insertImgBBCodeWithClipboard(bbCode, chatbox);
              else if (bbCode === "[url][/url]") insertBBCodeWithClipboard(bbCode, chatbox);
              else if (bbCode === "[youtube][/youtube]") insertYouTubeBBCodeSmart(bbCode, chatbox);
              else if (bbCode === "/msg" || bbCode === "/gift") {
                chatbox.setRangeText(bbCode + " ", chatbox.selectionStart, chatbox.selectionEnd, "end");
                chatbox.focus();
              }
              else if (bbCode === "[hr]") chatbox.setRangeText("[hr]\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
              else insertBBCode(chatbox, bbCode);
            }
            else if (action) {
              switch (action) {
                case "color":
                  insertWrapWithArg(chatbox, "color", "Color (name or #rrggbb):", "#ff0000");
                  break;
                case "size":
                  insertWrapWithArg(chatbox, "size", "Text size (e.g., 12, 14, 18):", "14");
                  break;
                case "list-ul":
                  chatbox.setRangeText("[list]\n[*] Item 1\n[*] Item 2\n[/list]\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
                  chatbox.focus();
                  break;
                case "list-ol":
                  chatbox.setRangeText("[list=1]\n[*] Item 1\n[*] Item 2\n[/list]\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
                  chatbox.focus();
                  break;
                case "list-item":
                  chatbox.setRangeText("[*] Item\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
                  chatbox.focus();
                  break;
                case "hr":
                  chatbox.setRangeText("[hr]\n", chatbox.selectionStart, chatbox.selectionEnd, "end");
                  chatbox.focus();
                  break;
              }
            }
          });
        });
      }
    }

    function setupSettingsPanel() {
      const header = gChat.header || document.getElementById("chatbox_header");
      if (!header) return console.error("Failed to attach the settings button: chat header not found.");
      if (document.getElementById("u3dSettingsAnchor")) {
        applySettings();
        setupSettingsListeners();
        return;
      }

      const anchor = document.createElement("div");
      anchor.className = "u3d-settings-anchor";
      anchor.id = "u3dSettingsAnchor";
      anchor.innerHTML = `<div id="${settingsButtonID}"><i class="fa-solid fa-gear"></i></div>${settingsPanelHTML()}`;
      header.appendChild(anchor);

      const toggleSettingsButton = document.getElementById(settingsButtonID);
      const settingsPanelElement = document.getElementById(settingsPanelID);
      toggleSettingsButton.addEventListener("click", (event) => {
        event.stopPropagation();
        settingsPanelElement.style.display = (settingsPanelElement.style.display === "block") ? "none" : "block";
      });
      document.addEventListener("click", (event) => {
        if (!settingsPanelElement.contains(event.target) && !toggleSettingsButton.contains(event.target)) {
          settingsPanelElement.style.display = "none";
        }
      });

      initThemesUI();
      showSettingsView("home");

      applySettings();
      setupSettingsListeners();
    }

    async function checkAndSetup() {
      try {
        gChat.box = await waitForAny(SELECTORS.chatbox);
        gChat.messages = await waitForAny(SELECTORS.messages);
        gChat.header = await waitForAny(SELECTORS.header).catch(() => null);
        if (gChat.header) gChat.header.classList.add("u3d-chat-header");

        setupReplyFeatures();
        setupChatFeatures(gChat.box);
        setupSettingsPanel();
        applySettings();
      }
      catch (error) {
        console.error("Error setting up chat UI:", error);
      }
    }

    checkAndSetup();
  })();
}