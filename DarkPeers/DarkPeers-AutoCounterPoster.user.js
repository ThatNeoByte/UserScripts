// ==UserScript==
// @name            DarkPeers – Auto Counter Poster
// @namespace       https://github.com/ThatNeoByte/UserScripts
// @version         1.0.0
// @description     Automatically posts the next number in the DarkPeers counting thread, avoids mistakes, and skips posting after a specific user.
// @author          ThatNeoByte
// @license         MIT
//
// @match           https://darkpeers.org/forums/topics/12?*
// @icon            https://darkpeers.org/favicon.ico
// @updateURL       https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/DarkPeers/DarkPeers-AutoCounterPoster.user.js
// @downloadURL     https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/DarkPeers/DarkPeers-AutoCounterPoster.user.js
//
// @run-at          document-end
// ==/UserScript==


(function() {
    'use strict';

    /************************************
     *         USER SETTINGS            *
     ************************************/

    const IGNORE_USERNAME = "NeoByte"; // Don't post if this user made the last post
    const POSTS_TO_CHECK = 25; // There can only be up to 25 posts per page
    const REFRESH_INTERVAL = 8000; // 8 sec
    const NUMBER_REGEX = /(\d[\d ]*\d)/;
    const STORAGE_KEY = "unit3d_last_correct_number";

    /************************************
     *    DO NOT EDIT BELOW THIS LINE   *
     ************************************/

    function saveLastNumber(num) {
        localStorage.setItem(STORAGE_KEY, String(num));
    }

    function loadLastNumber() {
        const v = localStorage.getItem(STORAGE_KEY);
        return v ? parseInt(v, 10) : null;
    }

    function gotoNextPageIfNeeded() {
        const nextPageLink = document.querySelector("a.pagination__next");
        if (nextPageLink) {
            console.info("[Unit3D] Going to next page:\n", nextPageLink.href);
            document.location.href = nextPageLink.href;
            return true;
        }
        return false;
    }

    function addFloatingCounter(text) {
        let box = document.getElementById("FloatingPostCounter");
        if (!box) {
            box = document.createElement("div");
            box.id = "FloatingPostCounter";
            box.style.position = "fixed";
            box.style.top = "82px";
            box.style.right = "10px";
            box.style.background = "rgba(0,0,0,0.8)";
            box.style.color = "#fff";
            box.style.padding = "8px 12px";
            box.style.borderRadius = "4px";
            box.style.zIndex = 99999;
            document.body.appendChild(box);
        }
        box.textContent = `Current number:\n${text}`;
    }

    function extractNumber(text) {
        const match = text.match(NUMBER_REGEX);
        if (!match) return null;
        return parseInt(match[1].replace(/\s+/g, ""), 10);
    }

    function getPosts() {
        const posts = [...document.querySelectorAll("article.post")].slice(-POSTS_TO_CHECK);
        return posts.map(p => ({
            element: p,
            author: p.querySelector("a.user-tag__link")?.innerText.trim() || "",
            text: p.querySelector("div.post__content")?.innerText.trim() || "",
            number: extractNumber(p.querySelector("div.post__content")?.innerText.trim() || "")
        }));
    }

    function sendPost(number) {
        const textarea = document.querySelector("#bbcode-content");
        const form = document.querySelector("#forum_reply_form");

        if (!textarea || !form) {
            console.error("Form elements not found!");
            return;
        }

        textarea.value = String(number); // vul nummer in
        form.submit(); // verstuur formulier
    }

    /************************************
     *       MAIN CHECKING LOGIC        *
     ************************************/
    function main() {
        if (!gotoNextPageIfNeeded())
        {
            checkThread();
        }
    }

    function checkThread() {
        const posts = getPosts();

        let lastKnown = loadLastNumber(); // persistent cross-page
        let expected = null;
        let previousFound = null;
        let canPost = true;
        let errors = [];

        posts.forEach(post => {
            console.info(`[Unit3D] Checking post by ${post.author}, extracted number: ${post.number}`);
            if (post.number === null)
            {
                console.warn(`[Unit3D] Could not extract number from post by ${post.author}, text: ${post.text}. Skipping.`);
                return;
            }

            if (previousFound !== null) {
                if (post.number !== expected) {
                    errors.push({
                        expected: expected,
                        found: post.number,
                        author: post.author,
                        text: post.text
                    });
                }
            } else {
                expected = post.number; // initialize expected on first valid post
            }

            previousFound = post.number;
            expected++;

            // Update highest known number
            if (lastKnown === null || post.number > lastKnown) {
                lastKnown = post.number;
                saveLastNumber(post.number);
            }

            if (post.author === IGNORE_USERNAME)
            {
                console.debug(`[Unit3D] Skipping post by ignored user: ${IGNORE_USERNAME}`);
                canPost = false;
            } else {
                canPost = true;
            }
        });

        errors.forEach(error => {
            console.error(`[Unit3D] Counting mistake detected! Expected ${error.expected}, found ${error.found} (by ${error.author})\nPost content:\n${error.text}`);
        });

        if (errors.length > 0) {
            console.warn(`[Unit3D] Total mistakes detected: ${errors.length}`);
        } else {
            console.info("[Unit3D] No mistakes detected. Highest number:", lastKnown);
        }

        addFloatingCounter(lastKnown !== null ? lastKnown : "N/A");

        if (canPost && errors.length <= 1 && lastKnown !== null) {
            const nextNumber = lastKnown + 1;
            console.info(`[Unit3D] Posting next number: ${nextNumber}`);
            sendPost(nextNumber);
        } else {
            console.info("[Unit3D] Not posting due to 2 or more errors or an ignored user.");
        }
    }

    /************************************
     *          AUTO REFRESH
     ************************************/

    setTimeout(main, 500);
    setInterval(() => location.reload(), REFRESH_INTERVAL);
})();