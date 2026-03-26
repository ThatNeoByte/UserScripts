// ==UserScript==
// @name            The Lounge – Shoutbox Beautifier (ThatNeoByte Edition)
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         3.0-tnb.20
// @description     Advanced rework of the original Shoutbox Beautifier for The Lounge. Reformats bridged chatbot messages to appear as native user messages, with extensible handler architecture, decorators, metadata-driven styling, regex matching, preview-safe DOM updates, and expanded network support. Fetches user details from supported UNIT3D trackers to display profile pictures, role icons, role colors, and custom icons. Note: You must be logged into each tracker in your browser for profile data to load.
//
// @author          spindrift
// @maintainer      ThatNeoByte
// @license         MIT
//
// @credits         Original script by spindrift
// @credits         Additional contributions by fulcrum, marks, sparrow, AnabolicsAnonymous, FortKnox1337, cmd430
// @source          https://aither.cc/forums/topics/3874
//
// @match           https://irc.thatneobyte.com/*
//
// @icon            https://thelounge.chat/favicon.ico
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/TheLounge/TheLounge-ShoutboxBeautifier.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/TheLounge/TheLounge-ShoutboxBeautifier.user.js
//
// @require         https://cdn.jsdelivr.net/npm/dompurify@3.3.1/dist/purify.min.js
// @require         https://cdn.jsdelivr.net/npm/@bbob/html@4.3.1/dist/index.min.js
// @require         https://cdn.jsdelivr.net/npm/@bbob/preset-html5@4.3.1/dist/index.min.js
//
// @connect         darkpeers.org 
// @connect         luminarr.me
// @connect         seedpool.org
// @connect         homiehelpdesk.net
// @connect         upload.cx
// @connect         onlyencodes.cc
// @connect         skipthecommercials.xyz
// @connect         lst.gg
// @connect         reelflix.cc
// @connect         anthelion.me
// @connect         blutopia.cc
// @connect         aither.cc
// @connect         hawke.uno
//
// @grant           GM_xmlhttpRequest
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_registerMenuCommand 
// @grant           GM_listValues
//
// @run-at          document-end
// ==/UserScript==

// This is a reworked version of the original script that adds:
// - Handler architecture: Makes it easier to add new formats
// - Custom decorators: Set a prefix/suffix for bridged usernames
// - DOM metadata: Completely customize appearance with TheLounge theme CSS
// - Regex matcher support: Pair with custom handlers to do almost anything
// - Preview support: Surgical DOM modification preserves link previews and event listeners
// - More handlers: BHD, extensive HUNO support
// - Nick coloring: Bridged usernames get proper TheLounge colors instead of inheriting bot colors

// CREDITS:
// fulcrum: Original script (https://aither.cc/forums/topics/3874)
// marks: Autocomplete enablement (https://aither.cc/forums/topics/3874/posts/32274)

// INSTALLATION:
// - Install Tampermonkey or a compatible userscript manager
// - Create a new script and paste this in
// - Set @match to the IP or domain you access TheLounge on

// TROUBLESHOOTING:
// - Make sure @match is set to your TheLounge domain, in the same format as:
//     *://your-thelounge-domain.com/*
// - Try disabling autocomplete (USE_AUTOCOMPLETE: false)
// - Check the browser console for errors
// - When in doubt, simply refresh the page

// CHANGELOG:
// - 1.0 - (spindrift) Initial release
// - 2.0 - (spindrift) Fix link previews, change return structure to add `modifyContent` and `prefixToRemove`
// - 2.1 - (spindrift) Sanitize zero-width characters (fixes HUNO Discord handler)
// - 2.2 - (sparrow) Add option to hide join/quit messages, add TheLounge icon to Tampermonkey
// - 2.3 - (spindrift) Add color matching - bridged usernames get proper TheLounge colors
// - 2.4 - (AnabolicsAnonymous) Update ULCX matchers
// - 2.5 - (spindrift) Add ANT support (thanks JCDenton for initial work)
// - 2.6 - (FortKnox1337) Add RFX support, enable DP and HHD support, fix ANT/BHD support (thanks!!)
// - 2.7 - (cmd430) Enable OE+ support, fix config indents, fixes script breaking after viewing a non-chat page
// - 2.8 - (NeoByte) Add handler specific decorators, add newMessage option

// CSS STYLING:
// Custom CSS can be added easily in TheLounge > Settings > Appearance.
// You can use the following CSS selectors to target bridged messages in your themes:
// - span[data-bridged] selects the usernames of all bridged messages
// - span[data-bridged-channel] selects bridged messages from specific channels
// - attr(data-bridged) retrieves the embedded metadata prefix (e.g., 'SB')
//
//   Examples:
//   - Italicize all bridged usernames:
//     span[data-bridged] { font-style: italic; }
//
//   - Show HUNO Discord ranks in tiny text before username, only in #huno* channels:
//     span[data-bridged-channel~="#huno"]:before {
//       content: attr(data-bridged);
//       font-size: 8px;
//       margin-right: 5px;
//     }

