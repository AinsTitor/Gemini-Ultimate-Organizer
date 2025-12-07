// config.js
export const SETTINGS = {
    BASE_STORAGE_KEY: 'gemini_organizer_data_v1',
    BASE_PROMPT_KEY: 'gemini_organizer_prompts_v1',
    TUTORIAL_KEY: 'gemini_organizer_tuto_v16_wide',
    STREAMER_KEY: 'gemini_organizer_streamer_mode',
    WIDE_KEY: 'gemini_organizer_wide_mode',
    // MIGRATION KEYS
    OLD_STORAGE_KEY: 'gemini_organizer_sync_v1',
    OLD_PROMPTS_KEY: 'gemini_prompts_data_v1',
    // NOUVELLES CLES DE MIGRATION (pour le thème ou la mise en page)
    OLD_THEME_KEY: 'gemini_organizer_theme_v1',
    OLD_LAYOUT_KEY: 'gemini_organizer_layout_v1'
};

export const COLORS = ['#3c4043', '#5c2b29', '#5c4615', '#254d29', '#0d4f4a', '#004a77', '#2c3c63', '#4a2a5e', '#663399', '#ff9900']; // Ajout de deux couleurs (pourpre et orange)
export const TAG_COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#e3e3e3', '#F08080', '#00FFFF']; // Ajout de deux couleurs claires supplémentaires (Rouge clair et Cyan)
export const EMOJIS = ['📁', '💼', '🎓', '💡', '🚀', '🤖', '💻', '🎨', '📝', '🎮', '🎬', '🎵', '🛒', '✈️', '🏠', '❤️', '⭐', '🔥', '✅', '🔒', '🔑', '⚡️', '🌳', '🍎', '🍖', '🏈', '🚗', '💵', '⌛️', '💬', '🛠️', '⚙️', '📈', '📉', '📚', '🗺️', '🛎️', '💡']; // Ajout de nouveaux émojis techniques/utilitaires

