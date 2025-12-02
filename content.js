console.log("Gemini Organizer: Reorder & Color Version Loaded 🚀");

// --- 🔒 CORE SETTINGS (DO NOT CHANGE) ---
const STORAGE_KEY = 'gemini_organizer_sync_v1';
const PROMPTS_KEY = 'gemini_prompts_data_v1';

// --- CONFIGURATION ---
const COLORS = ['#3c4043', '#5c2b29', '#5c4615', '#254d29', '#0d4f4a', '#004a77', '#2c3c63', '#4a2a5e'];

// --- 1. INJECTED CSS STYLES ---
const CSS_STYLES = `
    /* --- FLOATING PANEL (RIGHT SIDE) --- */
    #gu-floating-panel {
        position: fixed;
        top: 80px; right: 20px; width: 300px;
        background-color: #1e1f20;
        border: 1px solid #444746;
        border-radius: 12px;
        z-index: 99999;
        box-shadow: -4px 4px 15px rgba(0,0,0,0.5);
        display: flex; flex-direction: column;
        max-height: 85vh;
        font-family: "Google Sans", sans-serif;
        transition: opacity 0.3s;
    }

    /* HEADER */
    .gu-header {
        padding: 12px 16px;
        background: #1e1f20;
        border-bottom: 1px solid #444;
        border-radius: 12px 12px 0 0;
        display: flex; justify-content: space-between; align-items: center;
    }
    .gu-title { color: #e3e3e3; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; }

    /* CREATE BUTTON */
    .gu-btn-create {
        background: #0b57d0; color: white; border: none; border-radius: 4px;
        padding: 5px 12px; cursor: pointer; font-size: 13px; font-weight: 500;
        display: flex; align-items: center; gap: 5px; transition: background 0.2s;
    }
    .gu-btn-create:hover { background: #0842a0; }

    /* SEARCH BOX */
    .gu-search-container { padding: 8px 16px; border-bottom: 1px solid #333; }
    .gu-search-box {
        width: 100%; background: #131314; border: 1px solid #444; border-radius: 8px;
        padding: 8px 12px; color: #e3e3e3; font-size: 13px; outline: none; box-sizing: border-box;
    }
    .gu-search-box:focus { border-color: #0b57d0; }

    /* CONTENT AREA */
    #gu-content-area { overflow-y: auto; scrollbar-width: thin; padding: 0; flex: 1; }

    /* --- FOLDER ROW --- */
    .gu-folder-row {
        padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
        color: #c4c7c5; font-size: 13px; border-bottom: 1px solid #282a2c;
        border-left: 4px solid transparent; /* Color indicator */
        transition: background 0.2s;
    }
    .gu-folder-row:hover { background: #2d2e31; }
    .gu-folder-row:hover .gu-folder-actions { opacity: 1; }

    /* Title Group */
    .gu-folder-left { display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1; }

    /* Actions (Hidden by default) */
    .gu-folder-actions {
        display: flex; gap: 2px; align-items: center;
        opacity: 0; transition: opacity 0.2s;
    }

    /* Counter */
    .gu-count { font-size: 10px; background: #444; padding: 2px 6px; border-radius: 10px; color: #ccc; margin-right: 5px; }

    /* Action Buttons (Edit, Delete, Move) */
    .gu-icon-btn {
        color: #9aa0a6; cursor: pointer; font-size: 16px; padding: 4px;
        border-radius: 4px; display: flex; align-items: center; justify-content: center;
    }
    .gu-icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }

    .gu-icon-btn.delete:hover { color: #ff8989; background: rgba(255,0,0,0.1); }

    .gu-icon-btn.move { font-size: 12px; } /* Smaller arrows */

    /* COLOR PICKER */
    .gu-color-input {
        width: 0; height: 0; visibility: hidden; position: absolute;
    }
    .gu-color-label {
        width: 12px; height: 12px; border-radius: 50%; cursor: pointer;
        border: 1px solid #555; display: inline-block; margin-right: 4px;
        box-shadow: 0 0 2px rgba(0,0,0,0.5); transition: transform 0.2s;
    }
    .gu-color-label:hover { transform: scale(1.3); border-color: white; }

    /* FOLDER CONTENT (Chat List) */
    .gu-folder-content { display: none; background: #161616; border-left: 4px solid #1e1f20; }
    .gu-folder-content.open { display: block; }

    .gu-chat-link {
        display: flex; align-items: center; padding: 8px 12px 8px 28px;
        color: #9aa0a6; text-decoration: none; font-size: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer;
    }
    .gu-chat-link:hover { background: #3c4043; color: white; }

    .gu-chat-del {
        margin-left: auto; opacity: 0; color: #8e918f; font-weight: bold; padding: 2px 6px; border-radius: 4px;
    }
    .gu-chat-link:hover .gu-chat-del { opacity: 1; }
    .gu-chat-del:hover { background: rgba(255,0,0,0.2); color: #ff8989; }

    /* --- FLOATING ADD BUTTON [+] --- */
    .gu-float-add {
        position: absolute; right: 45px; top: 50%; transform: translateY(-50%);
        width: 26px; height: 26px; background: rgba(255,255,255,0.1);
        border-radius: 50%; color: #e3e3e3; display: flex; align-items: center; justify-content: center;
        font-weight: bold; cursor: pointer; z-index: 999; font-size: 16px;
        border: 1px solid rgba(255,255,255,0.2); transition: 0.2s;
    }
    .gu-float-add:hover { background: #0b57d0; border-color: #0b57d0; color: white; scale: 1.1; }

    /* --- CONTEXT MENU --- */
    .gu-context-menu {
        position: fixed; background: #282a2c; border: 1px solid #555;
        border-radius: 8px; padding: 8px 0; z-index: 100000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 200px;
        display: flex; flex-direction: column; animation: gu-fadein 0.1s ease-out;
    }
    @keyframes gu-fadein { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    .gu-context-header {
        padding: 4px 12px 8px; font-size: 12px; color: #9aa0a6; border-bottom: 1px solid #3c4043; margin-bottom: 4px;
    }
    .gu-context-item {
        padding: 8px 16px; color: #e3e3e3; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px;
    }
    .gu-context-item:hover { background: #0b57d0; color: white; }
    .gu-context-dot { width: 8px; height: 8px; border-radius: 50%; }
`;

