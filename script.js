let audioCtx = null;

function darFeedback() {
    if (navigator.vibrate) { navigator.vibrate(15); } 
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }

        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain();
        
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.02);
        
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
        
        osc.connect(gain); 
        gain.connect(audioCtx.destination); 
        
        osc.start(audioCtx.currentTime); 
        osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
}

function limparCampo(idCaixaTexto) {
    darFeedback();
    document.getElementById(idCaixaTexto).value = ''; 
    document.getElementById(idCaixaTexto).focus(); 
    if (idCaixaTexto === 'filtroBusca') { filtrarGeral(); }
}

function alternarLista() {
    darFeedback();
    var tabela = document.getElementById("tabela-estoque");
    var btnToggle = document.getElementById("btn-toggle-lista");
    if (tabela.style.display === "none") {
        tabela.style.display = "table";
        btnToggle.innerHTML = "🔽 Ocultar Lista de Estoque";
    } else {
        tabela.style.display = "none";
        btnToggle.innerHTML = "▶️ Mostrar Lista de Estoque";
    }
}

function alternarTema() {
    darFeedback(); document.body.classList.toggle('light-mode');
    localStorage.setItem('temaEstoque', document.body.classList.contains('light-mode') ? 'claro' : 'escuro');
}

let acaoConfirmacao = null;

function mostrarToast(msg) {
    const container = document.getElementById('toast-container'); const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = msg; container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function mostrarConfirmacao(msg, callback, tipoBotao = 'perigo') {
    darFeedback(); document.getElementById('modal-text').innerText = msg;
    const btnCancel = document.getElementById('modal-btn-cancel'); const btnConfirm = document.getElementById('modal-btn-confirm');
    btnCancel.style.display = 'block'; btnCancel.innerText = 'Cancelar'; btnConfirm.style.display = 'block'; btnConfirm.innerText = 'Confirmar';
    btnConfirm.style.backgroundColor = (tipoBotao === 'sucesso') ? 'var(--btn-green)' : 'var(--btn-red)';
    document.getElementById('modal-confirm').style.display = 'flex'; acaoConfirmacao = callback;
}

function mostrarAlertaElegante(msg) {
    darFeedback(); document.getElementById('modal-text').innerText = msg;
    const btnCancel = document.getElementById('modal-btn-cancel'); const btnConfirm = document.getElementById('modal-btn-confirm');
    btnCancel.style.display = 'none'; btnConfirm.style.display = 'block'; btnConfirm.innerText = 'OK';
    btnConfirm.style.backgroundColor = 'var(--btn-blue)'; document.getElementById('modal-confirm').style.display = 'flex'; acaoConfirmacao = null; 
}

function fecharModal() { document.getElementById('modal-confirm').style.display = 'none'; acaoConfirmacao = null; }

document.getElementById('modal-btn-confirm').addEventListener('click', () => {
    darFeedback(); if(acaoConfirmacao) acaoConfirmacao(); fecharModal();
});

function obterDataAtual() { return new Date().toLocaleDateString('pt-BR'); }
function obterDataAmanha() { let hoje = new Date(); let amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1); return amanha.toLocaleDateString('pt-BR'); }
        
function atualizarTitulos() { 
    document.getElementById("titulo-pagina").innerText = "ESTOQUE " + obterDataAtual(); 
    document.getElementById("titulo-compras").innerText = "LISTA " + obterDataAmanha(); 
}

var produtosPadrao = ["4 queijos|kg", "Açúcar|kg", "Alho frito|pct", "Azeitona|uni", "Bacon|kg", "Banana|kg", "Batata palha|pct", "Caixa|uni", "Calabresa|kg", "Canela|pct", "Carne|kg", "Cebola|kg", "Cheddar|uni", "Chocolate branco|kg", "Chocolate preto|kg", "Colorau|pct", "Detergente|uni", "Esponja|uni", "Fermento|uni", "Frango cozido|kg", "Frango cru|kg", "Fubá|kg", "Gelo|pct", "Milho|uni", "Molho|uni", "Mussarela|kg", "Óleo|uni", "Orégano|pct", "Ovo|uni", "Palha de aço|uni", "Papel toalhas|uni", "Plástico filme|uni", "Presunto|kg", "Requeijão|uni", "Saco p lixo|uni", "Saco plástico|uni", "Sal|kg", "Strogonoff|kg", "Tempero caldo de carne|cx", "Tempero caldo de frango|cx", "Tempero em pó carne|cx", "Tempero em pó frango|cx", "Trigo|kg"];

var tbody = document.getElementById("lista-itens");
var selectFiltro = document.getElementById("filtroSelect");
var buscaInput = document.getElementById("filtroBusca");
var areaCompras = document.getElementById("area-compras");
var ulCompras = document.getElementById("lista-compras-visual");

