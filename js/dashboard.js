document.addEventListener('DOMContentLoaded', function () {
    // --- Seletores do DOM ---
    const userNameElement = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const professorView = document.getElementById('professor-view');
    const atletaView = document.getElementById('atleta-view');
    const hubSubView = document.getElementById('hub-sub-view');
    const managementSubView = document.getElementById('management-sub-view');
    const showAddAthleteBtn = document.getElementById('show-add-athlete-form-btn');
    const addAthleteContainer = document.getElementById('add-athlete-container');
    const cancelAddAthleteBtn = document.getElementById('cancel-add-athlete-btn');
    const addAthleteForm = document.getElementById('add-athlete-form');
    const athleteGridContainer = document.getElementById('athlete-grid-container');
    const backToHubBtn = document.getElementById('back-to-hub-btn');
    const managementAthleteName = document.getElementById('management-athlete-name');
    const prescribeTrainingForm = document.getElementById('prescribe-training-form');
    const trainingPlanList = document.getElementById('training-plan-list');
    const athleteProfileForm = document.getElementById('athlete-profile-form');
    const myTrainingPlanList = document.getElementById('my-training-plan-list');
    const myProfileForm = document.getElementById('my-profile-form');

    let currentManagingAthleteId = null;

    // --- Lógica Principal de Inicialização ---
    function checkSessionAndInitialize() {
        const sessionDataString = localStorage.getItem('currentUserSession');
        if (!sessionDataString) {
            window.location.href = 'index.html';
            return;
        }
        const sessionData = JSON.parse(sessionDataString);
        initializeDashboard(sessionData);
    }

    function initializeDashboard(userData) {
        userNameElement.textContent = `Olá, ${userData.name}`;
        if (userData.role === 'professor') {
            professorView.style.display = 'block';
            showProfessorSubView('hub');
            setupProfessorEventListeners();
            loadAthletesGrid();
        } else {
            atletaView.style.display = 'block';
            loadAthleteDashboard(userData.atletaId);
        }
    }

    function showProfessorSubView(subViewName) {
        if (subViewName === 'hub') {
            hubSubView.style.display = 'block';
            managementSubView.style.display = 'none';
        } else if (subViewName === 'management') {
            hubSubView.style.display = 'none';
            managementSubView.style.display = 'block';
        }
    }

    // --- Funções do Professor ---
    function setupProfessorEventListeners() {
        showAddAthleteBtn.addEventListener('click', () => {
            addAthleteContainer.style.display = 'block';
            showAddAthleteBtn.style.display = 'none';
        });

        cancelAddAthleteBtn.addEventListener('click', () => {
            addAthleteContainer.style.display = 'none';
            showAddAthleteBtn.style.display = 'block';
            addAthleteForm.reset();
        });

        addAthleteForm.addEventListener('submit', handleAddAthlete);

        backToHubBtn.addEventListener('click', () => {
            showProfessorSubView('hub');
            currentManagingAthleteId = null;
        });

        athleteGridContainer.addEventListener('click', (e) => {
            const manageButton = e.target.closest('.manage-athlete-btn');
            if (manageButton) {
                const athleteId = manageButton.dataset.atletaId;
                openManagementPanel(athleteId);
            }
        });
    }

    async function handleAddAthlete(e) {
        e.preventDefault();
        const name = document.getElementById('athlete-name').value.trim();
        const password = document.getElementById('athlete-password').value.trim();
        if (!name || !password) return;

        try {
            const newLoginRef = database.ref('logins').push();
            await newLoginRef.set({ name, password, role: 'atleta' });

            const athleteKey = newLoginRef.key;
            await database.ref('atletas/' + athleteKey).set({
                nome: name,
                perfil: { objetivo: 'Não definido', rp5k: '' },
                plano_treino: {}
            });

            alert(`Atleta '${name}' cadastrado com sucesso!`);
            addAthleteForm.reset();
            addAthleteContainer.style.display = 'none';
            showAddAthleteBtn.style.display = 'block';
            loadAthletesGrid(); // Atualiza a lista imediatamente
        } catch (error) {
            console.error("Erro ao cadastrar atleta:", error);
            alert("Falha ao cadastrar atleta. Verifique o console para detalhes.");
        }
    }

    function loadAthletesGrid() {
        const atletasRef = database.ref('atletas');
        atletasRef.on('value', (snapshot) => {
            athleteGridContainer.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const atleta = childSnapshot.val();
                    const atletaId = childSnapshot.key;
                    athleteGridContainer.innerHTML += `
                        <div class="athlete-card">
                            <h3 class="font-bold text-xl text-gray-800">${atleta.nome}</h3>
                            <div class="mt-4 space-y-2 text-sm text-gray-600">
                                <p><strong>Objetivo:</strong> ${atleta.perfil.objetivo || 'Não definido'}</p>
                                <p><strong>RP 5km:</strong> ${atleta.perfil.rp5k || 'N/A'}</p>
                            </div>
                            <div class="mt-6 text-right">
                                <button data-atleta-id="${atletaId}" class="form-button manage-athlete-btn" style="width: auto; padding: 0.5rem 1rem;">Gerir Atleta</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                athleteGridContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center">Nenhum atleta cadastrado. Clique em "+ Adicionar Aluno" para começar.</p>';
            }
        });
    }

    // --- Funções do Painel de Gestão Individual ---
    function openManagementPanel(athleteId) {
        currentManagingAthleteId = athleteId;
        showProfessorSubView('management');

        const atletaRef = database.ref('atletas/' + athleteId);
        atletaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            const atleta = snapshot.val();
            managementAthleteName.textContent = `Gerindo: ${atleta.nome}`;
            loadProfileData(atleta.perfil);
            loadTrainingPlan(athleteId);

            prescribeTrainingForm.onsubmit = (e) => handlePrescribeTraining(e);
            athleteProfileForm.onsubmit = (e) => handleUpdateProfile(e);
        });
    }

    function loadProfileData(perfil) {
        if (!perfil) return;
        document.getElementById('athlete-goal').value = perfil.objetivo || '';
        document.getElementById('athlete-rp-5k').value = perfil.rp5k || '';
    }

    function loadTrainingPlan(athleteId) {
        const planRef = database.ref(`atletas/${athleteId}/plano_treino`).orderByChild('data');
        planRef.on('value', (snapshot) => {
            trainingPlanList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const treino = childSnapshot.val();
                    trainingPlanList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${new Date(treino.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}:</strong> ${treino.tipo}</p>
                            <p class="text-sm text-gray-600">${treino.descricao}</p>
                        </div>
                    `;
                });
            } else {
                trainingPlanList.innerHTML = '<p class="text-gray-500">Nenhum treino agendado.</p>';
            }
        });
    }

    async function handlePrescribeTraining(e) {
        e.preventDefault();
        if (!currentManagingAthleteId) return;

        const newTraining = {
            data: document.getElementById('training-date').value,
            tipo: document.getElementById('training-type').value,
            descricao: document.getElementById('training-description').value,
            status: 'agendado'
        };

        try {
            await database.ref(`atletas/${currentManagingAthleteId}/plano_treino`).push().set(newTraining);
            alert('Treino agendado com sucesso!');
            prescribeTrainingForm.reset();
            loadTrainingPlan(currentManagingAthleteId); // Atualiza a lista
        } catch (error) {
            console.error("Erro ao agendar treino:", error);
            alert('Falha ao agendar treino. Verifique o console.');
        }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        if (!currentManagingAthleteId) return;

        const updatedProfile = {
            objetivo: document.getElementById('athlete-goal').value,
            rp5k: document.getElementById('athlete-rp-5k').value
        };

        try {
            await database.ref(`atletas/${currentManagingAthleteId}/perfil`).update(updatedProfile);
            alert('Perfil do atleta atualizado com sucesso!');
            loadProfileData(updatedProfile); // Atualiza visualmente
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Falha ao atualizar perfil. Verifique o console.');
        }
    }

    // --- Funções do Atleta ---
    function loadAthleteDashboard(athleteId) {
        const atletaRef = database.ref('atletas/' + athleteId);
        atletaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            const atleta = snapshot.val();
            loadMyProfileData(atleta.perfil);
            loadMyTrainingPlan(athleteId);

            myProfileForm.onsubmit = (e) => handleUpdateMyProfile(e, athleteId);
            document.addEventListener('click', (e) => {
                const markDoneBtn = e.target.closest('.mark-as-done-btn');
                if (markDoneBtn) {
                    const treinoId = markDoneBtn.dataset.treinoId;
                    updateTrainingStatus(athleteId, treinoId, 'realizado');
                }
            });
        });
    }

    function loadMyProfileData(perfil) {
        if (!perfil) return;
        document.getElementById('my-goal').value = perfil.objetivo || '';
        document.getElementById('my-rp-5k').value = perfil.rp5k || '';
    }

    function loadMyTrainingPlan(athleteId) {
        const planRef = database.ref(`atletas/${athleteId}/plano_treino`).orderByChild('data');
        planRef.on('value', (snapshot) => {
            myTrainingPlanList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const treino = childSnapshot.val();
                    const statusClass = treino.status === 'realizado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                    myTrainingPlanList.innerHTML += `
                        <div class="p-3 ${statusClass} rounded flex justify-between items-center">
                            <div>
                                <p><strong>${new Date(treino.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}:</strong> ${treino.tipo}</p>
                                <p class="text-sm text-gray-600">${treino.descricao}</p>
                            </div>
                            ${treino.status !== 'realizado' ? `<button data-treino-id="${childSnapshot.key}" class="mark-as-done-btn form-button" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.75rem;">Marcar como Feito</button>` : ''}
                        </div>
                    `;
                });
            } else {
                myTrainingPlanList.innerHTML = '<p class="text-gray-500">Nenhum treino agendado.</p>';
            }
        });
    }

    async function handleUpdateMyProfile(e, athleteId) {
        e.preventDefault();
        const updatedProfile = {
            objetivo: document.getElementById('my-goal').value,
            rp5k: document.getElementById('my-rp-5k').value
        };

        try {
            await database.ref(`atletas/${athleteId}/perfil`).update(updatedProfile);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert
