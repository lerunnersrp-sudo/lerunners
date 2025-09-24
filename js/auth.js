const AuthModule = {
    init() {
        this.auth = firebase.auth();
        this.db = firebase.database();
        this.addEventListeners();
    },

    addEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        const registerForm = document.getElementById('register-form');
        if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        const showRegisterLink = document.getElementById('show-register-link');
        const showLoginLink = document.getElementById('show-login-link');
        const loginView = document.getElementById('login-view');
        const registerView = document.getElementById('register-view');

        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginView.classList.add('hidden');
                registerView.classList.remove('hidden');
            });
        }
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                registerView.classList.add('hidden');
                loginView.classList.remove('hidden');
            });
        }
    },

    handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        Utils.clearError('login-error');
        this.auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                console.error("Erro no login:", error.code, error.message);
                Utils.displayError('login-error', 'Email ou senha inválidos.');
            });
    },

    handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.querySelector('input[name="role"]:checked').value;

        Utils.clearError('register-error');
        if (password.length < 6) {
            Utils.displayError('register-error', "A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        this.auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => this.createUserProfile(userCredential.user.uid, name, email, role))
            .catch(error => {
                console.error("Erro no cadastro:", error.code, error.message);
                const message = error.code === 'auth/email-already-in-use' ? "Este email já está cadastrado." : "Erro ao criar conta. Tente novamente.";
                Utils.displayError('register-error', message);
            });
    },

    createUserProfile(uid, name, email, role) {
        const userData = {
            nome: name,
            email: email,
            tipo: role,
            dataCadastro: new Date().toISOString(),
            ativo: true
        };

        const profileData = role === 'atleta' ? Utils.getNewAtletaStructure(name, email) : Utils.getNewProfessorStructure(name, email);
        const profilePath = role === 'atleta' ? 'atletas' : 'professores';

        const updates = {};
        updates[`/usuarios/${uid}`] = userData;
        updates[`/${profilePath}/${uid}`] = profileData;

        this.db.ref().update(updates)
            .then(() => console.log(`Perfil de ${role} criado com sucesso.`))
            .catch(error => {
                console.error("Erro ao salvar perfil do usuário:", error);
                Utils.displayError('register-error', "Erro ao salvar dados. Contate o suporte.");
            });
    },

    handleLogout() {
        this.auth.signOut().catch(error => console.error('Erro no logout:', error));
    }
};