function carregarListaPadrao() {
    var listaCombinada = [];
    var ocultosSistema = JSON.parse(localStorage.getItem("itensOcultosPadrao_v3") || "[]");
    produtosPadrao.forEach(p => { 
        var d = p.split("|"); 
        if (!ocultosSistema.includes(d[0].toLowerCase())) {
            listaCombinada.push({ n: d[0], q: "", u: d[1], c: false });
        }
    });
    var favoritosUsuario = JSON.parse(localStorage.getItem("meusItensPadrao_v3") || "[]");
    favoritosUsuario.forEach(item => {
        if(!listaCombinada.some(i => i.n.toLowerCase() === item.n.toLowerCase())) {
            listaCombinada.push({ n: item.n, q: "", u: item.u, c: false });
        }
    });
    listaCombinada.sort((a, b) => a.n.localeCompare(b.n));
    listaCombinada.forEach(i => inserirLinha(i.n, i.q, i.u, i.c));
}

function iniciarApp() {
    if(localStorage.getItem('temaEstoque') === 'claro') { document.body.classList.add('light-mode'); }
    atualizarTitulos();
    var salvos = localStorage.getItem("estoqueDados_v3");
    if (salvos && JSON.parse(salvos).length > 0) {
        var dados = JSON.parse(salvos); dados.sort((a, b) => a.n.localeCompare(b.n)); dados.forEach(i => inserirLinha(i.n, i.q, i.u, i.c || false));
    } else {
        carregarListaPadrao();
    }
    atualizarDropdown(); atualizarPainelCompras(); 
}

function duploCliqueQtd(inputElement) {
    darFeedback(); var valor = inputElement.value.trim().replace(',', '.'); var num = parseFloat(valor);
    if (isNaN(num)) { inputElement.value = "1"; } else { inputElement.value = (num + 1).toString().replace('.', ','); }
    salvarDados(); mostrarToast("+1 Adicionado!");
}

function calcularMath(inputElement) {
    var valor = inputElement.value.trim();
    if (valor.includes('+') || valor.includes('-')) {
        try {
            var expressao = valor.replace(/,/g, '.').replace(/[^0-9\+\-\.\s]/g, '');
            if(expressao !== "") {
                var resultado = Function('"use strict";return (' + expressao + ')')();
                resultado = Math.round(resultado * 100) / 100;
                inputElement.value = resultado.toString().replace('.', ','); salvarDados();
            }
        } catch (e) {}
    }
}

function salvarDados() {
    var dados = [];
    document.querySelectorAll("#lista-itens tr").forEach(r => {
        var c = r.querySelectorAll("td");
        dados.push({ 
            n: c[1].innerText.replace(/(\r\n|\n|\r)/gm, " ").trim(), q: c[2].querySelector("input").value.trim(), 
            u: c[3].querySelector("select").value, c: c[0].querySelector("input[type='checkbox']").checked
        });
    });
    localStorage.setItem("estoqueDados_v3", JSON.stringify(dados));
    var s = document.getElementById("status-save"); s.style.opacity = "1"; setTimeout(() => s.style.opacity = "0", 1500);
    atualizarPainelCompras();
}

function inserirLinha(n, q, u, chk) {
    var tr = document.createElement("tr");
    if(chk) tr.classList.add("linha-marcada");
    tr.innerHTML = `
        <td class="col-check"><input type="checkbox" onchange="alternarCheck(this)" ${chk ? 'checked' : ''}></td>
        <td class="col-desc"><span contenteditable="true" class="nome-prod" onblur="salvarEOrdenar()">${n}</span></td>
        <td class="col-qtd"><input type="text" class="input-qtd-tabela" value="${q}" oninput="salvarDados()" onblur="calcularMath(this)" ondblclick="duploCliqueQtd(this)"></td>
        <td class="col-unid"><select class="select-tabela" onchange="salvarDados()">
            <option value="kg" ${u==='kg'?'selected':''}>kg</option><option value="g" ${u==='g'?'selected':''}>g</option>
            <option value="uni" ${u==='uni'?'selected':''}>uni</option><option value="pct" ${u==='pct'?'selected':''}>pct</option>
            <option value="cx" ${u==='cx'?'selected':''}>cx</option><option value="bld" ${u==='bld'?'selected':''}>bld</option>
            <option value="crt" ${u==='crt'?'selected':''}>crt</option>
        </select></td>
        <td class="col-del"><button class="btn-remove" onclick="removerItem(this)">🗑️</button></td>
    `;
    tbody.appendChild(tr);
}

function alternarCheck(box) {
    darFeedback(); var linha = box.parentElement.parentElement;
    if(box.checked) { linha.classList.add("linha-marcada"); } else { linha.classList.remove("linha-marcada"); }
    salvarDados(); 
}

