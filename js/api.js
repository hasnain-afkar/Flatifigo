/* ==========================================
   API Module — Frontend ↔ Backend communication
   ========================================== */

const API = (() => {
    const BASE = 'http://localhost:5000/api';
    let authToken = localStorage.getItem('flatifigo_token') || null;

    function setToken(token) {
        authToken = token;
        if (token) localStorage.setItem('flatifigo_token', token);
        else localStorage.removeItem('flatifigo_token');
    }

    function getToken() { return authToken; }

    async function request(method, endpoint, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (authToken) opts.headers['Authorization'] = `Bearer ${authToken}`;
        if (body) opts.body = JSON.stringify(body);

        try {
            const res = await fetch(`${BASE}${endpoint}`, opts);
            return await res.json();
        } catch (err) {
            console.error('API Error:', err);
            return { success: false, message: 'Network error. Is the server running?' };
        }
    }

    return {
        setToken, getToken,
        register: (data) => request('POST', '/register', data),
        login: (data) => request('POST', '/login', data),
        checkSession: () => request('GET', '/session'),
        logout: () => request('POST', '/logout'),
        getProfile: () => request('GET', '/profile'),
        getRoommates: () => request('GET', '/roommates'),
        updateProfile: (data) => request('PUT', '/profile', data),
        getListings: (params = '') => request('GET', `/listings${params ? '?' + params : ''}`),
        createListing: (data) => request('POST', '/listings', data),
        getListing: (id) => request('GET', `/listings/${id}`),
        updateListing: (id, data) => request('PUT', `/listings/${id}`, data),
        deleteListing: (id) => request('DELETE', `/listings/${id}`),
        getMyListings: () => request('GET', '/my-listings'),
        uploadImages: async (files) => {
            const formData = new FormData();
            files.forEach(f => formData.append('images', f));
            try {
                const res = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
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
                const res = await fetch('http://localhost:5000/api/profile/avatar', {
                    method: 'POST',
                    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
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
