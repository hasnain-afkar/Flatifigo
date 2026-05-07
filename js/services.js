    /* ==========================================
   Services Layer — Business Logic & Data Access
   ==========================================
   Sits between UI modules and the API layer.
   
   Architecture: UI → Services → API
   
   Fallback Strategy:
   - Try API first
   - If API fails or returns empty → fall back to MockData
   - When mock data is used, Store.set('usingMockData', true) 
     so the UI can show a demo indicator
   ========================================== */

// ═══════════════════════════════════════
//  Auth Service
// ═══════════════════════════════════════
const AuthService = (() => {

    function _persistUser(user) {
        Store.set('currentUser', user);
        if (user) localStorage.setItem('flatifigo_user', JSON.stringify(user));
        else localStorage.removeItem('flatifigo_user');
    }

    async function register(formData) {
        const result = await API.register(formData);
        if (result.success) {
            API.setToken(result.token);
            _persistUser(result.user);
        }
        return result;
    }

    async function login(email, password) {
        const result = await API.login({ email, password });
        if (result.success) {
            API.setToken(result.token);
            _persistUser(result.user);
        }
        return result;
    }

    function logout() {
        API.logout();
        API.setToken(null);
        _persistUser(null);
    }

    async function checkSession() {
        if (!API.getToken()) return;
        const result = await API.checkSession();
        if (result.loggedIn) {
            _persistUser(result.user);
        } else {
            API.setToken(null);
            _persistUser(null);
        }
    }

    function isLoggedIn() {
        return Store.get('currentUser') !== null && API.getToken() !== null;
    }

    function getCurrentUser() {
        return Store.get('currentUser');
    }

    return { register, login, logout, checkSession, isLoggedIn, getCurrentUser };
})();


// ═══════════════════════════════════════
//  Profile Service
// ═══════════════════════════════════════
const ProfileService = (() => {

    async function getProfile() {
        return await API.getProfile();
    }

    async function updateProfile(data) {
        return await API.updateProfile(data);
    }

    async function uploadAvatar(file) {
        if (!file.type.startsWith('image/')) {
            return { success: false, message: 'Please select an image file.' };
        }
        return await API.uploadAvatar(file);
    }

    async function deleteAvatar() {
        return await API.deleteAvatar();
    }

    /**
     * Calculate profile completion percentage.
     */
    function getCompletionPercent(profile, role) {
        if (!profile) return 0;
        const fields = (role === 'owner')
            ? ['occupation', 'gender_preference', 'bio']
            : ['occupation', 'budget_min', 'budget_max', 'preferred_city', 'preferred_area', 'lifestyle', 'gender_preference', 'schedule', 'bio'];
        let filled = 0;
        fields.forEach(f => {
            if (profile[f] && profile[f].toString().trim() !== '' && profile[f] !== 0) filled++;
        });
        return Math.round((filled / fields.length) * 100);
    }

    return { getProfile, updateProfile, uploadAvatar, deleteAvatar, getCompletionPercent };
})();


