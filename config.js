// config.js
export const SETTINGS = {
    BASE_STORAGE_KEY: 'gemini_organizer_data_v1',
    BASE_PROMPT_KEY: 'gemini_organizer_prompts_v1',
    TUTORIAL_KEY: 'gemini_organizer_tuto_v16_wide',
    STREAMER_KEY: 'gemini_organizer_streamer_mode',
    WIDE_KEY: 'gemini_organizer_wide_mode',
    // MIGRATION KEYS
    OLD_STORAGE_KEY: 'gemini_organizer_sync_v1',
    OLD_PROMPTS_KEY: 'gemini_prompts_data_v1'
};

export const COLORS = ['#3c4043', '#5c2b29', '#5c4615', '#254d29', '#0d4f4a', '#004a77', '#2c3c63', '#4a2a5e'];
export const TAG_COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#e3e3e3'];
export const EMOJIS = ['📁', '💼', '🎓', '💡', '🚀', '🤖', '💻', '🎨', '📝', '🎮', '🎬', '🎵', '🛒', '✈️', '🏠', '❤️', '⭐', '🔥', '✅', '🔒', '🔑', '⚡️', '🌳', '🍎', '🍖', '🏈', '🚗', '💵', '⌛️', '💬'];

export const CSS_STYLES = `
    /* --- FLOATING PANEL --- */
    #gu-floating-panel {
        position: fixed; top: 80px; right: 20px; width: 360px;
        background-color: #1e1f20; border: 1px solid #444746; border-radius: 12px;
        z-index: 99999; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        display: flex; flex-direction: column; max-height: 85vh;
        font-family: "Google Sans", sans-serif; transition: height 0.3s, opacity 0.3s;
    }
    #gu-floating-panel.minimized { height: auto !important; max-height: 50px !important; overflow: hidden; }
    #gu-floating-panel.minimized #gu-content-wrapper { display: none; }
    #gu-floating-panel.minimized .gu-tabs-header { display: none; }

    /* HEADER */
    .gu-header {
        padding: 12px 14px; background: #1e1f20; border-radius: 12px 12px 0 0; cursor: move;
        display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; gap: 4px;
    }
    .gu-title { color: #e3e3e3; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; pointer-events: none; margin-right: 4px; display:none; }

    .gu-user-badge {
        font-size: 10px; color: #a8c7fa; background: rgba(168, 199, 250, 0.1);
        padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(168, 199, 250, 0.2);
        max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        margin-right: 2px; cursor: default;
    }

    /* Actions Containers */
    .gu-header-left { display: flex; align-items: center; gap: 4px; }
    .gu-header-right { display: flex; align-items: center; gap: 4px; }

    .gu-btn-create {
        background: #0b57d0; color: white; border: none; border-radius: 20px; padding: 0 10px; height: 26px;
        cursor: pointer; font-size: 11px; font-weight: 500; display: flex; align-items: center; gap: 4px; white-space: nowrap;
    }
    .gu-btn-create:hover { background: #0842a0; }

    .gu-btn-icon-head {
        background: transparent; border: 1px solid #444; color: #9aa0a6; font-size: 14px;
        cursor: pointer; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .gu-btn-icon-head:hover { color: white; background: rgba(255,255,255,0.1); }
    .gu-btn-icon-head.active-streamer { color: #ff8989; border-color: #ff8989; background: rgba(255,0,0,0.1); }
    .gu-btn-icon-head.active-wide { color: #a8c7fa; border-color: #a8c7fa; background: rgba(168, 199, 250, 0.1); }

    .gu-btn-min {
        background: transparent; border: 1px solid #444; color: #9aa0a6; font-size: 12px;
        cursor: pointer; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold;
    }
    .gu-btn-min:hover { color: white; background: rgba(255,255,255,0.1); }

    /* TABS */
    .gu-tabs-header { display: flex; border-bottom: 1px solid #333; background: #252627; }
    .gu-tab-btn { flex: 1; padding: 8px; text-align: center; cursor: pointer; color: #9aa0a6; font-size: 12px; font-weight: 600; background: transparent; border: none; border-bottom: 2px solid transparent; transition: 0.2s; }
    .gu-tab-btn:hover { color: #e3e3e3; background: rgba(255,255,255,0.02); }
    .gu-tab-btn.active { color: #a8c7fa; border-bottom-color: #a8c7fa; }

    #gu-content-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; position: relative; }
    .gu-panel-view { display: none; flex-direction: column; flex: 1; overflow: hidden; }
    .gu-panel-view.active { display: flex; }
    #gu-content-area, #gu-prompts-list { overflow-y: auto; scrollbar-width: thin; padding: 0; flex: 1; }

    /* Search */
    .gu-search-row { padding: 10px 16px; background: #1e1f20; border-bottom: 1px solid #333; }
    .gu-search-box {
        width: 100%; background: #282a2c; border: 1px solid #444; border-radius: 8px;
        padding: 8px 12px; color: #e3e3e3; font-size: 13px; outline: none; box-sizing: border-box;
    }
    .gu-search-box:focus { border-color: #0b57d0; }

    /* PROMPTS */
    .gu-prompt-input-area { padding: 10px 16px; border-bottom: 1px solid #333; display:flex; gap: 8px; }
    .gu-prompt-item {
        padding: 12px 16px; border-bottom: 1px solid #282a2c; cursor: pointer;
        display: flex; flex-direction: column; gap: 4px; transition: 0.2s;
    }
    .gu-prompt-item:hover { background: #2a2b2e; }
    .gu-prompt-item:active { background: #3c4043; }
    .gu-prompt-text { font-size: 12px; color: #c4c7c5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
    .gu-prompt-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .gu-prompt-name { font-weight: 600; font-size: 13px; color: #e3e3e3; }
    .gu-prompt-actions { opacity: 0; transition: 0.2s; display: flex; gap: 4px; }
    .gu-prompt-item:hover .gu-prompt-actions { opacity: 1; }

    /* FOLDERS */
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

    /* CHATS */
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

    /* TAGS */
    .gu-tags-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; padding-left: 16px; }
    .gu-tag {
        font-size: 10px; padding: 1px 6px; border-radius: 4px;
        color: #1f1f1f; font-weight: 600; cursor: pointer;
        display: inline-flex; align-items: center; border: 1px solid transparent;
    }
    .gu-tag:hover { opacity: 0.8; text-decoration: line-through; }

    /* MODALS */
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
    .gu-input-textarea { min-height: 100px; resize: vertical; font-family: inherit; }

    .gu-btn-action {
        width: 100%; margin-top: 15px; background: #0b57d0; color: white;
        border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .gu-btn-action:hover { background: #0842a0; }

    /* EMOJI */
    .gu-emoji-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-top: 8px; border: 1px solid #333; padding: 8px; border-radius: 8px; background: #1a1a1a; }
    .gu-emoji-item { cursor: pointer; padding: 4px; text-align: center; border-radius: 4px; font-size: 16px; user-select: none; }
    .gu-emoji-item:hover { background: #444; }
    .gu-emoji-item.selected { background: #0b57d0; color: white; }

    /* BULK */
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

    /* FLOAT ADD */
    .gu-float-add {
        position: absolute; right: 45px; top: 50%; transform: translateY(-50%);
        width: 26px; height: 26px; background: rgba(255,255,255,0.1);
        border-radius: 50%; color: #e3e3e3; display: flex; align-items: center; justify-content: center;
        font-weight: bold; cursor: pointer; z-index: 999; font-size: 16px;
        border: 1px solid rgba(255,255,255,0.2); transition: 0.2s;
    }
    .gu-float-add:hover { background: #0b57d0; border-color: #0b57d0; color: white; scale: 1.1; }

    /* CONTEXT MENU */
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

    /* TAG MANAGER */
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

    /* TOAST NOTIFICATION */
    .gu-toast {
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #333; color: #fff; padding: 10px 20px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 1000001; font-size: 13px;
        opacity: 0; animation: gu-toast-in 0.3s forwards, gu-toast-out 0.3s 2.5s forwards;
        display: flex; align-items: center; gap: 8px; border: 1px solid #555;
    }
    @keyframes gu-toast-in { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
    @keyframes gu-toast-out { from { opacity: 1; } to { opacity: 0; } }

    /* WIDE MODE */
    body.gu-wide-mode-active .input-area-container,
    body.gu-wide-mode-active .conversation-container,
    body.gu-wide-mode-active .bottom-container,
    body.gu-wide-mode-active .input-area {
        max-width: 95% !important; margin-left: auto !important; margin-right: auto !important;
    }
    body.gu-wide-mode-active .gmat-body-1 { max-width: 100% !important; }
    body.gu-wide-mode-active user-query { max-width: 90% !important; }
    body.gu-wide-mode-active model-response { max-width: 90% !important; }

    /* --- STREAMER MODE (ENHANCED BLUR & HIDE) --- */

    /* 1. EXTENSION INTERNALS */
    body.gu-streamer-active .gu-chat-title,
    body.gu-streamer-active .gu-bulk-text,
    body.gu-streamer-active .gu-prompt-text,
    body.gu-streamer-active .gu-prompt-name,
    body.gu-streamer-active .gu-folder-left span:last-child {
        filter: blur(5px); transition: 0.3s;
    }
    body.gu-streamer-active #gu-user-badge {
        filter: blur(5px) !important;
        opacity: 0.5;
    }

    /* 2. GEMINI CONTENT */
    body.gu-streamer-active div[data-test-id="conversation"] .conversation-title {
        filter: blur(5px); transition: 0.3s;
    }
    body.gu-streamer-active .markdown,
    body.gu-streamer-active p,
    body.gu-streamer-active li {
        filter: blur(4px); transition: 0.2s;
    }

    /* 3. LOCATION & SENSITIVE FOOTER */
    body.gu-streamer-active .location-footer-textual,
    body.gu-streamer-active .location-footer-container {
        filter: blur(8px) !important;
        opacity: 0.3;
        pointer-events: none; /* Prevent clicks on blurred location */
    }

    /* 4. USER PROFILE & EMAIL (Top Right) */
    body.gu-streamer-active a[href^="https://accounts.google.com"],
    body.gu-streamer-active img[src*="googleusercontent.com/profile"],
    body.gu-streamer-active [aria-label*="Google Account"],
    body.gu-streamer-active [aria-label*="Compte Google"] {
        filter: blur(6px) !important;
        opacity: 0.4;
    }

    /* 5. "MY STUFF" / "MES CONTENUS" SIDEBAR & PREVIEWS */
    /* Target the container holding the "My Stuff" button and preview cards */
    body.gu-streamer-active .side-nav-entry-container:has([aria-label="Mes contenus"]),
    body.gu-streamer-active .side-nav-entry-container:has([aria-label="My Stuff"]),
    body.gu-streamer-active my-stuff-recents-preview {
        filter: blur(10px) !important;
        opacity: 0.1;
        transition: 0.3s;
    }

    /* Reveal on Hover (Optional - good for user to check but keep hidden mostly) */
    body.gu-streamer-active .gu-chat-link:hover .gu-chat-title,
    body.gu-streamer-active .gu-prompt-item:hover .gu-prompt-text,
    body.gu-streamer-active .gu-prompt-item:hover .gu-prompt-name,
    body.gu-streamer-active .gu-folder-row:hover .gu-folder-left span:last-child,
    body.gu-streamer-active div[data-test-id="conversation"]:hover .conversation-title,
    body.gu-streamer-active .markdown:hover,
    body.gu-streamer-active p:hover,
    body.gu-streamer-active li:hover {
        filter: none;
        transition: 0.2s;
    }

    /* --- ANIMATIONS --- */
    @keyframes gu-fadein { to { opacity: 1; } }
    @keyframes gu-scaleup { to { transform: scale(1); } }
`;