// v6.0.0 - StockFlow Pro com versionamento dinâmico, novidades, alternância calculadora/teclado e parser de frações
const VERSAO_ATUAL = "v6.0.0";

// ===== NOVIDADES POR VERSÃO =====
const releaseNotes = {
    "v6.0.0": `✨ **StockFlow Pro v6.0.0**

- Navegação por abas: Estoque e Compras.
- Interface reorganizada seguindo novo design.
- Sistema de novidades automáticas ao atualizar.
- Versão dinâmica exibida no título.
- Botão na calculadora para alternar para teclado.
- Ícone de retorno à calculadora nos campos.
- Parser de frações (ex: 1/2, 2 1/3 → decimal).`,
    "v5.3.1": `🔧 **v5.3.1**

- Dica de swipe na primeira execução.
- Tooltips nos botões Fixar e Ocultar.
- Acessibilidade nos botões de swipe.`,
    "v5.3.0": `🚀 **v5.3.0**

- Lista categorizada automaticamente.
- Swipe para apagar/configurar alertas.
- Calculadora integrada.
- Reconhecimento de voz.
- Tema claro/escuro.
- Exportação/importação JSON.`
};

// ===== VERIFICAÇÃO DE NOVIDADES =====
function verificarNovidades() {
    const ultimaVersaoVista = localStorage.getItem('stockflow_ultima_versao');
    if (ultimaVersaoVista !== VERSAO_ATUAL) {
        if (releaseNotes[VERSAO_ATUAL]) {
            mostrarNovidades(releaseNotes[VERSAO_ATUAL]);
        }
        localStorage.setItem('stockflow_ultima_versao', VERSAO_ATUAL);
    }
}

function mostrarNovidades(texto) {
    const modal = document.getElementById('modal-whatsnew');
    const content = document.getElementById('whatsnew-content');
    content.innerText = texto;
    modal.style.display = 'flex';
}

document.querySelectorAll('.fechar-whatsnew').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('modal-whatsnew').style.display = 'none';
    });
});

// ===== ATUALIZA TÍTULO COM VERSÃO =====
function atualizarTituloPrincipal() {
    const titulo = document.getElementById('titulo-principal');
    titulo.innerHTML = `StockFlow Pro <span style="color: var(--btn-danger); font-size: 12px; margin-left: 5px;">${VERSAO_ATUAL}</span>`;
}

let audioCtx = null;
let inputCalculadoraAtual = null;
let expressaoCalc = "";

const mapaCategorias = {
    'temperos': ['orégano', 'pimenta', 'canela', 'colorau', 'caldo', 'tempero', 'ervas', 'salsa', 'cebolinha', 'cominho', 'açafrão', 'páprica', 'curry'],
    'limpeza': ['detergente', 'sabão', 'esponja', 'água sanitária', 'desinfetante', 'papel', 'saco', 'lixo', 'bucha', 'álcool', 'limpador', 'multiuso', 'pano', 'vassoura'],
    'carnes': ['carne', 'frango', 'bacon', 'calabresa', 'presunto', 'peixe', 'hamburguer', 'linguiça', 'strogonoff', 'costela', 'bife'],
    'laticinios': ['queijo', 'mussarela', 'cheddar', 'requeijão', 'catupiry', 'leite', 'manteiga', 'iogurte', 'creme de leite', 'parmesão', 'provolone', 'gorgonzola'],
    'hortifruti': ['tomate', 'cebola', 'alho', 'batata', 'banana', 'limão', 'alface', 'rúcula', 'manjericão', 'pimentão', 'cenoura', 'azeitona', 'milho', 'ervilha', 'palmito', 'cogumelo', 'champignon', 'fruta', 'abacaxi', 'uva'],
    'mercearia': ['arroz', 'feijão', 'trigo', 'farinha', 'açúcar', 'sal', 'macarrão', 'óleo', 'azeite', 'fermento', 'fubá', 'molho', 'extrato', 'passata', 'ketchup', 'maionese', 'mostarda', 'chocolate', 'café', 'pão'],
    'bebidas': ['refrigerante', 'coca', 'guaraná', 'suco', 'água', 'cerveja', 'vinho', 'vodka', 'whisky', 'gelo', 'polpa'],
    'embalagens': ['caixa', 'sacola', 'plástico', 'filme', 'alumínio', 'isopor', 'guardanapo', 'canudo', 'copo']
};

const coresCategorias = {
    'carnes': 'var(--cat-carnes)', 'laticinios': 'var(--cat-laticinios)',
    'hortifruti': 'var(--cat-horti)', 'mercearia': 'var(--cat-mercearia)',
    'temperos': 'var(--cat-temperos)', 'limpeza': 'var(--cat-limpeza)',
    'bebidas': 'var(--cat-bebidas)', 'embalagens': 'var(--cat-outros)',
    'outros': 'var(--cat-outros)'
};

const nomesCategorias = {
    'carnes': '🥩 CARNES & FRIOS', 'laticinios': '🧀 LATICÍNIOS',
    'hortifruti': '🥦 HORTIFRUTI', 'mercearia': '🍝 MERCEARIA & GRÃOS',
    'temperos': '🧂 TEMPEROS', 'limpeza': '🧽 LIMPEZA & DESCARTÁVEIS',
    'bebidas': '🥤 BEBIDAS', 'embalagens': '📦 EMBALAGENS',
    'outros': '📦 OUTROS'
};

