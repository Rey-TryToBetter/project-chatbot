// Modern Chatbot JavaScript
class ModernChatbot {
    constructor() {
        this.chatBox = document.getElementById('chat-box');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.themeToggle = document.getElementById('theme-toggle');
        
        this.initializeEventListeners();
        this.initializeTheme();
        this.hideWelcomeMessageAfterDelay();
    }

    // Inisialisasi event listeners
    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.userInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Input focus effects
        this.userInput.addEventListener('focus', () => {
            this.userInput.parentElement.parentElement.classList.add('focused');
        });

        this.userInput.addEventListener('blur', () => {
            this.userInput.parentElement.parentElement.classList.remove('focused');
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Auto-resize input
        this.userInput.addEventListener('input', () => this.autoResizeInput());
    }

    // Inisialisasi tema
    initializeTheme() {
        const savedTheme = localStorage.getItem('chatbot-theme') || 'light';
        this.setTheme(savedTheme);
    }

    // Toggle tema gelap/terang
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Set tema
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('chatbot-theme', theme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Sembunyikan welcome message setelah beberapa detik
    hideWelcomeMessageAfterDelay() {
        setTimeout(() => {
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage && this.chatBox.children.length === 1) {
                welcomeMessage.style.opacity = '0.7';
            }
        }, 10000);
    }

    // Auto resize input field
    autoResizeInput() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    // Fungsi utama untuk mengirim pesan
    async sendMessage() {
        const message = this.userInput.value.trim();

        // Validasi input
        if (!message) {
            this.shakeInput();
            return;
        }

        // Sembunyikan welcome message jika ada
        this.hideWelcomeMessage();

        // Tampilkan pesan user
        this.displayMessage(message, 'user');
        
        // Reset input
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        
        // Tampilkan typing indicator
        this.showTypingIndicator();

        try {
            // Kirim request ke server
            const response = await this.sendToServer(message);
            // Sembunyikan typing indicator
            this.hideTypingIndicator();
            // Tampilkan response bot
            this.displayMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.displayMessage('Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi.', 'bot', true);
        }
    }

    // Kirim pesan ke server
    async sendToServer(message) {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }

    // Tampilkan pesan di chat
    displayMessage(message, sender, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        
        if (isError) {
            messageElement.style.backgroundColor = '#fee2e2';
            messageElement.style.borderLeft = '4px solid #ef4444';
            messageElement.style.color = '#dc2626';
        }
        
        // Animasi typing untuk bot messages
        if (sender === 'bot') {
            this.typeMessage(messageElement, message);
        } else {
            messageElement.textContent = message;
        }
        
        this.chatBox.appendChild(messageElement);
        this.scrollToBottom();
    }

    // Efek typing untuk pesan bot
    typeMessage(element, message) {
        element.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < message.length) {
                element.textContent += message.charAt(i);
                i++;
                this.scrollToBottom();
            } else {
                clearInterval(typeInterval);
            }
        }, 30); // Kecepatan typing
    }

    // Tampilkan typing indicator
    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
    }

    // Sembunyikan typing indicator
    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }

    // Sembunyikan welcome message
    hideWelcomeMessage() {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.transition = 'all 0.3s ease';
            welcomeMessage.style.opacity = '0';
            welcomeMessage.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (welcomeMessage.parentNode) {
                    welcomeMessage.parentNode.removeChild(welcomeMessage);
                }
            }, 300);
        }
    }

    // Shake animation untuk input kosong
    shakeInput() {
        const inputContainer = this.userInput.parentElement.parentElement;
        inputContainer.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            inputContainer.style.animation = '';
        }, 500);
        
        // Focus ke input
        this.userInput.focus();
    }

    // Scroll ke bagian bawah chat
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.chatBox.parentElement.scrollTop = this.chatBox.parentElement.scrollHeight;
        });
    }

    // Format waktu untuk timestamp (opsional)
    getCurrentTime() {
        return new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Deteksi apakah user sedang mengetik (untuk fitur future)
    detectTyping() {
        let typingTimer;
        this.userInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            // User is typing
            typingTimer = setTimeout(() => {
                // User stopped typing
            }, 1000);
        });
    }
}

// CSS untuk shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .input-container.focused {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;
document.head.appendChild(shakeStyle);

// Inisialisasi chatbot setelah DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernChatbot();
});

// Service Worker untuk PWA (opsional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}