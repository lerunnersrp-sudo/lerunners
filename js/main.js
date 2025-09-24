document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase não está inicializado. Verifique seu arquivo config.js e a ordem de carregamento dos scripts.");
        return;
    }

    const auth = firebase.auth();
    const db = firebase.database();
    const currentPage = window.location.pathname.split('/').pop();

    auth.onAuthStateChanged(user => {
        const isDashboardPage = currentPage.includes('-dashboard.html');

        if (user) {
            if (isDashboardPage) {
                // Se já estiver em uma página de dashboard, inicializa a lógica do dashboard
                if (typeof DashboardModule !== 'undefined') {
                    DashboardModule.init(user);
                }
            } else {
                // Se estiver na página de login, busca o perfil e redireciona
                db.ref('/usuarios/' + user.uid).once('value').then(snapshot => {
                    const userData = snapshot.val();
                    if (userData) {
                        const destination = userData.tipo === 'atleta' ? 'athlete-dashboard.html' : 'professor-dashboard.html';
                        window.location.replace(destination);
                    } else {
                        console.error("Perfil não encontrado no DB. Forçando logout.");
                        auth.signOut();
                    }
                }).catch(error => {
                    console.error("Erro ao buscar perfil:", error);
                    auth.signOut();
                });
            }
        } else {
            // Se não estiver logado e não estiver na página de login, redireciona para lá
            if (isDashboardPage) {
                window.location.replace('index.html');
            }
        }
    });

    // Inicializa o módulo de autenticação apenas na página de login/cadastro
    if (currentPage === 'index.html' || currentPage === '') {
        AuthModule.init();
    }
});
