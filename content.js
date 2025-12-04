console.log("Gemini Organizer: Ultimate v13 (Bulk Manager) Loaded 🚀");

// --- 🔒 CORE SETTINGS ---
const STORAGE_KEY = 'gemini_organizer_sync_v1';
const PROMPTS_KEY = 'gemini_prompts_data_v1';

const COLORS = ['#3c4043', '#5c2b29', '#5c4615', '#254d29', '#0d4f4a', '#004a77', '#2c3c63', '#4a2a5e'];
const TAG_COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#e3e3e3'];
const EMOJIS = ['📁', '💼', '🎓', '💡', '🚀', '🤖', '💻', '🎨', '📝', '🎮', '🎬', '🎵', '🛒', '✈️', '🏠', '❤️', '⭐', '🔥', '✅', '🔒'];

// --- 1. INJECTED CSS STYLES ---
const CSS_STYLES = `
    /* --- FLOATING PANEL --- */
    #gu-floating-panel {
        position: fixed; top: 80px; right: 20px; width: 320px;
        background-color: #1e1f20; border: 1px solid #444746; border-radius: 12px;
        z-index: 99999; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        display: flex; flex-direction: column; max-height: 85vh;
        font-family: "Google Sans", sans-serif; transition: height 0.3s, opacity 0.3s;
    }
    #gu-floating-panel.minimized { height: auto !important; max-height: 50px !important; overflow: hidden; }
    #gu-floating-panel.minimized #gu-content-wrapper { display: none; }

    /* HEADER */
    .gu-header {
        padding: 12px 16px; background: #1e1f20; border-radius: 12px 12px 0 0; cursor: move;
        display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; gap: 10px;
    }
    .gu-title { color: #e3e3e3; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; pointer-events: none; }

    .gu-header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

    .gu-btn-create {
        background: #0b57d0; color: white; border: none; border-radius: 20px; padding: 0 12px; height: 28px;
        cursor: pointer; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; white-space: nowrap;
    }
    .gu-btn-create:hover { background: #0842a0; }

    .gu-btn-icon-head {
        background: transparent; border: 1px solid #444; color: #9aa0a6; font-size: 14px;
        cursor: pointer; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
    }
    .gu-btn-icon-head:hover { color: white; background: rgba(255,255,255,0.1); }

    #gu-content-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    #gu-content-area { overflow-y: auto; scrollbar-width: thin; padding: 0; flex: 1; }

    /* Search */
    .gu-search-row { padding: 10px 16px; background: #1e1f20; border-bottom: 1px solid #333; }
    .gu-search-box {
        width: 100%; background: #282a2c; border: 1px solid #444; border-radius: 8px;
        padding: 8px 12px; color: #e3e3e3; font-size: 13px; outline: none; box-sizing: border-box;
    }
    .gu-search-box:focus { border-color: #0b57d0; }

    /* --- FOLDERS --- */
    .gu-folder-row {
        padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
        color: #c4c7c5; font-size: 13px; border-bottom: 1px solid #282a2c;
        border-left: 4px solid transparent; transition: background 0.2s;
    }
    .gu-folder-emoji {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        min-width: 24px; text-align: center; display: inline-flex; align-items: center; justify-content: center;
        font-style: normal; font-size: 14px;
    }
    .gu-folder-row:hover { background: #2d2e31; }
    .gu-folder-row.gu-drag-over { background: #3c4043; border-left-color: #a8c7fa !important; }
    .gu-folder-left { display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1; }
    .gu-folder-actions { display: flex; gap: 2px; align-items: center; opacity: 0; transition: opacity 0.2s; }
    .gu-folder-row:hover .gu-folder-actions { opacity: 1; }
    .gu-count { font-size: 10px; background: #444; padding: 2px 6px; border-radius: 10px; color: #ccc; margin-right: 4px; }
    .gu-icon-btn { color: #9aa0a6; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .gu-icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    .gu-icon-btn.delete:hover { color: #ff8989; background: rgba(255,0,0,0.1); }

    /* Color Picker */
    .gu-color-wrapper { position: relative; display: flex; align-items: center; margin-left: 2px;}
    .gu-color-input { position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
    .gu-color-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #555; }
    .gu-color-wrapper:hover .gu-color-dot { transform: scale(1.3); border-color: white; }

    /* --- CHATS --- */
    .gu-folder-content { display: none; background: #161616; border-left: 4px solid #1e1f20; min-height: 5px; }
    .gu-folder-content.open { display: block; }

    .gu-chat-link {
        display: flex; flex-direction: column; padding: 8px 12px 8px 20px;
        color: #9aa0a6; text-decoration: none; font-size: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; user-select: none;
    }
    .gu-chat-link:hover { background: #303134; color: #e3e3e3; }
    .gu-chat-link.gu-drag-over { border-top: 2px solid #a8c7fa; }
    .gu-chat-link.pinned { background: #1f221e; border-left: 2px solid #a8c7fa; }
    .gu-chat-top-row { display: flex; align-items: center; width: 100%; }
    .gu-chat-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gu-chat-actions { display: none; align-items: center; gap: 2px; }
    .gu-chat-link:hover .gu-chat-actions { display: flex; }
    .gu-chat-del { color: #8e918f; font-weight: bold; padding: 2px 6px; }
    .gu-chat-del:hover { color: #ff8989; }
    .gu-chat-pin { color: #8e918f; font-size: 14px; padding: 2px 4px; }
    .gu-chat-pin:hover, .gu-chat-pin.active { color: #a8c7fa; }
    .gu-chat-tag-btn { color: #8e918f; font-size: 14px; padding: 2px 4px; }
    .gu-chat-tag-btn:hover { color: #a8c7fa; }

    /* --- TAGS --- */
    .gu-tags-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; padding-left: 16px; }
    .gu-tag {
        font-size: 10px; padding: 1px 6px; border-radius: 4px;
        color: #1f1f1f; font-weight: 600; cursor: pointer;
        display: inline-flex; align-items: center; border: 1px solid transparent;
    }
    .gu-tag:hover { opacity: 0.8; text-decoration: line-through; }

    /* --- MODALS (COMMON) --- */
    .gu-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 1000000;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(2px); opacity: 0; animation: gu-fadein 0.2s forwards;
    }
    .gu-modal-content {
        background: #1e1f20; border: 1px solid #444; border-radius: 16px;
        padding: 0; width: 400px; color: #e3e3e3;
        box-shadow: 0 15px 40px rgba(0,0,0,0.9);
        transform: scale(0.95); animation: gu-scaleup 0.2s forwards; display: flex; flex-direction: column;
        max-height: 80vh;
    }
    .gu-modal-header {
        padding: 14px 20px; font-size: 14px; font-weight: 600; color: #e3e3e3;
        border-bottom: 1px solid #333; background: #252627; border-radius: 16px 16px 0 0;
        display: flex; justify-content: space-between; align-items: center;
    }
    .gu-menu-close { cursor: pointer; font-size: 20px; color: #9aa0a6; line-height: 1; padding: 4px; }
    .gu-menu-close:hover { color: white; }
    .gu-modal-body { padding: 20px; overflow-y: auto; }
    .gu-input-label { font-size: 12px; color: #999; margin-bottom: 6px; display: block; font-weight: 600; }
    .gu-tag-input { width: 100%; background: #131314; border: 1px solid #555; color: white; padding: 10px; border-radius: 8px; outline: none; box-sizing:border-box; font-size: 14px; }
    .gu-tag-input:focus { border-color: #0b57d0; }
    .gu-btn-action {
        width: 100%; margin-top: 15px; background: #0b57d0; color: white;
        border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .gu-btn-action:hover { background: #0842a0; }

    /* --- TAG MANAGER SPECIFICS --- */
    .gu-active-tags-area { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
    .gu-active-tag-chip { background: #444; padding: 4px 8px; border-radius: 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .gu-active-tag-chip:hover { background: #ff5555; }
    .gu-color-picker-row { display: flex; gap: 8px; margin-top: 10px; justify-content: center; }
    .gu-color-choice { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
    .gu-color-choice.selected { border-color: white; transform: scale(1.2); }
    .gu-tag-library { margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; }
    .gu-tag-list-scroll { max-height: 120px; overflow-y: auto; scrollbar-width: thin; }
    .gu-tag-option { padding: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #ccc; border-radius: 4px; }
    .gu-tag-option:hover { background: #3c4043; color: white; }
    .gu-tag-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* --- EMOJI PICKER (FIXED) --- */
    .gu-emoji-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-top: 8px; border: 1px solid #333; padding: 8px; border-radius: 8px; background: #1a1a1a; }
    .gu-emoji-item { cursor: pointer; padding: 4px; text-align: center; border-radius: 4px; font-size: 16px; user-select: none; }
    .gu-emoji-item:hover { background: #444; }
    .gu-emoji-item.selected { background: #0b57d0; color: white; }

    /* --- BULK MANAGER --- */
    .gu-bulk-list { max-height: 300px; overflow-y: auto; scrollbar-width: thin; margin-top: 10px; border: 1px solid #333; border-radius: 8px; }
    .gu-bulk-item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #333; cursor: pointer; transition: background 0.2s; }
    .gu-bulk-item:hover { background: #2a2b2e; }
    .gu-bulk-item.selected { background: #2c3c63; }
    .gu-bulk-checkbox {
        width: 18px; height: 18px; margin-right: 12px; accent-color: #0b57d0; cursor: pointer;
        flex-shrink: 0;
    }
    .gu-bulk-text { font-size: 13px; color: #e3e3e3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gu-bulk-counter { font-size: 12px; color: #a8c7fa; text-align: right; margin-top: 5px; }

    /* --- FLOATING [+] BUTTON --- */
    .gu-float-add {
        position: absolute; right: 45px; top: 50%; transform: translateY(-50%);
        width: 26px; height: 26px; background: rgba(255,255,255,0.1);
        border-radius: 50%; color: #e3e3e3; display: flex; align-items: center; justify-content: center;
        font-weight: bold; cursor: pointer; z-index: 999; font-size: 16px;
        border: 1px solid rgba(255,255,255,0.2); transition: 0.2s;
    }
    .gu-float-add:hover { background: #0b57d0; border-color: #0b57d0; color: white; scale: 1.1; }

    /* --- CONTEXT MENU (Simple) --- */
    .gu-context-menu {
        position: fixed; background: #282a2c; border: 1px solid #555;
        border-radius: 8px; padding: 6px 0; z-index: 100000;
        box-shadow: 0 8px 20px rgba(0,0,0,0.5); min-width: 200px;
        display: flex; flex-direction: column;
    }
    .gu-context-header { padding: 8px 16px; font-size: 12px; font-weight: 600; color: #9aa0a6; border-bottom: 1px solid #3c4043; margin-bottom: 4px; }
    .gu-context-item { padding: 10px 16px; color: #e3e3e3; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; }
    .gu-context-item:hover { background: #0b57d0; color: white; }
    .gu-context-dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); }

    /* --- ANIMATIONS --- */
    @keyframes gu-fadein { to { opacity: 1; } }
    @keyframes gu-scaleup { to { transform: scale(1); } }
`;

