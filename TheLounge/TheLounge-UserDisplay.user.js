/* eslint-disable no-undef */
// ==UserScript==
// @name            The Lounge – User Display
// @namespace       https://git.tnb.moe/NeoByte/UserScripts
// @version         1.0.6
// @description     Displays Unit3D user decotations such as Avatar, Title, and Class in The Lounge chat client.
//
// @author          ThatNeoByte
// @license         MIT
//
// @match           https://irc.thatneobyte.com/*
//
// @icon            https://thelounge.chat/favicon.ico
// @updateURL       https://git.tnb.moe/NeoByte/UserScripts/raw/branch/main/TheLounge/TheLounge-UserDisplay.user.js
// @downloadURL     https://git.tnb.moe/NeoByte/UserScripts/raw/branch/main/TheLounge/TheLounge-UserDisplay.user.js
//
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
// @connect         rocket-hd.cc
// @connect         aura4k.net
// @connect         infinityhd.net
// @connect         midnightscene.cc
// @connect         yu-scene.net
// @connect         znth.cx
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

(function () {
    'use strict';
    const CONFIG = {
        IMG_EXT: /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i,
        DISPLAY_DOMAINS: [/^https?:\/\/preview.redd.it\//, /^https?:\/\/mm.yaf.quest\//, /^https?:\/\/i\.seedpool\.org\/s\//, /^https?:\/\/external-content\.duckduckgo\.com\/iu\//, /^https?:\/\/onlyimage\.org\/image\//],
        BYPASS_EMBED_DOMAINS: [/^https?:\/\/img\.homiehelpdesk\.net\/share\//, /^https?:\/\/ptpimg\.me\//],
        AVATAR_CACHE_TTL: 1000 * 60 * 60 * 24 * 14, // 14 day, this is a long time, but it's to reduce load on the tracker and device. Some trackers have over 1k user in the irc, thus fetching 1k avatars every day would be bad
        ICON_CACHE_TTL: 1000 * 60 * 60 * 24 * 14, // 14 day
        PROFILE_CACHE_TTL: 1000 * 60 * 60 * 24 * 2, // 2 day
        SITE_CACHE_TTL: 1000 * 60 * 60 * 24 * 2, // 2 day
        BOT_USERNAMES: [/^ChanServ$/i, /^HostServ$/i, /^NickServ$/i, /^SYSTEM$/i, /^SeedServ$/i, /^Banker$/i, /^Bot$/i, /^Dealer$/i, /^StatusBot$/i, /^BluBot$/i, /^SystemBot$/i, /^Rocketnouncer$/i, /^MSBar$/i, /^MSInfo$/i, /^IdleRPG$/i, /^infinity$/i, /^AuraBot$/i, /^AuraPost_?\d?$/i, /^MouseBot$/i, /^midnight-announce$/i, /^OEBot$/i, /^HDTS$/i, /^HoboLarry$/i, /^GLaDOS$/i, /^LSTANNOUNCE$/i, /_bot_?\d?\d?$/i, /-bot_?\d?\d?$/i, /\|bot_?\d?\d?$/i, /_autobrr_?\d?\d?$/i, /-autobrr_?\d?\d?$/i, /\|autobrr_?\d?\d?$/i, /_autoDL_?\d?\d?$/i, /-autoDL_?\d?\d?$/i, /\|autoDL_?\d?\d?$/i], // Used to decorate none-bridge bots 
    }

    let USERCONFIG = {
        DECORATE_USER_LIST: false,   // Whether to decorate the user list, It's helpful to disable this on mobile as it can be quite heavy on large channels, and the user list is not easily accessible on mobile anyway.
        INLINE_IMAGE_PREVIEW: true,
    }

    USERCONFIG = GM_getValue('CONFIG', USERCONFIG);

    GM_setValue('CONFIG', USERCONFIG);

    const DEFAULT_SITE_CONFIG = {
        getAvatarUrl: user => `/authenticated-images/user-avatars/${user}`,
        getIconUrl: user => `/authenticated-images/user-icons/${user}`,
        getProfileUrl: user => `/users/${user}`,
        groupsUrl: '/stats/groups',
        placeholderAvatar: 'data:image/gif;base64,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',
        placeholderAvatarUrl: `/img/profile.png`,
    };
    
    const CONFIG_BOT_SITES = [
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
            matcher: /^DP$/i,
            host: 'irc.darkpeers.org',
            domain: 'darkpeers.org',
        },
        {
            name: 'BLU', // Blutopia does not have a bot that bridges the messages.
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
            matcher: /^stc_?$/i,
            host: 'irc.skipthecommercials.xyz',
            domain: 'skipthecommercials.xyz',
        },
        {
            name: 'RHD',
            matcher: /^Rocketnouncer$/i,
            host: 'irc.rocket-hd.cc',
            domain: 'rocket-hd.cc',
        },
        {
            name: 'A4K',
            matcher: /^Aura4K$/i,
            host: 'irc.aura4k.net',
            domain: 'aura4k.net',
        },
        {
            name: 'MNS',
            matcher: /^MSBridge$/i,
            host: 'irc.midnightscene.cc',
            domain: 'midnightscene.cc',
        },
        {
            name: 'IHD', // InfinityHD does not have a bot that bridges the messages.
			host: 'irc.infinityhd.net',
			domain: 'infinityhd.net',
		},
        {
            name: 'YUS',
            matcher: /^YUS$/i,
			host: 'irc.yu-scene.net',
			domain: 'yu-scene.net',
		},
        {
            name: "ZNTH",
            host: "irc.znth.cx",
            domain: "znth.cx",
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

    async function clearProfileCacheForSite(site) {
        const keys = await GM_listValues();
        const sitePrefix = `UserMeta:${site.name}:`;

        for (const key of keys.filter(k => k.startsWith(sitePrefix))) {
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

    async function clearAvatarCacheForSite(site) {
        const db = await openIdb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_AVATAR_STORE, "readwrite");
            const store = tx.objectStore(IDB_AVATAR_STORE);
            const sitePrefix = `${site.name}:`;
            const cursorReq = store.openKeyCursor();

            cursorReq.onsuccess = () => {
                const cursor = cursorReq.result;
                if (!cursor) return;

                if (typeof cursor.key === "string" && cursor.key.startsWith(sitePrefix)) {
                    cursor.delete();
                }

                cursor.continue();
            };

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
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

    async function clearAssetCacheForSite(site) {
        const db = await openIdb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_SITE_ASSET_STORE, "readwrite");
            const store = tx.objectStore(IDB_SITE_ASSET_STORE);
            const sitePrefix = `${site.name}:`;
            const cursorReq = store.openKeyCursor();

            cursorReq.onsuccess = () => {
                const cursor = cursorReq.result;
                if (!cursor) return;

                if (typeof cursor.key === "string" && cursor.key.startsWith(sitePrefix)) {
                    cursor.delete();
                }

                cursor.continue();
            };

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
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

    function getProfileRankData(doc) {
        const userTagLink = doc.querySelector(".user-tag__link");
        if (!userTagLink) return null;

        const rankName = userTagLink.getAttribute("title")?.trim();
        if (!rankName || rankName === "Anonymous") return null;

        const colorMatch = userTagLink.getAttribute("style")?.match(/color:\s*([^;]+)/i);
        const color = colorMatch ? colorMatch[1].trim() : null;
        const iconClass = Array.from(userTagLink.classList)
            .filter(className => className !== "user-tag__link" && className.startsWith("fa"))
            .join(" ") || null;

        if (!color && !iconClass) return null;

        return {
            rankName,
            rankData: {
                color,
                iconClass,
            },
        };
    }

    async function fetchProfileRank(site, doc) {
        let ranks = await fetchSiteRanks(site);
        const profileRank = getProfileRankData(doc);
        if (!profileRank) return ranks;

        const currentRank = ranks[profileRank.rankName] || {};
        const mergedRank = {
            color: currentRank.color || profileRank.rankData.color,
            iconClass: currentRank.iconClass || profileRank.rankData.iconClass,
        };

        if (currentRank.color !== mergedRank.color || currentRank.iconClass !== mergedRank.iconClass) {
            ranks[profileRank.rankName] = mergedRank;

            await idbSetSiteAsset(siteRankKey(site), {
                ranks,
                cachedAt: Date.now(),
            });
        }

        return ranks;       
    }

    function blobToDataUrl(blob) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    // UserCacheManager class to handle caching of user colors and avatars
    class UserCacheManager {
        constructor() {
            this.memory = new Map();     // runtime cache
            this.pending = new Map();    // request dedupe
        }

        clearSite(siteName) {
            for (const key of this.memory.keys()) {
                if (key.startsWith(`${siteName}:`)) {
                    this.memory.delete(key);
                }
            }

            for (const key of this.pending.keys()) {
                if (key.startsWith(`${siteName}:`)) {
                    this.pending.delete(key);
                }
            }
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
                console.error(`Error occurred while fetching user data for ${username}:`, e);
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
                const ranks = await fetchProfileRank(site, doc);
                meta.rankData = ranks[meta.userclass] || null; 
                console.log(`Fetched profile for ${username} on ${site.name}: userclass=${meta.userclass}, rankData=`, meta.rankData);
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
                            console.debug("RATE LIMITED: pausing queue for 30s (should reset the rolling window)");
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
                    iconClass: "fas fa-user-lock"
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

    function addBotDecorations(userSpan, site, username) {
        userSpan.dataset.originalUsername = username; // Store original username for reference
        userSpan.innerHTML = stripIrcPrefix(username); // Remove any existing text to prevent duplication when adding avatar and icon

        const rankIcon = document.createElement("i");
        rankIcon.className = "group-" + site.name + " fas fa-user-robot rank-icon";
        rankIcon.style.marginLeft = "4px";
        rankIcon.style.marginRight = "4px";

        userSpan.title = "Bot";
        userSpan.style.color = "rgb(73, 98, 187)";

        userSpan.prepend(rankIcon);
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
        } catch {
            console.warn("Failed to parse Socket.IO payload:", part);
        }
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
                addBotDecorations(userSpan, site, username);
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

    function cdn(url) {
        return `https://wsrv.nl/?n=-1&w=500&h=200&url=${encodeURIComponent(url)}`;
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

        if (CONFIG.BYPASS_EMBED_DOMAINS.some((re) => re.test(url))) {
            return `<a href="${url}" dir="auto" target="_blank" rel="noopener">${url}</a>`
        };

        if (CONFIG.DISPLAY_DOMAINS.some((re) => re.test(url)) || CONFIG.IMG_EXT.test(url)) {
            const span = wrapElement("span", a);
            span.style.display = "block";

            const img = document.createElement("img");
            img.src = cdn(url);
            img.style.maxWidth = "400px";
            img.style.maxHeight = "150px";
            img.style.borderRadius = "6px";
            img.style.marginTop = "4px";

            // Replace text inside <a> with our <img>
            a.textContent = "";
            a.appendChild(img);
        }
    }

    // Create and start observing DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    node.querySelectorAll?.('.messages .user').forEach(userSpan => decorateUser(userSpan, 1));
                    
                    if (USERCONFIG.INLINE_IMAGE_PREVIEW) {
                        node.querySelectorAll?.("a").forEach(convertLink);
                        if (node.tagName === "a") convertLink(node);
                    }
                }
            });
        });
        if (USERCONFIG.DECORATE_USER_LIST)
        {
            refreshUserList();
        }
    });

    function refreshUserList() {
        const users = document.querySelectorAll(".user");

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

    GM_registerMenuCommand("Clear Current Site Cache", async () => {
        const activeNetworkAndChannel = getActiveNetworkAndChannel();

        if (!activeNetworkAndChannel) {
            alert("No active channel was found, so nothing was removed.");
            return;
        }

        const site = BOT_SITES.getSite(activeNetworkAndChannel.network_host, activeNetworkAndChannel.channel);
        if (!site) {
            alert("No matching site was found for the current channel, so nothing was removed.");
            return;
        }

        if (!confirm(`Clear cache for ${site.name} only?`)) return;

        await clearProfileCacheForSite(site);
        await clearAvatarCacheForSite(site);
        await clearAssetCacheForSite(site);
        cache.clearSite(site.name);
    });
    
    GM_registerMenuCommand("Clear ALL Cache", async () => {
        if (!confirm("Clear ALL cached data?")) return;

        await clearProfileCache();
        await clearAvatarCache();
        await clearAssetCache();
    });
    
    GM_registerMenuCommand("Toggle User List Decoration", async () => {
        USERCONFIG.DECORATE_USER_LIST = !USERCONFIG.DECORATE_USER_LIST;
        GM_setValue('CONFIG', USERCONFIG);
    });
    
    GM_registerMenuCommand("Toggle Inline Image Preview", async () => {
        USERCONFIG.INLINE_IMAGE_PREVIEW = !USERCONFIG.INLINE_IMAGE_PREVIEW;
        GM_setValue('CONFIG', USERCONFIG);
    });

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

    // Initial decoration of existing user elements
    document.querySelectorAll('.messages .user').forEach(userSpan => decorateUser(userSpan, 1));
    if (USERCONFIG.DECORATE_USER_LIST) refreshUserList();
    if (USERCONFIG.INLINE_IMAGE_PREVIEW) document.querySelectorAll?.("a").forEach(convertLink);

    initializeObserver();
})();