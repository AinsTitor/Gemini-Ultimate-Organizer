// storage.js
import { SETTINGS } from './config.js';

export function getCurrentUser() {
    // 1. D'ABORD : On regarde si on a déjà mémorisé l'email (Cache)
    // C'est ce qui sauve la mise sur mobile quand l'interface est cachée
    const cachedEmail = localStorage.getItem('gu_cached_email');

    // 2. ENSUITE : On essaie de le détecter dans la page pour mettre à jour le cache
    const accBtn = document.querySelector('a[href^="https://accounts.google.com"]');

    if (accBtn) {
        const label = accBtn.getAttribute('aria-label');
        if (label) {
            const emailMatch = label.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) {
                const liveEmail = emailMatch[0];
                // Si l'email trouvé est différent du cache (changement de compte), on met à jour
                if (liveEmail !== cachedEmail) {
                    localStorage.setItem('gu_cached_email', liveEmail);
                    // Petit hack : on recharge la page si le compte a changé pour être sûr de charger les bonnes données
                    if (cachedEmail && cachedEmail !== 'default_user') {
                        console.log("Account switch detected, refreshing data...");
                    }
                }
                return liveEmail;
            }
        }
    }

    // 3. SI RIEN DANS LA PAGE : On retourne le cache s'il existe
    if (cachedEmail) {
        return cachedEmail;
    }

    // 4. SI VRAIMENT RIEN (Première installation) : Utilisateur par défaut
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

// --- MIGRATION & LEGACY ---
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

// --- GETTERS & SETTERS (STANDARD) ---
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

// --- SYSTÈME DE BACKUP ---
export function createBackup(type = 'auto') {
    const k = getKeys();
    // On ne fait pas de backup automatique si on est sur l'utilisateur par défaut (sauf si forcé)
    if (type === 'auto' && k.user === 'default_user') return;

    chrome.storage.local.get(['gu_backups'], (res) => {
        let backups = res.gu_backups || [];

        if (type === 'auto' && backups.length > 0) {
            const lastBackup = backups[0];
            if (lastBackup && lastBackup.date) {
                const lastDate = new Date(lastBackup.date);
                const now = new Date();
                const diffHours = Math.abs(now - lastDate) / 36e5;
                if (diffHours < 24) return;
            }
        }

        chrome.storage.sync.get([k.folders, k.promptFolders], (result) => {
            const fullData = {
                folders: result[k.folders] || [],
                promptFolders: result[k.promptFolders] || []
            };
            const now = new Date();
            const backupObject = {
                date: now.toString(),
                displayDate: now.toLocaleString(),
                data: fullData,
                type: type
            };

            if (type === 'safety') {
                chrome.storage.local.set({ 'gu_backup_safety': backupObject });
            } else {
                backups.unshift(backupObject);
                if (backups.length > 3) backups.pop();
                chrome.storage.local.set({ 'gu_backups': backups });
            }
        });
    });
}

export function getBackups(cb) {
    chrome.storage.local.get(['gu_backups', 'gu_backup_safety'], (res) => {
        cb({
            regular: res.gu_backups || [],
            safety: res.gu_backup_safety || null
        });
    });
}

export function restoreBackup(backupData, cb) {
    const k = getKeys();
    const data = backupData.data;
    const dataToRestore = {};
    if(data.folders) dataToRestore[k.folders] = data.folders;
    if(data.promptFolders) dataToRestore[k.promptFolders] = data.promptFolders;
    if (Array.isArray(data)) dataToRestore[k.folders] = data;

    chrome.storage.sync.set(dataToRestore, () => { if(cb) cb(); });
}

// --- NOTES / HIGHLIGHTS ---
export function getHighlights(chatId, cb) {
    const key = `gu_notes_${chatId}`;
    chrome.storage.local.get([key], r => cb(r[key] || []));
}

export function saveHighlight(chatId, note, cb) {
    const key = `gu_notes_${chatId}`;
    getHighlights(chatId, (notes) => {
        notes.push(note);
        chrome.storage.local.set({ [key]: notes }, cb);
    });
}

export function updateHighlightComment(chatId, noteId, comment) {
    const key = `gu_notes_${chatId}`;
    getHighlights(chatId, (notes) => {
        const target = notes.find(n => n.id === noteId);
        if (target) {
            target.comment = comment;
            chrome.storage.local.set({ [key]: notes });
        }
    });
}

export function deleteHighlight(chatId, noteId, cb) {
    const key = `gu_notes_${chatId}`;
    getHighlights(chatId, (notes) => {
        const newNotes = notes.filter(n => n.id !== noteId);
        chrome.storage.local.set({ [key]: newNotes }, cb);
    });
}