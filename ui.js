
// ui.js
import { CSS_STYLES, COLORS, TAG_COLORS, EMOJIS, SETTINGS } from './config.js';
import * as Storage from './storage.js';
import { getTranslation, i18n } from './i18n.js';

const LANG_STORAGE_KEY = 'gemini_organizer_lang';
let currentLanguage = 'en';

function t(key) {
    return getTranslation(currentLanguage, key);
}

// --- UTILS ---
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash % 360)}, 70%, 80%)`;
}

function getLibraryTags(folders) {
    const tagsMap = new Map();
    folders.forEach(f => f.chats.forEach(c => {
        if (c.tags) c.tags.forEach(t => {
            const txt = typeof t === 'object' ? t.text : t;
            const col = typeof t === 'object' ? t.color : stringToColor(txt);
            if (!tagsMap.has(txt)) tagsMap.set(txt, col);
        });
    }));
    return Array.from(tagsMap, ([text, color]) => ({ text, color })).sort((a,b) => a.text.localeCompare(b.text));
}

// --- NOTIFICATIONS & MODES ---
export function showToast(message, icon = 'ℹ️') {
    const existing = document.getElementById('gu-toast-notif');
    if(existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'gu-toast-notif';
    toast.className = 'gu-toast';
    toast.innerHTML = `<span style="font-size:16px;">${icon}</span> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { if(document.body.contains(toast)) toast.remove(); }, 3000);
}

// Applique les classes CSS selon la configuration
function applyStreamerFilters(config) {
    // Liste des classes possibles
    const mapping = {
        'loc': 'gu-hide-loc',
        'content': 'gu-hide-content',
        'mail': 'gu-hide-mail',
        'chat': 'gu-hide-chat',
        'folder': 'gu-hide-folder',
        'prompt': 'gu-hide-prompt',
        'ui': 'gu-hide-ui' // <--- NOUVEAU : Mode Focus
    };

    // On applique ou on retire chaque classe
    Object.keys(mapping).forEach(key => {
        if (config[key]) document.body.classList.add(mapping[key]);
        else document.body.classList.remove(mapping[key]);
    });
}

export function toggleStreamerMode() {
    const btn = document.getElementById('gu-btn-streamer');
    const isActive = document.body.classList.contains('gu-streamer-active');

    if (isActive) {
        // DÉSACTIVATION
        document.body.classList.remove('gu-streamer-active');
        // On retire aussi toutes les sous-classes de masquage
        document.body.classList.remove('gu-hide-loc', 'gu-hide-content', 'gu-hide-mail', 'gu-hide-chat', 'gu-hide-folder', 'gu-hide-prompt');

        localStorage.setItem(SETTINGS.STREAMER_KEY, 'false');
        if(btn) btn.classList.remove('active-mode');
        showToast(`Streamer Mode: OFF`, "👁️");
    } else {
        // ACTIVATION
        document.body.classList.add('gu-streamer-active');

        // Charger la config (Tout activer par défaut si vide)
        const config = JSON.parse(localStorage.getItem('gu_streamer_config') || '{"loc":true, "content":true, "chat":true, "folder":true, "prompt":true, "mail":true}');
        applyStreamerFilters(config);

        localStorage.setItem(SETTINGS.STREAMER_KEY, 'true');
        if(btn) btn.classList.add('active-mode');
        showToast(`Streamer Mode: ON`, "🙈");
    }
}

export function initStreamerMode() {
    // 1. Récupérer l'état global (ON/OFF)
    const saved = localStorage.getItem(SETTINGS.STREAMER_KEY);

    if (saved === 'true') {
        document.body.classList.add('gu-streamer-active');
        const btn = document.getElementById('gu-btn-streamer');
        if(btn) btn.classList.add('active-mode');

        // 2. Récupérer et appliquer la configuration spécifique (NOUVEAU)
        // (Si pas de config, on applique tout par défaut pour être sûr)
        const config = JSON.parse(localStorage.getItem('gu_streamer_config') || '{"loc":true, "content":true, "chat":true, "folder":true, "prompt":true, "mail":true}');

        // On utilise la fonction d'application que nous avons créée plus tôt
        // (Assurez-vous qu'elle est bien définie dans ce fichier, voir ci-dessous si besoin)
        applyStreamerFilters(config);
    }
}

export function toggleWideMode() {
    const isActive = document.body.classList.contains('gu-wide-mode-active');
    const btn = document.getElementById('gu-btn-wide');
    if (isActive) {
        document.body.classList.remove('gu-wide-mode-active');
        localStorage.setItem(SETTINGS.WIDE_KEY, 'false');
        if(btn) btn.classList.remove('active-mode');
        showToast(`Wide Mode: OFF`, "↔️");
    } else {
        document.body.classList.add('gu-wide-mode-active');
        localStorage.setItem(SETTINGS.WIDE_KEY, 'true');
        if(btn) btn.classList.add('active-mode');
        showToast(`Wide Mode: ON`, "↔️");
    }
}

export function initWideMode() {
    const saved = localStorage.getItem(SETTINGS.WIDE_KEY);
    if (saved === 'true') {
        document.body.classList.add('gu-wide-mode-active');
        const btn = document.getElementById('gu-btn-wide');
        if(btn) btn.classList.add('active-mode');
    }
}

// --- RENDER CORE ---
export function refreshUI() {
    Storage.getData(folders => {
        renderPanelContent(folders);
        injectButtonsInNativeList(folders);
        updateUserBadge();
    });
    Storage.getPromptFolders(promptFolders => {
        renderPromptsUI(promptFolders);
    });
}

function updateUserBadge() {
    const badge = document.getElementById('gu-user-badge');
    if (badge) {
        const u = Storage.getCurrentUser();
        badge.innerText = u === 'default_user' ? 'Guest' : u;
        badge.title = `Data saved for: ${u}`;
    }
}

// --- RENDER FUNCTIONS ---
function renderPanelContent(folders) {
    const container = document.getElementById('gu-content-area');
    const searchInput = document.getElementById('gu-search-input');
    if (!container) return;

    const searchText = searchInput ? searchInput.value.toLowerCase() : "";
    container.innerHTML = '';

    if (folders.length === 0) {
        container.innerHTML = `<div style="padding:30px 20px; text-align:center; color:#666; font-size:12px;">${t('folder_empty_message')}</div>`;
        return;
    }

    folders.forEach((folder, idx) => {
        const folderMatches = folder.name.toLowerCase().includes(searchText);
        const matchingChats = folder.chats.filter(chat => {
            const titleMatch = chat.title.toLowerCase().includes(searchText);
            const tagMatch = chat.tags && chat.tags.some(t => {
                const txt = typeof t === 'object' ? t.text : t;
                return txt.toLowerCase().includes(searchText);
            });
            return titleMatch || tagMatch;
        });

        if (searchText && !folderMatches && matchingChats.length === 0) return;

        const div = document.createElement('div');
        const header = document.createElement('div');
        header.className = 'gu-folder-row';
        header.style.borderLeftColor = folder.color || '#5f6368';

        const isOpen = folder.isOpen || (searchText.length > 0);
        const emoji = folder.emoji || '📁';

        header.innerHTML = `
            <div class="gu-folder-left">
                <span style="font-size:10px; color:${folder.color}; width: 12px;">${isOpen ? '▼' : '▶'}</span>
                <span class="gu-folder-emoji">${emoji}</span>
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; font-weight:500;">${folder.name}</span>
            </div>
            <div style="display:flex; align-items:center;">
                <span class="gu-count">${folder.chats.length}</span>
                <div class="gu-folder-actions">
                    <div class="gu-color-wrapper">
                        <div class="gu-color-dot" style="background-color:${folder.color};"></div>
                        <input type="color" class="gu-color-input" value="${folder.color}">
                    </div>
                    <span class="gu-icon-btn edit" title="${t('edit_folder')}">✎</span>
                    <span class="gu-icon-btn delete" title="${t('delete_folder_confirm')}">×</span>
                </div>
            </div>
        `;

        const colorInput = header.querySelector('.gu-color-input');
        colorInput.addEventListener('input', (e) => {
            header.style.borderLeftColor = e.target.value;
            header.querySelector('.gu-color-dot').style.backgroundColor = e.target.value;
        });
        colorInput.addEventListener('change', (e) => { folder.color = e.target.value; Storage.saveData(folders, refreshUI); });
        header.querySelector('.gu-color-wrapper').addEventListener('click', e => e.stopPropagation());
        header.querySelector('.edit').onclick = (e) => { e.stopPropagation(); showCreateFolderModal(folder); };
        header.querySelector('.delete').onclick = (e) => { e.stopPropagation(); if(confirm(t('delete_folder_confirm'))) { folders.splice(idx, 1); Storage.saveData(folders, refreshUI); } };
        header.onclick = () => {
                    // 1. Mise à jour immédiate des données locales
                    folder.isOpen = !folder.isOpen;

                    // 2. Re-rendu INSTANTANÉ de l'interface (sans attendre le stockage)
                    renderPanelContent(folders);
                    injectButtonsInNativeList(folders); // Pour garder les boutons '+' synchronisés

                    // 3. Sauvegarde silencieuse en arrière-plan (Debounce)
                    saveFoldersDebounced(folders);
                };

        div.appendChild(header);

        if (isOpen) {
            const content = document.createElement('div');
            content.className = 'gu-folder-content open';

            let chatsDisplay = searchText ? matchingChats : [...folder.chats];
            if (!searchText) {
                chatsDisplay.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
            }

            chatsDisplay.forEach((chat) => {
                const chatIdx = folder.chats.indexOf(chat);
                const link = document.createElement('div');
                link.className = `gu-chat-link ${chat.isPinned ? 'pinned' : ''}`;

                let tagsHtml = '';
                if (chat.tags && chat.tags.length > 0) {
                    tagsHtml = `<div class="gu-tags-row">`;
                    chat.tags.forEach(tag => {
                        const text = typeof tag === 'object' ? tag.text : tag;
                        const color = typeof tag === 'object' ? tag.color : stringToColor(tag);
                        tagsHtml += `<span class="gu-tag" style="background-color:${color}" title="Tag: ${text}">${text}</span>`;
                    });
                    tagsHtml += `</div>`;
                }

                link.innerHTML = `
                    <div class="gu-chat-top-row">
                        <span class="gu-chat-title">${chat.title}</span>
                        <div class="gu-chat-actions">
                            <span class="gu-icon-btn gu-chat-move-btn" title="Move">➔</span>
                            <span class="gu-icon-btn gu-chat-tag-btn" title="${t('manage_tags_title')}">#</span>
                            <span class="gu-icon-btn gu-chat-pin ${chat.isPinned?'active':''}" title="Pin">📌</span>
                            <span class="gu-icon-btn delete c-del">×</span>
                        </div>
                    </div>
                    ${tagsHtml}
                `;

                link.querySelector('.c-del').onclick = (e) => { e.stopPropagation(); folder.chats.splice(chatIdx, 1); Storage.saveData(folders, refreshUI); };
                link.querySelector('.gu-chat-pin').onclick = (e) => { e.stopPropagation(); chat.isPinned = !chat.isPinned; Storage.saveData(folders, refreshUI); };
                link.querySelector('.gu-chat-tag-btn').onclick = (e) => { e.stopPropagation(); showAdvancedTagMenu(e, chat, folders); };
                link.querySelector('.gu-chat-move-btn').onclick = (e) => {
                    e.stopPropagation();
                    showMoveMenu(e, 'chat', { folderIdx: idx, chatIdx: chatIdx });
                };
                link.onclick = () => window.location.href = chat.url;
                content.appendChild(link);
            });
            div.appendChild(content);
        }
        container.appendChild(div);
    });
}