// --- 2. DATA MANAGEMENT ---

function getData(cb) {
    try {
        chrome.storage.sync.get([STORAGE_KEY], r => {
            if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError);
            cb(r[STORAGE_KEY] || []);
        });
    } catch (e) { console.error(e); cb([]); }
}

function saveData(d, cb) {
    try {
        chrome.storage.sync.set({ [STORAGE_KEY]: d }, () => {
            if (chrome.runtime.lastError) alert("Error: " + chrome.runtime.lastError.message);
            if(cb) cb();
            refreshUI();
        });
    } catch (e) { console.error(e); }
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
        container.innerHTML = '<div style="padding:30px 20px; text-align:center; color:#666; font-size:12px;">Library is empty.<br>Click "New" to start.</div>';
        return;
    }

    let hasResults = false;

    folders.forEach((folder, idx) => {
        // Search Logic
        const folderMatches = folder.name.toLowerCase().includes(searchText);
        const matchingChats = folder.chats.filter(c => c.title.toLowerCase().includes(searchText));

        if (searchText && !folderMatches && matchingChats.length === 0) return;
        hasResults = true;

        const div = document.createElement('div');

        // Folder Row
        const header = document.createElement('div');
        header.className = 'gu-folder-row';
        const folderColor = folder.color || '#5f6368';
        header.style.borderLeftColor = folderColor;
        const isOpen = folder.isOpen || (searchText.length > 0);

        // Button Visibility Logic (First/Last)
        const upStyle = idx === 0 ? 'style="visibility:hidden"' : '';
        const downStyle = idx === folders.length - 1 ? 'style="visibility:hidden"' : '';

        header.innerHTML = `
            <div class="gu-folder-left">
                <span style="font-size:10px; color:${folderColor}; width: 12px;">${isOpen ? '▼' : '▶'}</span>
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${folder.name}</span>
            </div>

            <div style="display:flex; align-items:center;">
                <span class="gu-count">${folder.chats.length}</span>

                <div class="gu-folder-actions">
                    <span class="gu-icon-btn move move-up" title="Move Up" ${upStyle}>▲</span>

                    <span class="gu-icon-btn move move-down" title="Move Down" ${downStyle}>▼</span>

                    <label class="gu-color-label" style="background-color:${folderColor}; margin-left:4px;" title="Color">
                        <input type="color" class="gu-color-input" value="${folderColor}">
                    </label>

                    <span class="gu-icon-btn edit" title="Rename">✎</span>

                    <span class="gu-icon-btn delete" title="Delete">×</span>
                </div>
            </div>
        `;

        // --- EVENTS ---

        // 1. Move UP
        header.querySelector('.move-up').addEventListener('click', (e) => {
            e.stopPropagation();
            if (idx > 0) {
                [folders[idx], folders[idx - 1]] = [folders[idx - 1], folders[idx]];
                saveData(folders);
            }
        });

        // 2. Move DOWN
        header.querySelector('.move-down').addEventListener('click', (e) => {
            e.stopPropagation();
            if (idx < folders.length - 1) {
                [folders[idx], folders[idx + 1]] = [folders[idx + 1], folders[idx]];
                saveData(folders);
            }
        });

        // 3. Color Change
        const colorInput = header.querySelector('.gu-color-input');
        colorInput.addEventListener('input', (e) => {
            header.style.borderLeftColor = e.target.value;
            header.querySelector('.gu-color-label').style.backgroundColor = e.target.value;
            header.querySelector('.gu-folder-left span').style.color = e.target.value;
        });
        colorInput.addEventListener('change', (e) => {
            folder.color = e.target.value;
            saveData(folders);
        });
        header.querySelector('.gu-color-label').addEventListener('click', (e) => e.stopPropagation());

        // 4. Rename
        header.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            const newName = prompt("Rename folder:", folder.name);
            if (newName) { folder.name = newName.trim(); saveData(folders); }
        });

        // 5. Delete
        header.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            if(confirm(`Delete folder "${folder.name}"?`)) {
                folders.splice(idx, 1);
                saveData(folders);
            }
        });

        // 6. Toggle
        header.addEventListener('click', () => {
            folder.isOpen = !folder.isOpen;
            saveData(folders);
        });

        div.appendChild(header);

        // --- CHATS LIST ---
        if (isOpen) {
            const content = document.createElement('div');
            content.className = 'gu-folder-content open';

            const chatsDisplay = searchText ? matchingChats : folder.chats;

            if(chatsDisplay.length === 0) {
                content.innerHTML = '<div style="padding:8px 28px; font-size:11px; color:#555; font-style:italic;">Empty</div>';
            }

            chatsDisplay.forEach((chat) => {
                const originalIndex = folder.chats.indexOf(chat);
                const link = document.createElement('div');
                link.className = 'gu-chat-link';
                link.innerHTML = `
                    <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${chat.title}</span>
                    <span class="gu-chat-del" title="Remove">×</span>
                `;

                link.querySelector('.gu-chat-del').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (originalIndex > -1) {
                        folder.chats.splice(originalIndex, 1);
                        saveData(folders);
                    }
                });

                link.addEventListener('click', () => window.location.href = chat.url);
                content.appendChild(link);
            });
            div.appendChild(content);
        }
        container.appendChild(div);
    });

    if (searchText && !hasResults) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#666; font-size:12px;">No results found.</div>';
    }
}