function identificarCategoria(nomeItem) {
    let nome = nomeItem.toLowerCase();
    const prioridade = ['temperos', 'limpeza', 'bebidas', 'laticinios', 'hortifruti', 'mercearia', 'carnes', 'embalagens'];
    for (let i = 0; i < prioridade.length; i++) {
        let cat = prioridade[i];
        if (mapaCategorias[cat] && mapaCategorias[cat].some(termo => nome.includes(termo))) { return cat; }
    }
    return 'outros';
}

function darFeedback() {
    if (navigator.vibrate) { navigator.vibrate(15); } 
    try {
        if (!audioCtx) { const AudioContext = window.AudioContext || window.webkitAudioContext; audioCtx = new AudioContext(); }
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
}

let recognition = null;
let isRecording = false;
let activeField = null;

function initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false; 
        recognition.interimResults = true; 
        recognition.onstart = function() {
            isRecording = true;
            if (activeField === 'produto') { document.getElementById('btn-mic-prod').classList.add('ouvindo'); document.getElementById('novoProduto').placeholder = "Ouvindo..."; } 
            else if (activeField === 'busca') { document.getElementById('btn-mic-busca').classList.add('ouvindo'); document.getElementById('filtroBusca').placeholder = "Ouvindo..."; }
        };
        recognition.onend = function() {
            isRecording = false;
            document.getElementById('btn-mic-prod').classList.remove('ouvindo');
            document.getElementById('btn-mic-busca').classList.remove('ouvindo');
            document.getElementById('novoProduto').placeholder = "Item";
            document.getElementById('filtroBusca').placeholder = "🔍 Buscar...";
            if(activeField === 'produto') autoPreencherUnidade(); 
            activeField = null;
        };
        recognition.onerror = function(event) {
            isRecording = false;
            document.getElementById('btn-mic-prod').classList.remove('ouvindo');
            document.getElementById('btn-mic-busca').classList.remove('ouvindo');
            document.getElementById('novoProduto').placeholder = "Item";
            document.getElementById('filtroBusca').placeholder = "🔍 Buscar...";
            activeField = null;
        };
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) { transcript += event.results[i][0].transcript; }
            let textoFinal = transcript.replace(/\.$/, '');
            if (activeField === 'produto') { document.getElementById('novoProduto').value = textoFinal; } 
            else if (activeField === 'busca') { document.getElementById('filtroBusca').value = textoFinal; filtrarGeral(); }
        };
    }
}

function toggleMic(campo, event) { 
    if(event) event.stopPropagation(); 
    darFeedback(); 
    if (!recognition) { mostrarToast("Navegador sem suporte."); return; } 
    if (isRecording) { recognition.stop(); } 
    else { 
        activeField = campo; 
        try { recognition.start(); } catch (e) { recognition.stop(); isRecording = false; } 
    } 
}

window.addEventListener('load', initSpeech);

function toggleSearch(event) {
    if (event) event.stopPropagation(); darFeedback();
    const overlay = document.getElementById('search-overlay');
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
    } else {
        overlay.style.display = 'block';
        overlay.style.top = (window.scrollY + 15) + 'px';
        document.getElementById('filtroBusca').focus();
    }
}

document.addEventListener('click', function(event) { const overlay = document.getElementById('search-overlay'); const btn = document.getElementById('assistive-touch'); if ((!overlay.contains(event.target) && !btn.contains(event.target)) && overlay.style.display === 'block') { toggleSearch(null); } });
window.addEventListener('scroll', function() { var overlay = document.getElementById('search-overlay'); if (overlay.style.display === 'block') { overlay.style.top = (window.scrollY + 15) + 'px'; } });

// ===== DRAGGABLE LUPA COM PERSISTÊNCIA =====
let isDragging = false;
let startX, startY, initialLeft, initialTop;
const assistiveTouch = document.getElementById('assistive-touch');
const storageKeyPos = 'lupaPosicao_v1';

function carregarPosicaoLupa() {
    const posSalva = localStorage.getItem(storageKeyPos);
    if (posSalva) {
        const pos = JSON.parse(posSalva);
        assistiveTouch.style.left = pos.left;
        assistiveTouch.style.top = pos.top;
        assistiveTouch.style.bottom = 'auto';
        assistiveTouch.style.right = 'auto';
    } else {
        assistiveTouch.style.bottom = '20px';
        assistiveTouch.style.right = '15px';
        assistiveTouch.style.top = 'auto';
        assistiveTouch.style.left = 'auto';
    }
}

assistiveTouch.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    const computedStyle = window.getComputedStyle(assistiveTouch);
    if (computedStyle.left !== 'auto' && computedStyle.left !== '0px') {
        initialLeft = parseFloat(computedStyle.left);
    } else {
        const rect = assistiveTouch.getBoundingClientRect();
        initialLeft = rect.left;
    }
    if (computedStyle.top !== 'auto' && computedStyle.top !== '0px') {
        initialTop = parseFloat(computedStyle.top);
    } else {
        const rect = assistiveTouch.getBoundingClientRect();
        initialTop = rect.top;
    }

    isDragging = false;
}, { passive: false });

