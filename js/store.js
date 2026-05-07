/* ==========================================
   Store — Centralized State Management
   ==========================================
   Single source of truth for all application state.
   Replaces scattered global variables across modules.
   
   Usage:
     Store.set('pendingImages', []);
     Store.get('pendingImages');
     Store.subscribe('currentUser', callback);
   ========================================== */

const Store = (() => {
    const _state = {};
    const _subscribers = {};

    /**
     * Set a value in the store.
     * Notifies all subscribers of the changed key.
     */
    function set(key, value) {
        const oldValue = _state[key];
        _state[key] = value;

        // Notify subscribers if value changed
        if (_subscribers[key]) {
            _subscribers[key].forEach(fn => {
                try { fn(value, oldValue); }
                catch (err) { console.error(`[Store] Subscriber error for "${key}":`, err); }
            });
        }
    }

    /**
     * Get a value from the store.
     * Returns undefined if key doesn't exist.
     */
    function get(key) {
        return _state[key];
    }

    /**
     * Subscribe to changes on a particular key.
     * Returns an unsubscribe function.
     */
    function subscribe(key, callback) {
        if (!_subscribers[key]) _subscribers[key] = [];
        _subscribers[key].push(callback);

        // Return unsubscribe function
        return () => {
            _subscribers[key] = _subscribers[key].filter(fn => fn !== callback);
        };
    }

    /**
     * Update a key using a reducer function.
     * Useful for complex state updates.
     * e.g., Store.update('pendingImages', imgs => [...imgs, newFile]);
     */
    function update(key, updater) {
        const current = _state[key];
        set(key, updater(current));
    }

    /**
     * Reset a key to its initial default value.
     */
    function reset(key, defaultValue = null) {
        set(key, defaultValue);
    }

    /**
     * Get a snapshot of the full state for debugging.
     */
    function debug() {
        console.table(Object.entries(_state).map(([k, v]) => ({
            key: k,
            type: typeof v,
            value: Array.isArray(v) ? `Array(${v.length})` : v
        })));
    }

    // ── Initialize default state ──
    function init() {
        set('currentUser', JSON.parse(localStorage.getItem('flatifigo_user') || 'null'));
        set('authToken', localStorage.getItem('flatifigo_token') || null);
        set('pendingImages', []);
        set('editListingId', null);
        set('currentFilters', {
            query: '', city: '', minRent: '', maxRent: '', rooms: '', amenities: []
        });
        set('cachedListings', []);
    }

    return { set, get, subscribe, update, reset, debug, init };
})();

// Initialize default state immediately
Store.init();