function showStreamerMenu(e) {
    const existing = document.getElementById('gu-streamer-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'gu-streamer-menu';
    menu.className = 'gu-context-menu';
    menu.style.top = `${e.clientY + 20}px`;
    menu.style.right = `20px`;
    menu.style.zIndex = '2000005';

    // Récupérer la config (avec valeur par défaut pour 'ui' à false si inexistante)
    const config = JSON.parse(localStorage.getItem('gu_streamer_config') || '{"loc":true, "content":true, "chat":true, "folder":true, "prompt":true, "mail":true, "ui":false}');

    // Liste des options classiques (Flou)
    const options = [
        { key: 'loc', label: t('loc') },
        { key: 'content', label: t('content') },
        { key: 'mail', label: t('mail') },
        { key: 'chat', label: t('chat') },
        { key: 'folder', label: t('folder') },
        { key: 'prompt', label: t('prompt') }
    ];

    // État du Focus Mode
    const isFocusChecked = config['ui'] ? 'checked' : '';

    // En-tête + Option Focus Mode séparée
    let html = `
        <div class="gu-context-header" style="background:#0b57d0; color:white; display:flex; justify-content:space-between; align-items:center;">
            <span>Streamer Config</span>
            <span id="gu-close-streamer-menu" style="cursor:pointer; font-weight:bold; font-size:16px; padding:0 4px;">×</span>
        </div>

        <label class="gu-context-item" style="justify-content: space-between; padding:10px 16px; cursor:pointer; background:rgba(255,255,255,0.05); border-bottom:1px solid #444;">
            <span style="font-size:13px; color:#a8c7fa; font-weight:bold;">${t('streamer_focus')}</span>
            <input type="checkbox" data-key="ui" ${isFocusChecked} style="accent-color:#a8c7fa; cursor:pointer; transform:scale(1.1);">
        </label>
    `;

    // Boucle pour les options de flou classiques
    options.forEach(opt => {
        const isChecked = config[opt.key] ? 'checked' : '';
        html += `
            <label class="gu-context-item" style="justify-content: space-between; padding:8px 16px; cursor:pointer; user-select:none;">
                <span style="font-size:13px;">${opt.label}</span>
                <input type="checkbox" data-key="${opt.key}" ${isChecked} style="accent-color:#0b57d0; cursor:pointer;">
            </label>
        `;
    });

    menu.innerHTML = html;
    document.body.appendChild(menu);

    // --- LOGIQUE ---

    const closeMenu = () => {
        if(menu.parentNode) menu.remove();
        document.removeEventListener('click', outsideClickListener);
    };

    menu.querySelector('#gu-close-streamer-menu').onclick = (ev) => {
        ev.stopPropagation();
        closeMenu();
    };

    // Gestion unique pour TOUTES les checkboxes (Focus + Autres)
    menu.querySelectorAll('input').forEach(input => {
        input.onchange = () => {
            const key = input.getAttribute('data-key');
            config[key] = input.checked;

            // Sauvegarde
            localStorage.setItem('gu_streamer_config', JSON.stringify(config));

            // Application immédiate si le mode Streamer est actif
            if (document.body.classList.contains('gu-streamer-active')) {
                applyStreamerFilters(config);
            }
        };
    });

    // Fermeture souris
    menu.onmouseleave = () => closeMenu();

    const outsideClickListener = (ev) => {
        if (!menu.contains(ev.target)) {
            closeMenu();
        }
    };

    setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
    }, 100);
}


// ui.js - Mise à jour de renderPromptsUI

function renderPromptsUI(promptFolders) {
    const container = document.getElementById('gu-prompts-list');
    const searchInput = document.getElementById('gu-search-input');
    if (!container) return;

    const searchText = searchInput ? searchInput.value.toLowerCase() : "";
    container.innerHTML = '';

    if (promptFolders.length === 0) {
        container.innerHTML = `<div style="padding:30px 20px; text-align:center; color:#666; font-size:12px;">${t('folder_empty_message')}</div>`;
        return;
    }

    promptFolders.forEach((folder, folderIdx) => {
        // ... (Logique de recherche existante inchangée) ...
        const folderMatches = folder.name.toLowerCase().includes(searchText);
        const matchingPrompts = folder.prompts.filter(prompt => {
            const nameMatch = prompt.name.toLowerCase().includes(searchText);
            const contentMatch = prompt.content.toLowerCase().includes(searchText);
            return nameMatch || contentMatch;
        });
        if (searchText && !folderMatches && matchingPrompts.length === 0) return;
        // ...

        const div = document.createElement('div');
        const header = document.createElement('div');
        header.className = 'gu-folder-row';
        header.style.borderLeftColor = folder.color || '#5f6368';

        const isOpen = folder.isOpen || (searchText.length > 0);
        const emoji = folder.emoji || '📁';

        // --- MODIFICATION ICI : Ajout du bouton EXPORT ---
        header.innerHTML = `
            <div class="gu-folder-left">
                <span style="font-size:10px; color:${folder.color}; width: 12px;">${isOpen ? '▼' : '▶'}</span>
                <span class="gu-folder-emoji">${emoji}</span>
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px; font-weight:500;">${folder.name}</span>
            </div>
            <div style="display:flex; align-items:center;">
                <span class="gu-count">${folder.prompts.length}</span>
                <div class="gu-folder-actions">
                    <span class="gu-icon-btn export-pack" title="${t('export_pack')}">📤</span>

                    <div class="gu-color-wrapper">
                        <div class="gu-color-dot" style="background-color:${folder.color};"></div>
                        <input type="color" class="gu-color-input" value="${folder.color}">
                    </div>
                    <span class="gu-icon-btn edit" title="${t('edit_folder')}">✎</span>
                    <span class="gu-icon-btn delete" title="${t('delete_folder_confirm')}">×</span>
                </div>
            </div>
        `;

        // --- EVENTS ---
        const colorInput = header.querySelector('.gu-color-input');
        colorInput.addEventListener('input', (e) => {
            header.style.borderLeftColor = e.target.value;
            header.querySelector('.gu-color-dot').style.backgroundColor = e.target.value;
        });
        colorInput.addEventListener('change', (e) => { folder.color = e.target.value; Storage.savePromptFolders(promptFolders, refreshUI); });
        header.querySelector('.gu-color-wrapper').addEventListener('click', e => e.stopPropagation());

        // Clic Export
        header.querySelector('.export-pack').onclick = (e) => {
            e.stopPropagation();
            exportPromptFolder(folder);
        };

        header.querySelector('.edit').onclick = (e) => { e.stopPropagation(); showCreatePromptFolderModal(folder); };
        header.querySelector('.delete').onclick = (e) => { e.stopPropagation(); if(confirm(t('delete_folder_confirm'))) { promptFolders.splice(folderIdx, 1); Storage.savePromptFolders(promptFolders, refreshUI); } };
        header.onclick = () => {
                    // 1. Mise à jour immédiate
                    folder.isOpen = !folder.isOpen;

                    // 2. Re-rendu INSTANTANÉ
                    renderPromptsUI(promptFolders);

                    // 3. Sauvegarde silencieuse en arrière-plan
                    savePromptsDebounced(promptFolders);
                };

        div.appendChild(header);

        if (isOpen) {
            const content = document.createElement('div');
            content.className = 'gu-folder-content open';

            // ... (Reste de la logique d'affichage des prompts inchangée) ...
            let promptsDisplay = searchText ? matchingPrompts : [...folder.prompts];

            // Tri PIN
            if (!searchText) {
                promptsDisplay.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
            }

            promptsDisplay.forEach((prompt) => {
                const promptIdx = folder.prompts.indexOf(prompt);
                const item = document.createElement('div');
                item.className = `gu-prompt-item ${prompt.isPinned ? 'pinned' : ''}`;

                item.innerHTML = `
                    <div class="gu-prompt-meta">
                        <span class="gu-prompt-name">${prompt.name}</span>
                        <div class="gu-prompt-actions">
                            <span class="gu-icon-btn pin-p ${prompt.isPinned ? 'active' : ''}" title="Pin to top">📌</span>
                            <span class="gu-icon-btn edit-p">✎</span>
                            <span class="gu-icon-btn delete-p">×</span>
                        </div>
                    </div>
                    <div class="gu-prompt-text">${prompt.content}</div>
                `;

                item.onclick = () => handlePromptClick(prompt.content, folderIdx, promptIdx);

                item.querySelector('.pin-p').onclick = (e) => {
                    e.stopPropagation();
                    prompt.isPinned = !prompt.isPinned;
                    Storage.savePromptFolders(promptFolders, () => { renderPromptsUI(promptFolders); });
                };

                item.querySelector('.edit-p').onclick = (e) => { e.stopPropagation(); showCreatePromptModal(prompt, folderIdx, promptIdx); };
                item.querySelector('.delete-p').onclick = (e) => {
                    e.stopPropagation();
                    if(confirm(t('delete_prompt_confirm'))) {
                        folder.prompts.splice(promptIdx, 1);
                        Storage.savePromptFolders(promptFolders, refreshUI);
                    }
                };
                content.appendChild(item);
            });
            div.appendChild(content);
        }
        container.appendChild(div);
    });
}

// --- IMPORT / EXPORT PACKS ---

function exportPromptFolder(folder) {
    const exportData = {
        type: 'guop_pack',
        version: '1.0',
        folder: folder
    };

    // Modification ici : extension .guop
    const fileName = `${folder.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.guop`;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importPromptPack(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validation basique : est-ce que ça ressemble à un dossier de prompts ?
            let folderToAdd = null;

            // Cas 1 : C'est un format GUOP (notre format exporté)
            if (data.type === 'guop_pack' && data.folder) {
                folderToAdd = data.folder;
            }
            // Cas 2 : C'est peut-être juste un objet dossier brut (vieux format ou manuel)
            else if (data.name && Array.isArray(data.prompts)) {
                folderToAdd = data;
            }

            if (folderToAdd) {
                // On récupère la liste actuelle et on AJOUTE (push)
                Storage.getPromptFolders(currentFolders => {
                    // Optionnel : Renommer si doublon pour éviter confusion
                    const isDuplicate = currentFolders.some(f => f.name === folderToAdd.name);
                    if (isDuplicate) {
                        folderToAdd.name = `${folderToAdd.name} (Imported)`;
                    }

                    // On s'assure que isOpen est false pour ne pas encombrer l'interface
                    folderToAdd.isOpen = false;

                    currentFolders.push(folderToAdd);

                    Storage.savePromptFolders(currentFolders, () => {
                        refreshUI(); // Ou renderPromptsUI
                        alert(t('import_success'));
                    });
                });
            } else {
                alert(t('import_error'));
            }
        } catch (err) {
            console.error(err);
            alert(t('import_error'));
        }
        // Reset de l'input pour pouvoir réimporter le même fichier si besoin
        event.target.value = '';
    };
    reader.readAsText(file);
}

// --- PROMPT INJECTION LOGIC ---
function handlePromptClick(content, folderIdx = null, promptIdx = null) {
    const regex = /{{(.*?)}}/g;
    const matches = [...content.matchAll(regex)];
    if (matches.length > 0) {
        const vars = [...new Set(matches.map(m => m[1]))];
        // On transmet les IDs à la modale pour qu'elle puisse sauvegarder/supprimer
        showPromptVariableModal(content, vars, folderIdx, promptIdx);
    } else {
        injectPromptToGemini(content);
    }
}

function injectPromptToGemini(text) {
    const editor = document.querySelector('div[contenteditable="true"].r-1wzrnnt') ||
                   document.querySelector('div[contenteditable="true"]') ||
                   document.querySelector('textarea');
    if (!editor) return alert(t('no_input_box_alert'));
    editor.focus();
    if (editor.tagName === 'TEXTAREA') {
        editor.value = text;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        document.execCommand('insertText', false, text);
        if (editor.innerText.trim() === '') editor.innerText = text;
    }
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    editor.dispatchEvent(inputEvent);
}

// --- MODALS ---
// ui.js - Remplacement de showPromptVariableModal (Version avec option "Other")

