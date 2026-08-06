let models=[];
const group=document.querySelector('#modelGroup');
const side=document.querySelector('#side');
const type=document.querySelector('#type');
const fence=document.querySelector('#fence');
const sideField=document.querySelector('#sideField');
const typeField=document.querySelector('#typeField');
const fenceField=document.querySelector('#fenceField');
const catalog=document.querySelector('#catalog');
const title=document.querySelector('#resultTitle');
const count=document.querySelector('#resultCount');
const clear=document.querySelector('#clearFilters');

function hide(field){field.hidden=true}
function show(field){field.hidden=false}

function resetAfter(level){
  if(level<=1){side.value='';type.value='';fence.value=''}
  if(level<=2){type.value='';fence.value=''}
  if(level<=3){fence.value=''}
}

function updateSteps(){
  hide(sideField);
  hide(typeField);
  hide(fenceField);

  if(!group.value || group.value==='todos' || group.value==='sem-esteiras'){
    render();
    return;
  }

  if(group.value==='esteira-90'){
    show(sideField);
    if(side.value) show(typeField);
    if(side.value && type.value) show(fenceField);
  }

  if(group.value==='esteira-reta'){
    show(typeField);
    if(type.value) show(fenceField);
  }

  render();
}

function matches(model){
  if(group.value==='todos') return true;
  if(model.group!==group.value) return false;

  if(group.value==='sem-esteiras') return true;

  if(group.value==='esteira-90'){
    if(!side.value || !type.value || !fence.value) return false;
    return model.side===side.value &&
           model.type===type.value &&
           model.fence===fence.value;
  }

  if(group.value==='esteira-reta'){
    if(!type.value || !fence.value) return false;
    return model.type===type.value && model.fence===fence.value;
  }

  return false;
}

function groupLabel(value){
  return {
    'sem-esteiras':'Sem esteiras',
    'esteira-90':'Esteira 90º',
    'esteira-reta':'Esteira reta'
  }[value] || value;
}

function card(model){
  const preview=model.available
    ? `<model-viewer class="card-model"
         src="modelos/${model.file}"
         camera-controls
         auto-rotate
         rotation-per-second="10deg"
         interaction-prompt="none"
         shadow-intensity=".8"
         loading="lazy"
         disable-zoom>
       </model-viewer>`
    : `<div class="preview-placeholder"><span>3D</span></div>`;

  return `<article class="card ${model.available?'':'unavailable'}">
    <div class="visual">
      <span class="number">${model.number}</span>
      ${preview}
      ${model.available?'':'<span class="coming-soon">Em breve</span>'}
    </div>
    <div class="body">
      <span class="pill">${groupLabel(model.group)}</span>
      <h3>${model.name}</h3>
      ${model.available
        ? `<a class="primary" href="visualizador.html?modelo=${encodeURIComponent(model.id)}">Visualizar modelo</a>`
        : `<button class="disabled-button" disabled>Modelo ainda não disponível</button>`}
    </div>
  </article>`;
}

function render(){
  if(!group.value){
    title.textContent='Selecione uma categoria';
    count.textContent='';
    catalog.innerHTML='<div class="empty-state">Escolha o modelo de visualização para começar.</div>';
    return;
  }

  const incomplete90 =
    group.value==='esteira-90' &&
    (!side.value || !type.value || !fence.value);

  const incompleteStraight =
    group.value==='esteira-reta' &&
    (!type.value || !fence.value);

  if(incomplete90 || incompleteStraight){
    title.textContent='Complete as opções';
    count.textContent='';
    catalog.innerHTML='<div class="empty-state">Preencha a próxima opção para continuar.</div>';
    return;
  }

  const items=models.filter(matches);

  if(group.value==='todos') title.textContent='Todos os modelos';
  else if(group.value==='sem-esteiras') title.textContent='Modelos sem esteira';
  else title.textContent=items.length===1 ? 'Modelo encontrado' : 'Modelos encontrados';

  count.textContent=`${items.length} ${items.length===1?'modelo':'modelos'}`;
  catalog.innerHTML=items.map(card).join('');
}

group.addEventListener('change',()=>{
  resetAfter(1);
  updateSteps();
});

side.addEventListener('change',()=>{
  resetAfter(2);
  updateSteps();
});

type.addEventListener('change',()=>{
  resetAfter(3);
  updateSteps();
});

fence.addEventListener('change',render);

clear.addEventListener('click',()=>{
  group.value='';
  resetAfter(1);
  updateSteps();
});

fetch('modelos.json')
  .then(response=>response.json())
  .then(data=>{
    models=data;
    render();
  });