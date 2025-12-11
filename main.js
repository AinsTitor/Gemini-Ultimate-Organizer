
// main.js
import { SETTINGS } from './config.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';

function init() {
    if (document.getElementById('gu-floating-panel')) return;

    Storage.migrateOldData((type) => {
        if(type === 'folders') UI.refreshUI();
        if(type === 'prompts') UI.refreshPromptsUI();
    });

    UI.initPanel();
    UI.initStreamerMode();
    UI.initWideMode();
    UI.refreshUI();

    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'w' || e.key === 'W')) {
            UI.toggleWideMode();
        }
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
            UI.toggleStreamerMode();
        }
    });

    checkAndShowTutorial();

// Refresh loop intelligent
    setInterval(() => {
        const panel = document.getElementById('gu-floating-panel');
        // Si le panneau existe ET que la souris est dessus, on ne rafraîchit pas
        // pour ne pas casser les interactions (clics, survols, menus).
        if (panel && panel.matches(':hover')) return;

        // Sinon, on rafraîchit normalement pour voir les nouveaux chats
        UI.refreshUI();
    }, 2000);
}

function checkAndShowTutorial() {
    chrome.storage.local.get([SETTINGS.TUTORIAL_KEY], (result) => {
        if (!result[SETTINGS.TUTORIAL_KEY]) {
            UI.showTutorialModal(() => {
                chrome.storage.local.set({ [SETTINGS.TUTORIAL_KEY]: true });
            });
        }
    });
}

const startLoop = setInterval(() => {
    if(!document.getElementById('gu-floating-panel')) {
        init();
        clearInterval(startLoop);
        setInterval(() => { if(!document.getElementById('gu-floating-panel')) init(); }, 3000);
    }
}, 1000);
