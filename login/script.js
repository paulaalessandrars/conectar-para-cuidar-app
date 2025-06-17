document.addEventListener('DOMContentLoaded', function () {
  // Aguarda o carregamento completo do DOM antes de executar o script

  // Recupera os dados de login armazenados
  const loginData = JSON.parse(localStorage.getItem('mamãe_login'));

  if (loginData) {
    // Se o usuário já está logado (dados encontrados), redireciona para a página inicial (home)
    window.location.href = '../home/index.html';
    return; // Encerra a execução para evitar continuar no login
  }

  // Seleciona o formulário de login pelo ID
  const form = document.getElementById('loginForm');
  if (!form) return; // Se o formulário não existir, encerra o script

  // Adiciona um listener para o evento de envio do formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Previne o comportamento padrão de envio da página

    // Pega o valor do campo nome, removendo espaços extras
    const nome = document.getElementById('nome').value.trim();

    // Pega o campo de e-mail e seu valor em minúsculo, removendo espaços extras
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim().toLowerCase();

    // Validação simples do e-mail: verifica se contém '@'
    if (!email.includes('@')) {
      emailInput.classList.add('is-invalid'); // Marca o campo como inválido visualmente
      alert('Por favor, insira um e-mail válido.');
      return; // Interrompe o fluxo para corrigir o e-mail
    } else {
      emailInput.classList.remove('is-invalid'); // Remove erro visual se o e-mail estiver válido
    }

    // Valida se o campo nome foi preenchido
    if (nome === '') {
      alert('Por favor, insira seu nome.');
      return; // Interrompe o envio para preencher o nome
    }

    // Verifica se o usuário é admin pelo e-mail (exemplo simples)
    const isAdmin = (email === 'admin@site.com');

    // Cria objeto com os dados do usuário para armazenar localmente
    const userData = {
      nome: nome,
      email: email,
      isAdmin: isAdmin
    };

    // Salva os dados do usuário no localStorage como string JSON
    localStorage.setItem('mamãe_login', JSON.stringify(userData));

    // Redireciona para a página inicial após login
    window.location.href = '../home/index.html';
  });
});
