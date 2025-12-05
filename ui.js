// ui.js
import { CSS_STYLES, COLORS, TAG_COLORS, EMOJIS, SETTINGS } from './config.js';
import * as Storage from './storage.js';

// --- SYSTÈME DE TRADUCTION DYNAMIQUE (Dictionnaire interne) ---
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },      // NOUVEAU
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },     // AJOUT pour couverture européenne
    { code: 'ru', name: 'Русский' },
    { code: 'zh_CN', name: '中文 (简体)' }, // Légère clarification pour le Chinois
    { code: 'ja', name: '日本語' },       // NOUVEAU
    { code: 'ko', name: '한국어' },       // NOUVEAU
    { code: 'ar', name: 'العربية' },      // NOUVEAU
    { code: 'th', name: 'ภาษาไทย' }
];

const LANG_STORAGE_KEY = 'gemini_organizer_lang';
let currentLanguage = 'en'; // Langue par défaut en mémoire

// Dictionnaire complet des traductions pour le changement dynamique
const TRANSLATIONS = {
    en: {
        settings_title: "Settings",
        new_folder: "New Folder",
        folders_tab: "FOLDERS",
        prompts_tab: "PROMPTS",
        search_folders_placeholder: "Search folders & chats...",
        search_prompts_placeholder: "Search saved prompts...",
        new_prompt_btn: "+ New Prompt",
        prompt_help_title: "Dynamic Prompts Help",
        edit_folder: "Edit Folder",
        delete_folder_confirm: "Delete?",
        manage_tags_title: "Manage Tags",
        wide_mode_on: "Wide Mode: ON",
        wide_mode_off: "Wide Mode: OFF",
        streamer_mode_on: "Streamer Mode: ON",
        streamer_mode_off: "Streamer Mode: OFF",
        bulk_organize_title: "Bulk Organize",
        current_account: "Current Account",
        select_language: "Select Language",
        export_data: "⬇ Export Data (JSON)",
        import_data: "⬆ Import Data",
        ext_name: "Gemini Organizer",
        save: "Save",
        name: "NAME",
        icon: "ICON",
        folder_empty_message: "Click <b>+ New</b> to create a folder.",
        prompt_empty_message: "No prompts found.<br>Click <b>+ New</b> to add one.",
        delete_prompt_confirm: "Delete this prompt?",
        edit_prompt: "Edit Prompt",
        save_prompt: "Save Prompt",
        prompt_content: "CONTENT",
        fill_vars_title: "Fill Variables",
        customize_prompt: "Customize your prompt:",
        generate_insert: "Generate & Insert",
        filter_chats_placeholder: "Filter chats...",
        no_new_chats_found: "No new chats found to organize.",
        select_folder_placeholder: "Select Destination Folder...",
        move_selected: "Move Selected",
        active_tags_label: "ACTIVE TAGS",
        no_tags_yet: "No tags yet",
        add_new_tag: "ADD NEW TAG",
        tag_name_placeholder: "Tag name...",
        add_tag: "Add Tag",
        library_label: "LIBRARY",
        tutorial_welcome: "🎉 Welcome to v16!",
        tutorial_upgrade: "Efficiency Upgrade:",
        tutorial_wide_mode: "Wide Mode: Stretch Gemini to full width.",
        tutorial_hotkeys: "Hotkeys: <code>Alt+W</code> (Wide), <code>Alt+S</code> (Streamer).",
        tutorial_toasts: "Toasts: Visual confirmation for your actions.",
        tutorial_button: "Let's Go!",
        add_to_folder: "Add to folder:",
        no_folder_alert: "Please create a folder first.",
        no_input_box_alert: "Could not find Gemini input box."
    },
    fr: {
        settings_title: "Réglages",
        new_folder: "Nouveau Dossier",
        folders_tab: "DOSSIERS",
        prompts_tab: "PROMPTS",
        search_folders_placeholder: "Rechercher dossiers & discussions...",
        search_prompts_placeholder: "Rechercher prompts sauvegardées...",
        new_prompt_btn: "+ Nouveau Prompt",
        prompt_help_title: "Aide Prompts Dynamiques",
        edit_folder: "Modifier le Dossier",
        delete_folder_confirm: "Supprimer ?",
        manage_tags_title: "Gérer les TAGS",
        wide_mode_on: "Mode Large : ACTIVÉ",
        wide_mode_off: "Mode Large : DÉSACTIVÉ",
        streamer_mode_on: "Mode Streamer : ACTIVÉ",
        streamer_mode_off: "Mode Streamer : DÉSACTIVÉ",
        bulk_organize_title: "Organisation en Vrac",
        current_account: "Compte Actuel",
        select_language: "Sélectionner la langue",
        export_data: "⬇ Exporter les données (JSON)",
        import_data: "⬆ Importer les données",
        ext_name: "Organisateur Gemini",
        save: "Sauvegarder",
        name: "NOM",
        icon: "ICÔNE",
        folder_empty_message: "Cliquez sur <b>+ Nouveau</b> pour créer un dossier.",
        prompt_empty_message: "Aucune prompte trouvée.<br>Cliquez sur <b>+ Nouveau</b> pour en ajouter une.",
        delete_prompt_confirm: "Supprimer ce prompt ?",
        edit_prompt: "Modifier la Prompte",
        save_prompt: "Sauvegarder la Prompte",
        prompt_content: "CONTENU",
        fill_vars_title: "Remplir les Variables",
        customize_prompt: "Personnalisez votre prompte :",
        generate_insert: "Générer & Insérer",
        filter_chats_placeholder: "Filtrer les discussions...",
        no_new_chats_found: "Aucune nouvelle discussion trouvée à organiser.",
        select_folder_placeholder: "Sélectionner le Dossier de Destination...",
        move_selected: "Déplacer la Sélection",
        active_tags_label: "TAGS ACTIVES",
        no_tags_yet: "Aucun tags pour l'instant",
        add_new_tag: "AJOUTER UN NOUVEAU TAGS",
        tag_name_placeholder: "Nom de l'étiquette...",
    add_tag: "Ajouter un TAGS",
        library_label: "BIBLIOTHÈQUE",
        tutorial_welcome: "🎉 Bienvenue dans la v16 !",
        tutorial_upgrade: "Amélioration de l'efficacité :",
        tutorial_wide_mode: "Mode Large : Étirez Gemini sur toute la largeur.",
        tutorial_hotkeys: "Raccourcis : <code>Alt+W</code> (Large), <code>Alt+S</code> (Streamer).",
        tutorial_toasts: "Notifications : Confirmation visuelle de vos actions.",
        tutorial_button: "C'est parti !",
        add_to_folder: "Ajouter au dossier :",
        no_folder_alert: "Veuillez créer un dossier d'abord.",
        no_input_box_alert: "Impossible de trouver la boîte de saisie Gemini."
    },
    es: {
        settings_title: "Ajustes",
        new_folder: "Nueva Carpeta",
        folders_tab: "CARPETAS",
        prompts_tab: "PROMPTS",
        search_folders_placeholder: "Buscar carpetas y chats...",
        search_prompts_placeholder: "Buscar prompts guardados...",
        new_prompt_btn: "+ Nuevo Prompt",
        prompt_help_title: "Ayuda Prompts Dinámicos",
        edit_folder: "Editar Carpeta",
        delete_folder_confirm: "¿Eliminar?",
        manage_tags_title: "Gestionar Etiquetas",
        wide_mode_on: "Modo Ancho: ACTIVADO",
        wide_mode_off: "Modo Ancho: DESACTIVADO",
        streamer_mode_on: "Modo Streamer: ACTIVADO",
        streamer_mode_off: "Modo Streamer: DESACTIVADO",
        bulk_organize_title: "Organización Masiva",
        current_account: "Cuenta Actual",
        select_language: "Seleccionar Idioma",
        export_data: "⬇ Exportar Datos (JSON)",
        import_data: "⬆ Importar Datos",
        ext_name: "Organizador Gemini",
        save: "Guardar",
        name: "NOMBRE",
        icon: "ICONO",
        folder_empty_message: "Haz clic en <b>+ Nuevo</b> para crear una carpeta.",
        prompt_empty_message: "No se encontraron prompts.<br>Haz clic en <b>+ Nuevo</b> para añadir uno.",
        delete_prompt_confirm: "¿Eliminar este prompt?",
        edit_prompt: "Editar Prompt",
        save_prompt: "Guardar Prompt",
        prompt_content: "CONTENIDO",
        fill_vars_title: "Rellenar Variables",
        customize_prompt: "Personaliza tu prompt:",
        generate_insert: "Generar e Insertar",
        filter_chats_placeholder: "Filtrar chats...",
        no_new_chats_found: "No se encontraron nuevos chats para organizar.",
        select_folder_placeholder: "Seleccionar Carpeta de Destino...",
        move_selected: "Mover Seleccionado",
        active_tags_label: "ETIQUETAS ACTIVAS",
        no_tags_yet: "Aún no hay etiquetas",
        add_new_tag: "AÑADIR NUEVA ETIQUETA",
        tag_name_placeholder: "Nombre de la etiqueta...",
        add_tag: "Añadir Etiqueta",
        library_label: "BIBLIOTECA",
        tutorial_welcome: "🎉 ¡Bienvenido a la v16!",
        tutorial_upgrade: "Mejora de la eficiencia:",
        tutorial_wide_mode: "Modo Ancho: Estira Gemini a todo el ancho.",
        tutorial_hotkeys: "Atajos: <code>Alt+W</code> (Ancho), <code>Alt+S</code> (Streamer).",
        tutorial_toasts: "Notificaciones: Confirmación visual de tus acciones.",
        tutorial_button: "¡Vamos!",
        add_to_folder: "Añadir a carpeta:",
        no_folder_alert: "Por favor, crea una carpeta primero.",
        no_input_box_alert: "No se pudo encontrar el cuadro de entrada de Gemini."
    },
    ru: {
        settings_title: "Настройки",
        new_folder: "Новая папка",
        folders_tab: "ПАПКИ",
        prompts_tab: "ПРОМПТЫ",
        search_folders_placeholder: "Поиск папок и чатов...",
        search_prompts_placeholder: "Поиск сохраненных промптов...",
        new_prompt_btn: "+ Новый промпт",
        prompt_help_title: "Помощь по промптам",
        edit_folder: "Редактировать",
        delete_folder_confirm: "Удалить?",
        manage_tags_title: "Управление тегами",
        wide_mode_on: "Широкий режим: ВКЛ",
        wide_mode_off: "Широкий режим: ВЫКЛ",
        streamer_mode_on: "Режим стримера: ВКЛ",
        streamer_mode_off: "Режим стримера: ВЫКЛ",
        bulk_organize_title: "Массовая орг.",
        current_account: "Аккаунт",
        select_language: "Язык",
        export_data: "⬇ Экспорт",
        import_data: "⬆ Импорт",
        ext_name: "Органайзер Gemini",
        save: "Сохранить",
        name: "ИМЯ",
        icon: "ИКОНКА",
        folder_empty_message: "Нажмите <b>+ Новый</b> для создания папки.",
        prompt_empty_message: "Нет промптов.<br>Нажмите <b>+ Новый</b>.",
        delete_prompt_confirm: "Удалить?",
        edit_prompt: "Ред. промпт",
        save_prompt: "Сохранить",
        prompt_content: "СОДЕРЖАНИЕ",
        fill_vars_title: "Переменные",
        customize_prompt: "Настройка:",
        generate_insert: "Вставить",
        filter_chats_placeholder: "Фильтр...",
        no_new_chats_found: "Нет новых чатов.",
        select_folder_placeholder: "Выберите папку...",
        move_selected: "Переместить",
        active_tags_label: "ТЕГИ",
        no_tags_yet: "Нет тегов",
        add_new_tag: "ДОБАВИТЬ ТЕГ",
        tag_name_placeholder: "Имя тега...",
        add_tag: "Добавить",
        library_label: "БИБЛИОТЕКА",
        tutorial_welcome: "🎉 Привет в v16!",
        tutorial_upgrade: "Обновление:",
        tutorial_wide_mode: "Широкий режим Gemini.",
        tutorial_hotkeys: "Хоткеи: Alt+W, Alt+S.",
        tutorial_toasts: "Уведомления включены.",
        tutorial_button: "Поехали!",
        add_to_folder: "В папку:",
        no_folder_alert: "Создайте папку.",
        no_input_box_alert: "Поле ввода не найдено."
    },
zh_CN: {
        settings_title: "设置",
        new_folder: "新建文件夹",
        folders_tab: "文件夹",
        prompts_tab: "提示词",
        search_folders_placeholder: "搜索文件夹和聊天...",
        search_prompts_placeholder: "搜索已保存的提示词...",
        new_prompt_btn: "+ 新建提示词",
        prompt_help_title: "动态提示词帮助",
        edit_folder: "编辑文件夹",
        delete_folder_confirm: "删除？",
        manage_tags_title: "管理标签",
        wide_mode_on: "宽屏模式：开启",
        wide_mode_off: "宽屏模式：关闭",
        streamer_mode_on: "主播模式：开启",
        streamer_mode_off: "主播模式：关闭",
        bulk_organize_title: "批量整理",
        current_account: "当前账户",
        select_language: "选择语言",
        export_data: "⬇ 导出数据 (JSON)",
        import_data: "⬆ 导入数据",
        ext_name: "Gemini 整理器",
        save: "保存",
        name: "名称",
        icon: "图标",
        folder_empty_message: "点击 <b>+ 新建</b> 创建文件夹。",
        prompt_empty_message: "未找到提示词。<br>点击 <b>+ 新建</b> 添加一个。",
        delete_prompt_confirm: "删除此提示词？",
        edit_prompt: "编辑提示词",
        save_prompt: "保存提示词",
        prompt_content: "内容",
        fill_vars_title: "填写变量",
        customize_prompt: "自定义您的提示词：",
        generate_insert: "生成并插入",
        filter_chats_placeholder: "筛选聊天...",
        no_new_chats_found: "未找到需要整理的新聊天。",
        select_folder_placeholder: "选择目标文件夹...",
        move_selected: "移动选中项",
        active_tags_label: "当前标签",
        no_tags_yet: "暂无标签",
        add_new_tag: "添加新标签",
        tag_name_placeholder: "标签名称...",
        add_tag: "添加标签",
        library_label: "标签库",
        tutorial_welcome: "🎉 欢迎使用 v16！",
        tutorial_upgrade: "效率升级：",
        tutorial_wide_mode: "宽屏模式：将 Gemini 扩展至全屏。",
        tutorial_hotkeys: "快捷键：<code>Alt+W</code> (宽屏)，<code>Alt+S</code> (主播)。",
        tutorial_toasts: "通知：操作的视觉确认。",
        tutorial_button: "开始使用！",
        add_to_folder: "添加到文件夹：",
        no_folder_alert: "请先创建一个文件夹。",
        no_input_box_alert: "找不到 Gemini 输入框。"
    },
pt: {
        settings_title: "Configurações",
        new_folder: "Nova Pasta",
        folders_tab: "PASTAS",
        prompts_tab: "PROMPTS",
        search_folders_placeholder: "Pesquisar pastas e chats...",
        search_prompts_placeholder: "Pesquisar prompts salvos...",
        new_prompt_btn: "+ Novo Prompt",
        prompt_help_title: "Ajuda Prompts Dinâmicos",
        edit_folder: "Editar Pasta",
        delete_folder_confirm: "Excluir?",
        manage_tags_title: "Gerenciar Tags",
        wide_mode_on: "Modo Amplo: ATIVADO",
        wide_mode_off: "Modo Amplo: DESATIVADO",
        streamer_mode_on: "Modo Streamer: ATIVADO",
        streamer_mode_off: "Modo Streamer: DESATIVADO",
        bulk_organize_title: "Organização em Massa",
        current_account: "Conta Atual",
        select_language: "Selecionar Idioma",
        export_data: "⬇ Exportar Dados (JSON)",
        import_data: "⬆ Importar Dados",
        ext_name: "Organizador Gemini",
        save: "Salvar",
        name: "NOME",
        icon: "ÍCONE",
        folder_empty_message: "Clique em <b>+ Novo</b> para criar uma pasta.",
        prompt_empty_message: "Nenhum prompt encontrado.<br>Clique em <b>+ Novo</b> para adicionar um.",
        delete_prompt_confirm: "Excluir este prompt?",
        edit_prompt: "Editar Prompt",
        save_prompt: "Salvar Prompt",
        prompt_content: "CONTEÚDO",
        fill_vars_title: "Preencher Variáveis",
        customize_prompt: "Personalize seu prompt:",
        generate_insert: "Gerar e Inserir",
        filter_chats_placeholder: "Filtrar chats...",
        no_new_chats_found: "Nenhum chat novo para organizar.",
        select_folder_placeholder: "Selecionar Pasta de Destino...",
        move_selected: "Mover Selecionados",
        active_tags_label: "TAGS ATIVAS",
        no_tags_yet: "Sem tags ainda",
        add_new_tag: "ADICIONAR NOVA TAG",
        tag_name_placeholder: "Nome da tag...",
        add_tag: "Adicionar Tag",
        library_label: "BIBLIOTECA",
        tutorial_welcome: "🎉 Bem-vindo à v16!",
        tutorial_upgrade: "Atualização de Eficiência:",
        tutorial_wide_mode: "Modo Amplo: Estenda o Gemini para a largura total.",
        tutorial_hotkeys: "Atalhos: <code>Alt+W</code> (Amplo), <code>Alt+S</code> (Streamer).",
        tutorial_toasts: "Toasts: Confirmação visual para suas ações.",
        tutorial_button: "Vamos lá!",
        add_to_folder: "Adicionar à pasta:",
        no_folder_alert: "Por favor, crie uma pasta primeiro.",
        no_input_box_alert: "Não foi possível encontrar a caixa de entrada do Gemini."
    },
th: {
        settings_title: "การตั้งค่า",
        new_folder: "โฟลเดอร์ใหม่",
        folders_tab: "โฟลเดอร์",
        prompts_tab: "พรอมต์",
        search_folders_placeholder: "ค้นหาโฟลเดอร์และแชท...",
        search_prompts_placeholder: "ค้นหาพรอมต์ที่บันทึกไว้...",
        new_prompt_btn: "+ พรอมต์ใหม่",
        prompt_help_title: "วิธีใช้พรอมต์แบบไดนามิก",
        edit_folder: "แก้ไขโฟลเดอร์",
        delete_folder_confirm: "ลบ?",
        manage_tags_title: "จัดการแท็ก",
        wide_mode_on: "โหมดกว้าง: เปิด",
        wide_mode_off: "โหมดกว้าง: ปิด",
        streamer_mode_on: "โหมดสตรีมเมอร์: เปิด",
        streamer_mode_off: "โหมดสตรีมเมอร์: ปิด",
        bulk_organize_title: "จัดระเบียบจำนวนมาก",
        current_account: "บัญชีปัจจุบัน",
        select_language: "เลือกภาษา",
        export_data: "⬇ ส่งออกข้อมูล (JSON)",
        import_data: "⬆ นำเข้าข้อมูล",
        ext_name: "ตัวจัดระเบียบ Gemini",
        save: "บันทึก",
        name: "ชื่อ",
        icon: "ไอคอน",
        folder_empty_message: "คลิก <b>+ ใหม่</b> เพื่อสร้างโฟลเดอร์",
        prompt_empty_message: "ไม่พบพรอมต์<br>คลิก <b>+ ใหม่</b> เพื่อเพิ่ม",
        delete_prompt_confirm: "ลบพรอมต์นี้หรือไม่?",
        edit_prompt: "แก้ไขพรอมต์",
        save_prompt: "บันทึกพรอมต์",
        prompt_content: "เนื้อหา",
        fill_vars_title: "กรอกตัวแปร",
        customize_prompt: "ปรับแต่งพรอมต์ของคุณ:",
        generate_insert: "สร้างและแทรก",
        filter_chats_placeholder: "กรองแชท...",
        no_new_chats_found: "ไม่พบแชทใหม่ที่ต้องจัดระเบียบ",
        select_folder_placeholder: "เลือกโฟลเดอร์ปลายทาง...",
        move_selected: "ย้ายที่เลือก",
        active_tags_label: "แท็กที่ใช้งานอยู่",
        no_tags_yet: "ยังไม่มีแท็ก",
        add_new_tag: "เพิ่มแท็กใหม่",
        tag_name_placeholder: "ชื่อแท็ก...",
        add_tag: "เพิ่มแท็ก",
        library_label: "คลัง",
        tutorial_welcome: "🎉 ยินดีต้อนรับสู่ v16!",
        tutorial_upgrade: "อัปเกรดประสิทธิภาพ:",
        tutorial_wide_mode: "โหมดกว้าง: ขยาย Gemini ให้เต็มความกว้าง",
        tutorial_hotkeys: "ปุ่มลัด: <code>Alt+W</code> (กว้าง), <code>Alt+S</code> (สตรีมเมอร์)",
        tutorial_toasts: "การแจ้งเตือน: การยืนยันด้วยภาพสำหรับการกระทำของคุณ",
        tutorial_button: "เริ่มเลย!",
        add_to_folder: "เพิ่มไปยังโฟลเดอร์:",
        no_folder_alert: "โปรดสร้างโฟลเดอร์ก่อน",
        no_input_box_alert: "ไม่พบกล่องข้อความ Gemini"
    },
de: {
    settings_title: "Einstellungen",
    new_folder: "Neuer Ordner",
    new_btn: "Neu", // Clé du bouton court "+ Neu"
    folders_tab: "ORDNER",
    prompts_tab: "PROMPTS",
    search_folders_placeholder: "Ordner & Chats suchen...",
    search_prompts_placeholder: "Gespeicherte Prompts suchen...",
    new_prompt_btn: "+ Neuer Prompt",
    prompt_help_title: "Hilfe zu Dynamischen Prompts",
    edit_folder: "Ordner bearbeiten",
    delete_folder_confirm: "Löschen?",
    manage_tags_title: "Tags verwalten",
    wide_mode_on: "Breitbildmodus: AN",
    wide_mode_off: "Breitbildmodus: AUS",
    streamer_mode_on: "Streamer-Modus: AN",
    streamer_mode_off: "Streamer-Modus: AUS",
    bulk_organize_title: "Massenorganisation",
    current_account: "Aktuelles Konto",
    select_language: "Sprache auswählen",
    export_data: "⬇ Daten exportieren (JSON)",
    import_data: "⬆ Daten importieren",
    ext_name: "Gemini Organizer",
    save: "Speichern",
    name: "NAME",
    icon: "ICON",
    folder_empty_message: "Klicken Sie auf <b>+ Neu</b>, um einen Ordner zu erstellen.",
    prompt_empty_message: "Keine Prompts gefunden.<br>Klicken Sie auf <b>+ Neu</b>, um einen hinzuzufügen.",
    delete_prompt_confirm: "Diesen Prompt löschen?",
    edit_prompt: "Prompt bearbeiten",
    save_prompt: "Prompt speichern",
    prompt_content: "INHALT",
    fill_vars_title: "Variablen ausfüllen",
    customize_prompt: "Passen Sie Ihren Prompt an:",
    generate_insert: "Generieren & Einfügen",
    filter_chats_placeholder: "Chats filtern...",
    no_new_chats_found: "Keine neuen Chats zur Organisation gefunden.",
    select_folder_placeholder: "Zielordner auswählen...",
    move_selected: "Auswahl verschieben",
    active_tags_label: "AKTIVE TAGS",
    no_tags_yet: "Noch keine Tags",
    add_new_tag: "NEUEN TAG HINZUFÜGEN",
    tag_name_placeholder: "Tag-Name...",
    add_tag: "Tag hinzufügen",
    library_label: "BIBLIOTHEK",
    tutorial_welcome: "🎉 Willkommen bei v16!",
    tutorial_upgrade: "Effizienz-Upgrade:",
    tutorial_wide_mode: "Breitbildmodus: Gemini auf volle Breite strecken.",
    tutorial_hotkeys: "Hotkeys: <code>Alt+W</code> (Breit), <code>Alt+S</code> (Streamer).",
    tutorial_toasts: "Pop-ups: Visuelle Bestätigung Ihrer Aktionen.",
    tutorial_button: "Los geht's!",
    add_to_folder: "Zu Ordner hinzufügen:",
    no_folder_alert: "Bitte erstellen Sie zuerst einen Ordner.",
    no_input_box_alert: "Gemini-Eingabefeld konnte nicht gefunden werden.",
    invalid_json_alert: "Ungültiges JSON",
    overwrite_confirm: "Aktuelle Daten überschreiben?"
    },
it: {
        settings_title: "Impostazioni",
        new_folder: "Nuova Cartella",
        new_btn: "Nuovo",
        folders_tab: "CARTELLE",
        prompts_tab: "PROMPT",
        search_folders_placeholder: "Cerca cartelle e chat...",
        search_prompts_placeholder: "Cerca prompt salvati...",
        new_prompt_btn: "+ Nuovo Prompt",
        prompt_help_title: "Aiuto Prompt Dinamici",
        edit_folder: "Modifica Cartella",
        delete_folder_confirm: "Eliminare?",
        manage_tags_title: "Gestisci Tag",
        wide_mode_on: "Modalità Ampia: ON",
        wide_mode_off: "Modalità Ampia: OFF",
        streamer_mode_on: "Modalità Streamer: ON",
        streamer_mode_off: "Modalità Streamer: OFF",
        bulk_organize_title: "Organizzazione di Massa",
        current_account: "Account Attuale",
        select_language: "Seleziona Lingua",
        export_data: "⬇ Esporta Dati (JSON)",
        import_data: "⬆ Importa Dati",
        ext_name: "Gemini Organizer",
        save: "Salva",
        name: "NOME",
        icon: "ICONA",
        folder_empty_message: "Clicca su <b>+ Nuovo</b> per creare una cartella.",
        prompt_empty_message: "Nessun prompt trovato.<br>Clicca su <b>+ Nuovo</b> per aggiungerne uno.",
        delete_prompt_confirm: "Eliminare questo prompt?",
        edit_prompt: "Modifica Prompt",
        save_prompt: "Salva Prompt",
        prompt_content: "CONTENUTO",
        fill_vars_title: "Compila Variabili",
        customize_prompt: "Personalizza il tuo prompt:",
        generate_insert: "Genera e Inserisci",
        filter_chats_placeholder: "Filtra chat...",
        no_new_chats_found: "Nessuna nuova chat trovata da organizzare.",
        select_folder_placeholder: "Seleziona Cartella di Destinazione...",
        move_selected: "Sposta Selezionati",
        active_tags_label: "TAG ATTIVI",
        no_tags_yet: "Nessun tag ancora",
        add_new_tag: "AGGIUNGI NUOVO TAG",
        tag_name_placeholder: "Nome del tag...",
        add_tag: "Aggiungi Tag",
        library_label: "LIBRERIA",
        tutorial_welcome: "🎉 Benvenuto nella v16!",
        tutorial_upgrade: "Aggiornamento Efficienza:",
        tutorial_wide_mode: "Modalità Ampia: Estendi Gemini a tutto schermo.",
        tutorial_hotkeys: "Scorciatoie: <code>Alt+W</code> (Ampia), <code>Alt+S</code> (Streamer).",
        tutorial_toasts: "Notifiche: Conferma visiva delle tue azioni.",
        tutorial_button: "Andiamo!",
        add_to_folder: "Aggiungi a cartella:",
        no_folder_alert: "Crea prima una cartella.",
        no_input_box_alert: "Impossibile trovare la casella di input di Gemini.",
        invalid_json_alert: "JSON non valido",
        overwrite_confirm: "Sovrascrivere i dati attuali?"
    },
ja: {
        settings_title: "設定",
        new_folder: "新しいフォルダ",
        new_btn: "新規",
        folders_tab: "フォルダ",
        prompts_tab: "プロンプト",
        search_folders_placeholder: "フォルダとチャットを検索...",
        search_prompts_placeholder: "保存されたプロンプトを検索...",
        new_prompt_btn: "+ 新規プロンプト",
        prompt_help_title: "動的プロンプトのヘルプ",
        edit_folder: "フォルダを編集",
        delete_folder_confirm: "削除しますか？",
        manage_tags_title: "タグの管理",
        wide_mode_on: "ワイドモード: ON",
        wide_mode_off: "ワイドモード: OFF",
        streamer_mode_on: "配信者モード: ON",
        streamer_mode_off: "配信者モード: OFF",
        bulk_organize_title: "一括整理",
        current_account: "現在のアカウント",
        select_language: "言語を選択",
        export_data: "⬇ データのエクスポート (JSON)",
        import_data: "⬆ データのインポート",
        ext_name: "Gemini オーガナイザー",
        save: "保存",
        name: "名前",
        icon: "アイコン",
        folder_empty_message: "<b>+ 新規</b> をクリックしてフォルダを作成します。",
        prompt_empty_message: "プロンプトが見つかりません。<br><b>+ 新規</b> をクリックして追加してください。",
        delete_prompt_confirm: "このプロンプトを削除しますか？",
        edit_prompt: "プロンプトの編集",
        save_prompt: "プロンプトを保存",
        prompt_content: "内容",
        fill_vars_title: "変数を入力",
        customize_prompt: "プロンプトをカスタマイズ:",
        generate_insert: "生成して挿入",
        filter_chats_placeholder: "チャットをフィルタリング...",
        no_new_chats_found: "整理する新しいチャットは見つかりませんでした。",
        select_folder_placeholder: "移動先のフォルダを選択...",
        move_selected: "選択項目を移動",
        active_tags_label: "アクティブなタグ",
        no_tags_yet: "タグはまだありません",
        add_new_tag: "新しいタグを追加",
        tag_name_placeholder: "タグ名...",
        add_tag: "タグを追加",
        library_label: "ライブラリ",
        tutorial_welcome: "🎉 v16へようこそ！",
        tutorial_upgrade: "効率化アップグレード:",
        tutorial_wide_mode: "ワイドモード: Geminiを全幅に拡大表示します。",
        tutorial_hotkeys: "ショートカット: <code>Alt+W</code> (ワイド), <code>Alt+S</code> (配信).",
        tutorial_toasts: "通知: 操作を視覚的に確認できます。",
        tutorial_button: "さあ、始めましょう！",
        add_to_folder: "フォルダに追加:",
        no_folder_alert: "先にフォルダを作成してください。",
        no_input_box_alert: "Geminiの入力ボックスが見つかりませんでした。",
        invalid_json_alert: "無効なJSONです",
        overwrite_confirm: "現在のデータを上書きしますか？"
    },
ko: {
        settings_title: "설정",
        new_folder: "새 폴더",
        new_btn: "신규",
        folders_tab: "폴더",
        prompts_tab: "프롬프트",
        search_folders_placeholder: "폴더 및 채팅 검색...",
        search_prompts_placeholder: "저장된 프롬프트 검색...",
        new_prompt_btn: "+ 새 프롬프트",
        prompt_help_title: "동적 프롬프트 도움말",
        edit_folder: "폴더 편집",
        delete_folder_confirm: "삭제하시겠습니까?",
        manage_tags_title: "태그 관리",
        wide_mode_on: "와이드 모드: 켜짐",
        wide_mode_off: "와이드 모드: 꺼짐",
        streamer_mode_on: "스트리머 모드: 켜짐",
        streamer_mode_off: "스트리머 모드: 꺼짐",
        bulk_organize_title: "일괄 정리",
        current_account: "현재 계정",
        select_language: "언어 선택",
        export_data: "⬇ 데이터 내보내기 (JSON)",
        import_data: "⬆ 데이터 가져오기",
        ext_name: "Gemini 오거나이저",
        save: "저장",
        name: "이름",
        icon: "아이콘",
        folder_empty_message: "<b>+ 신규</b>를 클릭하여 폴더를 만드세요.",
        prompt_empty_message: "프롬프트가 없습니다.<br>추가하려면 <b>+ 신규</b>를 클릭하세요.",
        delete_prompt_confirm: "이 프롬프트를 삭제하시겠습니까?",
        edit_prompt: "프롬프트 편집",
        save_prompt: "프롬프트 저장",
        prompt_content: "내용",
        fill_vars_title: "변수 입력",
        customize_prompt: "프롬프트 사용자 정의:",
        generate_insert: "생성 및 삽입",
        filter_chats_placeholder: "채팅 필터링...",
        no_new_chats_found: "정리할 새 채팅이 없습니다.",
        select_folder_placeholder: "대상 폴더 선택...",
        move_selected: "선택 항목 이동",
        active_tags_label: "활성 태그",
        no_tags_yet: "태그 없음",
        add_new_tag: "새 태그 추가",
        tag_name_placeholder: "태그 이름...",
        add_tag: "태그 추가",
        library_label: "라이브러리",
        tutorial_welcome: "🎉 v16에 오신 것을 환영합니다!",
        tutorial_upgrade: "효율성 업그레이드:",
        tutorial_wide_mode: "와이드 모드: Gemini를 전체 너비로 확장합니다.",
        tutorial_hotkeys: "단축키: <code>Alt+W</code> (와이드), <code>Alt+S</code> (스트리머).",
        tutorial_toasts: "알림: 작업에 대한 시각적 확인.",
        tutorial_button: "시작하기!",
        add_to_folder: "폴더에 추가:",
        no_folder_alert: "먼저 폴더를 생성해주세요.",
        no_input_box_alert: "Gemini 입력창을 찾을 수 없습니다.",
        invalid_json_alert: "유효하지 않은 JSON",
        overwrite_confirm: "현재 데이터를 덮어쓰시겠습니까?"
    },
ar: {
        settings_title: "الإعدادات",
        new_folder: "مجلد جديد",
        new_btn: "جديد",
        folders_tab: "المجلدات",
        prompts_tab: "المطالبات",
        search_folders_placeholder: "البحث في المجلدات والمحادثات...",
        search_prompts_placeholder: "البحث في المطالبات المحفوظة...",
        new_prompt_btn: "+ مطالبة جديدة",
        prompt_help_title: "مساعدة المطالبات الديناميكية",
        edit_folder: "تعديل المجلد",
        delete_folder_confirm: "حذف؟",
        manage_tags_title: "إدارة العلامات",
        wide_mode_on: "الوضع العريض: مفعل",
        wide_mode_off: "الوضع العريض: معطل",
        streamer_mode_on: "وضع البث: مفعل",
        streamer_mode_off: "وضع البث: معطل",
        bulk_organize_title: "تنظيم جماعي",
        current_account: "الحساب الحالي",
        select_language: "اختر اللغة",
        export_data: "⬇ تصدير البيانات (JSON)",
        import_data: "⬆ استيراد البيانات",
        ext_name: "منظم Gemini",
        save: "حفظ",
        name: "الاسم",
        icon: "الأيقونة",
        folder_empty_message: "انقر فوق <b>+ جديد</b> لإنشاء مجلد.",
        prompt_empty_message: "لم يتم العثور على مطالبات.<br>انقر فوق <b>+ جديد</b> لإضافة واحدة.",
        delete_prompt_confirm: "حذف هذه المطالبة؟",
        edit_prompt: "تعديل المطالبة",
        save_prompt: "حفظ المطالبة",
        prompt_content: "المحتوى",
        fill_vars_title: "ملء المتغيرات",
        customize_prompt: "تخصيص المطالبة الخاصة بك:",
        generate_insert: "إنشاء وإدراج",
        filter_chats_placeholder: "تصفية المحادثات...",
        no_new_chats_found: "لم يتم العثور على محادثات جديدة للتنظيم.",
        select_folder_placeholder: "اختر المجلد الوجهة...",
        move_selected: "نقل المحدد",
        active_tags_label: "العلامات النشطة",
        no_tags_yet: "لا توجد علامات بعد",
        add_new_tag: "إضافة علامة جديدة",
        tag_name_placeholder: "اسم العلامة...",
        add_tag: "إضافة علامة",
        library_label: "المكتبة",
        tutorial_welcome: "🎉 مرحبًا بك في v16!",
        tutorial_upgrade: "ترقية الكفاءة:",
        tutorial_wide_mode: "الوضع العريض: تمديد Gemini إلى العرض الكامل.",
        tutorial_hotkeys: "الاختصارات: <code>Alt+W</code> (عريض), <code>Alt+S</code> (بث).",
        tutorial_toasts: "تنبيهات: تأكيد مرئي لإجراءاتك.",
        tutorial_button: "لنبدأ!",
        add_to_folder: "إضافة إلى مجلد:",
        no_folder_alert: "يرجى إنشاء مجلد أولاً.",
        no_input_box_alert: "تعذر العثور على مربع إدخال Gemini.",
        invalid_json_alert: "JSON غير صالح",
        overwrite_confirm: "هل تريد استبدال البيانات الحالية؟"
    }
};

