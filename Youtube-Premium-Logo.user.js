// ==UserScript==
// @name         Youtube Premium
// @namespace     https://github.com/chokiproai/Youtube-Premium
// @description	  Changer For Youtube To Premium
// @author       Chokiproai
// @license       MIT
// @match        https://*.youtube.com/*
// @match        https://*.youtube.com/watch?v=*
// @match        https://www.youtube.com/embed/*
// @match        *://www.youtube.com/watch?v=*
// @match        *://www.youtube.com
// @match        *://www.youtube.com/
// @match        *://www.youtube.com/watch*
// @match        /^http(s?)://[^/]*\.youtube(\.com)?(\.[a-z][a-z])?/.*$/
// @match        /^http(s?)://youtube(\.com)?(\.[a-z][a-z])?/.*$/
// @match        http://youtube.com/*
// @match        https://youtube.com/*
// @match        http://*.youtube.com/*
// @match        https://*.youtube.com/*
// @match        *://*.youtube.com/*

// @match        https://*.music.youtube.com/*
// @match        https://*.music.youtube.com/watch?v=*
// @match        https://www.music.youtube.com/embed/*
// @match        *://www.music.youtube.com/watch?v=*
// @match        *://www.music.youtube.com
// @match        *://www.music.youtube.com/
// @match        *://www.music.youtube.com/watch*
// @match        /^http(s?)://[^/]*\.music\.youtube(\.com)?(\.[a-z][a-z])?/.*$/
// @match        /^http(s?)://music\.youtube(\.com)?(\.[a-z][a-z])?/.*$/
// @match        http://music.youtube.com/*
// @match        https://music.youtube.com/*
// @match        http://*.music.youtube.com/*
// @match        https://*.music.youtube.com/*
// @match        *://*.music.youtube.com/*
// @version       1.0
// @updateURL    https://github.com/chokiproai/Youtube-Premium/raw/refs/heads/main/Youtube-Premium-Logo.user.js
// @downloadURL  https://github.com/chokiproai/Youtube-Premium/raw/refs/heads/main/Youtube-Premium-Logo.user.js
// ==/UserScript==

(function() {
    'use strict';
    // --- COMMON SECTION: PATCHES AND OBSERVER INITIALIZATION ---

    // Fix "TrustedError" on Chrome[-ium], from zerodytrash
    if (window.trustedTypes && trustedTypes.createPolicy) {
        if (!trustedTypes.defaultPolicy) {
            const passThroughFn = (x) => x;
            trustedTypes.createPolicy('default', {
                createHTML: passThroughFn,
                createScriptURL: passThroughFn,
                createScript: passThroughFn,
            });
        }
    }

    // Main function to check the domain and run corresponding features
    function runChecks() {
        if (window.location.hostname.includes('music.youtube.com')) {
            // Run features for YouTube Music
            modifyYouTubeMusicLogo();
            removeUpgradeButtonYTM();
        } else {
            // Run features for regular YouTube
            modifyYouTubeLogo();
            removePremiumButtonYT();
        }
    }

    // Use MutationObserver to monitor changes on the page
    const observer = new MutationObserver(runChecks);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Run checks immediately when the script is loaded
    runChecks();

    // --- 1: FOR YOUTUBE.COM ONLY ---

    // Modify the logo on the main YouTube site
    function modifyYouTubeLogo() {
        let ytdLogos = document.querySelectorAll("ytd-logo > yt-icon > span > div");
        const pfp = document.querySelector("#avatar-btn");
        const signInBtn = document.querySelector("a[href^='https://accounts.google.com']");

        if (signInBtn) {
            return;
        }

        if (pfp && ytdLogos.length > 0) {
            ytdLogos.forEach(ytdLogo => {
                // Check if the logo has already been modified
                if (ytdLogo.dataset.logoModified) return;

                const ytdLogoSvg = ytdLogo.querySelector("svg");
                if (ytdLogoSvg) {
                    ytdLogoSvg.setAttribute('width', '101');
                    ytdLogoSvg.setAttribute('viewBox', '0 0 101 20');
                    ytdLogoSvg.closest('ytd-logo').setAttribute('is-red-logo', '');
                    ytdLogoSvg.innerHTML = '...'; // (SVG path omitted for brevity)
                    ytdLogo.dataset.logoModified = 'true';
                }
            });
        }
    }

    // Remove the "YouTube Premium" item from YouTube's navigation bar
    function removePremiumButtonYT() {
        const premiumLink = document.querySelector('a#endpoint[href="/premium"]');
        if (premiumLink) {
            const entryToRemove = premiumLink.closest('ytd-guide-entry-renderer');
            if (entryToRemove) {
                entryToRemove.remove();
            }
        }
    }

    // --- 2: FOR MUSIC.YOUTUBE.COM ONLY ---

    // Modify the logo on the YouTube Music site
    function modifyYouTubeMusicLogo() {
        const signInBtn = document.querySelector("a[href^='https://accounts.google.com']");
        if (signInBtn) {
            return;
        }

        let ytMusicLogos = document.querySelectorAll("ytmusic-logo > a");
        if (ytMusicLogos.length > 0) {
            ytMusicLogos.forEach(ytMusicLogo => {
                // Check if the logo has already been modified to avoid duplication
                if (ytMusicLogo.dataset.logoModified) return;

                ytMusicLogo.innerHTML = '...'; // (SVG content omitted for brevity)
                ytMusicLogo.dataset.logoModified = 'true';
            });
        }
    }

    // Remove the "Upgrade" item from YouTube Music's navigation bar
    function removeUpgradeButtonYTM() {
        const guideEntries = document.querySelectorAll('ytmusic-guide-entry-renderer yt-formatted-string.title');
        for (const entryTitle of guideEntries) {
            if (entryTitle.textContent.trim() === 'Upgrade') {
                const entryToRemove = entryTitle.closest('ytmusic-guide-entry-renderer');
                if (entryToRemove) {
                    entryToRemove.remove();
                    break;
                }
            }
        }
    }

})();