// --- 2. DATA MANAGEMENT ---

function getData(cb) { chrome.storage.sync.get([STORAGE_KEY], r => cb(r[STORAGE_KEY] || [])); }
function saveData(d, cb) { chrome.storage.sync.set({ [STORAGE_KEY]: d }, () => { if(cb) cb(); refreshUI(); }); }

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

// --- 3. UI RENDERING ---

function refreshUI() {
    getData(folders => {
        renderPanelContent(folders);
        injectButtonsInNativeList(folders);
    });
}

function renderPanelContent(folders) {
    const container = document.getElementById('gu-content-area');
    const searchInput = document.getElementById('gu-search-input');
    if (!container) return;

    const searchText = searchInput ? searchInput.value.toLowerCase() : "";
    container.innerHTML = '';

    if (folders.length === 0) {
        container.innerHTML = '<div style="padding:30px 20px; text-align:center; color:#666; font-size:12px;">Click <b>+ New</b> to create a folder.</div>';
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

        header.addEventListener('dragover', e => { e.preventDefault(); header.classList.add('gu-drag-over'); });
        header.addEventListener('dragleave', () => header.classList.remove('gu-drag-over'));
        header.addEventListener('drop', (e) => handleFolderDrop(e, idx));

        const isOpen = folder.isOpen || (searchText.length > 0);
        const emoji = folder.emoji || '📁';

// FIX EMOJI : Cleaned up inline styles, now using CSS class strictly
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
                    <span class="gu-icon-btn edit">✎</span>
                    <span class="gu-icon-btn delete">×</span>
                </div>
            </div>
        `;

        const colorInput = header.querySelector('.gu-color-input');
        colorInput.addEventListener('input', (e) => {
            header.style.borderLeftColor = e.target.value;
            header.querySelector('.gu-color-dot').style.backgroundColor = e.target.value;
        });
        colorInput.addEventListener('change', (e) => { folder.color = e.target.value; saveData(folders); });
        header.querySelector('.gu-color-wrapper').addEventListener('click', e => e.stopPropagation());

        header.querySelector('.edit').onclick = (e) => { e.stopPropagation(); showCreateFolderModal(folder); };
        header.querySelector('.delete').onclick = (e) => { e.stopPropagation(); if(confirm("Delete?")) { folders.splice(idx, 1); saveData(folders); } };
        header.onclick = () => { folder.isOpen = !folder.isOpen; saveData(folders); };

        div.appendChild(header);

        if (isOpen) {
            const content = document.createElement('div');
            content.className = 'gu-folder-content open';
            content.addEventListener('dragover', e => e.preventDefault());
            content.addEventListener('drop', e => handleChatReorderDrop(e, idx));

            // Sort logic: Pinned first
            let chatsDisplay = searchText ? matchingChats : [...folder.chats];
            if (!searchText) {
                chatsDisplay.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
            }

            chatsDisplay.forEach((chat) => {
                const chatIdx = folder.chats.indexOf(chat);
                const link = document.createElement('div');
                link.className = `gu-chat-link ${chat.isPinned ? 'pinned' : ''}`;
                link.draggable = true;

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
                        <span style="font-size:10px; color:#666; margin-right:6px;">⋮⋮</span>
                        <span class="gu-chat-title">${chat.title}</span>
                        <div class="gu-chat-actions">
                            <span class="gu-icon-btn gu-chat-tag-btn" title="Manage Tags">#</span>
                            <span class="gu-icon-btn gu-chat-pin ${chat.isPinned?'active':''}" title="Pin">📌</span>
                            <span class="gu-icon-btn move c-up">▲</span>
                            <span class="gu-icon-btn move c-down">▼</span>
                            <span class="gu-icon-btn delete c-del">×</span>
                        </div>
                    </div>
                    ${tagsHtml}
                `;

                link.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'chat', folderIdx: idx, chatIdx: chatIdx }));
                    link.style.opacity = '0.5';
                });
                link.addEventListener('dragend', () => link.style.opacity = '1');
                link.addEventListener('dragover', e => { e.preventDefault(); link.classList.add('gu-drag-over'); });
                link.addEventListener('dragleave', () => link.classList.remove('gu-drag-over'));
                link.addEventListener('drop', e => handleChatReorderDrop(e, idx, chatIdx));

                link.querySelector('.c-up').onclick = (e) => { e.stopPropagation(); moveChat(folder, chatIdx, -1, folders); };
                link.querySelector('.c-down').onclick = (e) => { e.stopPropagation(); moveChat(folder, chatIdx, 1, folders); };
                link.querySelector('.c-del').onclick = (e) => { e.stopPropagation(); folder.chats.splice(chatIdx, 1); saveData(folders); };
                link.querySelector('.gu-chat-pin').onclick = (e) => { e.stopPropagation(); chat.isPinned = !chat.isPinned; saveData(folders); };

                link.querySelector('.gu-chat-tag-btn').onclick = (e) => {
                    e.stopPropagation();
                    showAdvancedTagMenu(e, chat, folders);
                };

                link.onclick = () => window.location.href = chat.url;
                content.appendChild(link);
            });
            div.appendChild(content);
        }
        container.appendChild(div);
    });
}

