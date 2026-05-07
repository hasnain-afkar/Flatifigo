/* ==========================================
   Messages Module — Real-time UI
   ========================================== */

const Messages = (() => {

    let _conversations = [];
    let _activePartnerId = null;
    let _selectedFiles = [];

    function renderContact(conv, isActive) {
        const safeName = Sanitizer.escape(conv.partnerName);
        const lastMsg = Sanitizer.escape(conv.lastMessage || 'No messages yet');
        const badge = conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : '';
        
        const avatarUrl = conv.partnerAvatarUrl
            ? conv.partnerAvatarUrl
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partnerName)}&background=random&size=80`;
        
        return `
            <div class="chat-contact ${isActive ? 'chat-contact--active' : ''}" data-action="select-conversation" data-partner-id="${Sanitizer.escapeAttr(conv.partnerId)}">
                <img src="${avatarUrl}" alt="${safeName}" class="chat-contact__avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="chat-contact__avatar chat-contact__avatar--gold" style="display:none">${Sanitizer.escape(conv.partnerAvatar)}</div>
                <div class="chat-contact__info">
                    <h4 class="chat-contact__name">${safeName} ${badge}</h4>
                    <p class="chat-contact__preview">${lastMsg}</p>
                </div>
            </div>`;
    }

    function renderAttachment(att) {
        const url = Sanitizer.sanitizeUrl(att.url || '');
        const name = Sanitizer.escapeAttr(att.originalName || att.filename || 'attachment');
        if (!url) return '';

        if (att.type === 'video' || (att.mimeType || '').startsWith('video/')) {
            return `
                <video class="chat-bubble__media chat-bubble__media--video" controls preload="metadata">
                    <source src="${Sanitizer.escapeAttr(url)}" type="${Sanitizer.escapeAttr(att.mimeType || 'video/mp4')}">
                </video>`;
        }

        return `<img class="chat-bubble__media" src="${Sanitizer.escapeAttr(url)}" alt="${name}" loading="lazy">`;
    }

    function renderBubble(msg) {
        const isSent = msg.sender === 'me';
        const bubbleClass = isSent ? 'chat-bubble--sent' : 'chat-bubble--received';
        const attachments = msg.attachments || [];
        const mediaHtml = attachments.map(renderAttachment).join('');
        const textHtml = msg.deletedForEveryone
            ? `<p class="chat-bubble__text chat-bubble__text--deleted">This message was deleted</p>`
            : (msg.text ? `<p class="chat-bubble__text">${Sanitizer.escape(msg.text)}</p>` : '');
        const deleteEveryoneButton = isSent
            ? `<button type="button" class="chat-bubble__action chat-bubble__action--danger" data-action="delete-message" data-message-id="${Sanitizer.escapeAttr(msg.id)}" data-scope="everyone">Delete for everyone</button>`
            : '';
        const actionsHtml = msg.deletedForEveryone ? '' : `
            <div class="chat-bubble__actions">
                <button type="button" class="chat-bubble__action" data-action="delete-message" data-message-id="${Sanitizer.escapeAttr(msg.id)}" data-scope="me">Delete for me</button>
                ${deleteEveryoneButton}
            </div>`;

        const readReceiptHtml = (isSent && !msg.deletedForEveryone) 
            ? `<span class="chat-bubble__read-receipt ${msg.isRead ? 'chat-bubble__read-receipt--read' : 'chat-bubble__read-receipt--unread'}">${msg.isRead ? '✓✓' : '✓'}</span>` 
            : '';

        return `
            <div class="chat-bubble ${bubbleClass}">
                <div class="chat-bubble__content">
                    ${mediaHtml}
                    ${textHtml}
                </div>
                <div class="chat-bubble__meta">
                    <span class="chat-bubble__time">${Sanitizer.escape(msg.time)}</span>
                    ${readReceiptHtml}
                </div>
                ${actionsHtml}
            </div>`;
    }

    function renderChatArea(partnerData, messages) {
        if (!partnerData) {
            return `
                <div class="chat-main">
                    <div style="display:flex;align-items:center;justify-content:center;flex:1;color:var(--text-muted);font-size:1.2rem">
                        <p>Select a conversation to start chatting</p>
                    </div>
                </div>`;
        }

        const safeName = Sanitizer.escape(partnerData.name);
        const avatarUrl = partnerData.avatarUrl
            ? partnerData.avatarUrl
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerData.name)}&background=random&size=80`;
        const bubblesHtml = messages.length > 0
            ? messages.map(m => renderBubble(m)).join('')
            : `<div style="display:flex;align-items:center;justify-content:center;flex:1;color:var(--text-muted);font-size:0.95rem;padding:2rem;text-align:center">
                <p>No messages yet. Say hello! 👋</p>
               </div>`;

        return `
            <div class="chat-main" id="chatMainNode">
                <div class="chat-header">
                    <img src="${avatarUrl}" alt="${safeName}" class="chat-header__avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <div class="chat-header__avatar" style="display:none">${Sanitizer.escape(partnerData.avatar)}</div>
                    <div>
                        <h3 class="chat-header__name">${safeName}</h3>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessagesContainer">${bubblesHtml}</div>
                <div class="chat-input-area">
                    <div class="chat-attachments-preview hidden" id="chatAttachmentsPreview"></div>
                    <div class="chat-input-row">
                        <label class="chat-attach-btn" for="chatAttachmentInput" title="Attach pictures or videos">Attach</label>
                        <input type="file" class="hidden" id="chatAttachmentInput" accept="image/*,video/*" multiple>
                        <input type="text" class="chat-input" id="chatMessageInput" placeholder="Type a message...">
                        <button class="btn btn-gold chat-send-btn" id="chatSendBtn">Send</button>
                    </div>
                </div>
            </div>`;
    }

    async function setSidebar() {
        const { conversations } = await MessageService.fetchConversations();
        _conversations = conversations;
        const listEl = document.getElementById('chatContactsList');
        if (listEl) {
            listEl.innerHTML = _conversations.map(c => renderContact(c, c.partnerId === _activePartnerId)).join('');
        }
    }

    async function loadChat(partnerId) {
        _activePartnerId = partnerId;
        const parent = document.getElementById('chatLayout');
        if (!parent) return;

        // Mark read
        await MessageService.markRead(partnerId);

        const result = await MessageService.fetchConversation(partnerId);
        if (result.success) {
            const oldMain = parent.querySelector('.chat-main');
            const newMainStr = renderChatArea(result.partner, result.messages);
            if (oldMain) oldMain.outerHTML = newMainStr;
            rebindChatEvents();
            scrollToBottom();
            setSidebar(); // Refresh sidebar to remove unread badges
        } else {
            // New conversation — no messages yet but still show the chat area
            // Try to get partner info from API
            try {
                const userRes = await API.getUserProfile(partnerId);
                if (userRes.success) {
                    const u = userRes.user || userRes.profile || userRes;
                    const partnerName = u.full_name || u.fullName || 'User';
                    const partnerAvatar = u.avatar || '';
                    const avatarUrl = partnerAvatar ? API.getAssetUrl(`uploads/${partnerAvatar}`) : '';
                    const partnerData = {
                        name: partnerName,
                        avatar: partnerName[0].toUpperCase(),
                        avatarUrl: avatarUrl
                    };
                    const oldMain = parent.querySelector('.chat-main');
                    const newMainStr = renderChatArea(partnerData, []);
                    if (oldMain) oldMain.outerHTML = newMainStr;
                    rebindChatEvents();
                }
            } catch (e) {
                // Fallback: show empty chat
                const partnerData = { name: 'User', avatar: 'U', avatarUrl: '' };
                const oldMain = parent.querySelector('.chat-main');
                const newMainStr = renderChatArea(partnerData, []);
                if (oldMain) oldMain.outerHTML = newMainStr;
                rebindChatEvents();
            }
        }
    }

    async function renderMessages(preselectedPartnerId = null) {
        const user = Auth.getCurrentUser();
        if (!user) return `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Access Denied</h2><p>Please log in to use messages.</p><a href="#login" class="btn btn-primary">Log In</a></div></div>`;
        const sidebarTitle = user.role === 'owner' ? 'Requests' : 'Recent Messages';

        const { conversations } = await MessageService.fetchConversations();
        _conversations = conversations;

        if (preselectedPartnerId) {
            _activePartnerId = preselectedPartnerId;
        } else {
            _activePartnerId = conversations.length > 0 ? conversations[0].partnerId : null;
        }

        const contactsHtml = conversations.map(c => renderContact(c, c.partnerId === _activePartnerId)).join('');
        
        let chatAreaHtml = renderChatArea(null, []);
        if (_activePartnerId) {
            MessageService.markRead(_activePartnerId);
            const hist = await MessageService.fetchConversation(_activePartnerId);
            if (hist.success) {
                chatAreaHtml = renderChatArea(hist.partner, hist.messages);
            } else {
                // New conversation with this partner — fetch their info
                try {
                    const userRes = await API.getUserProfile(_activePartnerId);
                    if (userRes.success) {
                        const u = userRes.user || userRes.profile || userRes;
                        const partnerName = u.full_name || u.fullName || 'User';
                        const partnerAvatar = u.avatar || '';
                        const avatarUrl = partnerAvatar ? API.getAssetUrl(`uploads/${partnerAvatar}`) : '';
                        chatAreaHtml = renderChatArea({
                            name: partnerName,
                            avatar: partnerName[0].toUpperCase(),
                            avatarUrl: avatarUrl
                        }, []);
                    }
                } catch (e) {
                    chatAreaHtml = renderChatArea({ name: 'User', avatar: 'U', avatarUrl: '' }, []);
                }
            }
        }

        setTimeout(() => scrollToBottom(), 50);

        return `
      <div class="browse-container--padded animate-fade-in">
        <div class="container" style="max-width: 1100px;">
          <div class="chat-layout" id="chatLayout">
            <div class="chat-sidebar">
              <div class="chat-sidebar__header">
                <h2 class="chat-sidebar__title">${sidebarTitle}</h2>
              </div>
              <div class="chat-sidebar__list" id="chatContactsList">${contactsHtml}</div>
            </div>
            ${chatAreaHtml}
          </div>
        </div>
      </div>`;
    }

    function scrollToBottom() {
        const c = document.getElementById('chatMessagesContainer');
        if (c) c.scrollTop = c.scrollHeight;
    }

    async function handleSend() {
        if (!_activePartnerId) return;
        const input = document.getElementById('chatMessageInput');
        const text = (input.value || '').trim();
        const files = _selectedFiles;
        if (!text && files.length === 0) return;
        
        input.value = '';
        input.disabled = true;
        const btn = document.getElementById('chatSendBtn');
        btn.disabled = true;

        const res = await MessageService.sendMessage(_activePartnerId, text, files);
        if (res.success) {
            clearSelectedFiles();
            // Reload just chat to get new bubble
            await loadChat(_activePartnerId);
            setSidebar();
        } else {
            App.showToast('error', 'Message Failed', res.message || 'Could not send message.');
            input.disabled = false;
            btn.disabled = false;
        }
    }

    async function handleDeleteMessage(messageId, scope) {
        if (!messageId) return;
        if (scope === 'everyone' && !confirm('Delete this message for everyone?')) return;

        const res = await MessageService.deleteMessage(messageId, scope);
        if (res.success) {
            await loadChat(_activePartnerId);
            setSidebar();
            App.showToast('success', 'Message Deleted', res.message || 'Message deleted.');
        } else {
            App.showToast('error', 'Delete Failed', res.message || 'Could not delete message.');
        }
    }

    function handleAttachmentChange(e) {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));

        if (validFiles.length !== files.length) {
            App.showToast('warning', 'Unsupported file', 'Only pictures and videos can be sent.');
        }

        _selectedFiles = validFiles.slice(0, 5);
        if (validFiles.length > 5) {
            App.showToast('warning', 'Too many files', 'You can send up to 5 media files at once.');
        }
        renderSelectedFiles();
    }

    function renderSelectedFiles() {
        const preview = document.getElementById('chatAttachmentsPreview');
        if (!preview) return;

        if (_selectedFiles.length === 0) {
            preview.classList.add('hidden');
            preview.innerHTML = '';
            return;
        }

        preview.classList.remove('hidden');
        preview.innerHTML = _selectedFiles.map((file, index) => `
            <span class="chat-attachment-chip">
                ${Sanitizer.escape(file.name)}
                <button type="button" class="chat-attachment-chip__remove" data-action="remove-attachment" data-index="${index}" aria-label="Remove ${Sanitizer.escapeAttr(file.name)}">x</button>
            </span>
        `).join('');
    }

    function clearSelectedFiles() {
        _selectedFiles = [];
        const input = document.getElementById('chatAttachmentInput');
        if (input) input.value = '';
        renderSelectedFiles();
    }

    function rebindChatEvents() {
        const sendBtn = document.getElementById('chatSendBtn');
        const input = document.getElementById('chatMessageInput');
        const fileInput = document.getElementById('chatAttachmentInput');
        const preview = document.getElementById('chatAttachmentsPreview');
        const messagesContainer = document.getElementById('chatMessagesContainer');

        if (sendBtn) sendBtn.addEventListener('click', handleSend);
        if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
        if (fileInput) fileInput.addEventListener('change', handleAttachmentChange);
        if (preview) {
            preview.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('[data-action="remove-attachment"]');
                if (!removeBtn) return;
                _selectedFiles.splice(Number(removeBtn.dataset.index), 1);
                renderSelectedFiles();
            });
        }
        if (messagesContainer) {
            messagesContainer.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('[data-action="delete-message"]');
                if (!deleteBtn) return;
                handleDeleteMessage(deleteBtn.dataset.messageId, deleteBtn.dataset.scope);
            });
        }
    }

    function attachMessageEvents() {
        const contactsList = document.getElementById('chatContactsList');
        if (contactsList) {
            contactsList.addEventListener('click', (e) => {
                const contactEl = e.target.closest('[data-action="select-conversation"]');
                if (!contactEl) return;
                loadChat(contactEl.dataset.partnerId);
            });
        }
        rebindChatEvents();
    }

    return { renderMessages, attachMessageEvents };
})();
