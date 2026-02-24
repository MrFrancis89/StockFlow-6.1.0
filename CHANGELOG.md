# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [6.1.0] - 2025-04-08

### Adicionado
- **Alternância entre calculadora e teclado nativo**: Na calculadora, um botão "⌨️ Usar teclado" permite sair para o teclado do dispositivo e digitar diretamente no campo de quantidade.
- **Ícone de retorno à calculadora**: Quando em modo teclado, um ícone 🧮 aparece dentro do campo; clicando nele, o campo volta a ser readonly e a calculadora reabre.
- **Parser avançado de frações**: Agora é possível digitar frações como `1/2`, `3/4`, `2 1/3` nos campos de quantidade (modo teclado). Ao sair do campo, a fração é convertida automaticamente para decimal (ex: `1/2` → `0,5`), garantindo compatibilidade com os alertas de estoque.
- **Lupa flutuante corrigida**: Agora a lupa é arrastável novamente, e o duplo toque funciona conforme esperado (abre busca + microfone).

### Corrigido
- Problema na lupa que a deixava estática foi resolvido.
- Dependências circulares e importações faltantes em `utils.js` foram ajustadas.

---

## [6.0.0] - 2025-04-08

### Adicionado
- Navegação por abas: Estoque e Compras.
- Interface reorganizada seguindo novo design.
- Sistema de novidades automáticas ao atualizar (modal "O que há de novo").
- Versão dinâmica exibida no título.

### Alterado
- Nome do projeto restaurado para StockFlow Pro.

---

## [5.3.1] - 2025-04-08

### Adicionado
- Dica de swipe na primeira execução.
- Tooltips nos botões Fixar e Ocultar.
- Acessibilidade nos botões de swipe.

### Alterado
- Renomeação do botão "Padrão" para "Ocultar".

---

## [5.3.0] - 2025-03-15

### Versão inicial
- Lista categorizada automaticamente.
- Swipe para apagar/configurar alertas.
- Calculadora integrada.
- Reconhecimento de voz.
- Tema claro/escuro.
- Exportação/importação JSON.
- Lista de compras baseada em itens marcados.
- Compartilhamento WhatsApp e cópia.
- Lupa flutuante com busca e duplo toque para microfone.
