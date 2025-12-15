// main.js
import { SETTINGS } from './config.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';

// SÉLECTEUR PRÉCIS : Cible la zone de saisie principale de Gemini
const MAIN_INPUT_SELECTOR = 'rich-textarea .ql-editor[contenteditable="true"]';


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
    UI.initSelectionListener();

    // --- 1. Gestion des Chats Cachés (Init) ---
    if(localStorage.getItem('gu_show_archived') === 'true') {
        document.body.classList.add('gu-show-archived');
    }

    // --- 2. Raccourcis Clavier & Interception Slash (UNIQUE ET FIXÉ) ---
    document.addEventListener('keydown', (e) => {
        const slashMenu = document.getElementById('gu-slash-menu');
        const menuIsVisible = slashMenu && slashMenu.style.display !== 'none';

        // Vérifie si la cible de l'événement est la zone de saisie Gemini principale
        const isTargettingMainInput = e.target.matches(MAIN_INPUT_SELECTOR);

        // 1. Gestion des modes (Alt+W/S) - Raccourcis rapides
        if (e.altKey && (e.key === 'w' || e.key === 'W')) {
            UI.toggleWideMode();
            return;
        }
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
            UI.toggleStreamerMode();
            return;
        }

        // 2. Interception prioritaire pour le Menu Slash (Shift, Ctrl, Alt)
        if (menuIsVisible && isTargettingMainInput) {

            const isShiftForUp = e.shiftKey && !e.ctrlKey && !e.altKey; // Shift seul pour monter
            const isCtrlForDown = e.ctrlKey && !e.shiftKey && !e.altKey; // Ctrl seul pour descendre
            const isAltForSelect = e.altKey && !e.shiftKey && !e.ctrlKey; // Alt seul pour sélectionner (ou la touche Entrée)

            // On vérifie si une de nos combinaisons est pressée
            if (isShiftForUp || isCtrlForDown || isAltForSelect || e.key === 'Enter') {

                // Bloque l'action de Gemini (envoi/historique)
                e.preventDefault();
                e.stopPropagation();

                const items = slashMenu.querySelectorAll('.gu-slash-item');
                if (items.length === 0) return;

                let current = slashMenu.querySelector('.gu-slash-item.selected');
                let currentIndex = Array.from(items).indexOf(current);

                // FIX: Initialisation de la sélection si elle est perdue ou inexistante
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
                    // On exécute la commande sélectionnée
                    slashMenu.querySelector('.gu-slash-item.selected').click();
                }
            }
        }
    });

    // --- 3. Slash Command Listener (Trigger sur 'input') ---
    document.addEventListener('input', (e) => {
        // Détecte la frappe dans la zone de texte principale
        const target = e.target;
        if (target.matches(MAIN_INPUT_SELECTOR)) {
            UI.handleSlashCommand(target);
        }
    });

    checkAndShowTutorial();

    // --- 4. Boucle de Refresh ---
    setInterval(() => {
            // On garde uniquement l'injection des boutons de code (utile et léger)
            // On a SUPPRIMÉ UI.injectTTS() car vous n'en voulez pas.
            if (typeof UI.injectCodeButtons === 'function') {
                UI.injectCodeButtons();
            }

            // --- OPTIMISATION MAJEURE ---
            // On a SUPPRIMÉ UI.refreshUI() de cette boucle.
            // Cela empêche l'interface de se reconstruire toutes les 2 secondes.
            // Plus de clignotement ni de latence sur les clics.
        }, 2000);

    // --- 5. Auto-Backup au démarrage (Après 5s) ---
    // Nécessite que Storage.createBackup soit défini dans storage.js
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

const startLoop = setInterval(() => {
    if(!document.getElementById('gu-floating-panel')) {
        init();
        clearInterval(startLoop);
        setInterval(() => { if(!document.getElementById('gu-floating-panel')) init(); }, 3000);
    }
}, 1000);

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Si les dossiers ou les prompts ont changé, on rafraîchit l'UI
        // On vérifie les clés pour ne pas rafraîchir pour rien
        const keys = Object.keys(changes);
        const shouldRefresh = keys.some(k => k.includes('gemini_organizer_data') || k.includes('gemini_organizer_prompts'));

        if (shouldRefresh) {
            UI.refreshUI();
        }
    }
});