export function showPromptVariableModal(content, variables, folderIdx = null, promptIdx = null) {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';

    // On garde une copie locale du contenu pour pouvoir le modifier (Ajout/Suppression d'options)
    let currentContent = content;

    let inputsHtml = variables.map(v => {
        // --- CAS LISTE DÉROULANTE (DROPDOWN) ---
        if (v.includes(':')) {
            const parts = v.split(':');
            const label = parts[0].trim();
            const options = parts[1].split(',').map(o => o.trim());

            let optionsHtml = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            optionsHtml += `<option value="__custom__" style="font-style:italic; color:#a8c7fa;">Other...</option>`;

            // Bouton Delete (X) - Seulement si on a les droits d'écriture (folderIdx != null)
            const deleteBtnHtml = (folderIdx !== null)
                ? `<button class="gu-btn-del-opt" title="Delete selected option from list" style="background:#5c2b29; color:white; border:none; width:30px; border-radius:4px; cursor:pointer; font-weight:bold;">×</button>`
                : '';

            return `
                <div class="gu-var-group" data-original-var="${v.replace(/"/g, '&quot;')}">
                    <span class="gu-input-label" style="margin-top:10px; color:#a8c7fa;">${label.toUpperCase()}</span>

                    <div style="display:flex; gap:6px;">
                        <select class="gu-tag-input gu-var-input gu-var-select" style="cursor:pointer; flex:1;">
                            ${optionsHtml}
                        </select>
                        ${deleteBtnHtml}
                    </div>

                    <div class="gu-custom-row" style="display:none; margin-top:5px; gap:6px;">
                        <input type="text" class="gu-tag-input gu-custom-input" style="flex:1; border-color:#a8c7fa;" placeholder="New value...">
                        <button class="gu-btn-add-custom" style="background:#254d29; border:1px solid #254d29; color:white; border-radius:8px; cursor:pointer; width:40px; font-weight:bold; display:none; align-items:center; justify-content:center;" title="Add to list permanent">+</button>
                    </div>
                </div>
            `;
        }
        // --- CAS TEXTE SIMPLE ---
        else {
            return `
                <span class="gu-input-label" style="margin-top:10px; color:#a8c7fa;">${v.toUpperCase()}</span>
                <input type="text" data-original-var="${v.replace(/"/g, '&quot;')}" class="gu-tag-input gu-var-input" placeholder="Value for ${v}..." autofocus>
            `;
        }
    }).join('');

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>${t('fill_vars_title')}</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body">
                <p style="font-size:12px; color:#999; margin-bottom:10px;">${t('customize_prompt')}</p>
                ${inputsHtml}
                <button id="gu-submit-vars" class="gu-btn-action">${t('generate_insert')}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus initial
    setTimeout(() => { const i = modal.querySelector('input, select'); if(i) i.focus(); }, 100);

    const close = () => modal.remove();
    modal.querySelector('.gu-menu-close').onclick = close;

    // --- FONCTION DE MISE À JOUR DU PROMPT (PERSISTANCE) ---
    const updateVariableDefinition = (group, oldDef, newDef) => {
        // 1. Mise à jour de la mémoire locale du prompt
        currentContent = currentContent.split(`{{${oldDef}}}`).join(`{{${newDef}}}`);

        // 2. Sauvegarde dans le stockage Chrome (si possible)
        updatePromptContentInStorage(folderIdx, promptIdx, currentContent);

        // 3. Mise à jour du DOM pour que les futurs clics utilisent la nouvelle déf
        group.setAttribute('data-original-var', newDef);
    };

    // --- LOGIQUE INTERACTIVE ---
    modal.querySelectorAll('.gu-var-group').forEach(group => {
        const select = group.querySelector('.gu-var-select');
        const customRow = group.querySelector('.gu-custom-row');
        const deleteBtn = group.querySelector('.gu-btn-del-opt');

        if (!select) return; // Pas un dropdown

        const customInput = customRow.querySelector('.gu-custom-input');
        const addBtn = customRow.querySelector('.gu-btn-add-custom');

        // 1. Afficher/Masquer "Other" + Gestion Delete Button
        const updateUIState = () => {
            const isCustom = select.value === '__custom__';
            customRow.style.display = isCustom ? 'flex' : 'none';
            if(isCustom) {
                customInput.focus();
                if(deleteBtn) deleteBtn.style.display = 'none'; // Pas de suppression sur "Other"
            } else {
                addBtn.style.display = 'none';
                customInput.value = '';
                if(deleteBtn) deleteBtn.style.display = 'block'; // Réafficher bouton suppression
            }
        };
        select.onchange = updateUIState;

        // 2. Afficher bouton "+" quand on tape
        customInput.oninput = () => {
            addBtn.style.display = customInput.value.trim().length > 0 ? 'flex' : 'none';
        };

        // 3. AJOUTER (Persistant)
        addBtn.onclick = (e) => {
            e.preventDefault();
            const newVal = customInput.value.trim();
            if (!newVal) return;

            // Calcul de la nouvelle définition
            const oldDef = group.getAttribute('data-original-var'); // ex: Ton:A,B
            const newDef = `${oldDef},${newVal}`; // ex: Ton:A,B,C

            // Mise à jour DOM Select
            const newOption = document.createElement('option');
            newOption.value = newVal;
            newOption.innerText = newVal;
            const otherOption = select.querySelector('option[value="__custom__"]');
            select.insertBefore(newOption, otherOption);
            select.value = newVal;

            // Sauvegarde
            updateVariableDefinition(group, oldDef, newDef);
            updateUIState(); // Reset UI
        };

        // 4. SUPPRIMER (Persistant)
        if (deleteBtn) {
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                const valToDelete = select.value;
                if (valToDelete === '__custom__' || !valToDelete) return;

                if (confirm(`Remove "${valToDelete}" from this list permanently?`)) {
                    // Calcul de la nouvelle définition
                    const oldDef = group.getAttribute('data-original-var'); // ex: Ton:A,B,C
                    const parts = oldDef.split(':');
                    const label = parts[0];
                    let opts = parts[1].split(',');

                    // Filtrer la valeur supprimée
                    opts = opts.filter(o => o.trim() !== valToDelete);

                    const newDef = `${label}:${opts.join(',')}`; // ex: Ton:A,C

                    // Mise à jour DOM
                    select.querySelector(`option[value="${valToDelete}"]`).remove();
                    // Sélectionner le premier élément restant ou Other
                    select.selectedIndex = 0;

                    // Sauvegarde
                    updateVariableDefinition(group, oldDef, newDef);
                    updateUIState();
                }
            };
        }
    });

    // --- SOUMISSION ---
    const submit = () => {
        let finalContent = currentContent; // On part de la version à jour (potentiellement modifiée)

        // On doit re-scanner les valeurs car le DOM a pu changer (data-original-var a changé)
        // Mais plus simple : on remplace les variables une par une

        const allGroups = modal.querySelectorAll('.gu-var-group, input[data-original-var]');

        allGroups.forEach(el => {
            // Récupérer la définition actuelle (peut avoir été mise à jour par Add/Del)
            const v = el.getAttribute('data-original-var');
            let val = "";

            if (el.classList.contains('gu-var-group')) {
                // C'est un Dropdown
                const select = el.querySelector('select');
                val = select.value;
                if (val === '__custom__') {
                    val = el.querySelector('.gu-custom-input').value || "";
                }
            } else {
                // C'est un Input simple
                val = el.value;
            }

            // Remplacement dans le texte final
            finalContent = finalContent.split(`{{${v}}}`).join(val);
        });

        injectPromptToGemini(finalContent);
        close();
    };

    modal.querySelector('#gu-submit-vars').onclick = submit;

    modal.querySelectorAll('input, select').forEach(inp => {
        inp.onkeydown = (e) => { if(e.key === 'Enter') submit(); };
    });

    modal.onclick = (e) => { if(e.target === modal) close(); };
}

