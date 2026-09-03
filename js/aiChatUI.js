/**
 * AI Travel Assistant Floating Chat Drawer
 */

class AIChatUI {
  constructor() {
    this.isOpen = false;
    this.messages = [];
  }

  init() {
    // Add initial welcome message
    this.addMessage('assistant', `👋 Hello! I am your **LayoverIQ Flight-Safety AI Assistant**.\n\nAsk me anything about your connecting flight layover, safe city exploration windows, visa alerts, or emergency delay recovery!`);
  }

  toggleChat() {
    const drawer = document.getElementById('aiChatDrawer');
    const badge = document.getElementById('aiNotificationDot');
    if (!drawer) return;

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      drawer.classList.remove('hidden');
      if (badge) badge.classList.add('hidden');
      this.scrollToBottom();
    } else {
      drawer.classList.add('hidden');
    }
  }

  async sendMessage(customText = null) {
    const input = document.getElementById('aiChatInput');
    const text = customText || input?.value?.trim();
    if (!text) return;

    if (input && !customText) input.value = '';

    // Render user message
    this.addMessage('user', text);

    // Show typing indicator
    const typingId = this.showTyping();

    try {
      const context = window.app.getCurrentSearchParams();
      const res = await LayoverAPI.chatWithAI(text, context);

      this.removeTyping(typingId);
      this.addMessage('assistant', res.reply);
    } catch (err) {
      this.removeTyping(typingId);
      this.addMessage('assistant', `⚠️ Sorry, I encountered an issue: ${err.message}`);
    }
  }

  addMessage(sender, text) {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    const isUser = sender === 'user';
    const msgId = 'msg_' + Date.now();

    // Basic markdown conversion for bold, list, links
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    const msgHTML = `
      <div id="${msgId}" class="flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in">
        <div class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none shadow'
            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow'
        }">
          ${formattedText}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', msgHTML);
    this.scrollToBottom();
  }

  showTyping() {
    const container = document.getElementById('aiChatMessages');
    if (!container) return null;

    const id = 'typing_' + Date.now();
    const html = `
      <div id="${id}" class="flex justify-start">
        <div class="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-3.5 py-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    this.scrollToBottom();
    return id;
  }

  removeTyping(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    const container = document.getElementById('aiChatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}

window.AIChatUI = AIChatUI;
