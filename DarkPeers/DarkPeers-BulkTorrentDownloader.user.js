// ==UserScript==
// @name            DarkPeers – Bulk Torrent Downloader
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         1.3.1
// @description     Adds a button to download all torrents on the page with user confirmation (Firefox compatible)
// @author          ThatNeoByte
// @license         MIT
//
// @match           *://darkpeers.org/torrents?*
// @icon            https://darkpeers.org/favicon.ico
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/DarkPeers/DarkPeers-BulkTorrentDownloader.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/DarkPeers/DarkPeers-BulkTorrentDownloader.user.js
//
// @grant           GM_download
// @connect         darkpeers.org
// ==/UserScript==


(function () {
    'use strict';

    const BUTTON_CLASS = "dp-custom-button";

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getTorrentButtons() {
        return document.querySelectorAll(
            "a.torrent-search--list__file.form__standard-icon-button"
        );
    }

    async function startDownloadProcess() {
        const buttons = getTorrentButtons();

        if (buttons.length === 0) {
            alert("No torrent buttons found on this page.");
            return;
        }

        if (!confirm(`Download all ${buttons.length} torrent files?`)) return;

        for (const btn of buttons) {
            btn.click();
            await sleep(2500);
        }
    }

    function createButton(iconClass, handler, title) {
        const li = document.createElement("li");
        li.classList.add(BUTTON_CLASS);

        const a = document.createElement("a");
        a.className = "form__standard-icon-button";
        a.style.cursor = "pointer";
        a.title = title;

        const icon = document.createElement("i");
        icon.className = iconClass;

        a.appendChild(icon);
        li.appendChild(a);

        a.addEventListener("click", e => {
            e.preventDefault();
            handler();
        });

        return li;
    }

    function injectButtons() {
        const ul = document.querySelector("ul.pagination__items");
        if (!ul) return;

        // Prevent duplicates
        if (ul.querySelector(`.${BUTTON_CLASS}`)) return;

        const downloadBtn = createButton(
            "fas fa-download",
            startDownloadProcess,
            "Download all torrents"
        );

        ul.appendChild(downloadBtn);

        console.log("[DarkPeers] Buttons injected.");
    }

    // Observe DOM changes (SPA navigation support)
    const observer = new MutationObserver(() => {
        injectButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial attempt
    injectButtons();

})();
