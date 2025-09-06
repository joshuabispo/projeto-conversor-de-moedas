// === Elementos principais ===
const botao = document.querySelector('.convert-button');
const logo = document.querySelector('.logo');
const inputValor = document.getElementById('valorDe');
const realResultado = document.querySelector('.real-resultado');
const valorResultado = document.querySelector('.valor-resultado');

// === Valores iniciais dos dropdowns ===
document.getElementById('moedaDe').value = 'BRL';
document.querySelector('[data-dropdown="de"] .dropdown-search').value = 'BRL - Real Brasileiro';
document.getElementById('moedaPara').value = 'USD';
document.querySelector('[data-dropdown="para"] .dropdown-search').value = 'USD - Dólar Americano';

// === Dropdown funcional ===
document.querySelectorAll('.dropdown').forEach(dropdown => {
  const input = dropdown.querySelector('.dropdown-search');
  const options = dropdown.querySelector('.dropdown-options');
  const hiddenId = dropdown.dataset.dropdown === 'de' ? 'moedaDe' : 'moedaPara';
  const hiddenInput = document.getElementById(hiddenId);

  input.addEventListener('click', e => {
    e.stopPropagation();
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  });

  options.querySelectorAll('.dropdown-option').forEach(option => {
    option.addEventListener('click', () => {
      input.value = option.textContent.trim();
      hiddenInput.value = option.dataset.value;
      options.style.display = 'none';
      atualizarVisualizacao();
      bloquearMesmaMoeda();
    });
  });
});

// Fecha dropdown ao clicar fora
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-options').forEach(opt => opt.style.display = 'none');
});

// === Atualiza imagens e parágrafos com fade ===
function atualizarVisualizacao() {
  const de = document.getElementById('moedaDe').value;
  const para = document.getElementById('moedaPara').value;

  // Remove visible de todos
  document.querySelectorAll('.container-2-1 img, .container-2-2 img, .container-2-1 p, .container-2-2 p')
    .forEach(el => el.classList.remove('visible'));

  // Lado "De"
  if (de === 'BRL') { document.querySelector('.brasil-c1').classList.add('visible'); document.querySelector('.p-real').classList.add('visible'); }
  else if (de === 'USD') { document.querySelector('.eua-c1').classList.add('visible'); document.querySelector('.p-dolar').classList.add('visible'); }
  else if (de === 'EUR') { document.querySelector('.euro-c1').classList.add('visible'); document.querySelector('.p-euro').classList.add('visible'); }
  else if (de === 'BTC') { document.querySelector('.bitcoin-c1').classList.add('visible'); document.querySelector('.p-bitcoin').classList.add('visible'); }

  // Lado "Para"
  if (para === 'BRL') { document.querySelector('.brasil-c2').classList.add('visible'); document.querySelector('.p2-real').classList.add('visible'); }
  else if (para === 'USD') { document.querySelector('.eua-c2').classList.add('visible'); document.querySelector('.p2-dolar').classList.add('visible'); }
  else if (para === 'EUR') { document.querySelector('.euro-c2').classList.add('visible'); document.querySelector('.p2-euro').classList.add('visible'); }
  else if (para === 'BTC') { document.querySelector('.bitcoin-c2').classList.add('visible'); document.querySelector('.p2-bitcoin').classList.add('visible'); }

  // Atualiza classe do input valor
  inputValor.classList.remove('usd','eur','btc','brl');
  inputValor.classList.add(para.toLowerCase());
}

// === Impede selecionar mesma moeda ===
function bloquearMesmaMoeda() {
  const de = document.getElementById('moedaDe').value;
  const para = document.getElementById('moedaPara').value;

  document.querySelectorAll('[data-dropdown="de"] .dropdown-option').forEach(opt => {
    opt.style.display = (opt.dataset.value === para) ? 'none' : 'flex';
  });
  document.querySelectorAll('[data-dropdown="para"] .dropdown-option').forEach(opt => {
    opt.style.display = (opt.dataset.value === de) ? 'none' : 'flex';
  });
}

// === Validação do input para impedir letras e múltiplos pontos/virgulas ===
inputValor.addEventListener('input', () => {
  let valor = inputValor.value;

  // Remove tudo que não seja número, ponto ou vírgula
  valor = valor.replace(/[^0-9.,]/g, '');

  // Substitui vírgula por ponto
  valor = valor.replace(',', '.');

  // Permite apenas um ponto decimal
  const partes = valor.split('.');
  if (partes.length > 2) {
    valor = partes[0] + '.' + partes.slice(1).join('');
  }

  inputValor.value = valor;
});

// Bloqueia letras antes de aparecer no input
inputValor.addEventListener('keydown', (e) => {
  const permitidos = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.', ','];
  if (!/[0-9]/.test(e.key) && !permitidos.includes(e.key)) {
    e.preventDefault();
  }
});

// === Conversão ao clicar no botão ===
botao.addEventListener('click', () => {
  botao.classList.add('clicked');

  const valor = parseFloat(inputValor.value);
  const de = document.getElementById('moedaDe').value;
  const para = document.getElementById('moedaPara').value;

  if (isNaN(valor)) {
    alert("Digite um valor válido!");
    botao.classList.remove('clicked');
    return;
  }

  // Taxas fictícias
  let taxa = 1;
  if (de === 'BRL' && para === 'USD') taxa = 0.20;
  else if (de === 'BRL' && para === 'EUR') taxa = 0.19;
  else if (de === 'BRL' && para === 'BTC') taxa = 0.000019;
  else if (de === 'USD' && para === 'BRL') taxa = 5.0;
  else if (de === 'EUR' && para === 'BRL') taxa = 5.2;
  else if (de === 'BTC' && para === 'BRL') taxa = 52000;
  else if (de === para) taxa = 1;

  const resultado = valor * taxa;

  // Atualiza resultados
  realResultado.textContent = `${valor.toFixed(2)} ${de}`;
  valorResultado.textContent = `${resultado.toFixed(6)} ${para}`;
  realResultado.classList.add('visible');
  valorResultado.classList.add('visible');

  setTimeout(() => botao.classList.remove('clicked'), 500);
});

// === Logo animada girando suavemente ===
let grau = 0, passo = 0.2, limite = 15, indoParaDireita = true;
function animarLogo() {
  if (indoParaDireita) {
    grau += passo;
    if (grau >= limite) indoParaDireita = false;
  } else {
    grau -= passo;
    if (grau <= 0) indoParaDireita = true;
  }
  logo.style.transform = `rotate(${grau}deg)`;
  requestAnimationFrame(animarLogo);
}
animarLogo();

// Inicializa visualização e bloqueio de moedas
atualizarVisualizacao();
bloquearMesmaMoeda();