// Fonction de traduction hybride : Cherche dans TRANSLATIONS, sinon fallback sur chrome.i18n
function t(key) {
    if (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) {
        return TRANSLATIONS[currentLanguage][key];
    }
    // Fallback sur l'anglais si la traduction manque dans la langue actuelle
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
        return TRANSLATIONS['en'][key];
    }
    return chrome.i18n.getMessage(key) || key;
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

export function toggleStreamerMode() {
    const isActive = document.body.classList.contains('gu-streamer-active');
    const btn = document.getElementById('gu-btn-streamer');
    if (isActive) {
        document.body.classList.remove('gu-streamer-active');
        localStorage.setItem(SETTINGS.STREAMER_KEY, 'false');
        if(btn) btn.classList.remove('active-streamer');
        showToast(`${t('streamer_mode_off')}`, "👁️");
    } else {
        document.body.classList.add('gu-streamer-active');
        localStorage.setItem(SETTINGS.STREAMER_KEY, 'true');
        if(btn) btn.classList.add('active-streamer');
        showToast(`${t('streamer_mode_on')}`, "🙈");
    }
}

export function initStreamerMode() {
    const saved = localStorage.getItem(SETTINGS.STREAMER_KEY);
    if (saved === 'true') {
        document.body.classList.add('gu-streamer-active');
        const btn = document.getElementById('gu-btn-streamer');
        if(btn) btn.classList.add('active-streamer');
    }
}

