// ===================================================================
// ARQUIVO DE AUTENTICAÇÃO - Controla login, logout e proteção de rotas.
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
    } catch (e) {
        console.error('Erro ao inicializar o Firebase:', e);
    }

    const auth = firebase.auth();
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const loginError = document.getElementById('login-error');
    
    // --- LÓGICA DE PROTEÇÃO DE PÁGINA ---
    auth.onAuthStateChanged(user => {
        const isDashboardPage = document.body.id === 'dashboard-page';
        
        if (user) {
            // Se o usuário está logado
            if (isDashboardPage) {
                // E está no dashboard, exibe o email dele
                const userEmailDisplay = document.getElementById('user-email');
                if(userEmailDisplay) userEmailDisplay.textContent = user.email;
            } else {
                // E não está no dashboard (provavelmente na tela de login), redireciona para o dashboard
                window.location.replace('dashboard.html');
            }
        } else {
            // Se o usuário NÃO está logado
            if (isDashboardPage) {
                // E tenta acessar o dashboard, redireciona para o login
                console.log("Usuário não autenticado. Redirecionando para login.");
                window.location.replace('index.html');
            }
        }
    });

    // --- LÓGICA DO FORMULÁRIO DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = ""; // Limpa erros antigos
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            
            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    console.log("Login bem-sucedido:", userCredential.user.email);
                    // O onAuthStateChanged vai cuidar do redirecionamento
                })
                .catch(error => {
                    console.error("Erro no login:", error);
                    if (loginError) loginError.textContent = "Email ou senha inválidos.";
                });
        });
    }

    // --- LÓGICA DO BOTÃO DE LOGOUT ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                console.log("Logout realizado com sucesso.");
                // O onAuthStateChanged vai cuidar do redirecionamento para o login
            }).catch(error => {
                console.error("Erro no logout:", error);
            });
        });
    }
});
