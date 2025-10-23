let currentUser = localStorage.getItem('currentUser');
let persistentSession = localStorage.getItem('persistentSession');
let topics = [];
let currentTopicId = null;

// Redirect to login if not authenticated
if (!currentUser || persistentSession !== 'true') {
    window.location.href = 'login.html';
}

// Update last activity timestamp to maintain session
localStorage.setItem('lastActivity', new Date().toISOString());

function navigateTo(page) {
    window.location.href = page;
}

function toggleTopicForm() {
    const form = document.getElementById('topicForm');
    form.classList.toggle('active');
}

function createTopic() {
    const title = document.getElementById('topicTitle').value;
    const content = document.getElementById('topicContent').value;

    if (title.trim() && content.trim()) {
        const topic = {
            id: Date.now(),
            title,
            content,
            author: currentUser,
            date: new Date().toLocaleString('es'),
            comments: []
        };

        topics.unshift(topic);
        saveData();
        renderTopics();

        document.getElementById('topicTitle').value = '';
        document.getElementById('topicContent').value = '';
        toggleTopicForm();
    }
}

function renderTopics() {
    const list = document.getElementById('topicsList');
    list.innerHTML = '';

    topics.forEach(topic => {
        const item = document.createElement('div');
        item.className = 'topic-item';
        item.onclick = () => openTopicDetail(topic.id);

        item.innerHTML = `
            <div class="topic-title">${topic.title}</div>
            <div class="topic-content">${topic.content.substring(0, 100)}...</div>
            <div class="topic-meta">Por ${topic.author} - ${topic.date} - ${topic.comments.length} comentarios</div>
        `;

        list.appendChild(item);
    });
}

function openTopicDetail(topicId) {
    currentTopicId = topicId;
    const topic = topics.find(t => t.id === topicId);

    if (topic) {
        document.getElementById('topicsList').style.display = 'none';
        document.querySelector('.topic-form').style.display = 'none';
        document.querySelector('.create-topic-btn').style.display = 'none';

        document.getElementById('topicDetail').classList.add('active');
        document.getElementById('detailTitle').textContent = topic.title;
        document.getElementById('detailContent').textContent = topic.content;
        document.getElementById('detailMeta').textContent = `Por ${topic.author} - ${topic.date}`;

        renderComments(topic.comments);
    }
}

function closeTopicDetail() {
    document.getElementById('topicDetail').classList.remove('active');
    document.getElementById('topicsList').style.display = 'block';
    document.querySelector('.create-topic-btn').style.display = 'block';
    currentTopicId = null;
}

function renderComments(comments) {
    const list = document.getElementById('commentsList');
    list.innerHTML = '';

    comments.forEach(comment => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `
            <div class="comment-author">${comment.author}</div>
            <div class="comment-text">${comment.text}</div>
        `;
        list.appendChild(item);
    });
}

function addComment() {
    const text = document.getElementById('commentInput').value;

    if (text.trim() && currentTopicId) {
        const topic = topics.find(t => t.id === currentTopicId);

        if (topic) {
            const comment = {
                author: currentUser,
                text,
                date: new Date().toLocaleString('es')
            };

            topic.comments.push(comment);
            saveData();
            renderComments(topic.comments);
            document.getElementById('commentInput').value = '';
        }
    }
}

function saveData() {
    const key = `sobrietyApp_${currentUser}`;
    const saved = localStorage.getItem(key);
    const data = saved ? JSON.parse(saved) : {};

    data.topics = topics;
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData() {
    const key = `sobrietyApp_${currentUser}`;
    const saved = localStorage.getItem(key);

    if (saved) {
        const data = JSON.parse(saved);
        topics = data.topics || [];
    } else {
        topics = [];
    }
}

// Initialize
loadData();
renderTopics();
