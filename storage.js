
// storage.js
import { SETTINGS } from './config.js';

export function getCurrentUser() {
    const accBtn = document.querySelector('a[href^="https://accounts.google.com"]');
    if (accBtn) {
        const label = accBtn.getAttribute('aria-label');
        if (label) {
            const emailMatch = label.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) return emailMatch[0];
        }
    }
    return 'default_user';
}

function getKeys() {
    const user = getCurrentUser();
    return {
        folders: `${SETTINGS.BASE_STORAGE_KEY}_${user}`,
        prompts: `${SETTINGS.BASE_PROMPT_KEY}_${user}`,
        promptFolders: `${SETTINGS.BASE_PROMPT_KEY}_folders_${user}`,
        user: user
    };
}

export function migrateOldData(callback) {
    const k = getKeys();
    chrome.storage.sync.get([k.folders, k.prompts, SETTINGS.OLD_STORAGE_KEY, SETTINGS.OLD_PROMPTS_KEY], (result) => {
        let migrated = false;
        if (!result[k.folders] && result[SETTINGS.OLD_STORAGE_KEY] && result[SETTINGS.OLD_STORAGE_KEY].length > 0) {
            console.log("Gemini Organizer: Migrating Folders from v1 to v14...");
            chrome.storage.sync.set({ [k.folders]: result[SETTINGS.OLD_STORAGE_KEY] }, () => {
                if(callback) callback('folders');
            });
            migrated = true;
        }
        if (!result[k.prompts] && result[SETTINGS.OLD_PROMPTS_KEY] && result[SETTINGS.OLD_PROMPTS_KEY].length > 0) {
            console.log("Gemini Organizer: Migrating Prompts from v1 to v14...");
            chrome.storage.sync.set({ [k.prompts]: result[SETTINGS.OLD_PROMPTS_KEY] }, () => {
                if(callback) callback('prompts');
            });
            migrated = true;
        }
    });
}

export function getData(cb) {
    const k = getKeys();
    chrome.storage.sync.get([k.folders], r => cb(r[k.folders] || []));
}

export function saveData(d, cb) {
    const k = getKeys();
    chrome.storage.sync.set({ [k.folders]: d }, () => { if(cb) cb(); });
}

export function getPrompts(cb) {
    const k = getKeys();
    chrome.storage.sync.get([k.prompts], r => cb(r[k.prompts] || []));
}

export function savePrompts(d, cb) {
    const k = getKeys();
    chrome.storage.sync.set({ [k.prompts]: d }, () => { if(cb) cb(); });
}

export function getPromptFolders(cb) {
    const k = getKeys();
    chrome.storage.sync.get([k.promptFolders], r => cb(r[k.promptFolders] || []));
}

export function savePromptFolders(d, cb) {
    const k = getKeys();
    chrome.storage.sync.set({ [k.promptFolders]: d }, () => { if(cb) cb(); });
}
