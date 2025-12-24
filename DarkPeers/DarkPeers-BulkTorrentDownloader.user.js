// ==UserScript==
// @name            DarkPeers – Bulk Torrent Downloader
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         1.3.0
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startDownloadProcess() {
        const buttons = document.querySelectorAll("a.torrent-search--list__file.form__standard-icon-button");

        if (buttons.length === 0) {
            alert("No torrent buttons found on this page.");
            return;
        }

        const ok = confirm(`Are you sure you want to download all ${buttons.length} torrent files?`);
        if (!ok) return;

        console.log(`[Downloader] Starting download of ${buttons.length} files.`);

        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];

            console.log(`[Downloader] Pressing button ${btn.href}`);

            // Auto-click the button to start the .torrent download
            btn.click();

            // wait 2.5 seconds before next click
            await sleep(2500);
        }
        console.log("[Downloader] All downloads initiated.");
    }

    function addDownloadButton() {
        const ul = document.querySelector("ul.pagination__items");
        if (!ul) return;

        const li = document.createElement("li");
        li.className = "dl-start-download";

        const a = document.createElement("a");
        a.className = "form__standard-icon-button";
        a.style.cursor = "pointer";

        const icon = document.createElement("i");
        icon.className = "fas fa-download";

        a.appendChild(icon);
        li.appendChild(a);
        ul.appendChild(li);

        a.addEventListener("click", (e) => {
            e.preventDefault();
            startDownloadProcess();
        });

        console.log("[Downloader] Start button added.");
    }

    window.addEventListener("load", addDownloadButton);

})();