(function () {
    'use strict';

    // --- YOU CAN START EDITING STUFF HERE ---
    const CONFIG = {
        USE_AUTOCOMPLETE: true, // Enable autocomplete for usernames
        USE_DECORATORS: true,   // Enable username decorators
        REMOVE_JOIN_QUIT: false,// Removes join/quit messages
        DECORATOR_L: '-',       // Will be prepended to username
        DECORATOR_R: '',        // Will be appended to username
        METADATA: 'SB',         // Default metadata to be inserted into HTML
        IMG_EXT: /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i,
        ALWAYS_DISPLAY_DOMAINS: [/^https?\:\/\/mm.yaf.quest\//, /^https?\:\/\/i\.seedpool\.org\/s\//, /^https?\:\/\/external-content\.duckduckgo\.com\/iu\//, /^https?\:\/\/onlyimage\.org\/image\//],
        BYPASS_EMBED_DOMAINS: [/^https?\:\/\/img\.homiehelpdesk\.net\/share\//],
        BYPASS_WSRV_DOMAINS: [/^https?\:\/\/ptpimg\.me\//],
        AVATAR_CACHE_TTL: 1000 * 60 * 60 * 24 * 14, // 14 day, this is a long time, but it's to reduce load on the tracker and device. Some trackers have over 1k user in the irc, thus fetching 1k avatars every day would be bad
        ICON_CACHE_TTL: 1000 * 60 * 60 * 24 * 14, // 14 day
        PROFILE_CACHE_TTL: 1000 * 60 * 60 * 24 * 2, // 2 day
        SITE_CACHE_TTL: 1000 * 60 * 60 * 24 * 2, // 2 day
        BOT_USERNAMES: [/^ChanServ$/i, /^HostServ$/i, /^NickServ$/i, /^SYSTEM$/i, /^SeedServ$/i, /^Banker$/i, /^Bot$/i, /^Dealer$/i, /^StatusBot$/, /^BluBot$/], // Used to decorate none-bridge bots 
    }

    const DEFAULT_SITE_CONFIG = {
        getAvatarUrl: user => `/authenticated-images/user-avatars/${user}`,
        getIconUrl: user => `/authenticated-images/user-icons/${user}`,
        getProfileUrl: user => `/users/${user}`,
        groupsUrl: '/stats/groups',
        placeholderAvatar: 'data:image/gif;base64,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',
        placeholderAvatarUrl: `/img/profile.png`,
    };
    
    const CONFIG_BOT_SITES = [
        // Add chatbot nicks and corresponding details here, including operator (~, @, etc.)
        // Can also add regex patterns for more complex matches
        // NOTE: A hit from any matcher will run all handlers
        {
            name: 'TNB',
            matcher: /^NeoBot$/i,
            host: 'irc.tnb.moe',
            domain: 'darkpeers.org',
        },
        {
            name: 'ULCX',
            matcher: /^ULCX$/i,
            host: 'irc.upload.cx',
            domain: 'upload.cx',
        },
        {
            name: 'RFX',
            matcher: /^WALL-E$/i,
            host: 'irc.reelflix.cc',
            domain: 'reelflix.cc',
        },
        {
            name: 'SP', // Seed pool does not have a bot that bridges the messages.
            host: 'irc.seedpool.org',
            domain: 'seedpool.org',
        },
        {
            name: 'HHD',
            matcher: /^BBot$/i,
            host: 'irc.homiehelpdesk.net',
            domain: 'homiehelpdesk.net',
        },
        {
            name: 'DP',
            matcher: /^darkpeers$/i,
            host: 'irc.p2p-network.net',
            domain: 'darkpeers.org',
            channels: ['#darkpeers', '#dphelp', '#dplog', '#dpmoderation', '#dpstaff'],
        },
        {
            name: 'BLU',
            matcher: /^blutopiabot$/i, // There is no bridge, so nothing to match agains.
            host: 'irc.p2p-network.net',
            domain: 'blutopia.cc',
            channels: ['#blutopia'],
        },
        {
            name: 'LST',
            matcher: /^Bot$/i,
            host: 'irc.lst.gg',
            domain: 'lst.gg',
        },
        {
            name: 'LUME',
            matcher: /^(?:Luminarr|Announce)$/i,
            host: 'irc.luminarr.me',
            domain: 'luminarr.me',
        },
        {
            name: 'STC',
            matcher: /^stc$/i,
            host: 'irc.skipthecommercials.xyz',
            domain: 'skipthecommercials.xyz',
        },
        {
            disabled: true, // Disable OE+ support, as they require the file extension in the avatar URL
            name: 'OE+',
            matcher: /^bridgebot$/i,
            host: 'irc.onlyencodes.cc',
            domain: 'onlyencodes.cc',
        },
        {
            disabled: true, // Disable BHD support, as i am not a member of that community and cannot test it.
            name: 'BHD',
            matcher: /^Willie$/,
            host: '',
            domain: '',
        },
        {
            disabled: true, // Disable ATH support, as i am not a member of that community and cannot test it.
            name: 'ATH',
            matcher: /^Chatbot$/i,
            host: '',
            domain: 'aither.cc',
        },
        {
            disabled: true, // Disable HUNO support, as i am not a member of that community and cannot test it.
            name: 'HUNO',
            matcher: /^(?:Mellos|.+?-web)$/i,
            host: '',
            domain: 'hawke.uno',
        },
        {
            disabled: true, // Disable ANT support, as it does not use the username in the avatar URL
            name: 'ANT',
            matcher: /^Sauron$/i,
            host: 'irc.nebulance.io',
            domain: 'anthelion.me',
            channels: ['#ant']
        },
    ]

    // Merge defaults and bind domain to URL functions
    const BOT_SITES = CONFIG_BOT_SITES.map(site => {
        const merged = { ...DEFAULT_SITE_CONFIG, ...site };

        // Wrap functions so they capture the domain in a closure
        merged.getAvatarUrl = user => `https://${merged.domain}${(site.getAvatarUrl || DEFAULT_SITE_CONFIG.getAvatarUrl)(user, merged.domain)}`;
        merged.getIconUrl = user => `https://${merged.domain}${(site.getIconUrl || DEFAULT_SITE_CONFIG.getIconUrl)(user, merged.domain)}`;
        merged.getProfileUrl = user => `https://${merged.domain}${(site.getProfileUrl || DEFAULT_SITE_CONFIG.getProfileUrl)(user, merged.domain)}`;
        merged.groupsUrl = `https://${merged.domain}${site.groupsUrl || DEFAULT_SITE_CONFIG.groupsUrl}`;
        merged.placeholderAvatarUrl = `https://${merged.domain}${site.placeholderAvatarUrl || DEFAULT_SITE_CONFIG.placeholderAvatarUrl}`;

        return merged;
    });

    // FORMAT HANDLERS:
    // Easily add support for new formats, just copy an existing handler and modify it
    //
    // Tips for writing regex matches:
    // - Make sure you check msg.text, not msg.html
    // - Always include the entire (non-prefix) message in a capture group: (.*)$
    // - regex101.com is a great resource for interactive debugging
    //
    // If you're rolling your own custom handler, please note...
    //
    // Handlers should be formatted as objects with the structure:
    // - enabled: true/false to enable/disable
    // - handler: function that takes a message object and returns:
    //   { username, prefixToRemove, newMessage, metadata, prefix, postfix } or null if no match
    //   - username: what to show the person's nick as
    //   - prefixToRemove: text to remove from message (optional)
    //   - newMessage: the new content of the message, this will override prefixToRemove (optional)
    //   - metadata: string to insert into HTML for CSS targeting (or default to CONFIG.METADATA)
    //   - prefix: override the default prefix with this one (set to null or leave empty to use default prefix)
    //   - suffix: override the default suffix with this one (set to null or leave empty to use default suffix)
    //
    // Handler functions should make use of the `msg` object, which contains:
    // - text: textContent of message
    // - html: innerHTML of message
    // - from: sender of message (usually the chatbot)
    // - chan: channel message was received in
    //
    // Helper functions available:
    // - removeMatchedPrefix(match): automatically calculates prefix to remove from regex match
    // - removeAllExceptMessage(text, messageText): removes everything before the message text
    //
    // Other handler notes:
    // - Handlers should return null if no match, so the next handler can be tried
    // - Handlers are processed in order, so more general handlers should be placed later
    // - Handlers can be disabled by setting `enabled: false`

    // HELPER FUNCTIONS for handlers:
    // Makes it easy to calculate what prefix to remove without complex string manipulation

    // For most bridged message formats - automatically calculates prefix from regex match
    function removeMatchedPrefix(match) {
        const fullMatch = match[0];
        const messageText = match[match.length - 1]; // Last capture group = message
        const prefixEnd = fullMatch.lastIndexOf(messageText);
        return fullMatch.substring(0, prefixEnd);
    }

    // For when you want to remove everything except the message text
    function removeAllExceptMessage(text, messageText) {
        const messageStart = text.lastIndexOf(messageText);
        return text.substring(0, messageStart);
    }

    function formatBytes(bytes) {
        const units = ["B", "KB", "MB", "GB", "TB"];
        let value = bytes;
        let unitIndex = 0;

        while (
            unitIndex < units.length - 1 &&
            value / 1000 >= 0.9
        ) {
            value /= 1000;
            unitIndex++;
        }

        return `${value.toFixed(2)} ${units[unitIndex]}`;
    }

    const HANDLERS = [
        {
            // Format: [SB] Nickname: Message or [ SB ] (Nickname): Message
            // Used at: BHD, ANT

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\s?\[\s?SB\s?\]\s+\(?([^):]+)\)?:\s*(.*)$/);
                if (!match) return null;

                return {
                    username: match[1],
                    prefixToRemove: removeMatchedPrefix(match),
                    metadata: CONFIG.METADATA
                };
            }
        },
        {
            // Format: [Chatbox] Nickname: Message
            // Used at: RFX

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[Chatbox\]\s+([^:]+):\s*(.*)$/);
                if (!match) return null;

                return {
                    username: match[1],
                    prefixToRemove: removeMatchedPrefix(match),
                    metadata: CONFIG.METADATA
                };
            }
        },
        {
            // Format: »Username« Message or »Username (Rank)« Message
            // Used at: HUNO (Discord bridge)

            enabled: true,
            handler: function (msg) {
                const HANDLER_CONFIG = {
                    REMOVE_RANK: true,  // Splits out rank from username into metadata
                    ABBREVIATE_RANK: true,  // Abbreviates rank (REMOVE_RANK must be set)
                    FORCE_ABBREVIATE: false  // Always abbreviates rank, even if it's only one word
                };

                // Clean zero-width characters from the text before processing
                const cleanText = msg.text.replace(/[\u200B-\u200D\uFEFF]/g, '');

                // Two-step approach: try « format first, then space format
                let match = cleanText.match(/^»([^«]+)«\s*(.*)$/);
                if (!match) {
                    // If no « found, try space-separated format (non-greedy to stop at first space)
                    match = cleanText.match(/^»(\S+(?:\s+\([^)]+\))?)\s+(.*)$/);
                }
                if (!match) return null;

                // Abbreviates rank if needed
                // If ABBREVIATE_RANK is true, it will abbreviate ranks like "White Walkers" to "WW"
                function abbreviateRank(rank) {
                    const caps = rank.match(/[A-Z]/g);
                    if (!caps) return '';
                    if (!HANDLER_CONFIG.FORCE_ABBREVIATE && caps.length === 1) return rank;
                    return caps.join('');
                }

                let rawUsername = match[1]; // The full username with potential rank
                let extractedUsername, metadata = '';

                if (HANDLER_CONFIG.REMOVE_RANK && rawUsername.endsWith(')')) { // Check if it ends with a rank in parentheses
                    const rankMatch = rawUsername.match(/^(.*)\s+\(([^)]+)\)$/); // Match "Username (Rank)"
                    if (rankMatch) {
                        extractedUsername = rankMatch[1].trim(); // Username without rank
                        const rank = rankMatch[2]; // Extracted rank
                        metadata = HANDLER_CONFIG.ABBREVIATE_RANK ? abbreviateRank(rank) : rank; // Abbreviated rank
                    } else {
                        extractedUsername = rawUsername.trim();
                    }
                } else {
                    extractedUsername = rawUsername.trim();
                }

                return {
                    username: extractedUsername,
                    prefixToRemove: removeMatchedPrefix(match),
                    metadata
                };
            }
        },
        {
            // Format: <Username-web> Message
            // Used at: HUNO (Shoutbox bridge)

            enabled: true,
            handler: function (msg) {
                // Only apply this handler for HUNO channels
                if (!msg.chan.startsWith('#huno')) return null;
                if (msg.from.endsWith('-web')) {
                    // Remove '-web' suffix for HUNO shoutbox users
                    return {
                        username: msg.from.slice(0, -4),
                        metadata: CONFIG.METADATA
                    }
                }
                return null;
            }
        },
        {
            // Format: [Nickname] Message or [Nickname]: Message or [Nickname] (MTX): Message
            // Used at: ATH, DP, ULCX, HHD, LST

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[([^\]]+)\](?:\s*\(MTX\))?(?::\s*|\s+)(.*)$/);
                if (!match) return null;

                return {
                    username: match[1],
                    prefixToRemove: removeMatchedPrefix(match),
                    metadata: CONFIG.METADATA
                };
            }
        },
        {
            // Format: [BON-POOL]-[Contribution: Amount]-[Progress: Percentage%]-[By: Username]-[Contribute here: https://darkpeers.org/bon-pool]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[BON-POOL\]\-\[Contribution: ([\d,]+).+\]\-\[Progress: (\d+)%\]\-\[By: ([^\]]+)\].*$/);
                if (!match) return null;

                const newMessage = `Contributed <strong>${match[1]}</strong> BON to the <a href="https://darkpeers.org/bon-pool">BON-POOL</a>, the pool is now at <strong>${match[2]}%!</strong>`;

                return {
                    username: match[3],
                    newMessage: newMessage,
                    metadata: CONFIG.METADATA,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-upload|Featured|Internal]-[Tag]-[Type]-[Title]-[Size: Size]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[(New-upload|Featured|Internal)\]-\[([^\]]+)\]-\[([^\]]+)\]-\[(.+)\]-\[Size: ([^\]]+)\]-\[Link: ([^\]]+)\]/);
                if (!match) return null;

                const tag = match[1];
                const category = match[2];
                const type = match[3];
                const title = match[4];
                const size = match[5];
                const link = match[6];

                const catEmojis = {
                    'Movies': '🎬',
                    'TV': '📺',
                    'Games': '🎮',
                    'Music': '🎵',
                    'Applications': '💾',
                    'Books': '📚',
                    'XXX': '🔞'
                };
                const emoji = catEmojis[category] || '📁';

                const username = `${tag} ${emoji}`;

                const newMessage = `<span style="color: #00bcd4;">[${type}]</span> ${title} <strong>(${size})</strong> - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>`;

                return {
                    username: username,
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
        {
            // Format: [New-Request]-[Name: Title]-[Category: Category]-[Type: Type]-[Bounty: Amount]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Request\]-\[Name: (.+)\]-\[Category: ([^\]]+)\]-\[Type: ([^\]]+)\]-\[Bounty: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const title = match[1];
                const category = match[2];
                const type = match[3];
                const amount = match[4];
                const link = match[5];

                const catEmojis = {
                    'Movies': '🎬',
                    'TV': '📺',
                    'Games': '🎮',
                    'Music': '🎵',
                    'Applications': '💾',
                    'Books': '📚',
                    'XXX': '🔞'
                };
                const emoji = catEmojis[category] || '📁';

                const username = `New-Request ${emoji}`;

                const newMessage = `<span style="color: #00bcd4;">[${type}]</span> ${title} <strong>(${amount} BON)</strong> - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>`;

                return {
                    username: username,
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
        {
            // Format: [New-Topic]-[Name: Title]-[Forum: Forum]-[User: Username]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Topic\]-\[Name: (.+)\]-\[Forum: ([^\]]+)\]-\[User: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const title = match[1];
                const forum = match[2];
                const username = match[3];
                const link = match[4];

                const newMessage = `Started a new topic: <a href="${link}">${title}</a> in ${forum}`;

                return {
                    username: username,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Post]-[Name: Title]-[Forum: Forum]-[User: Username]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Post]-\[Name: (.+)\]-\[Forum: ([^\]]+)\]-\[User: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const title = match[1];
                const forum = match[2];
                const username = match[3];
                const link = match[4];

                const newMessage = `Created a new post under: <a href="${link}">${title}</a> in ${forum}`;

                return {
                    username: username,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Poll]-[Title]-[Vote: link]-[Topic: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Poll]-\[(.+)\]-\[Vote: ([^\]]+)\]-\[Topic: ([^\]]+)\].*$/);
                if (!match) return null;

                const title = match[1];
                const poll = match[2];
                const topic = match[3];

                const newMessage = `${title} - <a href="${poll}" target="_blank" rel="noopener noreferrer" class="link">Vote</a> | <a href="${topic}" target="_blank" rel="noopener noreferrer" class="link">View topic</a>`;

                return {
                    username: 'New-Poll ❓',
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
        // DP Mod Logs
        {
            // Format: [USER]-[Name: name]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[USER]-\[Name: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const name = match[1];
                const link = match[2];

                const newMessage = `Joined DarkPeers - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>.`;

                return {
                    username: name,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [USER]-[Enabled]-[User: name]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[USER]-\[Enabled\d?]-\[User: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const name = match[1];
                const link = match[2];

                const newMessage = `Has been enabled - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>.`;

                return {
                    username: name,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Request|Torrent-Comment]-[User: name]-[Torrent: link]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-(Request|Torrent)-Comment\]-\[User: (.+)\]-\[Torrent: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const type = match[1];
                const name = match[2];
                const torrent = match[3];
                const link = match[4];

                const newMessage = `Left a comment on a ${type.toLowerCase()}: <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${torrent}</a>`;

                return {
                    username: name,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [Request-Approved]-[Name: name]-[Category: category]-[Type: type]-[User: user]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[Request-Approved\]-\[Name: (.+)\]-\[Category: ([^\]]+)\]-\[Type: ([^\]]+)\]-\[User: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const title = match[1];
                const category = match[2];
                const type = match[3];
                const name = match[4];
                const link = match[5];

                const newMessage = `${name}'s fulfillment has been approved for request <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${title}</a>`;

                return {
                    username: "Request ✅",
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
        {
            // Format: [New-Request|Torrent-Comment]-[User: name]-[Torrent: link]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-(Request|Torrent)-Comment\]-\[User: (.+)\]-\[Torrent: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const type = match[1];
                const name = match[2];
                const torrent = match[3];
                const link = match[4];

                const newMessage = `Left a comment on a ${type.toLowerCase()}: <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${torrent}</a>`;

                return {
                    username: name,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Article-Comment]-[User: name]-[Article: link]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Article-Comment\]-\[User: (.+)\]-\[Article: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const name = match[1];
                const article = match[2];
                const link = match[3];

                const newMessage = `Left a comment on an article: <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${article}</a>`;

                return {
                    username: name,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [Request-Deleted-By-Self]-[Name: name]-[User: user]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[Request-Deleted-By-Self\]-\[Name: ([^\]]+)\]-\[User: (.+)\].*$/);
                if (!match) return null;

                const requestName = match[1];
                const userName = match[2];

                const newMessage = `Has deleted the request: ${requestName}`;

                return {
                    username: userName,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [Request-Deleted-By-Staff]-[Name: name]-[By: requester]-[User: user]-[Reason: reason]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[Request-Deleted-By-Staff\]-\[Name: ([^\]]+)\]-\[By: ([^\]]+)\]-\[User: (.+)\]-\[Reason: (.+)\].*$/);
                if (!match) return null;

                const requestName = match[1];
                const requester = match[2];
                const staff = match[3];
                const reason = match[4];

                const newMessage = `Has deleted the request by <a href="https://darkpeers.org/users/${requester}" target="_blank" rel="noopener noreferrer" class="link">${requester}</a>: ${requestName} - Reason: ${reason}`;

                return {
                    username: staff,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [Warning-Cleaned]-[User: name]-[Price: amount]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[Warning-Cleaned\]-\[User: (.+)\]-\[Price: ([^\]]+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const name = match[1];
                const cost = match[2];
                const link = match[3];

                const newMessage = `Cleared a warning for ${cost} BON - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>`;

                return {
                    username: name,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [Approved|Postponed|Rejected-Torrent-Moderation]-[Name: name]-[Torrent: link]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[(Approved|Postponed|Rejected)-Torrent-Moderation\]-\[([^\]]+)\]-\[([^\]]+)\]-\[(.+)\]-\[Size: (.+)\]-\[User: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const action = match[1];
                const category = match[2];
                const type = match[3];
                const title = match[4];
                const size = match[5];
                const moderator = match[6];
                const link = match[7];

                const newMessage = `${action}: <span style="color: #00bcd4;">[${type}]</span> ${title} <strong>(${size})</strong> - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>`;

                return {
                    username: moderator,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Torrent-Moderation]-[Name: name]-[Torrent: link]-[Link: Link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Torrent-Moderation\]-\[([^\]]+)\]-\[([^\]]+)\]-\[(.+)\]-\[Size: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const category = match[1];
                const catEmojis = {
                    'Movies': '🎬',
                    'TV': '📺',
                    'Games': '🎮',
                    'Music': '🎵',
                    'Applications': '💾',
                    'Books': '📚',
                    'XXX': '🔞'
                };
                const emoji = catEmojis[category] || '📁';

                const type = match[2];
                const title = match[3];
                const size = match[4];
                const link = match[5];

                const newMessage = `<span style="color: #00bcd4;">[${type}]</span> ${title} <strong>(${size})</strong> - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>`;

                return {
                    username: `New-Pending ${emoji}`,
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
        {
            // Format: [New-Ticket]-[Priority: priority]-[Category: category]-[User: user]-[Subject: subject]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Ticket\]-\[Priority: ([^\]]+)\]-\[Category: ([^\]]+)\]-\[User: ([^\]]+)\]-\[Subject: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const priority = match[1];
                const category = match[2];
                const user = match[3];
                const title = match[4];
                const link = match[5];

                const newMessage = `Created an new ticket: <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${title}</a> <b>[${priority}]</b> <b>(${category})</b>`;

                return {
                    username: user,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Ticket-(Assignee|Comment)]-[Priority: priority]-[Category: category]-[User: user]-[Subject: subject]-[Responsible: responsible]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Ticket-(Assignee|Comment)\]-\[Priority: ([^\]]+)\]-\[Category: ([^\]]+)\]-\[User: (.+)\]-\[Subject: ([^\]]+)\]-\[Responsible: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const type = match[1];
                const priority = match[2];
                const category = match[3];
                const user = match[4];
                const title = match[5];
                const responsible = match[6];
                const link = match[7];

                const start = type === 'Assignee' ? 'Was assigned to' : 'Commented on';

                const newMessage = `${start} ticket: <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${title}</a> <b>[${priority}]</b>`;

                return {
                    username: responsible,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [Torrent-Deleted]-[Title: title]-[User: user]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[Torrent-Deleted\]-\[(.+)\]-\[User: ([^\]]+)\].*$/);
                if (!match) return null;

                const title = match[1];
                const user = match[2];

                const newMessage = `Deleted: ${title}`;

                return {
                    username: user,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: [New-Report]-[Type: type]-[Reporter: user]-[Title: title]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-Report\]-\[Type: ([^\]]+)\]-\[Reporter: ([^\]]+)\]-\[Title: (.+)\]-\[Link: ([^\]]+)\].*$/);
                if (!match) return null;

                const type = match[1];
                const user = match[2];
                const title = match[3];
                const link = match[4];

                const newMessage = `Reported a ${type.toLowerCase()}: <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${title}</a>`;

                return {
                    username: user,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: User: name (group) - D: downloaded - U: uploaded - Ratio: ratio - Warnings: warnings - link
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^User: (.+) \((.+)\) - D:(.+) - U: (.+) - Ratio: (.+) - Warnings: (.+) - (.+)$/);
                if (!match) return null;

                const user = match[1];
                const group = match[2];
                const downloaded = match[3];
                const uploaded = match[4];
                const ratio = match[5];
                const warnings = match[6];
                const link = match[7];

                const newMessage = `<div style="border:1px solid #444; border-radius:6px; padding:8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; max-width:300px; background:#111; color:#eee;"><div style="font-weight:bold; font-size:13px; margin-bottom:4px; display:flex; justify-content:space-between;"><span style="color:#6cf;">👤 ${user}</span><a href="${link}" style="color:#6cf; text-decoration:none;">View profile →</a></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Group:</span><span style="color:#9f9;">${group}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Downloaded:</span><span>${downloaded}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Uploaded:</span><span>${uploaded}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Ratio:</span><span style="font-weight:bold;">${ratio}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Warnings:</span><span style="color:${warnings > 0 ? '#f66' : '#9f9'};">${warnings}</span></div></div>`

                return {
                    username: user,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: User: name (group) - D: downloaded - U: uploaded - Ratio: ratio - link
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^User: (.+) \((.+)\) - D:(.+) - U: (.+) - Ratio: (.+) - (.+)$/);
                if (!match) return null;

                const user = match[1];
                const group = match[2];
                const downloaded = match[3];
                const uploaded = match[4];
                const ratio = match[5];
                const link = match[6];

                const newMessage = `<div style="border:1px solid #444; border-radius:6px; padding:8px; font-family:Arial,Helvetica,sans-serif; font-size:12px; max-width:300px; background:#111; color:#eee;"><div style="font-weight:bold; font-size:13px; margin-bottom:4px; display:flex; justify-content:space-between;"><span style="color:#6cf;">👤 ${user}</span><a href="${link}" style="color:#6cf; text-decoration:none;">View profile →</a></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Group:</span><span style="color:#9f9;">${group}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Downloaded:</span><span>${downloaded}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Uploaded:</span><span>${uploaded}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Ratio:</span><span style="font-weight:bold;">${ratio}</span></div></div>`

                return {
                    username: user,
                    newMessage: newMessage,
                    prefix: "(@",
                    suffix: ")",
                };
            }
        },
        {
            // Format: announceType:category:leechType:orign:id:size:time:tmdb|type/resolution|year|title|user
            // {{.AnnounceTypeEnum}}:{{.CategoryEnum}}:{{.LeechTypeEnum}}:{{.OriginEnum}}:{{.ID}}:{{.SizeBytes}}:{{.UploadTimeUnixEpoch}}:{{.Meta.Tmdb}}|{{.Type}}/{{.Resolution}}|{{.Year}}|{{.Name}}|{{.Uploader}}
            // Used at: Luminarr

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^(\d):(\d):(\d):(\d):(\d+):(\d+):(\d+):(\d+)\|(.+)\/(.*)\|(.*)\|(.+)\|(.+)/);
                if (!match) return null;

                const announceTypeEnum = match[1];
                const categoryEnum = match[2];
                const leechTypeEnum = match[3];
                const originEnum = match[4];
                const torrentID = match[5];
                const sizeBytes = match[6];
                const uploadTime = match[7];
                const tmdb = match[8];
                const type = match[9];
                const resolution = match[10];
                const year = match[11];
                const title = match[12];
                const uploader = match[13];


                const catEmojis = {
                    '1': '🎬',
                    '2': '📺',
                };
                const emoji = catEmojis[categoryEnum] || '📁';

                const username = `New-upload ${emoji}`;

                const newMessage = `<span style="color: #00bcd4;">[${type}]</span> ${title} <strong>(${formatBytes(sizeBytes)})</strong> By ${uploader} - <a href="https://luminarr.me/torrents/${torrentID}" target="_blank" rel="noopener noreferrer" class="link">https://luminarr.me/torrents/${torrentID}</a>`;

                return {
                    username: username,
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
        {
            // Format: [New-User-App]-[Link: link]
            // Used at: DP

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[New-User-App\]-\[Link: (.*)\]$/);
                if (!match) return null;

                const link = match[1];

                const username = `Application 📝`;

                const newMessage = `New Application - <a href="${link}" target="_blank" rel="noopener noreferrer" class="link">${link}</a>`;
                
                return {
                    username: username,
                    newMessage: newMessage,
                    prefix: "(",
                    suffix: ")",
                    skipUserList: true, // This message doesn't correspond to a real user, so we can skip showing it in the user list
                };
            }
        },
    ];

    // --- STOP EDITING STUFF HERE ---

    // SURGICAL DOM MODIFICATION FUNCTIONS:
    // These functions modify message content while preserving event listeners and preview functionality

    function findPrefixTextNodes(contentSpan, prefixText) {
        // Find all text nodes that contain the prefix we want to remove
        const walker = document.createTreeWalker(
            contentSpan,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let accumulatedText = '';
        const nodesToProcess = [];
        let textNode;

        // Walk through text nodes until we've found all the prefix text
        while (textNode = walker.nextNode()) {
            const nodeText = textNode.textContent;
            nodesToProcess.push({
                node: textNode,
                text: nodeText,
                accumulatedLength: accumulatedText.length
            });

            accumulatedText += nodeText;

            // Stop when we have enough text to contain the full prefix
            if (accumulatedText.length >= prefixText.length) {
                break;
            }
        }

        return { nodesToProcess, accumulatedText };
    }

    function removePrefixSurgically(contentSpan, prefixText) {
        // Surgically remove prefix text while preserving all DOM structure and event listeners
        const { nodesToProcess, accumulatedText } = findPrefixTextNodes(contentSpan, prefixText);

        // Clean zero-width characters from accumulated text for comparison
        // This ensures we match the same cleaned text that handlers worked with
        const cleanedAccumulatedText = accumulatedText.replace(/[\u200B-\u200D\uFEFF]/g, '');

        // Verify we found the expected prefix (after cleaning)
        if (!cleanedAccumulatedText.startsWith(prefixText)) {
            console.warn('Surgical removal failed - could not find expected prefix:', prefixText);
            console.warn('Looking for:', JSON.stringify(prefixText));
            console.warn('Found in DOM:', JSON.stringify(cleanedAccumulatedText.substring(0, prefixText.length + 10)));
            return false;
        }

        // We need to account for zero-width characters when calculating removal length
        // Calculate how much to remove from the original (uncleaned) text
        let remainingToRemove = prefixText.length;
        let cleanedCharsProcessed = 0;

        // Process each text node to remove the prefix
        for (const { node, text } of nodesToProcess) {
            if (cleanedCharsProcessed >= prefixText.length) break;

            // Clean this node's text to see how much of the prefix it contains
            const cleanedNodeText = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
            const cleanedNodeLength = cleanedNodeText.length;

            // Calculate how much of the cleaned prefix this node represents
            const cleanedCharsInThisNode = Math.min(cleanedNodeLength, prefixText.length - cleanedCharsProcessed);
            cleanedCharsProcessed += cleanedCharsInThisNode;

            if (cleanedCharsInThisNode === cleanedNodeLength) {
                // This entire node's cleaned content is part of the prefix - remove it all
                node.textContent = '';
            } else {
                // This node contains the end of the prefix
                // We need to find where the prefix ends in the original (uncleaned) text
                let originalCharsToRemove = 0;
                let cleanedCount = 0;

                for (let i = 0; i < text.length && cleanedCount < cleanedCharsInThisNode; i++) {
                    const char = text[i];
                    originalCharsToRemove++;

                    // Count non-zero-width characters
                    if (!/[\u200B-\u200D\uFEFF]/.test(char)) {
                        cleanedCount++;
                    }
                }

                node.textContent = text.substring(originalCharsToRemove);
                break; // We're done
            }
        }

        // Clean up empty text nodes and their containers
        cleanupEmptyNodes(contentSpan);

        return true;
    }

    function cleanupEmptyNodes(contentSpan) {
        // Remove empty text nodes
        const walker = document.createTreeWalker(
            contentSpan,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const emptyTextNodes = [];
        let textNode;

        while (textNode = walker.nextNode()) {
            if (textNode.textContent === '') {
                emptyTextNodes.push(textNode);
            }
        }

        emptyTextNodes.forEach(node => node.remove());

        // Remove empty span elements that only contained removed text
        // Be careful not to remove spans that might be important for styling or functionality
        const emptySpans = contentSpan.querySelectorAll('span:empty');
        emptySpans.forEach(span => {
            // Only remove spans that don't have important classes
            const classes = span.className;
            const importantClasses = ['preview-size', 'toggle-button', 'user', 'irc-fg', 'irc-bg'];
            const hasImportantClass = importantClasses.some(cls => classes.includes(cls));

            if (!hasImportantClass) {
                span.remove();
            }
        });
    }

    // Run through format handlers to find a match
    // Returns { username, prefixToRemove, metadata, newMessage, prefix, suffix } or null if no match
    function runFormatHandlers(msg) {
        for (const formatHandler of HANDLERS) {
            if (!formatHandler.enabled) continue; // Skip disabled handlers
            const result = formatHandler.handler(msg);
            if (result) {
                return result;
            }
        }
        return null;
    }

    // Insert username into Vue store for autocomplete
    // By marks: https://aither.cc/forums/topics/3874/posts/32274
    function addUserToAutocomplete(username) {
        try {
            const state = Array.from(document.querySelectorAll('*'))
                .find(e => e.__vue_app__)?.__vue_app__?.config?.globalProperties?.$store?.state;

            if (!state?.activeChannel?.channel?.users) return;

            const users = state.activeChannel.channel.users;
            if (!users.find(u => u.nick === username)) {
                users.push({ nick: username, modes: [], lastMessage: Date.now() });
            }
        } catch (error) {
            console.warn('Could not add user ' + username + ' for autocomplete:', error);
        }
    }

    // COLOR MATCHING FUNCTIONS:
    // Handle color assignment for bridged usernames

    function findUserInUserlist(username) {
        // Find user in the DOM userlist, accounting for IRC mode symbols (@, +, !, etc.)
        const userlistUsers = document.querySelectorAll('.userlist .user[data-name]');

        for (const userElement of userlistUsers) {
            const dataName = userElement.getAttribute('data-name');
            if (dataName === username) {
                return userElement;
            }
        }
        return null;
    }

    function getUserColor(username) {
        // Get the color class for a username, either from existing userlist or by adding them first
        let userElement = findUserInUserlist(username);

        if (!userElement) {
            // User not found in userlist, add them to autocomplete which should also add to DOM
            addUserToAutocomplete(username);

            // Try again after adding - give it a moment to update the DOM
            setTimeout(() => {
                userElement = findUserInUserlist(username);
                if (userElement) {
                    return extractColorClass(userElement);
                }
            }, 50);

            // If still not found, return null and we'll try again later
            return null;
        }

        return extractColorClass(userElement);
    }

    function extractColorClass(userElement) {
        // Extract the color-X class from a user element
        const classes = userElement.className.split(' ');
        const colorClass = classes.find(cls => cls.startsWith('color-'));
        return colorClass || null;
    }

    function applyColorToMessage(userSpan, colorClass) {
        // Apply the color class to the message's userSpan
        if (colorClass) {
            // Remove any existing color classes
            const classes = userSpan.className.split(' ');
            const filteredClasses = classes.filter(cls => !cls.startsWith('color-'));
            // Add the new color class
            filteredClasses.push(colorClass);
            userSpan.className = filteredClasses.join(' ');
        }
    }

    // Called on page load to process any shoutbox messages already present,
    // before the observer starts watching for new messages
    function processExistingMessages() {
        const messages = document.querySelectorAll('.msg'); // Select all message elements
        messages.forEach(processMessage); // Process each message
    }

    // Check if a nick matches any bot pattern (string or regex)
    function matcherMatches(username) {
        let matched = false;
        CONFIG.BOT_USERNAMES.forEach(element => {
            if (element.test(username)) {
                matched = true;
            }
        }); 

        return matched || BOT_SITES.find(site => {
            if (typeof site.matcher === 'undefined') return false;
            if (typeof site.matcher === 'string') {
                return username === site.matcher;
            }
            return site.matcher.test(username);
        });
    }

    BOT_SITES.getSite = function(host, channel) {
        for (let site of BOT_SITES) {
            if (site.host === host && (!site.channels || site.channels.includes(channel))) {
                return site;
            }
        }
        return null;
    };

    function getActiveNetworkAndChannel() {
        const active = document.querySelector('.channel-list-item.active');
        if (!active) return null;
        const network = active.closest('.network');
        if (!network) return null;
        return {
            network_id: network?.getAttribute('id') || null,
            network_host: localStorage.getItem(`network:${network?.getAttribute('id').substring(8)}:host`) || null,
            channel: active.getAttribute('data-name') || null,
        };
    }

    // Metadata storage functions for storing additional info about bridged users (like which site they are from)
    function metaKey(site, username) {
        return `UserMeta:${site.name}:${username}`;
    }

    function metaGet(site, username) {
        return GM_getValue(metaKey(site, username), null);
    }

    function metaSet(site, username, data) {
        GM_setValue(metaKey(site, username), data);
    }

    function siteFallbackDataUrlKey(site) {
        return `${site.name}:__fallback_avatar__`;
    }

    function siteRankKey(site) {
        return `${site.name}:ranks`;
    }

    function fontKey(site) {
        return `${site.name}:font`;
    }
    
    function FontCodePointKey(site) {
        return `${site.name}:font_codepoints`;
    }

    // indexedDB functions for storing and retrieving user colors persistently
    const IDB_NAME = "UserAvatarCache";
    const IDB_AVATAR_STORE = "avatars";
    const IDB_SITE_ASSET_STORE = "siteAssets";
    const IDB_VERSION = 4; // This must be incremented if we change the database schema (like adding new object stores)
    let idb = null;

    function openIdb() {
        if (idb) return Promise.resolve(idb);

        return new Promise((resolve, reject) => {
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);

            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(IDB_AVATAR_STORE)) {
                    db.createObjectStore(IDB_AVATAR_STORE);
                }
                if (!db.objectStoreNames.contains(IDB_SITE_ASSET_STORE)) {
                    db.createObjectStore(IDB_SITE_ASSET_STORE);
                }
            };

            req.onsuccess = () => {
                idb = req.result;
                resolve(idb);
            };

            req.onerror = () => reject(req.error);
        });
    }

    function avatarKey(site, username) {
        return `${site.name}:${username}:avatar`;
    }

    function iconKey(site, username) {
        return `${site.name}:${username}:icon`;
    }

    async function idbGetUserAsset(key) {
        const db = await openIdb();
        return new Promise(resolve => {
            const tx = db.transaction(IDB_AVATAR_STORE, "readonly");
            const req = tx.objectStore(IDB_AVATAR_STORE).get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    }

    async function idbSetUserAsset(key, blob) {
        const db = await openIdb();
        return new Promise(resolve => {
            const tx = db.transaction(IDB_AVATAR_STORE, "readwrite");
            tx.objectStore(IDB_AVATAR_STORE).put(blob, key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    }

    async function idbGetSiteAsset(key) {
        const db = await openIdb();
        return new Promise(resolve => {
            const tx = db.transaction(IDB_SITE_ASSET_STORE, "readonly");
            const req = tx.objectStore(IDB_SITE_ASSET_STORE).get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    }

    async function idbSetSiteAsset(key, value) {
        const db = await openIdb();
        return new Promise(resolve => {
            const tx = db.transaction(IDB_SITE_ASSET_STORE, "readwrite");
            tx.objectStore(IDB_SITE_ASSET_STORE).put(value, key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    }

    async function clearProfileCache() {
        const keys = await GM_listValues();

        const metaKeys = keys.filter(k => k.startsWith("UserMeta:"));

        for (const key of metaKeys) {
            GM_deleteValue(key);
        }
    }

    async function clearAvatarCache() {
        const db = await openIdb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_AVATAR_STORE, "readwrite");
            const store = tx.objectStore(IDB_AVATAR_STORE);

            const clearReq = store.clear();

            clearReq.onsuccess = () => {
                resolve();
            };

            clearReq.onerror = () => reject(clearReq.error);
        });
    }

    async function clearAssetCache() {
        const db = await openIdb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_SITE_ASSET_STORE, "readwrite");
            const store = tx.objectStore(IDB_SITE_ASSET_STORE);

            const clearReq = store.clear();

            clearReq.onsuccess = () => {
                resolve();
            };

            clearReq.onerror = () => reject(clearReq.error);
        });
    }

    async function fetchSiteRanks(site) {
        const key = siteRankKey(site);

        const cached = await idbGetSiteAsset(key);
        if (cached && Date.now() - cached.cachedAt < CONFIG.SITE_CACHE_TTL) {
            return cached.ranks;
        }

        const response = await gmFetchSite(site, {
            method: "GET",
            url: site.groupsUrl,
            responseType: "text",
            withCredentials: true
        }, 2);

        if (response.status !== 200) {
            throw new Error("Failed to fetch rank page");
        }

        const doc = new DOMParser().parseFromString(response.responseText, "text/html");

        const ranks = {};

        const rows = doc.querySelectorAll("tr");

        rows.forEach(row => {
            const span = row.querySelector("td span[style*='color']");
            if (!span) return;

            const colorMatch = span.getAttribute("style")?.match(/color:\s*([^;]+)/i);
            const color = colorMatch ? colorMatch[1].trim() : null;

            const icon = span.querySelector("i");
            const iconClass = icon ? icon.className : null;

            const rankName = span.textContent.trim();

            if (rankName) {
                ranks[rankName] = {
                    color,
                    iconClass
                };
            }
        });

        await idbSetSiteAsset(key, {
            ranks,
            cachedAt: Date.now()
        });

        return ranks;
    }

    async function ensureSiteFontAwesome(site) {
        const fontCacheKey = fontKey(site);
        const codepointCacheKey = FontCodePointKey(site);
        const styleId = `fa-${site.name}`;

        if (document.getElementById(styleId)) return;

        // 1️⃣ Cache
        let cachedFonts = await idbGetSiteAsset(fontCacheKey);
        let cachedCodepoints = await idbGetSiteAsset(codepointCacheKey);

        let fonts = cachedFonts || {};
        let codepoints = cachedCodepoints || null;

        // 2️⃣ Discover + fetch fonts if missing
        if (!fonts || Object.keys(fonts).length === 0) {
            const discoveredFonts = await discoverFaFontUrl(site);

            if (!discoveredFonts) {
                console.warn(`[FA] No fonts discovered for ${site.name}`);
                return;
            }

            fonts = {};

            for (const [type, url] of Object.entries(discoveredFonts)) {
                try {
                    let dataUrl = url;

                    if (!url.startsWith("data:")) {
                        const res = await gmFetchSite(site, {
                            method: "GET",
                            url,
                            responseType: "blob",
                            withCredentials: true
                        }, 2);

                        if (res.status !== 200) continue;

                        dataUrl = await blobToDataUrl(res.response);
                    }

                    fonts[type] = dataUrl;

                } catch (e) {
                    console.warn(`[FA] Failed fetching ${type} font for ${site.name}`, e);
                }
            }

            await idbSetSiteAsset(fontCacheKey, fonts);
        }

        // 3️⃣ Codepoints
        if (!codepoints) {
            codepoints = await discoverFaCodepoints(site);
        }

        // 4️⃣ Inject
        injectSiteFontStyles(site, fonts, codepoints);
    }

    function blobToDataUrl(blob) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    function extractFaBeforeRules(cssText) {
        const matches = cssText.match(/\.fa-[^}]+:before{content:"[^"]+"}/g);
        return matches || [];
    }

    /**
     * Discover FA :before rules dynamically for a single site.
     * - Fetches homepage HTML
     * - Extracts <link rel="stylesheet"> in document order
     * - Fetches each CSS file
     * - Extracts .fa-*:before rules
     * - Caches them using FontCodePointKey(site)
     */
    async function discoverFaCodepoints(site) {
        const codepointCacheKey = FontCodePointKey(site);

        try {
            // 1️⃣ Fetch homepage
            const htmlResponse = await gmFetchSite(site, {
                method: "GET",
                url: `https://${site.domain}`,
                responseType: "text",
                withCredentials: true
            }, 2);

            if (htmlResponse.status !== 200) {
                console.warn(`[FA] Failed to load homepage for ${site.name}`);
                return null;
            }

            const html = htmlResponse.responseText;

            // 2️⃣ Extract stylesheet links in document order
            const cssUrls = [];
            const seen = new Set();

            const linkRegex = /<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi;
            let match;

            while ((match = linkRegex.exec(html)) !== null) {
                const tag = match[0];
                const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
                if (!hrefMatch) continue;

                let href = hrefMatch[1].trim();

                // Normalize URL
                if (href.startsWith("//")) {
                    href = "https:" + href;
                } else if (href.startsWith("/")) {
                    href = `https://${site.domain}${href}`;
                } else if (!href.startsWith("http")) {
                    href = `https://${site.domain}/${href}`;
                }

                if (!seen.has(href)) {
                    seen.add(href);
                    cssUrls.push(href);
                }
            }

            // 3️⃣ Fetch CSS files in order and extract FA rules
            for (const cssUrl of cssUrls) {
                // Optional optimization: prioritize build/assets bundles
                if (!cssUrl.includes("build") && !cssUrl.includes("asset") && !cssUrl.includes("main")) {
                    continue;
                }

                try {
                    const cssResponse = await gmFetchSite(site, {
                        method: "GET",
                        url: cssUrl,
                        responseType: "text",
                        withCredentials: true
                    }, 2);

                    if (cssResponse.status !== 200) continue;

                    const cssText = cssResponse.responseText;

                    // Quick FA detection shortcut
                    if (!cssText.includes(".fa-") || !cssText.includes(":before")) {
                        continue;
                    }

                    const beforeRules = extractFaBeforeRules(cssText);

                    await idbSetSiteAsset(codepointCacheKey, beforeRules);
                    return beforeRules;

                } catch (err) {
                    console.warn(`[FA] Failed fetching CSS ${cssUrl}`, err);
                }
            }

            console.warn(`[FA] No FA rules discovered for ${site.name}`);
            return null;

        } catch (err) {
            console.error(`[FA] discoverFaCodepoints error for ${site.name}`, err);
            return null;
        }
    }

    const fontTypes = [
        { key: "solid", regex: /fa-solid-900[^"')]+\.woff2/ },
        { key: "regular", regex: /fa-regular-400[^"')]+\.woff2/ },
        { key: "brands", regex: /fa-brands-400[^"')]+\.woff2/ }
    ];

    /**
     * Discover the FontAwesome solid font URL dynamically.
     * Looks through CSS bundles for @font-face blocks referencing fa-solid-900
     */
    async function discoverFaFontUrl(site) {
        const fonts = {};
        try {
            // 1️⃣ Fetch homepage
            const htmlResponse = await gmFetchSite(site, {
                method: "GET",
                url: `https://${site.domain}`,
                responseType: "text",
                withCredentials: true
            }, 2);

            if (htmlResponse.status !== 200) {
                console.warn(`[FA] Failed loading homepage for ${site.name}`);
                return null;
            }

            const html = htmlResponse.responseText;

            // 2️⃣ Extract stylesheet links
            const cssUrls = [];
            const seen = new Set();
            const linkRegex = /<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi;
            let match;

            while ((match = linkRegex.exec(html)) !== null) {
                const tag = match[0];
                const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
                if (!hrefMatch) continue;

                let href = hrefMatch[1].trim();

                if (href.startsWith("//")) {
                    href = "https:" + href;
                } else if (href.startsWith("/")) {
                    href = `https://${site.domain}${href}`;
                } else if (!href.startsWith("http")) {
                    href = `https://${site.domain}/${href}`;
                }

                if (!seen.has(href)) {
                    seen.add(href);
                    cssUrls.push(href);
                }
            }

            // 3️⃣ Fetch CSS files and look for @font-face
            for (const cssUrl of cssUrls) {
                console.log(`[FA] Checking CSS ${cssUrl} for fonts...`);
                try {
                    const cssResponse = await gmFetchSite(site, {
                        method: "GET",
                        url: cssUrl,
                        responseType: "text",
                        withCredentials: true
                    }, 2);

                    if (cssResponse.status !== 200) continue;

                    const cssText = cssResponse.responseText;

                    if (!cssText.includes("@font-face") || !cssText.includes("fa-")) {
                        continue;
                    }

                    for (const { key, regex } of fontTypes) {
                        const match = cssText.match(new RegExp(`url\\(["']?([^"')]*${regex.source})["']?\\)`));
                        if (match && match[1]) {
                            let url = match[1];

                            if (url.startsWith("//")) {
                                url = "https:" + url;
                            } else if (url.startsWith("/")) {
                                url = `https://${site.domain}${url}`;
                            } else if (!url.startsWith("http")) {
                                url = `https://${site.domain}/${url}`;
                            }

                            fonts[key] = url;
                        }
                    }

                } catch (err) {
                    console.warn(`[FA] Failed reading CSS ${cssUrl}`, err);
                }
            }

            if (Object.keys(fonts).length > 0) {
                return fonts;
            }

            console.warn(`[FA] No fa-solid-900 font found for ${site.name}`);
            return null;

        } catch (err) {
            console.error(`[FA] discoverFaFontUrl error for ${site.name}`, err);
            return null;
        }
    }


    function injectSiteFontStyles(site, fonts, beforeRules) {
        const styleId = `fa-${site.name}`;

        if (document.getElementById(styleId)) return;

        const style = document.createElement("style");
        style.id = styleId;

        let css = "";

        // --- FONT FACES ---
        if (fonts.solid) {
            css += `
            @font-face {
                font-family: "FA-${site.name}-Solid";
                font-style: normal;
                font-weight: 900;
                src: url("${fonts.solid}") format("woff2");
            }`;
        }

        if (fonts.regular) {
            css += `
            @font-face {
                font-family: "FA-${site.name}-Regular";
                font-style: normal;
                font-weight: 400;
                src: url("${fonts.regular}") format("woff2");
            }`;
        }

        if (fonts.brands) {
            css += `
            @font-face {
                font-family: "FA-${site.name}-Brands";
                font-style: normal;
                font-weight: 400;
                src: url("${fonts.brands}") format("woff2");
            }`;
        }

        // --- FONT MAPPING ---
        css += `
        i.group-${site.name}.fa,
        i.group-${site.name}.fas,
        i.group-${site.name}.fa-solid,
        i.group-${site.name}.fal,
        i.group-${site.name}.fad {
            font-family: "FA-${site.name}-Solid" !important;
            font-weight: 900 !important;
        }

        i.group-${site.name}.far,
        i.group-${site.name}.fa-regular {
            font-family: "FA-${site.name}-Regular" !important;
            font-weight: 400 !important;
        }

        i.group-${site.name}.fab,
        i.group-${site.name}.fa-brands {
            font-family: "FA-${site.name}-Brands" !important;
            font-weight: 400 !important;
        }

        i.group-${site.name} {
            font-style: normal;
            display: inline-block;
            line-height: 1;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        `;


        // --- CODEPOINTS ---
        if (beforeRules && beforeRules.length > 0) {
            css += beforeRules.join("\n");
        }

        style.textContent = css;
        document.head.appendChild(style);
    }

    // UserCacheManager class to handle caching of user colors and avatars
    class UserCacheManager {
        constructor() {
            this.memory = new Map();     // runtime cache
            this.pending = new Map();    // request dedupe
        }

        async getUser(site, username, priority = 0) {
            const key = `${site.name}:${username}`;

            // Get from in-memory cache if available
            if (this.memory.has(key)) {
                return this.memory.get(key);
            }

            // If there's already a pending request for this user, return that promise to dedupe
            if (this.pending.has(key)) {
                return this.pending.get(key);
            }

            // Otherwise, start a new request and store the promise in pending
            const promise = this._getUserInternal(site, username, priority)
                .finally(() => this.pending.delete(key));

            this.pending.set(key, promise);
            return promise;
        }

        async _getUserInternal(site, username, priority = 0) {
            const now = Date.now();
            const meta = metaGet(site, username);

            // Valid cache exists → use it
            if (meta && now - meta.profileCachedAt < CONFIG.PROFILE_CACHE_TTL) { // If the shorter TTL is still valid, use cache
                const user = await this._buildUserFromCache(site, username, meta);
                this.memory.set(`${site.name}:${username}`, user);
                return user;
            }

            // Cache expired but exists → use stale, refresh in background
            if (meta) {
                this._refreshInBackground(site, username, priority);
                const user = await this._buildUserFromCache(site, username, meta);
                this.memory.set(`${site.name}:${username}`, user);
                return user;
            }

            // No cache at all → fetch fresh and store
            try {
                const meta = await this._fetchAndStore(site, username, priority);
                const user = await this._buildUserFromCache(site, username, meta);
                this.memory.set(`${site.name}:${username}`, user);
                return user;
            } catch (e) {
                return this._placeholder(site, username);
            }
        }

        async _fetchAndStore(site, username, priority = 0) {
            const profileUrl = site.getProfileUrl(username);
            const now = Date.now();
            const cachedMeta = metaGet(site, username);
            const cachedUser = cachedMeta ? await this._buildUserFromCache(site, username, cachedMeta) : null;

            let meta = {
                ...(cachedMeta || {}),
                profileCachedAt: null,
                avatarCachedAt: null,
                iconCachedAt: null,
                noAvatar: false,
            };

            if (cachedMeta && cachedUser) {
                if (now - cachedMeta.profileCachedAt < CONFIG.PROFILE_CACHE_TTL) {
                    meta.profileCachedAt = cachedMeta.profileCachedAt;
                }
                if (now - cachedMeta.avatarCachedAt < CONFIG.AVATAR_CACHE_TTL) {
                    meta.avatarCachedAt = cachedMeta.avatarCachedAt;
                }
                if (now - cachedMeta.iconCachedAt < CONFIG.ICON_CACHE_TTL) {
                    meta.iconCachedAt = cachedMeta.iconCachedAt;
                }
            }

            let avatarPromise = Promise.resolve({ status: 204 }); // Default to 204 if we aren't fetching
            let profilePromise = Promise.resolve({ status: 404 }); // Default to 404 if we aren't fetching, since profile is required for a valid user
            let userIconPromise = Promise.resolve({ status: 204 }); // Default to 204 if we aren't fetching

            if (!meta.avatarCachedAt) {
                avatarPromise = gmFetchSite(site, {
                    method: "GET",
                    url: site.getAvatarUrl(username),
                    responseType: "blob",
                    withCredentials: true
                }, priority);
            }

            if (!meta.profileCachedAt) {
                profilePromise = gmFetchSite(site, {
                    method: "GET",
                    url: profileUrl,
                    responseType: "text",
                    withCredentials: true
                }, priority);
            }

            if (!meta.iconCachedAt) {
                userIconPromise = gmFetchSite(site, {
                    method: "GET",
                    url: site.getIconUrl(username),
                    responseType: "blob",
                    withCredentials: true
                }, priority);
            }

            const [avatarResp, profileResp, userIconResp] = await Promise.all([avatarPromise, profilePromise, userIconPromise]);

            if (!(profileResp.status == 200 || profileResp.status == 404)) {
                console.error(`Was unable to acces user's: ${username} details returned status code: `, profileResp.status)
                throw new Error("Unable to access user profile")
            }

            // Profile fetch
            if (profileResp.status === 200) {
                const html = profileResp.responseText;
                const doc = new DOMParser().parseFromString(html, "text/html");
                meta.userclass = doc.querySelector(".user-tag__link")?.title || "Anonymous";
                const ranks = await fetchSiteRanks(site);
                meta.rankData = ranks[meta.userclass] || null;
                meta.profileCachedAt = Date.now(); // update profile timestamp
            } else if (profileResp.status === 404) {
                // still mark it as cached, just empty/default
                meta.rankData = null;
                meta.profileCachedAt = Date.now();
            }

            // Avatar fetch
            if (avatarResp.status === 200) {
                let blob = avatarResp.response;
                let avatarUrl = await blobToDataUrl(blob);
                await idbSetUserAsset(avatarKey(site, username), avatarUrl);
                meta.avatarCachedAt = Date.now();
            } else if (avatarResp.status === 404) {
                // cache fallback
                let fallbackAvatarDataUrl = await idbGetSiteAsset(siteFallbackDataUrlKey(site));
                if (!fallbackAvatarDataUrl && site.placeholderAvatarUrl) {
                    const fallbackResp = await gmFetchSite(site, {
                        method: "GET",
                        url: site.placeholderAvatarUrl,
                        responseType: "blob",
                        withCredentials: true
                    }, 2);
                    if (fallbackResp.status === 200) {
                        let blob = fallbackResp.response;
                        fallbackAvatarDataUrl = await blobToDataUrl(blob);
                        await idbSetSiteAsset(siteFallbackDataUrlKey(site), fallbackAvatarDataUrl);
                    }
                }
                if (fallbackAvatarDataUrl) {
                    await idbSetUserAsset(avatarKey(site, username), fallbackAvatarDataUrl);
                }
                meta.noAvatar = true;
                meta.avatarCachedAt = Date.now(); // still update cachedAt!
            }

            // User icon fetch
            if (userIconResp.status === 200) {
                let blob = userIconResp.response;
                let iconUrl = await blobToDataUrl(blob);
                await idbSetUserAsset(iconKey(site, username), iconUrl);
                meta.iconCachedAt = Date.now();
            } else if (userIconResp.status === 404) {
                meta.iconCachedAt = Date.now(); // still update cachedAt
            }

            // Save meta at the end no matter what
            metaSet(site, username, meta);

            if (avatarResp.status === 200 || avatarResp.status === 404 || avatarResp.status === 204) {
                return meta;
            }

            // ❌ Any other error (401, 403, 429, 500, etc.)
            console.warn("Avatar fetch failed (not caching):", avatarResp.status);
            console.warn("User meta:", meta);
            throw new Error("Temporary failure");
        }

        async _buildUserFromCache(site, username, meta) {
            let avatarUrl = await idbGetUserAsset(avatarKey(site, username));
            let iconUrl = await idbGetUserAsset(iconKey(site, username));

            if (meta.noAvatar) {
                let fallbackAvatarUrl = await idbGetSiteAsset(siteFallbackDataUrlKey(site));

                if (!fallbackAvatarUrl && site.placeholderAvatarUrl) {
                    const fallbackResp = await gmFetchSite(site, {
                        method: "GET",
                        url: site.placeholderAvatarUrl,
                        responseType: "blob",
                        withCredentials: true
                    }, 2);

                    if (fallbackResp.status === 200) {
                        let blob = fallbackResp.response;
                        fallbackAvatarUrl = await blobToDataUrl(blob);
                        await idbSetSiteAsset(siteFallbackDataUrlKey(site), fallbackAvatarUrl);
                    }
                }

                if (fallbackAvatarUrl) {
                    avatarUrl = fallbackAvatarUrl;
                }

                return {
                    username: username,
                    avatarUrl: avatarUrl,
                    userIconUrl: iconUrl,
                    rankData: meta.rankData,
                    userclass: meta.userclass,
                    meta: meta,
                };
            }

            return {
                username: username,
                avatarUrl: avatarUrl,
                userIconUrl: iconUrl,
                rankData: meta.rankData,
                userclass: meta.userclass,
                meta: meta,
            };
        }

        async _refreshInBackground(site, username, priority = 0) {
            try {
                await this._fetchAndStore(site, username, priority);
            } catch {
                // silent fail (likely not logged in)
            }
        }

        _placeholder(site, username) {
            return {
                username: username,
                avatarUrl: site.placeholderAvatar,
                userIconUrl: null,
                rankData: null,
                meta: {},
            };
        }
    }

    class PriorityQueue {
        constructor() {
            this.buckets = new Map();     // priority -> Set(items)
            this.itemMap = new Map();     // item -> priority
            this.priorities = [];         // sorted DESC
        }

        _ensurePriority(priority) {
            if (!this.buckets.has(priority)) {
                this.buckets.set(priority, new Set());
                this.priorities.push(priority);
                this.priorities.sort((a, b) => b - a);
            }
        }

        has(item) {
            return this.itemMap.has(item);
        }

        getPriority(item) {
            return this.itemMap.get(item); // undefined if not present
        }

        addOrUpgrade(item, priority) {
            if (this.itemMap.has(item)) {
                const oldPriority = this.itemMap.get(item);

                // Only upgrade if higher priority
                if (priority <= oldPriority) return false;

                const oldSet = this.buckets.get(oldPriority);
                oldSet.delete(item);

                if (oldSet.size === 0) {
                    this.buckets.delete(oldPriority);
                    this.priorities = this.priorities.filter(p => p !== oldPriority);
                }
            }

            this._ensurePriority(priority);

            this.buckets.get(priority).add(item);
            this.itemMap.set(item, priority);

            return true;
        }

        dequeue() {
            for (const priority of this.priorities) {
                const set = this.buckets.get(priority);
                if (set && set.size > 0) {
                    const item = set.values().next().value;

                    set.delete(item);
                    this.itemMap.delete(item);

                    if (set.size === 0) {
                        this.buckets.delete(priority);
                        this.priorities = this.priorities.filter(p => p !== priority);
                    }

                    return item;
                }
            }
            return null;
        }

        peek() {
            for (const priority of this.priorities) {
                const set = this.buckets.get(priority);
                if (set && set.size > 0) {
                    return set.values().next().value;
                }
            }
            return null;
        }

        size() {
            return this.itemMap.size;
        }
    }

    // ------------------------------
    // Per-site queue state
    // ------------------------------
    const GM_QUEUES = {}; // site.name -> { queue: PriorityQueue, active: 0, recentRequests: [] }
    const GM_BUFFERS = {}; // site.name -> [ [type, ...args], ... ] for logging
    const MAX_CONCURRENT = 2;   // Max simultaneous requests per site
    const REQUEST_DELAY = 500;  // ms between requests
    const RATE_WINDOW = 20_000; // 2 seconds rolling window
    const RATE_LIMIT = 25;      // max requests per window

    let gmRequestId = 0;

    // Global debug
    window.__gmDebug = {
        total: 0,
        requests: []
    };

    // In-flight deduplication: siteName -> url -> Promise
    const inflightGM = {};
    const queuedGM = {}; // site -> url -> job

    function getQueueForSite(siteName) {
        if (!GM_QUEUES[siteName]) {
            GM_QUEUES[siteName] = { queue: new PriorityQueue(), active: 0, recentRequests: [] };
        }
        if (!inflightGM[siteName]) {
            inflightGM[siteName] = {};
        }
        if (!queuedGM[siteName]) {
            queuedGM[siteName] = {};
        }
        if (!GM_BUFFERS[siteName]) {
            GM_BUFFERS[siteName] = {};
        }

        return GM_QUEUES[siteName];
    }

    async function gmFetchSite(site, options, priority = 0) {
        const url = options.url;
        const siteQueue = getQueueForSite(site.name);

        if (!GM_BUFFERS[site.name][url]) {
            GM_BUFFERS[site.name][url] = [];
        }

        const start = performance.now();
        const stack = new Error("GM_xmlhttpRequest call site");
        const log = (...args) => GM_BUFFERS[site.name][url].push(["log", ...args]);
        const warn = (...args) => GM_BUFFERS[site.name][url].push(["warn", ...args]);

        log("QUEUE", options.method || "GET", url, "priority:", priority);

        // =========================
        // ✅ QUEUED DEDUPE + UPGRADE (FIRST!)
        // =========================
        const existingJob = queuedGM[site.name][url];
        if (existingJob) {
            log("DEDUP (queued)", options.method || "GET", url);
            log("Current Priority:", siteQueue.queue.getPriority(existingJob));

            if (priority > existingJob.priority) {
                log(`UPGRADE → ${["LOW","HIGH","CRITICAL"][priority]} ${url}`);
                existingJob.priority = priority;

                siteQueue.queue.addOrUpgrade(existingJob, priority);
                log("New Priority:", siteQueue.queue.getPriority(existingJob));
            }

            return existingJob.promise;
        }

        // =========================
        // ✅ INFLIGHT DEDUPE (SECOND)
        // =========================
        if (inflightGM[site.name][url]) {
            log("DEDUP (inflight)", options.method || "GET", url);
            return inflightGM[site.name][url];
        }

        // =========================
        // ✅ CREATE PROMISE (DEFERRED)
        // =========================
        let resolveFn, rejectFn;
        const promise = new Promise((resolve, reject) => {
            resolveFn = resolve;
            rejectFn = reject;
        });

        // 🚨 preregister immediately (prevents race conditions)
        inflightGM[site.name][url] = promise;

        // =========================
        // ✅ CREATE JOB
        // =========================
        const job = {
            id: ++gmRequestId,
            url,
            priority,
            promise,
            run: () => {
                delete queuedGM[site.name][url]; // no longer queued

                siteQueue.active++;
                siteQueue.recentRequests.push(Date.now());

                log("START", options.method || "GET", url, "priority:", job.priority);

                GM_xmlhttpRequest({
                    ...options,
                    onload: (res) => {
                        const duration = (performance.now() - start).toFixed(1);
                        log("SUCCESS", { status: res.status, duration: `${duration}ms` });

                        if (res.status === 429) {
                            console.log("RATE LIMITED: pausing queue for 30s (should reset the rolling window)");
                            setTimeout(() => done(), 30_000);
                            resolveFn(res);
                        } else {
                            resolveFn(res);
                            done();
                        }

                        flush();
                    },
                    onerror: (err) => {
                        warn("ERROR", err);
                        rejectFn(err);
                        done();
                        flush();
                    },
                    ontimeout: (err) => {
                        warn("TIMEOUT", err);
                        rejectFn(err);
                        done();
                        flush();
                    }
                });
            }
        };

        // =========================
        // ✅ QUEUE MANAGEMENT
        // =========================
        function done() {
            siteQueue.active--;
            setTimeout(processQueue, REQUEST_DELAY);
        }

        function processQueue() {
            if (siteQueue.active >= MAX_CONCURRENT) return;

            const now = Date.now();

            // Clean rolling window
            siteQueue.recentRequests = siteQueue.recentRequests.filter(
                ts => now - ts < RATE_WINDOW
            );

            if (siteQueue.recentRequests.length >= RATE_LIMIT) {
                console.debug("Rate limit hit for", site.name, "- delaying next request until rolling window allows");
                setTimeout(processQueue, 500);
                return;
            }

            const nextJob = siteQueue.queue.dequeue();
            if (!nextJob) return;

            nextJob.run();
        }

        function flush() {
            console.groupCollapsed(
                `[GM#${job.id}] ${options.method || "GET"} ${url} priority: ${job.priority}`
            );

            for (const entry of GM_BUFFERS[site.name][url]) {
                const [type, ...args] = entry;
                console[type](...args);
            }

            console.log(stack);
            console.groupEnd();
        }

        // =========================
        // ✅ STORE + ENQUEUE
        // =========================
        queuedGM[site.name][url] = job;
        siteQueue.queue.addOrUpgrade(job, priority);

        processQueue();

        // =========================
        // ✅ CLEANUP
        // =========================
        promise.finally(() => {
            delete inflightGM[site.name][url];
            delete GM_BUFFERS[site.name][url];
        });

        return promise;
    }

    const IRC_MODE_PREFIXES = /^[~&@%+!]+/;

    function stripIrcPrefix(username) {
        return username.replace(IRC_MODE_PREFIXES, '');
    }

    function applyRankStyling(userSpan, rankIcon, user, site) {
        if (!user.rankData) {
            // console.warn("No rank data available for user:", user);
            user.rankData = {
                    color: "rgb(73, 98, 187)",
                    iconClass: "fad fa-user-lock"
                }; // Fallback to a default color and icon if rank data is missing
        }

        if (user.userclass) {
            userSpan.title = user.userclass;
        }

        if (user.rankData.color) {
            userSpan.style.color = user.rankData.color;
        }

        if (user.rankData.iconClass) {
            rankIcon.className = "group-" + site.name + " " + user.rankData.iconClass + " rank-icon";
            rankIcon.style.marginLeft = "4px";
            rankIcon.style.marginRight = "4px";
        }
    }

    function addAvatarDecorations(userSpan, site, username, priority = 0) {
        userSpan.dataset.originalUsername = username; // Store original username for reference
        userSpan.innerHTML = stripIrcPrefix(username); // Remove any existing text to prevent duplication when adding avatar and icon

        const avatarImg = document.createElement("img");
        avatarImg.src = site.placeholderAvatar;
        avatarImg.className = "chat-avatar";
        avatarImg.width = 17;
        avatarImg.height = 17;
        avatarImg.style.borderRadius = "50%";
        avatarImg.style.marginRight = "4px";

        const iconImg = document.createElement("img");
        iconImg.className = "chat-user-icon";
        iconImg.width = 17;
        iconImg.height = 17;
        iconImg.style.marginLeft = "4px";

        const rankIcon = document.createElement("i");

        cache.getUser(site, username, priority).then(user => {
            avatarImg.src = user.avatarUrl;
            applyRankStyling(userSpan, rankIcon, user, site);
            if (user.userIconUrl) {
                iconImg.src = user.userIconUrl;
                userSpan.appendChild(iconImg);
            }
        });

        userSpan.prepend(rankIcon);
        userSpan.prepend(avatarImg);
    }

    function addBotDecorations(userSpan, site, username, priority = 0) {
        userSpan.dataset.originalUsername = username; // Store original username for reference
        userSpan.innerHTML = stripIrcPrefix(username); // Remove any existing text to prevent duplication when adding avatar and icon

        const rankIcon = document.createElement("i");
        rankIcon.className = "group-" + site.name + " fad fa-user-robot rank-icon";
        rankIcon.style.marginLeft = "4px";
        rankIcon.style.marginRight = "4px";

        userSpan.title = "Bot";
        userSpan.style.color = "rgb(73, 98, 187)";

        userSpan.prepend(rankIcon);
    }

    // Called by the MutationObserver for each new message
    function processMessage(messageElement) {
        // Removes join/quit messages, if configured
        // If you'd like to do this in pure CSS instead, use:
        // div[data-type=join], div[data-type=quit], div[data-type=condensed] { display: none !important; }
        if (CONFIG.REMOVE_JOIN_QUIT) {
            if (!!messageElement.matches('div[data-type="condensed"],div[data-type="join"],div[data-type="quit"]')) {
                messageElement.style.display = 'none'; // Hide join/quit messages
                return;
            }
        };

        // Get the username
        const userSpan = messageElement.querySelector('.from .user');
        // If we can't find a username, or the username is empty after stripping IRC prefixes, skip processing this message
        if (!userSpan || !userSpan.textContent) return;

        if (userSpan.querySelector('.chat-avatar')) {
            // Avatar already added, skip processing to avoid duplication
            return;
        }

        const initialUsername = stripIrcPrefix(userSpan.textContent);

        // Get the channel (from the closest ancestor with data-current-channel)
        const activeNetworkAndChannel = getActiveNetworkAndChannel();
        if (!activeNetworkAndChannel) {
            console.warn('Could not determine active network and channel');
            return;
        }

        const bot_match = matcherMatches(initialUsername);

        // Get the message contents
        const contentSpan = messageElement.querySelector('.content'); // Select the content span
        if (!contentSpan) return;

        // Only parse and reformat if a matcher matches the username
        if (!bot_match) {
            // Handle BBCode from IRC users
            const html = BbobHtml.default(contentSpan.innerHTML, BbobPresetHTML5.default());
            const cleanHtml = DOMPurify.sanitize(html);
            contentSpan.innerHTML = cleanHtml;

            contentSpan.querySelectorAll("a").forEach(convertLink);

            // console.debug(`No matcher for user "${initialUsername}", skipping format handlers and applying basic formatting.`);

            // decorateUser(userSpan, 1);
            return;
        }

        // Parse the message using format handlers
        const parsed = runFormatHandlers({
            text: contentSpan.textContent,
            html: contentSpan.innerHTML,
            from: initialUsername,
            chan: activeNetworkAndChannel.channel
        });
        // If no handler matched, do nothing
        if (!parsed) return;

        // Destructure parsed result
        const { username, prefixToRemove, newMessage, metadata, prefix, suffix, skipUserList } = parsed;

        // Check if username changed - if so, we need to change the style and text
        const usernameChanged = (username !== initialUsername);

        // Handle username related changes if the username has been changed
        if (usernameChanged) {
            messageElement.setAttribute('data-from', username);

            // Add and modify message metadata
            userSpan.setAttribute('data-name', username);
            userSpan.setAttribute('data-bridged', metadata); // For CSS targeting
            userSpan.setAttribute('data-bridged-channel', activeNetworkAndChannel.channel); // For CSS targeting

            // Add the custom decorators
            if (CONFIG.USE_DECORATORS) {
                userSpan.textContent = (prefix ?? CONFIG.DECORATOR_L) + username + (suffix ?? CONFIG.DECORATOR_R);
            } else {
                userSpan.textContent = username;
            }

            if (!skipUserList) {
                // Add user to autocomplete
                if (CONFIG.USE_AUTOCOMPLETE) { addUserToAutocomplete(username); }

                // Add the user's color
                const colorClass = getUserColor(username);
                if (colorClass) {
                    applyColorToMessage(userSpan, colorClass);
                } else {
                    // Color not available yet, try again after a delay
                    setTimeout(() => {
                        const retryColorClass = getUserColor(username);
                        if (retryColorClass) {
                            applyColorToMessage(userSpan, retryColorClass);
                        }
                    }, 200);
                }
            }

            if (skipUserList)
            {
                userSpan.skipUserDecorations = true; // Custom property to indicate that this user should be skipped for decorations (used in MutationObserver)
            }
        }

        // Update the message content using surgical approach or skip content modification
        if (prefixToRemove) {
            // Use surgical DOM modification to preserve event listeners and preview functionality
            const success = removePrefixSurgically(contentSpan, prefixToRemove);
            if (!success) {
                console.warn('Surgical prefix removal failed for message from:', username);
            }
        }

        // Parse BBCode and convert links/images in the newMessage content
        // Remove all the lounge created a tags wit hjust it's content
        var input = contentSpan.innerHTML.replace(/\<a(?:.+?)?\>(.*?)\<\/a\>/gi, '[url]$1[/url]');

        // Replace all img tags with the custom image provider
        input = input.replace(/\[img=?([^\]]+)?\]\[url\](.*)\[\/img\]\[\/url\]/gi, (match, width, url) => {
            return getImageHTML(url, width);
        });

        // parse BBCode that might have been send
        const html = BbobHtml.default(input, BbobPresetHTML5.default());
        const cleanHtml = DOMPurify.sanitize(html);
        contentSpan.innerHTML = cleanHtml;

        // Replace all url tags with the lounge default style link
        contentSpan.querySelectorAll("a").forEach(a => {
            if (a.target == "_blank") return; // skip already processed

            a.dir = "auto"
            a.rel = "noopener"
            a.target = "_blank"

            convertLink(a);
        });

        // If handler created a completely new message, replace content
        if (newMessage) {
            contentSpan.innerHTML = newMessage;
        }

        if (!userSpan.skipUserDecorations)
        {
            decorateUser(userSpan, 1);
        }
    }

    function wrapElement(wrapperTag, element) {
            const wrapper = document.createElement(wrapperTag);
            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);
            return wrapper;
        }

    function convertLink(a) {
        const url = a.href;

        // Skip already-converted links
        if (a.querySelector("img")) return;

        if (CONFIG.ALWAYS_DISPLAY_DOMAINS.some((re) => re.test(url)) || CONFIG.IMG_EXT.test(url)) {
            const span = wrapElement("span", a);
            span.style.display = "block";

            // Replace text inside <a> with our <img>
            a.textContent = "";
            a.innerHTML = getImageHTML(url);
        }
    }

    function getImageHTML(url, width = null) {
        const widthParam = width ? width : '500';
        if (CONFIG.BYPASS_EMBED_DOMAINS.some((re) => re.test(url))) {
            return `<a href="${url}" dir="auto" target="_blank" rel="noopener">${url}</a>`
        };
        if (CONFIG.BYPASS_WSRV_DOMAINS.some((re) => re.test(url))) {
            return `<img src="${url}" style="width: ${widthParam}px; max-width: 500px; max-height: 200px; border-radius: 6px; margin-top: 4px;"></img>`
        };
        return `<img src="https://wsrv.nl/?n=-1&w=${widthParam}&h=200&url=${encodeURIComponent(url)}" style="max-width: 500px; max-height: 200px; border-radius: 6px; margin-top: 4px;"></img>`
    }

    let loungeSocket = null; // store socket instance
    const cache = new UserCacheManager();

    const origOnMessage = Object.getOwnPropertyDescriptor(WebSocket.prototype, "onmessage");

    Object.defineProperty(WebSocket.prototype, "onmessage", {
        set(fn) {
        const wrapped = function (event) {
            // capture socket instance
            if (!loungeSocket) loungeSocket = this;

            if (typeof event.data === "string") {
            parseSocketIOPayload(event.data);
            }

            return fn.call(this, event);
        };
        origOnMessage.set.call(this, wrapped);
        },
    });

    function parseSocketIOPayload(data) {
        if (!data.includes("42")) return;

        const parts = data.split("\u001e42");

        parts.forEach(part => {
        if (!part) return;

        try {
            if (part.startsWith("42")) part = part.substring(2);
            const parsed = JSON.parse(part);
            if (parsed[0] === "init") {
                window.__LOUNGE_NETWORKS__ = parsed[1].networks;

                if (loungeSocket && loungeSocket.readyState === WebSocket.OPEN) {
                    window.__LOUNGE_NETWORKS__.forEach(net =>
                    loungeSocket.send(`42${JSON.stringify(["network:get", net.uuid])}`)
                    );
                } else {
                    console.warn("Socket not ready yet, cannot send network:get");
                }
            }
            if (parsed[0] === "network:info") {
                const host = parsed[1].host;

                localStorage.setItem(`network:${parsed[1].uuid}:host`, host);
            }
        } catch {}
        });
    }

    function decorateUser(userSpan, priority = 0) {
        if (userSpan.skipUserDecorations) return;

        const username = userSpan.dataset.name || userSpan.textContent.trim();
        if (!username) return;
        
        const activeNetworkAndChannel = getActiveNetworkAndChannel();
        if (!activeNetworkAndChannel) {
            console.warn('Could not determine active network and channel');
            return;
        }
        
        const site = BOT_SITES.getSite(activeNetworkAndChannel.network_host, activeNetworkAndChannel.channel);

        if (site && !site.disabled) {
            if (userSpan.dataset.decoratedSite === site.name) return;

            const bot_match = matcherMatches(username);
            if (bot_match) {
                addBotDecorations(userSpan, site, username, priority);
            } else {
                addAvatarDecorations(userSpan, site, username, priority);
            }
            userSpan.dataset.decoratedSite = site.name;
        }
        else
        {
            if (userSpan.dataset.originalUsername && userSpan.dataset.decoratedSite)
            {
                userSpan.textContent = userSpan.dataset.originalUsername; // Revert to original username if site is now disabled
                delete userSpan.dataset.originalUsername;
                delete userSpan.dataset.decoratedSite;
                userSpan.removeAttribute("title");
                userSpan.removeAttribute("style");
            }
        }
    }

    // Create and start observing DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList?.contains('msg')) {
                        processMessage(node);
                    } else if (node.classList?.contains('user')) {
                        decorateUser(node, 0);
                    } else {
                        const msgs = node.querySelectorAll?.('.msg');
                        if (msgs?.length) {
                            [...msgs].reverse().forEach(processMessage);
                        }
                        node.querySelectorAll?.('.names .user').forEach(userSpan => decorateUser(userSpan, 0));
                        node.querySelectorAll?.('.messages .user').forEach(userSpan => decorateUser(userSpan, 0));
                    }
                }
            });
        });
        refreshUserList();
    });

    function refreshUserList() {
        const users = document.querySelectorAll(".names .user");

        users.forEach(userSpan => {
            decorateUser(userSpan, 0)
        });
    }

    // Start observing when the chat container is available
    function initializeObserver() {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    GM_registerMenuCommand("Clear All User Cache", async () => {
        if (!confirm("Clear all cached user data (metadata, avatars, assets)?")) return;

        await clearProfileCache();
        await clearAvatarCache();
    });

    GM_registerMenuCommand("Clear Site Cache", async () => {
        if (!confirm("Clear all cached site assets?")) return;

        await clearAssetCache();
    });
    
    GM_registerMenuCommand("Clear ALL Cache", async () => {
        if (!confirm("Clear ALL cached data?")) return;

        await clearProfileCache();
        await clearAvatarCache();
        await clearAssetCache();
    });

    for (const site of BOT_SITES) {
        if (site.disabled) continue;
        (async () => {
            await ensureSiteFontAwesome(site);
        })();
    }

    // inject some css to make more room for the user icons and avatars, and to style the rank icons
    const globalStyle = document.createElement("style");
    globalStyle.textContent = `
        @media (min-width: 480px) {
            #chat .from {
                -webkit-mask-image: linear-gradient(270deg,#0000,#000 10px);
                mask-image: linear-gradient(270deg,#0000,#000 10px);
                padding-left: 0px;
            }
        }

        #chat .from {
            width: 150px;
        }
    `;
    document.head.appendChild(globalStyle);

    initializeObserver();
})();