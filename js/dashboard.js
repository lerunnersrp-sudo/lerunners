const DashboardModule = {
    init(user) {
        this.user = user;
        this.db = firebase.database();
        this.contentArea = document.getElementById('content-area');
        this.sidebarNav = document.getElementById('sidebar-nav');
        this.headerTitle = document.getElementById('header-title');

        if (!this.contentArea || !this.sidebarNav || !this.headerTitle) {
            console.error("ERRO FATAL: Elementos do dashboard não encontrados no HTML.");
            return;
        }

        this.allAtletas = [];
        this.addEventListeners();
        this.loadUserProfileAndBuildUI();
    },
    addEventListeners() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => firebase.auth().signOut());
        }
    },
    loadUserProfileAndBuildUI() {
        this.db.ref('usuarios/' + this.user.uid).on('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                this.currentUserData = userData;
                this.buildUI(userData.tipo, 'dashboard');
            } else {
                firebase.auth().signOut();
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
        this.headerTitle.textContent = activeItem.label;
        this.renderContent(userType, activeView);
    },
    getNavItems(userType) {
        const baseItems = [
            { label: 'Dashboard', icon: 'bxs-dashboard', view: 'dashboard' },
            { label: 'Meu Perfil', icon: 'bxs-user-circle', view: 'perfil' }
        ];
        if (userType === 'atleta') {
            return [ ...baseItems, { label: 'Minhas Planilhas', icon: 'bx-spreadsheet', view: 'planilhas' } ];
        }
        if (userType === 'professor') {
            return [ ...baseItems, { label: 'Gestão de Atletas', icon: 'bxs-group', view: 'gestao' }, { label: 'Financeiro', icon: 'bx-dollar-circle', view: 'financeiro' } ];
        }
        return baseItems;
    },
    renderContent(userType, view) {
        this.contentArea.innerHTML = '';
        switch(view) {
            case 'dashboard':
                this.contentArea.innerHTML = `<div class="card"><h2 class="card-title">Bem-vindo(a), ${this.currentUserData.nome}!</h2><p class="card-content">Use o menu para navegar.</p></div>`;
                break;
            case 'perfil':
                this.contentArea.innerHTML = this.renderPerfilView(this.currentUserData);
                break;
            case 'gestao':
                if (userType === 'professor') {
                    this.contentArea.innerHTML = this.renderGestaoAtletasView();
                    this.initGestaoAtletas();
                }
                break;
            case 'planilhas':
                this.contentArea.innerHTML = `<div class="card"><h3 class="card-title">Minhas Planilhas</h3><p class="card-content">Em breve, suas planilhas de treino aparecerão aqui.</p></div>`;
                break;
            case 'financeiro':
                if (userType === 'professor') {
                    this.contentArea.innerHTML = `<div class="card"><h3 class="card-title">Financeiro</h3><p class="card-content">Em breve, o módulo de gestão financeira estará aqui.</p></div>`;
                }
                break;
        }
    },
    renderPerfilView(userData) {
        return `<div class="card full-width"><div class="card-header"><div class="card-icon"><i class='bx bxs-user-circle'></i></div><div><h3 class="card-title">Meus Dados</h3><p class="card-content">Informações do seu perfil.</p></div></div><div style="padding: 1rem 0;"><p><strong>Nome:</strong> ${userData.nome}</p><p><strong>Email:</strong> ${userData.email}</p><p><strong>Tipo:</strong> <span class="status-badge ${userData.tipo}">${userData.tipo}</span></p></div></div>`;
    },
    renderGestaoAtletasView() {
        return `<div class="card full-width data-table-card"><div class="card-header" style="display: block;"><h3 class="card-title">Atletas da Equipe</h3><p class="card-content">Gerencie todos os atletas cadastrados na plataforma.</p><div class="filters-container" style="margin-top: 20px; display: flex; gap: 20px;"><input type="text" id="search-atleta" placeholder="Buscar por nome ou email..." class="form-input" style="flex-grow: 1;"><select id="filter-status-atleta" class="form-input" style="width: 150px;"><option value="todos">Todos</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div></div><div class="athlete-table-container"><table class="athlete-table"><thead><tr><th>Nome</th><th>Email</th><th>Status</th><th>Data de Cadastro</th></tr></thead><tbody id="athlete-table-body"><tr><td colspan="4" style="text-align:center; padding: 2rem;">Carregando atletas...</td></tr></tbody></table></div></div>`;
    },
    initGestaoAtletas() {
        document.getElementById('search-atleta').addEventListener('input', () => this.filterAndRenderAtletas());
        document.getElementById('filter-status-atleta').addEventListener('change', () => this.filterAndRenderAtletas());
        this.loadAtletasList();
    },
    loadAtletasList() {
        this.db.ref('usuarios').orderByChild('tipo').equalTo('atleta').on('value', (snapshot) => {
            const tableBody = document.getElementById('athlete-table-body');
            if (!tableBody) return;
            if (!snapshot.exists()) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Nenhum atleta cadastrado.</td></tr>';
                return;
            }
            const atletasData = snapshot.val();
            this.allAtletas = Object.keys(atletasData).map(key => ({ uid: key, ...atletasData[key] }));
            this.filterAndRenderAtletas();
        });
    },
    filterAndRenderAtletas() {
        const searchTerm = document.getElementById('search-atleta').value.toLowerCase();
        const statusValue = document.getElementById('filter-status-atleta').value;
        let filteredAtletas = this.allAtletas;

        if (statusValue !== 'todos') filteredAtletas = filteredAtletas.filter(atleta => atleta.ativo === (statusValue === 'ativo'));
        if (searchTerm) filteredAtletas = filteredAtletas.filter(atleta => atleta.nome.toLowerCase().includes(searchTerm) || atleta.email.toLowerCase().includes(searchTerm));

        this.renderAtletasTable(filteredAtletas);
    },
    renderAtletasTable(atletas) {
        const tableBody = document.getElementById('athlete-table-body');
        tableBody.innerHTML = '';
        if (atletas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Nenhum atleta encontrado.</td></tr>';
            return;
        }
        atletas.forEach(atleta => {
            const row = tableBody.insertRow();
            const statusClass = atleta.ativo ? 'status-badge aluno' : 'status-badge inativo';
            const statusText = atleta.ativo ? 'Ativo' : 'Inativo';
            row.innerHTML = `<td>${atleta.nome}</td><td>${atleta.email}</td><td><span class="${statusClass}">${statusText}</span></td><td>${new Date(atleta.dataCadastro).toLocaleDateDateString('pt-BR')}</td>`;
        });
    }
};