assistiveTouch.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (!isDragging && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        isDragging = true;
    }

    if (isDragging) {
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const lupaWidth = assistiveTouch.offsetWidth;
        const lupaHeight = assistiveTouch.offsetHeight;
        const maxLeft = window.innerWidth - lupaWidth;
        const maxTop = window.innerHeight - lupaHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        assistiveTouch.style.left = newLeft + 'px';
        assistiveTouch.style.top = newTop + 'px';
        assistiveTouch.style.bottom = 'auto';
        assistiveTouch.style.right = 'auto';
    }
}, { passive: false });

assistiveTouch.addEventListener('touchend', (e) => {
    if (isDragging) {
        e.preventDefault();
        const pos = {
            left: assistiveTouch.style.left,
            top: assistiveTouch.style.top
        };
        localStorage.setItem(storageKeyPos, JSON.stringify(pos));
    }
    isDragging = false;
}, { passive: false });

// ===== DOUBLE TAP NA LUPA =====
let lastTap = 0;
let tapTimeout;
let isTouchEvent = false;

assistiveTouch.addEventListener('touchstart', () => {
    isTouchEvent = true;
});

assistiveTouch.addEventListener('touchend', (e) => {
    if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isTouchEvent = false;
        return;
    }

    e.preventDefault();
    const currentTime = new Date().getTime();
    if (lastTap && (currentTime - lastTap) < 300) {
        clearTimeout(tapTimeout);
        if (document.getElementById('search-overlay').style.display !== 'block') {
            toggleSearch(null);
        }
        setTimeout(() => {
            toggleMic('busca', null);
        }, 50);
        lastTap = 0;
    } else {
        tapTimeout = setTimeout(() => {
            toggleSearch(null);
        }, 300);
    }
    lastTap = currentTime;
});

assistiveTouch.addEventListener('click', (e) => {
    if (isTouchEvent || isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isTouchEvent = false;
        return;
    }
    toggleSearch(e);
});

// ===== SWIPE COM DOIS BOTÕES =====
let swipeStartX = 0, swipeStartY = 0, swipeCurrentX = 0;
let isSwiping = false, swipedRow = null, justSwiped = false;
const swipeBg = document.getElementById("swipe-bg");
const swipeWidth = 160;

swipeBg.innerHTML = `
    <button class="swipe-btn swipe-btn-excluir" aria-label="Apagar item">🗑️ Apagar</button>
    <button class="swipe-btn swipe-btn-alerta" aria-label="Configurar alerta">🔔 Alerta</button>
`;
swipeBg.style.width = swipeWidth + 'px';
swipeBg.style.display = 'none';
swipeBg.style.flexDirection = 'row';
swipeBg.style.alignItems = 'stretch';
swipeBg.style.padding = '0';

function initSwipe() {
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
        salvarDados();
        atualizarDropdown();
        mostrarToast("Removido 🗑️");
        closeSwipe(swipedRow);
    });
}

function abrirModalAlertaSwipe() {
    if (!swipedRow) return;
    abrirModalAlerta(swipedRow);
    closeSwipe(swipedRow);
}

function abrirCalculadora(inputElement) { if (justSwiped || swipedRow) return; darFeedback(); inputElement.blur(); inputCalculadoraAtual = inputElement; let tituloCalc = "🧮 Calculadora"; if (inputElement.id === "novoQtd") { let nomeNovo = document.getElementById("novoProduto").value.trim(); tituloCalc = nomeNovo ? "🧮 " + nomeNovo : "🧮 NOVO ITEM"; } else { let linha = inputElement.closest("tr"); if (linha) { let nomeTabela = linha.querySelector(".nome-prod").innerText.trim(); tituloCalc = "🧮 " + nomeTabela; } } document.getElementById("calc-title").innerText = tituloCalc; let val = inputElement.value.replace(',', '.').trim(); expressaoCalc = val || ""; atualizarDisplayCalc(); document.getElementById('modal-calc').style.display = 'flex'; }
function fecharCalculadora() { darFeedback(); document.getElementById('modal-calc').style.display = 'none'; inputCalculadoraAtual = null; }
function calcDigito(digito) { darFeedback(); if (digito === 'C') { expressaoCalc = ""; } else if (digito === 'BACK') { expressaoCalc = expressaoCalc.slice(0, -1); } else { if (digito === ',') digito = '.'; expressaoCalc += digito; } atualizarDisplayCalc(); }
function atualizarDisplayCalc() { let display = document.getElementById('calc-display'); display.innerText = expressaoCalc.replace(/\./g, ',') || "0"; }
function calcSalvar() { darFeedback(); try { let expr = expressaoCalc.replace(/×/g, '*').replace(/÷/g, '/'); expr = expr.replace(/[^0-9+\-*/.]/g, ''); if (expr) { let resultado = Function('"use strict";return (' + expr + ')')(); if (!isFinite(resultado)) throw new Error("Erro"); resultado = Math.round(resultado * 100) / 100; inputCalculadoraAtual.value = resultado.toString().replace('.', ','); } else { inputCalculadoraAtual.value = ""; } salvarDados(); fecharCalculadora(); mostrarToast("Quantidade Salva ✅"); verificarAlertas(); } catch (e) { document.getElementById('calc-display').innerText = "Erro"; setTimeout(atualizarDisplayCalc, 1000); } }

