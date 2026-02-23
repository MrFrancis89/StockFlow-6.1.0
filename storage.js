// storage.js
export const STORAGE_KEYS = {
    dados: "estoqueDados_v4_categorias",
    ocultos: "itensOcultosPadrao_v4",
    meus: "meusItensPadrao_v4",
    tema: "temaEstoque",
    lupaPos: "lupaPosicao_v1",
    dicaSwipe: "dicaSwipeMostrada",
    ultimaVersao: "stockflow_ultima_versao"
};

export function salvarDados(dados) {
    localStorage.setItem(STORAGE_KEYS.dados, JSON.stringify(dados));
}

export function carregarDados() {
    const salvos = localStorage.getItem(STORAGE_KEYS.dados);
    return salvos ? JSON.parse(salvos) : null;
}

export function salvarOcultos(ocultos) {
    localStorage.setItem(STORAGE_KEYS.ocultos, JSON.stringify(ocultos));
}

export function carregarOcultos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ocultos) || "[]");
}

export function salvarMeus(meus) {
    localStorage.setItem(STORAGE_KEYS.meus, JSON.stringify(meus));
}

export function carregarMeus() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.meus) || "[]");
}

export function salvarTema(modo) {
    localStorage.setItem(STORAGE_KEYS.tema, modo);
}

export function carregarTema() {
    return localStorage.getItem(STORAGE_KEYS.tema);
}

export function salvarPosicaoLupa(pos) {
    localStorage.setItem(STORAGE_KEYS.lupaPos, JSON.stringify(pos));
}

export function carregarPosicaoLupa() {
    const pos = localStorage.getItem(STORAGE_KEYS.lupaPos);
    return pos ? JSON.parse(pos) : null;
}

export function marcarDicaSwipeVista() {
    localStorage.setItem(STORAGE_KEYS.dicaSwipe, 'true');
}

export function dicaSwipeFoiVista() {
    return !!localStorage.getItem(STORAGE_KEYS.dicaSwipe);
}

export function salvarUltimaVersao(versao) {
    localStorage.setItem(STORAGE_KEYS.ultimaVersao, versao);
}

export function carregarUltimaVersao() {
    return localStorage.getItem(STORAGE_KEYS.ultimaVersao);
}
