// ==UserScript==
// @name         Youtube Premium ADB
// @namespace    https://github.com/chokiproai/Youtube-Premium
// @version      1.0
// @description         A script to remove YouTube ads, including static ads and video ads, without interfering with the network and ensuring safety.
// @match        *://*.youtube.com/*
// @exclude      https://studio.youtube.com/*
// @exclude      *://accounts.youtube.com/*
// @exclude      *://www.youtube.com/live_chat_replay*
// @exclude      *://www.youtube.com/persist_identity*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @grant        none
// @author       Chokiproai
// @updateURL    https://github.com/chokiproai/Youtube-Premium/raw/refs/heads/main/Youtube-Premium-ADB.user.js
// @downloadURL  https://github.com/chokiproai/Youtube-Premium/raw/refs/heads/main/Youtube-Premium-ADB.user.js
// @license MIT
// ==/UserScript==

(function () {
    'use strict';

    const isYouTubeMobile = location.hostname === 'm.youtube.com';
    const isYouTubeMusic = location.hostname === 'music.youtube.com';
    const isYouTubeVideo = !isYouTubeMusic;
    const cssSelectorArr = [
        '#masthead-ad',
        'ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)',
        '.video-ads.ytp-ad-module',
        'tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)',
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
        '#related #player-ads',
        '#related ytd-ad-slot-renderer',
        'ytd-ad-slot-renderer',
        'yt-mealbar-promo-renderer',
        'ytd-popup-container:has(a[href="/premium"])',
        'ad-slot-renderer',
        'ytm-companion-ad-renderer'
    ];

    const extraCssSelectors = [
        '#player-ads',
        '#panels > ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
        '.ytp-featured-product',
        'ytd-merch-shelf-renderer',
        'ytmusic-mealbar-promo-renderer',
        'ytmusic-statement-banner-renderer'
    ];

    const adSelectors = [
        ['ytd-reel-video-renderer', '.ytd-ad-slot-renderer']
    ];

    function getCurrentTimeString() {
        return new Date().toTimeString().split(' ', 1)[0];
    }

    function checkIsYouTubeShorts() {
        return location.pathname.startsWith('/shorts/');
    }

    function addCss() {
        const css = [...cssSelectorArr, ...extraCssSelectors].map(sel => `${sel} { display: none !important; }`).join(' ');
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function removeAdElements() {
        for (const adSelector of adSelectors) {
            const adEl = document.querySelector(adSelector[0]);
            if (!adEl) continue;
            const neededEl = adEl.querySelector(adSelector[1]);
            if (!neededEl) continue;
            adEl.remove();
        }
    }

    function skipAd() {
        if (checkIsYouTubeShorts()) return;

        const adShowing = document.querySelector('.ad-showing');
        const pieCountdown = document.querySelector('.ytp-ad-timed-pie-countdown-container');
        const surveyQuestions = document.querySelector('.ytp-ad-survey-questions');

        if (!adShowing && !pieCountdown && !surveyQuestions) return;

        let playerEl, player;
        if (isYouTubeMobile || isYouTubeMusic) {
            playerEl = document.querySelector('#movie_player');
            player = playerEl;
        } else {
            playerEl = document.querySelector('#ytd-player');
            player = playerEl && playerEl.getPlayer();
        }

        if (!playerEl || !player) {
            console.log({ message: 'Player not found', timeStamp: getCurrentTimeString() });
            return;
        }

        let adVideo = null;
        if (!pieCountdown && !surveyQuestions) {
            adVideo = document.querySelector('#ytd-player video.html5-main-video, #song-video video.html5-main-video');
            if (!adVideo || !adVideo.src || adVideo.paused || isNaN(adVideo.duration)) return;
        }

        if (isYouTubeMusic && adVideo) {
            adVideo.currentTime = adVideo.duration;
        } else {
            const videoData = player.getVideoData();
            const videoId = videoData.video_id;
            const start = Math.floor(player.getCurrentTime());

            if ('loadVideoWithPlayerVars' in playerEl) {
                playerEl.loadVideoWithPlayerVars({ videoId, start });
            } else {
                playerEl.loadVideoByPlayerVars({ videoId, start });
            }
        }
    }

    function observePopupRemoval() {
        const removePop = node => {
            const popup = node.querySelector('.ytd-popup-container > .ytd-popup-container > .ytd-enforcement-message-view-model');
            if (popup) {
                popup.parentNode.remove();
                const bds = document.getElementsByTagName('tp-yt-iron-overlay-backdrop');
                for (let i = bds.length; i--;) bds[i].remove();
            }
            if (node.tagName?.toLowerCase() === 'tp-yt-iron-overlay-backdrop') node.remove();
        };

        const obs = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    Array.from(mutation.addedNodes).filter(n => n.nodeType === 1).forEach(removePop);
                }
            });
        });

        obs.observe(document.body, { childList: true, subtree: true });
    }

    // Run main logic
    addCss();
    observePopupRemoval();

    if (isYouTubeVideo) {
        window.setInterval(removeAdElements, 1000);
        removeAdElements();
    }

    window.setInterval(skipAd, 500);
    skipAd();
})();