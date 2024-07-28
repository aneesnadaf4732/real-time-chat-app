const socket = io();

const loginForm = document.getElementById('login-form');
const chatDiv = document.getElementById('chat');
const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

let token = localStorage.getItem('token');

if (token) {
    showChat();
} else {
    showLogin();
}

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('register-btn').addEventListener('click', register);

function showLogin() {
    loginForm.style.display = 'block';
    chatDiv.style.display = 'none';
}

function showChat() {
    loginForm.style.display = 'none';
    chatDiv.style.display = 'block';
    socket.emit('join', 'general');
    loadMessages();
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            showChat();
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful. Please login.');
        }
    } catch (error) {
        console.error('Registration failed:', error);
    }
}

chatForm.addEventListener('submit', sendMessage);

async function sendMessage(e) {
    e.preventDefault();
    if (messageInput.value) {
        const message = {
            content: messageInput.value,
            room: 'general'
        };
        socket.emit('chatMessage', message);
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(message)
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
        messageInput.value = '';
    }
}

socket.on('message', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = msg.content;
    messageElement.classList.add('message');
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

async function loadMessages() {
    try {
        const response = await fetch('/api/messages/general', {
            headers: { 'x-auth-token': token }
        });
        const messages = await response.json();
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.textContent = msg.content;
            messageElement.classList.add('message');
            messagesDiv.appendChild(messageElement);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}