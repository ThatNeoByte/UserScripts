// ==UserScript==
// @name            The Lounge – Shoutbox Beautifier (ThatNeoByte Edition)
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         2.7-tnb.12
// @description     Advanced rework of the original Shoutbox Beautifier for The Lounge. Reformats bridged chatbot messages to appear as native user messages, with extensible handler architecture, decorators, metadata-driven styling, regex matching, preview-safe DOM updates, and expanded network support.
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
        // Add chatbot nicks here, including operator (~, @, etc.)
        // Can also add regex patterns for more complex matches
        // NOTE: A hit from any matcher will run all handlers
        MATCHERS: [
            'Chatbot',          // ATH
            '%ULCX',            // ULCX
            '@Willie',          // BHD
            '@WALL-E',          // RFX
            'BBot', '@BBot',    // HHD
            /.?darkpeers/,      // DP
            'Bot',              // LST
            '+Mellos',          // HUNO (Discord)
            /.+?-web/,          // HUNO (Shoutbox)
            '&Sauron',          // ANT
            '+bridgebot',       // OE+
            '+Luminarr',        // LUME
            '~Announce',        // LUME
            '!BBot',            // HHD
        ],
        USE_AUTOCOMPLETE: true, // Enable autocomplete for usernames
        USE_DECORATORS: true,   // Enable username decorators
        REMOVE_JOIN_QUIT: false,// Removes join/quit messages
        DECORATOR_L: '-',       // Will be prepended to username
        DECORATOR_R: '',        // Will be appended to username
        METADATA: 'SB',         // Default metadata to be inserted into HTML
        IMG_EXT: /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i,
        DISPLAY_DOMAINS: [/^https?\:\/\/i\.seedpool\.org\/s\//, /^https?\:\/\/external-content\.duckduckgo\.com\/iu\//],
    }

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
            // Format: [Nickname] Message or [Nickname]: Message
            // Used at: ATH, DP, ULCX, HHD, LST

            enabled: true,
            handler: function (msg) {
                const match = msg.text.match(/^\[([^\]]+)\](?::\s*|\s+)(.*)$/);
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
                const match = msg.text.match(/^\[USER]-\[Enabled]-\[User: (.+)\]-\[Link: ([^\]]+)\].*$/);
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

    function applyColorToMessage(fromSpan, colorClass) {
        // Apply the color class to the message's fromSpan
        if (colorClass) {
            // Remove any existing color classes
            const classes = fromSpan.className.split(' ');
            const filteredClasses = classes.filter(cls => !cls.startsWith('color-'));
            // Add the new color class
            filteredClasses.push(colorClass);
            fromSpan.className = filteredClasses.join(' ');
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
        return CONFIG.MATCHERS.some(pattern =>
            typeof pattern === 'string'
                ? pattern === username
                : pattern instanceof RegExp && pattern.test(username)
        );
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
        const fromSpan = messageElement.querySelector('.from .user');
        const initialUsername = fromSpan ? fromSpan.textContent : '';

        // Only parse and reformat if a matcher matches the username
        if (!initialUsername || !matcherMatches(initialUsername)) {
            // Messag was not send by a bridged user, so we only apply the image previewer to links in the message content
            const contentSpan = messageElement.querySelector('.content'); // Select the content span
            if (!contentSpan) return;

            contentSpan.querySelectorAll("a").forEach(convertLink);
            return;
        }

        // Get the channel (from the closest ancestor with data-current-channel)
        const channel = messageElement.closest('[data-current-channel]')?.getAttribute('data-current-channel');

        // Get the message contents
        const contentSpan = messageElement.querySelector('.content'); // Select the content span
        if (!contentSpan) return;

        // Parse the message using format handlers
        const parsed = runFormatHandlers({
            text: contentSpan.textContent,
            html: contentSpan.innerHTML,
            from: initialUsername,
            chan: channel
        });
        // If no handler matched, do nothing
        if (!parsed) return;

        // Destructure parsed result
        const { username, prefixToRemove, newMessage, metadata, prefix, suffix } = parsed;

        // Check if username changed - if so, we need to change the style and text
        const usernameChanged = (username !== initialUsername);

        // Handle username related changes if the username has been changed
        if (usernameChanged) {
            // Add and modify message metadata
            fromSpan.setAttribute('data-name', username);
            fromSpan.setAttribute('data-bridged', metadata); // For CSS targeting
            fromSpan.setAttribute('data-bridged-channel', channel); // For CSS targeting

            // Add the custom decorators
            if (CONFIG.USE_DECORATORS) {
                fromSpan.textContent = (prefix ?? CONFIG.DECORATOR_L) + username + (suffix ?? CONFIG.DECORATOR_R);
            } else {
                fromSpan.textContent = username;
            }

            // Add user to autocomplete
            if (CONFIG.USE_AUTOCOMPLETE) { addUserToAutocomplete(username); }

            // Add the user's color
            const colorClass = getUserColor(username);
            if (colorClass) {
                applyColorToMessage(fromSpan, colorClass);
            } else {
                // Color not available yet, try again after a delay
                setTimeout(() => {
                    const retryColorClass = getUserColor(username);
                    if (retryColorClass) {
                        applyColorToMessage(fromSpan, retryColorClass);
                    }
                }, 200);
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
        var input = contentSpan.innerHTML.replace(/\<a(?:.+)?\>(.*)\<\/a\>/gi, '[url]$1[/url]');

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

        if (CONFIG.DISPLAY_DOMAINS.some((re) => re.test(url)) || CONFIG.IMG_EXT.test(url)) {
            const span = wrapElement("span", a);
            span.style.display = "block";

            // Replace text inside <a> with our <img>
            a.textContent = "";
            a.innerHTML = getImageHTML(url);
        }
    }

    function getImageHTML(url, width = null) {
        const widthParam = width ? width : '500';
        return `<img src="https://wsrv.nl/?n=-1&w=${widthParam}&h=200&url=${encodeURIComponent(url)}" style="max-width: 500px; max-height: 200px; border-radius: 6px; margin-top: 4px;"></img>`
    }

    // Create and start observing DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList?.contains('msg')) {
                        processMessage(node);
                    } else {
                        node.querySelectorAll?.('.msg').forEach(processMessage);
                    }
                }
            });
        });
    });

    // Start observing when the chat container is available
    function initializeObserver() {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initializeObserver();
})();