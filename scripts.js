// === Dados das moedas e imagens ===
const moedas = {
  BRL: { nome: "Real", img: "./img/brasil.png" },
  USD: { nome: "Dólar Americano", img: "./img/eua.png" },
  EUR: { nome: "Euro", img: "./img/euro.png" },
  GBP: { nome: "Libra Estalina", img: "./img/libra.png" },
  BTC: { nome: "Bitcoin", img: "./img/bitcoin.png" }
};

// === Elementos principais ===
const botao = document.querySelector('.convert-button');
const inputValor = document.getElementById('valorDe');
const dropdowns = document.querySelectorAll('.dropdown');

const imgFrom = document.querySelector('.img-box-from');
const textFrom = document.querySelector('.value-text-from');
const valueFrom = document.querySelector('.value-box-from');

const imgTo = document.querySelector('.img-box-to');
const textTo = document.querySelector('.value-text-to');
const valueTo = document.querySelector('.value-box-to');

const logo = document.querySelector('.logo');

// === Inicializa dropdowns e valores escondidos ===
document.getElementById('moedaDe').value = 'BRL';
document.querySelector('[data-dropdown="de"] .dropdown-search').value = 'BRL - Real Brasileiro';
document.getElementById('moedaPara').value = 'USD';
document.querySelector('[data-dropdown="para"] .dropdown-search').value = 'USD - Dólar Americano';

// === Função para resetar input e resultados ===
function resetarValores() {
  inputValor.value = "";
  valueFrom.textContent = "0.00";
  valueTo.textContent = "0.00";
}

// === Dropdown funcional ===
dropdowns.forEach(dropdown => {
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
      resetarValores();       // Limpa input e resultados
      atualizarVisualizacao();
      bloquearMesmaMoeda();
    });
  });
});

// Fecha dropdown ao clicar fora
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-options').forEach(opt => opt.style.display = 'none');
});

// === Atualiza imagens e nomes nas caixas ===
function atualizarVisualizacao() {
  const de = document.getElementById('moedaDe').value;
  const para = document.getElementById('moedaPara').value;

  imgFrom.src = moedas[de].img;
  textFrom.textContent = moedas[de].nome;

  imgTo.src = moedas[para].img;
  textTo.textContent = moedas[para].nome;
}

// === Impede selecionar a mesma moeda nos dois dropdowns ===
function bloquearMesmaMoeda() {
  const de = document.getElementById('moedaDe').value;
  const para = document.getElementById('moedaPara').value;

  document.querySelectorAll('[data-dropdown="de"] .dropdown-option')
    .forEach(opt => opt.style.display = (opt.dataset.value === para) ? 'none' : 'flex');
  document.querySelectorAll('[data-dropdown="para"] .dropdown-option')
    .forEach(opt => opt.style.display = (opt.dataset.value === de) ? 'none' : 'flex');
}

// === Validação do input ===
inputValor.addEventListener('input', () => {
  let valor = inputValor.value;
  valor = valor.replace(/[^0-9.,]/g, '').replace(',', '.');
  const partes = valor.split('.');
  if (partes.length > 2) valor = partes[0] + '.' + partes.slice(1).join('');
  inputValor.value = valor;
});

inputValor.addEventListener('keydown', e => {
  const permitidos = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','.','',','];
  if (!/[0-9]/.test(e.key) && !permitidos.includes(e.key)) e.preventDefault();
});

// === Função para formatar moedas ===
function formatarMoeda(valor, moeda) {
  if (moeda === "BTC") return valor.toFixed(6) + " BTC";

  let locale = "pt-BR";
  if (moeda === "USD") locale = "en-US";
  if (moeda === "EUR") locale = "de-DE";
  if (moeda === "GBP") locale = "en-GB";

  return new Intl.NumberFormat(locale, { style: "currency", currency: moeda, minimumFractionDigits: 2 }).format(valor);
}

// === Função para pegar taxa em tempo real ===
async function pegarTaxa(de, para) {
  try {
    if (de === "BTC" || para === "BTC") {
      const moeda = de === "BTC" ? para.toLowerCase() : de.toLowerCase();
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${moeda}`);
      const data = await response.json();

      if (de === "BTC") {
        // BTC → moeda fiat
        return data.bitcoin[moeda]; 
      } else {
        // moeda fiat → BTC
        return 1 / data.bitcoin[moeda];
      }
    } else {
      const response = await fetch(`https://open.er-api.com/v6/latest/${de}`);
      const data = await response.json();
      return data.rates[para];
    }
  } catch (error) {
    console.error("Erro ao buscar taxa:", error);
    return null;
  }
}

// === Conversão ao clicar no botão ===
botao.addEventListener('click', async () => {
  const valor = parseFloat(inputValor.value);
  if (isNaN(valor) || valor <= 0) return;

  botao.classList.add('clicked');
  const de = document.getElementById('moedaDe').value;
  const para = document.getElementById('moedaPara').value;

  const taxa = await pegarTaxa(de, para);
  if (!taxa) {
    botao.classList.remove('clicked');
    return alert("Não foi possível obter a taxa de câmbio.");
  }

  const resultado = valor * taxa;

  valueFrom.textContent = formatarMoeda(valor, de);
  valueTo.textContent = formatarMoeda(resultado, para);

  setTimeout(() => botao.classList.remove('clicked'), 500);
});

// === Animação da logo ===
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
resetarValores();
