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
/* --- FLOATING PANEL (GLASSMOPHISM) --- */
    #gu-floating-panel {
        position: fixed; top: 20px; right: 20px; width: 340px;
        /* Fond semi-transparent */
        background-color: rgba(30, 31, 32, 0.75);
        /* Effet de flou sur ce qui est derrière */
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);

        border: 1px solid rgba(255, 255, 255, 0.08); /* Bordure subtile */
        border-radius: 16px; /* Arrondis plus prononcés */
        z-index: 99999;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); /* Ombre plus douce et profonde */
        display: flex; flex-direction: column; max-height: 90vh;
        font-family: "Google Sans", sans-serif; transition: height 0.3s, opacity 0.3s;
    }
    #gu-floating-panel.minimized { height: auto !important; max-height: 40px !important; overflow: hidden; border: 1px solid #333; }
    #gu-floating-panel.minimized #gu-content-wrapper,
    #gu-floating-panel.minimized .gu-tabs-header { display: none; }

/* HEADER OPTIMIZED */
    .gu-header {
        padding: 6px 10px; background: #18191a; border-radius: 12px 12px 0 0; cursor: move;
        display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333;
    }
    .gu-header-group { display: flex; align-items: center; gap: 4px; }

    .gu-btn-icon-head {
        background: transparent; color: #9aa0a6; font-size: 14px;
        cursor: pointer; width: 26px; height: 26px; border-radius: 4px; border: none;
        display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .gu-btn-icon-head:hover { background: rgba(255,255,255,0.1); color: white; }
    .gu-btn-icon-head.active-mode { color: #a8c7fa; background: rgba(168, 199, 250, 0.15); }

    .gu-user-badge {
        font-size: 10px; color: #888; margin-left: 5px; max-width: 50px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

/* TABS MODERNES */
    .gu-tabs-header {
        display: flex;
        background: transparent; /* Plus de fond solide */
        padding: 10px 12px 0 12px;
        gap: 8px; /* Espace entre les onglets */
        border-bottom: none;
    }

    .gu-tab-btn {
        flex: 1;
        padding: 8px 12px;
        text-align: center;
        cursor: pointer;
        color: #9aa0a6;
        font-size: 12px;
        font-weight: 600;
        background: rgba(255,255,255,0.03); /* Fond très léger inactif */
        border: 1px solid transparent;
        border-radius: 8px; /* Forme de bouton */
        transition: all 0.2s ease;
    }

    .gu-tab-btn:hover {
        background: rgba(255,255,255,0.08);
        color: #e3e3e3;
    }

    .gu-tab-btn.active {
        background: rgba(168, 199, 250, 0.15); /* Bleu très léger */
        color: #a8c7fa; /* Bleu Google */
        border: 1px solid rgba(168, 199, 250, 0.3); /* Bordure bleue subtile */
        box-shadow: 0 2px 8px rgba(11, 87, 208, 0.2); /* Légère lueur */
    }
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
    .gu-prompt-item {
        padding: 12px 16px; border-bottom: 1px solid #282a2c; cursor: pointer;
        display: flex; flex-direction: column; gap: 4px; transition: 0.2s;
    }
    .gu-prompt-item:hover { background: #2a2b2e; }
    .gu-prompt-text { font-size: 12px; color: #c4c7c5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
    .gu-prompt-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .gu-prompt-name { font-weight: 600; font-size: 13px; color: #e3e3e3; }
    .gu-prompt-actions { opacity: 0; transition: 0.2s; display: flex; gap: 4px; }
    .gu-prompt-item:hover .gu-prompt-actions { opacity: 1; }
    /* STYLES POUR LES PROMPTS ÉPINGLÉS */
        .gu-prompt-item.pinned {
            border-left: 2px solid #a8c7fa; /* Bordure bleue à gauche */
            background: #1f221e; /* Fond légèrement différent (teinté vert sombre/gris) */
        }

        /* Bouton Pin actif */
        .gu-icon-btn.pin-p.active {
            color: #a8c7fa;
            opacity: 1;
        }

        /* Hover sur le bouton Pin */
        .gu-icon-btn.pin-p:hover {
            color: white;
            transform: scale(1.1);
        }

    /* FOLDERS (Chats & Prompts) */
.gu-folder-row {
        padding: 10px 12px;
        margin: 4px 8px; /* Espace autour de chaque dossier */
        border-radius: 8px; /* Coins arrondis */
        cursor: pointer;
        display: flex; justify-content: space-between; align-items: center;
        color: #c4c7c5; font-size: 13px;
        border: 1px solid transparent; /* Prépare la bordure */
        /* Plus de border-bottom ni border-left solide moche */
        background: rgba(255, 255, 255, 0.02); /* Fond très subtil par défaut */
        transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .gu-folder-emoji {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        min-width: 24px; text-align: center; display: inline-flex; align-items: center; justify-content: center;
        font-style: normal; font-size: 14px;
    }
 .gu-folder-row:hover {
         background: rgba(255, 255, 255, 0.08);
         transform: translateX(4px); /* Petit décalage vers la droite au survol */
         box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
     }
    .gu-folder-row.gu-drag-over { background: #3c4043; border-left-color: #a8c7fa !important; }
.gu-folder-left {
        display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1;
    }
    .gu-folder-actions { display: flex; gap: 2px; align-items: center; opacity: 0; transition: opacity 0.2s; }
    .gu-folder-row:hover .gu-folder-actions { opacity: 1; }
    .gu-count { font-size: 10px; background: #444; padding: 2px 6px; border-radius: 10px; color: #ccc; margin-right: 4px; }
.gu-icon-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%; /* Boutons ronds */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        color: #9aa0a6;
        transition: all 0.2s;
    }

    /* Effet générique au survol */
    .gu-icon-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        transform: scale(1.1);
    }
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
.gu-chat-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0; /* Caché par défaut */
        transform: translateX(10px); /* Décalé légèrement */
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        /* Fond "Glass" pour que les boutons ressortent bien */
        background: rgba(30, 31, 32, 0.9);
        padding: 2px 4px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
.gu-chat-link:hover .gu-chat-actions {
        opacity: 1;
        transform: translateX(0);
    }
    .gu-chat-pin { color: #8e918f; font-size: 14px; padding: 2px 4px; }
    .gu-chat-pin:hover, .gu-chat-pin.active { color: #a8c7fa; }

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
        max-height: 85vh;
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

    /* REORGANIZE MODAL MODERN */
    .gu-reorg-container { display: flex; flex-direction: column; gap: 10px; }
    .gu-reorg-folder {
        background: #282a2c; border: 1px solid #444; border-radius: 8px; overflow: hidden;
        transition: border-color 0.2s;
    }
    .gu-reorg-folder.drag-over { border-color: #a8c7fa; background: #303134; }
    .gu-reorg-header {
        padding: 10px 12px; background: #333; font-weight: 600; font-size: 13px; color: #e3e3e3;
        display: flex; justify-content: space-between; align-items: center; cursor: grab;
    }
    .gu-reorg-header:active { cursor: grabbing; }
    .gu-reorg-list { min-height: 10px; padding: 4px; }
    .gu-reorg-item {
        padding: 8px 10px; margin: 2px 0; background: #1e1f20; border-radius: 4px;
        font-size: 12px; color: #ccc; cursor: grab; border: 1px solid transparent;
        display: flex; justify-content: space-between; align-items: center;
    }
    .gu-reorg-item:hover { background: #3c4043; }
    .gu-reorg-item:active { cursor: grabbing; }
    .gu-reorg-item.pinned { border-left: 2px solid #a8c7fa; background: #252627; cursor: not-allowed; opacity: 0.7; }
    .gu-reorg-item.pinned:hover { background: #252627; }
    .gu-reorg-actions { display: flex; gap: 4px; }
    .gu-reorg-btn { padding: 2px 6px; background: #444; border-radius: 4px; cursor: pointer; font-size: 10px; }
    .gu-reorg-btn:hover { background: #555; color: white; }

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
        border-radius: 8px; padding: 6px 0;
        z-index: 2000000; /* <--- CORRECTION : Très élevé pour passer au-dessus de tout */
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

/* --- SMART STREAMER MODE v2 --- */

    /* 1. LOCALISATION (Disparition totale) */
    body.gu-hide-loc .footer-container,
    body.gu-hide-loc .location-footer-textual,
    body.gu-hide-loc [aria-label*="location"],
    body.gu-hide-loc [aria-label*="Location"] {
        display: none !important;
    }

    /* 2. MES CONTENUS (Images récentes) */
    body.gu-hide-content my-stuff-recents-preview,
    body.gu-hide-content .my-stuff-recents-preview {
        display: none !important;
    }

    /* 3. EMAIL & COMPTE (Header + Settings) */
    /* Badge Utilisateur (Header) */
    body.gu-hide-mail #gu-user-badge,
    body.gu-hide-mail a[href^="https://accounts.google.com"] img,
    body.gu-hide-mail a[aria-label*="Google Account"] {
        filter: blur(6px) !important; opacity: 0.5; transition: 0.3s;
    }
    body.gu-hide-mail #gu-user-badge:hover,
    body.gu-hide-mail a[href^="https://accounts.google.com"] img:hover {
        filter: none !important; opacity: 1;
    }
    /* Email dans les Paramètres (Settings) */
    body.gu-hide-mail .gu-settings-email {
        filter: blur(8px); cursor: pointer; transition: 0.3s;
    }
    body.gu-hide-mail .gu-settings-email:hover {
        filter: none;
    }

    /* 4. CHATS (La liste latérale de Gemini) */
    /* Par défaut : Flou */
    body.gu-hide-chat conversations-list .conversation-title,
    body.gu-hide-chat .conversation-container .title {
        filter: blur(6px); transition: filter 0.2s ease;
    }
    /* MAGIE : Révéler tout quand la souris est sur la barre latérale */
    body.gu-hide-chat conversations-list:hover .conversation-title,
    body.gu-hide-chat .conversation-container:hover .title {
        filter: none;
    }

    /* 5. DOSSIERS (Ton panneau latéral) */
    /* Flou des titres dans tes dossiers */
    body.gu-hide-folder .gu-chat-title,
    body.gu-hide-folder .gu-folder-left span:last-child {
        filter: blur(5px); transition: 0.3s;
    }
    /* Révéler au survol du panneau entier */
    body.gu-hide-folder #gu-content-area:hover .gu-chat-title,
    body.gu-hide-folder #gu-content-area:hover .gu-folder-left span:last-child {
        filter: none;
    }

    /* 6. PROMPTS */
    body.gu-hide-prompt .gu-prompt-text,
    body.gu-hide-prompt .gu-prompt-name {
        filter: blur(5px); transition: 0.3s;
    }
    /* Révéler au survol de la zone des prompts */
    body.gu-hide-prompt #gu-prompts-list:hover .gu-prompt-text,
    body.gu-hide-prompt #gu-prompts-list:hover .gu-prompt-name {
        filter: none;
    }

    /* --- MOBILE ADAPTATIONS --- */
        @media (max-width: 600px) {
            /* Panneau en plein écran ou presque */
            #gu-floating-panel {
                width: 90% !important;
                right: 5% !important;
                left: 5% !important;
                top: 60px !important; /* Pour ne pas cacher la barre d'URL en haut */
                max-height: 80vh !important;
            }

            /* Les boutons d'actions toujours visibles (pas de hover) */
            .gu-chat-actions {
                opacity: 1 !important;
                transform: translateX(0) !important;
                background: rgba(30, 31, 32, 1); /* Fond solide */
            }

            /* Bouton Add Folder plus petit */
            .gu-btn-create-folder {
                padding: 0 10px;
                font-size: 11px;
            }

            /* Masquer le texte "New Folder" pour gagner de la place */
            .gu-btn-create-folder span:not(:first-child) {
                display: none;
            }
        }

        /* --- SLASH COMMANDS --- */
            #gu-slash-menu {
                position: absolute; bottom: 80px; left: 20px; z-index: 10000;
                background: #1e1f20; border: 1px solid #444; border-radius: 8px;
                width: 200px; box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
                display: none; flex-direction: column; overflow: hidden;
            }
            .gu-slash-item { padding: 10px 15px; cursor: pointer; color: #e3e3e3; font-size: 13px; display: flex; justify-content: space-between; }
            .gu-slash-item:hover { background: #0b57d0; }
            .gu-slash-cmd { font-family: monospace; color: #a8c7fa; }
            /* Style pour la sélection clavier */
                .gu-slash-item.selected {
                    background: #0b57d0 !important; /* Mettre en surbrillance en bleu */
                    color: white !important;
                }

            /* 7. FOCUS MODE (Interface Cachée - Intégré au Streamer) */

                /* Éléments à masquer : Sidebar, Header, Footer, Disclaimer */
                body.gu-hide-ui bard-sidenav,                /* <--- Sidebar */
                body.gu-hide-ui hallucination-disclaimer,    /* <--- Disclaimer du bas */
                body.gu-hide-ui conversation-history-sidebar,
                body.gu-hide-ui .chat-header,
                body.gu-hide-ui chat-header,
                body.gu-hide-ui .chat-footer,
                body.gu-hide-ui footer,
                body.gu-hide-ui page-footer {
                    display: none !important;
                }

                /* Centrer et élargir le chat pour remplir l'écran */
                body.gu-hide-ui .page-wrapper,
                body.gu-hide-ui .chat-page-component,
                body.gu-hide-ui .conversation-container {
                    width: 100% !important;
                    max-width: none !important;
                    padding-top: 0 !important;
                    margin: 0 !important;
                }


            /* --- SHOW HIDDEN CHATS --- */
            /* Par défaut, on cache les éléments marqués comme archivés */
            body:not(.gu-show-archived) .gu-archived-item { display: none !important; }
            /* Si l'option est activée, on les montre mais en grisé */
            body.gu-show-archived .gu-archived-item {
                display: flex !important; opacity: 0.5; filter: grayscale(1);
                border-left: 2px solid #555;
            }

            /* --- BACKUPS & VARS --- */
            .gu-backup-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #333; font-size: 12px; color: #ccc; }
            .gu-backup-btn { padding: 2px 8px; background: #254d29; border-radius: 4px; border: none; color: white; cursor: pointer; font-size: 11px; }
            .gu-var-btn { background: #333; border: 1px solid #555; color: #a8c7fa; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 10px; }
            .gu-var-btn:hover { border-color: #a8c7fa; }

    /* --- ANIMATIONS --- */
    @keyframes gu-fadein { to { opacity: 1; } }
    @keyframes gu-scaleup { to { transform: scale(1); } }

    /* Bouton SHARE (Lien) */
        .gu-icon-btn.share:hover {
            color: #72e0d3; /* Cyan clair */
            background: rgba(114, 224, 211, 0.2);
        }
    /* --- HIGHLIGHT MENU (Menu flottant) --- */
        #gu-highlight-menu {
            position: absolute; z-index: 999999;
            background: #1e1f20; border: 1px solid #444; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 6px;
            display: none; gap: 6px; align-items: center;
            animation: gu-fadein 0.2s;
        }
        .gu-hl-btn {
            width: 24px; height: 24px; border-radius: 50%; cursor: pointer;
            border: 2px solid transparent; transition: transform 0.2s;
        }
        .gu-hl-btn:hover { transform: scale(1.2); border-color: white; }

        /* Couleurs de surlignement */
        .gu-bg-red { background-color: #5c2b29 !important; color: #ffadad !important; }
        .gu-bg-blue { background-color: #2c3c63 !important; color: #a0c4ff !important; }
        .gu-bg-green { background-color: #254d29 !important; color: #caffbf !important; }
        .gu-bg-yellow { background-color: #5c4615 !important; color: #fdffb6 !important; }

        /* --- NOTEPAD TAB --- */
        .gu-note-card {
            background: #282a2c; border: 1px solid #444; border-radius: 8px;
            margin-bottom: 10px; padding: 10px; position: relative;
            border-left: 4px solid transparent; /* Couleur définie dynamiquement */
        }
        .gu-note-text {
            font-size: 13px; color: #e3e3e3; font-style: italic; margin-bottom: 8px;
            display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
            border-left: 2px solid #444; padding-left: 8px;
        }
        .gu-note-comment {
            background: #18191a; border: 1px solid #333; border-radius: 4px;
            padding: 6px; font-size: 12px; color: #ccc; width: 100%; box-sizing: border-box;
            resize: vertical; min-height: 40px; outline: none;
        }
        .gu-note-comment:focus { border-color: #0b57d0; }

        .gu-filter-bar {
            display: flex; gap: 5px; padding: 10px; border-bottom: 1px solid #333;
            justify-content: center; background: #1e1f20;
        }
        .gu-filter-btn {
            width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; opacity: 0.5;
        }
        .gu-filter-btn.active { opacity: 1; border-color: white; transform: scale(1.1); }
        .gu-filter-btn.all { background: #666; border-radius: 4px; width: auto; padding: 0 8px; font-size: 10px; color: white; display: flex; align-items: center; }
        .gu-note-text {
                font-size: 13px; color: #e3e3e3; font-style: italic; margin-bottom: 4px;
                /* Par défaut : coupé à 3 lignes */
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                white-space: pre-wrap; /* Garde les retours à la ligne */
            }

            /* Quand on clique sur afficher plus */
            .gu-note-text.expanded {
                -webkit-line-clamp: unset;
                overflow: visible;
            }

            /* Style du bouton "Afficher plus" */
            .gu-read-more-btn {
                background: none; border: none; padding: 0;
                color: #a8c7fa; cursor: pointer; font-size: 11px;
                margin-bottom: 8px; text-decoration: underline;
                display: inline-block;
            }
            .gu-read-more-btn:hover { color: white; }
        `;