// swipe.js
import { mostrarConfirmacao } from './confirm.js';
import { salvarDados } from './storage.js';
import { coletarDadosDaTabela } from './ui.js';
import { abrirModalAlerta } from './alerta.js';
import { mostrarToast } from './toast.js';

let swipeStartX = 0, swipeStartY = 0, swipeCurrentX = 0;
let isSwiping = false, swipedRow = null, justSwiped = false;
const swipeBg = document.getElementById("swipe-bg");
const swipeWidth = 160;

export function initSwipe() {
    const container = document.getElementById("lista-itens-container");
    function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function getClientY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    container.addEventListener('touchstart', function(e) {
        let tr = e.target.closest('tr');
        if (!tr || tr.classList.contains('categoria-header-row')) return;
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') return;
        if (swipedRow && swipedRow !== tr) closeSwipe(swipedRow);
        
        swipeStartX = getClientX(e);
        swipeStartY = getClientY(e);
        isSwiping = false;
        justSwiped = false;
        swipeCurrentX = (swipedRow === tr) ? -swipeWidth : 0;
        tr.style.transition = 'none';
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
        let tr = e.target.closest('tr');
        if (!tr || tr.classList.contains('categoria-header-row')) return;
        let deltaX = getClientX(e) - swipeStartX;
        let deltaY = getClientY(e) - swipeStartY;
        if (!isSwiping && Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
            isSwiping = true;
        }
        if (isSwiping) {
            if (e.cancelable) e.preventDefault();
            if (document.activeElement) document.activeElement.blur();
            justSwiped = true;
            
            swipeBg.style.display = 'flex';
            swipeBg.style.top = tr.offsetTop + 'px';
            swipeBg.style.height = tr.offsetHeight + 'px';
            
            let moveX = swipeCurrentX + deltaX;
            if (moveX > 0) moveX = 0;
            if (moveX < -swipeWidth) moveX = -swipeWidth;
            tr.style.transform = `translateX(${moveX}px)`;
        }
    }, { passive: false });

    container.addEventListener('touchend', function(e) {
        let tr = e.target.closest('tr');
        if (!tr || tr.classList.contains('categoria-header-row')) return;
        if (isSwiping) {
            let deltaX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - swipeStartX;
            let finalX = swipeCurrentX + deltaX;
            tr.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            if (finalX < -40) {
                tr.style.transform = `translateX(-${swipeWidth}px)`;
                swipedRow = tr;
            } else {
                closeSwipe(tr);
            }
            setTimeout(() => { justSwiped = false; }, 300);
        } else {
            justSwiped = false;
        }
    });

    document.addEventListener('touchstart', function(e) {
        if (swipedRow && !swipedRow.contains(e.target) && e.target.id !== 'swipe-bg' && !e.target.closest('.swipe-btn')) {
            closeSwipe(swipedRow);
        }
    }, { passive: true });

    // Configura os botões do swipe
    swipeBg.innerHTML = `
        <button class="swipe-btn swipe-btn-excluir" aria-label="Apagar item">🗑️ Apagar</button>
        <button class="swipe-btn swipe-btn-alerta" aria-label="Configurar alerta">🔔 Alerta</button>
    `;
    swipeBg.style.width = swipeWidth + 'px';
    swipeBg.style.display = 'none';
    swipeBg.style.flexDirection = 'row';
    swipeBg.style.alignItems = 'stretch';
    swipeBg.style.padding = '0';

    // Listeners para os botões (precisam ser configurados após a criação)
    // Serão chamados via onclick nos próprios botões, mas podemos adicionar listeners também
    document.querySelectorAll('.swipe-btn-excluir').forEach(btn => {
        btn.addEventListener('click', removerLinhaSwipe);
    });
    document.querySelectorAll('.swipe-btn-alerta').forEach(btn => {
        btn.addEventListener('click', abrirModalAlertaSwipe);
    });
}

function closeSwipe(tr) {
    if (tr) {
        tr.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        tr.style.transform = `translateX(0px)`;
    }
    setTimeout(() => {
        if (!swipedRow || swipedRow === tr) {
            swipeBg.style.display = 'none';
            if (swipedRow === tr) swipedRow = null;
        }
    }, 300);
}

function removerLinhaSwipe() {
    if (!swipedRow) return;
    mostrarConfirmacao("Deseja realmente remover este item?", () => {
        swipedRow.remove();
        const dados = coletarDadosDaTabela();
        salvarDados(dados);
        mostrarToast("Removido 🗑️");
        closeSwipe(swipedRow);
    });
}

function abrirModalAlertaSwipe() {
    if (!swipedRow) return;
    abrirModalAlerta(swipedRow);
    closeSwipe(swipedRow);
}
