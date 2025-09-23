document.addEventListener('DOMContentLoaded', () => {
    try { if (!firebase.apps.length) { firebase.initializeApp(FIREBASE_CONFIG); } } catch (e) { console.error('Erro Firebase:', e); return; }

    const auth = firebase.auth();
    const db = firebase.database();

    // --- LÓGICA DE PROTEÇÃO DE PÁGINA ---
    auth.onAuthStateChanged(user => {
        const isDashboardPage = document.body.id === 'dashboard-page';
        if (user) {
            if (isDashboardPage) {
                if (typeof initializeDashboard === 'function') { initializeDashboard(user); }
            } else { window.location.replace('dashboard.html'); }
        } else {
            if (isDashboardPage) { window.location.replace('index.html'); }
        }
    });

    // --- GERENCIAMENTO DOS FORMULÁRIOS DE LOGIN E CADASTRO ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    
    if(showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginView.classList.add('hidden'); registerView.classList.remove('hidden'); });
    if(showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); registerView.classList.add('hidden'); loginView.classList.remove('hidden'); });

    // --- LÓGICA DO FORMULÁRIO DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorMsg = document.getElementById('login-error');
            errorMsg.textContent = "";

            auth.signInWithEmailAndPassword(email, password).catch(error => {
                console.error("Erro no login:", error);
                errorMsg.textContent = "Email ou senha inválidos.";
            });
        });
    }

    // --- LÓGICA DO FORMULÁRIO DE CADASTRO ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const role = document.querySelector('input[name="role"]:checked').value;
            const errorMsg = document.getElementById('register-error');
            errorMsg.textContent = "";

            if(password.length < 6) { errorMsg.textContent = "A senha deve ter no mínimo 6 caracteres."; return; }

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    db.ref('usuarios/' + user.uid).set({
                        nome: name, email: email, tipo: role, dataCadastro: new Date().toISOString()
                    });
                })
                .catch(error => {
                    console.error("Erro no cadastro:", error);
                    if(error.code === 'auth/email-already-in-use') { errorMsg.textContent = "Este email já está cadastrado."; }
                    else { errorMsg.textContent = "Erro ao criar conta. Tente novamente."; }
                });
        });
    }

    // --- LÓGICA DE LOGOUT ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) { logoutButton.addEventListener('click', () => auth.signOut()); }
});