export function toggleWideMode() {
    const isActive = document.body.classList.contains('gu-wide-mode-active');
    const btn = document.getElementById('gu-btn-wide');
    if (isActive) {
        document.body.classList.remove('gu-wide-mode-active');
        localStorage.setItem(SETTINGS.WIDE_KEY, 'false');
        if(btn) btn.classList.remove('active-wide');
        showToast(`${t('wide_mode_off')}`, "↔️");
    } else {
        document.body.classList.add('gu-wide-mode-active');
        localStorage.setItem(SETTINGS.WIDE_KEY, 'true');
        if(btn) btn.classList.add('active-wide');
        showToast(`${t('wide_mode_on')}`, "↔️");
    }
}

export function initWideMode() {
    const saved = localStorage.getItem(SETTINGS.WIDE_KEY);
    if (saved === 'true') {
        document.body.classList.add('gu-wide-mode-active');
        const btn = document.getElementById('gu-btn-wide');
        if(btn) btn.classList.add('active-wide');
    }
}

// --- RENDER CORE ---
export function refreshUI() {
    Storage.getData(folders => {
        renderPanelContent(folders);
        injectButtonsInNativeList(folders);
        updateUserBadge();
    });
    refreshPromptsUI();
}

function updateUserBadge() {
    const badge = document.getElementById('gu-user-badge');
    if (badge) {
        const u = Storage.getCurrentUser();
        badge.innerText = u === 'default_user' ? 'Guest' : u;
        badge.title = `Data saved for: ${u}`;
    }
}

