// ==UserScript==
// @name            Unit3D – Style Tweaks Suite
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         1.3.6
// @description     A refined and expanded style customization suite for Unit3D-based tracker sites. Features clean, modular code, improved performance, and flexible global or site-specific configuration. Includes optional festive branding, particle effects, alert and notification enhancements, BON display tweaks, blocked alert control, and various UI refinements.
//
// @author          ThatNeoByte
// @license         MIT
//
// @credits         Originally inspired by the “Chungus Edition” userscript
// @source          https://gist.github.com/chun69gus/16618d8451fbfd1d62a607fa1f7d6ebf
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
// @include         *://hd-united.vn/*
// @include         *://luminarr.me/*
// @include         *://rotorrent.info/*
// @include         *://onlyencodes.cc/*
// @exclude         *://onlyencodes.cc/widgets/*
// @include         *://homiehelpdesk.net/*
//
// @icon            https://i.ibb.co/dsfTvpdv/chrimbo-Avatar.png
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-StyleTweaksSuite.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/Unit3D/Unit3D-StyleTweaksSuite.user.js
//
// @grant           GM_addStyle
// @grant           GM_registerMenuCommand
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_getResourceURL
//
// @resource        logo   https://i.ibb.co/4qmRdbM/dpchrimbo.png
// @resource        avatar https://i.ibb.co/dsfTvpdv/chrimbo-Avatar.png
//
// @run-at          document-start
// ==/UserScript==