// --- 4. NATIVE LIST INJECTION ---

function showFolderMenu(e, folders, chatTitle, fullUrl) {
    const existing = document.getElementById('gu-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'gu-context-menu';
    menu.className = 'gu-context-menu';

    menu.style.top = `${e.clientY}px`;
    if (window.innerWidth - e.clientX < 220) {
        menu.style.right = '50px';
    } else {
        menu.style.left = `${e.clientX}px`;
    }

    let html = `<div class="gu-context-header">Save to folder:</div>`;

    folders.forEach((f, idx) => {
        const color = f.color || '#888';
        html += `
            <div class="gu-context-item" data-idx="${idx}">
                <span class="gu-context-dot" style="background-color:${color}"></span>
                <span>${f.name}</span>
            </div>
        `;
    });

    menu.innerHTML = html;
    document.body.appendChild(menu);

    const items = menu.querySelectorAll('.gu-context-item');
    items.forEach(item => {
        item.onclick = () => {
            const idx = parseInt(item.getAttribute('data-idx'));
            if (folders[idx]) {
                folders[idx].chats.push({ title: chatTitle, url: fullUrl });
                folders[idx].isOpen = true;
                saveData(folders);
                menu.remove();
            }
        };
    });

    const closeMenu = (ev) => {
        if (!menu.contains(ev.target) && ev.target !== e.target) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 100);
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
                e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
                getData(currentFolders => {
                    if (currentFolders.length === 0) {
                        alert("Please create a folder in the right panel first.");
                        return;
                    }
                    showFolderMenu(e, currentFolders, chatTitle, fullUrl);
                });
            };
            chatDiv.appendChild(btn);
        }
    });
}

// --- 5. INITIALIZATION ---

function init() {
    if (document.getElementById('gu-floating-panel')) return;

    const style = document.createElement('style');
    style.textContent = CSS_STYLES;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'gu-floating-panel';
    panel.innerHTML = `
        <div class="gu-header">
            <span class="gu-title">🗂️ FOLDERS</span>
            <button id="gu-add-folder-btn" class="gu-btn-create">
                <span>+</span> New
            </button>
        </div>
        <div class="gu-search-container">
            <input type="text" id="gu-search-input" class="gu-search-box" placeholder="Search...">
        </div>
        <div id="gu-content-area"></div>
    `;

    document.body.appendChild(panel);

    document.getElementById('gu-add-folder-btn').onclick = () => {
        const name = prompt("Folder Name:");
        if(name && name.trim()) {
            getData(folders => {
                folders.push({
                    name: name.trim(),
                    isOpen: true,
                    chats: [],
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
                saveData(folders);
            });
        }
    };

    document.getElementById('gu-search-input').addEventListener('input', () => refreshUI());

    refreshUI();
    setInterval(() => refreshUI(), 2000); // Sync
}

const startLoop = setInterval(() => {
    if(!document.getElementById('gu-floating-panel')) init();
}, 1000);