// --- DRAG & DROP LOGIC ---
function handleFolderDrop(e, targetIdx) {
    e.preventDefault();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type === 'chat') {
            Storage.getData(allFolders => {
                const sourceF = allFolders[data.folderIdx];
                const targetF = allFolders[targetIdx];
                if (sourceF && targetF) {
                    const chat = sourceF.chats.splice(data.chatIdx, 1)[0];
                    targetF.chats.push(chat);
                    targetF.isOpen = true;
                    Storage.saveData(allFolders, refreshUI);
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
            Storage.getData(allFolders => {
                const f = allFolders[folderIdx];
                const movedChat = f.chats.splice(data.chatIdx, 1)[0];
                if (targetChatIdx !== null) {
                    let insertAt = targetChatIdx;
                    if (data.chatIdx < targetChatIdx) insertAt--;
                    f.chats.splice(insertAt, 0, movedChat);
                } else {
                    f.chats.push(movedChat);
                }
                Storage.saveData(allFolders, refreshUI);
            });
        }
    } catch(err){}
}

function moveChat(folder, idx, dir, allFolders) {
    if (idx + dir >= 0 && idx + dir < folder.chats.length) {
        [folder.chats[idx], folder.chats[idx + dir]] = [folder.chats[idx + dir], folder.chats[idx]];
        Storage.saveData(allFolders, refreshUI);
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

        header.addEventListener('dragover', e => { e.preventDefault(); header.classList.add('gu-drag-over'); });
        header.addEventListener('dragleave', () => header.classList.remove('gu-drag-over'));
        header.addEventListener('drop', (e) => handleFolderDrop(e, idx));

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
            content.addEventListener('dragover', e => e.preventDefault());
            content.addEventListener('drop', e => handleChatReorderDrop(e, idx));

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
                            <span class="gu-icon-btn gu-chat-tag-btn" title="${t('manage_tags_title')}">#</span>
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
                link.querySelector('.c-del').onclick = (e) => { e.stopPropagation(); folder.chats.splice(chatIdx, 1); Storage.saveData(folders, refreshUI); };
                link.querySelector('.gu-chat-pin').onclick = (e) => { e.stopPropagation(); chat.isPinned = !chat.isPinned; Storage.saveData(folders, refreshUI); };
                link.querySelector('.gu-chat-tag-btn').onclick = (e) => { e.stopPropagation(); showAdvancedTagMenu(e, chat, folders); };
                link.onclick = () => window.location.href = chat.url;
                content.appendChild(link);
            });
            div.appendChild(content);
        }
        container.appendChild(div);
    });
}

