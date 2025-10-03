document.addEventListener('DOMContentLoaded', function () {
    // --- Seletores do DOM ---
    const userNameElement = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const professorView = document.getElementById('professor-view');
    const atletaView = document.getElementById('atleta-view');
    const newsView = document.getElementById('news-view');
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
    const addRaceForm = document.getElementById('add-race-form');
    const racesList = document.getElementById('races-list');
    const myRacesList = document.getElementById('my-races-list');
    const performanceChart = document.getElementById('performance-chart');
    const myPerformanceChart = document.getElementById('my-performance-chart');
    const smartSuggestions = document.getElementById('smart-suggestions');
    const newsList = document.getElementById('news-list');
    const calendarList = document.getElementById('calendar-list');
    const vitrineList = document.getElementById('vitrine-list');
    const commentsSection = document.getElementById('comments-section');
    const newCommentInput = document.getElementById('new-comment');
    const postCommentBtn = document.getElementById('post-comment-btn');
    const commentsList = document.getElementById('comments-list');
    const notificationsList = document.getElementById('notifications-list');

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
            loadNews();
            loadCalendar();
            loadVitrine();
            loadNotifications();
        } else {
            atletaView.style.display = 'block';
            loadAthleteDashboard(userData.atletaId);
            loadNews();
            loadCalendar();
            loadVitrine();
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
            const athleteKey = database.ref('logins').push().key;
            await database.ref('logins/' + athleteKey).set({ name, password, role: 'atleta' });
            await database.ref('atletas/' + athleteKey).set({
                nome: name,
                perfil: { objetivo: 'Não definido', rp5k: '', peso: '', altura: '' },
                plano_treino: {},
                provas: {},
                comentarios: {},
                atividades_strava: {}
            });

            alert(`Atleta '${name}' cadastrado com sucesso!`);
            addAthleteForm.reset();
            addAthleteContainer.style.display = 'none';
            showAddAthleteBtn.style.display = 'block';
            loadAthletesGrid();
        } catch (error) {
            console.error("Erro ao cadastrar atleta:", error);
            alert("Falha ao cadastrar atleta.");
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
                                <p><strong>Peso:</strong> ${atleta.perfil.peso || 'N/A'} kg</p>
                                <p><strong>Altura:</strong> ${atleta.perfil.altura || 'N/A'} cm</p>
                            </div>
                            <div class="mt-6 text-right">
                                <button data-atleta-id="${atletaId}" class="form-button manage-athlete-btn" style="width: auto; padding: 0.5rem 1rem;">Gerir Atleta</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                athleteGridContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center">Nenhum atleta cadastrado.</p>';
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
            loadRaces(athleteId);
            loadPerformanceChart(athleteId);
            loadSmartSuggestions(athleteId);

            prescribeTrainingForm.onsubmit = (e) => handlePrescribeTraining(e);
            athleteProfileForm.onsubmit = (e) => handleUpdateProfile(e);
            addRaceForm.onsubmit = (e) => handleAddRace(e, athleteId);
        });
    }

    function loadProfileData(perfil) {
        if (!perfil) return;
        document.getElementById('athlete-goal').value = perfil.objetivo || '';
        document.getElementById('athlete-rp-5k').value = perfil.rp5k || '';
        document.getElementById('athlete-peso').value = perfil.peso || '';
        document.getElementById('athlete-altura').value = perfil.altura || '';
    }

    function loadTrainingPlan(athleteId) {
        const planRef = database.ref(`atletas/${athleteId}/plano_treino`).orderByChild('data');
        planRef.on('value', (snapshot) => {
            trainingPlanList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const treino = childSnapshot.val();
                    const statusClass = treino.status === 'realizado' ? 'text-green-800' : 'text-yellow-800';
                    trainingPlanList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${new Date(treino.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}:</strong> ${treino.tipo}</p>
                            <p class="text-sm text-gray-600">${treino.descricao}</p>
                            <p class="text-xs ${statusClass}">Status: ${treino.status || 'agendado'}</p>
                            ${treino.status === 'realizado' ? `<div class="training-feedback">Feedback do Atleta: ${treino.feedback || 'Nenhum feedback.'}</div>` : ''}
                            ${treino.status === 'realizado' ? `<div class="professor-feedback">Feedback do Professor: ${treino.professorFeedback || 'Aguardando avaliação.'}</div>` : ''}
                            ${treino.status === 'realizado' ? `<textarea id="feedback-${childSnapshot.key}" class="form-input mt-2" placeholder="Seu feedback para o atleta..."></textarea><button onclick="saveProfessorFeedback('${athleteId}', '${childSnapshot.key}')" class="form-button mt-2">Enviar Feedback</button>` : ''}
                        </div>
                    `;
                });
            } else {
                trainingPlanList.innerHTML = '<p class="text-gray-500">Nenhum treino agendado.</p>';
            }
        });
    }

    // Função global para salvar feedback do professor
    window.saveProfessorFeedback = async function(athleteId, trainingId) {
        const feedback = document.getElementById(`feedback-${trainingId}`).value;
        if (!feedback) return;

        try {
            await database.ref(`atletas/${athleteId}/plano_treino/${trainingId}`).update({ professorFeedback: feedback });
            alert('Feedback enviado com sucesso!');
            loadTrainingPlan(athleteId);
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            alert('Falha ao enviar feedback.');
        }
    };

    async function handlePrescribeTraining(e) {
        e.preventDefault();
        if (!currentManagingAthleteId) return;

        const newTraining = {
             document.getElementById('training-date').value,
            tipo: document.getElementById('training-type').value,
            descricao: document.getElementById('training-description').value,
            status: 'agendado'
        };

        try {
            await database.ref(`atletas/${currentManagingAthleteId}/plano_treino`).push().set(newTraining);
            alert('Treino agendado com sucesso!');
            prescribeTrainingForm.reset();
            loadTrainingPlan(currentManagingAthleteId);
        } catch (error) {
            console.error("Erro ao agendar treino:", error);
            alert('Falha ao agendar treino.');
        }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        if (!currentManagingAthleteId) return;

        const updatedProfile = {
            objetivo: document.getElementById('athlete-goal').value,
            rp5k: document.getElementById('athlete-rp-5k').value,
            peso: document.getElementById('athlete-peso').value,
            altura: document.getElementById('athlete-altura').value
        };

        try {
            await database.ref(`atletas/${currentManagingAthleteId}/perfil`).update(updatedProfile);
            alert('Perfil do atleta atualizado com sucesso!');
            loadProfileData(updatedProfile);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Falha ao atualizar perfil.');
        }
    }

    function loadRaces(athleteId) {
        const racesRef = database.ref(`atletas/${athleteId}/provas`);
        racesRef.on('value', (snapshot) => {
            racesList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const prova = childSnapshot.val();
                    racesList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${prova.nome}</strong> - ${new Date(prova.data + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-600">Distância: ${prova.distancia || 'N/A'} km</p>
                            <p class="text-sm text-gray-600">Categoria: ${prova.categoria || 'N/A'}</p>
                            <p class="text-sm text-gray-600">Resultado: ${prova.resultado || 'N/A'}</p>
                        </div>
                    `;
                });
            } else {
                racesList.innerHTML = '<p class="text-gray-500">Nenhuma prova registrada.</p>';
            }
        });
    }

    async function handleAddRace(e, athleteId) {
        e.preventDefault();
        const name = document.getElementById('race-name').value.trim();
        const date = document.getElementById('race-date').value;
        const distance = document.getElementById('race-distance').value.trim();
        const category = document.getElementById('race-category').value.trim();
        const result = document.getElementById('race-result').value.trim();
        if (!name || !date || !distance) return;

        try {
            const newRaceRef = database.ref(`atletas/${athleteId}/provas`).push();
            await newRaceRef.set({ nome: name,  date, distancia: distance, categoria: category, resultado: result });
            alert('Prova registrada com sucesso!');
            addRaceForm.reset();
            loadRaces(athleteId);
        } catch (error) {
            console.error("Erro ao registrar prova:", error);
            alert('Falha ao registrar prova.');
        }
    }

    function loadPerformanceChart(athleteId) {
        const chartContainer = document.getElementById('performance-chart');
        chartContainer.innerHTML = '<div class="chart-placeholder">Gráfico de desempenho em desenvolvimento...</div>';
        // Aqui você pode integrar uma biblioteca como Chart.js no futuro
    }

    function loadSmartSuggestions(athleteId) {
        const suggestionsContainer = document.getElementById('smart-suggestions');
        suggestionsContainer.innerHTML = '<p class="text-gray-500">Analisando desempenho...</p>';

        // Simulação de sugestão inteligente baseada em dados reais
        setTimeout(() => {
            suggestionsContainer.innerHTML = `
                <div class="p-3 bg-blue-100 rounded">
                    <p><strong>Sugestão Inteligente:</strong> Com base no seu RP de 5km (24:30) e meta de meia maratona, recomendamos aumentar o volume semanal em 10% nas próximas 4 semanas.</p>
                </div>
            `;
        }, 1000);
    }

    // --- Funções do Atleta ---
    function loadAthleteDashboard(athleteId) {
        const atletaRef = database.ref('atletas/' + athleteId);
        atletaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            const atleta = snapshot.val();
            loadMyProfileData(atleta.perfil);
            loadMyTrainingPlan(athleteId);
            loadMyRaces(athleteId);
            loadMyPerformanceChart(athleteId);
            loadComments(athleteId);

            myProfileForm.onsubmit = (e) => handleUpdateMyProfile(e, athleteId);
            document.addEventListener('click', (e) => {
                const markDoneBtn = e.target.closest('.mark-as-done-btn');
                if (markDoneBtn) {
                    const treinoId = markDoneBtn.dataset.treinoId;
                    updateTrainingStatus(athleteId, treinoId, 'realizado');
                }
            });
            postCommentBtn.addEventListener('click', () => handlePostComment(athleteId));
        });
    }

    function loadMyProfileData(perfil) {
        if (!perfil) return;
        document.getElementById('my-goal').value = perfil.objetivo || '';
        document.getElementById('my-rp-5k').value = perfil.rp5k || '';
        document.getElementById('my-peso').value = perfil.peso || '';
        document.getElementById('my-altura').value = perfil.altura || '';
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
                                ${treino.status === 'realizado' ? `<div class="training-feedback">Feedback: ${treino.feedback || 'Nenhum feedback.'}</div>` : ''}
                                ${treino.status === 'realizado' ? `<div class="professor-feedback">Feedback do Professor: ${treino.professorFeedback || 'Aguardando avaliação.'}</div>` : ''}
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
            rp5k: document.getElementById('my-rp-5k').value,
            peso: document.getElementById('my-peso').value,
            altura: document.getElementById('my-altura').value
        };

        try {
            await database.ref(`atletas/${athleteId}/perfil`).update(updatedProfile);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Falha ao atualizar perfil.');
        }
    }

    function loadMyRaces(athleteId) {
        const racesRef = database.ref(`atletas/${athleteId}/provas`);
        racesRef.on('value', (snapshot) => {
            myRacesList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const prova = childSnapshot.val();
                    myRacesList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${prova.nome}</strong> - ${new Date(prova.data + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-600">Distância: ${prova.distancia || 'N/A'} km</p>
                            <p class="text-sm text-gray-600">Categoria: ${prova.categoria || 'N/A'}</p>
                            <p class="text-sm text-gray-600">Resultado: ${prova.resultado || 'N/A'}</p>
                        </div>
                    `;
                });
            } else {
                myRacesList.innerHTML = '<p class="text-gray-500">Nenhuma prova registrada.</p>';
            }
        });
    }

    function loadMyPerformanceChart(athleteId) {
        const chartContainer = document.getElementById('my-performance-chart');
        chartContainer.innerHTML = '<div class="chart-placeholder">Gráfico de desempenho em desenvolvimento...</div>';
    }

    function loadComments(athleteId) {
        const commentsRef = database.ref(`atletas/${athleteId}/comentarios`);
        commentsRef.on('value', (snapshot) => {
            commentsList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const comentario = childSnapshot.val();
                    commentsList.innerHTML += `
                        <div class="comment-item">
                            <strong>${comentario.autor}:</strong> ${comentario.texto}
                        </div>
                    `;
                });
            } else {
                commentsList.innerHTML = '<p class="text-gray-500">Nenhum comentário ainda.</p>';
            }
        });
    }

    async function handlePostComment(athleteId) {
        const texto = newCommentInput.value.trim();
        if (!texto) return;

        const currentUser = JSON.parse(localStorage.getItem('currentUserSession'));
        const autor = currentUser.name;

        try {
            const newCommentRef = database.ref(`atletas/${athleteId}/comentarios`).push();
            await newCommentRef.set({ autor, texto, timestamp: Date.now() });
            newCommentInput.value = '';
            loadComments(athleteId);
        } catch (error) {
            console.error("Erro ao postar comentário:", error);
            alert('Falha ao postar comentário.');
        }
    }

    async function updateTrainingStatus(athleteId, trainingId, status) {
        try {
            const feedback = prompt("Como foi o treino? Descreva brevemente:");
            if (feedback === null) return;

            await database.ref(`atletas/${athleteId}/plano_treino/${trainingId}`).update({ 
                status, 
                feedback,
                timestamp: Date.now()
            });

            alert('Treino marcado como realizado!');
            
            // Adiciona atividade à vitrine
            const atletaRef = database.ref(`atletas/${athleteId}`);
            const atletaSnapshot = await atletaRef.once('value');
            const atleta = atletaSnapshot.val();
            addToVitrine(atleta.nome, `Completou o treino "${atletaRef.val().plano_treino[trainingId].tipo}"`, feedback);
            
            loadMyTrainingPlan(athleteId);
        } catch (error) {
            console.error("Erro ao marcar treino como feito:", error);
            alert('Falha ao marcar treino como feito.');
        }
    }

    function addToVitrine(autor, descricao, feedback) {
        const vitrineRef = database.ref('vitrine').push();
        vitrineRef.set({
            autor,
            descricao,
            feedback,
            timestamp: Date.now()
        });
    }

    function addNotification(athleteName, message) {
        const notificationRef = database.ref('notificacoes').push();
        notificationRef.set({
            autor: athleteName,
            mensagem: message,
            timestamp: Date.now(),
            lido: false
        });
    }

    function loadNotifications() {
        const notificationsRef = database.ref('notificacoes');
        notificationsRef.on('value', (snapshot) => {
            const notificationsList = document.getElementById('notifications-list');
            notificationsList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const notificacao = childSnapshot.val();
                    notificationsList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${notificacao.autor}:</strong> ${notificacao.mensagem}</p>
                            <p class="text-sm text-gray-600">${new Date(notificacao.timestamp).toLocaleString('pt-BR')}</p>
                        </div>
                    `;
                });
            } else {
                notificationsList.innerHTML = '<p class="text-gray-500">Nenhuma notificação.</p>';
            }
        });
    }

    function loadNews() {
        const newsRef = database.ref('noticias');
        newsRef.on('value', (snapshot) => {
            newsList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const noticia = childSnapshot.val();
                    newsList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${noticia.titulo}</strong></p>
                            <p class="text-sm text-gray-600">${noticia.conteudo}</p>
                        </div>
                    `;
                });
            } else {
                newsList.innerHTML = '<p class="text-gray-500">Nenhuma notícia disponível.</p>';
            }
        });
    }

    function loadCalendar() {
        const calendarRef = database.ref('calendario');
        calendarRef.on('value', (snapshot) => {
            calendarList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const evento = childSnapshot.val();
                    calendarList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${evento.nome}</strong> - ${new Date(evento.data + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-600">${evento.local || 'N/A'}</p>
                        </div>
                    `;
                });
            } else {
                calendarList.innerHTML = '<p class="text-gray-500">Nenhum evento no calendário.</p>';
            }
        });
    }

    function loadVitrine() {
        const vitrineRef = database.ref('vitrine');
        vitrineRef.on('value', (snapshot) => {
            vitrineList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const atividade = childSnapshot.val();
                    vitrineList.innerHTML += `
                        <div class="vitrine-item">
                            <div class="vitrine-header">
                                <strong>${atividade.autor}</strong>
                                <span>${new Date(atividade.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                            <p>${atividade.descricao}</p>
                            ${atividade.feedback ? `<div class="training-feedback">"${atividade.feedback}"</div>` : ''}
                            <div class="vitrine-actions">
                                <button class="form-button" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">👍</button>
                                <button class="form-button" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">💬</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                vitrineList.innerHTML = '<p class="text-gray-500">Nenhuma atividade na vitrine.</p>';
            }
        });
    }

    function logoutUser() {
        localStorage.removeItem('currentUserSession');
        window.location.href = 'index.html';
    }

    logoutBtn.addEventListener('click', logoutUser);
    checkSessionAndInitialize();
});