function limparCampo(idCaixaTexto) { darFeedback(); document.getElementById(idCaixaTexto).value = ''; document.getElementById(idCaixaTexto).focus(); if (idCaixaTexto === 'filtroBusca') { filtrarGeral(); } }
function alternarLista() { darFeedback(); var tabelaWrapper = document.querySelector(".table-wrapper"); var btnToggle = document.getElementById("btn-toggle-lista"); if (tabelaWrapper.style.display === "none") { tabelaWrapper.style.display = "block"; btnToggle.innerHTML = "🔽 Ocultar Lista de Estoque"; } else { tabelaWrapper.style.display = "none"; btnToggle.innerHTML = "▶️ Mostrar Lista de Estoque"; } }
function alternarTema() { darFeedback(); document.body.classList.toggle('light-mode'); localStorage.setItem('temaEstoque', document.body.classList.contains('light-mode') ? 'claro' : 'escuro'); }

let acaoConfirmacao = null;
function mostrarToast(msg) { const container = document.getElementById('toast-container'); const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = msg; container.appendChild(toast); setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000); }
function mostrarConfirmacao(msg, callback, tipoBotao = 'perigo') { darFeedback(); document.getElementById('modal-text').innerText = msg; const btnCancel = document.getElementById('modal-btn-cancel'); const btnConfirm = document.getElementById('modal-btn-confirm'); btnCancel.style.display = 'block'; btnCancel.innerText = 'Cancelar'; btnConfirm.style.display = 'block'; btnConfirm.innerText = 'Confirmar'; btnConfirm.style.backgroundColor = (tipoBotao === 'sucesso') ? 'var(--btn-green)' : 'var(--btn-red)'; document.getElementById('modal-confirm').style.display = 'flex'; acaoConfirmacao = callback; }
function mostrarAlertaElegante(msg) { darFeedback(); document.getElementById('modal-text').innerText = msg; const btnCancel = document.getElementById('modal-btn-cancel'); const btnConfirm = document.getElementById('modal-btn-confirm'); btnCancel.style.display = 'none'; btnConfirm.style.display = 'block'; btnConfirm.innerText = 'OK'; btnConfirm.style.backgroundColor = 'var(--btn-blue)'; document.getElementById('modal-confirm').style.display = 'flex'; acaoConfirmacao = null; }
function fecharModal() { document.getElementById('modal-confirm').style.display = 'none'; acaoConfirmacao = null; }
document.getElementById('modal-btn-confirm').addEventListener('click', () => { darFeedback(); if(acaoConfirmacao) acaoConfirmacao(); fecharModal(); });
document.getElementById('modal-btn-cancel').addEventListener('click', () => { darFeedback(); fecharModal(); });

function obterDataAtual() { return new Date().toLocaleDateString('pt-BR'); }
function obterDataAmanha() { let hoje = new Date(); let amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1); return amanha.toLocaleDateString('pt-BR'); }

function atualizarTitulos() { 
    document.getElementById("titulo-compras").innerText = "LISTA " + obterDataAmanha(); 
}

var storageKey = "estoqueDados_v4_categorias"; var storageOcultos = "itensOcultosPadrao_v4"; var storageMeus = "meusItensPadrao_v4";

var containerItens = document.getElementById("lista-itens-container"); var selectFiltro = document.getElementById("filtroSelect"); var buscaInput = document.getElementById("filtroBusca"); var areaCompras = document.getElementById("area-compras"); var ulCompras = document.getElementById("lista-compras-visual");

// ===== FUNÇÕES DE ALERTA =====
let itemAlertaAtual = null;

function abrirModalAlerta(elemento) {
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

function fecharModalAlerta() {
    document.getElementById('modal-alerta').style.display = 'none';
    itemAlertaAtual = null;
}

function salvarAlerta() {
    if (!itemAlertaAtual) return;
    let min = document.getElementById('alerta-min').value;
    let max = document.getElementById('alerta-max').value;
    min = min ? parseFloat(min) : null;
    max = max ? parseFloat(max) : null;

    itemAlertaAtual.dataset.min = min !== null ? min : '';
    itemAlertaAtual.dataset.max = max !== null ? max : '';

    salvarDados();
    verificarAlertas();
    fecharModalAlerta();
}

function verificarAlertas() {
    let dados = JSON.parse(localStorage.getItem(storageKey) || "[]");
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

// ===== PARSER DE FRAÇÕES =====
function parseFractionToDecimal(str) {
    if (!str) return '';
    let s = str.trim().replace(',', '.');
    
    // Fração simples: "1/2"
    let fractionMatch = s.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        let num = parseInt(fractionMatch[1]);
        let den = parseInt(fractionMatch[2]);
        if (den === 0) {
            mostrarToast("Denominador não pode ser zero.");
            return str;
        }
        return (num / den).toString().replace('.', ',');
    }
    
    // Número misto: "2 1/2"
    let mixedMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
        let whole = parseInt(mixedMatch[1]);
        let num = parseInt(mixedMatch[2]);
        let den = parseInt(mixedMatch[3]);
        if (den === 0) {
            mostrarToast("Denominador não pode ser zero.");
            return str;
        }
        return (whole + num / den).toString().replace('.', ',');
    }
    
    // Decimal simples (já com ponto ou vírgula)
    let num = parseFloat(s);
    if (!isNaN(num)) {
        return num.toString().replace('.', ',');
    }
    
    mostrarToast("Formato inválido. Use números ou frações (ex: 1/2, 2 1/2)");
    return str;
}

