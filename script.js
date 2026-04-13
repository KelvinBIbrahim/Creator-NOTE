// ========== APPLICATION STATE ==========
let appState = {
    currentPlatform: null,
    currentFolder: null,
    currentNote: null,
    platformsData: {},
    tasks: [],
    apiKey: '',
    taskFilter: 'all',
    editTaskId: null,
    selectedEmoji: '📁'
};

// Platform definitions
const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: '▶️', desc: 'Video Content & Shorts' },
    { id: 'instagram', name: 'Instagram', icon: '📸', desc: 'Reels & Posts' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', desc: 'Short Videos' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', desc: 'Threads & Tweets' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'Professional Content' },
    { id: 'facebook', name: 'Facebook', icon: '📘', desc: 'Posts & Stories' }
];

// Emojis for folders
const EMOJIS = ['📝', '💡', '🎯', '📊', '🎬', '✍️', '🚀', '🔥', '💎', '📅', '🎨', '📖', '💭', '⚡', '🌟'];

// Default folder structures
const DEFAULT_FOLDERS = {
    youtube: [
        { id: 'youtube_1', name: 'Video Scripts', emoji: '🎬', notes: [] },
        { id: 'youtube_2', name: 'Thumbnail Ideas', emoji: '🖼️', notes: [] }
    ],
    instagram: [
        { id: 'instagram_1', name: 'Caption Ideas', emoji: '✍️', notes: [] },
        { id: 'instagram_2', name: 'Reel Concepts', emoji: '🎥', notes: [] }
    ],
    tiktok: [
        { id: 'tiktok_1', name: 'Trending Sounds', emoji: '🎵', notes: [] },
        { id: 'tiktok_2', name: 'Script Ideas', emoji: '📝', notes: [] }
    ],
    twitter: [
        { id: 'twitter_1', name: 'Thread Ideas', emoji: '🧵', notes: [] },
        { id: 'twitter_2', name: 'Tweet Drafts', emoji: '🐦', notes: [] }
    ],
    linkedin: [
        { id: 'linkedin_1', name: 'Post Drafts', emoji: '📄', notes: [] },
        { id: 'linkedin_2', name: 'Article Ideas', emoji: '📰', notes: [] }
    ],
    facebook: [
        { id: 'facebook_1', name: 'Post Ideas', emoji: '💬', notes: [] },
        { id: 'facebook_2', name: 'Community Posts', emoji: '👥', notes: [] }
    ]
};

// ========== INITIALIZATION ==========
function initializeData() {
    try {
        const savedData = localStorage.getItem('creator_studio_data');
        if (savedData) {
            appState.platformsData = JSON.parse(savedData);
        } else {
            // Initialize with default folders
            PLATFORMS.forEach(platform => {
                appState.platformsData[platform.id] = {
                    folders: JSON.parse(JSON.stringify(DEFAULT_FOLDERS[platform.id] || []))
                };
            });
        }
        
        const savedTasks = localStorage.getItem('creator_studio_tasks');
        if (savedTasks) {
            appState.tasks = JSON.parse(savedTasks);
        } else {
            appState.tasks = [];
        }
        
        const savedApiKey = localStorage.getItem('creator_studio_api_key');
        if (savedApiKey) {
            appState.apiKey = savedApiKey;
        }
    } catch(e) {
        console.error('Error loading data:', e);
        // Initialize empty if error
        PLATFORMS.forEach(platform => {
            appState.platformsData[platform.id] = {
                folders: []
            };
        });
        appState.tasks = [];
    }
}

function saveData() {
    localStorage.setItem('creator_studio_data', JSON.stringify(appState.platformsData));
    localStorage.setItem('creator_studio_tasks', JSON.stringify(appState.tasks));
    updateStats();
}

function saveApiKey() {
    const keyInput = document.getElementById('apiKeyInput');
    if (keyInput) {
        appState.apiKey = keyInput.value.trim();
        localStorage.setItem('creator_studio_api_key', appState.apiKey);
        closeApiModal();
        updateApiStatus();
    }
}