function atualizarPainelCompras() {
    ulCompras.innerHTML = ""; var temItens = false;
    document.querySelectorAll("#lista-itens tr").forEach(r => {
        var checkbox = r.querySelector("input[type='checkbox']");
        if (checkbox && checkbox.checked) {
            temItens = true; var li = document.createElement("li");
            li.innerText = r.querySelector(".nome-prod").innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
            ulCompras.appendChild(li);
        }
    });
    areaCompras.style.display = temItens ? "block" : "none";
}

function gerarTextoCompras() {
    var t = `*LISTA DE COMPRAS ${obterDataAmanha()}*\n\n`;
    document.querySelectorAll("#lista-itens tr").forEach(r => {
        var check = r.querySelector("input[type='checkbox']");
        if (check && check.checked) { t += `${r.querySelector(".nome-prod").innerText.replace(/(\r\n|\n|\r)/gm, " ").trim()}\n`; }
    });
    return t;
}

function copiarCompras() { copiarParaClipboard(gerarTextoCompras()); }
function compartilharComprasZap() { window.open("https://wa.me/?text=" + encodeURIComponent(gerarTextoCompras()), '_blank'); }

function gerarTextoEstoque() {
    var t = `*ESTOQUE ${obterDataAtual()}*\n\n`;
    document.querySelectorAll("#lista-itens tr").forEach(r => {
        var c = r.querySelectorAll("td"); var nome = c[1].innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
        var qTxt = c[2].querySelector("input").value.trim(); var unidade = c[3].querySelector("select").options[c[3].querySelector("select").selectedIndex].text;
        if(qTxt !== "") { t += `${nome}: ${qTxt} ${unidade}\n`; } else { t += `${nome}:   ${unidade}\n`; }
    });
    return t;
}

function copiarEstoque() { copiarParaClipboard(gerarTextoEstoque()); }
function compartilharEstoque() { window.open("https://wa.me/?text=" + encodeURIComponent(gerarTextoEstoque()), '_blank'); }

function copiarParaClipboard(texto) {
    darFeedback();
    if (navigator.clipboard && window.isSecureContext) { 
        navigator.clipboard.writeText(texto).then(() => mostrarToast("Copiado com sucesso! ✅")).catch(() => copiarFallback(texto)); 
    } else { copiarFallback(texto); }
}

function copiarFallback(texto) {
    var textArea = document.createElement("textarea"); textArea.value = texto; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea); textArea.focus(); textArea.select();
    try { document.execCommand('copy'); mostrarToast("Copiado com sucesso! ✅"); } catch (err) { mostrarAlertaElegante("Erro ao copiar."); }
    document.body.removeChild(textArea);
}

function salvarEOrdenar() { salvarDados(); reordenarTabela(); atualizarDropdown(); }

function reordenarTabela() {
    var rows = Array.from(tbody.querySelectorAll("tr"));
    rows.sort((a, b) => a.querySelector(".nome-prod").innerText.localeCompare(b.querySelector(".nome-prod").innerText));
    rows.forEach(row => tbody.appendChild(row));
}

function removerItem(b) { 
    mostrarConfirmacao("Deseja realmente remover este item?", () => {
        b.parentElement.parentElement.remove(); salvarDados(); atualizarDropdown(); mostrarToast("Removido 🗑️");
    }); 
}

function adicionarManual(salvarNoPadrao) {
    var p = document.getElementById("novoProduto").value.trim();
    var q = document.getElementById("novoQtd").value.trim();
    var u = document.getElementById("novoUnidade").value;
    if (!p) { mostrarToast("⚠️ Digite o nome do produto!"); return; }
    darFeedback();
    inserirLinha(p, q, u, false); 
    salvarEOrdenar(); 
    if(salvarNoPadrao) {
        var favoritosUsuario = JSON.parse(localStorage.getItem("meusItensPadrao_v3") || "[]");
        if(!favoritosUsuario.some(item => item.n.toLowerCase() === p.toLowerCase())) {
            favoritosUsuario.push({ n: p, u: u });
            localStorage.setItem("meusItensPadrao_v3", JSON.stringify(favoritosUsuario));
            mostrarToast("Item FIXADO no padrão! ⭐");
        } else { mostrarToast("Item já estava fixado! ➕"); }
    } else { mostrarToast("Adicionado! ➕"); }
    document.getElementById("novoProduto").value = ""; 
    document.getElementById("novoQtd").value = "";
}