function parseAndUpdateQuantity(input) {
    let original = input.value;
    let parsed = parseFractionToDecimal(original);
    if (parsed !== original) {
        input.value = parsed;
        salvarDados();
    }
}

// ===== FUNÇÕES PRINCIPAIS =====
function carregarListaPadrao() { 
    var listaCombinada = []; 
    var ocultosSistema = JSON.parse(localStorage.getItem(storageOcultos) || "[]"); 
    produtosPadrao.forEach(p => { 
        var d = p.split("|"); 
        if (!ocultosSistema.includes(d[0].toLowerCase())) { 
            listaCombinada.push({ n: d[0], q: "", u: d[1], c: false, min: null, max: null }); 
        } 
    }); 
    var favoritosUsuario = JSON.parse(localStorage.getItem(storageMeus) || "[]"); 
    favoritosUsuario.forEach(item => { 
        if(!listaCombinada.some(i => i.n.toLowerCase() === item.n.toLowerCase())) { 
            listaCombinada.push({ n: item.n, q: "", u: item.u, c: false, min: null, max: null }); 
        } 
    }); 
    renderizarListaCompleta(listaCombinada); 
}

function renderizarListaCompleta(dados) { 
    containerItens.innerHTML = ""; 
    dados.sort((a, b) => a.n.localeCompare(b.n)); 
    let grupos = { 
        'carnes': [], 'laticinios': [], 'hortifruti': [], 'mercearia': [], 
        'temperos': [], 'limpeza': [], 'bebidas': [], 'embalagens': [], 'outros': [] 
    }; 
    dados.forEach(item => { 
        let cat = identificarCategoria(item.n); 
        grupos[cat].push(item); 
    }); 
    for (let cat in grupos) { 
        if (grupos[cat].length > 0) { 
            let trHeader = document.createElement("tr"); 
            trHeader.classList.add("categoria-header-row"); 
            trHeader.innerHTML = `<td colspan="4" class="categoria-header" style="background-color: ${coresCategorias[cat]}">${nomesCategorias[cat]}</td>`; 
            containerItens.appendChild(trHeader); 
            grupos[cat].forEach(item => { 
                inserirLinhaNoDOM(item.n, item.q, item.u, item.c, item.min, item.max); 
            }); 
        } 
    } 
}

function inserirLinhaNoDOM(n, q, u, chk, min, max) { 
    var tr = document.createElement("tr"); 
    if(chk) tr.classList.add("linha-marcada");
    tr.dataset.min = min !== null && min !== undefined ? min : '';
    tr.dataset.max = max !== null && max !== undefined ? max : '';
    
    tr.innerHTML = `
        <td class="col-check"><input type="checkbox" ${chk ? 'checked' : ''}></td>
        <td class="col-desc">
            <span contenteditable="true" class="nome-prod">${n}</span>
        </td>
        <td class="col-qtd"><input type="text" class="input-qtd-tabela" value="${q}" readonly></td>
        <td class="col-unid"><select class="select-tabela">
            <option value="kg" ${u==='kg'?'selected':''}>kg</option>
            <option value="g" ${u==='g'?'selected':''}>g</option>
            <option value="uni" ${u==='uni'?'selected':''}>uni</option>
            <option value="pct" ${u==='pct'?'selected':''}>pct</option>
            <option value="cx" ${u==='cx'?'selected':''}>cx</option>
            <option value="bld" ${u==='bld'?'selected':''}>bld</option>
            <option value="crt" ${u==='crt'?'selected':''}>crt</option>
        </select></td>
    `;
    containerItens.appendChild(tr); 
}

function salvarDados() { 
    var dados = []; 
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => { 
        var c = r.querySelectorAll("td"); 
        if (c.length > 0) { 
            let nome = c[1].querySelector('.nome-prod').innerText.replace(/(\r\n|\n|\r)/gm, " ").trim(); 
            let qtd = c[2].querySelector("input").value.trim(); 
            let unid = c[3].querySelector("select").value; 
            let chk = c[0].querySelector("input[type='checkbox']").checked; 
            let min = r.dataset.min ? parseFloat(r.dataset.min) : null; 
            let max = r.dataset.max ? parseFloat(r.dataset.max) : null; 
            dados.push({ n: nome, q: qtd, u: unid, c: chk, min: min, max: max }); 
        } 
    }); 
    localStorage.setItem(storageKey, JSON.stringify(dados)); 
    var s = document.getElementById("status-save"); 
    s.style.opacity = "1"; 
    setTimeout(() => s.style.opacity = "0", 1500); 
    atualizarPainelCompras(); 
}

function salvarEAtualizar() { 
    salvarDados(); 
    var dados = JSON.parse(localStorage.getItem(storageKey)); 
    renderizarListaCompleta(dados); 
    atualizarDropdown(); 
}

function alternarTodos(masterBox) { 
    darFeedback(); 
    let isChecked = masterBox.checked; 
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => { 
        if (r.style.display !== "none") { 
            let box = r.querySelector("input[type='checkbox']"); 
            box.checked = isChecked; 
            if (isChecked) { 
                r.classList.add("linha-marcada"); 
            } else { 
                r.classList.remove("linha-marcada"); 
            } 
        } 
    }); 
    salvarDados(); 
}

function alternarCheck(box) { 
    darFeedback(); 
    var linha = box.parentElement.parentElement; 
    if(box.checked) { 
        linha.classList.add("linha-marcada"); 
    } else { 
        linha.classList.remove("linha-marcada"); 
        document.getElementById('check-todos').checked = false; 
    } 
    salvarDados(); 
}

