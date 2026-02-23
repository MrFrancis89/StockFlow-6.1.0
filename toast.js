// toast.js
export function mostrarToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function mostrarAlertaElegante(msg) {
    darFeedback();
    document.getElementById('modal-text').innerText = msg;
    const btnCancel = document.getElementById('modal-btn-cancel');
    const btnConfirm = document.getElementById('modal-btn-confirm');
    btnCancel.style.display = 'none';
    btnConfirm.style.display = 'block';
    btnConfirm.innerText = 'OK';
    btnConfirm.style.backgroundColor = 'var(--btn-blue)';
    document.getElementById('modal-confirm').style.display = 'flex';
    window.acaoConfirmacao = null;
}