export function showCreateFolderModal(existingFolder = null) {
    const existing = document.getElementById('gu-create-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'gu-create-modal';
    modal.className = 'gu-modal-overlay';
    let selectedEmoji = existingFolder ? (existingFolder.emoji || '📁') : EMOJIS[0];
    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header">
                <span>${existingFolder ? t('edit_folder') : t('newFolder')}</span>
                <span class="gu-menu-close">×</span>
            </div>
            <div class="gu-modal-body">
                <span class="gu-input-label">${t('name')}</span>
                <input type="text" id="gu-folder-name" class="gu-tag-input" value="${existingFolder ? existingFolder.name : ''}" autofocus>
                <span class="gu-input-label" style="margin-top:15px;">${t('icon')}</span>
                <div class="gu-emoji-grid">
                    ${EMOJIS.map(e => `<div class="gu-emoji-item ${e === selectedEmoji ? 'selected' : ''}">${e}</div>`).join('')}
                </div>
                <button id="gu-save-folder" class="gu-btn-action">${t('save')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.gu-emoji-item').forEach(item => {
        item.onclick = () => {
            modal.querySelectorAll('.gu-emoji-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedEmoji = item.innerText;
        };
    });
    const save = () => {
        const name = modal.querySelector('#gu-folder-name').value.trim();
        if (!name) return;
        Storage.getData(folders => {
            if (existingFolder) {
                const target = folders.find(f => f.name === existingFolder.name);
                if (target) { target.name = name; target.emoji = selectedEmoji; }
            } else {
                folders.push({
                    name: name, emoji: selectedEmoji, isOpen: true, chats: [],
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
            }
            Storage.saveData(folders, refreshUI);
            modal.remove();
        });
    };
    modal.querySelector('#gu-save-folder').onclick = save;
    modal.querySelector('#gu-folder-name').onkeydown = (e) => { if(e.key === 'Enter') save(); };
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

export function showCreatePromptFolderModal(existingFolder = null) {
    const existing = document.getElementById('gu-create-prompt-folder-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'gu-create-prompt-folder-modal';
    modal.className = 'gu-modal-overlay';
    let selectedEmoji = existingFolder ? (existingFolder.emoji || '📁') : EMOJIS[0];
    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header">
                <span>${existingFolder ? t('edit_folder') : t('newFolder')}</span>
                <span class="gu-menu-close">×</span>
            </div>
            <div class="gu-modal-body">
                <span class="gu-input-label">${t('name')}</span>
                <input type="text" id="gu-prompt-folder-name" class="gu-tag-input" value="${existingFolder ? existingFolder.name : ''}" autofocus>
                <span class="gu-input-label" style="margin-top:15px;">${t('icon')}</span>
                <div class="gu-emoji-grid">
                    ${EMOJIS.map(e => `<div class="gu-emoji-item ${e === selectedEmoji ? 'selected' : ''}">${e}</div>`).join('')}
                </div>
                <button id="gu-save-prompt-folder" class="gu-btn-action">${t('save')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.gu-emoji-item').forEach(item => {
        item.onclick = () => {
            modal.querySelectorAll('.gu-emoji-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedEmoji = item.innerText;
        };
    });
    const save = () => {
        const name = modal.querySelector('#gu-prompt-folder-name').value.trim();
        if (!name) return;
        Storage.getPromptFolders(promptFolders => {
            if (existingFolder) {
                const target = promptFolders.find(f => f.name === existingFolder.name);
                if (target) { target.name = name; target.emoji = selectedEmoji; }
            } else {
                promptFolders.push({
                    name: name, emoji: selectedEmoji, isOpen: true, prompts: [],
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
            }
            Storage.savePromptFolders(promptFolders, refreshUI);
            modal.remove();
        });
    };
    modal.querySelector('#gu-save-prompt-folder').onclick = save;
    modal.querySelector('#gu-prompt-folder-name').onkeydown = (e) => { if(e.key === 'Enter') save(); };
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

export function showCreatePromptModal(existingPrompt = null, folderIdx = null, promptIdx = null) {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header">
                <span>${existingPrompt ? t('edit_prompt') : t('new_prompt_btn').replace('+', '').trim()}</span>
                <span class="gu-menu-close">×</span>
            </div>
            <div class="gu-modal-body">
                <span class="gu-input-label">${t('name')}</span>
                <input type="text" id="gu-prompt-name" class="gu-tag-input" value="${existingPrompt ? existingPrompt.name : ''}" autofocus>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                    <span class="gu-input-label" style="margin-bottom:0;">${t('prompt_content')}</span>
                    <button id="gu-add-var-btn" class="gu-var-btn" style="cursor:pointer; background:#333; border:1px solid #555; color:#a8c7fa; padding:2px 8px; border-radius:4px; font-size:11px;">+ Variable</button>
                </div>

                <textarea id="gu-prompt-content" class="gu-tag-input gu-input-textarea" placeholder="Ex: Explain {{topic}} like I am 5..." style="margin-top:5px;">${existingPrompt ? existingPrompt.content : ''}</textarea>
                <button id="gu-save-prompt" class="gu-btn-action">${t('save_prompt')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Logique Add Variable
    modal.querySelector('#gu-add-var-btn').onclick = () => {
        const varName = prompt("Nom de la variable (ex: Sujet, Ton) ?");
        if(varName) {
            const textarea = modal.querySelector('#gu-prompt-content');
            const textToInsert = `{{${varName}}}`;
            // Insertion curseur
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            textarea.value = text.substring(0, start) + textToInsert + text.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
        }
    };

    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.querySelector('#gu-save-prompt').onclick = () => {
        const name = modal.querySelector('#gu-prompt-name').value.trim();
        const content = modal.querySelector('#gu-prompt-content').value.trim();
        if(!name || !content) return;
        Storage.getPromptFolders(promptFolders => {
            if(existingPrompt && folderIdx !== null && promptIdx !== null) {
                promptFolders[folderIdx].prompts[promptIdx] = { name, content };
            } else {
                if (promptFolders.length === 0) {
                    promptFolders.push({ name: 'Default', emoji: '📁', isOpen: true, prompts: [], color: COLORS[0] });
                }
                promptFolders[0].prompts.push({ name, content });
            }
            Storage.savePromptFolders(promptFolders, refreshUI);
            modal.remove();
        });
    };
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

export function showPromptHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
 modal.innerHTML = `
         <div class="gu-modal-content">
             <div class="gu-modal-header"><span>${t('prompt_help_title')}</span><span class="gu-menu-close">×</span></div>
             <div class="gu-modal-body">
                 ${t('prompt_help_content')}
                 <button class="gu-btn-action" id="gu-close-help">${t('tutorial_button')}</button>
             </div>
         </div>
     `;
    document.body.appendChild(modal);
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.querySelector('#gu-close-help').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

// --- EXPORT FUNCTIONS ---

function getChatMessages() {
    const chatContainer = document.querySelector('main');
    if (!chatContainer) return [];

    // On récupère les blocs de questions et réponses
    const elements = chatContainer.querySelectorAll('user-query, model-response');
    const messages = [];

    elements.forEach(el => {
        const isUser = el.tagName.toLowerCase() === 'user-query';
        // On essaie de récupérer le contenu brut ou le HTML pour le PDF
        const text = el.innerText || el.textContent;
        const html = el.innerHTML; // Utile pour le PDF pour garder un peu de formatage

        messages.push({
            role: isUser ? 'User' : 'Gemini',
            text: text.trim(),
            html: html
        });
    });
    return messages;
}

function exportChatToJSON() {
    const messages = getChatMessages().map(m => ({ role: m.role, content: m.text }));
    if (messages.length === 0) return alert("No chat content found.");

    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_chat_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updatePromptContentInStorage(folderIdx, promptIdx, newContent) {
    if (folderIdx === null || promptIdx === null) return;
    Storage.getPromptFolders(folders => {
        if (folders[folderIdx] && folders[folderIdx].prompts[promptIdx]) {
            folders[folderIdx].prompts[promptIdx].content = newContent;
            Storage.savePromptFolders(folders, () => {
                console.log("Prompt updated automatically.");
            });
        }
    });
}

function exportChatToPDF() {
    const messages = getChatMessages();
    if (messages.length === 0) return alert(t('prompt_empty_message') || "No content found");

    // 1. Ouvrir la fenêtre
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Pop-up blocked. Please allow pop-ups for this export.");

    const dateStr = new Date().toLocaleDateString();
    const title = `Gemini Chat - ${dateStr}`;

    // 2. Construire le HTML (SANS AUCUN SCRIPT NI ONCLICK)
    let htmlContent = `
    <html>
    <head>
        <title>${title}</title>
        <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; }
            h1 { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; color: #444; }

            .message { margin-bottom: 30px; page-break-inside: avoid; }
            .role { font-weight: bold; font-size: 13px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
            .User .role { color: #0b57d0; }
            .Gemini .role { color: #8e44ad; }
            .content { font-size: 15px; white-space: pre-wrap; text-align: justify; }

            pre { background: #f8f9fa; border: 1px solid #ddd; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
            code { font-family: 'Consolas', 'Monaco', monospace; color: #d63384; }

            /* Header pour le bouton (caché à l'impression) */
            #print-header {
                position: fixed; top: 0; left: 0; width: 100%; background: #333; color: white;
                padding: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 9999;
                display: flex; justify-content: center; align-items: center; gap: 20px;
            }
            .btn-print {
                background: #0b57d0; color: white; border: none; padding: 10px 20px; border-radius: 4px;
                font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;
            }
            .btn-print:hover { background: #0842a0; }
            .info-text { font-size: 13px; color: #ccc; }

            @media print {
                #print-header { display: none !important; }
                body { padding-top: 0; }
            }
        </style>
    </head>
    <body>
        <div id="print-header">
            <button id="btn-print-action" class="btn-print">
                🖨️ Enregistrer en PDF
            </button>
            <span class="info-text">Destination: "Enregistrer au format PDF"</span>
        </div>

        <div style="margin-top: 60px;">
            <h1>${title}</h1>
    `;

    messages.forEach(msg => {
        htmlContent += `
            <div class="message ${msg.role}">
                <div class="role">${msg.role}</div>
                <div class="content">${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </div>
        `;
    });

    htmlContent += `</div></body></html>`;

    // 3. Écrire le contenu statique
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // 4. INJECTION DE LA LOGIQUE (La partie magique)
    // On attend que la fenêtre soit prête, puis on attache le clic DEPUIS l'extension
    setTimeout(() => {
        if (!printWindow || printWindow.closed) return;

        // On récupère le bouton dans la NOUVELLE fenêtre
        const btn = printWindow.document.getElementById('btn-print-action');

        if (btn) {
            // On lui greffe l'action ici (autorisé par Chrome)
            btn.onclick = () => {
                printWindow.document.title = title; // Force le titre pour le nom de fichier
                printWindow.print();
            };
        }

        // Lancement automatique
        printWindow.document.title = title;
        printWindow.print();
    }, 500); // Petit délai pour s'assurer que le DOM est chargé
}

function showExportMenu(e) {
    const existing = document.getElementById('gu-export-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'gu-export-menu';
    menu.className = 'gu-context-menu';
    menu.style.top = `${e.clientY + 25}px`;

    // Positionnement intelligent
    if (window.innerWidth - e.clientX < 200) {
        menu.style.right = '20px';
        menu.style.left = 'auto';
    } else {
        menu.style.left = `${e.clientX - 100}px`;
    }

    const options = [
        { label: t('export_md'), icon: '📝', action: exportChatToMarkdown },
        { label: t('export_pdf'), icon: '🖨️', action: exportChatToPDF },
        { label: t('export_json'), icon: '📦', action: exportChatToJSON }
    ];

    // En-tête avec bouton de fermeture (Croix) ajouté
    let html = `
        <div class="gu-context-header" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${t('export_menu_title')}</span>
            <span id="gu-close-export-menu" style="cursor:pointer; font-weight:bold; font-size:16px; padding:0 4px;">×</span>
        </div>
    `;

    options.forEach((opt, idx) => {
        html += `
            <div class="gu-context-item" data-idx="${idx}">
                <span style="margin-right:10px;">${opt.icon}</span> ${opt.label}
            </div>
        `;
    });

    menu.innerHTML = html;
    document.body.appendChild(menu);

    // --- LOGIQUE DE FERMETURE ---

    const closeMenu = () => {
        if (menu.parentNode) menu.remove();
        document.removeEventListener('click', outsideClickListener);
    };

    // 1. Fermer via la Croix
    menu.querySelector('#gu-close-export-menu').onclick = (ev) => {
        ev.stopPropagation();
        closeMenu();
    };

    // 2. Fermer quand la souris quitte le menu (Mouse Leave)
    menu.onmouseleave = () => closeMenu();

    // 3. Clic sur une option
    menu.querySelectorAll('.gu-context-item').forEach(item => {
        item.onclick = () => {
            const idx = item.getAttribute('data-idx');
            options[idx].action();
            closeMenu();
        };
    });

    // 4. Clic à l'extérieur
    const outsideClickListener = (ev) => {
        if (!menu.contains(ev.target) && ev.target !== e.target) {
            closeMenu();
        }
    };
    setTimeout(() => document.addEventListener('click', outsideClickListener), 100);
}

export function showBulkManager(folders) {
    const existing = document.getElementById('gu-bulk-modal');
    if (existing) existing.remove();
    const chatItems = document.querySelectorAll('div[data-test-id="conversation"]');
    let availableChats = [];
    const archivedSet = new Set();
    folders.forEach(f => f.chats.forEach(c => archivedSet.add(c.url)));

    chatItems.forEach(item => {
        const jslog = item.getAttribute('jslog');
        let chatId = null;
        if (jslog) {
            const match = jslog.match(/"(c_[^"]+)"/) || jslog.match(/"([0-9a-f]{10,})"/);
            if (match) chatId = match[1].replace('c_', '');
        }
        if (!chatId) {
            const link = item.closest('a');
            if (link && link.href.includes('/app/')) chatId = link.href.split('/').pop();
        }
        if (!chatId) return;
        const url = `https://gemini.google.com/app/${chatId}`;
        if (archivedSet.has(url)) return;
        const titleEl = item.querySelector('.conversation-title');
        const title = titleEl ? titleEl.innerText.trim() : "Conversation";
        availableChats.push({ title, url });
    });

    const modal = document.createElement('div');
    modal.id = 'gu-bulk-modal';
    modal.className = 'gu-modal-overlay';
    let listHtml = availableChats.map((c, i) => `
        <div class="gu-bulk-item" data-idx="${i}">
            <input type="checkbox" class="gu-bulk-checkbox">
            <span class="gu-bulk-text">${c.title}</span>
        </div>
    `).join('');
    if (availableChats.length === 0) listHtml = `<div style="text-align:center; padding:20px; color:#666;">${t('no_new_chats_found')}</div>`;

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>${t('bulk_organize_title')}</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body">
                <input type="text" id="gu-bulk-search" class="gu-tag-input" placeholder="${t('filter_chats_placeholder')}">
                <div class="gu-bulk-list">${listHtml}</div>
                <div class="gu-bulk-counter">0 selected (Max 20)</div>
                <select id="gu-bulk-folder-select" class="gu-tag-input" style="margin-top:10px;">
                    <option value="">${t('select_folder_placeholder')}</option>
                    ${folders.map((f, i) => `<option value="${i}">${f.emoji} ${f.name}</option>`).join('')}
                </select>
                <button id="gu-bulk-move" class="gu-btn-action">${t('move_selected')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let selection = new Set();
    const items = modal.querySelectorAll('.gu-bulk-item');
    const counter = modal.querySelector('.gu-bulk-counter');
    items.forEach(item => {
        item.onclick = (e) => {
            if (e.target.type !== 'checkbox') {
                const cb = item.querySelector('input');
                cb.checked = !cb.checked;
            }
            const idx = item.getAttribute('data-idx');
            const cb = item.querySelector('input');
            if (cb.checked) {
                if (selection.size >= 20) {
                    cb.checked = false;
                    alert(t('max_batch_alert'));
                } else {
                    selection.add(availableChats[idx]);
                    item.classList.add('selected');
                }
            } else {
                selection.delete(availableChats[idx]);
                item.classList.remove('selected');
            }
            counter.innerText = `${selection.size} selected (Max 20)`;
        };
    });

    modal.querySelector('#gu-bulk-search').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        items.forEach(item => {
            const text = item.querySelector('.gu-bulk-text').innerText.toLowerCase();
            item.style.display = text.includes(val) ? 'flex' : 'none';
        });
    };

    modal.querySelector('#gu-bulk-move').onclick = () => {
        const folderIdx = modal.querySelector('#gu-bulk-folder-select').value;
        if (folderIdx === "" || selection.size === 0) return alert(t('bulk_selection_alert'));
        if (folders[folderIdx]) {
            selection.forEach(chat => { folders[folderIdx].chats.push({ title: chat.title, url: chat.url }); });
            Storage.saveData(folders, refreshUI);
            modal.remove();
        }
    };
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

function refreshMainButtons() {
    const panel = document.getElementById('gu-floating-panel');
    if (!panel) return;

    const btnSettings = panel.querySelector('#gu-btn-settings');
    if(btnSettings) btnSettings.title = t('settings');

    const btnWide = panel.querySelector('#gu-btn-wide');
    if(btnWide) btnWide.title = `Wide Mode (Alt+W)`;

    const btnStreamer = panel.querySelector('#gu-btn-streamer');
    if(btnStreamer) btnStreamer.title = `Streamer Mode (Alt+S)`;

    const btnBulk = panel.querySelector('#gu-btn-bulk');
    if(btnBulk) btnBulk.title = t('bulk_organize_title');

    const btnReorg = panel.querySelector('#gu-btn-reorganize');
    if(btnReorg) btnReorg.title = 'Reorganize';

    const btnExport = panel.querySelector('#gu-btn-export-md');
    if(btnExport) btnExport.title = 'Export Chat to Markdown';

    const addFolderBtn = panel.querySelector('#gu-add-folder-btn');
    if (addFolderBtn) {
        addFolderBtn.title = t('newFolder');
        addFolderBtn.innerHTML = `<span>+</span> ${t('newFolder')}`;
    }

    const addPromptBtn = panel.querySelector('#gu-add-prompt-btn');
    if (addPromptBtn) {
        addPromptBtn.innerText = t('new_prompt_btn');
    }
    const helpPromptBtn = panel.querySelector('#gu-help-prompt-btn');
    if (helpPromptBtn) {
        helpPromptBtn.title = t('prompt_help_title');
    }

    const tabFolders = panel.querySelector('#gu-tab-folders');
    if(tabFolders) tabFolders.innerText = t('folders_tab');

    const tabPrompts = panel.querySelector('#gu-tab-prompts');
    if(tabPrompts) tabPrompts.innerText = t('prompts_tab');

    const tabNotes = panel.querySelector('#gu-tab-notes');
        if(tabNotes) tabNotes.innerText = t('notes_tab');

    const searchInput = panel.querySelector('#gu-search-input');
    if (searchInput) {
        if (tabFolders && tabFolders.classList.contains('active')) {
            searchInput.placeholder = t('search_folders_placeholder');
        } else {
            searchInput.placeholder = t('search_prompts_placeholder');
        }
    }
}

export function showSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
    const user = Storage.getCurrentUser();

    const languageOptions = Object.keys(i18n).map(lang =>
        `<option value="${lang}">${i18n[lang].lang_name}</option>`
    ).join('');

    const showHidden = localStorage.getItem('gu_show_archived') === 'true';

    // Récupération des deux zooms
    const zoomText = localStorage.getItem('gu_zoom_text_level') || '100';
    const zoomUI = localStorage.getItem('gu_zoom_ui_level') || '100';

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>${t('settings')}</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body" style="text-align:center;">

                <p style="color:#a8c7fa; font-size:12px; margin-bottom:15px;">
                    ${t('current_account')}: <b class="gu-settings-email">${user}</b>
                </p>

                <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; padding: 0 10px;">
                    <span class="gu-input-label" style="text-align:left; margin-bottom: 0;">${t('language')}</span>
                    <select id="gu-language-select" class="gu-tag-input" style="margin-top:0;">
                        ${languageOptions}
                    </select>
                </div>

                <div style="background:#252627; padding:10px; border-radius:8px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span class="gu-input-label" style="margin:0;">${t('zoom_text')}</span>
                        <span id="gu-zoom-text-val" style="color:#a8c7fa; font-weight:bold;">${zoomText}%</span>
                    </div>
                    <input type="range" id="gu-zoom-text-slider" min="80" max="150" step="5" value="${zoomText}" style="width:100%; accent-color:#0b57d0; cursor:pointer;">
                </div>

                <div style="background:#252627; padding:10px; border-radius:8px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span class="gu-input-label" style="margin:0;">${t('zoom_ui')}</span>
                        <span id="gu-zoom-ui-val" style="color:#a8c7fa; font-weight:bold;">${zoomUI}%</span>
                    </div>
                    <input type="range" id="gu-zoom-ui-slider" min="80" max="120" step="5" value="${zoomUI}" style="width:100%; accent-color:#254d29; cursor:pointer;">
                </div>

                <div style="background:#252627; padding:10px; border-radius:8px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:13px; color:#ccc;">${t('show-archived-chats')}</span>
                    <input type="checkbox" id="gu-toggle-hidden" ${showHidden ? 'checked' : ''} style="accent-color:#0b57d0; transform:scale(1.2); cursor:pointer;">
                </div>

                <button id="gu-save-settings" class="gu-btn-action">${t('save')}</button>

                <hr style="border:0; border-top:1px solid #333; margin:20px 0;">

                <span class="gu-input-label" style="text-align:left;">Sauvegardes & Restauration</span>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button id="gu-export" class="gu-btn-action" style="background:#333; margin:0;">${t('export_data')}</button>
                    <button id="gu-import" class="gu-btn-action" style="background:#333; margin:0;">${t('import_data')}</button>
                </div>
                <input type="file" id="gu-import-file" style="display:none" accept=".json">

                <div id="gu-backup-list" style="margin-top:15px; background:#111; border-radius:8px; text-align:left; max-height:150px; overflow-y:auto;">
                    <div style="padding:10px; color:#666; text-align:center;">Chargement...</div>
                </div>

                <p style="color:#666; font-size:12px; margin-top:20px;">Gemini Organizer v2.3</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // --- LOGIQUE ZOOM 1 : TEXTE ---
    const sliderText = document.getElementById('gu-zoom-text-slider');
    const valText = document.getElementById('gu-zoom-text-val');
    sliderText.oninput = () => {
        const val = sliderText.value;
        valText.innerText = `${val}%`;
        document.documentElement.style.setProperty('--gu-zoom-text', val / 100);
        localStorage.setItem('gu_zoom_text_level', val);
    };

    // --- LOGIQUE ZOOM 2 : UI ---
    const sliderUI = document.getElementById('gu-zoom-ui-slider');
    const valUI = document.getElementById('gu-zoom-ui-val');
    sliderUI.oninput = () => {
        const val = sliderUI.value;
        valUI.innerText = `${val}%`;
        document.documentElement.style.setProperty('--gu-zoom-ui', val / 100);
        localStorage.setItem('gu_zoom_ui_level', val);
    };

    // --- LOGIQUE EXISTANTE ---
    const langSelect = document.getElementById('gu-language-select');
    chrome.storage.local.get([LANG_STORAGE_KEY], (res) => {
        langSelect.value = res[LANG_STORAGE_KEY] || 'en';
    });

    document.getElementById('gu-save-settings').onclick = () => {
        const newLang = langSelect.value;
        currentLanguage = newLang;
        chrome.storage.local.set({ [LANG_STORAGE_KEY]: newLang }, () => {
            refreshMainButtons();
            refreshUI();
            modal.remove();
        });
    };

    const toggleHidden = document.getElementById('gu-toggle-hidden');
    toggleHidden.onchange = () => {
        if(toggleHidden.checked) document.body.classList.add('gu-show-archived');
        else document.body.classList.remove('gu-show-archived');
        localStorage.setItem('gu_show_archived', toggleHidden.checked);
    };

    const backupList = document.getElementById('gu-backup-list');
    Storage.getBackups(backups => {
        let html = '';
        const downloadBtn = (type, idx) =>
            `<button class="gu-backup-btn dl-btn" data-type="${type}" data-idx="${idx}" style="background:#444; margin-right:5px;" title="Download JSON">⬇</button>`;

        if(backups.safety) {
            html += `<div class="gu-backup-row" style="border-left:3px solid orange; background:#2a2b2e;">
                <span>⚠️ Auto-Save <br><small style="color:#888">${backups.safety.displayDate || backups.safety.date}</small></span>
                <div>${downloadBtn('safety', 0)}<button class="gu-backup-btn restore-btn" data-type="safety">${t('restore')}</button></div>
            </div>`;
        }
        if(backups.regular && backups.regular.length > 0) {
            backups.regular.forEach((bk, i) => {
                html += `<div class="gu-backup-row">
                    <span>Backup ${i+1} <br><small style="color:#888">${bk.displayDate || bk.date}</small></span>
                    <div>${downloadBtn('regular', i)}<button class="gu-backup-btn restore-btn" data-idx="${i}">${t('restore')}</button></div>
                </div>`;
            });
        } else if (!backups.safety) {
                html = `<div style="padding:10px; color:#666; text-align:center;">${t('empty-backup-list')}</div>`;
        }
        backupList.innerHTML = html;

        backupList.querySelectorAll('.dl-btn').forEach(btn => {
            btn.onclick = () => {
                const type = btn.getAttribute('data-type');
                const idx = btn.getAttribute('data-idx');
                const backupItem = type === 'safety' ? backups.safety : backups.regular[idx];
                if(backupItem && backupItem.data) {
                    const blob = new Blob([JSON.stringify(backupItem.data, null, 2)], {type:'application/json'});
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `gemini_backup_${type}_${idx}.json`; a.click();
                }
            };
        });

        backupList.querySelectorAll('.restore-btn').forEach(btn => {
            btn.onclick = () => {
                if(confirm(t('confirm-backup-restore'))) {
                    const type = btn.getAttribute('data-type');
                    const idx = btn.getAttribute('data-idx');
                    const dataToRestore = type === 'safety' ? backups.safety : backups.regular[idx];
                    if(dataToRestore) {
                        Storage.restoreBackup(dataToRestore, () => { refreshUI(); alert("Restauration réussie !"); modal.remove(); });
                    }
                }
            };
        });
    });

    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    document.getElementById('gu-export').onclick = () => {
        Storage.getData(d => {
            const b = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
            const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `gemini_backup_${user}.json`; a.click();
        });
    };
    document.getElementById('gu-import').onclick = () => document.getElementById('gu-import-file').click();
    document.getElementById('gu-import-file').onchange = (e) => {
        const r = new FileReader();
        r.onload = ev => {
            try {
                const d = JSON.parse(ev.target.result);
                if(confirm(t('overwrite_confirm') || "Overwrite data?")) {
                    Storage.createBackup('safety');
                    Storage.saveData(d, refreshUI);
                    modal.remove();
                }
            } catch(err) { alert(t('invalid_json_alert') || "Invalid JSON"); }
        };
        r.readAsText(e.target.files[0]);
    };
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

export function showAdvancedTagMenu(e, chat, folders) {
    const existing = document.getElementById('gu-tag-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'gu-tag-modal';
    modal.className = 'gu-modal-overlay';
    let activeHtml = `<div class="gu-active-tags-area">`;
    if (chat.tags && chat.tags.length > 0) {
        chat.tags.forEach((tag, i) => {
            const txt = typeof tag === 'object' ? tag.text : tag;
            const col = typeof tag === 'object' ? tag.color : stringToColor(txt);
            activeHtml += `<div class="gu-active-tag-chip" style="border:1px solid ${col}" data-idx="${i}">
                <span style="width:8px; height:8px; border-radius:50%; background:${col}"></span>${txt} <span style="margin-left:4px; font-weight:bold">×</span>
            </div>`;
        });
    } else { activeHtml += `<span style="color:#666; font-size:12px; padding:5px;">${t('no_tags_yet')}</span>`; }
    activeHtml += `</div>`;
    let colorHtml = `<div class="gu-color-picker-row">`;
    TAG_COLORS.forEach((c, i) => { colorHtml += `<div class="gu-color-choice ${i===0?'selected':''}" style="background:${c}" data-col="${c}"></div>`; });
    colorHtml += `</div>`;
    const library = getLibraryTags(folders);
    const currentTagTexts = (chat.tags || []).map(t => typeof t === 'object' ? t.text : t);
    const available = library.filter(t => !currentTagTexts.includes(t.text));
    let libraryHtml = `<div class="gu-tag-library"><span class="gu-input-label">${t('library_label')}</span><div class="gu-available-tags-list">`;
    if(available.length > 0) { available.forEach(t => { libraryHtml += `<div class="gu-tag-option" data-text="${t.text}" data-col="${t.color}"><span class="gu-tag-dot" style="background:${t.color}"></span>${t.text}</div>`; }); }
    libraryHtml += `</div></div>`;
    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>${t('manage_tags_title')}</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body">
                <span class="gu-input-label">${t('active_tags_label')}</span>
                ${activeHtml}
                <span class="gu-input-label" style="margin-top:10px;">${t('add_new_tag')}</span>
                <input type="text" id="gu-new-tag-name" class="gu-tag-input" placeholder="${t('tag_name_placeholder')}" autofocus>
                ${colorHtml}
                <button id="gu-submit-tag" class="gu-btn-action">${t('add_tag')}</button>
                ${libraryHtml}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.querySelectorAll('.gu-active-tag-chip').forEach(el => {
        el.onclick = () => {
            chat.tags.splice(parseInt(el.getAttribute('data-idx')), 1);
            Storage.saveData(folders, refreshUI);
            modal.remove();
            showAdvancedTagMenu(e, chat, folders);
        };
    });
    let selectedColor = TAG_COLORS[0];
    modal.querySelectorAll('.gu-color-choice').forEach(dot => {
        dot.onclick = () => {
            modal.querySelectorAll('.gu-color-choice').forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            selectedColor = dot.getAttribute('data-col');
        };
    });
    const doAdd = (text, color) => {
        if (!text) return;
        if (!chat.tags) chat.tags = [];
        chat.tags.push({ text: text, color: color });
        Storage.saveData(folders, refreshUI);
        modal.remove();
    };
    modal.querySelector('#gu-submit-tag').onclick = () => doAdd(modal.querySelector('#gu-new-tag-name').value.trim(), selectedColor);
    modal.querySelector('#gu-new-tag-name').onkeydown = (ev) => { if(ev.key === 'Enter') modal.querySelector('#gu-submit-tag').click(); };
    modal.querySelectorAll('.gu-tag-option').forEach(opt => { opt.onclick = () => doAdd(opt.getAttribute('data-text'), opt.getAttribute('data-col')); });
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

function showMoveMenu(e, type, data) {
    const existing = document.getElementById('gu-move-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.id = 'gu-move-menu';
    menu.className = 'gu-context-menu';

    menu.style.top = `${e.clientY + 10}px`;
    menu.style.left = `${e.clientX - 100}px`;

    const loadFunc = type === 'chat' ? Storage.getData : Storage.getPromptFolders;
    const saveFunc = type === 'chat' ? Storage.saveData : Storage.savePromptFolders;

    loadFunc(folders => {
        let html = `<div class="gu-context-header">Move to...</div>`;
        folders.forEach((f, idx) => {
            if (idx === data.folderIdx) return;
            html += `<div class="gu-context-item" data-idx="${idx}">${f.emoji} ${f.name}</div>`;
        });
        menu.innerHTML = html;
        document.body.appendChild(menu);

        menu.querySelectorAll('.gu-context-item').forEach(item => {
            item.onclick = () => {
                const targetFolderIdx = parseInt(item.getAttribute('data-idx'));
                const { folderIdx, chatIdx, isReorg, refreshCallback } = data;

                const sourceFolder = folders[folderIdx];
                const targetFolder = folders[targetFolderIdx];

                if (sourceFolder && targetFolder) {
                    const sourceList = type === 'chat' ? sourceFolder.chats : sourceFolder.prompts;
                    const targetList = type === 'chat' ? targetFolder.chats : targetFolder.prompts;

                    const [movedItem] = sourceList.splice(chatIdx, 1);
                    targetList.push(movedItem);

                    saveFunc(folders, () => {
                        refreshUI();
                        if (type !== 'chat') Storage.getPromptFolders(renderPromptsUI);

                        if (isReorg && refreshCallback) {
                            refreshCallback();
                        }
                    });
                }
                menu.remove();
            };
        });
    });

    const closeMenu = (ev) => { if (!menu.contains(ev.target) && ev.target !== e.target) menu.remove(); };
    setTimeout(() => document.addEventListener('click', closeMenu, {once:true}), 100);
}

export function injectButtonsInNativeList(folders) {
    const archivedSet = new Set();
    folders.forEach(f => f.chats.forEach(c => archivedSet.add(c.url)));

    const conversationItems = Array.from(document.querySelectorAll('div[data-test-id="conversation"]'));

    conversationItems.forEach(item => {
        let chatId = null;

        // Extraction ID via jslog
        const jslog = item.getAttribute('jslog');
        if (jslog) {
            const match = jslog.match(/"(c_[^"]+)"/);
            if (match) {
                // Nettoyage de l'ID (retrait du préfixe c_)
                chatId = match[1].replace(/^c_/, '');
            }
        }

        // Fallback lien
        if (!chatId) {
            const link = item.closest('a');
            if (link && link.href.includes('/app/')) {
                chatId = link.href.split('/').pop().replace(/^c_/, '');
            }
        }

        if (!chatId) return;

        const fullUrl = `https://gemini.google.com/app/${chatId}`;
        let title = "Conversation";
        const titleEl = item.querySelector('.conversation-title');
        if (titleEl) title = titleEl.innerText.trim();

// GESTION ARCHIVAGE
        const isArchived = archivedSet.has(fullUrl);
        if (isArchived) {
            item.classList.add('gu-archived-item');
            // Si archivé, on ne met PAS le bouton d'ajout pour éviter les doublons
            // On peut optionnellement mettre une icône "Check" pour montrer que c'est fait
            if (item.querySelector('.gu-float-add')) item.querySelector('.gu-float-add').remove();
            return;
        } else {
            item.classList.remove('gu-archived-item');
        }

        // INJECTION DU BOUTON "+" (Seulement si NON archivé)
        let addButton = item.querySelector('.gu-float-add');
        if (!addButton) {
            if (getComputedStyle(item).position === 'static') item.style.position = 'relative';

            addButton = document.createElement('div');
            addButton.className = 'gu-float-add';
            addButton.innerText = '+';
            addButton.title = "Add to folder";
            addButton.style.right = '40px';

            item.appendChild(addButton);

            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                Storage.getData(currentFolders => {
                    if (currentFolders.length === 0) {
                        alert(t('no_folder_alert'));
                        return;
                    }
                    showFolderMenu(e, currentFolders, title, fullUrl);
                });
            });

            addButton.addEventListener('mouseenter', () => item.classList.add('gu-hover-force'));
            addButton.addEventListener('mouseleave', () => item.classList.remove('gu-hover-force'));
        }
    });
}

// Fonction manquante pour gérer le clic sur le bouton "+"
function showFolderMenu(e, folders, title, url) {
    // Supprime un éventuel menu existant
    const existing = document.getElementById('gu-folder-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'gu-folder-menu';
    menu.className = 'gu-context-menu';

    // Positionnement
    menu.style.top = `${e.clientY + 10}px`;
    menu.style.left = `${e.clientX - 150}px`;

    let html = `<div class="gu-context-header">Add to...</div>`;
    folders.forEach((f, idx) => {
        html += `<div class="gu-context-item" data-idx="${idx}">${f.emoji} ${f.name}</div>`;
    });

    // Option pour créer un nouveau dossier directement
    html += `<div class="gu-context-item create-new" style="border-top:1px solid #333; color:#a8c7fa;">+ New Folder</div>`;

    menu.innerHTML = html;
    document.body.appendChild(menu);

    // Gestion des clics sur les dossiers existants
    menu.querySelectorAll('.gu-context-item:not(.create-new)').forEach(item => {
        item.onclick = () => {
            const idx = parseInt(item.getAttribute('data-idx'));
            if (folders[idx]) {
                // On ajoute le chat au dossier
                folders[idx].chats.push({ title: title, url: url });
                Storage.saveData(folders, () => {
                    refreshUI(); // Met à jour le panel
                    // On masque la ligne dans la liste native pour montrer que c'est fait
                    const nativeRow = e.target.closest('div[data-test-id="conversation"]');
                    if(nativeRow) nativeRow.style.display = 'none';
                });
            }
            menu.remove();
        };
    });

    // Gestion du clic sur "New Folder"
    menu.querySelector('.create-new').onclick = () => {
        menu.remove();
        showCreateFolderModal(null); // Oouvre la modale de création
    };

    // Fermeture au clic ailleurs
    const closeMenu = (ev) => {
        if (!menu.contains(ev.target) && ev.target !== e.target) menu.remove();
    };
    setTimeout(() => document.addEventListener('click', closeMenu, {once:true}), 100);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Sauvegarde différée (attend 1s après le dernier clic pour écrire sur le disque)
const saveFoldersDebounced = debounce((data) => Storage.saveData(data), 1000);
const savePromptsDebounced = debounce((data) => Storage.savePromptFolders(data), 1000);

// --- TUTORIAL ---
export function showTutorialModal(onClose) {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
    modal.innerHTML = `
        <div class="gu-modal-content" style="max-width: 550px;">
            <h1 class="gu-modal-h1" style="font-size: 20px; font-weight:bold; margin-bottom:15px; padding:0 20px; margin-top:20px;">${t('tutorial_welcome')}</h1>
            <p class="gu-modal-p" style="padding:0 20px; margin-bottom:10px;">${t('tutorial_upgrade')}</p>
            <div class="gu-modal-steps" style="padding:0 20px; display:flex; flex-direction:column; gap:10px;">
                <div class="gu-modal-step" style="display:flex; gap:10px; align-items:center;"><div class="gu-step-icon">↔️</div><div><b>Wide Mode</b>: ${t('tutorial_wide_mode')}</div></div>
                <div class="gu-modal-step" style="display:flex; gap:10px; align-items:center;"><div class="gu-step-icon">⌨️</div><div><b>Hotkeys</b>: ${t('tutorial_hotkeys')}</div></div>
                <div class="gu-modal-step" style="display:flex; gap:10px; align-items:center;"><div class="gu-step-icon">🍞</div><div><b>Toasts</b>: ${t('tutorial_toasts')}</div></div>
            </div>
            <div style="padding:20px;">
                <button id="gu-close-tutorial" class="gu-btn-action">${t('tutorial_button')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('gu-close-tutorial').onclick = () => {
        modal.remove();
        if(onClose) onClose();
    };
}

export function injectCodeButtons() {
    // On cible les boutons "Copier" existants dans les blocs de code
    // Gemini utilise souvent aria-label="Copier le code" ou "Copy code"
    const copyButtons = document.querySelectorAll('button[aria-label*="Copier"], button[aria-label*="Copy"]');

    copyButtons.forEach(copyBtn => {
        // On remonte au conteneur parent (la barre d'outils du bloc de code)
        const toolbar = copyBtn.parentNode;

        // Vérification anti-doublon
        if (!toolbar || toolbar.querySelector('.gu-code-dl-btn')) return;

        // On vérifie qu'on est bien dans un "code-block" (et pas juste un bouton copier isolé)
        const codeBlock = copyBtn.closest('code-block') || copyBtn.closest('.code-block');
        if (!codeBlock) return;

        // Création du bouton Télécharger
        const btn = document.createElement('button');
        // On copie les classes du bouton "Copier" pour avoir le même style natif (rond, hover, etc.)
        btn.className = copyBtn.className + ' gu-code-dl-btn';
        btn.style.marginLeft = "4px"; // Petit espace
        btn.title = "Télécharger le fichier";

        // Icône de téléchargement (SVG propre)
        btn.innerHTML = `<span class="mat-mdc-button-touch-target"></span><svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>`;

        // Action au clic
        btn.onclick = () => {
            // 1. Récupérer le contenu du code
            // Gemini met le code dans une balise <code> ou <pre> à l'intérieur du bloc
            const codeElement = codeBlock.querySelector('code') || codeBlock.querySelector('pre');
            const codeContent = codeElement ? codeElement.innerText : "";

            if (!codeContent) return;

            // 2. Détecter l'extension du fichier via le header du bloc
            // Le header contient souvent le nom du langage (ex: "JSON", "Python")
            let ext = "txt";
            const header = codeBlock.innerText.split('\n')[0].toLowerCase(); // On prend la première ligne visible

            if (header.includes('json')) ext = 'json';
            else if (header.includes('javascript') || header.includes('js')) ext = 'js';
            else if (header.includes('python') || header.includes('py')) ext = 'py';
            else if (header.includes('html')) ext = 'html';
            else if (header.includes('css')) ext = 'css';
            else if (header.includes('java') && !header.includes('script')) ext = 'java';
            else if (header.includes('c++') || header.includes('cpp')) ext = 'cpp';
            else if (header.includes('c#')) ext = 'cs';
            else if (header.includes('php')) ext = 'php';
            else if (header.includes('sql')) ext = 'sql';
            else if (header.includes('bash') || header.includes('sh')) ext = 'sh';
            else if (header.includes('markdown') || header.includes('md')) ext = 'md';

            // 3. Lancer le téléchargement
            const blob = new Blob([codeContent], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gemini_code.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        };

        // Injection : On place le bouton juste avant le bouton Copier
        toolbar.insertBefore(btn, copyBtn);
    });
}

export function switchTab(tabName) {
    const panel = document.getElementById('gu-floating-panel');
    if (!panel) return;

    // 1. Reset des états actifs
    panel.querySelectorAll('.gu-tab-btn').forEach(b => b.classList.remove('active'));
    panel.querySelectorAll('.gu-panel-view').forEach(p => p.classList.remove('active'));

    // Sélecteur pour la barre de recherche (pour pouvoir la cacher/montrer)
    const searchRow = panel.querySelector('#gu-content-wrapper .gu-search-row');

    if (tabName === 'folders') {
        // --- ONGLET DOSSIERS ---
        panel.querySelector('#gu-tab-folders').classList.add('active');
        panel.querySelector('#gu-content-area').classList.add('active');

        if(searchRow) searchRow.style.display = 'block';

        panel.querySelector('#gu-add-folder-btn').style.display = 'flex';
        panel.querySelector('#gu-btn-bulk').style.display = 'flex';
        panel.querySelector('#gu-btn-reorganize').style.display = 'flex';
        panel.querySelector('#gu-search-input').placeholder = t('search_folders_placeholder');

    } else if (tabName === 'prompts') {
        // --- ONGLET PROMPTS ---
        panel.querySelector('#gu-tab-prompts').classList.add('active');
        panel.querySelector('#gu-prompts-panel').classList.add('active');

        if(searchRow) searchRow.style.display = 'block';

        panel.querySelector('#gu-add-folder-btn').style.display = 'none';
        panel.querySelector('#gu-btn-bulk').style.display = 'none';
        panel.querySelector('#gu-btn-reorganize').style.display = 'flex';
        panel.querySelector('#gu-search-input').placeholder = t('search_prompts_placeholder');

        Storage.getPromptFolders(promptFolders => {
            renderPromptsUI(promptFolders);
        });

    } else if (tabName === 'notes') {
        // --- ONGLET NOTES (NOUVEAU) ---
        panel.querySelector('#gu-tab-notes').classList.add('active');
        panel.querySelector('#gu-notes-panel').classList.add('active');

        // On cache la barre de recherche pour les notes
        if(searchRow) searchRow.style.display = 'none';

        // On cache les boutons inutiles
        panel.querySelector('#gu-add-folder-btn').style.display = 'none';
        panel.querySelector('#gu-btn-bulk').style.display = 'none';
        panel.querySelector('#gu-btn-reorganize').style.display = 'none';

        renderNotesUI();
    }
}

// --- SLASH COMMANDS ---
// --- SLASH COMMANDS ---
export function handleSlashCommand(inputElement) {
    try {
        let menu = document.getElementById('gu-slash-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'gu-slash-menu';
            document.body.appendChild(menu);
        }

        if (!inputElement) return;

        const rawVal = inputElement.tagName === 'TEXTAREA' ? inputElement.value : (inputElement.innerText || "");
        const lines = rawVal.split('\n');
        const lastLine = lines[lines.length - 1];
        const val = lastLine ? lastLine.trim() : "";

        if (!val || !val.startsWith('/') || val.substring(1).includes(' ')) {
            menu.style.display = 'none';
            return;
        }

        const query = val.substring(1).toLowerCase();

        Storage.getPromptFolders(promptFolders => {
            if (!Array.isArray(promptFolders)) {
                menu.style.display = 'none';
                return;
            }

            let matches = [];

            if ('save'.includes(query)) matches.push({ type: 'cmd', label: 'save', desc: 'Save Chat' });
            if ('folder'.includes(query)) matches.push({ type: 'cmd', label: 'folder', desc: 'New Folder' });
            if ('prompt'.includes(query)) matches.push({ type: 'cmd', label: 'prompt', desc: 'Create Prompt' });

            promptFolders.forEach((folder, fIdx) => {
                if (!folder || !Array.isArray(folder.prompts)) return;
                folder.prompts.forEach((p, pIdx) => {
                    if (p && p.name && p.name.toLowerCase().includes(query)) {
                        matches.push({
                            type: 'user_prompt',
                            label: p.name,
                            content: p.content || '',
                            desc: 'User Prompt',
                            fIdx: fIdx,
                            pIdx: pIdx
                        });
                    }
                });
            });

            if (matches.length === 0) {
                menu.style.display = 'none';
                return;
            }

            const rect = inputElement.getBoundingClientRect();
            menu.style.display = 'flex';
            menu.style.left = `${rect.left + 20}px`;

            if (window.innerHeight - rect.bottom > 200) {
                menu.style.top = `${rect.bottom + 10}px`;
                menu.style.bottom = 'auto';
            } else {
                menu.style.bottom = `${window.innerHeight - rect.top + 10}px`;
                menu.style.top = 'auto';
            }

            menu.innerHTML = matches.map((m, i) => `
                <div class="gu-slash-item" data-idx="${i}">
                    <div><span class="gu-slash-cmd">/${m.label}</span> <small style="color:#888; margin-left:10px;">${m.desc}</small></div>
                </div>
            `).join('');

            const firstItem = menu.querySelector('.gu-slash-item');
            if (firstItem) firstItem.classList.add('selected');

            menu.querySelectorAll('.gu-slash-item').forEach((item, i) => {
                item.onclick = () => {
                    executeCommand(matches[i], inputElement);
                };
                item.onmouseenter = () => {
                    const selected = menu.querySelector('.gu-slash-item.selected');
                    if (selected) selected.classList.remove('selected');
                    item.classList.add('selected');
                };
            });
        });

    } catch (err) {
        console.error("Gemini Organizer Slash Command Error:", err);
        const menu = document.getElementById('gu-slash-menu');
        if (menu) menu.style.display = 'none';
    }

    // Fonction interne pour exécuter la commande
    function executeCommand(match, input) {
        try {
            if (input.tagName === 'TEXTAREA') input.value = '';
            else input.innerText = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            if (match.type === 'cmd') {
                if (match.label === 'save') {
                    const currentUrl = window.location.href;
                    const title = document.title.replace('Gemini', '').trim() || "Chat";
                    Storage.getData(folders => {
                        const fakeEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 };
                        showFolderMenu(fakeEvent, folders, title, currentUrl);
                    });
                } else if (match.label === 'folder') {
                    showCreateFolderModal();
                } else if (match.label === 'prompt') {
                    showCreatePromptModal();
                }
            } else if (match.type === 'user_prompt') {
                if (match.content && match.content.includes('{{')) {
                    handlePromptClick(match.content, match.fIdx, match.pIdx);
                } else {
                    injectPromptToGemini(match.content || '');
                }
            }
        } catch (e) {
            console.error("Error executing command:", e);
        }

        const menu = document.getElementById('gu-slash-menu');
        if (menu) menu.style.display = 'none';
    }
}

// --- SELECTION & NOTES (SURLIGNAGE) ---

let selectionTimer = null;

export function initSelectionListener() {
    // 1. Création du menu s'il n'existe pas
    if (!document.getElementById('gu-highlight-menu')) {
        const menu = document.createElement('div');
        menu.id = 'gu-highlight-menu';

        // CSS injecté dynamiquement pour le style mobile/desktop
        const style = document.createElement('style');
        style.textContent = `
            #gu-highlight-menu {
                position: fixed; z-index: 999999;
                background: #1e1f20; border: 1px solid #444; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 8px;
                display: none; gap: 10px; align-items: center;
                animation: gu-fadein 0.2s;
                /* Comportement par défaut (Desktop) */
                transform: translate(-50%, -120%); /* Centré au-dessus */
            }

            /* Boutons de couleur */
            .gu-hl-btn {
                width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
                border: 2px solid transparent; transition: transform 0.2s;
                flex-shrink: 0;
            }
            .gu-hl-btn:hover { transform: scale(1.2); border-color: white; }

            /* --- STYLE MOBILE SPÉCIFIQUE --- */
            @media (max-width: 768px) {
                #gu-highlight-menu {
                    /* Barre fixe en bas sur mobile */
                    top: auto !important;
                    bottom: 80px !important; /* Au-dessus de la barre de saisie */
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: auto;
                    border-radius: 50px;
                    padding: 10px 20px;
                    background: rgba(30, 31, 32, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .gu-hl-btn {
                    width: 36px; height: 36px; /* Plus gros pour le doigt */
                }
            }
        `;
        document.head.appendChild(style);

        menu.innerHTML = `
            <div class="gu-hl-btn gu-bg-red" data-color="red" title="Red"></div>
            <div class="gu-hl-btn gu-bg-blue" data-color="blue" title="Blue"></div>
            <div class="gu-hl-btn gu-bg-green" data-color="green" title="Green"></div>
            <div class="gu-hl-btn gu-bg-yellow" data-color="yellow" title="Yellow"></div>
            <div id="gu-hl-close" style="color:#999; font-size:18px; margin-left:5px; cursor:pointer;">&times;</div>
        `;
        document.body.appendChild(menu);

        // Events des boutons
        menu.querySelectorAll('.gu-hl-btn').forEach(btn => {
            // 'mousedown' pour PC, 'touchstart' pour Mobile (réactivité immédiate)
            const action = (e) => {
                e.preventDefault();
                e.stopPropagation();
                saveSelection(btn.getAttribute('data-color'));
                menu.style.display = 'none';
            };
            btn.onmousedown = action;
            btn.ontouchstart = action;
        });

        // Bouton fermer
        const closeBtn = menu.querySelector('#gu-hl-close');
        const closeAction = (e) => {
            e.preventDefault(); e.stopPropagation();
            menu.style.display = 'none';
            // Sur mobile, on vide la sélection pour retirer le menu natif aussi
            if (window.getSelection) window.getSelection().removeAllRanges();
        };
        closeBtn.onmousedown = closeAction;
        closeBtn.ontouchstart = closeAction;
    }

    // 2. Écouteur Universel (Desktop & Mobile)
    document.addEventListener('selectionchange', () => {
        // On utilise un Timer pour attendre que l'utilisateur finisse sa sélection (Mobile)
        clearTimeout(selectionTimer);

        selectionTimer = setTimeout(() => {
            handleSelection();
        }, 800); // 800ms de délai pour laisser le temps d'ajuster les poignées sur Android
    });

    // Optimisation Desktop : Réaction immédiate au relâchement de la souris
    document.addEventListener('mouseup', () => {
        clearTimeout(selectionTimer);
        handleSelection(); // Pas de délai sur souris
    });
}
function handleSelection() {
    const menu = document.getElementById('gu-highlight-menu');
    const selection = window.getSelection();

    // Si pas de sélection ou sélection vide
    if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
        if (menu) menu.style.display = 'none';
        return;
    }

    // Ignorer si on sélectionne dans le panneau de l'extension
    if (selection.anchorNode &&
        (selection.anchorNode.parentElement.closest('#gu-floating-panel') ||
         selection.anchorNode.parentElement.closest('#gu-highlight-menu'))) {
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Vérification de sécurité (si l'élément est invisible ou hors écran)
    if (rect.width === 0 || rect.height === 0) return;

    menu.style.display = 'flex';

    // Positionnement PC (Au-dessus du texte)
    // Sur mobile, le CSS @media forcera la position en bas fixe
    menu.style.top = `${rect.top + window.scrollY}px`; // Le CSS fait le translate -120%
    menu.style.left = `${rect.left + (rect.width / 2)}px`; // Centré
}

function saveSelection(color) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text) return;

    // Tentative de surlignage visuel (Best effort)
    try {
        const range = selection.getRangeAt(0);
        // On ne surligne que si c'est simple, pour ne pas casser le DOM complexe de Gemini
        const span = document.createElement('span');
        span.className = `gu-bg-${color}`;
        span.style.borderRadius = '4px';
        span.style.padding = '0 2px';
        span.style.color = '#000'; // Texte noir pour lisibilité sur couleur

        // Cette méthode peut échouer si la sélection traverse plusieurs blocs
        range.surroundContents(span);
    } catch(e) {
        console.log("Surlignage visuel complexe ignoré (Note sauvegardée quand même)");
    }

    const chatId = window.location.href.split('/app/')[1]?.split('?')[0] || 'unknown_chat';
    const note = {
        id: Date.now().toString(),
        text: text,
        color: color,
        comment: "",
        date: new Date().toLocaleDateString()
    };

    Storage.saveHighlight(chatId, note, () => {
        const panel = document.getElementById('gu-notes-panel');
        // Si le panneau note est ouvert, on rafraîchit
        if (panel && panel.classList.contains('active')) {
            renderNotesUI();
        }
        showToast("Note Saved", "💾");

        // Sur mobile, on désélectionne pour fermer le menu natif
        window.getSelection().removeAllRanges();
    });
}

export function renderNotesUI(filterColor = 'all') {
    const container = document.getElementById('gu-notes-list');
    if (!container) return;

    const chatId = window.location.href.split('/app/')[1]?.split('?')[0];
    if (!chatId) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">Open a chat to see notes.</div>`;
        return;
    }

    Storage.getHighlights(chatId, (notes) => {
        container.innerHTML = '';

        const filtered = filterColor === 'all' ? notes : notes.filter(n => n.color === filterColor);

        if (filtered.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">${t('no_notes')}</div>`;
            return;
        }

        filtered.reverse().forEach(note => {
            const card = document.createElement('div');
            card.className = 'gu-note-card';

            // Couleurs de bordure
            let borderColor = '#666';
            if(note.color === 'red') borderColor = '#ffadad';
            if(note.color === 'blue') borderColor = '#a0c4ff';
            if(note.color === 'green') borderColor = '#caffbf';
            if(note.color === 'yellow') borderColor = '#fdffb6';
            card.style.borderLeftColor = borderColor;

            // Logique "Afficher plus"
            const isLongText = note.text.length > 150;
            const readMoreBtnHtml = isLongText
                ? `<button class="gu-read-more-btn">${t('read_more')}</button>`
                : '';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-size:10px; color:#888;">${note.date}</span>
                    <span class="gu-icon-btn del-note" style="width:16px; height:16px; font-size:12px; color:#ff8989;">×</span>
                </div>

                <div class="gu-note-text" title="Click expand">"${note.text.replace(/"/g, '&quot;')}"</div>
                ${readMoreBtnHtml}

                <textarea class="gu-note-comment" placeholder="${t('note_placeholder')}">${note.comment || ''}</textarea>
            `;

            if (isLongText) {
                const btn = card.querySelector('.gu-read-more-btn');
                const txtDiv = card.querySelector('.gu-note-text');
                btn.onclick = () => {
                    txtDiv.classList.toggle('expanded');
                    btn.innerText = txtDiv.classList.contains('expanded') ? t('read_less') : t('read_more');
                };
            }

            const area = card.querySelector('textarea');
            area.addEventListener('input', () => {
                Storage.updateHighlightComment(chatId, note.id, area.value);
            });

            card.querySelector('.del-note').onclick = () => {
                if(confirm(t('delete_note_confirm'))) {
                    Storage.deleteHighlight(chatId, note.id, () => renderNotesUI(filterColor));
                }
            };

            container.appendChild(card);
        });
    });
}

export function initZoom() {
    const savedText = localStorage.getItem('gu_zoom_text_level');
    const savedUI = localStorage.getItem('gu_zoom_ui_level');

    if (savedText) {
        document.documentElement.style.setProperty('--gu-zoom-text', savedText / 100);
    }
    if (savedUI) {
        document.documentElement.style.setProperty('--gu-zoom-ui', savedUI / 100);
    }
}

function showReorganizeModal(type = 'chat') {
    const existing = document.getElementById('gu-reorg-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'gu-reorg-modal';
    modal.className = 'gu-modal-overlay';

    modal.innerHTML = `
        <div class="gu-modal-content" style="width: 500px; max-width: 90vw;">
            <div class="gu-modal-header">
                <span>Reorganize (${type === 'chat' ? 'Folders' : 'Prompts'})</span>
                <span class="gu-menu-close">×</span>
            </div>
            <div class="gu-modal-body">
                <div class="gu-reorg-container" id="gu-reorg-list-container"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    // Fonction principale qui charge les données ET affiche
    const loadAndRender = () => {
        if (type === 'chat') {
            Storage.getData(folders => render(folders));
        } else {
            Storage.getPromptFolders(folders => render(folders));
        }
    };

    const render = (dataFolders) => {
        const container = modal.querySelector('#gu-reorg-list-container');
        container.innerHTML = '';

        dataFolders.forEach((folder, fIdx) => {
            const fDiv = document.createElement('div');
            fDiv.className = 'gu-reorg-folder';

            const header = document.createElement('div');
            header.className = 'gu-reorg-header';
            header.innerHTML = `
                <span style="display:flex;align-items:center;gap:5px;">${folder.emoji || '📁'} ${folder.name}</span>
                <div class="gu-reorg-controls">
                    <button class="gu-btn-ctrl up-f" title="Move Folder Up">↑</button>
                    <button class="gu-btn-ctrl down-f" title="Move Folder Down">↓</button>
                </div>
            `;

            header.querySelector('.up-f').onclick = () => {
                if (fIdx > 0) {
                    [dataFolders[fIdx], dataFolders[fIdx - 1]] = [dataFolders[fIdx - 1], dataFolders[fIdx]];
                    saveAndRefresh(dataFolders);
                }
            };
            header.querySelector('.down-f').onclick = () => {
                if (fIdx < dataFolders.length - 1) {
                    [dataFolders[fIdx], dataFolders[fIdx + 1]] = [dataFolders[fIdx + 1], dataFolders[fIdx]];
                    saveAndRefresh(dataFolders);
                }
            };

            fDiv.appendChild(header);

            const items = type === 'chat' ? folder.chats : folder.prompts;
            const itemsList = document.createElement('div');
            itemsList.className = 'gu-reorg-list';

            items.forEach((item, iIdx) => {
                const row = document.createElement('div');
                row.className = 'gu-reorg-item';
                const itemName = type === 'chat' ? item.title : item.name;

                row.innerHTML = `
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:250px;">${itemName}</span>
                    <div class="gu-reorg-controls">
                        <button class="gu-btn-ctrl move-i" title="Move to another folder">➜</button>
                        <button class="gu-btn-ctrl up-i">↑</button>
                        <button class="gu-btn-ctrl down-i">↓</button>
                    </div>
                `;

                row.querySelector('.up-i').onclick = () => {
                    if (iIdx > 0) {
                        [items[iIdx], items[iIdx - 1]] = [items[iIdx - 1], items[iIdx]];
                        saveAndRefresh(dataFolders);
                    }
                };
                row.querySelector('.down-i').onclick = () => {
                    if (iIdx < items.length - 1) {
                        [items[iIdx], items[iIdx + 1]] = [items[iIdx + 1], items[iIdx]];
                        saveAndRefresh(dataFolders);
                    }
                };

                // CORRECTION ICI : On passe loadAndRender comme callback
                row.querySelector('.move-i').onclick = (e) => {
                    showMoveMenu(e, type, {
                        folderIdx: fIdx,
                        chatIdx: iIdx,
                        isReorg: true,
                        refreshCallback: loadAndRender // <-- C'est ça la clé !
                    });
                };

                itemsList.appendChild(row);
            });

            fDiv.appendChild(itemsList);
            container.appendChild(fDiv);
        });
    };

    function saveAndRefresh(data) {
        if (type === 'chat') {
            Storage.saveData(data, () => {
                render(data); // On re-rend la version modifiée localement
                refreshUI();  // On met à jour l'UI principale derrière
            });
        } else {
            Storage.savePromptFolders(data, () => {
                render(data);
                Storage.getPromptFolders(renderPromptsUI);
            });
        }
    }

    // Premier chargement
    loadAndRender();
}
function exportChatToMarkdown() {
    let markdown = '';
    const chatContainer = document.querySelector('main');
    if (!chatContainer) return alert("Chat content not found.");

    const messages = chatContainer.querySelectorAll('user-query, model-response');

    messages.forEach(msg => {
        const isUser = msg.tagName.toLowerCase() === 'user-query';
        const author = isUser ? 'User' : 'Gemini';
        const text = msg.innerText || msg.textContent;
        markdown += `**${author}:**\n\n${text}\n\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini-chat.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- INIT PANEL ---
// ui.js - initPanel mis à jour

export function initPanel() {
    if (document.getElementById('gu-floating-panel')) return;

    // Injection des styles si nécessaire
    if (!document.getElementById('gu-global-styles')) {
        const style = document.createElement('style');
        style.id = 'gu-global-styles';
        // On définit les variables CSS pour le zoom
        style.textContent = CSS_STYLES + `
            :root {
                --gu-zoom-text: 1;
                --gu-zoom-ui: 1;
            }
            message-content .markdown-main-panel,
            user-query {
                zoom: var(--gu-zoom-text);
            }
            #gu-floating-panel,
            .gu-modal-overlay,
            .gu-context-menu {
                zoom: var(--gu-zoom-ui);
            }
        `;
        document.head.appendChild(style);
    }

    // Appliquer le zoom sauvegardé
    initZoom();

    // Construction du panneau
    chrome.storage.local.get([LANG_STORAGE_KEY], (res) => {
        if(res[LANG_STORAGE_KEY]) currentLanguage = res[LANG_STORAGE_KEY];

        const panel = document.createElement('div');
        panel.id = 'gu-floating-panel';

        panel.innerHTML = `
            <div class="gu-header" id="gu-header-drag">
                <div class="gu-header-group">
                    <button id="gu-btn-min" class="gu-btn-icon-head" title="Minimize">─</button>
                    <button id="gu-btn-settings" class="gu-btn-icon-head" title="${t('settings')}">⚙️</button>
                    <span id="gu-user-badge" class="gu-user-badge">...</span>
                </div>
                <div class="gu-header-group">
                    <button id="gu-btn-wide" class="gu-btn-icon-head" title="Wide Mode (Alt+W)">↔️</button>
                    <button id="gu-btn-streamer" class="gu-btn-icon-head" title="Streamer Mode (Alt+S)">👁️</button>
                    <div style="width:1px; height:16px; background:#333; margin:0 4px;"></div>
                    <button id="gu-btn-export" class="gu-btn-icon-head" title="Export Options">📥</button>
                    <button id="gu-btn-reorganize" class="gu-btn-icon-head" title="Reorganize / Move">🔁</button>
                    <button id="gu-btn-bulk" class="gu-btn-icon-head" title="${t('bulk_organize_title')}">✅</button>
                </div>
            </div>

            <div class="gu-tabs-header">
                <button id="gu-tab-folders" class="gu-tab-btn active">${t('folders_tab')}</button>
                <button id="gu-tab-prompts" class="gu-tab-btn">${t('prompts_tab')}</button>
                <button id="gu-tab-notes" class="gu-tab-btn">${t('notes_tab')}</button>
            </div>

            <div id="gu-content-wrapper">
                <div class="gu-search-row">
                    <div style="display:flex; gap:8px; align-items:center;">
                        <input type="text" id="gu-search-input" class="gu-search-box" placeholder="${t('search_folders_placeholder')}">
                        <button id="gu-add-folder-btn" class="gu-btn-ctrl" style="width:90px; background:#0b57d0; border:none; border-radius: 8px;">
                            <span>+</span> ${t('newFolder')}
                        </button>
                    </div>
                </div>

                <div id="gu-content-area" class="gu-panel-view active"></div>

                <div id="gu-prompts-panel" class="gu-panel-view">
                    <div style="padding:10px; border-bottom:1px solid #333; display:flex; gap:6px; flex-wrap:wrap;">
                        <button id="gu-add-prompt-folder-btn" class="gu-btn-action" style="background:#333; font-size:11px; margin:0; flex:1;">+ Folder</button>
                        <button id="gu-import-pack-btn" class="gu-btn-action" style="background:#2c3c63; font-size:11px; margin:0; flex:1;" title="${t('import_pack')}">📥 Import</button>
                        <button id="gu-add-prompt-btn" class="gu-btn-action" style="margin:0; flex:2; background:#254d29;">${t('new_prompt_btn')}</button>
                        <button id="gu-help-prompt-btn" class="gu-btn-icon-head" title="${t('prompt_help_title')}">❓</button>
                    </div>
                    <div id="gu-prompts-list"></div>
                    <input type="file" id="gu-import-pack-input" accept=".guop,.json" style="display:none">
                </div>

                <div id="gu-notes-panel" class="gu-panel-view">
                    <div class="gu-filter-bar">
                        <div class="gu-filter-btn all active" data-filter="all">${t('filter_all')}</div>
                        <div class="gu-filter-btn" style="background:#5c2b29" data-filter="red"></div>
                        <div class="gu-filter-btn" style="background:#2c3c63" data-filter="blue"></div>
                        <div class="gu-filter-btn" style="background:#254d29" data-filter="green"></div>
                        <div class="gu-filter-btn" style="background:#5c4615" data-filter="yellow"></div>
                    </div>
                    <div id="gu-notes-list" style="padding:10px; overflow-y:auto; flex:1;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // --- GESTION DES ÉVÉNEMENTS (DRAG & DROP, TOUCH) ---
        const header = panel.querySelector('#gu-header-drag');
        let isDragging = false, startX, startY, initialLeft, initialTop;

        // Souris
        header.onmousedown = (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') return;
            isDragging = true; startX = e.clientX; startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
            header.style.cursor = 'grabbing';
        };

        // Bouton Streamer (Clic court / Long press)
        const btnStreamer = panel.querySelector('#gu-btn-streamer');
        let longPressTimer;
        btnStreamer.onclick = toggleStreamerMode;
        btnStreamer.oncontextmenu = (e) => { e.preventDefault(); showStreamerMenu(e); };
        btnStreamer.ontouchstart = (e) => {
            longPressTimer = setTimeout(() => { e.preventDefault(); showStreamerMenu(e.touches[0]); }, 600);
        };
        btnStreamer.ontouchend = () => { clearTimeout(longPressTimer); };

        // Mouvement Souris
        document.onmousemove = (e) => {
            if (!isDragging) return;
            panel.style.left = `${initialLeft + e.clientX - startX}px`;
            panel.style.top = `${initialTop + e.clientY - startY}px`;
            panel.style.right = 'auto';
        };
        document.onmouseup = () => { isDragging = false; header.style.cursor = 'move'; };

        // Filtres Notes
        const filterBtns = panel.querySelectorAll('.gu-filter-btn');
        filterBtns.forEach(btn => {
            btn.onclick = () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderNotesUI(btn.getAttribute('data-filter'));
            };
        });

        // Boutons Header & Actions
        panel.querySelector('#gu-btn-min').onclick = () => panel.classList.toggle('minimized');
        panel.querySelector('#gu-add-folder-btn').onclick = () => showCreateFolderModal();
        panel.querySelector('#gu-add-prompt-folder-btn').onclick = () => showCreatePromptFolderModal();
        panel.querySelector('#gu-search-input').addEventListener('input', () => {
            if(panel.querySelector('#gu-tab-folders').classList.contains('active')) refreshUI();
            else Storage.getPromptFolders(renderPromptsUI);
        });
        panel.querySelector('#gu-btn-settings').onclick = showSettingsModal;
        panel.querySelector('#gu-btn-bulk').onclick = () => Storage.getData(folders => showBulkManager(folders));
        panel.querySelector('#gu-import-pack-btn').onclick = () => document.getElementById('gu-import-pack-input').click();
        document.getElementById('gu-import-pack-input').onchange = importPromptPack;
        panel.querySelector('#gu-btn-reorganize').onclick = () => {
            if (panel.querySelector('#gu-tab-folders').classList.contains('active')) showReorganizeModal('chat');
            else showReorganizeModal('prompt');
        };
        panel.querySelector('#gu-btn-export').onclick = (e) => showExportMenu(e);
        panel.querySelector('#gu-btn-wide').onclick = toggleWideMode;
        panel.querySelector('#gu-tab-folders').onclick = () => switchTab('folders');
        panel.querySelector('#gu-tab-prompts').onclick = () => switchTab('prompts');
        panel.querySelector('#gu-tab-notes').onclick = () => switchTab('notes');
        panel.querySelector('#gu-add-prompt-btn').onclick = () => showCreatePromptModal();
        panel.querySelector('#gu-help-prompt-btn').onclick = showPromptHelpModal;

        // Mobile Touch Events (Drag)
        header.ontouchstart = (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX; startY = touch.clientY;
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
        };
        document.ontouchmove = (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            panel.style.left = `${initialLeft + touch.clientX - startX}px`;
            panel.style.top = `${initialTop + touch.clientY - startY}px`;
            panel.style.right = 'auto';
            if (e.cancelable) e.preventDefault();
        };
        document.ontouchend = () => { isDragging = false; };

        refreshMainButtons();

        // --- CORRECTIF MOBILE ---
        // On force le chargement des données maintenant que le panneau est injecté.
        // Essentiel pour Firefox Android où le DOM est lent à s'actualiser.
        refreshUI();
    });
}