function atualizarPainelCompras() { 
    ulCompras.innerHTML = ""; 
    var temItens = false; 
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => { 
        var checkbox = r.querySelector("input[type='checkbox']"); 
        if (checkbox && checkbox.checked) { 
            temItens = true; 
            var li = document.createElement("li"); 
            li.innerText = r.querySelector(".nome-prod").innerText.replace(/(\r\n|\n|\r)/gm, " ").trim(); 
            ulCompras.appendChild(li); 
        } 
    }); 
    areaCompras.style.display = temItens ? "block" : "none"; 
}

function gerarTextoEstoque() {
    let t = "*ESTOQUE " + obterDataAtual() + "*\n\n";
    let itens = [];
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        let cols = r.querySelectorAll("td");
        let nome = cols[1].querySelector('.nome-prod').innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
        let qTxt = cols[2].querySelector("input").value.trim();
        let unidade = cols[3].querySelector("select").options[cols[3].querySelector("select").selectedIndex].text;
        if(qTxt !== "") { itens.push(`${nome}: ${qTxt} ${unidade}`); } 
        else { itens.push(`${nome}:   ${unidade}`); }
    });
    itens.sort();
    itens.forEach(i => t += `${i}\n`);
    return t;
}

function gerarTextoCompras() {
    let t = "*LISTA DE COMPRAS " + obterDataAmanha() + "*\n\n";
    let itens = [];
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        var check = r.querySelector("input[type='checkbox']");
        if (check && check.checked) {
            itens.push(r.querySelector(".nome-prod").innerText.replace(/(\r\n|\n|\r)/gm, " ").trim());
        }
    });
    itens.sort();
    itens.forEach(i => t += `${i}\n`);
    return t;
}

function copiarCompras() { copiarParaClipboard(gerarTextoCompras()); } 
function compartilharComprasZap() { window.open("https://wa.me/?text=" + encodeURIComponent(gerarTextoCompras()), '_blank'); }
function copiarEstoque() { copiarParaClipboard(gerarTextoEstoque()); } 
function compartilharEstoque() { window.open("https://wa.me/?text=" + encodeURIComponent(gerarTextoEstoque()), '_blank'); }

function copiarParaClipboard(texto) { darFeedback(); if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(texto).then(() => mostrarToast("Copiado com sucesso! ✅")).catch(() => copiarFallback(texto)); } else { copiarFallback(texto); } }
function copiarFallback(texto) { var textArea = document.createElement("textarea"); textArea.value = texto; textArea.style.position = "fixed"; textArea.style.left = "-9999px"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy'); mostrarToast("Copiado com sucesso! ✅"); } catch (err) { mostrarAlertaElegante("Erro ao copiar."); } document.body.removeChild(textArea); }

function adicionarManual(salvarNoPadrao) { 
    var p = document.getElementById("novoProduto").value.trim(); 
    var q = document.getElementById("novoQtd").value.trim(); 
    var u = document.getElementById("novoUnidade").value; 
    
    if (!p) { mostrarToast("⚠️ Digite o nome do produto!"); return; } 
    darFeedback(); 
    
    salvarDados();
    
    var dados = JSON.parse(localStorage.getItem(storageKey) || "[]"); 
    
    if (dados.some(item => item.n.toLowerCase() === p.toLowerCase())) {
        mostrarToast("⚠️ O item já existe na lista!");
        return;
    }

    dados.push({ n: p, q: q, u: u, c: false, min: null, max: null }); 
    renderizarListaCompleta(dados); 
    salvarDados(); 
    
    if(salvarNoPadrao) { 
        var favoritosUsuario = JSON.parse(localStorage.getItem(storageMeus) || "[]"); 
        if(!favoritosUsuario.some(item => item.n.toLowerCase() === p.toLowerCase())) { 
            favoritosUsuario.push({ n: p, u: u }); 
            localStorage.setItem(storageMeus, JSON.stringify(favoritosUsuario)); 
            mostrarToast("Item FIXADO! ⭐"); 
        } 
    } 
    document.getElementById("novoProduto").value = ""; 
    document.getElementById("novoQtd").value = ""; 
}

function removerDoPadrao() { 
    var p = document.getElementById("novoProduto").value.trim(); 
    if (!p) { mostrarToast("⚠️ Digite o nome para remover!"); return; } 
    darFeedback(); 
    var favoritosUsuario = JSON.parse(localStorage.getItem(storageMeus) || "[]"); 
    var novaListaFavoritos = favoritosUsuario.filter(item => item.n.toLowerCase() !== p.toLowerCase()); 
    localStorage.setItem(storageMeus, JSON.stringify(novaListaFavoritos)); 
    var ocultosSistema = JSON.parse(localStorage.getItem(storageOcultos) || "[]"); 
    if (!ocultosSistema.includes(p.toLowerCase())) { 
        ocultosSistema.push(p.toLowerCase()); 
        localStorage.setItem(storageOcultos, JSON.stringify(ocultosSistema)); 
    } 
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => { 
        var nomeTabela = r.querySelector(".nome-prod").innerText.toLowerCase(); 
        if(nomeTabela === p.toLowerCase()) { 
            r.remove(); 
        } 
    }); 
    salvarDados(); 
    atualizarDropdown(); 
    document.getElementById("novoProduto").value = ""; 
    document.getElementById("novoQtd").value = ""; 
}

