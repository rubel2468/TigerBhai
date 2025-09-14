function clearCache() {
    // Clear various types of cache
    if ('caches' in window) {
        caches.keys().then(function(names) {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Show success message
    document.getElementById('success').style.display = 'block';
    
    // Redirect to homepage after a short delay
    setTimeout(() => {
        window.location.href = '/';
    }, 2000);
}

function hardRefresh() {
    // Force a hard refresh
    window.location.reload(true);
}

// Auto-redirect to homepage after 10 seconds
setTimeout(() => {
    window.location.href = '/';
}, 10000);
