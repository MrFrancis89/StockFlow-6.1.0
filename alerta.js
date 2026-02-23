// alerta.js
import { mostrarToast } from './toast.js';
import { salvarDados } from './storage.js';
import { coletarDadosDaTabela } from './ui.js';
import { alternarCheck } from './eventos.js'; // será criado

let itemAlertaAtual = null;

export function abrirModalAlerta(elemento) {
    let tr;
    if (elemento.tagName === 'TR') {
        tr = elemento;
    } else {
        tr = elemento.closest('tr');
    }
    if (!tr) return;
    itemAlertaAtual = tr;
    let min = tr.dataset.min ? parseFloat(tr.dataset.min) : '';
    let max = tr.dataset.max ? parseFloat(tr.dataset.max) : '';
    document.getElementById('alerta-min').value = min !== '' ? min : '';
    document.getElementById('alerta-max').value = max !== '' ? max : '';
    document.getElementById('modal-alerta').style.display = 'flex';
}

export function fecharModalAlerta() {
    document.getElementById('modal-alerta').style.display = 'none';
    itemAlertaAtual = null;
}

export function salvarAlerta() {
    if (!itemAlertaAtual) return;
    let min = document.getElementById('alerta-min').value;
    let max = document.getElementById('alerta-max').value;
    min = min ? parseFloat(min) : null;
    max = max ? parseFloat(max) : null;

    itemAlertaAtual.dataset.min = min !== null ? min : '';
    itemAlertaAtual.dataset.max = max !== null ? max : '';

    const dados = coletarDadosDaTabela();
    salvarDados(dados);
    verificarAlertas();
    fecharModalAlerta();
}

export function verificarAlertas() {
    let dados = JSON.parse(localStorage.getItem("estoqueDados_v4_categorias") || "[]");
    dados.forEach(item => {
        let qtd = parseFloat((item.q || '').replace(',', '.')) || 0;
        if (item.min !== null && item.min !== undefined && qtd < item.min) {
            mostrarToast(`⚠️ Estoque baixo: ${item.n}`);
            document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
                let nome = r.querySelector('.nome-prod').innerText.trim();
                if (nome === item.n) {
                    let chk = r.querySelector('input[type="checkbox"]');
                    if (!chk.checked) {
                        chk.checked = true;
                        alternarCheck(chk);
                    }
                }
            });
        }
        if (item.max !== null && item.max !== undefined && qtd > item.max) {
            mostrarToast(`📦 Estoque excessivo: ${item.n}`);
        }
    });
}