export const CSS_STYLES = `
    /* --- THEME VARIABLES (DEFAULT DARK) --- */
    #gu-floating-panel {
        --gu-bg-primary: #1e1f20;      /* Fond principal (Opaque) */
        --gu-bg-secondary: #2b2c2e;    /* Fond secondaire (Opaque) */
        --gu-text-primary: #e3e3e3;
        --gu-text-secondary: #9aa0a6;
        --gu-border-color: #444746;
        --gu-accent-color: #0b57d0;    /* Couleur dynamique */
        --gu-action-hover: #0842a0;
        --gu-item-hover: #35363a;      /* Survol élément (Opaque) */
        --gu-btn-hover: #3c4043;       /* Survol bouton (Opaque) */

        position: fixed; top: 80px; right: 20px; width: 360px;
        background-color: var(--gu-bg-primary);
        border: 1px solid var(--gu-border-color); border-radius: 12px;
        z-index: 99999;
        box-shadow: 0 10px 30px #000000; /* Ombre forte pour détacher le panneau */
        display: flex; flex-direction: column; max-height: 85vh;
        font-family: "Google Sans", sans-serif; transition: height 0.3s, opacity 0.3s;
    }

    /* LIGHT THEME OVERRIDE */
    body.gu-light-theme #gu-floating-panel {
        --gu-bg-primary: #ffffff;
        --gu-bg-secondary: #f0f4f9;
        --gu-text-primary: #1f1f1f;
        --gu-text-secondary: #444746;
        --gu-border-color: #e0e3e1;
        --gu-item-hover: #e8eaed;
        --gu-btn-hover: #e0e3e1;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    #gu-floating-panel.minimized { height: auto !important; max-height: 50px !important; overflow: hidden; }
    #gu-floating-panel.minimized #gu-content-wrapper { display: none; }
    #gu-floating-panel.minimized .gu-tabs-header { display: none; }

    /* HEADER */
    .gu-header {
        padding: 12px 14px; background: var(--gu-bg-primary); border-radius: 12px 12px 0 0; cursor: move;
        display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid var(--gu-border-color); gap: 4px;
    }
    .gu-title { color: var(--gu-text-primary); font-size: 14px; font-weight: 600; letter-spacing: 0.5px; pointer-events: none; margin-right: 4px; display:none; }

    .gu-user-badge {
        font-size: 10px; color: var(--gu-accent-color); background: var(--gu-bg-secondary);
        padding: 2px 6px; border-radius: 4px; border: 1px solid var(--gu-border-color);
        max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        margin-right: 2px; cursor: default;
    }

    /* Actions Containers */
    .gu-header-left { display: flex; align-items: center; gap: 4px; }
    .gu-header-right { display: flex; align-items: center; gap: 4px; }

    .gu-btn-create {
        background: var(--gu-accent-color); color: white; border: none; border-radius: 20px; padding: 0 10px; height: 26px;
        cursor: pointer; font-size: 11px; font-weight: 500; display: flex; align-items: center; gap: 4px; white-space: nowrap;
    }
    .gu-btn-create:hover { filter: brightness(1.1); }

    .gu-btn-icon-head {
        background: transparent; border: 1px solid var(--gu-border-color); color: var(--gu-text-secondary); font-size: 14px;
        cursor: pointer; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .gu-btn-icon-head:hover { color: var(--gu-text-primary); background: var(--gu-btn-hover); }
    .gu-btn-icon-head.active-streamer { color: #ff8989; border-color: #ff8989; background: #3c1515; }
    .gu-btn-icon-head.active-wide { color: var(--gu-accent-color); border-color: var(--gu-accent-color); background: var(--gu-bg-secondary); }

    /* NOUVEAU BOUTON EXPORT */
    .gu-btn-export {
        background: transparent; border: 1px solid var(--gu-border-color); color: var(--gu-text-secondary);
        font-size: 14px; cursor: pointer; width: 26px; height: 26px; border-radius: 4px;
        display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .gu-btn-export:hover { color: var(--gu-text-primary); background: var(--gu-btn-hover); }

    .gu-btn-min {
        background: transparent; border: 1px solid var(--gu-border-color); color: var(--gu-text-secondary); font-size: 12px;
        cursor: pointer; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold;
    }
    .gu-btn-min:hover { color: var(--gu-text-primary); background: var(--gu-btn-hover); }

    /* TABS */
    .gu-tabs-header { display: flex; border-bottom: 1px solid var(--gu-border-color); background: var(--gu-bg-secondary); }
    .gu-tab-btn { flex: 1; padding: 8px; text-align: center; cursor: pointer; color: var(--gu-text-secondary); font-size: 12px; font-weight: 600; background: transparent; border: none; border-bottom: 2px solid transparent; transition: 0.2s; }
    .gu-tab-btn:hover { color: var(--gu-text-primary); background: var(--gu-item-hover); }
    .gu-tab-btn.active { color: var(--gu-accent-color); border-bottom-color: var(--gu-accent-color); }

    #gu-content-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; position: relative; background: var(--gu-bg-primary); }
    .gu-panel-view { display: none; flex-direction: column; flex: 1; overflow: hidden; }
    .gu-panel-view.active { display: flex; }
    #gu-content-area, #gu-prompts-list { overflow-y: auto; scrollbar-width: thin; padding: 0; flex: 1; }

    /* Search */
    .gu-search-row { padding: 10px 16px; background: var(--gu-bg-primary); border-bottom: 1px solid var(--gu-border-color); }
    .gu-search-box {
        width: 100%; background: var(--gu-bg-secondary); border: 1px solid var(--gu-border-color); border-radius: 8px;
        padding: 8px 12px; color: var(--gu-text-primary); font-size: 13px; outline: none; box-sizing: border-box;
    }
    .gu-search-box:focus { border-color: var(--gu-accent-color); }

    /* PROMPTS */
    .gu-prompt-input-area { padding: 10px 16px; border-bottom: 1px solid var(--gu-border-color); display:flex; gap: 8px; }
    .gu-prompt-item {
        padding: 12px 16px; border-bottom: 1px solid var(--gu-border-color); cursor: pointer;
        display: flex; flex-direction: column; gap: 4px; transition: 0.2s; background: var(--gu-bg-primary);
    }
    .gu-prompt-item:hover { background: var(--gu-item-hover); }
    .gu-prompt-item:active { background: var(--gu-bg-secondary); }
    .gu-prompt-text { font-size: 12px; color: var(--gu-text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
    .gu-prompt-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .gu-prompt-name { font-weight: 600; font-size: 13px; color: var(--gu-text-primary); }
    .gu-prompt-actions { opacity: 0; transition: 0.2s; display: flex; gap: 4px; }
    .gu-prompt-item:hover .gu-prompt-actions { opacity: 1; }

    /* FOLDERS */
    .gu-folder-row {
        padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
        color: var(--gu-text-secondary); font-size: 13px; border-bottom: 1px solid var(--gu-border-color);
        border-left: 4px solid transparent; transition: background 0.2s; background: var(--gu-bg-primary);
    }
    .gu-folder-emoji {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        min-width: 24px; text-align: center; display: inline-flex; align-items: center; justify-content: center;
        font-style: normal; font-size: 14px;
    }
    .gu-folder-row:hover { background: var(--gu-item-hover); }
    .gu-folder-row.gu-drag-over { background: var(--gu-bg-secondary); border-left-color: var(--gu-accent-color) !important; }
    .gu-folder-left { display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1; }
    .gu-folder-actions { display: flex; gap: 2px; align-items: center; opacity: 1; transition: opacity 1.0s; }
    .gu-folder-row:hover .gu-folder-actions { opacity: 1; }
    .gu-count { font-size: 10px; background: var(--gu-bg-secondary); padding: 2px 6px; border-radius: 10px; color: var(--gu-text-secondary); margin-right: 4px; border: 1px solid var(--gu-border-color); }
    .gu-icon-btn { color: var(--gu-text-secondary); cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .gu-icon-btn:hover { background: var(--gu-btn-hover); color: var(--gu-text-primary); }
    .gu-icon-btn.delete:hover { color: #ff8989; background: #3c1515; }

    /* Color Picker */
    .gu-color-wrapper { position: relative; display: flex; align-items: center; margin-left: 2px;}
    .gu-color-input { position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 1; cursor: pointer; }
    .gu-color-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #555; }
    .gu-color-wrapper:hover .gu-color-dot { transform: scale(1.3); border-color: var(--gu-text-primary); }

    /* CHATS */
    .gu-folder-content { display: none; background: var(--gu-bg-primary); border-left: 4px solid var(--gu-bg-secondary); min-height: 5px; }
    .gu-folder-content.open { display: block; }

    .gu-chat-link {
        display: flex; flex-direction: column; padding: 8px 12px 8px 20px;
        color: var(--gu-text-secondary); text-decoration: none; font-size: 12px;
        border-bottom: 1px solid var(--gu-border-color); cursor: pointer; user-select: none;
    }
    .gu-chat-link:hover { background: var(--gu-item-hover); color: var(--gu-text-primary); }
    .gu-chat-link.gu-drag-over { border-top: 2px solid var(--gu-accent-color); }
    .gu-chat-link.pinned { background: var(--gu-bg-secondary); border-left: 2px solid var(--gu-accent-color); }
    .gu-chat-top-row { display: flex; align-items: center; width: 100%; }
    .gu-chat-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gu-chat-actions { display: none; align-items: center; gap: 2px; }
    .gu-chat-link:hover .gu-chat-actions { display: flex; }
    .gu-chat-del { color: var(--gu-text-secondary); font-weight: bold; padding: 2px 6px; }
    .gu-chat-del:hover { color: #ff8989; }
    .gu-chat-pin { color: var(--gu-text-secondary); font-size: 14px; padding: 2px 4px; }
    .gu-chat-pin:hover, .gu-chat-pin.active { color: var(--gu-accent-color); }
    .gu-chat-tag-btn { color: var(--gu-text-secondary); font-size: 14px; padding: 2px 4px; }
    .gu-chat-tag-btn:hover { color: var(--gu-accent-color); }

    /* TAGS */
    .gu-tags-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; padding-left: 16px; }
    .gu-tag {
        font-size: 10px; padding: 1px 6px; border-radius: 4px;
        color: #1f1f1f; font-weight: 600; cursor: pointer;
        display: inline-flex; align-items: center; border: 1px solid transparent;
    }
    .gu-tag:hover { opacity: 1.0; text-decoration: line-through; }

    /* MODALS */
    .gu-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.59); z-index: 1000000;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(4px); opacity: 0; animation: gu-fadein 0.2s forwards;
    }
    .gu-modal-content {
        background: #1e1f20; border: 1px solid var(--gu-border-color); border-radius: 16px;
        padding: 0; width: 400px; color: var(--gu-text-primary);
        box-shadow: 0 15px 40px #000000;
        transform: scale(0.95); animation: gu-scaleup 0.2s forwards; display: flex; flex-direction: column;
        max-height: 80vh;
    }
    .gu-modal-header {
        padding: 14px 20px; font-size: 14px; font-weight: 600; color: var(--gu-text-primary);
        border-bottom: 1px solid var(--gu-border-color); background: var(--gu-bg-secondary); border-radius: 16px 16px 0 0;
        display: flex; justify-content: space-between; align-items: center;
    }
    .gu-menu-close { cursor: pointer; font-size: 20px; color: var(--gu-text-secondary); line-height: 1; padding: 4px; }
    .gu-menu-close:hover { color: var(--gu-text-primary); }
    .gu-modal-body { padding: 20px; overflow-y: auto; }
    .gu-input-label { font-size: 12px; color: var(--gu-text-secondary); margin-bottom: 6px; display: block; font-weight: 600; }
    .gu-tag-input { width: 100%; background: var(--gu-bg-secondary); border: 1px solid var(--gu-border-color); color: var(--gu-text-primary); padding: 10px; border-radius: 8px; outline: none; box-sizing:border-box; font-size: 14px; }
    .gu-tag-input:focus { border-color: var(--gu-accent-color); }
    .gu-input-textarea { min-height: 100px; resize: vertical; font-family: inherit; }

    .gu-btn-action {
        width: 100%; margin-top: 15px; background: var(--gu-accent-color); color: white;
        border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .gu-btn-action:hover { filter: brightness(1.1); }

    /* EMOJI */
    .gu-emoji-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-top: 8px; border: 1px solid var(--gu-border-color); padding: 8px; border-radius: 8px; background: var(--gu-bg-secondary); }
    .gu-emoji-item { cursor: pointer; padding: 4px; text-align: center; border-radius: 4px; font-size: 16px; user-select: none; }
    .gu-emoji-item:hover { background: var(--gu-item-hover); }
    .gu-emoji-item.selected { background: var(--gu-accent-color); color: white; }

    /* BULK */
    .gu-bulk-list { max-height: 300px; overflow-y: auto; scrollbar-width: thin; margin-top: 10px; border: 1px solid var(--gu-border-color); border-radius: 8px; }
    .gu-bulk-item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid var(--gu-border-color); cursor: pointer; transition: background 0.2s; }
    .gu-bulk-item:hover { background: var(--gu-item-hover); }
    .gu-bulk-item.selected { background: var(--gu-bg-secondary); border-left: 3px solid var(--gu-accent-color); }
    .gu-bulk-checkbox {
        width: 18px; height: 18px; margin-right: 12px; accent-color: var(--gu-accent-color); cursor: pointer;
        flex-shrink: 0;
    }
    .gu-bulk-text { font-size: 13px; color: var(--gu-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gu-bulk-counter { font-size: 12px; color: var(--gu-accent-color); text-align: right; margin-top: 5px; }

    /* FLOAT ADD */
.gu-float-add {
        position: absolute;
        right: 45px; /* Plus proche du bord droit */
        top: 50%;
        transform: translateY(-50%);
        width: 24px; height: 24px;
        background: var(--gu-accent-color); /* Toujours coloré */
        border-radius: 50%;
        color: white; /* Texte blanc */
        display: flex; align-items: center; justify-content: center;
        font-weight: bold; cursor: pointer;
        z-index: 9999; /* Z-index élevé pour passer au-dessus du texte */
        border: 2px solid var(--gu-bg-primary); /* Petit contour pour le détacher */
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        font-size: 16px;
        line-height: 1;
    }
    .gu-float-add:hover {
        transform: translateY(-50%) scale(1.1);
        filter: brightness(1.2);
    }
    /* CONTEXT MENU (OPAQUE) */
    .gu-context-menu {
        position: fixed; background: #1e1f20; border: 1px solid var(--gu-border-color);
        border-radius: 8px; padding: 6px 0; z-index: 100000;
        box-shadow: 0 8px 20px #000000; min-width: 200px;
        display: flex; flex-direction: column;
    }
    .gu-context-header { padding: 8px 16px; font-size: 12px; font-weight: 600; color: var(--gu-text-secondary); border-bottom: 1px solid var(--gu-border-color); margin-bottom: 4px; }
    .gu-context-item { padding: 10px 16px; color: var(--gu-text-primary); cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; }
    .gu-context-item:hover { background: var(--gu-accent-color); color: white; }
    .gu-context-dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); }

    /* TAG MANAGER */
    .gu-active-tags-area { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
    .gu-active-tag-chip { background: var(--gu-bg-secondary); padding: 4px 8px; border-radius: 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--gu-text-primary); }
    .gu-active-tag-chip:hover { background: #ff5555; color: white; }
    .gu-color-picker-row { display: flex; gap: 8px; margin-top: 10px; justify-content: center; }
    .gu-color-choice { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
    .gu-color-choice.selected { border-color: var(--gu-text-primary); transform: scale(1.2); }
    .gu-tag-library { margin-top: 15px; border-top: 1px solid var(--gu-border-color); padding-top: 10px; }
    .gu-tag-list-scroll { max-height: 120px; overflow-y: auto; scrollbar-width: thin; }
    .gu-tag-option { padding: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gu-text-secondary); border-radius: 4px; }
    .gu-tag-option:hover { background: var(--gu-bg-secondary); color: var(--gu-text-primary); }
    .gu-tag-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* TOAST NOTIFICATION */
    .gu-toast {
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: var(--gu-bg-primary); color: var(--gu-text-primary); padding: 10px 20px; border-radius: 8px;
        box-shadow: 0 4px 12px #000000; z-index: 1000001; font-size: 13px;
        opacity: 0; animation: gu-toast-in 0.3s forwards, gu-toast-out 0.3s 2.5s forwards;
        display: flex; align-items: center; gap: 8px; border: 1px solid var(--gu-border-color);
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

    /* --- STREAMER MODE --- */
    body.gu-streamer-active .gu-chat-title,
    body.gu-streamer-active .gu-bulk-text,
    body.gu-streamer-active .gu-prompt-text,
    body.gu-streamer-active .gu-prompt-name,
    body.gu-streamer-active .gu-folder-left span:last-child {
        filter: blur(5px); transition: 0.3s;
    }
    body.gu-streamer-active #gu-user-badge {
        filter: blur(5px) !important;
        opacity: 1.0;
    }
    body.gu-streamer-active div[data-test-id="conversation"] .conversation-title {
        filter: blur(5px); transition: 0.3s;
    }
    body.gu-streamer-active .markdown,
    body.gu-streamer-active p,
    body.gu-streamer-active li {
        filter: blur(4px); transition: 0.2s;
    }
    body.gu-streamer-active .location-footer-textual,
    body.gu-streamer-active .location-footer-container {
        filter: blur(8px) !important;
        opacity: 1.0;
        pointer-events: none;
    }
    body.gu-streamer-active a[href^="https://accounts.google.com"],
    body.gu-streamer-active img[src*="googleusercontent.com/profile"],
    body.gu-streamer-active [aria-label*="Google Account"],
    body.gu-streamer-active [aria-label*="Compte Google"] {
        filter: blur(6px) !important;
        opacity: 1.0;
    }
    body.gu-streamer-active .side-nav-entry-container:has([aria-label="Mes contenus"]),
    body.gu-streamer-active .side-nav-entry-container:has([aria-label="My Stuff"]),
    body.gu-streamer-active my-stuff-recents-preview {
        filter: blur(10px) !important;
        opacity: 1.0;
        transition: 0.3s;
    }

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

    @keyframes gu-fadein { to { opacity: 1; } }
    @keyframes gu-scaleup { to { transform: scale(1); } }
`;