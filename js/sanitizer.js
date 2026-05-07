/* ==========================================
   Sanitizer — XSS Protection Utilities
   ==========================================
   Provides consistent input sanitization across
   all modules to prevent Cross-Site Scripting.

   Usage:
     Sanitizer.escape(userInput)       // Escapes HTML entities
     Sanitizer.escapeAttr(attrValue)   // Safe for HTML attributes
     Sanitizer.sanitizeUrl(url)        // Validates/sanitizes URLs
   ========================================== */

const Sanitizer = (() => {
    // Reusable DOM element for escaping (created once)
    const _escapeEl = document.createElement('div');

    /**
     * Escape HTML special characters to prevent XSS.
     * Converts: & < > " ' ` to their HTML entity equivalents.
     * 
     * @param {*} text - Any value to escape (converted to string).
     * @returns {string} -  Safe HTML string.
     */
    function escape(text) {
        if (text === null || text === undefined) return '';
        _escapeEl.textContent = String(text);
        return _escapeEl.innerHTML;
    }

    /**
     * Escape a value for safe use in HTML attributes.
     * Escapes quotes and special attribute characters.
     * 
     * @param {*} value - The attribute value to escape.
     * @returns {string} - Safe attribute string.
     */
    function escapeAttr(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Sanitize a URL to prevent javascript: and data: injection.
     * Only allows http, https, and relative URLs.
     * 
     * @param {string} url - The URL to validate.
     * @returns {string} - Safe URL or empty string.
     */
    function sanitizeUrl(url) {
        if (!url || typeof url !== 'string') return '';
        const trimmed = url.trim().toLowerCase();
        // Block dangerous protocols
        if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
            return '';
        }
        return url;
    }

    /**
     * Sanitize an array of strings (e.g., amenities list).
     * 
     * @param {Array} arr - Array of strings.
     * @returns {Array} - Array of escaped strings.
     */
    function escapeArray(arr) {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => escape(item));
    }

    /**
     * Truncate text to a max length with ellipsis.
     * Escapes HTML before truncating.
     * 
     * @param {string} text - Input text.
     * @param {number} maxLen - Maximum character length.
     * @returns {string} - Truncated and escaped string.
     */
    function truncate(text, maxLen = 100) {
        const safe = escape(text);
        return safe.length > maxLen ? safe.slice(0, maxLen) + '...' : safe;
    }

    return { escape, escapeAttr, sanitizeUrl, escapeArray, truncate };
})();
