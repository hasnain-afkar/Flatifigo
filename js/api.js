/* ==========================================
   API Module - Frontend <-> Backend communication
   ========================================== */

const API = (() => {
    const API_ORIGIN = 'http://localhost:5000';
    const BASE = `${API_ORIGIN}/api`;
    let authToken = localStorage.getItem('flatifigo_token') || null;

    function setToken(token) {
        authToken = token;
        if (token) localStorage.setItem('flatifigo_token', token);
        else localStorage.removeItem('flatifigo_token');
    }

    function getToken() { return authToken; }

    function getAssetUrl(assetPath = '') {
        if (!assetPath) return '';
        if (/^https?:\/\//i.test(assetPath)) return assetPath;
        const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
        return `${API_ORIGIN}${normalized}`;
    }

    async function request(method, endpoint, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (authToken) opts.headers.Authorization = `Bearer ${authToken}`;
        if (body) opts.body = JSON.stringify(body);

        let url = `${BASE}${endpoint}`;
        if (method === 'GET') {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}_t=${Date.now()}`;
        }

        try {
            const res = await fetch(url, opts);
            return await res.json();
        } catch (err) {
            console.error('API Error:', err);
            return { success: false, message: 'Network error. Is the backend server running?' };
        }
    }

    return {
        setToken, getToken, getAssetUrl,

        // Auth
        register: (data) => request('POST', '/auth/register', data),
        login: (data) => request('POST', '/auth/login', data),
        checkSession: () => request('GET', '/auth/check-session'),
        logout: () => request('POST', '/auth/logout'),

        // Profile
        getProfile: () => request('GET', '/profile'),
        updateProfile: (data) => request('PUT', '/profile', data),

        // User Public Profile
        getUserProfile: (id) => request('GET', `/users/${id}`),

        // Roommates
        getRoommates: () => request('GET', '/roommates'),

        // Listings
        getListings: (params = '') => request('GET', `/listings${params ? '?' + params : ''}`),
        createListing: (data) => request('POST', '/listings', data),
        getListing: (id) => request('GET', `/listings/${id}`),
        updateListing: (id, data) => request('PUT', `/listings/${id}`, data),
        deleteListing: (id) => request('DELETE', `/listings/${id}`),
        getMyListings: () => request('GET', '/listings/me'),

        // Messages
        getMessages: () => request('GET', '/messages'),
        getConversation: (partnerId) => request('GET', `/messages/${partnerId}`),
        sendMessage: async (partnerId, data, attachments = []) => {
            if (!attachments || attachments.length === 0) {
                return request('POST', `/messages/${partnerId}`, data);
            }

            const formData = new FormData();
            formData.append('receiverId', data.receiverId || partnerId);
            formData.append('content', data.content || '');
            attachments.forEach(file => formData.append('attachments', file));

            try {
                const res = await fetch(`${BASE}/messages/${partnerId}`, {
                    method: 'POST',
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                    body: formData
                });
                return await res.json();
            } catch (err) {
                console.error('Message Upload Error:', err);
                return { success: false, message: 'Message upload failed.' };
            }
        },
        deleteMessage: (messageId, scope) => request('DELETE', `/messages/${messageId}`, { scope }),
        markMessagesRead: (partnerId) => request('PUT', `/messages/read/${partnerId}`),

        // Owner Dashboard
        getOwnerStats: () => request('GET', '/owner/stats'),

        // Favorites
        getFavorites: () => request('GET', '/favorites'),
        getFavoriteIds: () => request('GET', '/favorites/ids'),
        addFavorite: (listingId) => request('POST', `/favorites/${listingId}`),
        removeFavorite: (listingId) => request('DELETE', `/favorites/${listingId}`),

        // Stats
        getStats: () => request('GET', '/stats'),

        // Admin
        getAdminStats: () => request('GET', '/admin/stats'),
        getAdminPendingListings: () => request('GET', '/admin/listings'),
        adminApproveListing: (id) => request('PATCH', `/admin/listings/${id}/approve`),
        adminRejectListing: (id) => request('PATCH', `/admin/listings/${id}/reject`),
        getAdminUsers: () => request('GET', '/admin/users'),
        adminBlockUser: (id) => request('PATCH', `/admin/users/${id}/block`),
        adminUnblockUser: (id) => request('PATCH', `/admin/users/${id}/unblock`),
        getAdminReports: () => request('GET', '/admin/reports'),
        adminResolveReport: (id) => request('PATCH', `/admin/reports/${id}/resolve`),
        getAdminFlaggedListings: () => request('GET', '/admin/flagged'),
        adminDeleteFlaggedListing: (id) => request('DELETE', `/admin/flagged/${id}`),

        // Favorites
        getFavorites: () => request('GET', '/favorites'),
        getFavoriteIds: () => request('GET', '/favorites/ids'),
        addFavorite: (id) => request('POST', `/favorites/${id}`),
        removeFavorite: (id) => request('DELETE', `/favorites/${id}`),

        // Report (user-facing — POST /api/reports)
        submitReport: (data) => request('POST', '/reports', data),

        // Reviews (user-facing)
        getReviews: (targetId) => request('GET', `/reviews/${targetId}`),
        submitReview: (data) => request('POST', '/reviews', data),

        // Image Uploads
        uploadImages: async (files) => {
            const formData = new FormData();
            files.forEach(f => formData.append('images', f));
            try {
                const res = await fetch(`${BASE}/upload`, {
                    method: 'POST',
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                    body: formData
                });
                return await res.json();
            } catch (err) {
                console.error('Upload Error:', err);
                return { success: false, message: 'Upload failed.' };
            }
        },
        uploadAvatar: async (file) => {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const res = await fetch(`${BASE}/profile/avatar`, {
                    method: 'POST',
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                    body: formData
                });
                return await res.json();
            } catch (err) {
                console.error('Avatar Upload Error:', err);
                return { success: false, message: 'Avatar upload failed.' };
            }
        },
        deleteAvatar: () => request('DELETE', '/profile/avatar'),
    };
})();
