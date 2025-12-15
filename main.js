// main.js
import { SETTINGS } from './config.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';

// SÉLECTEUR PRÉCIS : Cible la zone de saisie principale de Gemini
const MAIN_INPUT_SELECTOR = 'rich-textarea .ql-editor[contenteditable="true"]';

function init() {
    if (document.getElementById('gu-floating-panel')) return;

    // 1. Initialiser le panneau et les modules
    UI.initPanel();
    UI.initStreamerMode();
    UI.initWideMode();
    UI.initSelectionListener();

    // 2. Migration des données (si nécessaire)
    // Utilise refreshUI qui gère l'affichage correct
    Storage.migrateOldData((type) => {
        if(type === 'folders') UI.refreshUI();
        if(type === 'prompts') UI.refreshUI();
    });

    // 3. Premier chargement immédiat
    // Au cas où le panneau est déjà prêt (PC rapide)
    UI.refreshUI();

    // 4. --- CORRECTIF FIREFOX MOBILE ---
    // Si l'initialisation est lente (fréquent sur mobile), le panneau peut être vide au début.
    // On vérifie après 1 seconde : si c'est vide, on force le rechargement.
    setTimeout(() => {
        const content = document.getElementById('gu-content-area');
        // Si le conteneur existe mais qu'il n'y a pas d'enfants (pas de dossiers affichés)
        if (content && content.children.length === 0) {
            console.log("Gemini Organizer: Mobile Force Refresh triggered");
            UI.refreshUI();
        }
    }, 1000);

    // --- Gestion des Chats Cachés (Init) ---
    if(localStorage.getItem('gu_show_archived') === 'true') {
        document.body.classList.add('gu-show-archived');
    }

    // --- Raccourcis Clavier & Interception Slash ---
    document.addEventListener('keydown', (e) => {
        const slashMenu = document.getElementById('gu-slash-menu');
        const menuIsVisible = slashMenu && slashMenu.style.display !== 'none';
        const isTargettingMainInput = e.target.matches(MAIN_INPUT_SELECTOR);

        // Modes (Alt+W/S)
        if (e.altKey && (e.key === 'w' || e.key === 'W')) {
            UI.toggleWideMode();
            return;
        }
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
            UI.toggleStreamerMode();
            return;
        }

        // Navigation Menu Slash
        if (menuIsVisible && isTargettingMainInput) {
            const isShiftForUp = e.shiftKey && !e.ctrlKey && !e.altKey;
            const isCtrlForDown = e.ctrlKey && !e.shiftKey && !e.altKey;
            const isAltForSelect = e.altKey && !e.shiftKey && !e.ctrlKey;

            if (isShiftForUp || isCtrlForDown || isAltForSelect || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();

                const items = slashMenu.querySelectorAll('.gu-slash-item');
                if (items.length === 0) return;

                let current = slashMenu.querySelector('.gu-slash-item.selected');
                let currentIndex = Array.from(items).indexOf(current);

                if (currentIndex === -1) {
                    currentIndex = 0;
                    items[0].classList.add('selected');
                    current = items[0];
                }

                if (isShiftForUp) {
                    current.classList.remove('selected');
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    items[currentIndex].classList.add('selected');
                    items[currentIndex].scrollIntoView({ block: 'nearest' });
                }
                else if (isCtrlForDown) {
                    current.classList.remove('selected');
                    currentIndex = (currentIndex + 1) % items.length;
                    items[currentIndex].classList.add('selected');
                    items[currentIndex].scrollIntoView({ block: 'nearest' });
                }
                else if (isAltForSelect || e.key === 'Enter') {
                    slashMenu.querySelector('.gu-slash-item.selected').click();
                }
            }
        }
    });

    // --- Slash Command Listener ---
    document.addEventListener('input', (e) => {
        const target = e.target;
        if (target.matches(MAIN_INPUT_SELECTOR)) {
            UI.handleSlashCommand(target);
        }
    });

    checkAndShowTutorial();

    // --- BOUCLE DE MAINTENANCE (OPTIMISÉE) ---
    setInterval(() => {
        // Injection permanente des boutons Code (Léger)
        if (typeof UI.injectCodeButtons === 'function') {
            UI.injectCodeButtons();
        }

        // NOTE: On a SUPPRIMÉ UI.refreshUI() de cette boucle pour la fluidité.
        // L'UI se met à jour via les événements (clics) ou le listener Storage.onChanged ci-dessous.
        // On a aussi SUPPRIMÉ UI.injectTTS() car non désiré.
    }, 2000);

    // --- Auto-Backup au démarrage ---
    setTimeout(() => {
        if(typeof Storage.createBackup === 'function') {
            Storage.createBackup('auto');
        }
    }, 5000);
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

// Boucle de sécurité pour lancer init() si le panneau disparait (changement de page SPA)
const startLoop = setInterval(() => {
    if(!document.getElementById('gu-floating-panel')) {
        init();
        clearInterval(startLoop);
        setInterval(() => { if(!document.getElementById('gu-floating-panel')) init(); }, 3000);
    }
}, 1000);

// Listener pour synchroniser les onglets (si modif dans un autre onglet)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        const keys = Object.keys(changes);
        const shouldRefresh = keys.some(k => k.includes('gemini_organizer_data') || k.includes('gemini_organizer_prompts'));

        if (shouldRefresh) {
            UI.refreshUI();
        }
    }
});