// ═══════════════════════════════════════
//  Listing Service (with fallback)
// ═══════════════════════════════════════
const ListingService = (() => {

    const CITY_LABELS = {
        islamabad: 'Islamabad', rawalpindi: 'Rawalpindi', lahore: 'Lahore',
        karachi: 'Karachi', peshawar: 'Peshawar', faisalabad: 'Faisalabad'
    };

    const AMENITY_LABELS = {
        wifi: '📶 WiFi', furnished: '🛋️ Furnished', ac: '❄️ AC',
        kitchen: '🍳 Kitchen', parking: '🚗 Parking', laundry: '👕 Laundry',
        security: '🔒 Security', utilities: '💡 Utilities Included', gym: '💪 Gym'
    };

    function getCityLabel(key) { return CITY_LABELS[key] || key; }
    function getAmenityLabel(key) { return AMENITY_LABELS[key] || key; }
    function formatRent(rent) { return 'PKR ' + parseInt(rent).toLocaleString(); }

    /**
     * Transform API listing data to the format the UI expects.
     * API returns:  { owner_name, images: [...], ... }
     * UI expects:   { ownerName, ownerAvatar, image, rating, ratingCount, price, ... }
     */
    function _transformListings(apiListings) {
        return apiListings.map(l => ({
            ...l,
            ownerName: l.owner_name || l.ownerName || 'Owner',
            ownerAvatar: l.owner_avatar
                ? API.getAssetUrl(`/uploads/${l.owner_avatar}`)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(l.owner_name || 'Owner')}&background=random`,
            image: (l.images && l.images.length > 0) ? API.getAssetUrl(`/uploads/${l.images[0]}`) : (l.image || ''),
            rating: l.rating || ('★ ' + (4.5 + Math.random() * 0.5).toFixed(1)),
            ratingCount: l.ratingCount || String(Math.floor(5 + Math.random() * 50)),
            price: l.price || formatRent(l.rent)
        }));
    }

    /**
     * Fetch listings from API with fallback to MockData.
     * Returns { listings: [], isMock: boolean }
     */
    async function fetchListings(filters) {
        let isMock = false;
        let listings = [];

        try {
            const params = new URLSearchParams();
            if (filters.query) params.set('q', filters.query);
            if (filters.city) params.set('city', filters.city);
            if (filters.minRent) params.set('minRent', filters.minRent);
            if (filters.maxRent) params.set('maxRent', filters.maxRent);
            if (filters.rooms) params.set('rooms', filters.rooms);

            const result = await API.getListings(params.toString());
            if (result.success && result.listings && result.listings.length > 0) {
                listings = _transformListings(result.listings);
            }
        } catch (e) {
            console.warn('[ListingService] API failed, using mock data:', e);
        }

        // Fallback to mock data if API returns empty
        if (listings.length === 0) {
            listings = _filterMockListings(MockData.listings, filters);
            isMock = true;
        }

        // Client-side amenity filtering
        if (filters.amenities && filters.amenities.length > 0) {
            listings = listings.filter(l =>
                (l.amenities || []).some(a => filters.amenities.includes(a))
            );
        }

        Store.set('cachedListings', listings);
        Store.set('usingMockListings', isMock);
        return { listings, isMock };
    }

    /**
     * Apply filters to mock listings client-side.
     */
    function _filterMockListings(mockListings, filters) {
        let result = [...mockListings];
        if (filters.city) result = result.filter(l => l.city === filters.city);
        if (filters.minRent) result = result.filter(l => l.rent >= parseInt(filters.minRent));
        if (filters.maxRent) result = result.filter(l => l.rent <= parseInt(filters.maxRent));
        if (filters.rooms) result = result.filter(l => l.rooms === parseInt(filters.rooms));
        if (filters.query) {
            const q = filters.query.toLowerCase();
            result = result.filter(l =>
                l.title.toLowerCase().includes(q) ||
                l.area.toLowerCase().includes(q) ||
                l.ownerName.toLowerCase().includes(q)
            );
        }
        return result;
    }

    async function fetchListing(id) {
        // Try API first
        const result = await API.getListing(id);
        if (result.success) return result;

        // Fallback: find in mock data
        const mock = MockData.listings.find(l => l.id === id);
        if (mock) {
            return { success: true, listing: mock, isMock: true };
        }
        return { success: false, message: 'Listing not found.' };
    }

    async function createListing(data, images) {
        let imageFilenames = [];
        if (images && images.length > 0) {
            const uploadResult = await API.uploadImages(images);
            if (!uploadResult.success) {
                return { success: false, message: uploadResult.message, phase: 'upload' };
            }
            imageFilenames = uploadResult.filenames;
        }
        data.images = imageFilenames;
        return await API.createListing(data);
    }

    async function updateListing(id, data, newImages, existingImages) {
        let allImages = [...existingImages];
        if (newImages && newImages.length > 0) {
            const uploadResult = await API.uploadImages(newImages);
            if (uploadResult.success) {
                allImages = [...allImages, ...uploadResult.filenames];
            }
        }
        data.images = allImages;
        return await API.updateListing(id, data);
    }

    async function deleteListing(id) {
        return await API.deleteListing(id);
    }

    async function fetchMyListings() {
        const result = await API.getMyListings();
        return result.success ? result.listings : [];
    }

    function getTimeAgo(dateString) {
        if (!dateString) return '';
        const diffDays = Math.floor((new Date() - new Date(dateString)) / (1e3 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + ' days ago';
        if (diffDays < 30) return Math.floor(diffDays / 7) + ' week(s) ago';
        return Math.floor(diffDays / 30) + ' month(s) ago';
    }

    return {
        getCityLabel, getAmenityLabel, formatRent, getTimeAgo,
        fetchListings, fetchListing, createListing, updateListing, deleteListing, fetchMyListings,
        CITY_LABELS, AMENITY_LABELS
    };
})();


// ═══════════════════════════════════════
//  Roommate Service (with fallback)
// ═══════════════════════════════════════
const RoommateService = (() => {

    /**
     * Fetch roommates from API with fallback to MockData.
     * Returns { roommates: [], isMock: boolean }
     */
    async function fetchRoommates() {
        let isMock = false;
        let roommates = [];

        try {
            const result = await API.getRoommates();
            roommates = result.success ? result.roommates : [];
        } catch (e) {
            console.warn('[RoommateService] API failed, using mock data:', e);
        }

        if (roommates.length === 0) {
            roommates = MockData.roommates;
            isMock = true;
        }

        Store.set('usingMockRoommates', isMock);
        return { roommates, isMock };
    }

    return { fetchRoommates };
})();


// ═══════════════════════════════════════
//  Message Service
// ═══════════════════════════════════════
const MessageService = (() => {

    function _formatTime(isoString) {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return isoString;
        }
    }

    async function fetchConversations() {
        try {
            const result = await API.getMessages();
            if (result.success) {
                const conversations = result.conversations.map(c => {
                    const initial = (c.partner_name || '?')[0];
                    const last = c.last_message || (c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null);
                    const lastMsg = _messagePreview(last);
                    const lastDate = c.last_message_date || (c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].created_at : null);
                    const avatarUrl = c.partner_avatar ? API.getAssetUrl(`uploads/${c.partner_avatar}`) : '';
                    return {
                        id: c.partner_id,
                        partnerId: c.partner_id,
                        partnerName: c.partner_name,
                        partnerAvatar: initial.toUpperCase(),
                        partnerAvatarUrl: avatarUrl,
                        avatarStyle: 'gold',
                        online: false,
                        unread: c.unread_count || 0,
                        lastMessage: lastMsg,
                        time: _formatTime(lastDate)
                    };
                });
                Store.set('usingMockMessages', false);
                return { conversations, isMock: false };
            }
        } catch (e) {
            console.warn('Message API failed', e);
        }
        return { conversations: [], isMock: false };
    }

    function _messagePreview(message) {
        if (!message) return 'No messages';
        if (message.is_deleted_for_everyone) return 'This message was deleted';
        if (message.content) return message.content;
        const attachments = message.attachments || [];
        if (attachments.length === 0) return 'No messages';
        const hasVideo = attachments.some(a => a.type === 'video');
        const hasImage = attachments.some(a => a.type === 'image');
        if (hasVideo && hasImage) return 'Media message';
        if (hasVideo) return attachments.length > 1 ? 'Videos' : 'Video';
        return attachments.length > 1 ? 'Photos' : 'Photo';
    }

    async function fetchConversation(partnerId) {
        const result = await API.getConversation(partnerId);
        if (result.success) {
            const currentUser = Auth.getCurrentUser();
            const myId = currentUser ? (currentUser.id || currentUser._id) : null;
            const partnerName = result.partner.full_name || result.partner.fullName || 'Unknown';
            const partnerAvatarFile = result.partner.avatar || '';
            const avatarUrl = partnerAvatarFile ? API.getAssetUrl(`uploads/${partnerAvatarFile}`) : '';
            return {
                success: true,
                partner: {
                    name: partnerName,
                    avatar: partnerName[0].toUpperCase(),
                    avatarUrl: avatarUrl,
                    online: true
                },
                messages: result.messages.map(m => ({
                    id: m.id,
                    sender: m.sender_id === myId ? 'me' : 'them',
                    text: m.content,
                    attachments: (m.attachments || []).map(a => ({
                        ...a,
                        url: API.getAssetUrl(`/uploads/${a.filename}`)
                    })),
                    deletedForEveryone: Boolean(m.is_deleted_for_everyone),
                    time: _formatTime(m.created_at),
                    isRead: Boolean(m.is_read)
                }))
            };
        }
        return { success: false, messages: [] };
    }

    async function sendMessage(partnerId, content, attachments = []) {
        const cleanContent = (content || '').trim();
        if (!partnerId || (!cleanContent && attachments.length === 0)) return { success: false, message: 'Invalid message' };
        return await API.sendMessage(partnerId, { content: cleanContent, receiverId: partnerId }, attachments);
    }

    async function deleteMessage(messageId, scope) {
        return await API.deleteMessage(messageId, scope);
    }

    async function markRead(partnerId) {
        return await API.markMessagesRead(partnerId);
    }

    return { fetchConversations, fetchConversation, sendMessage, deleteMessage, markRead };
})();


// ═══════════════════════════════════════
//  Stats Service
// ═══════════════════════════════════════
const StatsService = (() => {

    async function fetchStats() {
        const result = await API.getStats();
        return result.success ? result.stats : { listings: 0, users: 0, cities: 0 };
    }

    return { fetchStats };
})();