function filtrarGeral() { 
    var tBusca = buscaInput.value.toLowerCase(); 
    var tSelect = selectFiltro.value.toLowerCase(); 
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => { 
        var nome = r.querySelector(".nome-prod").innerText.toLowerCase(); 
        if (nome.includes(tBusca) && (tSelect === "" || nome === tSelect)) { 
            r.style.display = ""; 
        } else { 
            r.style.display = "none"; 
        } 
    }); 
    let headers = document.querySelectorAll(".categoria-header-row"); 
    headers.forEach(header => { 
        let proximoElem = header.nextElementSibling; 
        let temItemVisivel = false; 
        while(proximoElem && !proximoElem.classList.contains("categoria-header-row")) { 
            if (proximoElem.style.display !== "none") { 
                temItemVisivel = true; 
                break; 
            } 
            proximoElem = proximoElem.nextElementSibling; 
        } 
        header.style.display = temItemVisivel ? "" : "none"; 
    }); 
}

function atualizarDropdown() { 
    var v = selectFiltro.value; 
    selectFiltro.innerHTML = '<option value="">📂 ITENS</option>'; 
    var nomes = []; 
    document.querySelectorAll(".nome-prod").forEach(td => nomes.push(td.innerText.replace(/(\r\n|\n|\r)/gm, " ").trim())); 
    nomes.sort().forEach(n => { 
        var o = document.createElement("option"); 
        o.value = n; 
        o.text = n; 
        selectFiltro.add(o); 
    }); 
    selectFiltro.value = v; 
}

function resetarTudo() { 
    mostrarConfirmacao("ATENÇÃO: Restaurar lista de fábrica?", () => { 
        localStorage.removeItem(storageKey); 
        localStorage.removeItem(storageOcultos); 
        location.reload(); 
    }); 
}

function iniciarNovoDia() { 
    mostrarConfirmacao("ZERAR QUANTIDADES?", () => { 
        var dados = JSON.parse(localStorage.getItem(storageKey) || "[]"); 
        dados.forEach(item => { 
            item.q = ""; 
            item.c = false; 
        }); 
        localStorage.setItem(storageKey, JSON.stringify(dados)); 
        location.reload(); 
    }, 'sucesso'); 
}

function salvarListaNoCelular() { 
    var dados = localStorage.getItem(storageKey); 
    if (!dados || dados === "[]") return; 
    darFeedback(); 
    var blob = new Blob([dados], { type: "application/json" }); 
    var url = URL.createObjectURL(blob); 
    var a = document.createElement("a"); 
    a.href = url; 
    
    var data = new Date();
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var ano = data.getFullYear();
    var horas = String(data.getHours()).padStart(2, '0');
    var minutos = String(data.getMinutes()).padStart(2, '0');
    var nomeArquivo = `ESTOQUE_${dia}-${mes}-${ano}_${horas}h${minutos}.json`;
    
    a.download = nomeArquivo; 
    a.click(); 
}

function carregarListaDoCelular(event) { 
    var f = event.target.files[0]; 
    var r = new FileReader(); 
    r.onload = function(e) { 
        let dados = JSON.parse(e.target.result);
        dados = dados.map(item => ({
            ...item,
            min: item.min !== undefined ? item.min : null,
            max: item.max !== undefined ? item.max : null
        }));
        localStorage.setItem(storageKey, JSON.stringify(dados)); 
        location.reload(); 
    }; 
    r.readAsText(f); 
}

function autoPreencherUnidade() { 
    var inputNome = document.getElementById("novoProduto").value.toLowerCase().trim(); 
    var match = produtosPadrao.find(p => p.split("|")[0].toLowerCase().startsWith(inputNome)); 
    if (match) { 
        document.getElementById("novoUnidade").value = match.split("|")[1]; 
    } 
}

// ===== DICA DE SWIPE =====
function mostrarDicaSwipe() {
    const dicaMostrada = localStorage.getItem('dicaSwipeMostrada');
    if (!dicaMostrada) {
        setTimeout(() => {
            mostrarToast("👆 Deslize os itens para esquerda para apagar ou configurar alerta");
            localStorage.setItem('dicaSwipeMostrada', 'true');
        }, 1000);
    }
}

// ===== FUNÇÕES DE ALTERNÂNCIA CALCULADORA/TECLADO =====
function ativarModoTeclado(input) {
    if (!input) return;
    input.removeAttribute('readonly');
    input.classList.add('modo-teclado');
    input.focus();

    let parent = input.parentNode;
    if (!parent.classList.contains('input-com-calc')) {
        parent.classList.add('input-com-calc');
    }
    let oldIcon = parent.querySelector('.btn-calc-revert');
    if (oldIcon) oldIcon.remove();

    let icon = document.createElement('span');
    icon.className = 'btn-calc-revert';
    icon.innerHTML = '🧮';
    icon.setAttribute('title', 'Usar calculadora');
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        input.setAttribute('readonly', true);
        input.classList.remove('modo-teclado');
        icon.remove();
        parent.classList.remove('input-com-calc');
        abrirCalculadora(input);
    });
    parent.appendChild(icon);
}

