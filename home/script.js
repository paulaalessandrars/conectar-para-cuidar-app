document.addEventListener('DOMContentLoaded', () => {
  // Verifica login ao carregar a home
  const loginData = JSON.parse(localStorage.getItem('mamãe_login'));
  if (!loginData) {
    // Se não estiver logado, redireciona para login
    window.location.href = '../login/index.html';
    return;
  }

  // Exibe o nome do usuário
  document.getElementById('nomeUsuario').textContent = `Olá, ${loginData.nome}!`;

  // Botão logout - listener
  const btnLogout = document.getElementById('btnLogout');
  if(btnLogout){
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('mamãe_login');
      window.location.href = '../login/index.html';
    });
  }

  
  let posts = JSON.parse(localStorage.getItem('mamãe_posts')) || [];

  // Renderiza as postagens
  function renderPosts() {
    const feed = document.getElementById('feed');
    feed.innerHTML = '';

    if(posts.length === 0){
      feed.innerHTML = '<p class="text-muted">Nenhuma postagem por enquanto. Seja a primeira mamãe a postar!</p>';
      return;
    }

    posts.forEach((post, index) => {
      let imagesHtml = '';
      if(post.images && post.images.length > 0){
        imagesHtml = post.images.map(img => `<img src="${img}" class="preview-img mb-2" alt="Foto da postagem">`).join('');
      }

      let tagsHtml = '';
      if(post.tags && post.tags.length > 0){
        tagsHtml = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
      }

      // Mostrar botão Excluir se for admin OU autor do post
      const canDelete = loginData.isAdmin || post.author === loginData.nome;
      const deleteButtonHtml = canDelete
        ? `<button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${index})">Excluir</button>`
        : '';

      const postHtml = `
        <div class="post-container">
          <div class="d-flex justify-content-between align-items-start">
            <div><strong>${post.author}</strong></div>
            ${deleteButtonHtml}
          </div>
          <p>${post.text}</p>
          ${imagesHtml}
          <div>${tagsHtml}</div>
        </div>
      `;
      feed.insertAdjacentHTML('beforeend', postHtml);
    });
  }

  renderPosts();

  // Preview das imagens antes de postar
  const postImagesInput = document.getElementById('postImages');
  const previewContainer = document.getElementById('previewContainer');

  postImagesInput.addEventListener('change', function() {
    previewContainer.innerHTML = '';
    const files = Array.from(this.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('preview-img');
        previewContainer.appendChild(img);
      }
      reader.readAsDataURL(file);
    });
  });

  // Enviar nova postagem
  document.getElementById('postForm').addEventListener('submit', function(e){
    e.preventDefault();
    const text = document.getElementById('postText').value.trim();
    if(!text){
      alert('Por favor, escreva algo para postar!');
      return;
    }

    // Pegar imagens selecionadas e converter para base64
    const files = Array.from(postImagesInput.files);
    let imagesBase64 = [];

    if(files.length > 0){
      let loadedCount = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e){
          imagesBase64.push(e.target.result);
          loadedCount++;
          if(loadedCount === files.length){
            salvarPost(text, imagesBase64);
          }
        }
        reader.readAsDataURL(file);
      });
    } else {
      salvarPost(text, []);
    }
  });

  // Função para salvar post
  function salvarPost(text, images) {
    const selectedTags = [];
    ['tagSono', 'tagSaude', 'tagAlimentacao', 'tagEscolar', 'tagBanho', 'tagBrincadeiras'].forEach(id => {
      const el = document.getElementById(id);
      if(el && el.checked) selectedTags.push(el.value);
    });

    const novoPost = {
      author: loginData.nome,
      text,
      images,
      tags: selectedTags,
      createdAt: new Date().toISOString()
    };
    posts.unshift(novoPost);
    localStorage.setItem('mamãe_posts', JSON.stringify(posts));

    document.getElementById('postForm').reset();
    previewContainer.innerHTML = '';
    renderPosts();
    showToast('Postagem criada com sucesso!');
  }

  // Exclusão de postagem
  let postToDelete = null;
  const deleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if(postToDelete === null){
      deleteModal.hide();
      return;
    }

    const post = posts[postToDelete];
    // Só permite excluir se for admin ou autor
    if (!loginData.isAdmin && post.author !== loginData.nome) {
      alert('Você não tem permissão para excluir esta postagem.');
      deleteModal.hide();
      postToDelete = null;
      return;
    }

    posts.splice(postToDelete, 1);
    localStorage.setItem('mamãe_posts', JSON.stringify(posts));
    renderPosts();
    showToast('Postagem excluída com sucesso!');
    deleteModal.hide();
    postToDelete = null;
  });

  // Expondo confirmDelete no escopo global, pois é usado no HTML
  window.confirmDelete = function(index){
    postToDelete = index;
    deleteModal.show();
  };

  // Toast
  const toastElement = document.getElementById('actionToast');
  const toast = new bootstrap.Toast(toastElement);

  function showToast(message) {
    document.getElementById('toastMsg').textContent = message;
    toast.show();
  }
});
