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

// --- NOUVEAU SYSTÈME DE BACKUP (COMPLET) ---

// Crée une sauvegarde complète (Dossiers + Prompts)
// Crée une sauvegarde (auto 24h ou sécurité)
export function createBackup(type = 'auto') {
    const k = getKeys();

    // 1. Récupération des données existantes (Backups)
    chrome.storage.local.get(['gu_backups'], (res) => {
        let backups = res.gu_backups || [];

        // 2. Vérification 24h pour 'auto'
        if (type === 'auto' && backups.length > 0) {
            const lastBackup = backups[0]; // Le plus récent est au début
            if (lastBackup && lastBackup.date) {
                const lastDate = new Date(lastBackup.date);
                const now = new Date();
                const diffHours = Math.abs(now - lastDate) / 36e5; // Différence en heures

                // Si moins de 24h, on annule la sauvegarde auto
                if (diffHours < 24) {
                    console.log(`Gemini Organizer: Backup skipped (Last backup was ${diffHours.toFixed(1)}h ago).`);
                    return;
                }
            }
        }

        // 3. Si on est ici, on fait la sauvegarde
        chrome.storage.sync.get([k.folders, k.promptFolders], (result) => {
            const fullData = {
                folders: result[k.folders] || [],
                promptFolders: result[k.promptFolders] || []
            };

            // On utilise ISO string pour la comparaison de date facile, mais on affichera en locale
            const now = new Date();
            const backupObject = {
                date: now.toString(), // Format complet pour relecture
                displayDate: now.toLocaleString(), // Format joli pour l'UI
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
            console.log("Gemini Organizer: Backup created!");
        });
    });
}

// Récupère la liste des sauvegardes
export function getBackups(cb) {
    chrome.storage.local.get(['gu_backups', 'gu_backup_safety'], (res) => {
        cb({
            regular: res.gu_backups || [],
            safety: res.gu_backup_safety || null
        });
    });
}

// Restaure une sauvegarde (compatible nouveau format complet)
export function restoreBackup(backupData, cb) {
    const k = getKeys();
    const data = backupData.data;

    // On prépare l'objet de restauration
    const dataToRestore = {};
    
    // On vérifie si la sauvegarde contient les clés, sinon on ignore
    if(data.folders) dataToRestore[k.folders] = data.folders;
    if(data.promptFolders) dataToRestore[k.promptFolders] = data.promptFolders;

    // Si c'est une vieille sauvegarde (format liste simple), on essaie de deviner
    if (Array.isArray(data)) {
        // C'est probablement juste des dossiers (vieux format)
        dataToRestore[k.folders] = data;
    }

    chrome.storage.sync.set(dataToRestore, () => {
        if(cb) cb();
    });
}