export function refreshPromptsUI() {
    Storage.getPrompts(prompts => {
        const list = document.getElementById('gu-prompts-list');
        const searchInput = document.getElementById('gu-search-input');
        if(!list) return;

        const searchText = searchInput ? searchInput.value.toLowerCase() : "";
        list.innerHTML = '';

        const filtered = prompts.filter(p => p.name.toLowerCase().includes(searchText) || p.content.toLowerCase().includes(searchText));

        if (filtered.length === 0) {
             list.innerHTML = `<div style="padding:20px; text-align:center; color:#666; font-size:12px;">${t('prompt_empty_message')}</div>`;
             return;
        }

        filtered.forEach((p, idx) => {
            const item = document.createElement('div');
            item.className = 'gu-prompt-item';
            item.innerHTML = `
                <div class="gu-prompt-meta">
                    <span class="gu-prompt-name">${p.name}</span>
                    <div class="gu-prompt-actions">
                        <span class="gu-icon-btn edit-p">✎</span>
                        <span class="gu-icon-btn delete-p">×</span>
                    </div>
                </div>
                <div class="gu-prompt-text">${p.content}</div>
            `;
            item.onclick = () => handlePromptClick(p.content);
            item.querySelector('.edit-p').onclick = (e) => { e.stopPropagation(); showCreatePromptModal(p, idx); };
            item.querySelector('.delete-p').onclick = (e) => {
                e.stopPropagation();
                if(confirm(t('delete_prompt_confirm'))) {
                    prompts.splice(idx, 1);
                    Storage.savePrompts(prompts);
                }
            };
            list.appendChild(item);
        });
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
                <span>${existingFolder ? t('edit_folder') : t('new_folder')}</span>
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

export function showCreatePromptModal(existingPrompt = null, existingIdx = null) {
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
                <span class="gu-input-label" style="margin-top:15px;">${t('prompt_content')}</span>
                <textarea id="gu-prompt-content" class="gu-tag-input gu-input-textarea" placeholder="Ex: Explain {{topic}} like I am 5...">${existingPrompt ? existingPrompt.content : ''}</textarea>
                <button id="gu-save-prompt" class="gu-btn-action">${t('save_prompt')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.gu-menu-close').onclick = () => modal.remove();
    modal.querySelector('#gu-save-prompt').onclick = () => {
        const name = modal.querySelector('#gu-prompt-name').value.trim();
        const content = modal.querySelector('#gu-prompt-content').value.trim();
        if(!name || !content) return;
        Storage.getPrompts(prompts => {
            if(existingPrompt && existingIdx !== null) {
                prompts[existingIdx] = { name, content };
            } else {
                prompts.push({ name, content });
            }
            Storage.savePrompts(prompts);
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

// --- Fonction de rafraichissement des textes statiques ---
function refreshMainButtons() {
    const panel = document.getElementById('gu-floating-panel');
    if (!panel) return;

    // 1. Boutons principaux et tooltips
    document.getElementById('gu-btn-settings').title = t('settings_title');
    document.getElementById('gu-btn-wide').title = `${t('wide_mode_off').replace(': OFF', '').replace(': DÉSACTIVÉ', '').trim()} (Alt+W)`;
    document.getElementById('gu-btn-streamer').title = `${t('streamer_mode_off').replace(': OFF', '').replace(': DÉSACTIVÉ', '').trim()} (Alt+S)`;
    document.getElementById('gu-btn-bulk').title = t('bulk_organize_title');

    // FIX DU "DOUBLE TEXTE"
    const addFolderBtn = document.getElementById('gu-add-folder-btn');
    if (addFolderBtn) {
        addFolderBtn.title = t('new_folder');
        addFolderBtn.innerHTML = `<span>+</span> ${t('new_folder').replace('Folder', '').replace('Dossier', '').trim()}`;
    }

    // FIX DU BOUTON PROMPT & HELP
    const addPromptBtn = document.getElementById('gu-add-prompt-btn');
    if (addPromptBtn) {
        addPromptBtn.innerText = t('new_prompt_btn');
    }
    const helpPromptBtn = document.getElementById('gu-help-prompt-btn');
    if (helpPromptBtn) {
        helpPromptBtn.title = t('prompt_help_title');
    }

    // 2. Tabs
    document.getElementById('gu-tab-folders').innerText = t('folders_tab');
    document.getElementById('gu-tab-prompts').innerText = t('prompts_tab');

    // 3. Search placeholder
    const searchInput = document.getElementById('gu-search-input');
    if (searchInput) {
        if (document.getElementById('gu-tab-folders').classList.contains('active')) {
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

    // Construction des options de langue
    const languageOptions = LANGUAGES.map(lang =>
        `<option value="${lang.code}">${lang.name}</option>`
    ).join('');

    modal.innerHTML = `
        <div class="gu-modal-content">
            <div class="gu-modal-header"><span>${t('settings_title')}</span><span class="gu-menu-close">×</span></div>
            <div class="gu-modal-body" style="text-align:center;">
                <p style="color:#a8c7fa; font-size:12px; margin-bottom:15px;">${t('current_account')}: <b>${user}</b></p>

                <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; padding: 0 10px;">
                    <span class="gu-input-label" style="text-align:left; margin-bottom: 0;">${t('select_language')}</span>
                    <select id="gu-language-select" class="gu-tag-input" style="margin-top:0;">
                        ${languageOptions}
                    </select>
                </div>

                <button id="gu-export" class="gu-btn-action" style="background:#333; margin-top:0;">${t('export_data')}</button>
                <button id="gu-import" class="gu-btn-action" style="background:#333;">${t('import_data')}</button>
                <input type="file" id="gu-import-file" style="display:none" accept=".json">
                <p style="color:#666; font-size:12px; margin-top:20px;">${t('ext_name')} v16.0</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // --- LOGIQUE DE LANGUE ---
    const langSelect = document.getElementById('gu-language-select');

    // Charger la langue actuelle depuis la variable locale ou le storage
    chrome.storage.local.get([LANG_STORAGE_KEY], (res) => {
        langSelect.value = res[LANG_STORAGE_KEY] || 'en';
    });

    // Enregistrer la langue et mettre à jour l'UI INSTANTANÉMENT
    langSelect.onchange = (e) => {
        const newLang = e.target.value;
        currentLanguage = newLang; // Mise à jour de la variable locale
        chrome.storage.local.set({ [LANG_STORAGE_KEY]: newLang }, () => {
            refreshMainButtons();
            refreshUI();
        });
    };
    // -------------------------

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
                if(confirm(t('overwrite_confirm'))) Storage.saveData(d, refreshUI);
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

// --- NATIVE INJECTION HELPERS ---
function showFolderMenu(e, folders, chatTitle, fullUrl) {
    const existing = document.getElementById('gu-context-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.id = 'gu-context-menu';
    menu.className = 'gu-context-menu';
    const rect = e.target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left - 150}px`;
    let html = `<div class="gu-context-header">${t('add_to_folder')}</div>`;
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
                Storage.saveData(folders, refreshUI);
                menu.remove();
            }
        };
    });
    const closeMenu = (ev) => { if (!menu.contains(ev.target) && ev.target !== e.target) menu.remove(); };
    setTimeout(() => document.addEventListener('click', closeMenu, {once:true}), 100);
}

export function injectButtonsInNativeList(folders) {
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
            btn.title = t('add_to_folder');
            btn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                Storage.getData(currentFolders => {
                    if (currentFolders.length === 0) return alert(t('no_folder_alert'));
                    showFolderMenu(e, currentFolders, chatTitle, fullUrl);
                });
            };
            chatDiv.appendChild(btn);
        }
    });
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
                <div class="gu-modal-step" style="display:flex; gap:10px; align-items:center;"><div class="gu-step-icon">↔️</div><div><b>${t('wide_mode_off').replace(': OFF', '').trim()}</b>: ${t('tutorial_wide_mode')}</div></div>
                <div class="gu-modal-step" style="display:flex; gap:10px; align-items:center;"><div class="gu-step-icon">⌨️</div><div><b>${t('tutorial_hotkeys').split(':')[0]}</b>: ${t('tutorial_hotkeys').split(':')[1].trim()}</div></div>
                <div class="gu-modal-step" style="display:flex; gap:10px; align-items:center;"><div class="gu-step-icon">🍞</div><div><b>${t('tutorial_toasts').split(':')[0]}</b>: ${t('tutorial_toasts').split(':')[1].trim()}</div></div>
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
    document.querySelectorAll('.gu-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.gu-panel-view').forEach(p => p.classList.remove('active'));

    if (tabName === 'folders') {
        document.getElementById('gu-tab-folders').classList.add('active');
        document.getElementById('gu-content-wrapper').querySelector('.gu-search-row').style.display = 'block';
        document.getElementById('gu-content-area').classList.add('active');
        document.getElementById('gu-prompts-panel').classList.remove('active');
        document.getElementById('gu-add-folder-btn').style.display = 'flex';
        document.getElementById('gu-btn-bulk').style.display = 'flex';
        document.getElementById('gu-search-input').placeholder = t('search_folders_placeholder');
    } else {
        document.getElementById('gu-tab-prompts').classList.add('active');
        document.getElementById('gu-prompts-panel').classList.add('active');
        document.getElementById('gu-content-area').classList.remove('active');
        document.getElementById('gu-add-folder-btn').style.display = 'none';
        document.getElementById('gu-btn-bulk').style.display = 'none';
        document.getElementById('gu-search-input').placeholder = t('search_prompts_placeholder');
        refreshPromptsUI();
    }
}

// --- INIT PANEL ---
export function initPanel() {
    if (document.getElementById('gu-floating-panel')) return;
    const style = document.createElement('style');
    style.textContent = CSS_STYLES;
    document.head.appendChild(style);

    // Initialisation de la langue au démarrage
    chrome.storage.local.get([LANG_STORAGE_KEY], (res) => {
        if(res[LANG_STORAGE_KEY]) currentLanguage = res[LANG_STORAGE_KEY];

        const panel = document.createElement('div');
        panel.id = 'gu-floating-panel';
        panel.innerHTML = `
            <div class="gu-header" id="gu-header-drag">
                <div class="gu-header-left">
                    <span class="gu-title">${t('ext_name').replace('Organizer', 'Org.')}</span>
                    <span id="gu-user-badge" class="gu-user-badge">...</span>
                    <button id="gu-btn-settings" class="gu-btn-icon-head" title="${t('settings_title')}">⚙️</button>
                </div>
                <div class="gu-header-right">
                    <button id="gu-btn-wide" class="gu-btn-icon-head" title="${t('wide_mode_off').replace(':', '')} (Alt+W)">↔️</button>
                    <button id="gu-btn-streamer" class="gu-btn-icon-head" title="${t('streamer_mode_off').replace(':', '')} (Alt+S)">👁️</button>
                    <button id="gu-btn-bulk" class="gu-btn-icon-head" title="${t('bulk_organize_title')}">✅</button>
                    <button id="gu-add-folder-btn" class="gu-btn-create"><span>+</span> ${t('new_folder').replace('Folder', '').replace('Dossier', '').trim()}</button>
                    <button id="gu-min-btn" class="gu-btn-min" title="Minimize">_</button>
                </div>
            </div>
            <div class="gu-tabs-header">
                <button id="gu-tab-folders" class="gu-tab-btn active">${t('folders_tab')}</button>
                <button id="gu-tab-prompts" class="gu-tab-btn">${t('prompts_tab')}</button>
            </div>
            <div id="gu-content-wrapper">
                <div class="gu-search-row">
                    <input type="text" id="gu-search-input" class="gu-search-box" placeholder="${t('search_folders_placeholder')}">
                </div>
                <div id="gu-content-area" class="gu-panel-view active"></div>
                <div id="gu-prompts-panel" class="gu-panel-view">
                    <div style="padding:10px; border-bottom:1px solid #333; display:flex; gap:6px;">
                        <button id="gu-add-prompt-btn" class="gu-btn-action" style="margin:0; flex:1; background:#254d29;">${t('new_prompt_btn')}</button>
                        <button id="gu-help-prompt-btn" class="gu-btn-icon-head" style="width:36px;" title="${t('prompt_help_title')}">?</button>
                    </div>
                    <div id="gu-prompts-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Header Drag
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

        // Events
        document.getElementById('gu-add-folder-btn').onclick = () => showCreateFolderModal();
        document.getElementById('gu-min-btn').onclick = () => panel.classList.toggle('minimized');
        document.getElementById('gu-search-input').addEventListener('input', () => {
            if(document.getElementById('gu-tab-folders').classList.contains('active')) refreshUI();
            else refreshPromptsUI();
        });
        document.getElementById('gu-btn-settings').onclick = showSettingsModal;
        document.getElementById('gu-btn-bulk').onclick = () => Storage.getData(folders => showBulkManager(folders));
        document.getElementById('gu-btn-streamer').onclick = toggleStreamerMode;
        document.getElementById('gu-btn-wide').onclick = toggleWideMode;

        document.getElementById('gu-tab-folders').onclick = () => switchTab('folders');
        document.getElementById('gu-tab-prompts').onclick = () => switchTab('prompts');
        document.getElementById('gu-add-prompt-btn').onclick = () => showCreatePromptModal();
        document.getElementById('gu-help-prompt-btn').onclick = showPromptHelpModal;
    });
}