// --- 4. MODALS (TAGS, CREATE, SETTINGS, BULK) ---

function showAdvancedTagMenu(e, chat, folders) {
    const existing = document.getElementById('gu-tag-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'gu-tag-modal';
    modal.className = 'gu-modal-overlay';

    // 1. Active Tags
    let activeHtml = `<div class="gu-active-tags-area">`;
    if (chat.tags && chat.tags.length > 0) {
        chat.tags.forEach((tag, i) => {
            const txt = typeof tag === 'object' ? tag.text : tag;
            const col = typeof tag === 'object' ? tag.color : stringToColor(txt);
            activeHtml += `<div class="gu-active-tag-chip" style="border:1px solid ${col}" data-idx="${i}">
                <span style="width:8px; height:8px; border-radius:50%; background:${col}"></span>${txt} <span style="margin-left:4px; font-weight:bold">×</span>
            </div>`;
        });
    } else {
        activeHtml += `<span style="color:#666; font-size:12px; padding:5px;">No tags yet</span>`;
    }
    activeHtml += `</div>`;

    // 2. Color Picker
    let colorHtml = `<div class="gu-color-picker-row">`;
    TAG_COLORS.forEach((c, i) => {
        colorHtml += `<div class="gu-color-choice ${i===0?'selected':''}" style="background:${c}" data-col="${c}"></div>`;
    });
    colorHtml += `</div>`;

    // 3. Library
    const library = getLibraryTags(folders);
    const currentTagTexts = (chat.tags || []).map(t => typeof t === 'object' ? t.text : t);
    const available = library.filter(t => !currentTagTexts.includes(t.text));

    let libraryHtml = `<div class="gu-tag-library"><span class="gu-input-label">LIBRARY</span><div class="gu-available-tags-list">`;
    if(available.length > 0) {
        available.forEach(t => {
            libraryHtml += `<div class="gu-tag-option" data-text="${t.text}" data-col="${t.color}"><span class="gu-tag-dot" style="background:${t.color}"></span>${t.text}</div>`;
        });
    }
    libraryHtml += `</div></div>`;

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>Manage Tags</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body">
                <span class="gu-input-label">ACTIVE TAGS</span>
                ${activeHtml}

                <span class="gu-input-label" style="margin-top:10px;">ADD NEW TAG</span>
                <input type="text" id="gu-new-tag-name" class="gu-tag-input" placeholder="Tag name..." autofocus>
                ${colorHtml}

                <button id="gu-submit-tag" class="gu-btn-action">Add Tag</button>
                ${libraryHtml}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();

    modal.querySelectorAll('.gu-active-tag-chip').forEach(el => {
        el.onclick = () => {
            chat.tags.splice(parseInt(el.getAttribute('data-idx')), 1);
            saveData(folders);
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
        saveData(folders);
        modal.remove();
    };

    modal.querySelector('#gu-submit-tag').onclick = () => doAdd(modal.querySelector('#gu-new-tag-name').value.trim(), selectedColor);
    modal.querySelector('#gu-new-tag-name').onkeydown = (ev) => { if(ev.key === 'Enter') modal.querySelector('#gu-submit-tag').click(); };

    modal.querySelectorAll('.gu-tag-option').forEach(opt => {
        opt.onclick = () => doAdd(opt.getAttribute('data-text'), opt.getAttribute('data-col'));
    });

    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

function showCreateFolderModal(existingFolder = null) {
    const existing = document.getElementById('gu-create-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'gu-create-modal';
    modal.className = 'gu-modal-overlay';
    let selectedEmoji = existingFolder ? (existingFolder.emoji || '📁') : EMOJIS[0];

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header">
                <span>${existingFolder ? 'Edit Folder' : 'New Folder'}</span>
                <span class="gu-menu-close">×</span>
            </div>
            <div class="gu-modal-body">
                <span class="gu-input-label">NAME</span>
                <input type="text" id="gu-folder-name" class="gu-tag-input" value="${existingFolder ? existingFolder.name : ''}" autofocus>
                <span class="gu-input-label" style="margin-top:15px;">ICON</span>
                <div class="gu-emoji-grid">
                    ${EMOJIS.map(e => `<div class="gu-emoji-item ${e === selectedEmoji ? 'selected' : ''}">${e}</div>`).join('')}
                </div>
                <button id="gu-save-folder" class="gu-btn-action">Save</button>
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
        getData(folders => {
            if (existingFolder) {
                const target = folders.find(f => f.name === existingFolder.name);
                if (target) { target.name = name; target.emoji = selectedEmoji; }
            } else {
                folders.push({
                    name: name, emoji: selectedEmoji, isOpen: true, chats: [],
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
            }
            saveData(folders);
            modal.remove();
        });
    };
    modal.querySelector('#gu-save-folder').onclick = save;
    modal.querySelector('#gu-folder-name').onkeydown = (e) => { if(e.key === 'Enter') save(); };
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

function showBulkManager(folders) {
    const existing = document.getElementById('gu-bulk-modal');
    if (existing) existing.remove();

    // Find all chats available in sidebar
    const chatItems = document.querySelectorAll('div[data-test-id="conversation"]');
    let availableChats = [];

    // Filter out archived
    const archivedSet = new Set();
    folders.forEach(f => f.chats.forEach(c => archivedSet.add(c.url)));

    chatItems.forEach(item => {
        // Extract ID & Title logic reused
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

    if (availableChats.length === 0) listHtml = '<div style="text-align:center; padding:20px; color:#666;">No new chats found to organize.</div>';

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header">
                <span>Bulk Organize</span>
                <span class="gu-menu-close">×</span>
            </div>
            <div class="gu-modal-body">
                <input type="text" id="gu-bulk-search" class="gu-tag-input" placeholder="Filter chats...">
                <div class="gu-bulk-list">${listHtml}</div>
                <div class="gu-bulk-counter">0 selected (Max 20)</div>
                <select id="gu-bulk-folder-select" class="gu-tag-input" style="margin-top:10px;">
                    <option value="">Select Destination Folder...</option>
                    ${folders.map((f, i) => `<option value="${i}">${f.emoji} ${f.name}</option>`).join('')}
                </select>
                <button id="gu-bulk-move" class="gu-btn-action">Move Selected</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Bulk Logic
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
                    alert("Max 20 items per batch.");
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

    // Search
    modal.querySelector('#gu-bulk-search').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        items.forEach(item => {
            const text = item.querySelector('.gu-bulk-text').innerText.toLowerCase();
            item.style.display = text.includes(val) ? 'flex' : 'none';
        });
    };

    // Move
    modal.querySelector('#gu-bulk-move').onclick = () => {
        const folderIdx = modal.querySelector('#gu-bulk-folder-select').value;
        if (folderIdx === "" || selection.size === 0) return alert("Select chats and a folder.");

        if (folders[folderIdx]) {
            selection.forEach(chat => {
                folders[folderIdx].chats.push({ title: chat.title, url: chat.url });
            });
            saveData(folders);
            modal.remove();
        }
    };

    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

function showSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>Settings</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body" style="text-align:center;">
                <button id="gu-export" class="gu-btn-action" style="background:#333; margin-top:0;">⬇ Export Data (JSON)</button>
                <button id="gu-import" class="gu-btn-action" style="background:#333;">⬆ Import Data</button>
                <input type="file" id="gu-import-file" style="display:none" accept=".json">
                <p style="color:#666; font-size:12px; margin-top:20px;">Gemini Organizer v12.0</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();

    document.getElementById('gu-export').onclick = () => {
        getData(d => {
            const b = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
            const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'gemini_backup.json'; a.click();
        });
    };
    document.getElementById('gu-import').onclick = () => document.getElementById('gu-import-file').click();
    document.getElementById('gu-import-file').onchange = (e) => {
        const r = new FileReader();
        r.onload = ev => {
            try {
                const d = JSON.parse(ev.target.result);
                if(confirm("Overwrite current data?")) saveData(d);
            } catch(err) { alert("Invalid JSON"); }
        };
        r.readAsText(e.target.files[0]);
    };
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

// --- 5. HELPERS MOVE ---
function handleFolderDrop(e, targetIdx) {
    e.preventDefault();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type === 'chat') {
            getData(allFolders => {
                const sourceF = allFolders[data.folderIdx];
                const targetF = allFolders[targetIdx];
                if (sourceF && targetF) {
                    const chat = sourceF.chats.splice(data.chatIdx, 1)[0];
                    targetF.chats.push(chat);
                    targetF.isOpen = true;
                    saveData(allFolders);
                }
            });
        }
    } catch(err){}
}
function handleChatReorderDrop(e, folderIdx, targetChatIdx = null) {
    e.preventDefault(); e.stopPropagation();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type === 'chat' && data.folderIdx === folderIdx) {
            getData(allFolders => {
                const f = allFolders[folderIdx];
                const movedChat = f.chats.splice(data.chatIdx, 1)[0];
                if (targetChatIdx !== null) {
                    let insertAt = targetChatIdx;
                    if (data.chatIdx < targetChatIdx) insertAt--;
                    f.chats.splice(insertAt, 0, movedChat);
                } else {
                    f.chats.push(movedChat);
                }
                saveData(allFolders);
            });
        }
    } catch(err){}
}
function moveChat(folder, idx, dir, allFolders) {
    if (idx + dir >= 0 && idx + dir < folder.chats.length) {
        [folder.chats[idx], folder.chats[idx + dir]] = [folder.chats[idx + dir], folder.chats[idx]];
        saveData(allFolders);
    }
}

// --- 6. NATIVE LIST INJECTION ---

function showFolderMenu(e, folders, chatTitle, fullUrl) {
    const existing = document.getElementById('gu-context-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.id = 'gu-context-menu';
    menu.className = 'gu-context-menu';
    const rect = e.target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left - 150}px`;
    let html = `<div class="gu-context-header">Add to folder:</div>`;
    folders.forEach((f, idx) => {
        const color = f.color || '#888';
        html += `<div class="gu-context-item" data-idx="${idx}"><span class="gu-context-dot" style="background-color:${color}"></span>${f.name}</div>`;
    });
    menu.innerHTML = html;
    document.body.appendChild(menu);
    menu.querySelectorAll('.gu-context-item').forEach(item => {
        item.onclick = () => {
            const idx = parseInt(item.getAttribute('data-idx'));
            if (folders[idx]) {
                folders[idx].chats.push({ title: chatTitle, url: fullUrl, tags: [] });
                folders[idx].isOpen = true;
                saveData(folders);
                menu.remove();
            }
        };
    });
    const closeMenu = (ev) => { if (!menu.contains(ev.target) && ev.target !== e.target) menu.remove(); };
    setTimeout(() => document.addEventListener('click', closeMenu, {once:true}), 100);
}

function injectButtonsInNativeList(folders) {
    const archivedSet = new Set();
    folders.forEach(f => f.chats.forEach(c => archivedSet.add(c.url)));
    const chatItems = document.querySelectorAll('div[data-test-id="conversation"]');
    chatItems.forEach(chatDiv => {
        const jslog = chatDiv.getAttribute('jslog');
        let chatId = null;
        if (jslog) {
            const match = jslog.match(/"(c_[^"]+)"/) || jslog.match(/"([0-9a-f]{10,})"/);
            if (match) chatId = match[1].replace('c_', '');
        }
        if (!chatId) {
            const link = chatDiv.closest('a');
            if (link && link.href.includes('/app/')) chatId = link.href.split('/').pop();
        }
        if (!chatId) return;
        const fullUrl = `https://gemini.google.com/app/${chatId}`;
        const titleEl = chatDiv.querySelector('.conversation-title');
        const chatTitle = titleEl ? titleEl.innerText.trim() : "Conversation";
        let rowContainer = chatDiv.closest('.conversation-items-container') || chatDiv.parentElement;
        if (archivedSet.has(fullUrl)) {
            if(rowContainer) rowContainer.style.display = 'none';
            return;
        }
        if(rowContainer) rowContainer.style.display = '';
        if (!chatDiv.querySelector('.gu-float-add')) {
            chatDiv.style.position = 'relative';
            const btn = document.createElement('div');
            btn.className = 'gu-float-add';
            btn.innerText = '+';
            btn.title = 'Add to folder';
            btn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                getData(currentFolders => {
                    if (currentFolders.length === 0) return alert("Please create a folder first.");
                    showFolderMenu(e, currentFolders, chatTitle, fullUrl);
                });
            };
            chatDiv.appendChild(btn);
        }
    });
}

// --- 7. TUTORIAL & INIT ---

function checkAndShowTutorial() {
    chrome.storage.local.get([TUTORIAL_KEY], (result) => {
        if (!result[TUTORIAL_KEY]) showTutorialModal();
    });
}
function showTutorialModal() {
    const modal = document.createElement('div');
    modal.className = 'gu-modal-overlay';
    modal.innerHTML = `
        <div class="gu-modal-content" style="max-width: 550px;">
            <h1 class="gu-modal-h1">🎉 Welcome to Gemini Organizer!</h1>
            <p class="gu-modal-p">Boost your productivity with folders, tags, and drag & drop.</p>
            <div class="gu-modal-steps">
                <div class="gu-modal-step"><div class="gu-step-icon">📁</div><div><b>Folders:</b> Click <b>+ New</b> to create custom folders.</div></div>
                <div class="gu-modal-step"><div class="gu-step-icon">✅</div><div><b>Bulk:</b> Click <b>Select</b> to organize many chats at once.</div></div>
                <div class="gu-modal-step"><div class="gu-step-icon">🏷️</div><div><b>Tags:</b> Use <b>#</b> on saved chats to categorize them.</div></div>
                <div class="gu-modal-step"><div class="gu-step-icon">📌</div><div><b>Pin:</b> Use <b>Pin</b> to keep important chats at the top.</div></div>
            </div>
            <button id="gu-close-tutorial" class="gu-modal-btn">Let's Go!</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('gu-close-tutorial').onclick = () => {
        modal.remove();
        chrome.storage.local.set({ [TUTORIAL_KEY]: true });
    };
}

function init() {
    if (document.getElementById('gu-floating-panel')) return;
    const style = document.createElement('style');
    style.textContent = CSS_STYLES;
    document.head.appendChild(style);
    const panel = document.createElement('div');
    panel.id = 'gu-floating-panel';
    panel.innerHTML = `
        <div class="gu-header" id="gu-header-drag">
            <div class="gu-header-actions">
                <span class="gu-title">🗂️ FOLDERS</span>
                <button id="gu-btn-settings" class="gu-btn-icon-head" title="Settings">⚙️</button>
            </div>
            <div class="gu-header-actions">
                <button id="gu-btn-bulk" class="gu-btn-icon-head" title="Bulk Select">✅</button>
                <button id="gu-add-folder-btn" class="gu-btn-create"><span>+</span> New</button>
                <button id="gu-min-btn" class="gu-btn-min" title="Minimize">_</button>
            </div>
        </div>
        <div id="gu-content-wrapper">
            <div class="gu-search-row">
                <input type="text" id="gu-search-input" class="gu-search-box" placeholder="Search chats or #tags...">
            </div>
            <div id="gu-content-area"></div>
        </div>
    `;
    document.body.appendChild(panel);
    const header = document.getElementById('gu-header-drag');
    let isDragging = false, startX, startY, initialLeft, initialTop;
    header.onmousedown = (e) => {
        if(e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') return;
        isDragging = true; startX = e.clientX; startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;
        header.style.cursor = 'grabbing';
    };
    document.onmousemove = (e) => {
        if (!isDragging) return;
        panel.style.left = `${initialLeft + e.clientX - startX}px`;
        panel.style.top = `${initialTop + e.clientY - startY}px`;
        panel.style.right = 'auto';
    };
    document.onmouseup = () => { isDragging = false; header.style.cursor = 'move'; };
    document.getElementById('gu-add-folder-btn').onclick = () => showCreateFolderModal();
    document.getElementById('gu-min-btn').onclick = () => panel.classList.toggle('minimized');
    document.getElementById('gu-search-input').addEventListener('input', () => refreshUI());
    document.getElementById('gu-btn-settings').onclick = showSettingsModal;

    // BULK BUTTON HANDLER
    document.getElementById('gu-btn-bulk').onclick = () => {
        getData(folders => showBulkManager(folders));
    };

    refreshUI();
    setInterval(() => refreshUI(), 2000);
    checkAndShowTutorial();
}
const startLoop = setInterval(() => { if(!document.getElementById('gu-floating-panel')) init(); }, 1000);