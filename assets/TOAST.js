function showToast(message, type = 'info') {
    const toast = document.querySelector('.toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');

    toast.classList.remove('toast-success', 'toast-error', 'toast-info');
    toast.classList.add(`toast-${type}`);

    toastIcon.className = `toast-icon ${type === 'success' ? 'fas fa-check-circle' : type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'}`;
    toastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    toastMessage.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  function showSuccessMessage() {
    Swal.fire({
      title: 'Success!',
      text: 'The operation was completed successfully.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  function showErrorMessage() {
    Swal.fire({
      title: 'Error!',
      text: 'An error occurred during the operation.',
      icon: 'error',
      confirmButtonText: 'Try Again'
    });
  }

  function showConfirmMessage() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Confirmed!',
          'The action has been confirmed.',
          'success'
        );
      }
    });
  }