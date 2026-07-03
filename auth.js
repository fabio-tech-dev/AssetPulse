// ========================================================
// ARQUIVO: auth.js
// DESCRIÇÃO: Lógica JavaScript para autenticação de usuários no AssetPulse.
// Este script gerencia o cadastro e o login de usuários, enviando requisições
// para a API de backend e tratando as respostas para exibir alertas e redirecionar.
// ========================================================
function mostrarAlertaCustom(titulo, mensagem, tipo, icone) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-icon">${icone}</div>
        <div class="toast-content">
            <h4>${titulo}</h4>
            <p>${mensagem}</p>
        </div>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3400);
}

// Monitora o formulário de cadastro se ele existir na página atual
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nome = document.getElementById('cad-nome').value;
        const email = document.getElementById('cad-email').value;
        const senha = document.getElementById('cad-senha').value;

        try {
            const response = await fetch('http://localhost:3000/api/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }) 
            });
            const dados = await response.json();

            if (response.ok) {
                mostrarAlertaCustom('Cadastro Realizado', 'Você já pode fazer login!', 'success', '✅');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                mostrarAlertaCustom('Erro no Cadastro', dados.erro || 'Verifique os dados.', 'error', '❌');
                document.getElementById('cad-email').classList.add('input-erro');
                setTimeout(() => {
                    document.getElementById('cad-email').classList.remove('input-erro');
                }, 800);
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            mostrarAlertaCustom('Erro', 'Falha de conexão com o servidor.', 'error', '❌');
        }
    });
}

// Monitora o formulário de login se ele existir na página atual
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const dados = await response.json();

            if (response.ok) {
                localStorage.setItem('usuarioLogado', JSON.stringify(dados.usuario));
                mostrarAlertaCustom('Acesso Permitido', `Bem-vindo de volta, ${dados.usuario.nome}!`, 'success', '🚀');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                mostrarAlertaCustom('Acesso Negado', 'Email ou senha inválidos!', 'error', '❌');
                document.getElementById('login-email').classList.add('input-erro');
                document.getElementById('login-senha').classList.add('input-erro');
                setTimeout(() => {
                    document.getElementById('login-email').classList.remove('input-erro');
                    document.getElementById('login-senha').classList.remove('input-erro');
                }, 800);
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            mostrarAlertaCustom('Erro', 'Falha de conexão com o servidor.', 'error', '❌');
        }
    });
}

// Alterna a visibilidade da senha no input (botão do olhinho)
function mostrarOcultarSenha(inputId, btnElement) {
    const inputSenha = document.getElementById(inputId);

    const olhoAberto = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    `;
    
    const olhoFechado = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    `;

    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        btnElement.innerHTML = olhoFechado;
    } else {
        inputSenha.type = 'password';
        btnElement.innerHTML = olhoAberto;
    }
}

// Efeito de digitação e troca de palavras animadas (exibido no banner de login)
const elementoPalavra = document.getElementById('palavra-animada');
if (elementoPalavra) {
    const palavras = [
        "controle absoluto de hardwares.", 
        "monitorar licenças em tempo real.", 
        "reduzir custos operacionais."
    ];
    let indiceAtual = 0;

    setInterval(() => {
        elementoPalavra.classList.add('fade-out');
        
        setTimeout(() => {
            indiceAtual = (indiceAtual + 1) % palavras.length;
            elementoPalavra.textContent = palavras[indiceAtual];
            
            elementoPalavra.classList.remove('fade-out');
        }, 600); 

    }, 4000); 
}