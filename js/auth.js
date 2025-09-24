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
            .then(userCredential => {
                // Após criar o usuário, executamos a escrita no banco de dados.
                // Esta é a função crítica que foi simplificada.
                const user = userCredential.user;
                const userData = {
                    nome: name,
                    email: email,
                    tipo: role,
                    dataCadastro: new Date().toISOString(),
                    ativo: true
                };
                // Realiza uma única e simples operação de escrita no nó /usuarios.
                // Esta operação é garantida de funcionar com as regras que estabelecemos.
                return this.db.ref('usuarios/' + user.uid).set(userData);
            })
            .then(() => {
                // Apenas com o sucesso da escrita no DB, o fluxo continua.
                // O redirecionamento será tratado pelo onAuthStateChanged no main.js
                console.log("Usuário criado e perfil salvo com sucesso em /usuarios.");
            })
            .catch(error => {
                console.error("Erro no processo de cadastro:", error);
                const message = error.code === 'auth/email-already-in-use' ? "Este email já está cadastrado." : "Erro ao criar conta.";
                Utils.displayError('register-error', message);
            });
    }
};
