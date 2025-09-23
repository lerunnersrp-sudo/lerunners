// =================================================================
// ÁREA DE CONFIGURAÇÃO - VALORES REAIS E DEFINITIVOS
// =================================================================

const firebaseConfig = {
    apiKey: "AIzaSyDGLozMAqDoQdP_znYi3mbebUomE-_O6hU",
    authDomain: "lerunners.firebaseapp.com",
    databaseURL: "https://lerunners-default-rtdb.firebaseio.com",
    projectId: "lerunners",
    storageBucket: "lerunners.firebasestorage.app",
    messagingSenderId: "786096020973",
    appId: "1:786096020973:web:334dc555218cedb0e1dbe4"
};

const cloudinaryConfig = {
    cloudName: "dd6ppm6nf",
    apiKey: "845911223412467",
    apiSecret: "S6YefZx7J5StgcTV-greU4wFhP4"
};

// =================================================================
// FIM DA ÁREA DE CONFIGURAÇÃO
// O CÓDIGO DO SISTEMA COMEÇA ABAIXO
// =================================================================

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database(); // Configurado para Realtime Database

// --- Seleção de Elementos do DOM ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Elementos de Login
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');

// Elementos de Cadastro
const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerButton = document.getElementById('registerButton');

// --- Lógica para Alternar Telas de Login/Cadastro ---
showRegisterLink.addEventListener('click', (event) => {
    event.preventDefault(); // Impede o link de pular a página
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (event) => {
    event.preventDefault(); // Impede o link de pular a página
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
});

// --- Lógica do Botão de CADASTRO ---
registerButton.addEventListener('click', () => {
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!name || !email || !password) {
        alert("Por favor, preencha todos os campos para o cadastro.");
        return;
    }
    if (password.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    // 1. Cria o usuário no Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // 2. Salva as informações adicionais do usuário no Realtime Database
            db.ref('usuarios/' + user.uid).set({
                nome: name,
                email: email,
                tipo: role, // 'aluno' ou 'professor'
                dataCadastro: new Date().toISOString()
            })
            .then(() => {
                alert("Usuário cadastrado com sucesso! Bem-vindo(a), " + name + "!");
                // No futuro, aqui faremos o redirecionamento para o dashboard principal.
                // Por enquanto, podemos limpar os campos ou mostrar a tela de login.
                registerView.classList.add('hidden');
                loginView.classList.remove('hidden');
            })
            .catch((dbError) => {
                console.error("Erro ao salvar dados no Realtime Database: ", dbError);
                alert("Ocorreu um erro ao salvar suas informações. Tente novamente.");
            });
        })
        .catch((authError) => {
            // Trata erros comuns de autenticação de forma mais amigável
            console.error("Erro no cadastro (Authentication): ", authError);
            if (authError.code == 'auth/email-already-in-use') {
                alert("Erro: O e-mail informado já está em uso por outra conta.");
            } else if (authError.code == 'auth/invalid-email') {
                alert("Erro: O formato do e-mail é inválido.");
            } else {
                alert("Erro ao cadastrar: " + authError.message);
            }
        });
});

// --- Lógica do Botão de LOGIN ---
loginButton.addEventListener('click', () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email || !password) {
        alert("Por favor, preencha e-mail e senha para entrar.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // O login foi bem-sucedido.
            console.log("Login realizado com sucesso para:", userCredential.user.email);
            // No futuro, aqui faremos a verificação do tipo de usuário (aluno/professor)
            // e o redirecionaremos para o dashboard correspondente.
            alert("Login realizado com sucesso!");
            
            // Exemplo de como poderíamos redirecionar:
            // window.location.href = 'dashboard.html'; 
        })
        .catch((error) => {
            console.error("Erro no login: ", error);
            alert("Erro ao fazer login: E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
        });
});