function removerDoPadrao() {
    var p = document.getElementById("novoProduto").value.trim();
    if (!p) { mostrarToast("⚠️ Digite o nome do produto na caixa para remover!"); return; }
    darFeedback();
    var favoritosUsuario = JSON.parse(localStorage.getItem("meusItensPadrao_v3") || "[]");
    var novaListaFavoritos = favoritosUsuario.filter(item => item.n.toLowerCase() !== p.toLowerCase());
    localStorage.setItem("meusItensPadrao_v3", JSON.stringify(novaListaFavoritos));
    var ocultosSistema = JSON.parse(localStorage.getItem("itensOcultosPadrao_v3") || "[]");
    if (!ocultosSistema.includes(p.toLowerCase())) {
        ocultosSistema.push(p.toLowerCase());
        localStorage.setItem("itensOcultosPadrao_v3", JSON.stringify(ocultosSistema));
    }
    document.querySelectorAll("#lista-itens tr").forEach(r => {
        var nomeTabela = r.querySelector(".nome-prod").innerText.toLowerCase();
        if(nomeTabela === p.toLowerCase()) { r.remove(); }
    });
    salvarDados(); atualizarDropdown();
    mostrarToast("Removido do padrão! 🚫");
    document.getElementById("novoProduto").value = "";
    document.getElementById("novoQtd").value = "";
}

function filtrarGeral() {
    var tBusca = buscaInput.value.toLowerCase(); var tSelect = selectFiltro.value.toLowerCase();
    document.querySelectorAll("#lista-itens tr").forEach(r => {
        var nome = r.querySelector(".nome-prod").innerText.toLowerCase();
        r.style.display = (nome.includes(tBusca) && (tSelect === "" || nome === tSelect)) ? "" : "none";
    });
}

function atualizarDropdown() {
    var v = selectFiltro.value; selectFiltro.innerHTML = '<option value="">📂 ITENS</option>';
    var nomes = []; document.querySelectorAll(".nome-prod").forEach(td => nomes.push(td.innerText.replace(/(\r\n|\n|\r)/gm, " ").trim()));
    nomes.sort().forEach(n => { var o = document.createElement("option"); o.value = n; o.text = n; selectFiltro.add(o); });
    selectFiltro.value = v;
}

function resetarTudo() { 
    mostrarConfirmacao("ATENÇÃO: Isso restaurará a lista de fábrica do ZERO.\nConfirmar?", () => { 
        localStorage.removeItem("estoqueDados_v3"); 
        localStorage.removeItem("itensOcultosPadrao_v3");
        location.reload(); 
    }); 
}

function iniciarNovoDia() {
    mostrarConfirmacao("INICIAR NOVO DIA?\nIsso limpará as quantidades e desmarcará as compras.", () => {
        var dados = JSON.parse(localStorage.getItem("estoqueDados_v3") || "[]");
        dados.forEach(item => { item.q = ""; item.c = false; });
        localStorage.setItem("estoqueDados_v3", JSON.stringify(dados)); location.reload();
    }, 'sucesso');
}

function salvarListaNoCelular() {
    var dados = localStorage.getItem("estoqueDados_v3");
    if (!dados || dados === "[]") { mostrarToast("⚠️ Não há dados para salvar!"); return; }
    darFeedback();
    var blob = new Blob([dados], { type: "application/json" });
    var url = URL.createObjectURL(blob); var a = document.createElement("a"); a.href = url;
    a.download = "MEU_ESTOQUE_" + obterDataAtual().replace(/\//g, "-") + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    mostrarToast("Backup salvo no celular! 💾");
}

function carregarListaDoCelular(event) {
    var file = event.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var dados = JSON.parse(e.target.result);
            if (Array.isArray(dados)) { 
                localStorage.setItem("estoqueDados_v3", JSON.stringify(dados)); 
                mostrarAlertaElegante("Lista carregada com sucesso! A página será atualizada.");
                setTimeout(() => location.reload(), 1500); 
            } else { mostrarAlertaElegante("Arquivo inválido."); }
        } catch (erro) { mostrarAlertaElegante("Erro ao ler o arquivo."); }
    };
    reader.readAsText(file);
}

function autoPreencherUnidade() {
    var inputNome = document.getElementById("novoProduto").value.toLowerCase().trim();
    if (inputNome.length < 2) return; 
    var unidadeEncontrada = null;
    var matchPadrao = produtosPadrao.find(p => p.split("|")[0].toLowerCase().startsWith(inputNome));
    if (matchPadrao) { unidadeEncontrada = matchPadrao.split("|")[1]; } else {
        var rows = Array.from(tbody.querySelectorAll("tr"));
        var matchTabela = rows.find(r => r.querySelector(".nome-prod").innerText.toLowerCase().startsWith(inputNome));
        if (matchTabela) { unidadeEncontrada = matchTabela.querySelector(".select-tabela").value; }
    }
    if (unidadeEncontrada) {
        var selectUnid = document.getElementById("novoUnidade");
        if (Array.from(selectUnid.options).some(opt => opt.value === unidadeEncontrada)) { selectUnid.value = unidadeEncontrada; }
    }
}

iniciarApp();
