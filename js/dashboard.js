function initializeDashboard(user) {
    if (!user) return;

    const db = firebase.database();
    const contentArea = document.getElementById('content-area');
    const sidebarNav = document.getElementById('sidebar-nav');
    const headerTitle = document.getElementById('header-title');
    
    let currentUserData = {};

    const userRef = db.ref('usuarios/' + user.uid);
    userRef.on('value', (snapshot) => {
        currentUserData = snapshot.val();
        if (currentUserData) {
            buildUI(currentUserData.tipo, 'dashboard'); // Carrega a view inicial
        }
    });

    function buildUI(userType, activeView) {
        const navItems = getNavItems(userType);
        sidebarNav.innerHTML = '';
        navItems.forEach(item => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = `nav-link ${item.view === activeView ? 'active' : ''}`;
            link.dataset.view = item.view;
            link.innerHTML = `<i class='bx ${item.icon}'></i> ${item.label}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                buildUI(userType, item.view);
            });
            sidebarNav.appendChild(link);
        });

        headerTitle.textContent = navItems.find(item => item.view === activeView).label;
        renderContent(activeView);
    }

    function renderContent(view) {
        contentArea.innerHTML = '';
        switch(view) {
            case 'dashboard':
                if (currentUserData.tipo === 'aluno') contentArea.innerHTML = renderAlunoDashboard();
                if (currentUserData.tipo === 'professor') {
                    contentArea.innerHTML = renderProfessorDashboard();
                    carregarListaDeAtletas();
                }
                break;
            case 'perfil':
                contentArea.innerHTML = renderPerfilView();
                break;
            default:
                contentArea.innerHTML = `<div class="card"><h3 class="card-title">Página em Construção</h3><p class="card-content">A funcionalidade para '${view}' será implementada em breve.</p></div>`;
        }
    }

    function getNavItems(userType) {
        const baseItems = [
            { label: 'Dashboard', icon: 'bxs-dashboard', view: 'dashboard' },
            { label: 'Meu Perfil', icon: 'bxs-user-circle', view: 'perfil' }
        ];
        if (userType === 'aluno') return [ ...baseItems, { label: 'Minhas Planilhas', icon: 'bx-spreadsheet', view: 'planilhas' } ];
        if (userType === 'professor') return [ ...baseItems, { label: 'Gestão de Atletas', icon: 'bxs-group', view: 'gestao' }, { label: 'Financeiro', icon: 'bx-dollar-circle', view: 'financeiro' } ];
        return baseItems;
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO DE CONTEÚDO ---
    function renderAlunoDashboard() {
        return `
            <div class="grid-container">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon"><i class='bx bxl-strava'></i></div>
                        <div><h3 class="card-title">Conexão com Strava</h3><p class="card-content">Sincronize suas atividades para análise de performance.</p></div>
                    </div>
                    <button class="card-button strava">Conectar com Strava</button>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon"><i class='bx bx-spreadsheet'></i></div>
                        <div><h3 class="card-title">Minha Planilha</h3><p class="card-content">Sua planilha de treinos da semana aparecerá aqui.</p></div>
                    </div>
                </div>
            </div>`;
    }

    function renderProfessorDashboard() {
        return `
            <div class="card full-width data-table-card">
                <div class="card-header">
                     <div class="card-icon"><i class='bx bxs-group'></i></div>
                     <div><h3 class="card-title">Atletas da Equipe</h3><p class="card-content">Lista de todos os atletas cadastrados na plataforma.</p></div>
                </div>
                <div class="athlete-table-container">
                    <table class="athlete-table">
                        <thead><tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Data de Cadastro</th></tr></thead>
                        <tbody id="athlete-table-body"><tr><td colspan="4" style="text-align:center; padding: 2rem;">Carregando...</td></tr></tbody>
                    </table>
                </div>
            </div>`;
    }

    function renderPerfilView() {
        return `
            <div class="card full-width">
                <div class="card-header">
                    <div class="card-icon"><i class='bx bxs-user-circle'></i></div>
                    <div><h3 class="card-title">Meus Dados</h3><p class="card-content">Informações do seu perfil.</p></div>
                </div>
                <div style="padding: 1rem 0;">
                    <p><strong>Nome:</strong> ${currentUserData.nome}</p>
                    <p><strong>Email:</strong> ${currentUserData.email}</p>
                    <p><strong>Tipo:</strong> <span class="status-badge ${currentUserData.tipo}">${currentUserData.tipo}</span></p>
                </div>
            </div>`;
    }

    function carregarListaDeAtletas() {
        const todosUsuariosRef = db.ref('usuarios');
        todosUsuariosRef.on('value', (snapshot) => {
            const tableBody = document.getElementById('athlete-table-body');
            if (!tableBody) return;
            tableBody.innerHTML = '';
            const todosUsuarios = snapshot.val();
            if (todosUsuarios) {
                Object.values(todosUsuarios).forEach(usuario => {
                    const row = tableBody.insertRow();
                    row.innerHTML = `
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td><span class="status-badge ${usuario.tipo}">${usuario.tipo}</span></td>
                        <td>${new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}</td>
                    `;
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Nenhum atleta.</td></tr>';
            }
        });
    }
}
