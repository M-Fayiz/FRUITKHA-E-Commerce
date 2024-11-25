function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
  
    // Append toast to container
    toastContainer.appendChild(toast);
  
    // Remove toast after 4 seconds
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
  