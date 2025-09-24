document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o objeto firebase foi carregado antes de usar.
    // Se esta verificação falhar, os links <script> no HTML estão incorretos ou fora de ordem.
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("ERRO FATAL: O SDK do Firebase não foi inicializado. Verifique se os links <script> para o Firebase SDK estão presentes no final do seu arquivo HTML, antes dos scripts da sua aplicação.");
        return;
    }

    const auth = firebase.auth();
    const currentPage = window.location.pathname.split('/').pop();
    const isDashboardPage = currentPage === 'dashboard.html';
    const isLoginPage = currentPage === 'index.html' || currentPage === '';

    // Observador principal que gerencia o estado de login do usuário em toda a plataforma.
    auth.onAuthStateChanged(user => {
        if (user) {
            // CONDIÇÃO: O usuário está autenticado no Firebase.
            
            if (isLoginPage) {
                // Se o usuário está logado e, por algum motivo, está na página de login,
                // ele é imediatamente redirecionado para o dashboard para evitar confusão.
                window.location.replace('dashboard.html');
            }
            
            if (isDashboardPage && typeof DashboardModule !== 'undefined') {
                // Se o usuário está na página correta (dashboard.html),
                // o módulo principal do dashboard é iniciado.
                DashboardModule.init(user);
            }
        } else {
            // CONDIÇÃO: O usuário NÃO está autenticado.
            
            if (isDashboardPage) {
                // Se um usuário não autenticado tenta acessar o dashboard diretamente,
                // ele é imediatamente redirecionado para a página de login.
                window.location.replace('index.html');
            }
        }
    });

    // Garante que a lógica de login e cadastro (AuthModule) só seja
    // inicializada na página de login (index.html), evitando erros em outras páginas.
    if (isLoginPage) {
        AuthModule.init();
    }
});