// ========== UI HELPERS ==========
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats() {
    let totalFolders = 0;
    let totalNotes = 0;
    
    Object.values(appState.platformsData).forEach(platform => {
        if (platform && platform.folders) {
            totalFolders += platform.folders.length;
            platform.folders.forEach(folder => {
                if (folder && folder.notes) {
                    totalNotes += folder.notes.length;
                }
            });
        }
    });
    
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const pendingTasks = appState.tasks.filter(t => !t.completed).length;
    
    const totalNotesEl = document.getElementById('totalNotes');
    const totalFoldersEl = document.getElementById('totalFolders');
    const completedTasksEl = document.getElementById('completedTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');
    
    if (totalNotesEl) totalNotesEl.textContent = totalNotes;
    if (totalFoldersEl) totalFoldersEl.textContent = totalFolders;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
    if (pendingTasksEl) pendingTasksEl.textContent = pendingTasks;
}

// ========== HOME SCREEN ==========
function renderHome() {
    renderPlatformsGrid();
    renderTasksPreview();
}

function renderPlatformsGrid() {
    const grid = document.getElementById('platformsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    PLATFORMS.forEach(platform => {
        const platformData = appState.platformsData[platform.id];
        const folderCount = platformData?.folders?.length || 0;
        const noteCount = platformData?.folders?.reduce((sum, f) => sum + (f.notes?.length || 0), 0) || 0;
        
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.onclick = () => {
            appState.currentPlatform = platform.id;
            renderPlatformPage();
            showScreen('platformScreen');
        };
        
        card.innerHTML = `
            <div class="platform-icon-large">${platform.icon}</div>
            <div class="platform-info">
                <div class="platform-name">${platform.name}</div>
                <div class="platform-stats">${folderCount} folders · ${noteCount} notes</div>
            </div>
            <div style="color: var(--text-secondary);">→</div>
        `;
        
        grid.appendChild(card);
    });
}

function renderTasksPreview() {
    const container = document.getElementById('tasksPreview');
    if (!container) return;
    
    const pendingTasks = appState.tasks.filter(t => !t.completed).slice(0, 3);
    
    if (pendingTasks.length === 0) {
        container.innerHTML = '<div class="task-preview-empty">✨ No pending tasks. Add some tasks to stay productive!</div>';
        return;
    }
    
    container.innerHTML = pendingTasks.map(task => `
        <div class="task-preview-item" onclick="toggleTask('${task.id}')">
            <div class="task-check">${task.completed ? '✓' : ''}</div>
            <div class="task-preview-text">${escapeHtml(task.text)}</div>
            <div style="font-size: 0.65rem; color: var(--text-secondary);">${task.platform || 'General'}</div>
        </div>
    `).join('');
}

// ========== PLATFORM PAGE ==========
function renderPlatformPage() {
    const platform = PLATFORMS.find(p => p.id === appState.currentPlatform);
    if (!platform) return;
    
    const platformIcon = document.getElementById('platformIcon');
    const platformName = document.getElementById('platformName');
    const platformDesc = document.getElementById('platformDesc');
    
    if (platformIcon) platformIcon.textContent = platform.icon;
    if (platformName) platformName.textContent = platform.name;
    if (platformDesc) platformDesc.textContent = platform.desc;
    
    renderFoldersGrid();
}

function renderFoldersGrid() {
    const grid = document.getElementById('foldersGrid');
    if (!grid) return;
    
    const platformData = appState.platformsData[appState.currentPlatform];
    if (!platformData || !platformData.folders) return;
    
    grid.innerHTML = '';
    
    platformData.folders.forEach((folder, index) => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.onclick = () => {
            appState.currentFolder = index;
            renderFolderPage();
            showScreen('folderScreen');
        };
        
        card.innerHTML = `
            <div class="folder-emoji">${folder.emoji || '📁'}</div>
            <div class="folder-name">${escapeHtml(folder.name)}</div>
            <div class="folder-count">${folder.notes?.length || 0} notes</div>
            <button class="folder-delete" onclick="event.stopPropagation(); deleteFolder(${index})">✕</button>
        `;
        
        grid.appendChild(card);
    });
    
    const addCard = document.createElement('div');
    addCard.className = 'add-card';
    addCard.onclick = openAddFolder;
    addCard.innerHTML = `
        <div style="font-size: 2rem;">+</div>
        <div style="font-size: 0.75rem;">New Folder</div>
    `;
    grid.appendChild(addCard);
}

