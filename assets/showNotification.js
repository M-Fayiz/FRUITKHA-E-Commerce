let currentToastTimeout;

window.showToast = function (message, status = 'info') {
    // Clear any existing timeout
    if (currentToastTimeout) {
        clearTimeout(currentToastTimeout);
    }

    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create and configure the new toast
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${status}`;
    
    // Choose the icon based on status
    const iconSvg = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1 4h.01M12 20h0m0-1h0m0-15a9 9 0 110 18 9 9 0 010-18z"/></svg>`
    }[status];

    toast.innerHTML = `
        <div class="toast-content">
            ${iconSvg}
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="removeToast(this)">
            &times;
        </button>
    `;
    

    container.appendChild(toast);
    currentToastTimeout = setTimeout(() => removeToast(toast), 2000); 
};

function removeToast(toast) {
    if (toast) {
        toast.style.opacity = 0; 
        setTimeout(() => toast.remove(), 200)
        }
}
