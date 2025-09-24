document.addEventListener('DOMContentLoaded', () => {
    // Esta verificação garante que estamos na página de login/cadastro
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        return; // Se não for a página de login, não faz nada.
    }

    // Inicializa os serviços do Firebase diretamente
    const auth = firebase.auth();
    const db = firebase.database();

    // Referências aos elementos do formulário
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');

    // Funções de Utilitários (integradas para simplicidade)
    const displayError = (elementId, message) => {
        const errorElement = document.getElementById(elementId);
        if (errorElement) errorElement.textContent = message;
    };
    const clearError = (elementId) => {
        const errorElement = document.getElementById(elementId);
        if (errorElement) errorElement.textContent = "";
    };

    // Lógica para alternar entre os formulários
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

    // Lógica de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        clearError('login-error');
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                displayError('login-error', 'Email ou senha inválidos.');
            });
    });

    // Lógica de Cadastro (a parte crítica, agora corrigida e simplificada)
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value; // Corrigido
        const role = document.querySelector('input[name="role"]:checked').value;

        clearError('register-error');
        if (password.length < 6) {
            displayError('register-error', "A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                const uid = user.uid;

                // Cria o perfil principal em /usuarios
                const userData = {
                    nome: name,
                    email: email,
                    tipo: role,
                    dataCadastro: new Date().toISOString(),
                    ativo: true
                };
                
                // Define a estrutura secundária baseada no papel (role)
                const profileData = role === 'atleta' 
                    ? { dadosPessoais: { nome, email } } 
                    : { dadosPessoais: { nome, email } };
                const profilePath = role === 'atleta' ? 'atletas' : 'professores';

                // Cria um objeto com todas as atualizações a serem feitas
                const updates = {};
                updates[`/usuarios/${uid}`] = userData;
                updates[`/${profilePath}/${uid}`] = profileData;

                // Executa a escrita em múltiplos locais. Esta é a forma mais robusta.
                return db.ref().update(updates);
            })
            .catch(error => {
                console.error("Erro no processo de cadastro:", error);
                const message = error.code === 'auth/email-already-in-use' ? "Este email já está cadastrado." : "Erro ao criar conta.";
                displayError('register-error', message);
            });
    });
});
