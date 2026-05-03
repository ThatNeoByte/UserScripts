// ==UserScript==
// @name            Unit3D – Emoji & Media Picker (ThatNeoByte Edition)
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         1.1.0-tnb.2
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
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-EmojiPanel.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-EmojiPanel.user.js
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
// @include         *://capybarabr.com/*
// @include         *://polishtorrent.top/*
// @include         *://retro-movies.club/*
// @include         *://rocket-hd.cc/*
// @include         *://shareisland.org/*
// @include         *://midnightscene.cc/*
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

// ═══════════════════════════════════════════════
//  Updates: 
//  1. Added IRC Support  
//  2. Fixed lst.gg chat
//  3. Updated the Appearance
//  4. Fixed many issues, now it's faster and improved the speed at anything, even lazy load.
//  NOTE: Now you can use it at your self-host IRC Channel.
// ═══════════════════════════════════════════════

(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  //  POLYFILLS
  // ═══════════════════════════════════════════════
  if (typeof window.GM_addStyle !== 'function') {
    window.GM_addStyle = css => {
      const s = document.createElement('style');
      s.textContent = css;
      document.head.appendChild(s);
      return s;
    };
  }

  const GM_Get = (k, d) => { try { return GM_getValue(k, d); } catch { return d; } };
  const GM_Set = (k, v) => { try { GM_setValue(k, v); } catch {} };

  // Font Awesome
  if (!document.querySelector('link[href*="font-awesome"],link[href*="fontawesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    fa.crossOrigin = 'anonymous';
    document.head.appendChild(fa);
  }

  // ═══════════════════════════════════════════════
  //  CONSTANTS
  // ═══════════════════════════════════════════════
  const VERSION = '1.1.0-tnb.1';
  const LINKS = {
    github: 'https://github.com/ZukoXZoku/Ultimate-Emojis',
    openuserjs: 'https://openuserjs.org/scripts/ZukoXZoku/Ultimate_Emojis',
    download: 'https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-EmojiPanel.user.js',
    meta: 'https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-EmojiPanel.user.js'
  };

  const EMOJI_COUNT = 29;
  const EMOJI_ORIGINS = [
    'https://raw.githubusercontent.com/ZukoXZoku/Ultimate-Emojis/main/emojis/emj',
    'https://cdn.jsdelivr.net/gh/ZukoXZoku/Ultimate-Emojis@main/emojis/emj'
  ];
  const EMOJI_URL_GROUPS = Array.from({ length: EMOJI_COUNT }, (_, i) => {
    const n = i + 1;
    return EMOJI_ORIGINS.map(base => `${base}${n}.json`);
  });
  EMOJI_URL_GROUPS.unshift(
    [
      "https://raw.githubusercontent.com/ThatNeoByte/Emoji-s/refs/heads/main/emoji1.json"
    ]
  );
  const STICKERS_JSON_URLS = [
    'https://raw.githubusercontent.com/ZukoXZoku/Ultimate-Emojis/refs/heads/main/stickers/stkrs.json'
  ];

  // ═══════════════════════════════════════════════
  //  EMOJI SUBCATEGORIES DATA
  // ═══════════════════════════════════════════════
  const EMOJI_CATS = {
    custom:    { label: 'Custom',    icon: 'fa-star',         desc: 'Your custom uploaded emojis' },
    emojipedia:{ label: 'Emojipedia',icon: 'fa-face-smile',   desc: 'Standard Unicode emojis' },
    symbols:   { label: 'Symbols',   icon: 'fa-icons',        desc: 'Symbols, math, arrows' },
    flags:     { label: 'Flags',     icon: 'fa-flag',         desc: 'Country & region flags' },
    kaomoji:   { label: 'Kaomoji',   icon: 'fa-comment-dots', desc: 'Japanese text emoticons' },
    ascii:     { label: 'ASCII',     icon: 'fa-terminal',     desc: 'ASCII emoticons' }
  };

  const EMOJIPEDIA = {
    'Smileys': '😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘😗😚😙🥲😋😛😜🤪😝🤑🤗🤭🫢🫣🤫🤔🫡🤐🤨😐😑😶🫥😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🥵🥶🥴😵😵‍💫🤯🤠🥳🥸😎🤓🧐😕🫤😟🙁☹️😮😯😲😳🥺🥹😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀☠️💩🤡👹👺👻👽👾🤖'.match(/./gu),
    'Gestures': '👋🤚🖐️✋🖖🫱🫲🫳🫴👌🤌🤏✌️🤞🫰🤟🤘🤙👈👉👆🖕👇☝️🫵👍👎✊👊🤛🤜👏🙌🫶👐🤲🤝🙏✍️💅🤳💪🦾🦿🦵🦶👂🦻👃🧠🫀🫁🦷🦴👀👁️👅👄🫦'.match(/./gu),
    'People': '👶🧒👦👧🧑👱👨🧔👩🧓👴👵🙍🙎🙅🙆💁🙋🧏🙇🤦🤷👮🕵️💂🥷👷🫅🤴👸👳👲🧕🤵👰🤰🫃🫄🤱👼🎅🤶🦸🦹🧙🧚🧛🧜🧝🧞🧟💆💇🚶🧍🧎🏃💃🕺'.match(/./gu),
    'Animals': '🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷️🕸️🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🦭🐊🐅🐆🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐈‍⬛🪶🐓🦃🦤🦚🦜🦢🦩🕊️🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿️🦔'.match(/./gu),
    'Nature': '🌵🎄🌲🌳🌴🪵🌱🌿☘️🍀🎍🪴🎋🍃🍂🍁🪺🪹🍄🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🌛🌜🌚🌕🌖🌗🌘🌑🌒🌓🌔🌙🌎🌍🌏🪐💫⭐🌟✨⚡☄️💥🔥🌪️🌈☀️🌤️⛅🌥️☁️🌦️🌧️⛈️🌩️🌨️❄️☃️⛄🌬️💨💧💦🫧☔☂️🌊🌫️'.match(/./gu),
    'Food': '🍏🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥬🥒🌶️🫑🌽🥕🫒🧄🧅🥔🍠🫘🥐🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🌭🍔🍟🍕🫓🥪🥙🧆🌮🌯🫔🥗🥘🫕🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼🫖☕🍵🧃🥤🧋🍶🍺🍻🥂🍷🥃🍸🍹🧉🍾🧊'.match(/./gu),
    'Activities': '⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🪀🏓🏸🏒🏑🥍🏏🪃🥅⛳🪁🏹🎣🤿🥊🥋🎽🛹🛼🛷⛸️🥌🎿🏆🥇🥈🥉🏅🎖️🏵️🎗️🎪🤹🎭🩰🎨🎬🎤🎧🎼🎹🥁🪘🎷🎺🪗🎸🪕🎻🪈🎲♟️🎯🎳🎮🕹️🧩🪅🪩'.match(/./gu),
    'Objects': '⌚📱💻⌨️🖥️🖨️🖱️💽💾💿📀📼📷📹🎥📽️📞☎️📟📠📺📻🎙️🎚️🎛️🧭⏱️⏲️⏰🕰️⌛⏳📡🔋🔌💡🔦🕯️🧯💸💵💴💶💷🪙💰💳💎⚖️🧰🔧🔨⛏️🔩⚙️🧱⛓️🧲🔫💣🧨🔪🗡️⚔️🛡️⚰️⚱️🏺🔮📿🧿💈⚗️🔭🔬🩹🩺💊💉🧬🦠🧫🧪🌡️🧹🧺🧻🚽🧼🧽🧴🛎️🔑🗝️🚪🪑🛋️🛏️🧸🖼️🛍️🛒🎁🎈🎀🎊🎉🏮✉️📩📨📧💌📥📤📦🏷️📪📫📬📭📮📯📜📃📄📑🧾📊📈📉📇📋📁📂📰📓📔📒📕📗📘📙📚📖🔖🔗📎📐📏📌📍✂️🖊️🖋️✒️🖌️🖍️📝✏️🔍🔎🔏🔐🔒🔓'.match(/./gu),
    'Travel': '🚗🚕🚙🚌🚎🏎️🚓🚑🚒🚐🛻🚚🚛🚜🛴🚲🛵🏍️🛺🚨🚔🚍🚘🚖🛞🚡🚠🚟🚃🚋🚞🚝🚄🚅🚈🚂🚆🚇🚊🚉✈️🛫🛬🛩️💺🛰️🚀🛸🚁🛶⛵🚤🛥️🛳️⛴️🚢⚓⛽🚧🚦🚥🚏🗺️🗿🗽🗼🏰🏯🏟️🎡🎢🎠⛲⛱️🏖️🏝️🏜️🌋⛰️🏔️🗻🏕️⛺🛖🏠🏡🏘️🏚️🏗️🏭🏢🏬🏣🏤🏥🏦🏨🏪🏫🏩💒🏛️⛪🕌🕍🛕🕋⛩️🛤️🛣️🌅🌄🌠🎇🎆🌇🌆🏙️🌃🌌🌉🌁'.match(/./gu)
  };

  const SYMBOL_DATA = {
    'Hearts': '❤️🧡💛💚💙💜🖤🤍🤎❤️‍🔥❤️‍🩹💔❣️💕💞💓💗💖💘💝💟🩷🩵🩶'.match(/./gu),
    'Arrows': ['⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔃','🔄','🔙','🔚','🔛','🔜','🔝'],
    'Geometric': '🔴🟠🟡🟢🔵🟣🟤⚫⚪🟥🟧🟨🟩🟦🟪🟫⬛⬜◼️◻️◾◽▪️▫️🔶🔷🔸🔹🔺🔻💠🔘🔳🔲'.match(/./gu),
    'Math': ['➕','➖','✖️','➗','♾️','‼️','⁉️','❓','❔','❕','❗'],
    'Misc': ['✅','☑️','✔️','❌','❎','✳️','✴️','❇️','©️','®️','™️','#️⃣','*️⃣','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','ℹ️']
  };

  const FLAG_DATA = '🏁🚩🎌🏴🏳️🏳️‍🌈🏳️‍⚧️🏴‍☠️🇦🇫🇦🇱🇩🇿🇦🇸🇦🇩🇦🇴🇦🇮🇦🇬🇦🇷🇦🇲🇦🇼🇦🇺🇦🇹🇦🇿🇧🇸🇧🇭🇧🇩🇧🇧🇧🇾🇧🇪🇧🇿🇧🇯🇧🇲🇧🇹🇧🇴🇧🇦🇧🇼🇧🇷🇧🇳🇧🇬🇧🇫🇧🇮🇰🇭🇨🇲🇨🇦🇨🇻🇨🇫🇹🇩🇨🇱🇨🇳🇨🇴🇰🇲🇨🇬🇨🇩🇨🇷🇭🇷🇨🇺🇨🇾🇨🇿🇩🇰🇩🇯🇩🇲🇩🇴🇪🇨🇪🇬🇸🇻🇬🇶🇪🇷🇪🇪🇪🇸🇿🇪🇹🇫🇯🇫🇮🇫🇷🇬🇦🇬🇲🇬🇪🇩🇪🇬🇭🇬🇷🇬🇩🇬🇹🇬🇳🇬🇼🇬🇾🇭🇹🇭🇳🇭🇺🇮🇸🇮🇳🇮🇩🇮🇷🇮🇶🇮🇪🇮🇱🇮🇹🇯🇲🇯🇵🇯🇴🇰🇿🇰🇪🇰🇮🇽🇰🇰🇼🇰🇬🇱🇦🇱🇻🇱🇧🇱🇸🇱🇷🇱🇾🇱🇮🇱🇹🇱🇺🇲🇬🇲🇼🇲🇾🇲🇻🇲🇱🇲🇹🇲🇭🇲🇷🇲🇺🇲🇽🇫🇲🇲🇩🇲🇨🇲🇳🇲🇪🇲🇦🇲🇿🇲🇲🇳🇦🇳🇷🇳🇵🇳🇱🇳🇿🇳🇮🇳🇪🇳🇬🇰🇵🇲🇰🇳🇴🇴🇲🇵🇰🇵🇼🇵🇸🇵🇦🇵🇬🇵🇾🇵🇪🇵🇭🇵🇱🇵🇹🇶🇦🇷🇴🇷🇺🇷🇼🇸🇦🇸🇳🇷🇸🇸🇨🇸🇱🇸🇬🇸🇰🇸🇮🇸🇧🇸🇴🇿🇦🇰🇷🇸🇸🇪🇸🇱🇰🇸🇩🇸🇷🇸🇪🇨🇭🇸🇾🇹🇼🇹🇯🇹🇿🇹🇭🇹🇱🇹🇬🇹🇴🇹🇹🇹🇳🇹🇷🇹🇲🇹🇻🇺🇬🇺🇦🇦🇪🇬🇧🇺🇸🇺🇾🇺🇿🇻🇺🇻🇪🇻🇳🇾🇪🇿🇲🇿🇼'.match(/./gu);

const KAOMOJI = {
  'Happy': ['(◕‿◕)', '(｡◕‿◕｡)', '(◠‿◠)', '(✿◠‿◠)', '(◡‿◡)', 'ʕ•ᴥ•ʔ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(≧◡≦)', '(◕ᴗ◕✿)', '☆*:.｡.o(≧▽≦)o.｡.:*☆', '(◍•ᴗ•◍)', '(灬º‿º灬)♡', '( ´ ▽ ` )ﾉ', '(o˘◡˘o)', '(≧▽≦)', '(⌒‿⌒)', '(｡･ω･｡)', '(´ ▽ ` )', '( ´ ω ` )', '｡ﾟ(TヮT)ﾟ｡', '(ﾉ>ω<)ﾉ', '(｡♥‿♥｡)', 'ヾ(≧▽≦*)o', '(≧◡≦) ', '(˘︶˘).｡.:*♡', '(ू•ᴗ•ू❁)', '(◠‿◠)', '(｡･ω･｡)ﾉ♡', '( ´ ∀ `)ノ', '(*≧ω≦*)', 'ヾ(≧▽≦*)o', '٩(◕‿◕｡)۶', '(●\'◡\'●)', '(´• ω •`)', '(◠˘◠)', '(˵ ͡° ͜ʖ ͡°˵)', '( ´ ▽ ` )ﾉ', '＼(≧▽≦)／', '(⁀ᗢ⁀)', '(≖ᴗ≖✿)', '(◠‿◠✿)', '(人´∀`)☆', '(ﾉ^_^)ﾉ', '(*^‿^*)', '( ´ ꒳ ` )', '( ˘ ³˘)♥', '(⌬̈⃝)', '( ˘ᴥ˘ )', '(˶‾᷄ ⁻̫ ‾᷅˵)', '(ᵔᴥᵔ)', '(◕‿◕)', '(≧◠‿◠≦)', '(✿ ◕‿◕)', '(◕‿◕✿)', '⊂(◉‿◉)つ', '(◉‿◉)', '(｡◕‿◕｡)', '(◠‿◠)', '(◕ᴗ◕✿)', '(｡◕‿◕｡)', '(★^O^★)', '(^_^)b', '(＾▽＾)', 'ヾ(＾-＾)ノ', '(´ ▽ ` )', '(●\'◡\'●)', '╰(´︶`)╯', '( ´ ▽ ` )b', '٩(◕‿◕｡)۶', '(⌒‿⌒)', 'ヾ(●´∀｀●)', '(●\'◡\'●)', '(*^▽^*)', '(≧◡≦)', '(✿╹◡╹)', '(✧ω✧)', '(*≧ω≦*)', '(◕‿◕)', '(*≧▽≦)', 'ヾ(≧▽≦*)o', '(≧◡≦)', '(✯ᴗ✯)', 'ヾ(◍°∇°◍)ﾉﾞ', '(◠‿◠)', '(◕‿◕)', '(｡◕‿◕｡)', '(*^▽^*)', '(*・ω・)ﾉ', '(￣▽￣)ノ', 'ヾ(≧▽≦*)o', '(*´ω｀*)', '(´･ω･`)', '(◕‿◕)', 'ヾ(・ω・`)'],
  'Sad': ['(╥_╥)', '(T_T)', '(;_;)', '(ノ_<。)', '(´;ω;`)', '(ಥ﹏ಥ)', '(っ˘̩╭╮˘̩)っ', '(｡•́︿•̀｡)', '(◞‸◟)', '(´•ω•̥`)', '(๑•́ ₃ •̀๑)', '(｡•́︿•̀｡)', '(╥﹏╥)', '(っ˘̩╭╮˘̩)っ', '(ノAノ)', '( ´_ゝ`)', '( ╥ω╥ )', '(╯_╰)', '(･ω･)つ⊂(･ω･)', '(҂◡_◡)', '(⋋▂⋋)', '(ꈍᴗꈍ)', '(≚ᄌ≚)ƶƵ', '( ︶︿︶)', '(¬_¬)', '( ⟩ ⟩ ⟩', '(ꐦ°᷄д°᷅)', '(ꐦ𝅒_𝅒) ', '(ꐦ╭╮𝅒_𝅒)', '( 𝙨𝙤𝙗𝙨 )', '( ≧Д≦)', '( 🔴_🔴 )', '( ´_ゝ`)', '( ←_← )', '( →_→ )', '( ⁽₍₍₍_⁾₎₎₎ )', '(◞‸◟)', '(ㄒoㄒ)', '(T⌓T)', '(჻ጒ౪჻ )', '(₍₍⁽⁽(ી₍₍⁽⁽(ી ซง₎₎⁾⁾₎₎⁾⁾', '(u‿ฺu)', '( ◡︵◡)', '( ´_ゝ`)', '(μ_μ)', '(꒪⌓꒪)', '(｡•́︿•̀｡)', '(╥﹏╥)', '(◞‸◟)', '(;﹏;)', '(︶︹︶)', '(っ˘̩╭╮˘̩)っ', '(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥`)', '( ✋˘ 😪 ˘ )', '(ー_ー )!!', '( ✋˘ ˘ )', '( ˘⌣˘ )', '( ˘︹˘ )', '(；′⌒`)', '(´胱圩鄄', '(T⌓T)', '(≖_≖ )', '( ﾟдﾟ)', '( bothered )', '(noise)', '(；￣Д￣)', '(・_・;)', '(・・;)', '(￣～￣;)', '(＠_＠)', '(ToT)', '(T_T)', '(T_T)', '(T_T)', '(_ _)', '．．●', '(°°)', '(°△°)', '(°ω°)', '(´･･`)', '(´・ω・`)', '(´・ω・`)', '(´・ω・`)', '(｡-_-)', '(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥`)', '(Ｔ▽Ｔ)', '(T_T)', '(;_;)', '(╥_╥)', '(╯°□°)╯︵ ┻━┻', '┻━┻ ︵ ヽ(°□° )ノ ︵ ┻━┻'],
  'Angry': ['(╬ Ò﹏Ó)', '(ﾉಠ益ಠ)ﾉ', '(ノ`Д´)ノ', '(`Д´)', '(≖_≖ )', '(눈_눈)', 'ヽ(`Д´)ﾉ', '(｡•ˇ‸ˇ•｡)', '(>人<)', '(¬_¬)', '(沉思)', '(ꐦ°᷄д°᷅)', '(╬ﾟ◥益◤ﾟ)', '(ノಠ ∩ಠ)ノ', '(≧Д≦)', '(ノ°△°)ノ︵┻━┻', '┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻', '(╯°□°)╯︵ ┻━┻', '╭∩╮（︶︿︶）╭∩╮', '(ಠ_ಠ)┌∩┐', '(ノಠ益ಠ)ノ彡┻━┻', '(╬ Ò﹏Ó)', '(ꐦ°᷄д°᷅)', '( ≧Д≦)', '(ꐦ╭╮𝅒_𝅒)', '(O_O)', '(＃＞＜)', '(＞＜)', '(＞﹏＜)', '( ` ω ´ )', '( ` ω ´ )', '( ` ω ´ )', '٩(╬ʘ益ʘ╬)۶', '(◞≼◉◞ ༽ ✧', '( ` ∇ ´ )', '(メ▼へ▼)ノ', '( ` Д ´)', 'o(>< )o', 'o(>< )o', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', '(ノಠ益ಠ)ノ彡┻━┻', '(╬ Ò﹏Ó)', '(ꐦ°᷄д°᷅)', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', 'ε=ε=ε=┌( >_<)┘', 'ε=ε=ε=┌( >_<)┘', '٩(╬ʘ益ʘ╬)۶', '(҂` ﾛ ´)╬', '(҂` ﾛ ´)╬', '୧(๑ ಠ 益 ಠ)૭', '୧(๑ ಠ 益 ಠ)૭', 'ψ(｀∇´)ψ', 'ψ(｀∇´)ψ', '(ノ ` Д)ノ', '(ノ ` Д)ノ', '(；￣Д￣)', '(；￣Д￣)', '( ` Д´)', '( ` Д´)', '༼ つ ◕_◕ ༽つ', '༼ つ ◕_◕ ༽つ', '( ` ω ´ )', '( ` ω ´ )', '( ` ∇ ´ )', '( ` ∇ ´ )', '(メ▼へ▼)ノ', '(メ▼へ▼)ノ', '(ꈍ﹃ꈍ)', '(ꈍ﹃ꈍ)', '(ꐦ°᷄д°᷅)', '(ꐦ°᷄д°᷅)', '٩(╬ʘ益ʘ╬)۶', '٩(╬ʘ益ʘ╬)۶', 'o(>< )o', 'o(>< )o'],
  'Love': ['(♡°▽°♡)', '(◕‿◕)♡', '(✿ ♥‿♥)', '♡(ŐωŐ人)', '(´,,•ω•,,)♡', '(◍•ᴗ•◍)❤', '(灬♥ω♥灬)', '(◕ᴗ◕✿)', '(≧◡≦)♡', '( ´ ∀ `)ノ～ ♡', '♡＾▽＾♡', '(ღ˘⌣˘ღ)', '( ˘ ³˘)♥', '( ⚆ _ ⚆ )', '(♡˙︶˙♡)', '(♥ω♥*)', '(❤ω❤)', '( ´ ▽ ` )ﾉ♥', '(ɔˆ ³(ˆ⌣ˆc)', '(◡‿◡✿)', '( ˘ᴥ˘ )❤', '(¢aldara)', '(´,,•ω•,,)', '♡(˃͈ દ ˂͈ ༶ )', '( ˘ ³˘)♥', '( ´ ∀ `)♥', '( ´ ▽ ` )♥', '(´,,•ω•,,)♡', '(´,,•ω•,,)♡', '(◍•ᴗ•◍)❤', '(◍•ᴗ•◍)❤', '( ´ ∀ `)♥', '(*^^*)', '(◕‿◕)♡', '( ´ ▽ ` )b', '(*^▽^*)', '(*^▽^*)', '(✿ ♥‿♥)', '(*´ω｀*)', '(*´ω｀*)', '(*´ω｀*)', '( ´ ▽ ` )♥', '( ´ ▽ ` )♥', '(｡♥‿♥｡)', '(｡♥‿♥｡)', '(｡♥‿♥｡)', '( ´ ∀ `)♥', '( ´ ∀ `)♥', '( ´ ∀ `)♥', '⊂(◉‿◉)つ', '(づ￣ ³￣)づ', '(づ￣ ³￣)づ', '(っ◔◡◔)っ ♥', '(っ◔◡◔)っ ♥', '( ´ ▽ ` )b', '(*^▽^*)', '(◕‿◕)♡', '(*^^*)', '(*^^*)', '(◕‿◕)♡', '(*^^*)', '(*^^*)', '(◕‿◕)♡', '(◕‿◕)♡', '( ´ ∀ `)♥', '( ´ ∀ `)♥', '( ´ ▽ ` )b', '(*^▽^*)', '(◕‿◕)♡', '(*^^*)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)', '(✿ ◕‿◕)'],
  'Actions': ['┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻', '(╯°□°)╯︵ ┻━┻', '┬─┬ノ( º _ ºノ)', '¯\\_(ツ)_/¯', '(ノ°∀°)ノ⌒･*:.｡', 'ᕕ( ᐛ )ᕗ', '(•̀ᴗ•́)و', '(ง •̀_•́)ง', '(☞ﾟヮﾟ)☞', '☜(ﾟヮﾟ☜)', '(⌐■_■)', '(•_•) ( •_•)>⌐■-■ (⌐■_■)', 'ヽ(•‿•)ノ', '(¬‿¬)', '( ͡° ͜ʖ ͡°)', '╭∩╮（︶︿︶）╭∩╮', '(ಠ_ಠ)┌∩┐', '┬─┬ ノ( ゜-゜ノ)', '(╯°□°)╯︵ ┻━┻ ︵ ┻━┻', '┻━┻ ︵ ¯\\ (ツ)/ ︵ ┻━┻', '(ノಠ ∀ ಠ)ノ⌒･*:.｡', '(ಠ_ಠ)ಠ_ಠ)', '(ಠ‿ಠ)ಠ_ಠ)', '( ͡ಠ ʖ̯ ͡ಠ)', '┬─┬ ︵ /(.□. \\)', '┻━┻ ︵ ヽ(°□° )ノ ︵ ┻━┻', '┻━┻ ︵ ¯\\( °□° )/¯ ︵ ┻━┻', '(ノಥ,_｣ಥ)ノ彡┻━┻', '┬─┬ ︵( /(.□. \\))', '(╯°□°）╯︵ ┻━┻', '(╯°Д°）╯︵ /(.□ . \\)', '┬─┬ ノ( º _ ºノ )', '┬─┬ ノ( ゜-゜ノ)', '( º _ º )', '( º _ º )', '( º _ º )', '╭∩╮(Ο_Ο)╭∩╮', '╭∩╮(Ο_Ο)╭∩╮', '╭∩╮(Ο_Ο)╭∩╮', '(☞ﾟヮﾟ)☞', '(☞ﾟヮﾟ)☞', '☜(ﾟヮﾟ☜)', '☜(ﾟヮﾟ☜)', '☜(ﾟヮﾟ☜)', 'ʕ •ᴥ• ʔ', 'ʕ •ᴥ• ʔ', 'ʕ •ᴥ• ʔ', '(づ￣ ³￣)づ', '(づ￣ ³￣)づ', '(つ≧▽≦)つ', '(つ≧▽≦)つ', '(つ≧▽≦)つ', '(つ≧▽≦)つ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(*・ω・)ﾉ', '(*・ω・)ﾉ', '(ノ°∀°)ノ', '(ノ°∀°)ノ', '(ノ°∀°)ノ', '(ノ°∀°)ノ', 'ヾ(・ω・`)', 'ヾ(・ω・`)', '( ´ ▽ ` )ﾉ', '( ´ ▽ ` )ﾉ', '( ´ ▽ ` )ﾉ', '( ´ ▽ ` )ﾉ', '( ´ ▽ ` )b', '( ´ ▽ ` )b', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘'],
  'Animals': ['ʕ•ᴥ•ʔ', '(=^・ω・^=)', '(=^-ω-^=)', 'ʕ ꈍᴥꈍʔ', '(◕ᴥ◕)', 'U•ᴥ•U', '(ΦωΦ)', '₍ᐢ..ᐢ₎', 'ฅ^•ﻌ•^ฅ', '(🐕)', '(ㅇㅅㅇ❀)', '( ˘ᴥ˘ )', '(◉θ◉)', '(=o_o=)', 'ᶘ ᵒᴥᵒᶅ', 'ʕ̯•͡ᴥ•͡ʔ', 'ʕ>Toᴥo<ʔ', '(ᵔᴥᵔ)', 'ʕ•̫͡•ʔ', 'ʕ•ᴥ•ʔ', 'ʕ •ᴥ• ʔ', 'ʕ•́•̀ʔ', 'ʕ◉ᴥ◉ʔ', 'ʕ⁰̈ʔ', 'ʕಠᴥಠʔ', 'ʕ•̠͡•ʔ', 'ʕ•͡ˑ͓•ʔ', 'ʕ•̫͡•ʔ', 'ʕ•͓͡•ʔ', 'ʕꈍᴥꈍʔ', 'ʕ≧ᴥ≦ʔ', 'ʕつ◕ᴥ◕ʔつ', 'ʕง•ᴥ•ʔง', 'ʕᵔᴥᵔʔ', '(=｀ω´=)', 'ฅ(• ɪ •)ฅ', 'ฅ(• wget •)ฅ', 'ฅ(=๏ᆺ๏=)ฅ', '(=^-ω-^=)', '(=^ｪ^=)', '(=^･･^=)', '(=^･ｪ･^=)', 'ฅ(•ㅅ•❀)ฅ', 'ฅ(•ㅅ•)ฅ', 'ฅ(×ω×)ฅ', 'ฅ(˘ω˘ )ฅ', 'ฅ( ꒪◦꒪)ฅ', 'ฅ(ﾐ⚈ ﻌ ⚈ﾐ)ฅ', 'ฅ(๑*д*๑)ฅ', 'ฅ(๑˃ᴗ˂)ฅ', 'ฅ(๑˙o˙๑)ฅ', 'ฅ(ﾐ◕ ༝ ◕ﾐ)ฅ', 'ฅ(ﾐ◉ ਊ ◉ﾐ)ฅ', 'ฅ(ﾐ⚈ llvm ⚈ﾐ)ฅ', 'ฅ(=ʘᆽʘ=)ฅ', 'ฅ(>_<)ฅ', '(=ﾟ･ﾟ=)ｿ', '(=;ﾟ∀ﾟ=)', '(=´∀｀)=', 'U・x・U', 'U・ﻌ・U', 'U・ᴥ・U', 'U^ｪ^U', 'V●ᴥ●V', '( ˘ᴥ˘ )', '( ˘ᴥ˘ )', '( ˘ᴥ˘ )', 'ʕ•ᴥ•ʔ', 'ʕ•ᴥ•ʔ', 'ʕ•ᴥ•ʔ', '(=^・ω・^=)', '(=^・ω・^=)', '(=^・ω・^=)', '(=^-ω-^=)', '(=^-ω-^=)', '(=^-ω-^=)', 'ʕ ꈍᴥꈍʔ', 'ʕ ꈍᴥꈍʔ', 'ʕ ꈍᴥꈍʔ'],
  'Lenny': ['( ͡° ͜ʖ ͡°)', '( ͡°( ͡° ͜ʖ( ͡° ͜ʖ ͡°)ʖ ͡°) ͡°)', '( ͡° ʖ̯ ͡°)', '( ͡ಠ ʖ̯ ͡ಠ)', '( ͡⚆ ͜ʖ ͡⚆)', '( ͡~ ͜ʖ ͡°)', '( ͡ʘ╭͜ʖ╮͡ʘ)', '( ͡°╭͜ʖ╮͡°)', '( ͝° ͜ʖ͡°)', '( ͡° ͜ʖ ͡°)( ͡° ͜ʖ ͡°)', 'ᕦ( ͡° ͜ʖ ͡°)ᕤ', '( ͡°ᴥ ͡°)', '( ͡ಠ╭͜ʖ╮͡ಠ)', '( ͡° ͜ʖ ͡°)ﾉ⌐■-■', '( ͡° ͜ʖ ͡°) □ -□ ', '(つ ͡° ͜ʖ ͡°)つ', 'ʕ •ᴥ• ʔ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ', '( ͡° ͜ʖ ͡°)ノ'],
  'Table': ['┬─┬ノ( º _ ºノ)', '┬─┬ ︵ /(.□. \\)', '┻━┻ ︵ ヽ(°□° )ノ ︵ ┻━┻', '┻━┻ ︵ ¯\\( °□° )/¯ ︵ ┻━┻', '(╯°□°)╯︵ ┻━┻ ', '(ノಠ益ಠ)ノ彡┻━┻', '(╯°□°)╯︵ ┻━┻ ︵ ┻━┻', '┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻', '┬─┬ノ(ಠ_ಠノ)', '┻━┻ ︵ ¯\\_༼ ᴼ_o ༽_/¯ ︵ ┻━┻', '(ノಥ,_｣ಥ)ノ彡┻━┻', '┬─┬ ︵(/ .o.\\/)'],
  'Surprised': ['(☉_☉)', '(º_º)', '(⊙_☉)', '(⊙_⊙)', '(✧ω✧)', '(✧_✧)', '(O_O)', '(o_O)', '(°o°)', '(°ロ°)', '(O.o)', '(o_O)', '(๏_๏)', '(⊚_⊚)', '(◔_◔)', '(◉_◉)', '(◔ ‸ ◔)', '( : ౦ ‸ ౦ : )', '(O_o)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)', '(o_O)'],
  'Helpless': ['¯\\_(ツ)_/¯', '╮(╯_╰)╭', '¯\\_(⊙_⊙)_/¯', '¯\\_( ͡° ͜ʖ ͡°)_/¯', '¯\\_(☯ᴥ☯)_/¯', '¯\\_(⊡_⊡)_/¯', '╮(╯▽╰)╭', '┐(´д`)┌', '┐(´～`)┌', '┐(´ー`)┌', '╮(╯_╰)╭', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯', '¯\\_(ツ)_/¯'],
  'Other': ['(づ￣ ³￣)づ', '(つ≧▽≦)つ', '(ノ^_^)ノ', 'ヾ(・ω・`)', '( ´ ▽ ` )b', '(*^▽^*)', '(◕‿◕)♡', '(◍•ᴗ•◍)❤', 'ε=ε=ε=ε=ε=ε=┌(;￣◇￣)┘', 'ψ(｀∇´)ψ', '( ´ ∀ `)♥', '( ˘ ³˘)♥', '⊂(◉‿◉)つ', 'ヾ(●´∀｀●)', '(*´ω｀*)', '(´･ω･`)', '( •ω• )', '(*_*)', '(ू˃̣̣̥̥̥̣̣̥‸˂̣̣̥̥̥̣̣̥ )', 'φ(゜▽゜*)♪', '♪(´ε` )', '(＾▽＾)', '(^_^)b', 'ヾ(☆▽☆)', '(o_0)!', '(O_o)', '( ﾟヮﾟ)', '(; ͡° ͜ʖ ͡°)', '(>人<)', '(X_X)', '(×_×)', '(×_×;）', '(*_*)', '(・・;)', '(￣～￣;)', '(＠_＠)', '(o_O)', '(O_o)', '(o_o)', '(O_O)', '(o.O)', '(O.o)', '( :o)', '( :O)', '( :0)', '(:0)', '( :0 )', '( :O )', '( :o )', '( :0)', '( :O)', '( :o)']
};

const ASCII_ART = [
  ':)', ':(', ':D', ':P', ';)', ':O', 'XD', 'B)', ':|', ':/', '>:(', ':\'(', '<3', '\\o/', '-_-', '^_^', 'O_O', '>_<', 'T_T', 'UwU', 'OwO', ':^)',
  '¯\\_(ツ)_/¯', '( ͡° ͜ʖ ͡°)', 'ಠ_ಠ', '(☞ﾟヮﾟ)☞', '☜(ﾟヮﾟ☜)', '(⌐■_■)', 'ヽ(•‿•)ノ', '(¬‿¬)', 'ʕ•ᴥ•ʔ', '(つゝ´)', '(◕‿◕)', '(≧◡≦)', '(ง’̀-‘́)ง',
  '(╯°□°）╯︵ ┻━┻', '┬─┬ ノ( ゜-゜ノ)', '┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻', '( •_•) ( •_•)>⌐■-■ (⌐■_■)', '(╮°-°)╮┳━┳', '(╯°□°)╯︵ ┻━┻ ︵ ┻━┻',
  '( ͡ᵔ ͜ʖ ͡ᵔ )', '( ͝° ͜ʖ͡°)', '( ͡ʘ╭͜ʖ╮͡ʘ)', '(͡° ͜ ͡°)', 'ʕ̯•͡ᴥ•͡ʔ', 'ᶘ ᵒᴥᵒᶅ', 'ʕ•ᴥ•ʔ', 'ʕ ꈍᴥꈍʔ', 'ʕ̯•͡ᴥ•͡ʔ',
  'ヽ(=^･ω･^=)丿', 'UwU', 'OwO', '>w<', '.w.', 'nwn', '^w^', '◕‿◕', 'ಠ_ಠ', 'ಠ益ಠ', 'ಥ_ಥ', '( ≖‿≖)', '(¬‿¬ )',
  '( ˘ ɜ˘)♬', '♫♪.ılılıll|̲̅̅●̲̅̅|̲̅̅=̲̅̅|̲̅̅●̲̅̅|llılılı.♪♫', '(♬ ﾟ∀ﾟ)♪', 'ヾ(⌐■_■)ノ♪', '┏(・o･)┛♪┗ ( ･o･)┓♪',
  '(▀̿Ĺ̯▀̿ ̿)', '( ͡° ͜ʖ ͡°)╭∩╮', '(╭☞•́•̀)╭☞', '(☞ﾟヮﾟ)☞', '☜(ﾟヮﾟ☜)', 'ಠ_ರೃ', 'ヽ(｀Д´)ﾉ', '( ͝° ͜ʖ͡°)',
  'ᕦ(ò_óˇ)ᕤ', 'ᕙ(⇀‸↼‶)ᕗ', 'ᕕ( ᐛ )ᕗ', '(•̀ᴗ•́)و', '(ง •̀_•́)ง', '(ಥ﹏ಥ)', '(╯°□°）╯︵ ┻━┻', '(ノಠ益ಠ)ノ',
  ':)', ':-)', ':(', ':-(', ':D', ':-D', ';)', ';-)', ':P', ':-P', ':p', ':-p', ':O', ':-O', ':o', ':-o', ':|', ':-|',
  ':/', ':-/', ':S', ':-S', ':$', ':-$', 'XD', 'xD', 'Xd', 'xd', 'X-D', 'x-D', 'X=P', 'x=p', '>:(', '>:-(', '>:)', '>:-)',
  '>:D', '>:-D', '>:P', '>:-P', ':\'(', ':\'[', ':\'-(', ':\'-[', ':*)', ':-*)', 'B)', 'B-)', '8)', '8-)', 'B-)',
  ':3', ':-3', ':>', ':->', ':<', ':-<', ':]', ':-]', ':[', ':-[', ':}', ':-}', ':{', ':-{', '=)', '=]', '=D', '=P',
  '=3', '=(', '=[', '=/', '=|', '=O', '=o', '=*', '=3', '=X', '=x', '>:3', '>:-3', '>:]', '>:-]', '>:[', '>:-[',
  ';-);]', ';-[', ';-P', ';-p', ';-D', ';-O', ';-o', ';-3', ';-*', ';-X', ';-x',
  '(o) (o)', '(O) (O)', '(o_O)', '(O_o)', '(o_o)', '(O_O)', '(o.O)', '(O.o)', '(o_0)', '(O_0)', '(0_o)', '(0_O)',
  '(o.0)', '(O.0)', '(o.o)', '(O.O)', '(o_0)', '(O_0)',
  '(@_@)', '(+_+)', '(x_x)', '(X_X)', '(*_*)', '(=_=)', '(-_-)', '(>_<)',
  '<3', '</3', '<\\3', '<//3', '^_^', '^^', '^.^', '^_^', '^_~', '^_~', '^^;', '^^;', '^_^;', '^_^;', '^^;;', '^^;;', '^_^;;', '^_^;;',
  'o_O', 'O_o', 'o.o', 'O.O', 'o_o', 'O_O', 'o.O', 'O.o', 'o_0', 'O_0', '0_o', '0_O', 'o.0', 'O.0', 'o.o', 'O.O','-_-',
  'T_T', 'ToT', 'T_T', 'ToT', 'T_T', 'ToT', 'T_T', 'ToT', 'T_T', 'ToT', 'T_T', 'ToT', 'T_T', 'ToT', 'T_T',
  'UwU', 'OwO', 'uwu', 'owo', 'UwU', 'OwO', 'uwu', 'owo', 'UwU', 'OwO', 'uwu', 'owo', 'UwU', 'OwO',
  ':innocent:', ':angel:', ':wink:', ':blush:', ':slight_smile:', ':smile:', ':laughing:', ':relaxed:', ':smirk:', ':expressionless:',
  ':unamused:', ':rolling_eyes:', ':thinking:', ':zipper_mouth:', ':neutral_face:', ':no_mouth:', ':dizzy_face:', ':grimacing:',
  ':sweat_smile:', ':joy:', ':rofl:', ':smiley:', ':grinning:', ':smile:', ':grin:', ':laughing:', ':wink:', ':blush:',
  ':yum:', ':stuck_out_tongue:', ':stuck_out_tongue_winking_eye:', ':stuck_out_tongue_closed_eyes:', ':disappointed:', ':worried:',
  ':angry:', ':rage:', ':cry:', ':persevere:', ':triumph:', ':relieved:', ':sleepy:', ':tired_face:', ':dizzy:',
  ':hushed:', ':open_mouth:', ':astonished:', ':scream:', ':scream_cat:', ':flushed:', ':frowning:', ':anguished:',
  ':fearful:', ':cold_sweat:', ':disappointed_relieved:', ':weary:', ':sob:', ':confounded:', ':tired_face:',
  ':mask:', ':thermometer_face:', ':head_bandage:', ':sleeping:', ':zzz:', ':poop:', ':smiling_imp:', ':imp:',
  ':japanese_ogre:', ':japanese_goblin:', ':skull:', ':skull_and_crossbones:', ':ghost:', ':alien:', ':space_invader:',
  ':robot:', ':jack_o_lantern:'
];

  // ═══════════════════════════════════════════════
  //  STORAGE KEYS
  // ═══════════════════════════════════════════════
  const K = {
    settings: 'uni_settings',
    customCss: 'uni_custom_css',
    apiGlobal: 'uni_api_global',
    emojiCache: 'uni_emoji_cache_v3',
    emojiCacheTs: 'uni_emoji_cache_ts_v3',
    recent: 'uni_recent_v1',
    favEmoji: 'uni_favoriteEmojis_v2',
    favSticker: 'uni_favoriteStickers_v2',
    favGif: 'uni_favoriteGifs_v2',
    favEmojiLeg: 'uni_favoriteEmojis',
    favStickerLeg: 'uni_favoriteStickers',
    favGifLeg: 'uni_favoriteGifs',
    favMeta: 'uni_favMeta_v1',
    statsCache: 'uni_stats_cache_v1',
    statsCacheTs: 'uni_stats_cache_ts_v1'
  };

  const CACHE_TTL = 6 * 3600000;
  const STATS_TTL = 30 * 60000;

  // ═══════════════════════════════════════════════
  //  DEFAULTS
  // ═══════════════════════════════════════════════
  const DEFAULTS = {
    emojiSize:48,stickerSize:256,gifSize:256,gifInsertSize:256,
    gifPerPage:24,emojiPerPage:108,stickerPerPage:24,gifMinCol:128,
    gifShowTitles:false,menuWidth:700,menuHeightPx:650,menuMaxHeightVh:75,
    menuRadius:10,tileRadius:10,gapEmoji:8,gapLarge:10,
    bg:'#2f3136',bgAlpha:1.0,text:'#dcddde',accent:'#5865f2',
    borderColor:'#3a3b41',borderWidth:1,shadow:0.6,
    scrollbarWidth:8, scrollbarThumb:'#454545', scrollbarTrack:'rgba(0,0,0,0.1)',
    fontFamily:'"Segoe UI",Tahoma,Geneva,Verdana,sans-serif',
    uiFontSize:14,tileBg:'#202225',hoverScale:1.05,glowStrength:10,
    starColor:'#f1c40f',starBg:'rgba(0,0,0,.35)',starBorder:'#3a3b41',
    starTop:6,starRight:6,starSize:28,starSmSize:22,
    btnRadius:8,searchRadius:10,searchBorder:'#444',
    paginationBg:'#202225',paginationActiveBg:'#5865f2',paginationColor:'#b9bbbe',
    backdropBlur:0,zIndex:9999999,showGifStar:true,gifProvider:'local',
    apiScope:'global',redditSubs:'gifs, HighQualityGifs, reactiongifs',
    provTenor:true,provGiphy:true,provImgur:true,provTumblr:true,
    redditIncludeImages:false,localGifUrls:'',
    closeOnInsert:false,searchDebounceMs:200,
    menuPositionX:'',menuPositionY:'',
    insertFormat:'bbcode',insertTemplate:'[img=${size}]${url}[/img] ',
    showTooltips:true,recentEnabled:true,recentMax:50,
    tabOrder:'home,gifs,stickers,emojis',compactMode:false,
    emojiSubTab:'custom',lazyLoadThreshold:150
  };

  // ═══════════════════════════════════════════════
  //  SETTINGS LOAD
  // ═══════════════════════════════════════════════
  const S = Object.assign({}, DEFAULTS, (() => {
    try { return JSON.parse(GM_Get(K.settings, '{}')); } catch { return {}; }
  })());
  const saveS = () => GM_Set(K.settings, JSON.stringify(S));

  // ═══════════════════════════════════════════════
  //  API KEYS (SECURE)
  // ═══════════════════════════════════════════════
  const apiSiteKey = `uni_api_site:${location.host}`;
  const API_F = { giphy:'giphyKey', tenor:'tenorKey', imgur:'imgurClientId', tumblr:'tumblrKey' };

  function readApi(sc) { try { return JSON.parse(GM_Get(sc==='site'?apiSiteKey:K.apiGlobal,'{}'))||{}; } catch { return {}; } }
  function writeApi(sc,o) { GM_Set(sc==='site'?apiSiteKey:K.apiGlobal,JSON.stringify(o||{})); }
  function getKey(p) { const f=API_F[p]; if(!f)return ''; const sc=S.apiScope||'global'; return readApi(sc)[f]||readApi(sc==='site'?'global':'site')[f]||''; }
  function setKey(p,v) { const f=API_F[p]; if(!f)return; const sc=S.apiScope||'global'; const st=readApi(sc); st[f]=v||''; writeApi(sc,st); }
  function hasKey(p) { return !!getKey(p); }
  function maskK(k) { if(!k)return''; return k.length<=10?'●'.repeat(k.length):k.slice(0,4)+'●'.repeat(Math.max(4,k.length-8))+k.slice(-4); }

  // ═══════════════════════════════════════════════
  //  STATE
  // ═══════════════════════════════════════════════
  let allEmojis=[], currentEmojiPage=1;
  let allStickers=[], currentStickerPage=1;
  let allGifs=[], gifsLoaded=false, localGifStatus='';
  let currentGifPage=1;
  let activeTab='home';
  let activeEmojiSub=S.emojiSubTab||'custom';
  let favOnlyEmoji=false, favOnlyStickers=false, favOnlyGifs=false;
  let stickersLoaded=false;
  let emojiProg={loaded:0,total:EMOJI_COUNT,done:false,cached:false};
  let _rendering=false; // Prevent re-entrant rendering

  // Recent
  let recentItems=(()=>{try{return JSON.parse(GM_Get(K.recent,'[]'));}catch{return[];}})();
  function addRecent(item) {
    if(!S.recentEnabled||!item)return;
    const key=item.url||item.text||item.name;
    if(!key)return;
    recentItems=recentItems.filter(r=>(r.url||r.text||r.name)!==key);
    recentItems.unshift({url:item.url||'',name:item.name||'',text:item.text||'',type:item.type||'emoji',isText:!!item.isText,ts:Date.now()});
    if(recentItems.length>(S.recentMax||50))recentItems.length=S.recentMax||50;
    try{GM_Set(K.recent,JSON.stringify(recentItems));}catch{}
  }

  // ═══════════════════════════════════════════════
  //  FAVORITES (FIXED)
  // ═══════════════════════════════════════════════
  const _favV2={
    emoji: new Set(JSON.parse(GM_Get(K.favEmoji,'[]'))),
    sticker: new Set(JSON.parse(GM_Get(K.favSticker,'[]'))),
    gif: new Set(JSON.parse(GM_Get(K.favGif,'[]')))
  };
  const _favLeg={
    emoji: new Set(JSON.parse(GM_Get(K.favEmojiLeg,'[]'))),
    sticker: new Set(JSON.parse(GM_Get(K.favStickerLeg,'[]'))),
    gif: new Set(JSON.parse(GM_Get(K.favGifLeg,'[]')))
  };
  let favMeta=(()=>{try{return JSON.parse(GM_Get(K.favMeta,'{}'))||{};}catch{return{};}})();

  // Direct key mapping - no string construction
  const FAV_SAVE_KEYS = {
    emoji: K.favEmoji,
    sticker: K.favSticker,
    gif: K.favGif
  };
  const FAV_LEG_KEYS = {
    emoji: K.favEmojiLeg,
    sticker: K.favStickerLeg,
    gif: K.favGifLeg
  };

  function saveFavSet(type) {
    try {
      GM_Set(FAV_SAVE_KEYS[type], JSON.stringify([..._favV2[type]]));
      GM_Set(FAV_LEG_KEYS[type], JSON.stringify([..._favLeg[type]]));
    } catch(e) {
      console.error('[UE] Failed to save favorites:', e);
    }
  }
  function saveFavMeta() {
    try { GM_Set(K.favMeta, JSON.stringify(favMeta||{})); } catch {}
  }

  function isFav(type, item) {
    if(!item||!type)return false;
    const key = item.url || item.text || item.name;
    if(!key) return false;
    return (_favV2[type] && _favV2[type].has(key)) || (_favLeg[type] && _favLeg[type].has(item.name));
  }

  function favToggle(type, item) {
    if(!item||!type)return;
    const key = item.url || item.text || item.name;
    if(!key)return;

    try {
      if(isFav(type, item)) {
        // Remove
        _favV2[type].delete(key);
        _favLeg[type].delete(item.name);
        if(favMeta[key]) { delete favMeta[key]; }
      } else {
        // Add
        _favV2[type].add(key);
        favMeta[key] = { name: item.name||'', type, ts: Date.now(), isText: !!item.isText, text: item.text||'' };
      }
      saveFavSet(type);
      saveFavMeta();
    } catch(e) {
      console.error('[UE] favToggle error:', e);
    }
  }

  function sortFavFirst(arr, type) {
    const v2=_favV2[type], leg=_favLeg[type];
    if(!v2) return arr;
    return arr.slice().sort((a,b)=>{
      const ak=a.url||a.text||a.name;
      const bk=b.url||b.text||b.name;
      const af=v2.has(ak)||(leg&&leg.has(a.name));
      const bf=v2.has(bk)||(leg&&leg.has(b.name));
      return af===bf ? a.originalIndex-b.originalIndex : af?-1:1;
    });
  }

  function getFavList(tf) {
    const arr=[];
    try {
      Object.entries(favMeta).forEach(([key,m])=>{
        if(tf&&m.type!==tf)return;
        arr.push({
          url: m.isText ? '' : key,
          text: m.isText ? (m.text||m.name||key) : '',
          name: m.name||key.split('/').pop(),
          type: m.type,
          isText: !!m.isText,
          originalIndex: m.ts||0,
          animated: true
        });
      });
    } catch(e) { console.error('[UE] getFavList error:', e); }
    arr.sort((a,b)=>b.originalIndex-a.originalIndex);
    return arr;
  }

  // ═══════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════
  function hexRgba(h,a){const m=String(h).replace('#','');const s=m.length===3?m.split('').map(c=>c+c).join(''):m;const b=parseInt(s||'000000',16);return`rgba(${(b>>16)&255},${(b>>8)&255},${b&255},${Math.max(0,Math.min(1,Number(a)||1))})`;}
  function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}
  function ensurePage(len,pp,pg){const tp=Math.max(1,Math.ceil(len/pp));return{totalPages:tp,page:Math.min(Math.max(pg,1),tp)};}

  function fetchJson(url,headers){
    return new Promise((res,rej)=>{
      GM_xmlhttpRequest({
        method:'GET',url,headers:headers||{},timeout:12000,
        onload:r=>{try{res(JSON.parse(r.responseText));}catch{rej(new Error('Parse'));}},
        onerror:()=>rej(new Error('Network')),
        ontimeout:()=>rej(new Error('Timeout'))
      });
    });
  }
  function fetchText(url){
    return new Promise((res,rej)=>{
      GM_xmlhttpRequest({method:'GET',url,timeout:8000,
        onload:r=>res(r.responseText),onerror:()=>rej(new Error('Fail')),ontimeout:()=>rej(new Error('Timeout'))
      });
    });
  }

  function toArray(merged,type='emoji'){
    let idx=0;
    return Object.entries(merged).map(([name,val])=>{
      const url=val&&typeof val==='object'?(val.url||''):(val||'');
      if(!url)return null;
      return{name,url,tags:Array.isArray(val?.tags)?val.tags:[],animated:val?.animated??/\.(gif|apng)($|\?)/i.test(url),type,originalIndex:idx++};
    }).filter(Boolean);
  }

  function insertContent(item){
    if(!item)return;
    const size=item.type==='emoji'?(S.emojiSize||48):item.type==='sticker'?(S.stickerSize||256):(S.gifInsertSize||S.gifSize||256);
    let code;
    if(item.isText){
      code=item.text||item.name||'';
    } else if(S.insertFormat==='markdown') code=`![${item.name||''}](${item.url})`;
    else if(S.insertFormat==='html') code=`<img src="${item.url}" width="${size}" alt="${item.name||''}">`;
    else if(S.insertFormat==='url') code=item.url;
    else if(S.insertFormat==='custom'&&S.insertTemplate) code=S.insertTemplate.replace(/\$\{url\}/g,item.url||'').replace(/\$\{size\}/g,size).replace(/\$\{name\}/g,item.name||'');
    else code=`[img=${size}]${item.url}[/img] `;

    // Target Logic
    let input = null;

    // 1. Try specific tracker classes (previous request)
    input = document.querySelector('textarea.form__textarea.chatV2__input');

    // 2. Try IRC (The Lounge, Kiwi, generic)
    if(!input) input = document.querySelector('#input, #chat-input, .irc-input, textarea.irc-input, input.irc-input');

    // 3. Try standard Private Tracker IDs
    if (!input) {
        const ids=['chatbox__messages-create','new-comment__textarea','reply-comment','bbcode-message','bbcode-content','bbcode-signature','bbcode-about'];
        input=document.querySelector(ids.map(id=>`textarea#${id}`).join(', '));
    }

    if(!input)return;

    // Handle insertion
    if(typeof input.selectionStart==='number' && typeof input.setRangeText==='function') {
        input.setRangeText(code, input.selectionStart, input.selectionEnd, 'end');
    } else {
        input.value+=code;
    }

    input.focus();
    try{input.dispatchEvent(new Event('input',{bubbles:true}));}catch{}
    addRecent(item);
    if(S.closeOnInsert)container.style.display='none';
  }

  async function copyText(t){
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(t);return;}}catch{}
    try{if(typeof GM_setClipboard==='function'){GM_setClipboard(t,'text');return;}}catch{}
    const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
  }

  // Lazy loading
  let _lo=null;
  function lazyObs(){
    if(_lo)return _lo;
    _lo=new IntersectionObserver(entries=>{
      for(const e of entries)if(e.isIntersecting&&e.target.dataset.src){e.target.src=e.target.dataset.src;delete e.target.dataset.src;_lo.unobserve(e.target);}
    },{rootMargin:`${S.lazyLoadThreshold||150}px`});
    return _lo;
  }
  function mkImg(url,alt){
    const img=document.createElement('img');img.alt=alt||'';
    if(S.showTooltips)img.title=alt||'';
    img.dataset.src=url;img.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    lazyObs().observe(img);return img;
  }
  function destroyLazy(){if(_lo){_lo.disconnect();_lo=null;}}

  // Context menu (FIXED - proper cleanup)
  let ctxEl=null;
  let _ctxHideHandler=null;

  function hideCtx(){if(ctxEl)ctxEl.style.display='none';}

  function showCtx(items,x,y){
    if(!ctxEl){
      ctxEl=document.createElement('div');ctxEl.id='uni-ctx-menu';
      ctxEl.addEventListener('contextmenu',e=>e.preventDefault());
      document.body.appendChild(ctxEl);
      _ctxHideHandler=e=>{
        if(ctxEl&&ctxEl.style.display!=='none'&&!ctxEl.contains(e.target)){
          hideCtx();
        }
      };
      document.addEventListener('mousedown',_ctxHideHandler,true);
      window.addEventListener('scroll',hideCtx,true);
      document.addEventListener('keydown',e=>{if(e.key==='Escape')hideCtx();});
    }
    ctxEl.innerHTML='';
    (items||[]).forEach(it=>{
      const b=document.createElement('button');
      b.innerHTML=it.icon?`<i class="fa-solid ${it.icon}"></i> ${it.label}`:it.label;
      b.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        hideCtx();
        // Use setTimeout to prevent the click from interfering with current rendering
        setTimeout(()=>{
          try{it.onClick?.();}catch(err){console.error('[UE] ctx action error:',err);}
        },0);
      });
      ctxEl.appendChild(b);
    });
    ctxEl.style.display='block';
    requestAnimationFrame(()=>{
      if(!ctxEl)return;
      const r=ctxEl.getBoundingClientRect();
      ctxEl.style.left=Math.min(x,innerWidth-r.width-8)+'px';
      ctxEl.style.top=Math.min(y,innerHeight-r.height-8)+'px';
    });
  }

  function notice(msg){
    let n=document.getElementById('uni-notice');
    if(!n){
      n=document.createElement('div');n.id='uni-notice';
      Object.assign(n.style,{position:'absolute',top:'6px',left:'12px',right:'12px',
        background:'rgba(0,0,0,.7)',color:'#fff',padding:'8px 14px',borderRadius:'8px',
        fontSize:'12px',zIndex:'20',pointerEvents:'none',textAlign:'center',transition:'opacity .3s'});
      container.appendChild(n);
    }
    n.textContent=msg;n.style.display='block';n.style.opacity='1';
    clearTimeout(n._t);
    n._t=setTimeout(()=>{n.style.opacity='0';setTimeout(()=>n.style.display='none',300);},3500);
  }

  // ═══════════════════════════════════════════════
  //  DOM
  // ═══════════════════════════════════════════════
  const old=document.getElementById('uni-emoji-menu');if(old)old.remove();
  const container=document.createElement('div');container.id='uni-emoji-menu';document.body.appendChild(container);

  // ═══════════════════════════════════════════════
  //  CSS
  // ═══════════════════════════════════════════════
  function cssVars(){
    const s=S;
    return`#uni-emoji-menu{--mw:${s.menuWidth}px;--mh:${s.menuHeightPx}px;--mvh:${s.menuMaxHeightVh}vh;--mr:${s.menuRadius}px;--tr:${s.tileRadius}px;--bg:${hexRgba(s.bg,s.bgAlpha)};--txt:${s.text};--acc:${s.accent};--bc:${s.borderColor};--bw:${s.borderWidth}px;--sh:${s.shadow};--et:${s.emojiSize}px;--gh:${s.gifSize}px;--gmc:${s.gifMinCol}px;--ge:${s.gapEmoji}px;--gl:${s.gapLarge}px;--ff:${s.fontFamily};--fs:${s.uiFontSize}px;--tbg:${s.tileBg};--hs:${s.hoverScale};--gs:${s.glowStrength}px;--sc:${s.starColor};--sbg:${s.starBg};--sbc:${s.starBorder};--st:${s.starTop}px;--sr:${s.starRight}px;--ss:${s.starSize}px;--sss:${s.starSmSize}px;--br:${s.btnRadius}px;--xr:${s.searchRadius}px;--xb:${s.searchBorder};--pb:${s.paginationBg};--pab:${s.paginationActiveBg};--pc:${s.paginationColor};--blur:${s.backdropBlur}px;--z:${s.zIndex};--sbw:${s.scrollbarWidth}px;--sbth:${s.scrollbarThumb};--sbt:${s.scrollbarTrack}}`;
  }

  const CSS=`
#uni-emoji-menu{position:fixed;left:60%;top:10%;width:var(--mw);height:var(--mh);max-height:var(--mvh);background:var(--bg);color:var(--txt);border-radius:var(--mr);border:var(--bw) solid var(--bc);box-shadow:0 8px 24px rgba(0,0,0,var(--sh));padding:10px;display:none;font-family:var(--ff);font-size:var(--fs);user-select:none;flex-direction:column;z-index:var(--z);backdrop-filter:blur(var(--blur));overflow:hidden;box-sizing:border-box}
#uni-emoji-menu *{box-sizing:border-box}
#uni-emoji-menu ::-webkit-scrollbar{width:var(--sbw)}
#uni-emoji-menu ::-webkit-scrollbar-track{background:var(--sbt);border-radius:2px}
#uni-emoji-menu ::-webkit-scrollbar-thumb{background:var(--sbth);border-radius:2px}
#uni-emoji-menu ::-webkit-scrollbar-thumb:hover{background:var(--acc)}
#uni-emoji-menu .hdr{display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:4px;min-height:26px}
#uni-emoji-menu .hdr .title{font-weight:700;font-size:15px;display:flex;align-items:center;gap:6px}
#uni-emoji-menu .hdr .ver{color:#888;font-size:11px;font-weight:600}
#uni-emoji-menu .hdr .dot{width:7px;height:7px;border-radius:50%;background:#43b581;box-shadow:0 0 5px #43b581;display:inline-block}
#uni-emoji-menu .hdr .drag{position:absolute;left:6px;cursor:move;color:#aaa;font-size:18px}
#uni-emoji-menu .hdr .close{position:absolute;right:6px;cursor:pointer;color:#ff7373;font-size:16px;background:none;border:none;line-height:1}
#uni-emoji-menu .tabs{display:flex;gap:4px;margin:2px 0 4px;flex-wrap:wrap}
#uni-emoji-menu .tab{font-weight:600;font-size:12px;color:#ccc;background:none;border:none;border-radius:7px;padding:4px 10px;cursor:pointer;opacity:.7;transition:all .15s;display:flex;align-items:center;gap:5px;white-space:nowrap}
#uni-emoji-menu .tab:hover{background:#46484c;opacity:1}
#uni-emoji-menu .tab.active{background:#46484c;opacity:1;color:#fff}
#uni-emoji-menu .tab.st{margin-left:auto}
#uni-emoji-menu .toolbar{display:flex;align-items:center;gap:6px;margin:2px 6px;flex-wrap:wrap}
#uni-emoji-menu .search-row{display:flex;margin:2px 0 6px}
#uni-emoji-menu #uni-search{position:sticky;top:0;background:rgba(255,255,255,.03);color:var(--txt);height:32px;border:2px solid var(--xb);border-radius:var(--xr);width:100%;padding:5px 10px;font-size:12px;transition:all .15s}
#uni-emoji-menu #uni-search::placeholder{color:#777}
#uni-emoji-menu #uni-search:focus{background:rgba(255,255,255,.05);box-shadow:0 0 5px var(--acc);outline:none}
#uni-emoji-menu .sub-tabs{display:flex;gap:3px;margin:2px 4px 4px;flex-wrap:wrap}
#uni-emoji-menu .sub-tab{font-size:11px;font-weight:600;color:#bbb;background:#1a1b1e;border:1px solid var(--bc);border-radius:6px;padding:3px 8px;cursor:pointer;transition:all .12s;display:flex;align-items:center;gap:4px}
#uni-emoji-menu .sub-tab:hover{background:#2a2c30;color:#fff}
#uni-emoji-menu .sub-tab.active{background:var(--acc);color:#fff;border-color:var(--acc)}
#uni-emoji-menu .eg{display:grid;grid-template-columns:repeat(auto-fill,var(--et));gap:var(--ge);overflow-y:auto;flex:1;padding:4px 4px 8px;justify-content:start;}
#uni-emoji-menu .et{position:relative;width:var(--et);height:var(--et);display:flex;align-items:center;justify-content:center;background:var(--tbg);border-radius:6px;transition:transform .1s,box-shadow .1s; overflow: hidden;}
#uni-emoji-menu .et img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;cursor:pointer}
#uni-emoji-menu .et:hover{transform:scale(var(--hs));box-shadow:0 0 var(--gs) var(--acc)}
#uni-emoji-menu .et .te{cursor:pointer;line-height:1;text-align:center;width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
#uni-emoji-menu .sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:var(--gl);overflow-y:auto;flex:1;padding:6px 4px 10px;position:relative}
#uni-emoji-menu .gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--gmc),1fr));gap:var(--gl);overflow-y:auto;flex:1;padding:6px 4px 10px;position:relative}
#uni-emoji-menu .tl{position:relative;width:100%;height:var(--gh);background:var(--tbg);border-radius:var(--tr);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .1s,box-shadow .1s;overflow:hidden}
#uni-emoji-menu .tl img{max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--tr);cursor:pointer}
#uni-emoji-menu .tl:hover{transform:scale(var(--hs));box-shadow:0 0 var(--gs) var(--acc)}
#uni-emoji-menu .star,#uni-emoji-menu .ssm{position:absolute;top:var(--st);right:var(--sr);display:grid;place-items:center;background:var(--sbg);border:1px solid var(--sbc);color:var(--sc);border-radius:999px;cursor:pointer;line-height:1;opacity:0;transform:scale(.9);pointer-events:none;transition:opacity .12s,transform .12s}
#uni-emoji-menu .star{width:var(--ss);height:var(--ss);font-size:calc(var(--ss)*.55)}
#uni-emoji-menu .ssm{width:var(--sss);height:var(--sss);font-size:calc(var(--sss)*.55)}
#uni-emoji-menu .et:hover .ssm,#uni-emoji-menu .tl:hover .star{opacity:1;transform:scale(1);pointer-events:auto}
#uni-emoji-menu .star.active,#uni-emoji-menu .ssm.active{opacity:.6;pointer-events:auto}
#uni-emoji-menu .gt{position:absolute;left:5px;right:5px;bottom:5px;font-size:10px;color:#fff;background:rgba(0,0,0,.45);padding:2px 5px;border-radius:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none}
#uni-emoji-menu .pill{background:#202225;border:1px solid var(--bc);color:#ddd;border-radius:var(--br);padding:4px 9px;cursor:pointer;font-weight:600;font-size:11px;transition:background .12s;display:flex;align-items:center;gap:4px}
#uni-emoji-menu .pill.active{background:var(--acc);border-color:var(--acc);color:#fff}
#uni-emoji-menu .pill:hover{background:#36393f}
#uni-emoji-menu .pb{background:#202225;border:1px solid var(--bc);color:#ddd;border-radius:var(--br);padding:4px 8px;cursor:pointer;font-weight:600;font-size:11px;transition:background .12s}
#uni-emoji-menu .pb:hover{background:#36393f}
#uni-emoji-menu .pb.active{background:var(--acc);color:#fff;border-color:var(--acc)}
#uni-emoji-menu .pager{display:flex;justify-content:center;gap:3px;margin-top:4px;flex-wrap:wrap}
#uni-emoji-menu .pager button{background:var(--pb);border:none;border-radius:3px;color:var(--pc);padding:4px 8px;font-size:12px;cursor:pointer;min-width:28px;font-weight:600;transition:all .15s}
#uni-emoji-menu .pager button:hover:not(.active){background:#36393f;color:#fff;box-shadow:0 0 4px var(--acc)}
#uni-emoji-menu .pager button.active{background:var(--pab);color:#fff;box-shadow:0 0 6px var(--acc)}
#uni-emoji-menu .pj{display:flex;justify-content:center;gap:5px;margin-top:5px}
#uni-emoji-menu .pj input{width:65px;padding:4px;font-size:12px;border:none;border-radius:12px;background:#202225;color:#ddd;text-align:center}
#uni-emoji-menu .pj button{background:var(--acc);border:none;border-radius:4px;padding:4px 10px;color:#fff;font-weight:600;font-size:12px;cursor:pointer}
#uni-emoji-menu .panel{display:none;overflow-y:auto;flex:1;padding:8px 6px}
#uni-emoji-menu .section{background:rgba(0,0,0,.15);border:1px solid var(--bc);border-radius:9px;padding:10px;margin:6px 0}
#uni-emoji-menu .section h3{margin:0 0 6px;font-size:13px;color:#fff;display:flex;align-items:center;gap:6px}
#uni-emoji-menu .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:3px 0}
#uni-emoji-menu .btn{background:var(--acc);border:none;border-radius:7px;padding:4px 10px;color:#fff;font-weight:600;font-size:11px;cursor:pointer;transition:filter .12s;display:inline-flex;align-items:center;gap:4px}
#uni-emoji-menu .btn.sec{background:#202225;border:1px solid var(--bc);color:#ddd}
#uni-emoji-menu .btn.warn{background:#b93131}
#uni-emoji-menu .btn:hover{filter:brightness(.9)}
#uni-emoji-menu .badge{font-size:10px;margin-left:4px}
#uni-emoji-menu .badge-ok{color:#43b581}
#uni-emoji-menu .badge-err{color:#ff6464}
#uni-emoji-menu .badge-warn{color:#faa61a}
#uni-emoji-menu .empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;opacity:.8;padding:14px;font-size:13px}
#uni-emoji-menu .home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:6px}
#uni-emoji-menu .home-card{background:rgba(0,0,0,.15);border:1px solid var(--bc);border-radius:7px;padding:9px}
#uni-emoji-menu .home-card h4{margin:0 0 5px;font-size:12px;display:flex;align-items:center;gap:5px}
#uni-emoji-menu .chip{display:inline-block;background:#202225;border:1px solid var(--bc);border-radius:999px;padding:2px 7px;font-size:10px;margin:1px 3px 1px 0}
#uni-emoji-menu .link-btn{display:inline-flex;align-items:center;gap:5px;background:#202225;border:1px solid var(--bc);color:#ddd;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .12s}
#uni-emoji-menu .link-btn:hover{background:#36393f;color:#fff;border-color:var(--acc)}
#uni-emoji-menu .stat-num{font-size:18px;font-weight:700;color:var(--acc);margin-right:4px}
#uni-emoji-menu .api-disp{font-family:monospace;font-size:11px;color:#888;background:#1a1b1e;border:1px solid var(--bc);border-radius:5px;padding:4px 7px;word-break:break-all}
#uni-emoji-menu .api-disp.has{color:#43b581}
#uni-emoji-menu input.api-key{width:100%;padding:5px 7px;border:1px solid var(--bc);border-radius:5px;background:#1a1b1e;color:#e3e5e8;font-size:12px}
#uni-emoji-menu input.mini{width:70px;padding:3px 5px;border:1px solid var(--bc);border-radius:5px;background:#1a1b1e;color:#e3e5e8;font-size:12px}
#uni-emoji-menu input.fi{width:100%;max-width:350px;padding:4px 7px;border:1px solid var(--bc);border-radius:5px;background:#1a1b1e;color:#e3e5e8;font-size:12px}
#uni-emoji-menu input[type="color"]{width:28px;height:24px;padding:0;border:none;border-radius:5px;cursor:pointer}
#uni-emoji-menu select.sel{padding:4px 7px;border-radius:5px;border:1px solid var(--bc);background:#202225;color:#e3e5e8;font-size:12px}
#uni-emoji-menu .range{display:flex;align-items:center;gap:6px}
#uni-emoji-menu .range input[type="range"]{flex:1;max-width:180px}
#uni-emoji-menu .range .rv{min-width:42px;text-align:right;font-size:11px;opacity:.7}
#uni-emoji-menu textarea.area{width:100%;min-height:80px;background:#1f2124;color:#e8e8e8;border:1px solid var(--bc);border-radius:7px;padding:6px;font-size:11px;resize:vertical}
#uni-emoji-menu label.cb{display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer}
#uni-emoji-menu .recent-grid{display:grid;grid-template-columns:repeat(auto-fill,44px);gap:5px;padding:4px 0}
#uni-emoji-menu .recent-grid img,.recent-grid .ri{width:44px;height:44px;object-fit:contain;border-radius:5px;cursor:pointer;background:var(--tbg);display:flex;align-items:center;justify-content:center;}
#uni-emoji-menu .recent-grid img:hover,.recent-grid .ri:hover{transform:scale(1.1);box-shadow:0 0 6px var(--acc)}
#uni-ctx-menu{position:fixed;z-index:2147483647;background:#2b2d31;color:#e3e5e8;border:1px solid #2a2c30;border-radius:7px;min-width:170px;box-shadow:0 8px 28px rgba(0,0,0,.5);padding:3px;display:none}
#uni-ctx-menu button{width:100%;text-align:left;background:transparent;border:none;color:#e3e5e8;padding:6px 9px;border-radius:5px;cursor:pointer;font-weight:600;font-size:11px;display:flex;align-items:center;gap:6px}
#uni-ctx-menu button:hover{background:#3a3c43}
#uni-ctx-menu button i{width:14px;text-align:center;font-size:11px;opacity:.8}
#global-emoji-button.emoji-button{position:fixed;right:15px;bottom:35px;z-index:2147483647;cursor:pointer;font-size:38px;display:inline-flex;align-items:center;justify-content:center;transition:transform .2s,filter .2s;user-select:none;filter:grayscale(100%)}
#global-emoji-button.emoji-button:hover{transform:scale(1.1);filter:grayscale(0%)}
`;

  GM_addStyle(cssVars()+CSS);
  let _vt=null;
  function applyVars(){
    if(!_vt){_vt=document.createElement('style');_vt.id='uni-vars';document.head.appendChild(_vt);}
    _vt.textContent=cssVars();
    container.classList.toggle('compact',!!S.compactMode);
    if(S.menuPositionX)container.style.left=S.menuPositionX;
    if(S.menuPositionY)container.style.top=S.menuPositionY;
  }
  function applyCustomCss(css){let t=document.getElementById('uni-custom-css');if(!t){t=document.createElement('style');t.id='uni-custom-css';document.head.appendChild(t);}t.textContent=css||'';GM_Set(K.customCss,css||'');}
  {const c=GM_Get(K.customCss,'');if(c?.trim())applyCustomCss(c);}

  // ═══════════════════════════════════════════════
  //  HTML SKELETON
  // ═══════════════════════════════════════════════
  container.innerHTML=`
<div class="hdr">
<span class="drag" title="Drag"><i class="fa-solid fa-arrows-up-down-left-right"></i></span>
  <span class="title"><i><img src="https://ptpimg.me/91xfz9.gif" style="width: 27px; height: 25px;" /></i> Ultimate Emojis <span class="ver">v${VERSION}</span> <span class="dot"></span></span>
<button class="close" title="Close"><i class="fa-solid fa-xmark"></i></button>
</div>
<div class="tabs" id="tb"></div>
<div class="panel" id="p-home"></div>
<div class="toolbar" id="tb-e" style="display:none"><button class="pill" id="e-fav"><i class="fa-solid fa-star" style="color: #e7a423;"></i></button><span style="flex:1"></span><span class="badge" id="e-st"></span></div>
<div class="sub-tabs" id="e-subs" style="display:none"></div>
<div class="search-row" id="sr" style="display:none"><input type="text" id="uni-search" placeholder="Search..." autocomplete="off"></div>
<div class="eg" id="ge" style="display:none"></div>
<div class="toolbar" id="tb-g" style="display:none">
<span style="opacity:.5;font-size:10px"><i class="fa-solid fa-globe"></i></span>
<button class="pb" data-p="local"><i class="fa-solid fa-hard-drive"></i> Local</button>
<button class="pb" data-p="tenor"><i class="fa-solid fa-t"></i> Tenor</button>
<button class="pb" data-p="giphy"><i class="fa-solid fa-g"></i> GIPHY</button>
<button class="pb" data-p="imgur"><i class="fa-solid fa-image"></i> Imgur</button>
<button class="pb" data-p="reddit"><i class="fa-brands fa-reddit"></i> Reddit</button>
<button class="pb" data-p="tumblr"><i class="fa-brands fa-tumblr"></i> Tumblr</button>
<span style="flex:1"></span>
<button class="pill" id="g-fav"><i class="fa-solid fa-star" style="color: #e7a423;"></i></button>
</div>
<div class="toolbar" id="tb-s" style="display:none"><button class="pill" id="s-fav"><i class="fa-solid fa-star" style="color: #e7a423;"></i></button></div>
<div class="sg" id="gs" style="display:none"></div>
<div class="gg" id="gg" style="display:none"></div>
<div class="pager" id="pager" style="display:none"></div>
<div class="pj" id="pj" style="display:none"><input type="number" id="pji" min="1" placeholder="Pg"><button id="pjg">Go</button></div>
<div class="panel" id="p-set" style="display:none"></div>
`;

  const $=s=>container.querySelector(s);
  const gE=$('#ge'),gS=$('#gs'),gG=$('#gg');
  const pager=$('#pager'),pjDiv=$('#pj'),pjIn=$('#pji'),pjGo=$('#pjg');
  const searchIn=$('#uni-search'),sRow=$('#sr');
  const tbE=$('#tb-e'),tbG=$('#tb-g'),tbS=$('#tb-s');
  const eSubs=$('#e-subs');
  const hPanel=$('#p-home'),sPanel=$('#p-set');
  const tabBar=$('#tb');
  const eSt=$('#e-st');

  // ═══════════════════════════════════════════════
  //  TABS
  // ═══════════════════════════════════════════════
  const TAB_D={home:{l:'Home',i:'fa-house'},gifs:{l:'GIFs',i:'fa-film'},stickers:{l:'Stickers',i:'fa-note-sticky'},emojis:{l:'Emojis',i:'fa-face-smile'},recent:{l:'Recent',i:'fa-clock-rotate-left'}};

  function buildTabs(){
    tabBar.innerHTML='';
    const ord=(S.tabOrder||'home,gifs,stickers,emojis').split(',').map(s=>s.trim()).filter(Boolean);
    if(S.recentEnabled&&!ord.includes('recent'))ord.push('recent');
    ord.forEach(k=>{const d=TAB_D[k];if(!d)return;const b=document.createElement('div');b.className='tab'+(k===activeTab?' active':'');b.dataset.tab=k;b.innerHTML=`<i class="fa-solid ${d.i}"></i> ${d.l}`;b.addEventListener('click',()=>switchTab(k));tabBar.appendChild(b);});
    const sb=document.createElement('div');sb.className='tab st'+(activeTab==='settings'?' active':'');sb.dataset.tab='settings';sb.innerHTML='<i class="fa-solid fa-gear"></i>';sb.addEventListener('click',()=>switchTab('settings'));tabBar.appendChild(sb);
  }
  function setTabUI(t){tabBar.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));}
  function hideAll(){[hPanel,gE,gS,gG,sPanel].forEach(e=>e.style.display='none');[tbE,tbG,tbS,sRow,pager,pjDiv,eSubs].forEach(e=>e.style.display='none');}

  // ═══════════════════════════════════════════════
  //  PAGINATION
  // ═══════════════════════════════════════════════
  function renderPager(total,cur,goTo){
    pager.innerHTML='';pager.style.display='';pjDiv.style.display='';
    total=Math.max(1,total);
    const mk=(l,fn,act=false)=>{const b=document.createElement('button');b.textContent=l;if(act)b.classList.add('active');b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn();});return b;};
    if(cur>1)pager.appendChild(mk('‹',()=>goTo(cur-1)));
    let s=Math.max(1,cur-3),e=Math.min(total,s+6);if(e-s<6)s=Math.max(1,e-6);
    if(s>1){pager.appendChild(mk('1',()=>goTo(1)));if(s>2)pager.appendChild(mk('…',()=>{}));}
    for(let i=s;i<=e;i++)pager.appendChild(mk(String(i),()=>goTo(i),i===cur));
    if(e<total){if(e<total-1)pager.appendChild(mk('…',()=>{}));pager.appendChild(mk(String(total),()=>goTo(total)));}
    if(cur<total)pager.appendChild(mk('›',()=>goTo(cur+1)));
  }

  // ═══════════════════════════════════════════════
  //  EMOJI LOADING
  // ═══════════════════════════════════════════════
  async function fetchFast(urls){for(const u of urls){try{return await fetchJson(u);}catch{}}throw new Error('All failed');}

  async function loadEmojis(){
    const ts=Number(GM_Get(K.emojiCacheTs,'0'));
    if(Date.now()-ts<CACHE_TTL){
      try{const c=JSON.parse(GM_Get(K.emojiCache,'null'));if(c&&Object.keys(c).length>0){allEmojis=toArray(c,'emoji');emojiProg={loaded:EMOJI_COUNT,total:EMOJI_COUNT,done:true,cached:true};updEmojiUI();return;}}catch{}
    }
    emojiProg={loaded:0,total:EMOJI_COUNT,done:false,cached:false};updEmojiUI();
    const all=[],BATCH=8;
    for(let b=0;b<EMOJI_URL_GROUPS.length;b+=BATCH){
      const chunk=EMOJI_URL_GROUPS.slice(b,b+BATCH);
      const res=await Promise.allSettled(chunk.map(g=>fetchFast(g)));
      res.forEach(r=>{if(r.status==='fulfilled'&&r.value)all.push(r.value);emojiProg.loaded++;});
      updEmojiUI();
      if(all.length>0){allEmojis=toArray(Object.assign({},...all),'emoji');if(activeTab==='emojis'&&activeEmojiSub==='custom'&&!_rendering)showEmojiPage(currentEmojiPage);}
    }
    if(all.length>0){const m=Object.assign({},...all);allEmojis=toArray(m,'emoji');try{GM_Set(K.emojiCache,JSON.stringify(m));GM_Set(K.emojiCacheTs,String(Date.now()));}catch{}}
    emojiProg.done=true;updEmojiUI();
  }
  function updEmojiUI(){
    if(!eSt)return;
    const{loaded,total,done,cached}=emojiProg;
    eSt.innerHTML=done?`<i class="fa-solid fa-circle-check"></i> ${allEmojis.length}${cached?' (cached)':''}`:`<i class="fa-solid fa-spinner fa-spin"></i> ${loaded}/${total}`;
    eSt.className='badge '+(done?'badge-ok':'badge-warn');
  }

  async function loadStickers(){try{const r=await Promise.all(STICKERS_JSON_URLS.map(u=>fetchJson(u)));allStickers=toArray(Object.assign({},...r.filter(Boolean)),'sticker');}catch(e){console.error('Stickers:',e);}stickersLoaded=true;}

  async function loadLocalGifs(){
    const urls=String(S.localGifUrls||'').split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean);
    if(!urls.length){allGifs=[];gifsLoaded=true;localGifStatus='No packs';return;}
    try{const r=await Promise.allSettled(urls.map(u=>fetchJson(u)));const ok=r.filter(r=>r.status==='fulfilled').map(r=>r.value);allGifs=toArray(Object.assign({},...ok),'gif');gifsLoaded=true;localGifStatus=`${ok.length}/${urls.length} loaded`;}
    catch{allGifs=[];gifsLoaded=true;localGifStatus='Failed';}
  }

  // ═══════════════════════════════════════════════
  //  EMOJI SUB-CATEGORY DATA
  // ═══════════════════════════════════════════════
  function getSubData(){
    if(activeEmojiSub==='custom')return allEmojis;
    let items=[],idx=0;
    if(activeEmojiSub==='emojipedia'){
      Object.entries(EMOJIPEDIA).forEach(([grp,emojis])=>{
        if(!emojis)return;
        emojis.forEach(e=>{if(e)items.push({name:e,url:'',text:e,isText:true,tags:[grp.toLowerCase()],type:'emoji',originalIndex:idx++,animated:false});});
      });
    } else if(activeEmojiSub==='symbols'){
      Object.entries(SYMBOL_DATA).forEach(([grp,emojis])=>{
        if(!emojis)return;
        emojis.forEach(e=>{if(e)items.push({name:e,url:'',text:e,isText:true,tags:[grp.toLowerCase()],type:'emoji',originalIndex:idx++,animated:false});});
      });
    } else if(activeEmojiSub==='flags'){
      if(FLAG_DATA)FLAG_DATA.forEach((e,i)=>{if(e)items.push({name:e,url:'',text:e,isText:true,tags:['flag'],type:'emoji',originalIndex:i,animated:false});});
    } else if(activeEmojiSub==='kaomoji'){
      Object.entries(KAOMOJI).forEach(([grp,kms])=>{
        kms.forEach(k=>{items.push({name:k,url:'',text:k,isText:true,tags:[grp.toLowerCase(),'kaomoji'],type:'emoji',originalIndex:idx++,animated:false});});
      });
    } else if(activeEmojiSub==='ascii'){
      ASCII_ART.forEach((a,i)=>{items.push({name:a,url:'',text:a,isText:true,tags:['ascii'],type:'emoji',originalIndex:i,animated:false});});
    }
    return items;
  }

  function buildSubTabs(){
    eSubs.innerHTML='';
    Object.entries(EMOJI_CATS).forEach(([id,cat])=>{
      const b=document.createElement('div');
      b.className='sub-tab'+(activeEmojiSub===id?' active':'');
      b.innerHTML=`<i class="fa-solid ${cat.icon}"></i> ${cat.label}`;
      b.title=cat.desc;
      b.addEventListener('click',()=>{activeEmojiSub=id;S.emojiSubTab=id;saveS();showEmojiPage(1);});
      eSubs.appendChild(b);
    });
  }

  // ═══════════════════════════════════════════════
  //  EMOJI PAGE (FIXED - guard against re-entrant)
  // ═══════════════════════════════════════════════
  function showEmojiPage(page){
    if(_rendering)return;
    _rendering=true;
    try{
      activeTab='emojis';setTabUI('emojis');hideAll();
      tbE.style.display='';eSubs.style.display='';sRow.style.display='';gE.style.display='';
      buildSubTabs();

      const pp=S.emojiPerPage||108;
      const term=searchIn.value.trim().toLowerCase();
      let data=getSubData();

      if(term)data=data.filter(e=>e.name.toLowerCase().includes(term)||(e.tags&&e.tags.some(t=>String(t).toLowerCase().includes(term))));
      if(favOnlyEmoji)data=data.filter(e=>isFav('emoji',e));
      if(activeEmojiSub==='custom')data=sortFavFirst(data,'emoji');

      const{totalPages,page:p}=ensurePage(data.length,pp,page);
      currentEmojiPage=p;
      const items=data.slice((p-1)*pp,p*pp);
      const frag=document.createDocumentFragment();
      gE.innerHTML='';

      items.forEach(item=>{
        const tile=document.createElement('div');tile.className='et';

        if(item.isText){
          const span=document.createElement('span');span.className='te';span.textContent=item.text||item.name;
          if(S.showTooltips)span.title=item.name;span.style.cursor='pointer';
          span.addEventListener('click',e=>{e.stopPropagation();insertContent(item);tile.style.opacity='.5';setTimeout(()=>tile.style.opacity='1',180);});
          span.addEventListener('contextmenu',e=>{
            e.preventDefault();e.stopPropagation();
            showCtx([
              {icon:'fa-copy',label:'Copy',onClick:()=>{copyText(item.text||item.name);notice('Copied!');}},
              {icon:'fa-star',label:isFav('emoji',item)?'Unfavorite':'Favorite',onClick:()=>{favToggle('emoji',item);showEmojiPage(currentEmojiPage);}}
            ],e.clientX,e.clientY);
          });
          tile.appendChild(span);
        } else {
          const img=mkImg(item.url,item.name);
          img.addEventListener('click',e=>{e.stopPropagation();insertContent(item);tile.style.opacity='.5';setTimeout(()=>tile.style.opacity='1',180);});
          img.addEventListener('contextmenu',e=>{
            e.preventDefault();e.stopPropagation();
            showCtx([
              {icon:'fa-star',label:isFav('emoji',item)?'Unfavorite':'Favorite',onClick:()=>{favToggle('emoji',item);showEmojiPage(currentEmojiPage);}},
              {icon:'fa-link',label:'Copy URL',onClick:()=>{copyText(item.url);notice('Copied!');}},
              {icon:'fa-code',label:'Copy BBCode',onClick:()=>{copyText(`[img=${S.emojiSize}]${item.url}[/img]`);notice('Copied!');}}
            ],e.clientX,e.clientY);
          });
          tile.appendChild(img);
          const star=document.createElement('button');star.className='ssm'+(isFav('emoji',item)?' active':'');
          star.innerHTML='<i class="fa-solid fa-star"></i>';
          star.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();favToggle('emoji',item);showEmojiPage(currentEmojiPage);});
          tile.appendChild(star);
        }
        frag.appendChild(tile);
      });

      gE.appendChild(frag);
      if(!items.length)gE.innerHTML='<div class="empty"><i class="fa-solid fa-ghost"></i>&nbsp; No emojis found</div>';
      renderPager(totalPages,currentEmojiPage,p=>showEmojiPage(p));
      searchIn.placeholder=`Search ${EMOJI_CATS[activeEmojiSub]?.label||'emojis'}…`;
      $('#e-fav').classList.toggle('active',favOnlyEmoji);
      updEmojiUI();
    } catch(err) {
      console.error('[UE] showEmojiPage error:', err);
      gE.innerHTML='<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i> Render error</div>';
    } finally {
      _rendering=false;
    }
  }

  // ═══════════════════════════════════════════════
  //  STICKER PAGE
  // ═══════════════════════════════════════════════
  function showStickerPage(page){
    if(_rendering)return;_rendering=true;
    try{
      activeTab='stickers';setTabUI('stickers');hideAll();
      tbS.style.display='';sRow.style.display='';gS.style.display='';
      if(!stickersLoaded){gS.innerHTML='<div class="empty"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>';return;}
      const pp=S.stickerPerPage||24;const term=searchIn.value.trim().toLowerCase();
      let list=term?allStickers.filter(e=>e.name.toLowerCase().includes(term)||(e.tags&&e.tags.some(t=>String(t).toLowerCase().includes(term)))):allStickers;
      if(favOnlyStickers)list=list.filter(e=>isFav('sticker',e));
      list=sortFavFirst(list,'sticker');
      const{totalPages,page:p}=ensurePage(list.length,pp,page);
      currentStickerPage=p;const items=list.slice((p-1)*pp,p*pp);
      const frag=document.createDocumentFragment();gS.innerHTML='';
      items.forEach(item=>{
        const tile=document.createElement('div');tile.className='tl';
        const img=mkImg(item.url,item.name);
        img.addEventListener('click',e=>{e.stopPropagation();insertContent(item);tile.style.opacity='.5';setTimeout(()=>tile.style.opacity='1',180);});
        img.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();showCtx([{icon:'fa-star',label:isFav('sticker',item)?'Unfavorite':'Favorite',onClick:()=>{favToggle('sticker',item);showStickerPage(currentStickerPage);}},{icon:'fa-link',label:'Copy URL',onClick:()=>{copyText(item.url);notice('Copied!');}}],e.clientX,e.clientY);});
        const star=document.createElement('button');star.className='star'+(isFav('sticker',item)?' active':'');star.innerHTML='<i class="fa-solid fa-star"></i>';
        star.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();favToggle('sticker',item);showStickerPage(currentStickerPage);});
        tile.appendChild(img);tile.appendChild(star);frag.appendChild(tile);
      });
      gS.appendChild(frag);
      if(!items.length)gS.innerHTML='<div class="empty"><i class="fa-solid fa-ghost"></i>&nbsp; No stickers</div>';
      renderPager(totalPages,currentStickerPage,p=>showStickerPage(p));
      searchIn.placeholder='Search stickers…';
      $('#s-fav').classList.toggle('active',favOnlyStickers);
    }catch(err){console.error('[UE] showStickerPage error:',err);}
    finally{_rendering=false;}
  }

  // ═══════════════════════════════════════════════
  //  GIF PROVIDERS
  // ═══════════════════════════════════════════════
  const tenorCache=new Map();
  async function fetchTenorPage(q,page,limit){
    const key=getKey('tenor');if(!key)throw new Error('No Tenor API key');
    const ck=`${q}::${limit}`;if(!tenorCache.has(ck))tenorCache.set(ck,{pages:new Map(),next:new Map()});
    const st=tenorCache.get(ck);
    if(st.pages.has(page))return{items:st.pages.get(page),hasNext:!!st.next.get(page)};
    for(let p=1;p<=page;p++){
      if(st.pages.has(p))continue;
      const pos=p===1?null:st.next.get(p-1)||null;
      const ep=q?'search':'featured';
      const params=[`key=${encodeURIComponent(key)}`,`limit=${limit}`,'media_filter=gif','contentfilter=medium'];
      if(q)params.push(`q=${encodeURIComponent(q)}`);if(pos)params.push(`pos=${encodeURIComponent(pos)}`);
      const json=await fetchJson(`https://tenor.googleapis.com/v2/${ep}?${params.join('&')}`);
      const items=(json?.results||[]).map((r,i)=>{const mf=r.media_formats||{};return{name:r.content_description||'tenor',url:mf.gif?.url||mf.mediumgif?.url||mf.tinygif?.url||'',tags:[],animated:true,type:'gif',originalIndex:i};}).filter(x=>x.url);
      st.pages.set(p,items);st.next.set(p,json?.next||'');
    }
    return{items:st.pages.get(page)||[],hasNext:!!st.next.get(page)};
  }
  async function fetchGiphy({q,page,limit}){const key=getKey('giphy');if(!key)throw new Error('No GIPHY key');const off=(page-1)*limit;const ep=q?`search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${off}&rating=pg-13`:`trending?api_key=${encodeURIComponent(key)}&limit=${limit}&offset=${off}&rating=pg-13`;const json=await fetchJson(`https://api.giphy.com/v1/gifs/${ep}`);const data=json?.data||[];const total=Math.min(json?.pagination?.total_count||data.length,5000);return{items:data.map((g,i)=>{const imgs=g.images||{};return{name:g.title||'giphy',url:imgs.downsized_medium?.url||imgs.original?.url||'',tags:[],animated:true,type:'gif',originalIndex:i};}).filter(x=>x.url),total};}
  async function fetchReddit({q,page,limit}){const subs=String(S.redditSubs||'').split(/[, ]+/).filter(Boolean).slice(0,50).join('+')||'gifs';const pp=Math.min(limit*page,100);const url=q?`https://www.reddit.com/r/${subs}/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=relevance&t=year&limit=${pp}&raw_json=1`:`https://www.reddit.com/r/${subs}/hot.json?limit=${pp}&raw_json=1`;const json=await fetchJson(url);const ai=!!S.redditIncludeImages;const list=(json?.data?.children||[]).map((ch,i)=>{const d=ch?.data||{},u=d.url_overridden_by_dest||d.url||'';if(/\.gif($|\?)/i.test(u)||(ai&&/\.(jpe?g|png|webp)($|\?)/i.test(u)))return{name:d.title||'reddit',url:u,tags:[],animated:/\.gif/i.test(u),type:'gif',originalIndex:i};return null;}).filter(Boolean);const s=(page-1)*limit;return{items:list.slice(s,s+limit),total:list.length};}
  async function fetchTumblr({q,page,limit}){const key=getKey('tumblr');if(!key)throw new Error('No Tumblr key');const json=await fetchJson(`https://api.tumblr.com/v2/tagged?tag=${encodeURIComponent(q||'gif')}&api_key=${encodeURIComponent(key)}&limit=${limit}`);return{items:(json?.response||[]).flatMap((p,i)=>(p.photos||[]).filter(ph=>/\.gif($|\?)/i.test(ph?.original_size?.url||'')).map(ph=>({name:p.summary||'tumblr',url:ph.original_size.url,tags:[],animated:true,type:'gif',originalIndex:i}))).slice(0,limit),total:page*limit+limit};}
  async function fetchImgur({q,page,limit}){const cid=getKey('imgur');if(!cid)throw new Error('No Imgur Client-ID');const h={Authorization:`Client-ID ${cid}`};const url=q?`https://api.imgur.com/3/gallery/search/?q=${encodeURIComponent(q)}`:`https://api.imgur.com/3/gallery/hot/viral/${Math.max(0,page-1)}.json`;const data=await fetchJson(url,h);const list=(data?.data||[]).flatMap(e=>{if(e.images?.length)return e.images.filter(i=>i.type==='image/gif').map(i=>i.link);if(e.type==='image/gif'&&e.link)return[e.link];return[];});const s=q?(page-1)*limit:0;return{items:list.slice(s,s+limit).map((u,i)=>({name:'imgur',url:u,tags:[],animated:true,type:'gif',originalIndex:i})),total:list.length};}
  function provOn(p){return p==='local'||p==='reddit'||!!S['prov'+p.charAt(0).toUpperCase()+p.slice(1)];}

  // ═══════════════════════════════════════════════
  //  GIF PAGE (FIXED)
  // ═══════════════════════════════════════════════
  function mkGifTile(item,parent){
    const tile=document.createElement('div');tile.className='tl';
    const img=mkImg(item.url,item.name);
    if(S.gifShowTitles){const t=document.createElement('div');t.className='gt';t.textContent=item.name;tile.appendChild(t);}
    if(S.showGifStar){
      const star=document.createElement('button');star.className='star'+(isFav('gif',item)?' active':'');star.innerHTML='<i class="fa-solid fa-star"></i>';
      star.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();favToggle('gif',item);showGifPage(currentGifPage);});
      tile.appendChild(star);
    }
    img.addEventListener('click',e=>{e.stopPropagation();insertContent(item);tile.style.opacity='.5';setTimeout(()=>tile.style.opacity='1',180);});
    img.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();showCtx([{icon:'fa-link',label:'Copy URL',onClick:()=>{copyText(item.url);notice('Copied!');}},{icon:'fa-star',label:isFav('gif',item)?'Unfavorite':'Favorite',onClick:()=>{favToggle('gif',item);showGifPage(currentGifPage);}}],e.clientX,e.clientY);});
    tile.appendChild(img);parent.appendChild(tile);
  }

  async function showGifPage(page){
    if(_rendering)return;_rendering=true;
    try{
      activeTab='gifs';setTabUI('gifs');hideAll();
      tbG.style.display='';sRow.style.display='';gG.style.display='';
      tbG.querySelectorAll('.pb').forEach(b=>{b.style.display=provOn(b.dataset.p)?'':'none';b.classList.toggle('active',b.dataset.p===S.gifProvider);});
      const pp=Math.max(1,S.gifPerPage||24);
      gG.innerHTML='<div class="empty"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>';

      if(favOnlyGifs){
        const q=searchIn.value.trim().toLowerCase();
        let fvs=getFavList('gif');if(q)fvs=fvs.filter(x=>(x.name||'').toLowerCase().includes(q));
        const{totalPages,page:p}=ensurePage(fvs.length,pp,page);currentGifPage=p;
        gG.innerHTML='';const items=fvs.slice((p-1)*pp,p*pp);
        if(!items.length)gG.innerHTML='<div class="empty"><i class="fa-solid fa-heart-crack"></i>&nbsp; No favorites</div>';
        else items.forEach(i=>mkGifTile(i,gG));
        renderPager(totalPages,currentGifPage,p=>showGifPage(p));
        searchIn.placeholder='Search favorites…';$('#g-fav').classList.toggle('active',true);
        return;
      }
      $('#g-fav').classList.toggle('active',false);
      const q=searchIn.value.trim();
      let items=[],totalPages=1;

      if(S.gifProvider==='local'){
        if(!gifsLoaded)await loadLocalGifs();
        if(!String(S.localGifUrls||'').trim()){gG.innerHTML='<div class="empty"><i class="fa-solid fa-folder-open"></i>&nbsp; Add GIF packs in Settings</div>';renderPager(1,1,()=>{});return;}
        const term=q.toLowerCase();let list=term?allGifs.filter(e=>e.name.toLowerCase().includes(term)||(e.tags&&e.tags.some(t=>String(t).toLowerCase().includes(term)))):allGifs;
        list=sortFavFirst(list,'gif');
        const r=ensurePage(list.length,pp,page);totalPages=r.totalPages;currentGifPage=r.page;items=list.slice((r.page-1)*pp,r.page*pp);
      } else if(S.gifProvider==='tenor'){
        const{items:ti,hasNext}=await fetchTenorPage(q,page,pp);currentGifPage=page;items=ti;totalPages=page+(hasNext?1:0);
      } else if(S.gifProvider==='giphy'){
        const r=await fetchGiphy({q,page,limit:pp});currentGifPage=page;items=r.items;totalPages=Math.max(1,Math.ceil(r.total/pp));
      } else if(S.gifProvider==='imgur'){
        const r=await fetchImgur({q,page,limit:pp});currentGifPage=page;items=r.items;totalPages=Math.max(1,Math.ceil(r.total/pp));
      } else if(S.gifProvider==='reddit'){
        const r=await fetchReddit({q,page,limit:pp});currentGifPage=page;items=r.items;totalPages=Math.max(1,Math.ceil(r.total/pp));
      } else if(S.gifProvider==='tumblr'){
        const r=await fetchTumblr({q,page,limit:pp});currentGifPage=page;items=r.items;totalPages=Math.max(1,Math.ceil(r.total/pp));
      }

      gG.innerHTML='';
      if(!items.length)gG.innerHTML='<div class="empty"><i class="fa-solid fa-ghost"></i>&nbsp; No results</div>';
      else items.forEach(i=>mkGifTile(i,gG));
      renderPager(totalPages,currentGifPage,p=>showGifPage(p));
      searchIn.placeholder=`Search GIFs — ${S.gifProvider}`;
    }catch(e){
      gG.innerHTML=`<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp; ${e.message}<br><span style="opacity:.5;font-size:10px">Check API keys in Settings</span></div>`;
      renderPager(1,1,()=>{});
    }finally{_rendering=false;}
  }

  // ═══════════════════════════════════════════════
  //  RECENT
  // ═══════════════════════════════════════════════
  function showRecent(){
    activeTab='recent';setTabUI('recent');hideAll();hPanel.style.display='block';
    hPanel.innerHTML=`<div class="section"><h3><i class="fa-solid fa-clock-rotate-left"></i> Recently Used</h3>`;
    if(!recentItems.length){hPanel.innerHTML+='<div style="opacity:.6;padding:10px">Nothing here yet.</div></div>';return;}
    const grid=document.createElement('div');grid.className='recent-grid';
    recentItems.forEach(item=>{
      if(item.isText||!item.url){
        const span=document.createElement('div');span.className='ri';span.textContent=item.text||item.name||'?';
        span.addEventListener('click',()=>insertContent(item));grid.appendChild(span);
      } else {
        const img=document.createElement('img');img.src=item.url;img.alt=item.name||'';
        img.addEventListener('click',()=>insertContent(item));grid.appendChild(img);
      }
    });
    hPanel.querySelector('.section').appendChild(grid);
    const cb=document.createElement('button');cb.className='btn warn';cb.innerHTML='<i class="fa-solid fa-trash"></i> Clear';cb.style.marginTop='6px';
    cb.addEventListener('click',()=>{if(!confirm('Clear recent?'))return;recentItems=[];GM_Set(K.recent,'[]');showRecent();});
    hPanel.querySelector('.section').appendChild(cb);
  }

  // ═══════════════════════════════════════════════
  //  HOME
  // ═══════════════════════════════════════════════
  async function showHome(){
    activeTab='home';setTabUI('home');hideAll();hPanel.style.display='block';
    const pk=p=>hasKey(p)?'<span class="badge-ok"><i class="fa-solid fa-circle-check"></i> saved</span>':'<span class="badge-err"><i class="fa-solid fa-circle-xmark"></i> not set</span>';
    hPanel.innerHTML=`
<div class="section"><h3><i class="fa-solid fa-chart-line"></i> Live Stats</h3>
<div class="home-grid">
<div class="home-card"><h4><i class="fa-solid fa-download"></i> Installs</h4><div id="h-inst"><i class="fa-solid fa-spinner fa-spin"></i></div></div>
<div class="home-card"><h4><i class="fa-solid fa-code-branch"></i> Version</h4><div>Local: <b>v${VERSION}</b></div><div id="h-rem">Remote: <i class="fa-solid fa-spinner fa-spin"></i></div></div>
<div class="home-card"><h4><i class="fa-solid fa-calendar-check"></i> Updated</h4><div id="h-upd"><i class="fa-solid fa-spinner fa-spin"></i></div></div>
</div>
<div class="row" style="margin-top:8px">
<a class="link-btn" href="${LINKS.github}" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a>
<a class="link-btn" href="${LINKS.openuserjs}" target="_blank"><i class="fa-solid fa-globe"></i> OpenUserJS</a>
<a class="link-btn" href="${LINKS.download}" target="_blank"><i class="fa-solid fa-download"></i> Download</a>
<button class="btn sec" id="h-ref"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
</div></div>
<div class="section"><h3><i class="fa-solid fa-cubes"></i> Content</h3>
<div class="home-grid">
<div class="home-card"><h4><i class="fa-solid fa-face-smile"></i> Emojis</h4>
<div class="chip">Custom: ${allEmojis.length}</div>
<div class="chip">Fav: ${_favV2.emoji.size}</div>
</div>
<div class="home-card"><h4><i class="fa-solid fa-note-sticky"></i> Other</h4>
<div class="chip">Stickers: ${stickersLoaded?allStickers.length:'…'}</div>
<div class="chip">Local GIFs: ${localGifStatus||'–'}</div>
<div class="chip">Recent: ${recentItems.length}</div>
</div>
<div class="home-card"><h4><i class="fa-solid fa-plug"></i> Providers</h4>
<div>Tenor: ${pk('tenor')}</div><div>GIPHY: ${pk('giphy')}</div><div>Imgur: ${pk('imgur')}</div><div>Tumblr: ${pk('tumblr')}</div>
</div></div></div>`;

    hPanel.querySelector('#h-ref')?.addEventListener('click',async()=>{GM_Set(K.statsCacheTs,'0');showHome();});

    // Fetch stats
    try{
      const ts=Number(GM_Get(K.statsCacheTs,'0'));
      let stats;
      if(Date.now()-ts<STATS_TTL){try{stats=JSON.parse(GM_Get(K.statsCache,'null'));}catch{}}
      if(!stats){
        try{
          const txt=await fetchText(LINKS.openuserjs);
          const installs=txt.match(/Installs[:\s]*<[^>]*>(\d[\d,]*)/i)?.[1]?.replace(/,/g,'')||null;
          const updated=txt.match(/Updated[:\s]*<[^>]*>([^<]+)/i)?.[1]?.trim()||null;
          let rv=null;try{const mt=await fetchText(LINKS.meta);rv=mt.match(/@version\s+([^\r\n]+)/)?.[1]?.trim();}catch{}
          stats={installs:installs||'?',updated:updated||'?',remoteVersion:rv||'?'};
          GM_Set(K.statsCache,JSON.stringify(stats));GM_Set(K.statsCacheTs,String(Date.now()));
        }catch{stats={installs:'?',updated:'?',remoteVersion:'?'};}
      }
      const hi=hPanel.querySelector('#h-inst'),hr=hPanel.querySelector('#h-rem'),hu=hPanel.querySelector('#h-upd');
      if(hi)hi.innerHTML=`<span class="stat-num">${stats.installs}</span> installs`;
      if(hr){const isNew=stats.remoteVersion&&stats.remoteVersion!=='?'&&stats.remoteVersion!==VERSION;hr.innerHTML=`Remote: <b>v${stats.remoteVersion}</b> ${isNew?'<span class="badge-warn"><i class="fa-solid fa-arrow-up"></i> Update!</span>':'<span class="badge-ok"><i class="fa-solid fa-check"></i></span>'}`;}
      if(hu)hu.innerHTML=`<i class="fa-solid fa-clock"></i> ${stats.updated}`;
    }catch{}
  }

  // ═══════════════════════════════════════════════
  //  SETTINGS (EXPANDED)
  // ═══════════════════════════════════════════════
  function showSettings(){
    activeTab='settings';setTabUI('settings');hideAll();sPanel.style.display='block';
    sPanel.innerHTML=`
<div class="section"><h3><i class="fa-solid fa-sliders"></i> General</h3>
<div class="row"><label class="cb"><input type="checkbox" id="x-close" ${S.closeOnInsert?'checked':''}> Close on insert</label></div>
<div class="row"><label class="cb"><input type="checkbox" id="x-compact" ${S.compactMode?'checked':''}> Compact mode</label></div>
<div class="row"><label class="cb"><input type="checkbox" id="x-tips" ${S.showTooltips?'checked':''}> Tooltips</label></div>
<div class="row"><label class="cb"><input type="checkbox" id="x-gstar" ${S.showGifStar?'checked':''}> GIF star</label></div>
<div class="row"><label class="cb"><input type="checkbox" id="x-gtitles" ${S.gifShowTitles?'checked':''}> GIF titles</label></div>
</div>

<div class="section"><h3><i class="fa-solid fa-palette"></i> Appearance</h3>
<div style="opacity:.6;font-size:10px;margin-bottom:6px">Customize the look and feel of the menu.</div>

<h4 style="margin:6px 0 4px;color:var(--acc)"><i class="fa-solid fa-gem"></i> Menu</h4>
<div class="row"><label style="min-width:100px">Width</label><input type="number" class="mini" id="s-mw" value="${S.menuWidth}"> px</div>
<div class="row"><label style="min-width:100px">Height</label><input type="number" class="mini" id="s-mh" value="${S.menuHeightPx}"> px</div>
<div class="row"><label style="min-width:100px">Border Radius</label><input type="number" class="mini" id="s-mr" value="${S.menuRadius}"> px</div>
<div class="row"><label style="min-width:100px">Border Width</label><input type="number" class="mini" id="s-bw" value="${S.borderWidth}"> px</div>
<div class="row"><label style="min-width:100px">Shadow</label><input type="range" min="0" max="1" step="0.1" id="s-sh" value="${S.shadow}"><span class="rv">${S.shadow}</span></div>
<div class="row"><label style="min-width:100px">Backdrop Blur</label><input type="number" class="mini" id="s-blur" value="${S.backdropBlur}"> px</div>

<h4 style="margin:8px 0 4px;color:var(--acc)"><i class="fa-solid fa-droplet"></i> Colors</h4>
<div class="row"><label style="min-width:100px">Background</label><input type="color" id="s-bg" value="${S.bg}"></div>
<div class="row"><label style="min-width:100px">Text</label><input type="color" id="s-txt" value="${S.text}"></div>
<div class="row"><label style="min-width:100px">Accent</label><input type="color" id="s-acc" value="${S.accent}"></div>
<div class="row"><label style="min-width:100px">Border</label><input type="color" id="s-bc" value="${S.borderColor}"></div>
<div class="row"><label style="min-width:100px">Tile BG</label><input type="color" id="s-tbg" value="${S.tileBg}"></div>

<h4 style="margin:8px 0 4px;color:var(--acc)"><i class="fa-solid fa-grip"></i> Grid & Tiles</h4>
<div class="row"><label style="min-width:100px">Emoji Size</label><input type="number" class="mini" id="s-es" value="${S.emojiSize}"> px</div>
<div class="row"><label style="min-width:100px">GIF Height</label><input type="number" class="mini" id="s-gs" value="${S.gifSize}"> px</div>
<div class="row"><label style="min-width:100px">Emoji Gap</label><input type="number" class="mini" id="s-ge" value="${S.gapEmoji}"> px</div>
<div class="row"><label style="min-width:100px">GIF Gap</label><input type="number" class="mini" id="s-gl" value="${S.gapLarge}"> px</div>
<div class="row"><label style="min-width:100px">Tile Radius</label><input type="number" class="mini" id="s-tr" value="${S.tileRadius}"> px</div>
<div class="row"><label style="min-width:100px">Hover Scale</label><input type="range" min="1" max="1.2" step="0.01" id="s-hs" value="${S.hoverScale}"><span class="rv">${S.hoverScale}</span></div>

<h4 style="margin:8px 0 4px;color:var(--acc)"><i class="fa-solid fa-grip-lines-vertical"></i> Scrollbar</h4>
<div class="row"><label style="min-width:100px">Width</label><input type="number" class="mini" id="s-sbw" value="${S.scrollbarWidth}"> px</div>
<div class="row"><label style="min-width:100px">Thumb Color</label><input type="color" id="s-sbth" value="${S.scrollbarThumb}"></div>
<div class="row"><label style="min-width:100px">Track Color</label><input type="color" id="s-sbt" value="${S.scrollbarTrack}"></div>

<div class="row" style="margin-top:10px"><button class="btn" id="s-apply"><i class="fa-solid fa-check"></i> Apply Changes</button></div>
</div>

<div class="section"><h3><i class="fa-solid fa-code"></i> Insert Format</h3>
<div class="row"><label style="min-width:100px">Format</label><select class="sel" id="s-fmt">
<option value="bbcode" ${S.insertFormat==='bbcode'?'selected':''}>BBCode</option>
<option value="markdown" ${S.insertFormat==='markdown'?'selected':''}>Markdown</option>
<option value="html" ${S.insertFormat==='html'?'selected':''}>HTML</option>
<option value="url" ${S.insertFormat==='url'?'selected':''}>URL Only</option>
</select></div>
</div>

<div class="section"><h3><i class="fa-solid fa-key"></i> API Keys</h3>
<div style="opacity:.6;font-size:10px;margin-bottom:6px">Stored locally only</div>
 ${['tenor','giphy','imgur','tumblr'].map(p=>`<div class="row"><label style="min-width:80px">${p}</label><span class="api-disp ${hasKey(p)?'has':''}">${hasKey(p)?maskK(getKey(p)):'Not set'}</span>
<button class="btn sec" data-ed="${p}"><i class="fa-solid fa-pen"></i></button>
<button class="btn" data-ts="${p}"><i class="fa-solid fa-vial"></i></button>
<span class="badge" id="st-${p}">${hasKey(p)?'OK':''}</span></div>
<div id="er-${p}" style="display:none" class="row"><input type="password" class="api-key" id="ki-${p}" autocomplete="off" placeholder="Paste key…">
<button class="btn" data-sv="${p}"><i class="fa-solid fa-check"></i></button>
<button class="btn sec" data-cn="${p}"><i class="fa-solid fa-xmark"></i></button>
<button class="btn warn" data-dl="${p}"><i class="fa-solid fa-trash"></i></button></div>`).join('')}
</div>
<div class="section"><h3><i class="fa-solid fa-hard-drive"></i> Local GIFs</h3>
<textarea class="area" id="x-lg">${S.localGifUrls||''}</textarea>
<div class="row"><button class="btn" id="x-slg"><i class="fa-solid fa-check"></i> Save</button><span class="badge" id="x-lgst"></span></div>
</div>
<div class="section"><h3><i class="fa-solid fa-triangle-exclamation"></i> Danger</h3>
<div class="row"><button class="btn warn" id="x-ra"><i class="fa-solid fa-rotate-left"></i> Reset Appearance</button>
<button class="btn warn" id="x-rall"><i class="fa-solid fa-bomb"></i> Reset ALL</button>
<button class="btn sec" id="x-cc"><i class="fa-solid fa-broom"></i> Clear Cache</button></div>
</div>`;

    // Bind General
    const bk=(id,key,cb2)=>{const el=sPanel.querySelector('#'+id);if(el)el.addEventListener('change',()=>{S[key]=el.checked;saveS();cb2?.();});};
    bk('x-close','closeOnInsert');bk('x-compact','compactMode',()=>applyVars());bk('x-tips','showTooltips');bk('x-gstar','showGifStar');bk('x-gtitles','gifShowTitles');

    // Bind Appearance Inputs
    const bindNum = (id, key) => {
        const el = sPanel.querySelector('#'+id);
        if(el) el.addEventListener('change', () => {
            let v = parseFloat(el.value);
            if(!isNaN(v)){ S[key] = v; saveS(); applyVars(); if(el.nextElementSibling && el.nextElementSibling.classList.contains('rv')) el.nextElementSibling.textContent = v; }
        });
    };
    const bindColor = (id, key) => {
        const el = sPanel.querySelector('#'+id);
        if(el) el.addEventListener('input', () => { S[key] = el.value; saveS(); applyVars(); });
    };

    // Menu
    bindNum('s-mw', 'menuWidth');
    bindNum('s-mh', 'menuHeightPx');
    bindNum('s-mr', 'menuRadius');
    bindNum('s-bw', 'borderWidth');
    bindNum('s-blur', 'backdropBlur');
    // Range for Shadow
    const shEl = sPanel.querySelector('#s-sh');
    if(shEl) shEl.addEventListener('input', (e) => {
        let v = parseFloat(e.target.value);
        S.shadow = v; saveS(); applyVars();
        e.target.nextElementSibling.textContent = v;
    });

    // Colors
    bindColor('s-bg', 'bg');
    bindColor('s-txt', 'text');
    bindColor('s-acc', 'accent');
    bindColor('s-bc', 'borderColor');
    bindColor('s-tbg', 'tileBg');

    // Grid
    bindNum('s-es', 'emojiSize');
    bindNum('s-gs', 'gifSize');
    bindNum('s-ge', 'gapEmoji');
    bindNum('s-gl', 'gapLarge');
    bindNum('s-tr', 'tileRadius');
    // Range for Hover Scale
    const hsEl = sPanel.querySelector('#s-hs');
    if(hsEl) hsEl.addEventListener('input', (e) => {
        let v = parseFloat(e.target.value);
        S.hoverScale = v; saveS(); applyVars();
        e.target.nextElementSibling.textContent = v;
    });

    // Scrollbar
    bindNum('s-sbw', 'scrollbarWidth');
    bindColor('s-sbth', 'scrollbarThumb');
    bindColor('s-sbt', 'scrollbarTrack');

    sPanel.querySelector('#s-apply')?.addEventListener('click', ()=>{ applyVars(); notice('Theme updated'); });

    // Bind Format
    const fmtSel = sPanel.querySelector('#s-fmt');
    if(fmtSel) fmtSel.addEventListener('change', () => { S.insertFormat = fmtSel.value; saveS(); });

    // Bind API
    ['tenor','giphy','imgur','tumblr'].forEach(p=>{
      sPanel.querySelector(`[data-ed="${p}"]`)?.addEventListener('click',()=>{const r=sPanel.querySelector(`#er-${p}`);if(r)r.style.display='flex';});
      sPanel.querySelector(`[data-cn="${p}"]`)?.addEventListener('click',()=>{const r=sPanel.querySelector(`#er-${p}`);if(r)r.style.display='none';});
      sPanel.querySelector(`[data-sv="${p}"]`)?.addEventListener('click',()=>{const v=sPanel.querySelector(`#ki-${p}`)?.value?.trim();if(!v)return;setKey(p,v);showSettings();notice(`${p} key saved`);});
      sPanel.querySelector(`[data-dl="${p}"]`)?.addEventListener('click',()=>{if(!confirm(`Delete ${p} key?`))return;setKey(p,'');showSettings();notice(`${p} key deleted`);});
      sPanel.querySelector(`[data-ts="${p}"]`)?.addEventListener('click',async()=>{
        const st=sPanel.querySelector(`#st-${p}`);if(st){st.textContent='…';st.className='badge badge-warn';}
        try{const k=sPanel.querySelector(`#ki-${p}`)?.value?.trim()||getKey(p);if(!k)throw 0;let ok=false;
          if(p==='tenor')ok=!!(await fetchJson(`https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(k)}&limit=1&media_filter=gif`))?.results;
          if(p==='giphy')ok=!!(await fetchJson(`https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(k)}&limit=1`))?.data;
          if(p==='imgur')ok=!!(await fetchJson('https://api.imgur.com/3/credits',{Authorization:`Client-ID ${k}`}))?.data;
          if(p==='tumblr')ok=!!(await fetchJson(`https://api.tumblr.com/v2/tagged?tag=gif&api_key=${encodeURIComponent(k)}&limit=1`))?.response;
          if(st){st.textContent=ok?'Working':'Fail';st.className=`badge ${ok?'badge-ok':'badge-err'}`;}
        }catch{if(st){st.textContent='Fail';st.className='badge badge-err';}}
      });
    });

    sPanel.querySelector('#x-slg')?.addEventListener('click',async()=>{S.localGifUrls=sPanel.querySelector('#x-lg')?.value?.trim()||'';saveS();gifsLoaded=false;await loadLocalGifs();const st=sPanel.querySelector('#x-lgst');if(st){st.textContent=localGifStatus;st.className='badge badge-ok';}});
    sPanel.querySelector('#x-ra')?.addEventListener('click',()=>{if(!confirm('Reset appearance?'))return;Object.assign(S,DEFAULTS);saveS();applyVars();showSettings();});
    sPanel.querySelector('#x-rall')?.addEventListener('click',()=>{
      if(!confirm('Reset EVERYTHING?'))return;
      Object.assign(S,DEFAULTS);saveS();applyVars();
      _favV2.emoji.clear();_favV2.sticker.clear();_favV2.gif.clear();
      _favLeg.emoji.clear();_favLeg.sticker.clear();_favLeg.gif.clear();
      favMeta={};
      Object.values(K).forEach(k=>{try{GM_Set(k,k.includes('Meta')?'{}':'[]');}catch{}});
      saveFavMeta();writeApi('global',{});writeApi('site',{});
      applyCustomCss('');recentItems=[];GM_Set(K.recent,'[]');
      GM_Set(K.emojiCache,'');GM_Set(K.emojiCacheTs,'0');
      showSettings();notice('Everything reset');
    });
    sPanel.querySelector('#x-cc')?.addEventListener('click',()=>{GM_Set(K.emojiCache,'');GM_Set(K.emojiCacheTs,'0');notice('Cache cleared');});
  }

  // ═══════════════════════════════════════════════
  //  TAB SWITCHING
  // ═══════════════════════════════════════════════
  function switchTab(t){
    activeTab=t;
    if(t==='home')showHome();
    else if(t==='emojis')showEmojiPage(currentEmojiPage);
    else if(t==='stickers')showStickerPage(currentStickerPage);
    else if(t==='gifs')showGifPage(currentGifPage);
    else if(t==='recent')showRecent();
    else if(t==='settings')showSettings();
  }

  // ═══════════════════════════════════════════════
  //  SEARCH
  // ═══════════════════════════════════════════════
  searchIn.addEventListener('input',debounce(()=>{
    if(activeTab==='emojis')showEmojiPage(1);
    else if(activeTab==='stickers')showStickerPage(1);
    else if(activeTab==='gifs')showGifPage(1);
  },S.searchDebounceMs||200));

  pjGo.addEventListener('click',()=>{const v=parseInt(pjIn.value,10)||1;if(activeTab==='emojis')showEmojiPage(v);else if(activeTab==='stickers')showStickerPage(v);else if(activeTab==='gifs')showGifPage(v);});
  pjIn.addEventListener('keydown',e=>{if(e.key==='Enter')pjGo.click();});

  // Fav buttons
  $('#e-fav').addEventListener('click',e=>{e.stopPropagation();favOnlyEmoji=!favOnlyEmoji;showEmojiPage(1);});
  $('#s-fav').addEventListener('click',e=>{e.stopPropagation();favOnlyStickers=!favOnlyStickers;showStickerPage(1);});
  $('#g-fav').addEventListener('click',e=>{e.stopPropagation();favOnlyGifs=!favOnlyGifs;showGifPage(1);});

  // GIF providers
  tbG.addEventListener('click',e=>{
    const b=e.target.closest('.pb');if(!b)return;
    e.stopPropagation();
    const p=b.dataset.p;if(!provOn(p))return;
    if(['tenor','giphy','imgur','tumblr'].includes(p)&&!hasKey(p)){switchTab('settings');notice(`Add ${p} key in Settings`);return;}
    S.gifProvider=p;saveS();showGifPage(1);
  });

  // ═══════════════════════════════════════════════
  //  FLOATING BUTTON
  // ═══════════════════════════════════════════════
  const BE=[  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🫡', '🤗', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫨', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🫥', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🐵', '🐒', '🐶', '🐕', '🐩', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🐮', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🐘', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🐳', '🐋', '🐬', '🦭', '🦈', '🐟', '🐠', '🐡', '🐙', '🦑', '🦐', '🦞', '🦀', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️'];
  let eBtn=document.getElementById('global-emoji-button');
  if(!eBtn){eBtn=document.createElement('span');eBtn.id='global-emoji-button';eBtn.className='emoji-button';eBtn.innerHTML='😊';eBtn.setAttribute('role','button');eBtn.tabIndex=0;document.body.appendChild(eBtn);}
  eBtn.onmouseenter=()=>{eBtn.style.filter='grayscale(0%)';eBtn.style.transform='scale(1.1)';};
  eBtn.onmouseleave=()=>{eBtn.style.filter='grayscale(80%)';eBtn.style.transform='scale(1)';};
  eBtn.onclick=e=>{e.stopPropagation();const h=getComputedStyle(container).display==='none';container.style.display=h?'flex':'none';if(h)switchTab('emoji');};

  // Close & keyboard
  container.querySelector('.close').addEventListener('click',()=>container.style.display='none');
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){container.style.display='none';hideCtx();}
    if((e.ctrlKey||e.metaKey)&&e.altKey&&e.key.toLowerCase()==='e'){e.preventDefault();const h=getComputedStyle(container).display==='none';container.style.display=h?'flex':'none';if(h)switchTab('emoji');}
  });

  // Drag
  {let d=false,ox=0,oy=0;
    container.querySelector('.drag').addEventListener('mousedown',e=>{d=true;const r=container.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();});
    document.addEventListener('mousemove',e=>{if(!d)return;container.style.left=(e.clientX-ox)+'px';container.style.top=(e.clientY-oy)+'px';container.style.right='auto';container.style.bottom='auto';});
    document.addEventListener('mouseup',()=>{if(d){d=false;S.menuPositionX=container.style.left;S.menuPositionY=container.style.top;saveS();}});
  }

  // Memory cleanup
  new MutationObserver(()=>{if(container.style.display==='none')destroyLazy();}).observe(container,{attributes:true,attributeFilter:['style']});
  window.addEventListener('beforeunload',destroyLazy);

  // ═══════════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════════
  applyVars();buildTabs();showHome();
  loadEmojis();loadStickers();
  if(S.localGifUrls)loadLocalGifs();
  showEmojiPage(1);
})();
