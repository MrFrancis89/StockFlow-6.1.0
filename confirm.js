// confirm.js
import { darFeedback } from './utils.js';

let acaoConfirmacao = null;

export function mostrarConfirmacao(msg, callback, tipoBotao = 'perigo') {
    darFeedback();
    document.getElementById('modal-text').innerText = msg;
    const btnCancel = document.getElementById('modal-btn-cancel');
    const btnConfirm = document.getElementById('modal-btn-confirm');
    btnCancel.style.display = 'block';
    btnCancel.innerText = 'Cancelar';
    btnConfirm.style.display = 'block';
    btnConfirm.innerText = 'Confirmar';
    btnConfirm.style.backgroundColor = (tipoBotao === 'sucesso') ? 'var(--btn-green)' : 'var(--btn-red)';
    document.getElementById('modal-confirm').style.display = 'flex';
    acaoConfirmacao = callback;
}

export function fecharModal() {
    document.getElementById('modal-confirm').style.display = 'none';
    acaoConfirmacao = null;
}

// Listeners para os botões do modal (serão configurados no main)
export function configurarListenersConfirm() {
    document.getElementById('modal-btn-confirm').addEventListener('click', () => {
        darFeedback();
        if (acaoConfirmacao) acaoConfirmacao();
        fecharModal();
    });
    document.getElementById('modal-btn-cancel').addEventListener('click', () => {
        darFeedback();
        fecharModal();
    });
}

export { acaoConfirmacao };