function deleteFolder(index) {
    if (confirm('Delete this folder and all its notes?')) {
        appState.platformsData[appState.currentPlatform].folders.splice(index, 1);
        saveData();
        renderFoldersGrid();
        updateStats();
    }
}

// ========== FOLDER PAGE ==========
function renderFolderPage() {
    const platformData = appState.platformsData[appState.currentPlatform];
    if (!platformData || !platformData.folders[appState.currentFolder]) return;
    
    const folder = platformData.folders[appState.currentFolder];
    
    const folderIcon = document.getElementById('folderIcon');
    const folderName = document.getElementById('folderName');
    const folderStats = document.getElementById('folderStats');
    
    if (folderIcon) folderIcon.textContent = folder.emoji || '📁';
    if (folderName) folderName.textContent = folder.name;
    if (folderStats) folderStats.textContent = `${folder.notes?.length || 0} notes`;
    
    renderNotesList();
}

function renderNotesList() {
    const container = document.getElementById('notesList');
    if (!container) return;
    
    const folder = appState.platformsData[appState.currentPlatform].folders[appState.currentFolder];
    if (!folder) return;
    
    if (!folder.notes || folder.notes.length === 0) {
        container.innerHTML = '<div class="task-preview-empty">📝 No notes yet. Tap + to create your first note!</div>';
        return;
    }
    
    container.innerHTML = folder.notes.map((note, index) => `
        <div class="note-card" onclick="openNoteEditor(${index})">
            <div class="note-header">
                <div class="note-title">${escapeHtml(note.title || 'Untitled')}</div>
                <button class="note-delete" onclick="event.stopPropagation(); deleteNote(${index})">✕</button>
            </div>
            <div class="note-preview">${escapeHtml((note.body || '').substring(0, 100))}${(note.body || '').length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

function deleteNote(index) {
    if (confirm('Delete this note?')) {
        const folder = appState.platformsData[appState.currentPlatform].folders[appState.currentFolder];
        folder.notes.splice(index, 1);
        saveData();
        renderNotesList();
        updateStats();
    }
}

// ========== NOTE EDITOR ==========
function openNoteEditor(index) {
    appState.currentNote = index;
    const folder = appState.platformsData[appState.currentPlatform].folders[appState.currentFolder];
    
    const noteTitle = document.getElementById('noteTitle');
    const noteBody = document.getElementById('noteBody');
    
    if (index !== null && folder.notes[index]) {
        const note = folder.notes[index];
        if (noteTitle) noteTitle.value = note.title || '';
        if (noteBody) noteBody.value = note.body || '';
    } else {
        if (noteTitle) noteTitle.value = '';
        if (noteBody) noteBody.value = '';
    }
    
    showScreen('noteEditor');
}

function saveNote() {
    const titleInput = document.getElementById('noteTitle');
    const bodyInput = document.getElementById('noteBody');
    
    const title = titleInput ? titleInput.value.trim() : 'Untitled';
    const body = bodyInput ? bodyInput.value : '';
    
    const folder = appState.platformsData[appState.currentPlatform].folders[appState.currentFolder];
    
    if (appState.currentNote !== null) {
        if (folder.notes[appState.currentNote]) {
            folder.notes[appState.currentNote] = {
                ...folder.notes[appState.currentNote],
                title,
                body,
                updatedAt: Date.now()
            };
        }
    } else {
        folder.notes.unshift({
            id: 'note_' + Date.now(),
            title,
            body,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    
    saveData();
    renderFolderPage();
    showScreen('folderScreen');
}

// ========== TASKS SCREEN ==========
function renderTasksScreen() {
    renderTaskFilters();
    renderTasksList();
    updateTaskStats();
}

function renderTaskFilters() {
    const container = document.getElementById('taskFilters');
    if (!container) return;
    
    const filters = [
        { id: 'all', label: 'All Tasks' },
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Completed' },
        { id: 'high', label: 'High Priority' }
    ];
    
    container.innerHTML = filters.map(filter => `
        <button class="filter-chip ${appState.taskFilter === filter.id ? 'active' : ''}" onclick="setTaskFilter('${filter.id}')">
            ${filter.label}
        </button>
    `).join('');
}

function setTaskFilter(filter) {
    appState.taskFilter = filter;
    renderTaskFilters();
    renderTasksList();
}

function renderTasksList() {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    let filteredTasks = [...appState.tasks];
    
    switch(appState.taskFilter) {
        case 'pending':
            filteredTasks = filteredTasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = filteredTasks.filter(t => t.completed);
            break;
        case 'high':
            filteredTasks = filteredTasks.filter(t => t.priority === 'high' && !t.completed);
            break;
    }
    
    if (filteredTasks.length === 0) {
        container.innerHTML = '<div class="task-preview-empty">✨ No tasks found. Create a new task to get started!</div>';
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-item">
            <button class="task-check-btn" onclick="toggleTask('${task.id}')">${task.completed ? '✓' : ''}</button>
            <div class="task-content">
                <div class="task-text" style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span>${task.platform || 'General'}</span>
                    <span>${task.priority === 'high' ? '🔴 High' : task.priority === 'low' ? '🟢 Low' : '🟡 Medium'}</span>
                    ${task.due ? `<span>📅 ${new Date(task.due).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <button class="task-delete" onclick="deleteTask('${task.id}')">✕</button>
        </div>
    `).join('');
}

function updateTaskStats() {
    const total = appState.tasks.length;
    const completed = appState.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const percentEl = document.getElementById('taskPercent');
    const fillEl = document.getElementById('taskFill');
    const doneEl = document.getElementById('taskDone');
    const pendingEl = document.getElementById('taskPending');
    const totalEl = document.getElementById('taskTotal');
    
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (doneEl) doneEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;
    if (totalEl) totalEl.textContent = total;
}

function toggleTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasksList();
        updateTaskStats();
        renderTasksPreview();
        updateStats();
    }
}

function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        appState.tasks = appState.tasks.filter(t => t.id !== taskId);
        saveData();
        renderTasksList();
        updateTaskStats();
        renderTasksPreview();
        updateStats();
    }
}

function openAddTodo() {
    appState.editTaskId = null;
    const modalTitle = document.getElementById('taskModalTitle');
    const taskText = document.getElementById('taskText');
    const taskPlatform = document.getElementById('taskPlatform');
    const taskPriority = document.getElementById('taskPriority');
    const taskDue = document.getElementById('taskDue');
    
    if (modalTitle) modalTitle.textContent = '✅ New Task';
    if (taskText) taskText.value = '';
    if (taskPlatform) taskPlatform.value = 'General';
    if (taskPriority) taskPriority.value = 'medium';
    if (taskDue) taskDue.value = '';
    
    const modal = document.getElementById('taskModal');
    if (modal) modal.classList.add('open');
}

function saveTask() {
    const taskTextInput = document.getElementById('taskText');
    if (!taskTextInput) return;
    
    const text = taskTextInput.value.trim();
    if (!text) return;
    
    const taskPlatform = document.getElementById('taskPlatform');
    const taskPriority = document.getElementById('taskPriority');
    const taskDue = document.getElementById('taskDue');
    
    const task = {
        id: appState.editTaskId || 'task_' + Date.now(),
        text: text,
        platform: taskPlatform ? taskPlatform.value : 'General',
        priority: taskPriority ? taskPriority.value : 'medium',
        due: taskDue ? taskDue.value : '',
        completed: false,
        createdAt: Date.now()
    };
    
    if (appState.editTaskId) {
        const index = appState.tasks.findIndex(t => t.id === appState.editTaskId);
        if (index !== -1) {
            task.completed = appState.tasks[index].completed;
            appState.tasks[index] = task;
        }
    } else {
        appState.tasks.unshift(task);
    }
    
    saveData();
    closeTaskModal();
    renderTasksScreen();
    renderTasksPreview();
    updateStats();
}

// ========== FOLDER MODAL ==========
function openAddFolder() {
    appState.selectedEmoji = '📁';
    const folderNameInput = document.getElementById('folderNameInput');
    if (folderNameInput) folderNameInput.value = '';
    renderEmojiGrid();
    const modal = document.getElementById('folderModal');
    if (modal) modal.classList.add('open');
}

function renderEmojiGrid() {
    const grid = document.getElementById('emojiGrid');
    if (!grid) return;
    
    grid.innerHTML = EMOJIS.map(emoji => `
        <div class="emoji-option ${appState.selectedEmoji === emoji ? 'selected' : ''}" onclick="selectEmoji('${emoji}')">
            ${emoji}
        </div>
    `).join('');
}

function selectEmoji(emoji) {
    appState.selectedEmoji = emoji;
    renderEmojiGrid();
}

function createFolder() {
    const nameInput = document.getElementById('folderNameInput');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    if (!name) return;
    
    const newFolder = {
        id: 'folder_' + Date.now(),
        name: name,
        emoji: appState.selectedEmoji,
        notes: []
    };
    
    if (!appState.platformsData[appState.currentPlatform]) {
        appState.platformsData[appState.currentPlatform] = { folders: [] };
    }
    
    appState.platformsData[appState.currentPlatform].folders.push(newFolder);
    saveData();
    closeFolderModal();
    renderFoldersGrid();
    updateStats();
}

// ========== AI ASSISTANT ==========
function openAI(context = null) {
    const modal = document.getElementById('aiModal');
    if (modal) modal.classList.add('open');
    updateApiStatus();
    
    const chipsContainer = document.getElementById('aiChips');
    if (chipsContainer) {
        const suggestions = context === 'todo' 
            ? ['Create a content calendar', 'Break down tasks', 'Prioritize my work']
            : ['Write a video hook', 'Generate caption ideas', 'Improve this script', 'Create a content outline'];
        
        chipsContainer.innerHTML = suggestions.map(s => `<button class="chip" onclick="setChatInput('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('');
    }
}

function setChatInput(text) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = text;
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    if (!appState.apiKey) {
        addChatMessage('⚠️ Please configure your API key first (click the settings button).', 'ai');
        return;
    }
    
    addChatMessage('Thinking... ✨', 'ai');
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': appState.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                messages: [{ role: 'user', content: message }]
            })
        });
        
        const data = await response.json();
        
        // Remove thinking message
        const messages = document.getElementById('chatMessages');
        if (messages && messages.lastChild && messages.lastChild.textContent === 'Thinking... ✨') {
            messages.removeChild(messages.lastChild);
        }
        
        if (data.content && data.content[0]) {
            addChatMessage(data.content[0].text, 'ai');
        } else {
            addChatMessage('Sorry, I had trouble processing that. Please try again.', 'ai');
        }
    } catch (error) {
        const messages = document.getElementById('chatMessages');
        if (messages && messages.lastChild && messages.lastChild.textContent === 'Thinking... ✨') {
            messages.removeChild(messages.lastChild);
        }
        addChatMessage('Network error. Please check your connection and API key.', 'ai');
    }
}

