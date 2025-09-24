const Utils = {
    displayError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = 'none';
        }
    },

    getNewAtletaStructure(nome, email) {
        return {
            dadosPessoais: { nome, email, dataNascimento: "", genero: "", idade: 0, telefone: "" },
            dadosFisicos: { altura: 0, peso: 0, frequenciaCardiacaMaxima: 0 },
            stravaConnected: false,
            configuracoes: { unidadeDistancia: "km", zonaHoraria: "America/Sao_Paulo" },
            estatisticas: { totalAtividades: 0, totalDistancia: 0, totalTempo: 0 }
        };
    },

    getNewProfessorStructure(nome, email) {
        return {
            dadosPessoais: { nome, email, telefone: "", especialidade: "" },
            configuracoes: { valorMensalidade: 100.00, diaVencimento: 10, jurosAtraso: 2.0, multaAtraso: 10.00 },
            estatisticas: { totalAtletas: 0, atletasAtivos: 0, receitaMensal: 0 }
        };
    }
};