(function() {
    'use strict';

    const MODE_KEY = 'use_site_mode';
    const SITE_ID = location.hostname;

    // --- CONFIGURATION ---
    const config = {
        // Default Settings (First run defaults)
        use_site_mode: false,
        logo_enabled: true,
        avatar_enabled: true,
        pms_enabled: true,
        notes_enabled: true,
        staff_enabled: true,
        particle_enabled: true,
        particle_density: 3,
        particle_character: '❅',
        bon_enabled: true,
        hide_sparkles_enabled: true,
        hide_permanent_alerts_enabled: true,
        alert_color: '#FFB700',
        alert_lines: [
            "donation bar",
        ],
        banner_enabled: true,
        banner_tap_hide_ms: 3000,
        banner_speed_px_per_sec: 50,
        moderation_log: true,
    };

    const keys = {
        logo: 'logo_enabled',
        avatar: 'avatar_enabled',
        pms: 'pms_enabled',
        notes: 'notes_enabled',
        staff: 'staff_enabled',
        particle: 'particle_enabled',
        particleDensity: 'particle_density',
        particleCharacter: 'particle_character',
        bon: 'bon_enabled',
        hideSparkles: 'hide_sparkles_enabled',
        hideBlockedAlerts: 'hide_permanent_alerts_enabled',
        blockedAlertLines: 'alert_lines',
        alertColor: 'alert_color',
        bannerEnabled: 'banner_enabled',
        bannerTapHideMs: 'banner_tap_hide_ms',
        bannerSpeedPxPerSec: 'banner_speed_px_per_sec',
        moderationLog: "moderation_log",
    };

    const sessionKeys = {
        particleState: 'particle_state',
        particleEpoch: 'particle_epoch',
    }

    const settingsSchema = [
        { section: "General Settings",      collapsed: false },
        { key: keys.logo,                   type: "checkbox",   label: "Enable Christmas Logo",         feature: "logo" },
        { key: keys.avatar,                 type: "checkbox",   label: "Enable Christmas Avatar",       feature: "avatar" },
        { key: keys.bon,                    type: "checkbox",   label: "Enable Mobile BON Display",     feature: "bon" },
        { key: keys.hideSparkles,           type: "checkbox",   label: "Hide Donor Sparkles",           feature: "sparkles" },

        { section: "Moderation Tools",      collapsed: true,    features: ["moderation_logs"] },
        { key: keys.moderationLog,          type: "checkbox",   label: "Enable Moderation Log",         feature: "moderation_logs" },

        { section: "Particle Options",      collapsed: true,    features: ["particles"] },
        { key: keys.particle,               type: "checkbox",   label: "Enable Falling Particles",      feature: "particles" },
        { key: keys.particleDensity,        type: "range",      label: "Particle Density",              feature: "particles", min: 1, max: 5 },
        { key: keys.particleCharacter,      type: "character",  label: "Falling Particle Character",    feature: "particles", reset: true },

        { section: "Alerts",                collapsed: true,    features: ["alerts"] },
        { key: keys.pms,                    type: "checkbox",   label: "Enable Private Message Alerts", feature: "alerts" },
        { key: keys.notes,                  type: "checkbox",   label: "Enable Bell Alerts",            feature: "alerts" },
        { key: keys.staff,                  type: "checkbox",   label: "Enable Staff Alerts",           feature: "alerts" },
        { key: keys.alertColor,             type: "color",      label: "Alert Color",                   feature: "alerts", reset: true },

        { section: "Blocked Banner Alerts", collapsed: true,    features: ["banners", "scrolling_banners"] },
        { key: keys.bannerEnabled,          type: "checkbox",   label: "Enable scrolling banner",       feature: "scrolling_banners" },
        { key: keys.bannerSpeedPxPerSec,    type: "range",      label: "Scrolling Banner Speed",        feature: "scrolling_banners", min: 0, max: 100, step: 5 },
        { key: keys.hideBlockedAlerts,      type: "checkbox",   label: "Hide Blocked Banner Alerts",    feature: "banners" },
        { key: keys.blockedAlertLines,      type: "alertLines", label: "Blocked Lines",                 feature: "banners" },
    ];

    const SITE_CAPABILITIES = {
        'darkpeers.org': {
            // All features supported
        },
        'upload.cx': {
            logo: false,
            scrolling_banners: false,
        },
        'rastastugan.org': {
            bon: false,
            logo: false,
        },
        'lat-team.com': {
            logo: false,
        },
        'yu-scene.net': {
            bon: false,
            logo: false,
        },
        'seedpool.org': {
            logo: false,
        },
        'generation-free.org': {
            logo: false,
        },
        'infinityhd.net': {
            logo: false,
        },
        'onlyencodes.cc': {
            logo: false,
            scrolling_banners: false,
        },
        'www.nordicq.org': {
            logo: false,
        },
        'infinitylibrary.net': {
            logo: false,
        },
        'malayabits.cc': {
            logo: false,
        },
        'samaritano.cc': {
            logo: false,
        },
        'sextorrent.myds.me': {
            logo: false,
        },
        'skipthecommercials.xyz': {
            logo: false,
        },
        'oldtoons.world': {
            bon: false,
            logo: false,
        },
        'nordicq.org': {
            bon: false,
            logo: false,
        },
        'upscalevault.com': {
            bon: false,
            logo: false,
            scrolling_banners: false,
        },
        'itatorrents.xyz': {
            logo: false,
        },
        'rotorrent.info': {
            logo: false,
            banners: false,
        },
        'luminarr.me': {
            logo: false,
        },
        'hd-united.vn': {
            logo: false,
        },
        'homiehelpdesk.net': {
            logo: false,
            scrolling_banners: false,
        },
    };

    // --- DATAKEY HELPERS ---
    const SCHEMA_BY_KEY = Object.fromEntries(
        settingsSchema
            .filter(s => s.key)
            .map(s => [s.key, s])
    );

    function getModeLabel() {
        return isSiteMode()
            ? { text: "SITE MODE", icon: "🏠", class: "site" }
            : { text: "GLOBAL MODE", icon: "🌐", class: "global" };
    }

    function siteSupports(feature) {
        const caps = SITE_CAPABILITIES[SITE_ID];
        if (!caps) return true;
        return caps[feature] !== false;
    }

    function isSiteMode() {
        return getSiteValue(MODE_KEY, config[MODE_KEY]);
    }

    function setSiteMode(value) {
        setSiteValue(MODE_KEY, value);
    }

    function siteKey(key) {
        return `${SITE_ID}:${key}`;
    }

    function globalKey(key) {
        return `global:${key}`;
    }

    const getSiteValue = (key) => {
        return GM_getValue(siteKey(key), config[key]);
    };

    const setSiteValue = (key, value) => {
        return GM_setValue(siteKey(key), value);
    };

    const getGlobalValue = (key) => {
        return GM_getValue(globalKey(key), config[key]);
    };

    const setGlobalValue = (key, value) => {
        return GM_setValue(globalKey(key), value);
    };

    function getSetting(key) {
        const schema = SCHEMA_BY_KEY[key];

        if (schema?.feature && !siteSupports(schema.feature)) {
            return false;
        }

        // Mode-based resolution
        if (isSiteMode()) {
            return getSiteValue(key);
        }

        return getGlobalValue(key);
    }

    function getLogoUrl() {
        // if (isSiteMode()) {
        //     const siteUrl = GM_getValue(siteKey("logo_override_url"));
        //     if (siteUrl) return siteUrl;
        // }
        // return GM_getValue("global_logo_override_url", null);
        return GM_getResourceURL("logo");
    }

    // --- STATE MANAGERS ---
    function applyLogoState() {
        const enabled = getSetting(keys.logo);
        if (enabled) {
            document.body.classList.add("logo-active");
        } else {
            document.body.classList.remove("logo-active");
        }
    }

    const applyAvatarState = () => {
        const isEnabled = getSetting(keys.avatar);
        if (isEnabled) document.body.classList.add('avatar-active');
        else document.body.classList.remove('avatar-active');
    };

    const applySparkleState = () => {
        const isHidden = getSetting(keys.hideSparkles);
        if (isHidden) document.body.classList.add('hide-sparkles');
        else document.body.classList.remove('hide-sparkles');
    };

    const applyParticleState = () => {
        const isEnabled = getSetting(keys.particle);
        if (isEnabled) document.body.classList.add('particle-active');
        else document.body.classList.remove('particle-active');
    };

    const applyParticleDensity = () => {
        const density = getSetting(keys.particleDensity);
        let amount;

        switch (density) {
            case "1": amount = 10; break;
            case "2": amount = 20; break;
            case "3": amount = 40; break;
            case "4": amount = 80; break;
            case "5": amount = 200; break;
            default: amount = 40;
        }

        renderParticles(amount);
    }

    const applyModerationLog = () => {
        const isEnabled = getSetting(keys.moderationLog);
        
        if (isEnabled) {
            if (getTorrentPanel("Moderation logs")) return; // skip if the moderation log is already present
            const results = extractModerationActions();
            const section = MakeModerationSection(results)
            const auditPanel = getTorrentPanel('Moderation')
            auditPanel.outerHTML += section
        } else {
            getTorrentPanel("Moderation logs").remove()
        }
    }

    const updateAlertColor = () => {
        if (siteSupports("alerts") === false) return;
        const color = getSetting(keys.alertColor);

        rootStyle.textContent = `
            :root {
                --alertColor: ${color};
                --alertColorB6: ${color}B6;
                --alertColor0A: ${color}0A;
            }`
    };

    // --- FEATURE LOGIC ---
    function initLogoOverride() {
        if (siteSupports("logo") === false) return;
        const branding = document.querySelector(".top-nav__branding");
        if (!branding) return;

        // only add override img once
        if (branding.querySelector(".st-logo-override")) return;

        const logoUrl = getLogoUrl();
        if (!logoUrl) return;

        const img = document.createElement("img");
        img.src = logoUrl;
        img.className = "st-logo-override";
        img.alt = "Custom Logo";
        img.style.height = "35px";
        img.style.objectFit = "contain";

        branding.appendChild(img);
    }

    const createParticle = (flake) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.innerHTML = getSetting(keys.particleCharacter);

        // choose size class
        if (flake.size > 0.8) particle.classList.add('large');
        else if (flake.size < 0.3) particle.classList.add('small');
        else particle.classList.add('med');

        // restore position/speed
        particle.style.left = `${flake.left}%`;
        particle.style.animationDuration = `${flake.fall}s, ${flake.shake}s`;
        // fast-forward
        particle.style.animationDelay = `-${(flake.elapsed + flake.offsetFall).toFixed(2)}s, -${(flake.elapsed + flake.offsetShake).toFixed(2)}s`;

        return particle;
    };

    let particleContainer = null;

    function renderParticles(count) {
        if (!document.body) return;
        if (siteSupports("particles") === false) return;
        if (!particleContainer) {
            particleContainer = document.createElement('div');
            particleContainer.id = 'particle-container';
            document.body.appendChild(particleContainer);
        }

        // attempt restore
        const restored = loadParticleState(count);
        let flakes, epoch;

        if (restored) {
            flakes = restored.flakes;
            epoch = restored.epoch;
        } else {
            flakes = buildParticleState(count);
            epoch = Date.now();
            saveParticleState(flakes);
        }

        const elapsed = (Date.now() - epoch) / 1000;

        particleContainer.innerHTML = '';

        flakes.forEach(f => {
            f.elapsed = elapsed;
            particleContainer.appendChild(createParticle(f));
        });
    }

    function buildParticleState(count) {
        const flakes = [];

        for (let i = 0; i < count; i++) {
            flakes.push({
                left: Math.random() * 100,
                size: Math.random(),
                fall: 5 + Math.random() * 5,   // 5–10 sec
                shake: 2 + Math.random() * 2,  // 2–4 sec
                offsetFall: Math.random() * 10,
                offsetShake: Math.random() * 3
            });
        }

        return flakes;
    }

    function loadParticleState(count) {
        const saved = sessionStorage.getItem(sessionKeys.particleState);
        const epoch = sessionStorage.getItem(sessionKeys.particleEpoch);

        if (!saved || !epoch) return null;

        const flakes = JSON.parse(saved);

        // reject if density changed
        if (flakes.length !== count) return null;

        return {
            flakes,
            epoch: parseInt(epoch, 10)
        };
    }

    function saveParticleState(flakes) {
        sessionStorage.setItem(sessionKeys.particleState, JSON.stringify(flakes));
        sessionStorage.setItem(sessionKeys.particleEpoch, Date.now().toString());
    }

    const updateBonDisplay = () => {
        if (siteSupports("bon") === false) return;
        const isEnabled = getSetting(keys.bon);
        let display = document.getElementById('bon-display');

        if (!isEnabled) {
            if (display) display.style.display = 'none';
            return;
        }

        const sourceElement = document.querySelector('.ratio-bar__points');
        if (!sourceElement) return;

        // Reactive visibility check
        const style = window.getComputedStyle(sourceElement);
        const isOriginalVisible = (style.display !== 'none' && style.visibility !== 'hidden' && sourceElement.offsetParent !== null);
        const shouldShowCustom = isEnabled && !isOriginalVisible;

        if (!display) {
            display = document.createElement('a');
            display.id = 'bon-display';
            display.href = sourceElement.querySelector("a").href;
            display.innerHTML = `<i class="fas fa-coins"></i> <span>...</span>`;

            const toggleBtn = document.querySelector('.top-nav__toggle');
            if (toggleBtn && toggleBtn.parentNode) {
                toggleBtn.parentNode.insertBefore(display, toggleBtn);
            }
        }

        if (shouldShowCustom) {
            display.style.display = 'flex';
            const bonText = sourceElement.innerText.replace('My Bonus Points', '').trim();
            const span = display.querySelector('span');
            if (span && span.innerText !== bonText) {
                span.innerText = bonText;
            }
        } else {
            display.style.display = 'none';
        }
    };

    const checkNotifications = () => {
        if (siteSupports("alerts") === false) {
            document.body.classList.remove('notifications');
            return;
        } else {
            document.body.classList.add('notifications');
        }

        const pmsOn = getSetting(keys.pms);
        const notesOn = getSetting(keys.notes);
        const staffOn = getSetting(keys.staff);

        const inboxLink = document.querySelector('.top-nav--right__icon-link[href*="conversations"]');
        const notesLink = document.querySelector('.top-nav--right__icon-link[href*="notifications"]');
        const moderationLink = document.querySelector('.top-nav--right__icon-link[href*="moderation"]');
        const dashboardLink = document.querySelector('.top-nav--right__icon-link[href*="dashboard"]');

        let globalAlert = false;

        const isLinkActive = (link) => {
            if (!link) return false;
            if (link.querySelector('svg')) return true;
            if (link.innerText.trim().length > 0) return true;
            if (link.querySelector('.text-danger, .text-warning, .text-red, .text-success')) return true;
            return false;
        };

        const updateLinkState = (link, isOn) => {
            if (isOn) {
                if (link) link.classList.add('hide-notification');
                if (isLinkActive(link)) {
                    link.classList.add('notification-active');
                    globalAlert = true;
                } else if (link) {
                    link.classList.remove('notification-active');
                }
            } else {
                if (link) {
                    link.classList.remove('hide-notification');
                    link.classList.remove('notification-active');
                }
            }
        }

        updateLinkState(inboxLink, pmsOn);
        updateLinkState(notesLink, notesOn);
        updateLinkState(moderationLink, staffOn);
        updateLinkState(dashboardLink, staffOn);

        const menuButton = document.querySelector('.top-nav__toggle');
        if (menuButton) {
            if (globalAlert) {
                menuButton.classList.add('alert-active');
            } else {
                menuButton.classList.remove('alert-active');
            }
        }
    };

    const updatePermanentAlerts = () => {
        const hidePermanentAlertsOn = getSetting(keys.hideBlockedAlerts);
        const alertLines = getSetting(keys.blockedAlertLines);

        document.querySelectorAll(".alerts .alert").forEach(alert => {
            if (siteSupports("banners") === false) { alert.style.display = "grid"; return; }
            const text = alert.textContent.toLowerCase();
            // Check if any blocked phrase appears in this alert
            if (alertLines.some(unwantedAlert => text.includes(unwantedAlert.toLowerCase()))) {
                alert.style.display = hidePermanentAlertsOn ? "none": "grid";
            }
            else
            {
                alert.style.display = "grid";
            }
        });
    }

    // --- Moderation Logs ---
    function getTorrentPanel(name) {
        const panels = document.querySelectorAll('.panelV2');
        for (const panel of panels) {
            const heading = panel.querySelector('.panel__heading');
            if (!heading) continue;
            const title = heading.textContent.trim();
            if (title.includes(name)) {
                return panel;
            }
        }
        return null;
    }

    function getModerationStatus(code) {
        switch (code) {
            case 0: return 'Unmoderated';
            case 1: return 'Approved';
            case 2: return 'Rejected';
            case 3: return 'Postponed';
            default: return 'Unknown';
        }
    }

    function MakeModerationSection(actions) {
        var section = `<section class="panelV2" x-data="toggle"><h2 class="panel__heading" style="cursor: pointer" x-on:click="toggle">
            <i class="fas fa-hammer-war"></i> Moderation logs<i class="fas fa-minus-circle fa-pull-right" x-show="isToggledOff" style="display: none;"></i>
            <i class="fas fa-plus-circle fa-pull-right" x-show="isToggledOn"></i></h2>
            <div class="data-table-wrapper" x-show="isToggledOff"><table class="data-table"><thead><tr><th>User</th><th>Action</th><th>Date</th><th>Reason</th></tr></thead><tbody>`;
        actions.forEach(action => section += CreateModerationEntry(action));
        section += `</tbody></table></div></section>`
        return section
    }

    function CreateModerationEntry(action) {
        var menu = `<tr><td>${action.moderator_html}</td><td>${action.statusLabel}</td><td>${action.time}</td><td>${action.reason}</td></tr>`;
        return menu
    }

    function extractModerationActions() {
        const panel = getTorrentPanel('Audits');
        if (!panel) return [];

        const rows = panel.querySelectorAll('tbody tr');
        const actions = [];

        rows.forEach(row => {
            const user = row.querySelector('.user-tag__link').outerHTML
            const actionType = row.children[1]?.textContent.trim();
            const time = row.querySelector('time').outerHTML;
            if (actionType !== 'update') return;
            const listItems = row.querySelectorAll('li');
            let statusChange = null;
            let reason = null;
            listItems.forEach(li => {
                const text = li.innerText;
                const statusMatch = text.match(/status:\s*(\d+)\s*→\s*(\d+)/);
                if (statusMatch) {
                    statusChange = {
                        from: parseInt(statusMatch[1]),
                        to: parseInt(statusMatch[2])
                    };
                }
                if (text.includes('moderated_reason:')) {
                    const parts = text.split('→');
                    if (parts.length > 1) {
                        reason = parts[1].trim();
                    }
                }
            });
            if (!statusChange) return;
            if ([1, 2, 3].includes(statusChange.to)) {
                actions.push({
                    moderator_html: user,
                    time,
                    status: statusChange.to,
                    statusLabel: getModerationStatus(statusChange.to),
                    reason
                });
            }
        });
        return actions;
    }


    // --- Configuration Overlay ---
    function openConfigurationOverlay() {
        if (document.getElementById("st-config-overlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "st-config-overlay";
        overlay.innerHTML = `
            <div id="st-config-header">
                <span>
                    Style Tweaks
                    <span id="st-mode-indicator"></span>
                </span>
                <button id="st-close-header" class="st-remove">x</button>
            </div>
            <div id="st-config-body"></div>

            <div style="display: flex; justify-content: end;">
                <button id="st-close">Close</button>
                <button id="st-save">Save</button>
            </div>
        `;
        document.body.appendChild(overlay);

        renderConfigOverlay();
        addOverlayDrag(overlay);

        document.getElementById("st-close-header").onclick = closeConfigurationOverlay;
        document.getElementById("st-close").onclick = closeConfigurationOverlay;
        document.getElementById("st-save").onclick = saveConfiguration;
    }

    function initConfigurationButton() {
        const userMenu = document.querySelector('.top-nav__icon-bar');
        if (!userMenu) return;
        const icon = document.createElement('i');
        icon.className = 'fas fa-cog';

        const configBtn = document.createElement('a');
        configBtn.appendChild(icon);
        configBtn.href = "#";
        configBtn.title = "Style Tweaks";
        configBtn.style.cursor = "pointer";
        configBtn.onclick = (e) => {
            e.preventDefault();
            openConfigurationOverlay();
        };

        const li = document.createElement('li');
        li.appendChild(configBtn);

        userMenu.prepend(li);
    }

    function closeConfigurationOverlay() {
        const el = document.getElementById("st-config-overlay");
        if (el) el.remove();
    }

    function saveConfiguration() {
        // Save all simple settings
        document.querySelectorAll(".st-setting").forEach(el => {
            let value;
            if (el.type === "checkbox") value = el.checked;
            else value = el.value;

            if (el.dataset.key === MODE_KEY) {
                setSiteMode(el.checked);
                return;
            }

            if (isSiteMode()) {
                setSiteValue(el.dataset.key, value);
            } else {
                setGlobalValue(el.dataset.key, value);
            }
        });

        // Save alert lines
        const inputs = [...document.querySelectorAll(".st-alert-line")];
        const values = inputs.map(i => i.value.trim()).filter(v => v.length);

        if (isSiteMode()) {
            setSiteValue(keys.blockedAlertLines, values);
        } else {
            setGlobalValue(keys.blockedAlertLines, values);
        }

        applyLogoState();
        applyAvatarState();
        applySparkleState();
        applyParticleState();
        applyParticleDensity();
        applyModerationLog();
        updateBonDisplay();
        updatePermanentAlerts();
        updateAlertColor();
        bannerSafeRun(true);
        bannerSyncLayering();
        bannerSyncAnimation();

        closeConfigurationOverlay();
    }

    function addAlertLine() {
        const body = document.getElementById("st-alert-box");
        const row = document.createElement("div");
        row.className = "st-row";
        row.innerHTML = `
            <input type="text" class="st-alert-line st-input" placeholder="New line">
            <button class="st-remove">x</button>
        `;
        row.querySelector(".st-remove").onclick = () => row.remove();
        body.appendChild(row);
    }

    function addOverlayDrag(element) {
        const header = document.getElementById("st-config-header");
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

        header.onmousedown = dragStart;

        function dragStart(e) {
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmousemove = dragMove;
            document.onmouseup = dragStop;
        }

        function dragMove(e) {
            e.preventDefault();
            posX = mouseX - e.clientX;
            posY = mouseY - e.clientY;
            mouseX = e.clientX;
            mouseY = e.clientY;
            element.style.top = (element.offsetTop - posY) + "px";
            element.style.left = (element.offsetLeft - posX) + "px";
        }

        function dragStop() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function resetSetting(key) {
        if (isSiteMode()) {
            setSiteValue(key, config[key]);
        } else {
            setGlobalValue(key, config[key]);
        }
        renderConfigOverlay();
    }

    function renderConfigOverlay() {
        const body = document.getElementById("st-config-body");
        body.innerHTML = '';

        //<div class="st-row"><label style="flex:1">Use Site-Specific Settings</label> <label class="switch"><input class="st-setting" type="checkbox" data-key="use_site_mode"><span class="slider round"></span></label></div>

        const row = document.createElement("div");
        row.className = "st-row";
        row.innerHTML = `<label style="flex:1">Use Site-Specific Settings</label> <label class="switch"><input type="checkbox" data-key="${MODE_KEY}" ${isSiteMode() ? "checked" : ""}><span class="slider round"></span></label>`;

        const label = row.querySelector("label.switch input");
        label.onclick = (e) => {
            setSiteMode(label.checked);
            renderConfigOverlay();
        };

        body.appendChild(row);

        let currentSection = null;
        let sectionBody = null;

        // Render basic settings
        settingsSchema.forEach(item => {
            if (item.section) {
                if (item.features) {
                    let should_add = false;
                    for (let capability in (item.features || [])) {
                        if (siteSupports(item.features[capability])) {
                            should_add = true;
                            break;
                        }
                    }
                    console.log("Section ", item.section, " supported: ", should_add);
                    if (!should_add) {
                        return;
                    }
                }
                currentSection = document.createElement("div");
                currentSection.className = "st-section";

                let header = document.createElement("div");
                header.className = "st-section-header";
                header.textContent = item.section + (item.collapsed ? " ►" : " ▼");

                sectionBody = document.createElement("div");
                sectionBody.className = "st-section-body";

                // toggle on click
                header.onclick = (e) => {
                    const sectionBody = header.parentNode.querySelector(".st-section-body");
                    const open = sectionBody.style.display !== "none";
                    sectionBody.style.display = open ? "none" : "block";
                    header.textContent = item.section + (open ? " ►" : " ▼");
                };

                // default open
                sectionBody.style.display = item.collapsed ? "none" : "block";

                currentSection.appendChild(header);
                currentSection.appendChild(sectionBody);

                body.appendChild(currentSection);
                return;
            }

            if (item.feature && !siteSupports(item.feature)) {
                return;
            }

            let stored = getSetting(item.key);

            let row = document.createElement("div");
            row.className = "st-row";

            let inputHtml = "";

            if (item.type === "checkbox") {
                inputHtml = `<label class="switch"><input class="st-setting" type="checkbox" data-key="${item.key}" ${stored ? "checked" : ""}><span class="slider round"></span></label>`;
            }

            if (item.type === "range") {
                const step = item.step || 1;
                inputHtml = `
                    <input type="range" class="st-setting"
                        data-key="${item.key}"
                        min="${item.min}" max="${item.max}"
                        value="${stored}"
                        step="${step}">
                    <span class="range-value">${stored}</span>
                `;
            }

            if (item.type === "color") {
                inputHtml = `
                    <input type="color" class="st-setting"
                        data-key="${item.key}"
                        value="${stored}">
                `;
            }

            if (item.type === "character") {
                inputHtml = `
                    <input type="text" maxlength="2" class="st-input st-setting"
                        data-key="${item.key}"
                        value="${stored}"
                        style="text-align: center;">
                `;
            }

            if (item.type === "text") {
                inputHtml = `
                    <input type="text" class="st-setting"
                        data-key="${item.key}"
                        value="${stored}">
                `;
            }

            if (item.type === "alertLines") {
                const alertLinesBox = document.createElement("div");
                alertLinesBox.id = "st-alert-box";
                sectionBody.appendChild(alertLinesBox);

                stored.forEach(line => {
                    const row = document.createElement("div");
                    row.className = "st-row";
                    row.innerHTML = `
                        <input type="text" class="st-alert-line st-input" value="${line}" placeholder="New line">
                        <button class="st-remove">x</button>
                    `;
                    row.querySelector(".st-remove").onclick = () => row.remove();
                    alertLinesBox.appendChild(row);
                });

                const row = document.createElement("div");
                row.className = "st-row";
                const button = document.createElement("button");
                button.id = "st-add-line";
                button.style.margin = "2px 0px";
                button.style.flex = "1";
                button.textContent = "Add Line";
                button.onclick = addAlertLine;
                row.appendChild(button);
                sectionBody.appendChild(row);
                return;
            }

            row.innerHTML = `<label style="flex:1">${item.label}</label> ${inputHtml}`;
            sectionBody.appendChild(row);

            if (item.reset){
                row.innerHTML += `<button class="st-reset" data-key="${item.key}">↺</button>`;
                row.querySelector(".st-reset").onclick = () => resetSetting(item.key);
            }

            // Update live slider readout
            row.querySelectorAll("input[type=range]").forEach(sl =>
                sl.addEventListener("input", e => {
                    sl.nextElementSibling.textContent = sl.value;
                })
            );
        });

        const indicator = document.getElementById("st-mode-indicator");
        if (indicator) {
            const mode = getModeLabel();
            indicator.textContent = ` ${mode.icon} ${mode.text}`;
            indicator.className = `st-mode-indicator ${mode.class}`;
        }
    }

    // --- BANNER LOGIC ---
    const BANNER = {
        SPEED_SECONDS_SLOW: 34,
        MIN_REBUILD_MS: 1200,
        DEBOUNCE_MS: 450,
        POLL_MS: 15000,

        cachedBannerEl: null,
        lastRebuildAt: 0,
        debounceTimer: null,
        pollTimer: null,
        mo: null,
        scrollRAF: 0,
        timerPoll: null,
        layerTimer: null,

        tapHideTimer: null
    };

    const bannerClean = (s) => (s || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();

    const isTimeUnitOnlySegment = (s) => {
        const t = bannerClean(s).toLowerCase();
        if (!t) return false;
        const unitOnly = /^(?:day|days|hour|hours|minute|minutes|second|seconds)(?:\s+(?:day|days|hour|hours|minute|minutes|second|seconds))*$/i;
        return unitOnly.test(t);
    };

    const iconToEmoji = (el) => {
        if (!el || !el.getAttribute) return '';
        const cls = (el.getAttribute('class') || '').toLowerCase();
        const title = (el.getAttribute('title') || '').trim().toLowerCase();
        const aria  = (el.getAttribute('aria-label') || '').trim().toLowerCase();
        const dataIcon = (el.getAttribute('data-icon') || '').trim().toLowerCase();
        const hint = `${cls} ${title} ${aria} ${dataIcon}`;

        const map = [
            { re: /(snow|flake|winter)/, emoji: '❄️' },
            { re: /(gift|present)/, emoji: '🎁' },
            { re: /(star|badge)/, emoji: '⭐' },
            { re: /(bolt|lightning|zap)/, emoji: '⚡' },
            { re: /(bell|notify|notification)/, emoji: '🔔' },
            { re: /(info|circle-info|information)/, emoji: 'ℹ️' },
            { re: /(warning|triangle-exclamation|exclamation)/, emoji: '⚠️' },
            { re: /(check|circle-check|tick)/, emoji: '✅' },
            { re: /(times|xmark|circle-xmark|cross)/, emoji: '❌' },
            { re: /(lock|padlock)/, emoji: '🔒' },
            { re: /(unlock)/, emoji: '🔓' },
            { re: /(download)/, emoji: '⬇️' },
            { re: /(upload)/, emoji: '⬆️' },
            { re: /(double|2x)/, emoji: '2️⃣' },
            { re: /(coin|coins|money|bonus)/, emoji: '🪙' },
            { re: /(globe|world)/, emoji: '🌐' }
        ];

        const hit = map.find(m => m.re.test(hint));
        if (hit) return hit.emoji;
        if (aria) return aria;
        if (title) return title;
        return '';
    };

    const bannerTextWithIcons = (container) => {
        if (!container) return '';
        const clone = container.cloneNode(true);

        clone.querySelectorAll('img').forEach(img => {
            const alt = (img.getAttribute('alt') || img.getAttribute('title') || '').trim();
            img.replaceWith(document.createTextNode(alt ? ` ${alt} ` : ' '));
        });

        clone.querySelectorAll('i').forEach(i => {
            const rep = iconToEmoji(i);
            i.replaceWith(document.createTextNode(rep ? ` ${rep} ` : ' '));
        });

        clone.querySelectorAll('svg').forEach(svg => {
            let rep = iconToEmoji(svg);
            if (!rep) {
                const t = svg.querySelector('title');
                if (t && t.textContent) rep = t.textContent.trim();
            }
            svg.replaceWith(document.createTextNode(rep ? ` ${rep} ` : ' '));
        });

        return (clone.innerText || clone.textContent || '');
    };

    const splitIntoSegments = (text) => {
        let t = bannerClean(text);
        if (!t) return [];

        t = t.replace(/^\s*Site\s*Info\s*/i, '').trim();
        if (!t) return [];

        let parts = t.split(/\s*[•·|]\s*/g).map(bannerClean).filter(Boolean);

        if (parts.length <= 1) {
            const wrappers = ['⭐','🌐','🎁','🎄','🎉','📢','🔥','⚡','❄️','🪙','🔔','ℹ️','⚠️','✅','❌'];
            const s = t;
            const segs = [];
            let i = 0;

            const findNext = (from) => {
                let bestIdx = -1, bestEmoji = '';
                for (const e of wrappers) {
                    const idx = s.indexOf(e, from);
                    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
                        bestIdx = idx; bestEmoji = e;
                    }
                }
                return { idx: bestIdx, emoji: bestEmoji };
            };

            while (i < s.length) {
                const { idx, emoji } = findNext(i);
                if (idx === -1) {
                    const tail = s.slice(i).trim();
                    if (tail) segs.push(tail);
                    break;
                }

                const lead = s.slice(i, idx).trim();
                if (lead) segs.push(lead);

                const start = idx + emoji.length;
                const close = s.indexOf(emoji, start);

                if (close !== -1) {
                    const mid = s.slice(start, close).trim();
                    if (mid) segs.push(`${emoji} ${mid} ${emoji}`);
                    i = close + emoji.length;
                } else {
                    i = start;
                }
            }

            parts = segs.map(bannerClean).filter(Boolean);
        }

        if (parts.length <= 1) {
            parts = t.split(/\s{2,}/g).map(bannerClean).filter(Boolean);
        }

        return parts;
    };

    const bannerIsInsideBadArea = (el) => {
        if (!el || !el.closest) return true;
        const badSelectors = [
            ".chatbox", "#chatbox", ".chat", ".messages",
            ".forum", ".forums", ".topics", ".posts",
            "textarea", "input", ".comment", ".comments"
        ];
        return badSelectors.some(sel => el.closest(sel));
    };

    const bannerIsNearTop = (el) => {
        const r = el.getBoundingClientRect();
        return r.top < 280 && r.bottom > -80;
    };

    const bannerValidateCached = (el) => {
        if (!el) return false;
        if (!document.contains(el)) return false;
        if (el.id === 'banner' || el.id === 'banner-timer') return false;
        if (bannerIsInsideBadArea(el)) return false;
        if (!bannerIsNearTop(el)) return false;

        const t = bannerClean(bannerTextWithIcons(el));
        return /freeleech|open\s+registration|double\s+upload|christmas|new\s+year|holiday/i.test(t);
    };

    const bannerFindHeaderEl = () => {
        const logoImg =
            document.querySelector('.navbar-brand img') ||
            document.querySelector('a[href="/"] img') ||
            document.querySelector('a[href="index.php"] img') ||
            document.querySelector('img[alt*="DarkPeers" i]');

        if (logoImg && logoImg.closest) {
            const h = logoImg.closest('.top-nav, .navbar, header, nav, .site-header, .header, .topbar, .nav');
            if (h) return h;
        }

        return document.querySelector('.top-nav') ||
            document.querySelector('.navbar') ||
            document.querySelector('header') ||
            document.querySelector('nav') ||
            null;
    };

    const bannerComputeHeaderMetrics = () => {
        const headerEl = bannerFindHeaderEl();
        let headerZ = 1030;
        let headerH = 0;

        if (headerEl) {
            const cs = window.getComputedStyle(headerEl);
            const z = parseInt(cs.zIndex, 10);
            if (!Number.isNaN(z)) headerZ = z;

            const r = headerEl.getBoundingClientRect();
            const occupiesTop = (r.top <= 1 && r.bottom > 1 && r.height > 10 && r.height < 260);
            headerH = occupiesTop ? Math.round(r.height) : 0;
        }

        return { headerZ, headerH };
    };

    const bannerTemporarilyHide = (ms = getSetting(keys.bannerTapHideMs)) => {
        const bar = document.getElementById('banner');
        const timer = document.getElementById('banner-timer');
        if (bar) bar.classList.add('tap-hide');
        if (timer) timer.classList.add('tap-hide');

        if (BANNER.tapHideTimer) clearTimeout(BANNER.tapHideTimer);
        BANNER.tapHideTimer = setTimeout(() => {
            const b = document.getElementById('banner');
            const t = document.getElementById('banner-timer');
            if (b) b.classList.remove('tap-hide');
            if (t) t.classList.remove('tap-hide');
        }, ms);
    };

    const bannerSyncLayering = () => {
        const bar = document.getElementById('banner');
        const timer = document.getElementById('banner-timer');

        const { headerZ, headerH } = bannerComputeHeaderMetrics();
        const stuck = headerH > 0;

        const z = String(Math.max(10, headerZ - 1));

        if (bar) {
            bar.style.zIndex = z;
            bar.style.top = `0px`;
            bar.classList.toggle('stuck-hide', stuck);
        }

        if (timer) {
            timer.style.zIndex = z;
            const barH = bar ? Math.round(bar.getBoundingClientRect().height || 34) : 34;
            timer.style.top = `${barH}px`;
            timer.classList.toggle('stuck-hide', stuck);
        }
    };

    const bannerFindBannerContainer = () => {
        if (bannerValidateCached(BANNER.cachedBannerEl)) return BANNER.cachedBannerEl;

        const likely = [
            ".alert", ".notification", ".banner", ".announcement", ".site-alert",
            ".topbar", ".top", ".navbar", ".top-nav", "header", "nav"
        ];

        const candidates = [];
        for (const sel of likely) document.querySelectorAll(sel).forEach(el => candidates.push(el));

        let best = null;
        let bestScore = 0;

        for (const el of candidates) {
            if (!el || el.id === 'banner' || el.id === 'banner-timer') continue;
            if (bannerIsInsideBadArea(el)) continue;
            if (!bannerIsNearTop(el)) continue;

            const t = bannerClean(bannerTextWithIcons(el));
            if (!t || !/freeleech|open\s+registration|double\s+upload|christmas|new\s+year|holiday/i.test(t)) continue;

            const r = el.getBoundingClientRect();
            const sizePenalty = Math.min(3, Math.floor((r.height || 0) / 120));
            const score = 10 - sizePenalty + (t.length > 30 ? 1 : 0);

            if (score > bestScore) { bestScore = score; best = el; }
        }

        BANNER.cachedBannerEl = best;
        return best;
    };

    const findCountdownInText = (raw) => {
        const text = bannerClean(raw);
        if (!text) return '';
        const re = /(\d+\s*Day(?:s)?\s+\d+\s*Hour(?:s)?\s+\d+\s*Minute(?:s)?\s+(?:and\s+)?\d+\s*Second(?:s)?)/i;
        const m = text.match(re);
        return m ? bannerClean(m[1]) : '';
    };

    const updateTimerBar = () => {
        try {
            const enabled = getSetting(keys.bannerEnabled);
            let timerBar = document.getElementById('banner-timer');

            if (!enabled) {
                if (timerBar) timerBar.remove();
                return;
            }

            const container = bannerFindBannerContainer();
            let countdown = '';

            if (container) countdown = findCountdownInText(bannerTextWithIcons(container));
            if (!countdown) {
                const header = bannerFindHeaderEl();
                if (header) countdown = findCountdownInText(bannerTextWithIcons(header));
            }

            if (!timerBar) {
                timerBar = document.createElement('div');
                timerBar.id = 'banner-timer';
                timerBar.innerHTML = `<span></span>`;
                const bar = document.getElementById('banner');
                if (bar && bar.parentNode) bar.parentNode.insertBefore(timerBar, bar.nextSibling);
                else document.body.insertBefore(timerBar, document.body.firstChild);
            }

            const span = timerBar.querySelector('span');
            if (countdown && countdown !== "00 Day 00 Hour 00 Minute and 00 Second") {
                span.textContent = countdown;
                timerBar.style.display = 'flex';
            } else {
                timerBar.style.display = 'none';
            }

            bannerSyncLayering();
        } catch (e) {
            console.error('[ChEd TimerBar] error:', e);
        }
    };

    const isBlockedLine = (line, blockedLines) => {
        if (!getSetting(keys.hideBlockedAlerts)) return false;
        if (!line) return false;
        const result = blockedLines.some(blocked => line.toLowerCase().includes(blocked.toLowerCase()));
        return result;
    };

    const bannerExtractMessages = (container) => {
        const raw = bannerTextWithIcons(container);
        if (!raw) return [];

        const countdown = findCountdownInText(raw);

        const lines = raw.split(/\r?\n+/).map(bannerClean).filter(Boolean);
        const out = [];

        const alertLines = getSetting(keys.blockedAlertLines) || [];

        for (const line of lines) {
            splitIntoSegments(line).forEach(seg => {
                let s = bannerClean(seg);
                if (!s) return;

                if (countdown && s.includes(countdown)) {
                    s = bannerClean(s.replace(countdown, ''));
                    if (!s) return;
                }

                if (isTimeUnitOnlySegment(s)) return;
                if (s.length < 6) return;
                if (isBlockedLine(s, alertLines)) return; // <-- skip blocked lines

                out.push(s);
            });
        }

        return Array.from(new Set(out));
    };

    const bannerEnsure = (messages) => {
        let bar = document.getElementById('banner');

        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'banner';

            const viewport = document.createElement('div');
            viewport.className = 'banner-viewport';

            const track = document.createElement('div');
            track.className = 'banner-track';

            viewport.appendChild(track);
            bar.appendChild(viewport);
            document.body.insertBefore(bar, document.body.firstChild);

            bar.addEventListener('click', () => bannerTemporarilyHide(getSetting(keys.bannerTapHideMs)), { passive: true });
        }

        const track = bar.querySelector('.banner-track');
        track.innerHTML = '';

        const buildItems = () => {
            const frag = document.createDocumentFragment();
            messages.forEach(m => {
                const item = document.createElement('span');
                item.className = 'banner-item';
                item.textContent = m;
                frag.appendChild(item);

                const sep = document.createElement('span');
                sep.className = 'banner-sep';
                sep.textContent = '•';
                frag.appendChild(sep);
            });
            return frag;
        };

        for (let i = 0; i < 15; i++)
        {
            const chunk = document.createElement('div');
            chunk.style.display = 'inline-flex';
            chunk.appendChild(buildItems());

            track.appendChild(chunk);
        }

        bannerSyncLayering();
        bannerSyncAnimation();
    };

    const bannerSyncAnimation = () => {
        const track = document.querySelector('#banner .banner-track');
        if (!track) return;

        const trackWidth = track.scrollWidth / 2;
        if (getSetting(keys.bannerSpeedPxPerSec) === 0)
        {
            track.style.animation = 'none';
            return;
        }
        const duration = trackWidth / getSetting(keys.bannerSpeedPxPerSec);

        track.style.setProperty('--track-width', `${trackWidth}px`);
        track.style.animation = `bannerMarquee ${duration}s linear infinite`;
    };

    const bannerUnhideAll = () => {
        document.querySelectorAll('.banner-hidden').forEach(el => el.classList.remove('banner-hidden'));
    };

    const bannerHideOriginal = (container) => {
        const t = bannerClean(bannerTextWithIcons(container));
        if (!/freeleech|open\s+registration|double\s+upload|christmas|new\s+year|holiday/i.test(t)) return;
        container.classList.add('banner-hidden');
    };

    const bannerCoreRun = () => {
        const enabled = getSetting(keys.bannerEnabled);

        if (!enabled) {
            document.getElementById('banner')?.remove();
            document.getElementById('banner-timer')?.remove();
            bannerUnhideAll();
            return;
        }

        const container = bannerFindBannerContainer();
        if (!container) {
            document.getElementById('banner')?.remove();
            document.getElementById('banner-timer')?.remove();
            bannerUnhideAll();
            return;
        }

        const messages = bannerExtractMessages(container).map(bannerClean).filter(Boolean);

        if (!messages.length) {
            document.getElementById('banner')?.remove();
            document.getElementById('banner-timer')?.remove();
            bannerUnhideAll();
        } else {
            bannerEnsure(messages);
            bannerHideOriginal(container);
        }

        updateTimerBar();
    };

    const bannerSafeRun = (force = false) => {
        try {
            const now = Date.now();
            if (!force && (now - BANNER.lastRebuildAt) < 1200) return;
            BANNER.lastRebuildAt = now;
            bannerCoreRun();
        } catch (err) {
            console.error('[ChEd Banner] error:', err);
        }
    };

    const bannerScheduleRun = () => {
        if (BANNER.debounceTimer) clearTimeout(BANNER.debounceTimer);
        BANNER.debounceTimer = setTimeout(() => bannerSafeRun(false), 450);
    };

    const bannerInit = () => {
        bannerSafeRun(true);

        const observeRoot = bannerFindHeaderEl() || document.body;
        if (BANNER.mo) { try { BANNER.mo.disconnect(); } catch (_) {} }

        BANNER.mo = new MutationObserver(() => bannerScheduleRun());
        BANNER.mo.observe(observeRoot, { childList: true, subtree: true, characterData: true, attributes: true });

        if (BANNER.pollTimer) clearInterval(BANNER.pollTimer);
        BANNER.pollTimer = setInterval(() => bannerSafeRun(false), 15000);

        if (BANNER.timerPoll) clearInterval(BANNER.timerPoll);
        BANNER.timerPoll = setInterval(() => updateTimerBar(), 1200);

        if (BANNER.layerTimer) clearInterval(BANNER.layerTimer);
        BANNER.layerTimer = setInterval(() => {
            if (document.getElementById('banner') || document.getElementById('banner-timer')) {
                bannerSyncLayering();
            }
        }, 350);

        const onScroll = () => {
            if (BANNER.scrollRAF) return;
            BANNER.scrollRAF = requestAnimationFrame(() => {
                BANNER.scrollRAF = 0;
                bannerSyncLayering();
            });
        };

        window.addEventListener('resize', bannerSyncLayering, { passive: true });
        window.addEventListener('orientationchange', bannerSyncLayering, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
    };

    // --- MENU COMMANDS ---
    GM_registerMenuCommand("⚙️ Open Configuration Menu", () => {
        openConfigurationOverlay();
    });

    // --- CSS STYLES ---
    const color = getSetting(keys.alertColor);
    const rootCss = `
        :root {
            --alertColor: ${color};
            --alertColorB6: ${color}B6;
            --alertColor0A: ${color}0A;
        }`;

    const css = `
        /* 1. Logo Replacement (Toggleable via class) */
        /* Base: normal site logo visible */
        body.logo-active .top-nav__branding > *:not(.st-logo-override) {
            display: none !important;
        }

        /* Show custom logo only when enabled */
        body.logo-active .top-nav__branding > .st-logo-override {
            display: inline-block !important;
        }

        /* Default (when logo-active is off) */
        body:not(.logo-active) .top-nav__branding > .st-logo-override {
            display: none !important;
        }


        /* 2. Avatar Replacement (Toggleable via class) */
        body.avatar-active img[src*="profile.png"] {
            content: url("${GM_getResourceURL("avatar")}") !important;
            object-fit: cover !important;
        }

        /* 3. Sparkle Killer */
        body.hide-sparkles *[style*="sparkles"] {
            background-image: none !important;
        }
        body.hide-sparkles *[style*="sparkels"] {
            background-image: none !important;
        }

        /* 4. Notification Cleanup */
        body[class*="notifications"] .hide-notification svg {
            display: none !important;
        }

        /* 5. Notification Booster */
        @keyframes beat {
            0% { transform: scale(1); box-shadow: 0 0 0 0 var(--alertColorB6); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px var(--alertColor); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 var(--alertColor); }
        }

        @keyframes text-beat {
            0% { color: #ffffff; text-shadow: 0 0 5px var(--alertColor); }
            50% { color: var(--alertColor); text-shadow: 0 0 15px var(--alertColor); }
            100% { color: #ffffff; text-shadow: 0 0 5px var(--alertColor); }
        }

        body[class*="notifications"] .notification-active i {
            animation: text-beat 1s infinite ease-in-out !important;
        }

        .top-nav__toggle.alert-active {
            animation: beat 1.5s infinite ease-in-out !important;
            color: var(--alertColor) !important;
            border: 2px solid var(--alertColor) !important;
            background-color: var(--alertColor0A) !important;
        }

        /* 6. Particle Effect */
        #particle-container {
            position: fixed;
            top: -20%;
            left: -20%;
            width: 140%;
            height: 140%;
            pointer-events: none;
            z-index: 99999;
            display: none;
        }

        .particle-active #particle-container {
            display: block;
        }

        .particle {
            position: absolute;
            top: -20px;
            color: #FFF;
            font-size: 0.66em;
            font-family: Arial;
            text-shadow: 0 0 1px #000;
            user-select: none;
            cursor: default;
            animation-name: particles-fall, particles-shake;
            animation-duration: 10s, 3s;
            animation-timing-function: linear, ease-in-out;
            animation-iteration-count: infinite, infinite;
            opacity: 0.7;
        }

        @keyframes particles-fall {
            0% { top: -20%; }
            100% { top: 110%; }
        }

        @keyframes particles-shake {
            0% { transform: translateX(0px); }
            50% { transform: translateX(80px); }
            100% { transform: translateX(0px); }
        }

        .particle.small { font-size: 0.5em; opacity: 0.6; }
        .particle.med { font-size: 0.7em; opacity: 0.8; }
        .particle.large { font-size: 1.2em; opacity: 0.9; }

        /* 7. Bon Display (Cleaner Look) */
        #bon-display {
            display: none;
            align-items: center;
            margin-right: 10px;
            margin-left: 10px;
            color: var(--alertColor);
            font-weight: bold;
            font-size: 1.1em;
            white-space: nowrap;
        }

        #bon-display i {
            margin-right: 6px;
            font-size: 1.2em;
        }

        @media (max-width: 1024px) {
            #bon-display {
                display: flex;
            }
        }

        /* 8. Configuration Overlay */
        #st-config-overlay {
            position: fixed;
            top: calc(50% - 45vh);
            left: calc(50% - min(40vw, 250px));
            width: 500px;
            max-width: 80vw;
            background: #1e1e1e;
            color: #ddd;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 0;
            z-index: 999999;
            font-family: sans-serif;
            box-shadow: 0 0 14px rgba(0,0,0,0.4);
        }

        #st-config-header {
            padding: 10px;
            background: #333;
            cursor: move;
            user-select: none;
            font-weight: bold;
            border-bottom: 1px solid #444;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #st-config-body {
            max-height: 70vh;
            overflow-y: auto;
            padding: 10px;
        }

        .st-row {
            display: flex;
            margin-bottom: 8px;
            align-items: center;
            height: 28px;
        }

        .st-input {
            flex: 1;
            padding: 5px;
            background: #2a2a2a;
            color: #fff;
            border: 1px solid #555;
            border-radius: 4px;
        }

        .st-setting {
            max-width: 30%;
        }

        .st-remove {
            margin-left: 6px;
            background: #aa3333;
            color: #fff;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
        }

        .st-reset {
            margin-left: 6px;
            background: #aa3333;
            color: #fff;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
        }

        #st-add-line, #st-save, #st-close {
            width: 29%;
            margin: 8px 2%;
            padding: 6px;
            border: none;
            background: #444;
            color: #fff;
            border-radius: 5px;
            cursor: pointer;
        }

        #st-save { background: #338833; }
        #st-close { background: #aa3333; }
        #st-add-line { background: #444488; }

        .st-section {
            border: 1px solid #444;
            border-radius: 4px;
            margin: 6px 0;
            overflow: hidden;
        }

        .st-section-header {
            background: #333;
            padding: 6px 10px;
            font-weight: bold;
            cursor: pointer;
            user-select: none;
        }

        .st-section-body {
            padding: 6px;
        }

        .st-mode-indicator {
            margin-left: 10px;
            font-size: 0.85em;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: normal;
        }

        .st-mode-indicator.global {
            background: #2b4c7e;
            color: #cfe2ff;
        }

        .st-mode-indicator.site {
            background: #2e6b3f;
            color: #d7ffe2;
        }


        /* 9. Header Announcement Banner */
        #banner {
            position: sticky;
            top: 0;
            height: 34px;
            display: flex;
            align-items: center;
            overflow: hidden;
            background: rgba(0,0,0,.55);
            border-bottom: 1px solid rgba(255,255,255,.12);
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
            padding: 0 10px;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
            transition: opacity .18s ease;
        }

        #banner .banner-viewport{
            position: relative;
            flex: 1 1 auto;
            overflow: hidden;
            height: 100%;
            display: flex;
            align-items: center;
        }

        #banner .banner-track{
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
            will-change: transform;
            animation: bannerMarquee linear infinite;
        }

        #banner .banner-item{
            font: 500 13px/1.0 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial,
                        "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;
            color: rgba(255,255,255,.92);
            display: inline-flex;
            align-items: center;
        }

        #banner .banner-sep {
            display: inline-block !important;
            width: 26px;
            opacity: 0;
            pointer-events: none;
        }

        @keyframes bannerMarquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
        }

        #banner-timer {
            position: sticky;
            top: 34px;
            height: 26px;
            display: none;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: rgba(0,0,0,.38);
            border-bottom: 1px solid rgba(255,255,255,.10);
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
            padding: 0 10px;
            user-select: none;
            -webkit-user-select: none;
            transition: opacity .18s ease;
        }

        #banner-timer span {
            font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial,
                        "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;
            color: rgba(255,255,255,.88);
            white-space: nowrap;
        }

        .banner-hidden { display: none !important; }

        .stuck-hide {
            opacity: 0 !important;
            pointer-events: none !important;
        }

        .tap-hide {
            display: none !important;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 24px;
            margin: 2px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s cubic-bezier(0,1,0.5,1);
            border-radius: 4px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s cubic-bezier(0,1,0.5,1);
            border-radius: 3px;
        }

        input:checked + .slider {
            background-color: #52c944;
        }

        input:focus + .slider {
            box-shadow: 0 0 4px #7efa70;
        }

        input:checked + .slider:before {
            -webkit-transform: translateX(16px);
            -ms-transform: translateX(16px);
            transform: translateX(16px);
        }

        .range-value {
            text-align: center;
            margin-left: 6px;
            padding: 4px 8px;
            width: 30px;
        }

        input[type="color"] {
            appearance: none;
            -moz-appearance: none;
            -webkit-appearance: none;
            background: none;
            border: 0px;
            cursor: pointer;
            height: 24px;
            padding: 0;
            border-radius: 10px;
            width: 40px;
            margin-right: 2px;
        }

        *:focus{
            border-radius: 0;
            outline: none;
        }

        ::-webkit-color-swatch-wrapper {
            padding: 0;
        }

        ::-webkit-color-swatch{
            border: 0;
            border-radius: 0;
        }

        ::-moz-color-swatch,
        ::-moz-focus-inner{
            border: 0;
        }

        ::-moz-focus-inner{
            padding: 0;
        }

        /* Rounded sliders */
        .slider.round {
            border-radius: 34px;
        }

        .slider.round:before {
            border-radius: 50%;
        }

        /* Prevent banner from flashing while page loads */
        .alerts .alert {
            display: none;
        }
    `;

    const rootStyle = GM_addStyle(rootCss)
    const style = GM_addStyle(css);

    // --- MAIN LOOP ---
    const mainLoop = () => {
        checkNotifications();
        updateBonDisplay();
        updatePermanentAlerts();
    };


    // --- INITIALIZATION ---
    if (document.body) {
        applyLogoState();
        applyAvatarState();
        applySparkleState();
        applyParticleState();
        applyParticleDensity();
        applyModerationLog();
    }

    window.addEventListener('DOMContentLoaded', () => {
        initLogoOverride();
        applyLogoState();
        applyAvatarState();
        applySparkleState();
        applyParticleState();
        applyParticleDensity();
        applyModerationLog();
        initConfigurationButton();
        bannerInit();
        mainLoop();
        setInterval(mainLoop, 2000);
    });

})();