function addChatMessage(text, role) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user' : 'ai'}`;
    messageDiv.textContent = text;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

async function aiAssistNote() {
    const promptInput = document.getElementById('aiPrompt');
    if (!promptInput) return;
    
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    const noteBody = document.getElementById('noteBody');
    if (!noteBody) return;
    
    const currentContent = noteBody.value;
    const fullPrompt = currentContent 
        ? `Current note: ${currentContent}\n\nTask: ${prompt}`
        : prompt;
    
    const btn = document.querySelector('.assist-btn');
    const originalText = btn ? btn.textContent : 'Generate';
    if (btn) {
        btn.textContent = '...';
        btn.disabled = true;
    }
    
    if (!appState.apiKey) {
        noteBody.value += '\n\n⚠️ Please configure your API key in settings to use AI features.';
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
        return;
    }
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': appState.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                messages: [{ role: 'user', content: fullPrompt }]
            })
        });
        
        const data = await response.json();
        
        if (data.content && data.content[0]) {
            noteBody.value = currentContent + '\n\n✨ ' + data.content[0].text;
        }
    } catch (error) {
        console.error('AI error:', error);
    }
    
    if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
    }
    promptInput.value = '';
}

function openAITodo() {
    openAI('todo');
}

// ========== API STATUS ==========
function updateApiStatus() {
    const statusSpan = document.getElementById('apiStatus');
    if (statusSpan) {
        if (appState.apiKey) {
            statusSpan.textContent = '✓ API Connected';
            statusSpan.style.color = '#10B981';
        } else {
            statusSpan.textContent = '⚠️ API Not Configured';
            statusSpan.style.color = '#EF4444';
        }
    }
}

