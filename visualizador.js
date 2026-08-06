const params = new URLSearchParams(window.location.search);
const requestedId = params.get('modelo') || '01-base-3d';

const viewer = document.querySelector('#model');
const title = document.querySelector('#name');
const category = document.querySelector('#category');
const progress = document.querySelector('.viewer-progress');
const progressFill = document.querySelector('.viewer-progress-fill');

function groupLabel(value) {
  return {
    'sem-esteiras': 'Sem esteiras',
    'esteira-90': 'Esteira 90º',
    'esteira-reta': 'Esteira reta'
  }[value] || value;
}

fetch('modelos.json')
  .then(response => response.json())
  .then(models => {
    const model = models.find(item => item.id === requestedId) || models.find(item => item.available);

    if (!model || !model.available) {
      throw new Error('Modelo não disponível');
    }

    document.title = `${model.name} — KAPTA AR`;
    title.textContent = model.name;
    category.textContent = groupLabel(model.group);
    viewer.src = `modelos/${model.file}`;
    viewer.alt = model.name;
  })
  .catch(() => {
    title.textContent = 'Modelo indisponível';
    category.textContent = 'KAPTA AR';
    viewer.classList.add('has-error');
  });

viewer.addEventListener('progress', event => {
  const percentage = Math.round(event.detail.totalProgress * 100);
  progressFill.style.width = `${percentage}%`;

  if (percentage >= 100) {
    progress.classList.add('complete');
  }
});

viewer.addEventListener('load', () => {
  progress.classList.add('complete');
});