// main.js
import { SETTINGS } from './config.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';

// --- NOUVEAU: Utilitaires de traduction pour la console ---
function getMessage(key) {
    return chrome.i18n.getMessage(key) || key;
}

console.log(`${getMessage('ext_name')}: ${getMessage('loaded_message')}`);

function checkAndShowTutorial() {
    chrome.storage.local.get([SETTINGS.TUTORIAL_KEY], (result) => {
        if (!result[SETTINGS.TUTORIAL_KEY]) {
            UI.showTutorialModal(() => {
                chrome.storage.local.set({ [SETTINGS.TUTORIAL_KEY]: true });
            });
        }
    });
}

function init() {
    if (document.getElementById('gu-floating-panel')) return;

    // 1. Data Migration
    Storage.migrateOldData((type) => {
        if(type === 'folders') UI.refreshUI();
        if(type === 'prompts') UI.refreshPromptsUI();
    });

    // 2. Initialize UI
    UI.initPanel();
    UI.initStreamerMode();
    UI.initWideMode();
    UI.refreshUI();

    // 3. Hotkeys Listener
    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'w' || e.key === 'W')) {
            UI.toggleWideMode();
        }
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
            UI.toggleStreamerMode();
        }
    });

    // 4. Tutorial Check
    checkAndShowTutorial();

    // 5. Polling Loop for DOM changes
    setInterval(() => UI.refreshUI(), 2000);
}

// Start Loop
const startLoop = setInterval(() => {
    if(!document.getElementById('gu-floating-panel')) {
        init();
        clearInterval(startLoop);
        // Fallback check loop in case Gemini redraws body
        setInterval(() => { if(!document.getElementById('gu-floating-panel')) init(); }, 3000);
    }
}, 1000);