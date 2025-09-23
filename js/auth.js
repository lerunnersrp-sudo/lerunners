document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!firebase.apps.length) { firebase.initializeApp(FIREBASE_CONFIG); }
    } catch (e) {
        console.error('Erro ao inicializar o Firebase:', e); return;
    }
    const auth = firebase.auth();
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const loginError = document.getElementById('login-error');
    
    auth.onAuthStateChanged(user => {
        const isDashboardPage = document.body.id === 'dashboard-page';
        if (user) {
            if (isDashboardPage) {
                if (typeof initializeDashboard === 'function') {
                    initializeDashboard(user);
                } else {
                    console.error("Erro: A função initializeDashboard() não foi encontrada.");
                }
            } else {
                window.location.replace('dashboard.html');
            }
        } else {
            if (isDashboardPage) {
                console.log("Usuário não autenticado. Redirecionando para login.");
                window.location.replace('index.html');
            }
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = "";
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    console.error("Erro no login:", error);
                    if (loginError) loginError.textContent = "Email ou senha inválidos.";
                });
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut();
        });
    }
});