// ========== MODAL CONTROLS ==========
function closeAIModal() {
    const modal = document.getElementById('aiModal');
    if (modal) modal.classList.remove('open');
}

function openApiModal() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput) apiKeyInput.value = appState.apiKey;
    const modal = document.getElementById('apiModal');
    if (modal) modal.classList.add('open');
}

function closeApiModal() {
    const modal = document.getElementById('apiModal');
    if (modal) modal.classList.remove('open');
}

function closeFolderModal() {
    const modal = document.getElementById('folderModal');
    if (modal) modal.classList.remove('open');
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) modal.classList.remove('open');
}

// ========== NAVIGATION ==========
function goHome() {
    renderHome();
    showScreen('homeScreen');
    updateActiveNav('home');
}

function goPlatform() {
    renderPlatformPage();
    showScreen('platformScreen');
}

function goFolder() {
    renderFolderPage();
    showScreen('folderScreen');
}

function switchTab(tab) {
    if (tab === 'todo') {
        renderTasksScreen();
        showScreen('tasksScreen');
        updateActiveNav('todo');
    } else {
        goHome();
    }
}

function updateActiveNav(active) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-screen') === active) {
            item.classList.add('active');
        }
    });
}

// ========== SPLASH SCREEN ==========
function startSplash() {
    let progress = 0;
    const bar = document.getElementById('splashBar');
    const percent = document.getElementById('splashPercent');
    
    const interval = setInterval(() => {
        progress += 2;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                const splash = document.getElementById('splash');
                const app = document.getElementById('app');
                if (splash) splash.style.display = 'none';
                if (app) app.style.display = 'block';
                renderHome();
            }, 300);
        }
        if (bar) bar.style.width = `${Math.min(progress, 100)}%`;
        if (percent) percent.textContent = `${Math.min(progress, 100)}%`;
    }, 20);
}

// ========== INITIALIZE APP ==========
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    startSplash();
});

// Make functions globally available
window.openApiModal = openApiModal;
window.saveApiKey = saveApiKey;
window.openAI = openAI;
window.closeAIModal = closeAIModal;
window.sendChatMessage = sendChatMessage;
window.setChatInput = setChatInput;
window.aiAssistNote = aiAssistNote;
window.openAITodo = openAITodo;
window.goHome = goHome;
window.goPlatform = goPlatform;
window.goFolder = goFolder;
window.switchTab = switchTab;
window.openAddFolder = openAddFolder;
window.createFolder = createFolder;
window.closeFolderModal = closeFolderModal;
window.selectEmoji = selectEmoji;
window.openNoteEditor = openNoteEditor;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.openAddTodo = openAddTodo;
window.saveTask = saveTask;
window.closeTaskModal = closeTaskModal;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.setTaskFilter = setTaskFilter;
window.closeApiModal = closeApiModal;