
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
        'prompt': 'gu-hide-prompt'
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
        header.onclick = () => { folder.isOpen = !folder.isOpen; Storage.saveData(folders, refreshUI); };

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

    // Récupérer la config
    const config = JSON.parse(localStorage.getItem('gu_streamer_config') || '{"loc":true, "content":true, "chat":true, "folder":true, "prompt":true, "mail":true}');

const options = [
        { key: 'loc', label: t('loc') },         // Cherche 'loc' dans i18n.js
        { key: 'content', label: t('content') }, // Cherche 'content'
        { key: 'mail', label: t('mail') },       // etc.
        { key: 'chat', label: t('chat') },
        { key: 'folder', label: t('folder') },
        { key: 'prompt', label: t('prompt') }
    ];

    // En-tête avec bouton de fermeture (Croix)
    let html = `
        <div class="gu-context-header" style="background:#0b57d0; color:white; display:flex; justify-content:space-between; align-items:center;">
            <span>Streamer Config</span>
            <span id="gu-close-streamer-menu" style="cursor:pointer; font-weight:bold; font-size:16px; padding:0 4px;">×</span>
        </div>
    `;

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

    // --- LOGIQUE DE FERMETURE ---
    const closeMenu = () => {
        if(menu.parentNode) menu.remove();
        document.removeEventListener('click', outsideClickListener);
    };

    // 1. Fermer via la Croix
    menu.querySelector('#gu-close-streamer-menu').onclick = (ev) => {
        ev.stopPropagation();
        closeMenu();
    };

    // 2. Fermer quand la souris quitte le menu (Mouse Leave)
    menu.onmouseleave = () => closeMenu();

    // 3. Gestion des Checkboxes
    menu.querySelectorAll('input').forEach(input => {
        input.onchange = () => {
            config[input.getAttribute('data-key')] = input.checked;
            localStorage.setItem('gu_streamer_config', JSON.stringify(config));

            if (document.body.classList.contains('gu-streamer-active')) {
                applyStreamerFilters(config);
            }
        };
    });

    // 4. Fermer au clic ailleurs (Logique corrigée)
    const outsideClickListener = (ev) => {
        if (!menu.contains(ev.target)) {
            closeMenu();
        }
    };

    // On attache l'écouteur global avec un léger délai pour éviter le clic initial
    setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
    }, 100);
}



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
        const folderMatches = folder.name.toLowerCase().includes(searchText);
        const matchingPrompts = folder.prompts.filter(prompt => {
            const nameMatch = prompt.name.toLowerCase().includes(searchText);
            const contentMatch = prompt.content.toLowerCase().includes(searchText);
            return nameMatch || contentMatch;
        });

        if (searchText && !folderMatches && matchingPrompts.length === 0) return;

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
                <span class="gu-count">${folder.prompts.length}</span>
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
        colorInput.addEventListener('change', (e) => { folder.color = e.target.value; Storage.savePromptFolders(promptFolders, refreshUI); });
        header.querySelector('.edit').onclick = (e) => { e.stopPropagation(); showCreatePromptFolderModal(folder); };
        header.querySelector('.delete').onclick = (e) => { e.stopPropagation(); if(confirm(t('delete_folder_confirm'))) { promptFolders.splice(folderIdx, 1); Storage.savePromptFolders(promptFolders, refreshUI); } };
        header.onclick = () => { folder.isOpen = !folder.isOpen; Storage.savePromptFolders(promptFolders, refreshUI); };

        div.appendChild(header);

        if (isOpen) {
            const content = document.createElement('div');
            content.className = 'gu-folder-content open';

            let promptsDisplay = searchText ? matchingPrompts : [...folder.prompts];

            promptsDisplay.forEach((prompt) => {
                const promptIdx = folder.prompts.indexOf(prompt);
                const item = document.createElement('div');
                item.className = 'gu-prompt-item';
                item.innerHTML = `
                    <div class="gu-prompt-meta">
                        <span class="gu-prompt-name">${prompt.name}</span>
                        <div class="gu-prompt-actions">
                            <span class="gu-icon-btn edit-p">✎</span>
                            <span class="gu-icon-btn delete-p">×</span>
                        </div>
                    </div>
                    <div class="gu-prompt-text">${prompt.content}</div>
                `;
                item.onclick = () => handlePromptClick(prompt.content);
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

// --- PROMPT INJECTION LOGIC ---
function handlePromptClick(content) {
    const regex = /{{(.*?)}}/g;
    const matches = [...content.matchAll(regex)];
    if (matches.length > 0) {
        const vars = [...new Set(matches.map(m => m[1]))];
        showPromptVariableModal(content, vars);
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
export function showPromptVariableModal(content, variables) {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
    let inputsHtml = variables.map(v => `
        <span class="gu-input-label" style="margin-top:10px; color:#a8c7fa;">${v.toUpperCase()}</span>
        <input type="text" data-var="${v}" class="gu-tag-input gu-var-input" placeholder="Value for ${v}..." autofocus>
    `).join('');
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
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    setTimeout(() => { const i = modal.querySelector('input'); if(i) i.focus(); }, 100);
    const submit = () => {
        let finalContent = content;
        modal.querySelectorAll('.gu-var-input').forEach(input => {
            const v = input.getAttribute('data-var');
            const val = input.value || `{{${v}}}`;
            finalContent = finalContent.split(`{{${v}}}`).join(val);
        });
        injectPromptToGemini(finalContent);
        modal.remove();
    };
    modal.querySelector('#gu-submit-vars').onclick = submit;
    modal.querySelectorAll('input').forEach(inp => { inp.onkeydown = (e) => { if(e.key === 'Enter') submit(); }; });
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
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
                <p style="font-size:13px; line-height:1.5; color:#e3e3e3;">
                    ${t('customize_prompt').replace(':', '')}
                    You can create dynamic templates using <b>Variables</b>.<br><br>
                    Simply wrap a word in double curly braces like this:
                    <br><br>
                    <code style="background:#333; padding:4px 8px; border-radius:4px; color:#a8c7fa;">Act as a {{Job}} expert.</code>
                    <br><br>
                    When you click the prompt, Gemini Organizer will ask you to fill in "Job" before inserting the text.
                </p>
                <button class="gu-btn-action" id="gu-close-help">${t('tutorial_button')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.querySelector('#gu-close-help').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
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

    // Options de langue
    const languageOptions = Object.keys(i18n).map(lang =>
        `<option value="${lang}">${i18n[lang].lang_name}</option>`
    ).join('');

    // Récupérer l'état du toggle "Tchats Cachés"
    const showHidden = localStorage.getItem('gu_show_archived') === 'true';

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

                <p style="color:#666; font-size:12px; margin-top:20px;">Gemini Organizer v2.2</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // --- LOGIQUE DES SETTINGS ---

    // 1. Langue
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

    // 2. Toggle Hidden Chats
    const toggleHidden = document.getElementById('gu-toggle-hidden');
    toggleHidden.onchange = () => {
        if(toggleHidden.checked) document.body.classList.add('gu-show-archived');
        else document.body.classList.remove('gu-show-archived');
        localStorage.setItem('gu_show_archived', toggleHidden.checked);
    };

    // 3. Gestion des Backups
const backupList = document.getElementById('gu-backup-list');
    Storage.getBackups(backups => {
        let html = '';

        // Helper pour le bouton download
        const downloadBtn = (type, idx) =>
            `<button class="gu-backup-btn dl-btn" data-type="${type}" data-idx="${idx}" style="background:#444; margin-right:5px;" title="Download JSON">⬇</button>`;

        if(backups.safety) {
            html += `<div class="gu-backup-row" style="border-left:3px solid orange; background:#2a2b2e;">
                <span>⚠️ Auto-Save <br><small style="color:#888">${backups.safety.displayDate || backups.safety.date}</small></span>
                <div>
                    ${downloadBtn('safety', 0)}
                    <button class="gu-backup-btn restore-btn" data-type="safety">${t('restore')}</button>
                </div>
            </div>`;
        }
        if(backups.regular && backups.regular.length > 0) {
            backups.regular.forEach((bk, i) => {
                html += `<div class="gu-backup-row">
                    <span>Backup ${i+1} <br><small style="color:#888">${bk.displayDate || bk.date}</small></span>
                    <div>
                        ${downloadBtn('regular', i)}
                        <button class="gu-backup-btn restore-btn" data-idx="${i}">${t('restore')}</button>
                    </div>
                </div>`;
            });
        } else if (!backups.safety) {
                html = `<div style="padding:10px; color:#666; text-align:center;">${t('empty-backup-list')}</div>`;
        }

        backupList.innerHTML = html;

        // Logique Bouton DOWNLOAD
        backupList.querySelectorAll('.dl-btn').forEach(btn => {
            btn.onclick = () => {
                const type = btn.getAttribute('data-type');
                const idx = btn.getAttribute('data-idx');
                const backupItem = type === 'safety' ? backups.safety : backups.regular[idx];

                if(backupItem && backupItem.data) {
                    const blob = new Blob([JSON.stringify(backupItem.data, null, 2)], {type:'application/json'});
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `gemini_backup_${type}_${idx}.json`;
                    a.click();
                }
            };
        });

        // Clics Restauration
        backupList.querySelectorAll('.restore-btn').forEach(btn => {
            btn.onclick = () => {
                if(confirm(t('confirm-backup-restore'))) {
                    const type = btn.getAttribute('data-type');
                    const idx = btn.getAttribute('data-idx');
                    const dataToRestore = type === 'safety' ? backups.safety : backups.regular[idx];

                    if(dataToRestore) {
                        Storage.restoreBackup(dataToRestore, () => {
                            refreshUI();
                            alert("Restauration réussie !");
                            modal.remove();
                        });
                    }
                }
            };
        });
    });

    // 4. Import/Export
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
                if(confirm(t('overwrite_confirm'))) {
                    // CRÉATION BACKUP SÉCURITÉ AVANT IMPORT
                    Storage.createBackup('safety'); // Assurez-vous que Storage.createBackup existe
                    Storage.saveData(d, refreshUI);
                    modal.remove();
                }
            } catch(err) { alert(t('invalid_json_alert')); }
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

export function switchTab(tabName) {
    const panel = document.getElementById('gu-floating-panel');
    if (!panel) return;

    panel.querySelectorAll('.gu-tab-btn').forEach(b => b.classList.remove('active'));
    panel.querySelectorAll('.gu-panel-view').forEach(p => p.classList.remove('active'));

    if (tabName === 'folders') {
        panel.querySelector('#gu-tab-folders').classList.add('active');
        panel.querySelector('#gu-content-wrapper .gu-search-row').style.display = 'block';
        panel.querySelector('#gu-content-area').classList.add('active');
        panel.querySelector('#gu-prompts-panel').classList.remove('active');
        panel.querySelector('#gu-add-folder-btn').style.display = 'flex';
        panel.querySelector('#gu-btn-bulk').style.display = 'flex';
        panel.querySelector('#gu-btn-reorganize').style.display = 'flex';
        panel.querySelector('#gu-search-input').placeholder = t('search_folders_placeholder');
    } else {
        panel.querySelector('#gu-tab-prompts').classList.add('active');
        panel.querySelector('#gu-prompts-panel').classList.add('active');
        panel.querySelector('#gu-content-area').classList.remove('active');
        panel.querySelector('#gu-add-folder-btn').style.display = 'none';
        panel.querySelector('#gu-btn-bulk').style.display = 'none';
        panel.querySelector('#gu-btn-reorganize').style.display = 'flex';
        panel.querySelector('#gu-search-input').placeholder = t('search_prompts_placeholder');
        Storage.getPromptFolders(promptFolders => {
            renderPromptsUI(promptFolders);
        });
    }
}

// --- SLASH COMMANDS ---
export function handleSlashCommand(inputElement) {
    let menu = document.getElementById('gu-slash-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'gu-slash-menu';
        document.body.appendChild(menu);
    }

    // 1. Récupération du texte actuel
    const rawVal = inputElement.tagName === 'TEXTAREA' ? inputElement.value : inputElement.innerText;
    // On ignore les retours à la ligne, et on ne prend que la dernière ligne si c'est un chatbox
    const lines = rawVal.split('\n');
    const lastLine = lines[lines.length - 1];
    const val = lastLine.trim();

    // On cache si le champ est vide après suppression du '/'
    if (!val) {
        menu.style.display = 'none';
        return;
    }

    // Condition A: Doit commencer par "/" et ne doit PAS contenir d'espace après le "/"
    if (val.startsWith('/') && !val.substring(1).includes(' ')) {
        const query = val.substring(1).toLowerCase();

        // Récupérer les prompts pour la recherche
        Storage.getPromptFolders(promptFolders => {
            let matches = [];

            // Commandes fixes (avec le mot-clé comme label pour la recherche)
            if ('save'.includes(query)) matches.push({ type: 'cmd', label: 'save', desc: 'Save Chat' });
            if ('folder'.includes(query)) matches.push({ type: 'cmd', label: 'folder', desc: 'New Folder' });
            if ('prompt'.includes(query)) matches.push({ type: 'cmd', label: 'prompt', desc: 'Create Prompt' });

            // Recherche dans les Prompts Utilisateur
            promptFolders.forEach(folder => {
                folder.prompts.forEach(p => {
                    // Recherche par nom de prompt
                    if (p.name.toLowerCase().includes(query)) {
                        matches.push({ type: 'user_prompt', label: p.name, content: p.content, desc: 'User Prompt' });
                    }
                });
            });

            if (matches.length === 0) {
                menu.style.display = 'none';
                return;
            }

            // Construction HTML
            const rect = inputElement.getBoundingClientRect();
            menu.style.display = 'flex';
            menu.style.left = `${rect.left + 20}px`;

            // Positionnement (Éviter de cacher la barre d'input si possible)
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

            // Initialisation de la sélection pour la navigation clavier
            menu.querySelector('.gu-slash-item').classList.add('selected');

            // Clic sur une option
            menu.querySelectorAll('.gu-slash-item').forEach((item, i) => {
                item.onclick = () => {
                    const match = matches[i];
                    executeCommand(match, inputElement);
                };
                item.onmouseenter = () => { // Sélectionne au survol
                    menu.querySelector('.gu-slash-item.selected')?.classList.remove('selected');
                    item.classList.add('selected');
                };
            });
        });

    } else {
        // Condition B: Si ce n'est plus un / ou si il y a un espace -> cacher
        menu.style.display = 'none';
    }

    function executeCommand(match, input) {
        // Nettoyer l'input et exécuter la commande
        if (input.tagName === 'TEXTAREA') input.value = '';
        else input.innerText = '';
        input.dispatchEvent(new Event('input', { bubbles: true })); // Déclenche l'événement pour mettre à jour l'UI Gemini

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
            if (match.content.includes('{{')) {
                handlePromptClick(match.content);
            } else {
                injectPromptToGemini(match.content);
            }
        }

        menu.style.display = 'none';
    }
}

// --- TTS (TEXT TO SPEECH) ---
export function injectTTS() {
    // 1. On s'assure que les voix sont chargées (Chrome bug parfois là-dessus)
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
        };
    }

    // 2. On cible toutes les réponses de l'IA
    const responses = document.querySelectorAll('model-response');

    responses.forEach(resp => {
        // Vérifie si déjà injecté pour ne pas avoir de doublons
        if(resp.querySelector('.gu-tts-btn')) return;

        // 3. RECHERCHE INTELLIGENTE DU FOOTER (La barre avec Like/Dislike/Copy)
        // On cherche le conteneur qui contient les icônes de feedback
        // Souvent c'est le dernier élément div direct ou un conteneur spécifique
        let footer = resp.querySelector('.buttons-container') ||
                     resp.querySelector('.response-actions-container') ||
                     resp.querySelector('div[data-test-id="response-feedback-buttons"]')?.parentNode;

        // Si on ne trouve pas par classe, on cherche le conteneur qui a le bouton "Copier" ou "Like"
        if (!footer) {
            const copyBtn = resp.querySelector('button[data-test-id="copy-response-button"]') ||
                            resp.querySelector('button[aria-label*="Copier"]') ||
                            resp.querySelector('mat-icon[data-mat-icon-name="thumb_up"]')?.closest('button')?.parentNode;

            if (copyBtn) footer = copyBtn.parentNode; // On se met à côté du frère
        }

        // Si toujours rien (cas rare), on prend le dernier élément du message
        if (!footer) footer = resp.lastElementChild;

        if(footer) {
            const btn = document.createElement('div');
            btn.className = 'gu-tts-btn';
            // Icône Haut-parleur
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"/></svg>`;
            btn.title = "Lire le message";
            btn.style.marginLeft = "8px";
            btn.style.cursor = "pointer";
            btn.style.display = "flex";
            btn.style.alignItems = "center";

            btn.onclick = () => {
                // Si ça parle déjà, on arrête
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    // Si c'était ce bouton qui parlait, on arrête tout simplement
                    if (btn.classList.contains('speaking')) {
                        btn.classList.remove('speaking');
                        return;
                    }
                    // Sinon (on a cliqué sur un autre), on continue pour lancer le nouveau
                    document.querySelectorAll('.gu-tts-btn').forEach(b => b.classList.remove('speaking'));
                }

                // 4. RÉCUPÉRATION DU TEXTE (Plus précise)
                const contentEl = resp.querySelector('.markdown') || resp;
                const text = contentEl.innerText || "";

                if (!text.trim()) return;

                const utterance = new SpeechSynthesisUtterance(text);

                // 5. CHOIX DE LA MEILLEURE VOIX
                // On essaie de trouver une voix Google Française, sinon la première FR dispo
                const frVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("fr")) ||
                                voices.find(v => v.lang.includes("fr"));

                if (frVoice) utterance.voice = frVoice;
                utterance.lang = 'fr-FR';
                utterance.rate = 1.0;

                // Gestion de l'état visuel (animation)
                btn.classList.add('speaking');
                utterance.onend = () => btn.classList.remove('speaking');
                utterance.onerror = (e) => {
                    console.error("Erreur TTS:", e);
                    btn.classList.remove('speaking');
                };

                window.speechSynthesis.speak(utterance);
            };

            // Injection : On l'ajoute au début de la barre d'outils pour qu'il soit bien visible
            // "prepend" le met tout à gauche, "appendChild" tout à droite
            footer.prepend(btn);
        }
    });
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
export function initPanel() {
    if (document.getElementById('gu-floating-panel')) return;

    // On vérifie si le style existe déjà (créé par le fastStart)
    if (!document.getElementById('gu-global-styles')) {
        const style = document.createElement('style');
        style.id = 'gu-global-styles'; // On lui donne un ID pour le reconnaître
        style.textContent = CSS_STYLES;
        document.head.appendChild(style);
    }

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
                    <button id="gu-btn-export-md" class="gu-btn-icon-head" title="Export Markdown">⬇</button>
                    <button id="gu-btn-reorganize" class="gu-btn-icon-head" title="Reorganize / Move">⇄</button>
                    <button id="gu-btn-bulk" class="gu-btn-icon-head" title="${t('bulk_organize_title')}">✅</button>
                </div>
            </div>

            <div class="gu-tabs-header">
                <button id="gu-tab-folders" class="gu-tab-btn active">${t('folders_tab')}</button>
                <button id="gu-tab-prompts" class="gu-tab-btn">${t('prompts_tab')}</button>
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
                    <div style="padding:10px; border-bottom:1px solid #333; display:flex; gap:6px;">
                        <button id="gu-add-prompt-folder-btn" class="gu-btn-action" style="background:#333; font-size:11px; margin:0;">+ Folder</button>
                        <button id="gu-add-prompt-btn" class="gu-btn-action" style="margin:0; flex:1; background:#254d29;">${t('new_prompt_btn')}</button>
                        <button id="gu-help-prompt-btn" class="gu-btn-icon-head" title="${t('prompt_help_title')}">?</button>
                    </div>
                    <div id="gu-prompts-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Dragging Logic
        const header = panel.querySelector('#gu-header-drag');
        let isDragging = false, startX, startY, initialLeft, initialTop;

        header.onmousedown = (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') return;
            isDragging = true; startX = e.clientX; startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
            header.style.cursor = 'grabbing';
        };

        // --- GESTION DU BOUTON STREAMER (PC + MOBILE) ---
        const btnStreamer = panel.querySelector('#gu-btn-streamer');
        let longPressTimer;

        // Clic Gauche / Tap court : ON/OFF
        btnStreamer.onclick = toggleStreamerMode;

        // Clic Droit (PC) : CONFIGURATION
        btnStreamer.oncontextmenu = (e) => {
            e.preventDefault();
            showStreamerMenu(e);
        };

        // Appui Long (Mobile) : CONFIGURATION
        btnStreamer.ontouchstart = (e) => {
            longPressTimer = setTimeout(() => {
                e.preventDefault();
                showStreamerMenu(e.touches[0]); // On passe l'event touch pour avoir les coordonnées
            }, 600); // Déclenchement après 600ms
        };

        btnStreamer.ontouchend = () => {
            clearTimeout(longPressTimer); // Annule si on relâche avant 600ms
        };
        // ------------------------------------------------

        document.onmousemove = (e) => {
            if (!isDragging) return;
            panel.style.left = `${initialLeft + e.clientX - startX}px`;
            panel.style.top = `${initialTop + e.clientY - startY}px`;
            panel.style.right = 'auto';
        };
        document.onmouseup = () => { isDragging = false; header.style.cursor = 'move'; };

        // Attach Events
        panel.querySelector('#gu-btn-min').onclick = () => panel.classList.toggle('minimized');
        panel.querySelector('#gu-add-folder-btn').onclick = () => showCreateFolderModal();
        panel.querySelector('#gu-add-prompt-folder-btn').onclick = () => showCreatePromptFolderModal();

        panel.querySelector('#gu-search-input').addEventListener('input', () => {
            if(panel.querySelector('#gu-tab-folders').classList.contains('active')) refreshUI();
            else Storage.getPromptFolders(renderPromptsUI);
        });

        panel.querySelector('#gu-btn-settings').onclick = showSettingsModal;
        panel.querySelector('#gu-btn-bulk').onclick = () => Storage.getData(folders => showBulkManager(folders));

        // REORGANIZE FIX
        panel.querySelector('#gu-btn-reorganize').onclick = () => {
            if (panel.querySelector('#gu-tab-folders').classList.contains('active')) {
                showReorganizeModal('chat');
            } else {
                showReorganizeModal('prompt');
            }
        };

        // --- GESTION TACTILE (MOBILE) POUR LE DRAG ---
        header.ontouchstart = (e) => {
            // Empêche le scroll de la page quand on drag le header
            if(e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
        };

        document.ontouchmove = (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;

            panel.style.left = `${initialLeft + dx}px`;
            panel.style.top = `${initialTop + dy}px`;
            panel.style.right = 'auto';

            if (e.cancelable) e.preventDefault();
        };

        document.ontouchend = () => {
            isDragging = false;
        };

        panel.querySelector('#gu-btn-export-md').onclick = exportChatToMarkdown;
        // Note: Le bouton streamer est géré plus haut avec le long press
        panel.querySelector('#gu-btn-wide').onclick = toggleWideMode;

        panel.querySelector('#gu-tab-folders').onclick = () => switchTab('folders');
        panel.querySelector('#gu-tab-prompts').onclick = () => switchTab('prompts');
        panel.querySelector('#gu-add-prompt-btn').onclick = () => showCreatePromptModal();
        panel.querySelector('#gu-help-prompt-btn').onclick = showPromptHelpModal;

        refreshMainButtons();
    });
}