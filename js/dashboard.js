function initializeDashboard(user) {
    if (!user) return;

    const db = firebase.database();
    const contentArea = document.getElementById('content-area');
    const sidebarNav = document.getElementById('sidebar-nav');
    const welcomeMessage = document.getElementById('welcome-message');
    
    const userRef = db.ref('usuarios/' + user.uid);
    userRef.on('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            welcomeMessage.textContent = `Olá, ${userData.nome.split(' ')[0]}!`;
            buildUI(userData.tipo);
        }
    });

    function buildUI(userType) {
        // Limpa a UI antiga antes de construir a nova
        sidebarNav.innerHTML = '';
        contentArea.innerHTML = '';

        // Constrói a navegação
        const navItems = getNavItems(userType);
        navItems.forEach(item => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = `nav-link ${item.active ? 'active' : ''}`;
            link.innerHTML = `<i class='bx ${item.icon}'></i> ${item.label}`;
            sidebarNav.appendChild(link);
        });

        // Constrói o conteúdo principal
        if (userType === 'aluno') {
            contentArea.innerHTML = buildAlunoDashboard();
        } else if (userType === 'professor') {
            contentArea.innerHTML = buildProfessorDashboard();
            carregarListaDeAtletas();
        }
    }

    function getNavItems(userType) {
        const baseItems = [
            { label: 'Dashboard', icon: 'bxs-dashboard', active: true },
            { label: 'Meu Perfil', icon: 'bxs-user-circle', active: false }
        ];
        if (userType === 'aluno') {
            return [ ...baseItems, { label: 'Minhas Planilhas', icon: 'bx-spreadsheet', active: false } ];
        }
        if (userType === 'professor') {
            return [ ...baseItems, { label: 'Gestão de Atletas', icon: 'bxs-group', active: false }, { label: 'Financeiro', icon: 'bx-dollar-circle', active: false } ];
        }
        return baseItems;
    }

    function buildAlunoDashboard() {
        return `
            <div class="grid-container">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon"><i class='bx bxl-strava'></i></div>
                        <div>
                            <h3 class="card-title">Conexão com Strava</h3>
                            <p class="card-content">Sincronize suas atividades para análise de performance.</p>
                        </div>
                    </div>
                    <button class="card-button strava">Conectar com Strava</button>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon"><i class='bx bx-spreadsheet'></i></div>
                        <div>
                            <h3 class="card-title">Minha Planilha</h3>
                            <p class="card-content">Sua planilha de treinos da semana aparecerá aqui.</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function buildProfessorDashboard() {
        return `
            <div class="card full-width data-table-card">
                <div class="card-header">
                     <div class="card-icon"><i class='bx bxs-group'></i></div>
                     <div>
                        <h3 class="card-title">Atletas da Equipe</h3>
                        <p class="card-content">Lista de todos os atletas cadastrados na plataforma.</p>
                     </div>
                </div>
                <div class="athlete-table-container">
                    <table class="athlete-table">
                        <thead>
                            <tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Data de Cadastro</th></tr>
                        </thead>
                        <tbody id="athlete-table-body">
                            <tr><td colspan="4" style="text-align:center; padding: 2rem;">Carregando atletas...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    function carregarListaDeAtletas() {
        const todosUsuariosRef = db.ref('usuarios');
        todosUsuariosRef.on('value', (snapshot) => {
            const tableBody = document.getElementById('athlete-table-body');
            if (!tableBody) return;

            tableBody.innerHTML = ''; // Limpa a tabela
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
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Nenhum atleta encontrado.</td></tr>';
            }
        });
    }
}