// ===== NAVEGAÇÃO POR ABAS =====
function iniciarNavegacao() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(content => content.classList.remove('active'));
            document.getElementById(target + '-section').classList.add('active');
            darFeedback();
        });
    });
}

// ===== EVENT LISTENERS =====
function configurarEventListeners() {
    document.querySelector('.btn-theme').addEventListener('click', alternarTema);

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.dataset.calc;
            if (val === 'OK') calcSalvar();
            else calcDigito(val);
        });
    });
    document.querySelector('.calc-close').addEventListener('click', fecharCalculadora);

    document.querySelectorAll('.btn-limpar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.limpar;
            if (id) limparCampo(id);
        });
    });

    document.getElementById('btn-mic-prod').addEventListener('click', (e) => toggleMic('produto', e));
    document.getElementById('btn-mic-busca').addEventListener('click', (e) => toggleMic('busca', e));

    document.getElementById('add-btn').addEventListener('click', () => adicionarManual(false));
    document.getElementById('add-star-btn').addEventListener('click', () => adicionarManual(true));
    document.getElementById('remove-star-btn').addEventListener('click', removerDoPadrao);

    document.getElementById('btn-toggle-lista').addEventListener('click', alternarLista);

    document.getElementById('btn-compartilhar-estoque').addEventListener('click', () => { darFeedback(); compartilharEstoque(); });
    document.getElementById('btn-copiar-estoque').addEventListener('click', copiarEstoque);
    document.getElementById('btn-compartilhar-compras').addEventListener('click', () => { darFeedback(); compartilharComprasZap(); });
    document.getElementById('btn-copiar-compras').addEventListener('click', copiarCompras);

    document.getElementById('btn-novo-dia').addEventListener('click', iniciarNovoDia);
    document.getElementById('btn-exportar').addEventListener('click', salvarListaNoCelular);
    document.getElementById('btn-importar').addEventListener('click', () => { darFeedback(); document.getElementById('input-arquivo').click(); });
    document.getElementById('btn-reset').addEventListener('click', resetarTudo);
    document.getElementById('input-arquivo').addEventListener('change', carregarListaDoCelular);

    document.getElementById('check-todos').addEventListener('change', (e) => alternarTodos(e.target));

    document.getElementById('lista-itens-container').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') alternarCheck(e.target);
    });

    document.getElementById('lista-itens-container').addEventListener('blur', (e) => {
        if (e.target.classList.contains('nome-prod')) salvarEAtualizar();
        if (e.target.classList.contains('input-qtd-tabela') && !e.target.hasAttribute('readonly')) {
            parseAndUpdateQuantity(e.target);
        }
    }, true);

    document.getElementById('lista-itens-container').addEventListener('change', (e) => {
        if (e.target.classList.contains('select-tabela')) salvarDados();
    });

    document.getElementById('lista-itens-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('input-qtd-tabela')) {
            if (!e.target.hasAttribute('readonly')) return;
            abrirCalculadora(e.target);
        }
    });

    document.getElementById('novoQtd').addEventListener('click', (e) => {
        if (!e.target.hasAttribute('readonly')) return;
        abrirCalculadora(e.target);
    });

    document.getElementById('novoQtd').addEventListener('blur', (e) => {
        if (!e.target.hasAttribute('readonly')) {
            parseAndUpdateQuantity(e.target);
        }
    });

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && (e.target.classList.contains('input-qtd-tabela') || e.target.id === 'novoQtd')) {
            e.preventDefault();
            e.target.blur();
        }
    });

    document.getElementById('filtroBusca').addEventListener('input', filtrarGeral);
    document.getElementById('filtroSelect').addEventListener('change', filtrarGeral);

    document.getElementById('btn-scroll-top').addEventListener('click', () => { darFeedback(); window.scrollTo(0,0); });
    document.getElementById('btn-scroll-bottom').addEventListener('click', () => { darFeedback(); window.scrollTo(0, document.body.scrollHeight); });

    document.getElementById('salvar-alerta').addEventListener('click', salvarAlerta);
    document.querySelectorAll('.fechar-modal-alerta').forEach(btn => {
        btn.addEventListener('click', fecharModalAlerta);
    });

    document.getElementById('calc-btn-teclado').addEventListener('click', () => {
        if (inputCalculadoraAtual) {
            fecharCalculadora();
            ativarModoTeclado(inputCalculadoraAtual);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            if (e.target.id === 'modal-confirm') fecharModal();
            if (e.target.id === 'modal-calc') fecharCalculadora();
            if (e.target.id === 'modal-alerta') fecharModalAlerta();
            if (e.target.id === 'modal-whatsnew') e.target.style.display = 'none';
        }
    });
}

// Inicialização
function iniciarApp() { 
    if(localStorage.getItem('temaEstoque') === 'claro') { document.body.classList.add('light-mode'); } 
    atualizarTituloPrincipal(); 
    atualizarTitulos(); 
    carregarPosicaoLupa(); 
    var salvos = localStorage.getItem(storageKey); 
    if (salvos && JSON.parse(salvos).length > 0) { 
        renderizarListaCompleta(JSON.parse(salvos)); 
    } else { 
        carregarListaPadrao(); 
    } 
    atualizarDropdown(); 
    atualizarPainelCompras(); 
    initSwipe(); 
    verificarAlertas(); 
    mostrarDicaSwipe();
    iniciarNavegacao();
    configurarEventListeners();
    verificarNovidades();
}

iniciarApp();
