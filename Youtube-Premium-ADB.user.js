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

    // --- User editable configuration ---
    const CONFIG = {
        // Frequency of loopback checks in the backup room (in milliseconds).
        // Lower values ​​will reflect faster but may consume more resources.
        // 300ms is a good balance.
        FALLBACK_INTERVAL_MS: 300
    };

    const log = () => {};

    let adJustSkipped = false;

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
        const styleId = 'ultimate-ad-bypasser-styles';
        if (document.getElementById(styleId)) return;
        const css = `${getAdSelectors().join(', ')} { display: none !important; }`;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    };

    const handleVideoAds = () => {
        if (location.pathname.startsWith('/shorts/')) return;

        const video = document.querySelector('video.html5-main-video');
        const player = document.querySelector('#movie_player');
        if (!video || !player) return;

        const isAdPlaying = player.classList.contains('ad-interrupting');
        
        if (isAdPlaying && video.duration > 0.1 && !isNaN(video.duration) && video.currentTime < video.duration - 0.1) {
            video.muted = true;
            video.currentTime = video.duration;
            adJustSkipped = true;
            return;
        }

        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern');
        if (skipButton) {
            skipButton.click();
            adJustSkipped = true;
        }
    };

    const handleAntiAdBlockPopup = (node) => {
        if (node.nodeType !== 1) return;
        const enforcementMessage = node.querySelector('ytd-enforcement-message-view-model') || (node.tagName === 'YTD-ENFORCEMENT-MESSAGE-VIEW-MODEL' ? node : null);

        if (enforcementMessage) {
            const popupContainer = enforcementMessage.closest('ytd-popup-container');
            if (popupContainer) {
                popupContainer.remove();
                
                setTimeout(() => {
                    const mainVideo = document.querySelector('video.html5-main-video');
                    if (mainVideo && mainVideo.paused) {
                        mainVideo.play();
                    }
                }, 100);
            }
        }
    };

    const safeResumeAfterAd = () => {
        if (!adJustSkipped) return;

        const video = document.querySelector('video.html5-main-video');
        const player = document.querySelector('#movie_player');
        
        if (video && player && !player.classList.contains('ad-interrupting')) {
            if (video.paused) {
                video.play();
            }
            adJustSkipped = false;
        }
    };

    const initialize = () => {
        hideStaticAds();
        setInterval(() => {
            handleVideoAds();
            safeResumeAfterAd();
        }, CONFIG.FALLBACK_INTERVAL_MS);

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                handleVideoAds();
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(handleAntiAdBlockPopup);
                }
            }
            safeResumeAfterAd();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
