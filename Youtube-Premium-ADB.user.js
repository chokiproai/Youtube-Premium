// ==UserScript==
// @name         Youtube Premium ADB
// @namespace    https://github.com/chokiproai/Youtube-Premium
// @version      1.0
// @description         A script to remove YouTube ads, including static ads and video ads, without interfering with the network and ensuring safety.
// @match        *://*.youtube.com/*
// @exclude      *://studio.youtube.com/*
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

(function() {
    'use strict';

    const CONFIG = {
        FALLBACK_INTERVAL_MS: 500,
    // New: Compatibility mode. If enabled (true), the script will automatically
    // disable if it detects another ad blocker is active.
        COMPATIBILITY_MODE: true
    };

    let isDisabled = false;
    let lastProcessedVideoSrc = null;

    const detectExternalAdBlocker = () => {
        if (!CONFIG.COMPATIBILITY_MODE) return;

        const baitElement = document.createElement('div');
        baitElement.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
        baitElement.style.cssText = 'position:absolute; left:-9999px; top:-9999px; width:1px; height:1px;';
        document.body.appendChild(baitElement);

        setTimeout(() => {
            if (baitElement.offsetHeight === 0 || getComputedStyle(baitElement).display === 'none') {
                isDisabled = true;
            }
            baitElement.remove();
        }, 100);
    };

    const getAdSelectors = () => {
        const selectors = [
            '#masthead-ad', '.ytd-ad-slot-renderer', 'ytd-ad-slot-renderer',
            'ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)',
            '#player-ads', '#related #player-ads',
            'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
            '.yt-mealbar-promo-renderer', 'yt-mealbar-promo-renderer', '.ytp-featured-product',
            'ytd-merch-shelf-renderer', 'ytmusic-mealbar-promo-renderer', 'ytmusic-statement-banner-renderer',
            'tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)', 'ytm-companion-ad-renderer',
            '.video-ads.ytp-ad-module', '.ytp-ad-text-overlay', '.ytp-ad-preview-container',
            'ytd-enforcement-message-view-model', 'tp-yt-iron-overlay-backdrop',
            'ytd-popup-container:has(a[href="/premium"])'
        ];
        return [...new Set(selectors)];
    };

    const hideStaticAds = () => {
        if (isDisabled) return;
        const styleId = 'ultimate-ad-bypasser-styles';
        if (document.getElementById(styleId)) return;
        const css = `${getAdSelectors().join(', ')} { display: none !important; }`;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    };

    const handleVideoAds = () => {
        if (isDisabled || location.pathname.startsWith('/shorts/')) return;
        const video = document.querySelector('video.html5-main-video');
        const player = document.querySelector('#movie_player');
        if (!video || !player) return;
        const isAdPlaying = player.classList.contains('ad-interrupting');
        if (isAdPlaying && video.duration > 0.1 && !isNaN(video.duration)) {
            if (video.currentTime < video.duration - 0.1) {
                video.muted = true;
                video.currentTime = video.duration;
            }
            if (video.paused) {
                video.play();
            }
            return;
        }
        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern');
        if (skipButton) {
            skipButton.click();
        }
    };

    const handleAntiAdBlockPopup = (node) => {
        if (isDisabled || node.nodeType !== 1) return;
        const enforcementMessage = node.querySelector('ytd-enforcement-message-view-model') || (node.tagName === 'YTD-ENFORCEMENT-MESSAGE-VIEW-MODEL' ? node : null);
        if (enforcementMessage) {
            const popupContainer = enforcementMessage.closest('ytd-popup-container');
            if (popupContainer) {
                popupContainer.remove();
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                setTimeout(() => {
                    const mainVideo = document.querySelector('video.html5-main-video');
                    if (mainVideo && mainVideo.paused) {
                        mainVideo.play();
                    }
                }, 100);
            }
        }
    };

    const initializePlayer = (video) => {
        if (isDisabled || !video.src || video.src === lastProcessedVideoSrc) {
            return;
        }
        lastProcessedVideoSrc = video.src;
        const guardianInterval = setInterval(() => {
            const player = video.closest('#movie_player');
            if (!player || video.currentTime > 4 || video.src !== lastProcessedVideoSrc) {
                clearInterval(guardianInterval);
                return;
            }
            const isAdPlaying = player.classList.contains('ad-interrupting');
            const isPausedByUser = player.classList.contains('paused-by-user');
            if (video.paused && !isAdPlaying && !isPausedByUser) {
                video.play();
            }
        }, 200);
    };

    const mainLoop = () => {
        if (isDisabled) return;
        handleVideoAds();
        const video = document.querySelector('video.html5-main-video');
        if (video) {
            initializePlayer(video);
        } else {
            lastProcessedVideoSrc = null;
        }
    };

    const initialize = () => {
        detectExternalAdBlocker();
        hideStaticAds();
        const observer = new MutationObserver((mutations) => {
            mainLoop();
            for (const mutation of mutations) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(handleAntiAdBlockPopup);
                }
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
        setInterval(mainLoop, CONFIG.FALLBACK_INTERVAL_MS);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
