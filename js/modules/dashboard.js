const DashboardModule = {
    init(user) {
        this.user = user;
        this.db = firebase.database();
        this.contentArea = document.getElementById('content-area');
        this.sidebarNav = document.getElementById('sidebar-nav');
        this.headerTitle = document.getElementById('header-title');

        this.loadUserProfile();
        this.addEventListeners();
    },

    addEventListeners() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                firebase.auth().signOut();
            });
        }
    },

    loadUserProfile() {
        this.db.ref('usuarios/' + this.user.uid).on('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                this.buildUI(userData.tipo, 'dashboard');
            } else {
                console.error("Não foi possível carregar os dados do usuário.");
            }
        });
    },

    buildUI(userType, activeView) {
        const navItems = this.getNavItems(userType);
        this.sidebarNav.innerHTML = '';
        navItems.forEach(item => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = `nav-link ${item.view === activeView ? 'active' : ''}`;
            link.dataset.view = item.view;
            link.innerHTML = `<i class='bx ${item.icon}'></i> ${item.label}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.buildUI(userType, item.view);
            });
            this.sidebarNav.appendChild(link);
        });

        const activeItem = navItems.find(item => item.view === activeView);
        this.headerTitle.textContent = activeItem ? activeItem.label : 'Dashboard';
        this.renderContent(userType, activeView);
    },

    renderContent(userType, view) {
        this.contentArea.innerHTML = '';
        switch(view) {
            case 'dashboard':
                if (userType === 'atleta') this.contentArea.innerHTML = this.renderAlunoDashboard();
                if (userType === 'professor') {
                    this.contentArea.innerHTML = this.renderProfessorDashboard();
                    this.loadAtletasList();
                }
                break;
            case 'perfil':
                 this.db.ref('usuarios/' + this.user.uid).once('value').then(snapshot => {
                    this.contentArea.innerHTML = this.renderPerfilView(snapshot.val());
                });
                break;
            default:
                this.contentArea.innerHTML = `<div class="card"><h3 class="card-title">Página em Construção</h3><p class="card-content">A funcionalidade para '${view}' será implementada em breve.</p></div>`;
        }
    },

    getNavItems(userType) {
        const baseItems = [
            { label: 'Dashboard', icon: 'bxs-dashboard', view: 'dashboard' },
            { label: 'Meu Perfil', icon: 'bxs-user-circle', view: 'perfil' }
        ];
        if (userType === 'atleta') return [ ...baseItems, { label: 'Minhas Planilhas', icon: 'bx-spreadsheet', view: 'planilhas' } ];
        if (userType === 'professor') return [ ...baseItems, { label: 'Gestão de Atletas', icon: 'bxs-group', view: 'gestao' }, { label: 'Financeiro', icon: 'bx-dollar-circle', view: 'financeiro' } ];
        return baseItems;
    },

    renderAlunoDashboard() {
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
    },

    renderProfessorDashboard() {
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
    },

    renderPerfilView(userData) {
        if (!userData) return '<p>Não foi possível carregar os dados do perfil.</p>';
        return `
            <div class="card full-width">
                <div class="card-header">
                    <div class="card-icon"><i class='bx bxs-user-circle'></i></div>
                    <div><h3 class="card-title">Meus Dados</h3><p class="card-content">Informações do seu perfil.</p></div>
                </div>
                <div style="padding: 1rem 0;">
                    <p><strong>Nome:</strong> ${userData.nome}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Tipo:</strong> <span class="status-badge ${userData.tipo}">${userData.tipo}</span></p>
                </div>
            </div>`;
    },

    loadAtletasList() {
        this.db.ref('usuarios').orderByChild('tipo').equalTo('atleta').on('value', (snapshot) => {
            const tableBody = document.getElementById('athlete-table-body');
            if (!tableBody) return;
            tableBody.innerHTML = '';
            const atletas = snapshot.val();
            if (atletas) {
                Object.values(atletas).forEach(atleta => {
                    const row = tableBody.insertRow();
                    row.innerHTML = `
                        <td>${atleta.nome}</td>
                        <td>${atleta.email}</td>
                        <td><span class="status-badge ${atleta.tipo}">${atleta.tipo}</span></td>
                        <td>${new Date(atleta.dataCadastro).toLocaleDateString('pt-BR')}</td>
                    `;
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Nenhum atleta cadastrado.</td></tr>';
            }
        });
    }
};
