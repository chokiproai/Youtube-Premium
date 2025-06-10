// ==UserScript==
// @name         Youtube Premium Logo
// @namespace     https://github.com/chokiproai/Youtube-Premium
// @description	  Changer For Youtube To Premium
// @author       Chokiproai
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
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
    // --- COMMON SECTION: PATCHES ---
    // Fix "TrustedError" on Chrome[-ium], code snippet from zerodytrash
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

    // --- MAIN ---
    // We wait for the window to load before setting up our observers.
    // This ensures the initial page structure is mostly in place.
    window.addEventListener('load', () => {
        if (window.location.hostname.includes('music.youtube.com')) {
            setupYouTubeMusicObserver();
        } else {
            setupYouTubeObserver();
        }
    });

    // --- 1: FOR YOUTUBE.COM ONLY ---

    // Sets up the observer for the main YouTube site.
    function setupYouTubeObserver() {
        let logoModified = false;
        let premiumButtonRemoved = false;

        // The function that the observer will call on any DOM change.
        const observerCallback = (mutations, observer) => {
            // Check for the sign-in button. If it exists, we're not logged in.
            const signInBtn = document.querySelector("a[href^='https://accounts.google.com']");
            if (signInBtn) {
                observer.disconnect(); // Stop observing if not logged in.
                return;
            }

            // A. Modify the YouTube Logo
            if (!logoModified) {
                const pfp = document.querySelector("#avatar-btn");
                let ytdLogos = document.querySelectorAll("ytd-logo > yt-icon > span > div");
                if (pfp && ytdLogos.length > 0) {
                    // run in the next event cycle to make sure the logo is fully loaded
                    setTimeout(() => {
                        // Grab it again just in case youtube swapped them
                        ytdLogos = document.querySelectorAll("ytd-logo > yt-icon > span > div");
                        ytdLogos.forEach(ytdLogo => {
                            const ytdLogoSvg = ytdLogo.querySelector("svg");
                            ytdLogoSvg.setAttribute('width', '101');
                            ytdLogoSvg.setAttribute('viewBox', '0 0 101 20');
                            ytdLogoSvg.closest('ytd-logo').setAttribute('is-red-logo', '');
                            ytdLogoSvg.innerHTML = '<g><path d="M14.4848 20C14.4848 20 23.5695 20 25.8229 19.4C27.0917 19.06 28.0459 18.08 28.3808 16.87C29 14.65 29 9.98 29 9.98C29 9.98 29 5.34 28.3808 3.14C28.0459 1.9 27.0917 0.94 25.8229 0.61C23.5695 0 14.4848 0 14.4848 0C14.4848 0 5.42037 0 3.17711 0.61C1.9286 0.94 0.954148 1.9 0.59888 3.14C0 5.34 0 9.98 0 9.98C0 9.98 0 14.65 0.59888 16.87C0.954148 18.08 1.9286 19.06 3.17711 19.4C5.42037 20 14.4848 20 14.4848 20Z" fill="#FF0033"/><path d="M19 10L11.5 5.75V14.25L19 10Z" fill="white"/></g><g id="youtube-paths_yt19"><path d="M32.1819 2.10016V18.9002H34.7619V12.9102H35.4519C38.8019 12.9102 40.5619 11.1102 40.5619 7.57016V6.88016C40.5619 3.31016 39.0019 2.10016 35.7219 2.10016H32.1819ZM37.8619 7.63016C37.8619 10.0002 37.1419 11.0802 35.4019 11.0802H34.7619V3.95016H35.4519C37.4219 3.95016 37.8619 4.76016 37.8619 7.13016V7.63016Z"/><path d="M41.982 18.9002H44.532V10.0902C44.952 9.37016 45.992 9.05016 47.302 9.32016L47.462 6.33016C47.292 6.31016 47.142 6.29016 47.002 6.29016C45.802 6.29016 44.832 7.20016 44.342 8.86016H44.162L43.952 6.54016H41.982V18.9002Z"/><path d="M55.7461 11.5002C55.7461 8.52016 55.4461 6.31016 52.0161 6.31016C48.7861 6.31016 48.0661 8.46016 48.0661 11.6202V13.7902C48.0661 16.8702 48.7261 19.1102 51.9361 19.1102C54.4761 19.1102 55.7861 17.8402 55.6361 15.3802L53.3861 15.2602C53.3561 16.7802 53.0061 17.4002 51.9961 17.4002C50.7261 17.4002 50.6661 16.1902 50.6661 14.3902V13.5502H55.7461V11.5002ZM51.9561 7.97016C53.1761 7.97016 53.2661 9.12016 53.2661 11.0702V12.0802H50.6661V11.0702C50.6661 9.14016 50.7461 7.97016 51.9561 7.97016Z"/><path d="M60.1945 18.9002V8.92016C60.5745 8.39016 61.1945 8.07016 61.7945 8.07016C62.5645 8.07016 62.8445 8.61016 62.8445 9.69016V18.9002H65.5045L65.4845 8.93016C65.8545 8.37016 66.4845 8.04016 67.1045 8.04016C67.7745 8.04016 68.1445 8.61016 68.1445 9.69016V18.9002H70.8045V9.49016C70.8045 7.28016 70.0145 6.27016 68.3445 6.27016C67.1845 6.27016 66.1945 6.69016 65.2845 7.67016C64.9045 6.76016 64.1545 6.27016 63.0845 6.27016C61.8745 6.27016 60.7345 6.79016 59.9345 7.76016H59.7845L59.5945 6.54016H57.5445V18.9002H60.1945Z"/><path d="M74.0858 4.97016C74.9858 4.97016 75.4058 4.67016 75.4058 3.43016C75.4058 2.27016 74.9558 1.91016 74.0858 1.91016C73.2058 1.91016 72.7758 2.23016 72.7758 3.43016C72.7758 4.67016 73.1858 4.97016 74.0858 4.97016ZM72.8658 18.9002H75.3958V6.54016H72.8658V18.9002Z"/><path d="M79.9516 19.0902C81.4116 19.0902 82.3216 18.4802 83.0716 17.3802H83.1816L83.2916 18.9002H85.2816V6.54016H82.6416V16.4702C82.3616 16.9602 81.7116 17.3202 81.1016 17.3202C80.3316 17.3202 80.0916 16.7102 80.0916 15.6902V6.54016H77.4616V15.8102C77.4616 17.8202 78.0416 19.0902 79.9516 19.0902Z"/><path d="M90.0031 18.9002V8.92016C90.3831 8.39016 91.0031 8.07016 91.6031 8.07016C92.3731 8.07016 92.6531 8.61016 92.6531 9.69016V18.9002H95.3131L95.2931 8.93016C95.6631 8.37016 96.2931 8.04016 96.9131 8.04016C97.5831 8.04016 97.9531 8.61016 97.9531 9.69016V18.9002H100.613V9.49016C100.613 7.28016 99.8231 6.27016 98.1531 6.27016C96.9931 6.27016 96.0031 6.69016 95.0931 7.67016C94.7131 6.76016 93.9631 6.27016 92.8931 6.27016C91.6831 6.27016 90.5431 6.79016 89.7431 7.76016H89.5931L89.4031 6.54016H87.3531V18.9002H90.0031Z"/></g>';
                        });
                        logoModified = true;
                    }, 50);
                }
            }

            // B. Remove the "YouTube Premium" item from the navigation bar
            if (!premiumButtonRemoved) {
                const premiumLink = document.querySelector('a#endpoint[href="/premium"]');
                if (premiumLink) {
                    const entryToRemove = premiumLink.closest('ytd-guide-entry-renderer');
                    if (entryToRemove) {
                        entryToRemove.remove();
                        premiumButtonRemoved = true;
                    }
                }
            }
            
            // If both tasks are done, disconnect the observer to save resources.
            if (logoModified && premiumButtonRemoved) {
                observer.disconnect();
            }
        };

        // Create and start the observer.
        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, { childList: true, subtree: true });
        // Run the check once at the start.
        observerCallback([], observer);
    }


    // --- 2: FOR MUSIC.YOUTUBE.COM ONLY  ---

    function setupYouTubeMusicObserver() {
        let logoModified = false;
        let upgradeButtonRemoved = false;

        const observerCallback = (mutations, observer) => {
            // If both tasks are done, disconnect the observer to prevent loops.
            if (logoModified && upgradeButtonRemoved) {
                observer.disconnect();
                return;
            }
            
            const signInBtn = document.querySelector("a[href^='https://accounts.google.com']");
            if (signInBtn) {
                observer.disconnect();
                return;
            }

            // A. Modify the YouTube Music Logo
            if (!logoModified) {
                let ytMusicLogos = document.querySelectorAll("ytmusic-logo > a");
                if (ytMusicLogos.length > 0) { // Use > 0 for more robustness
                     ytMusicLogos.forEach(ytMusicLogo => {
                        // Add a data attribute to prevent re-modifying the same element
                        if (!ytMusicLogo.dataset.logoModified) {
                            ytMusicLogo.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="98.543" height="24" fill="none"><clipPath id="a"><path d="M0 0h77v26H0Z"/></clipPath><g clip-path="url(#a)" transform="scale(.92308)"><path fill="#f03" d="M13 26c7.176 0 13-5.824 13-13S20.176 0 13 0 0 5.824 0 13s5.824 13 13 13"/><path stroke="#fff" d="M20.5 13c0 4.144-3.356 7.5-7.5 7.5A7.5 7.5 0 0 1 5.5 13c0-4.144 3.356-7.5 7.5-7.5s7.5 3.356 7.5 7.5z"/><path fill="#fff" d="m17.75 13-7.5-4.25v8.5z"/></g><g style="display:inherit;fill:#fff;fill-opacity:1"><path d="M32.182 2.1v16.8h2.58v-5.99h.69c3.35 0 5.11-1.8 5.11-5.34v-.69c0-3.57-1.56-4.78-4.84-4.78zm5.68 5.53c0 2.37-.72 3.45-2.46 3.45h-.64V3.95h.69c1.97 0 2.41.81 2.41 3.18zM41.982 18.9h2.55v-8.81c.42-.72 1.46-1.04 2.77-.77l.16-2.99c-.17-.02-.32-.04-.46-.04-1.2 0-2.17.91-2.66 2.57h-.18l-.21-2.32h-1.97zM55.746 11.5c0-2.98-.3-5.19-3.73-5.19-3.23 0-3.95 2.15-3.95 5.31v2.17c0 3.08.66 5.32 3.87 5.32 2.54 0 3.85-1.27 3.7-3.73l-2.25-.12c-.03 1.52-.38 2.14-1.39 2.14-1.27 0-1.33-1.21-1.33-3.01v-.84h5.08zm-3.79-3.53c1.22 0 1.31 1.15 1.31 3.1v1.01h-2.6v-1.01c0-1.93.08-3.1 1.29-3.1M60.195 18.9V8.92c.38-.53 1-.85 1.6-.85.77 0 1.05.54 1.05 1.62v9.21h2.66l-.02-9.97c.37-.56 1-.89 1.62-.89.67 0 1.04.57 1.04 1.65v9.21h2.66V9.49c0-2.21-.79-3.22-2.46-3.22-1.16 0-2.15.42-3.06 1.4-.38-.91-1.13-1.4-2.2-1.4-1.21 0-2.35.52-3.15 1.49h-.15l-.19-1.22h-2.05V18.9ZM74.086 4.97c.9 0 1.32-.3 1.32-1.54 0-1.16-.45-1.52-1.32-1.52-.88 0-1.31.32-1.31 1.52 0 1.24.41 1.54 1.31 1.54m-1.22 13.93h2.53V6.54h-2.53zM79.952 19.09c1.46 0 2.37-.61 3.12-1.71h.11l.11 1.52h1.99V6.54h-2.64v9.93c-.28.49-.93.85-1.54.85-.77 0-1.01-.61-1.01-1.63V6.54h-2.63v9.27c0 2.01.58 3.28 2.49 3.28M90.003 18.9V8.92c.38-.53 1-.85 1.6-.85.77 0 1.05.54 1.05 1.62v9.21h2.66l-.02-9.97c.37-.56 1-.89 1.62-.89.67 0 1.04.57 1.04 1.65v9.21h2.66V9.49c0-2.21-.79-3.22-2.46-3.22-1.16 0-2.15.42-3.06 1.4-.38-.91-1.13-1.4-2.2-1.4-1.21 0-2.35.52-3.15 1.49h-.15l-.19-1.22h-2.05V18.9Z" style="fill:#fff;fill-opacity:1" transform="matrix(.92322 0 0 .9259 -1.911 2.734)"/></g></svg>';
                            ytMusicLogo.dataset.logoModified = 'true';
                        }
                    });
                    logoModified = true;
                }
            }
            
            // B. Remove the "Upgrade" button
            if (!upgradeButtonRemoved) {
                const guideEntries = document.querySelectorAll('ytmusic-guide-entry-renderer yt-formatted-string.title');
                for (const entryTitle of guideEntries) {
                    if (entryTitle.textContent.trim() === 'Upgrade') {
                        const entryToRemove = entryTitle.closest('ytmusic-guide-entry-renderer');
                        if (entryToRemove) {
                            entryToRemove.remove();
                            upgradeButtonRemoved = true; // Mark task as done
                            break;
                        }
                    }
                }
            }
        };
        
        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, { childList: true, subtree: true });
        // Run once at start to catch elements already on the page
        observerCallback([], observer);
    }

})();
