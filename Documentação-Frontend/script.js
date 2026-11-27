(function () {
  'use strict';
  var FONTES = window.FONTES || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- tema ---------- */
  try { var tSalvo = localStorage.getItem('doc-front-tema'); if (tSalvo) document.documentElement.dataset.tema = tSalvo; } catch (e) {}
  $('#temaBtn').addEventListener('click', function () {
    var atual = document.documentElement.dataset.tema || (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
    var novo = atual === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.dataset.tema = novo;
    try { localStorage.setItem('doc-front-tema', novo); } catch (e) {}
  });

  /* ---------- menu ---------- */
  var menu = $('#menu'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var ab = menu.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', String(ab));
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); }); });
  var linksMenu = $$('a', menu);
  var obs = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) {
        linksMenu.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('href') === '#' + en.target.id); });
      }
    });
  }, { rootMargin: '-30% 0px -65% 0px' });
  $$('.secao').forEach(function (s) { obs.observe(s); });

  /* ---------- realce de sintaxe ---------- */
  var PAL = 'import|from|export|default|const|let|var|function|return|if|else|async|await|try|catch|finally|throw|new|class|extends|get|this|null|undefined|true|false|typeof';
  var RE = {
    js: new RegExp('(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(\'(?:\\\\.|[^\'\\\\\\n])*\'|"(?:\\\\.|[^"\\\\\\n])*"|`(?:\\\\.|[^`\\\\])*`)|((?<=[(,=:\\[!&|?{};]\\s*)\\/(?![*\\/])(?:\\\\.|\\[[^\\]\\n]*\\]|[^\\/\\\\\\n])+\\/[gimsuy]*)|(<\\/?[A-Za-z][\\w.]*|\\/?>)|\\b(' + PAL + ')\\b|(\\b\\d+(?:\\.\\d+)?\\b)', 'g'),
    css: /(\/\*[\s\S]*?\*\/)|('(?:[^'\n])*'|"(?:[^"\n])*")|(--[\w-]+)|(#[0-9a-fA-F]{3,8}\b)|(\b\d*\.?\d+(?:rem|px|em|%|s|ms)?\b)/g,
    html: /(<!--[\s\S]*?-->)|("(?:[^"\n])*")|(<\/?[\w!-]+|\/?>)/g,
    json: /("(?:\\.|[^"\\\n])*")(\s*:)?|(\b\d+(?:\.\d+)?\b|true|false|null)/g,
    env: /(#[^\n]*)/g
  };
  function tokens(texto, ling) {
    var re = RE[ling] || RE.js, out = [], ult = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(texto))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      if (m.index > ult) out.push(['', texto.slice(ult, m.index)]);
      var c = '';
      if (ling === 'js') c = m[1] ? 't-com' : m[2] ? 't-str' : m[3] ? 't-reg' : m[4] ? 't-tag' : m[5] ? 't-pal' : 't-num';
      else if (ling === 'css') c = m[1] ? 't-com' : m[2] ? 't-str' : m[3] ? 't-prop' : m[4] ? 't-num' : 't-num';
      else if (ling === 'html') c = m[1] ? 't-com' : m[2] ? 't-str' : 't-tag';
      else if (ling === 'json') c = m[1] ? (m[2] ? 't-prop' : 't-str') : 't-num';
      else c = 't-com';
      out.push([c, m[0]]);
      ult = re.lastIndex;
    }
    if (ult < texto.length) out.push(['', texto.slice(ult)]);
    return out;
  }
  function linguagem(nome) {
    if (/\.css$/.test(nome)) return 'css';
    if (/\.html$/.test(nome)) return 'html';
    if (/\.json$/.test(nome)) return 'json';
    if (/\.env/.test(nome)) return 'env';
    return 'js';
  }
  function realcarHtml(texto, ling) {
    return tokens(texto, ling).map(function (t) { return t[0] ? '<span class="' + t[0] + '">' + esc(t[1]) + '</span>' : esc(t[1]); }).join('');
  }
  function realcarLinhas(texto, ling) {
    var linhas = [''];
    tokens(texto, ling).forEach(function (t) {
      t[1].split('\n').forEach(function (parte, i) {
        if (i > 0) linhas.push('');
        if (parte) linhas[linhas.length - 1] += t[0] ? '<span class="' + t[0] + '">' + esc(parte) + '</span>' : esc(parte);
      });
    });
    return linhas;
  }
  $$('pre[data-realce]').forEach(function (pre) {
    var txt = pre.textContent; pre.innerHTML = realcarHtml(txt, pre.dataset.realce === 'jsx' ? 'js' : pre.dataset.realce);
  });

  /* ---------- passeio pelo código ---------- */
  function idArquivo(nome) { return 'arq-' + nome.replace(/[^\w]+/g, '-'); }
  $$('.arquivo').forEach(function (art) {
    var nome = art.dataset.arquivo, fonte = FONTES[nome];
    art.id = idArquivo(nome);
    if (fonte == null) return;
    var linhas = realcarLinhas(fonte, linguagem(nome));
    var notas = $('.passeio-notas', art);
    var cab = document.createElement('div');
    cab.className = 'arquivo-cab';
    cab.innerHTML = '<h4>' + esc(nome) + '</h4><span class="linhas">' + linhas.length + ' linhas</span>';
    var resumo = document.createElement('p'); resumo.textContent = art.dataset.resumo || '';
    var grade = document.createElement('div'); grade.className = 'passeio';
    var cod = document.createElement('div'); cod.className = 'passeio-codigo'; cod.tabIndex = 0;
    cod.setAttribute('role', 'region'); cod.setAttribute('aria-label', 'Código de ' + nome);
    cod.innerHTML = linhas.map(function (l, i) { return '<span class="ln" data-n="' + (i + 1) + '">' + l + '</span>'; }).join('');
    art.insertBefore(cab, notas); art.insertBefore(resumo, notas);
    art.insertBefore(grade, notas);
    grade.appendChild(cod); grade.appendChild(notas);
    var spans = $$('.ln', cod);
    $$('li', notas).forEach(function (li) {
      var faixa = li.dataset.linhas;
      var rot = document.createElement('b'); rot.className = 'l';
      rot.textContent = (faixa.indexOf('-') > -1 || faixa.indexOf(',') > -1 ? 'linhas ' : 'linha ') + faixa.replace('-', '–');
      li.insertBefore(rot, li.firstChild);
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      function ativar() {
        $$('li', notas).forEach(function (o) { o.classList.toggle('ativa', o === li); });
        spans.forEach(function (s) { s.classList.remove('marcada'); });
        var primeiro = null;
        faixa.split(',').forEach(function (p) {
          var ab = p.split('-').map(Number), a = ab[0], b = ab[1] || ab[0];
          for (var n = a; n <= b; n++) { if (spans[n - 1]) { spans[n - 1].classList.add('marcada'); if (!primeiro) primeiro = spans[n - 1]; } }
        });
        if (primeiro) cod.scrollTo({ top: primeiro.offsetTop - 40, behavior: reduzir ? 'auto' : 'smooth' });
      }
      li.addEventListener('click', ativar);
      li.addEventListener('mouseenter', ativar);
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ativar(); } });
    });
  });

  /* ---------- árvore de diretórios ---------- */
  var ARVORE = { n: 'frontend', d: 'Pasta do frontend, ao lado de backend/ na raiz do repositório.', f: [
    { n: 'node_modules', ig: 1, d: 'Bibliotecas baixadas pelo npm install. Gerada automaticamente; fica fora do Git.' },
    { n: 'dist', ig: 1, d: 'Versão final gerada por npm run build (HTML, JS e CSS minificados). Fica fora do Git.' },
    { n: 'src', d: 'Todo o código-fonte da aplicação.', f: [
      { n: 'api', d: 'Comunicação com o backend. Só esta pasta chama fetch.', f: [
        { n: 'http.js', a: 'src/api/http.js' }, { n: 'mercadorias.js', a: 'src/api/mercadorias.js' }, { n: 'estoques.js', a: 'src/api/estoques.js' } ] },
      { n: 'components', d: 'Peças reaproveitadas entre telas.', f: [
        { n: 'Layout.jsx', a: 'src/components/Layout.jsx' }, { n: 'Campo.jsx', a: 'src/components/Campo.jsx' }, { n: 'Alerta.jsx', a: 'src/components/Alerta.jsx' },
        { n: 'ConfirmarExclusao.jsx', a: 'src/components/ConfirmarExclusao.jsx' }, { n: 'Carregando.jsx', a: 'src/components/Carregando.jsx' },
        { n: 'EstadoErro.jsx', a: 'src/components/EstadoErro.jsx' }, { n: 'EstadoVazio.jsx', a: 'src/components/EstadoVazio.jsx' } ] },
      { n: 'lib', d: 'Funções auxiliares e hooks, sem tela.', f: [
        { n: 'hooks.js', a: 'src/lib/hooks.js' }, { n: 'validar.js', a: 'src/lib/validar.js' }, { n: 'formatar.js', a: 'src/lib/formatar.js' }, { n: 'situacao.js', a: 'src/lib/situacao.js' } ] },
      { n: 'pages', d: 'Uma tela por arquivo, ligadas às rotas em App.jsx.', f: [
        { n: 'Inicio.jsx', a: 'src/pages/Inicio.jsx' }, { n: 'MercadoriasLista.jsx', a: 'src/pages/MercadoriasLista.jsx' }, { n: 'MercadoriaForm.jsx', a: 'src/pages/MercadoriaForm.jsx' },
        { n: 'EstoquesLista.jsx', a: 'src/pages/EstoquesLista.jsx' }, { n: 'EstoqueForm.jsx', a: 'src/pages/EstoqueForm.jsx' }, { n: 'NaoEncontrada.jsx', a: 'src/pages/NaoEncontrada.jsx' } ] },
      { n: 'styles', d: 'CSS, importado em ordem pelo main.jsx.', f: [
        { n: 'tokens.css', a: 'src/styles/tokens.css' }, { n: 'base.css', a: 'src/styles/base.css' }, { n: 'componentes.css', a: 'src/styles/componentes.css' } ] },
      { n: 'App.jsx', a: 'src/App.jsx' },
      { n: 'main.jsx', a: 'src/main.jsx' } ] },
    { n: '.env.example', a: '.env.example' },
    { n: '.gitignore', d: 'Lista o que o Git ignora: node_modules, dist, .env e .env.local.' },
    { n: 'index.html', a: 'index.html' },
    { n: 'package.json', a: 'package.json' },
    { n: 'package-lock.json', d: 'Versões exatas de cada dependência instalada, para todo mundo instalar igual. Gerado pelo npm; não edite à mão.' },
    { n: 'vite.config.js', a: 'vite.config.js' } ] };
  function descricaoDe(no) {
    if (no.d) return no.d;
    var art = document.querySelector('.arquivo[data-arquivo="' + no.a + '"]');
    return art ? art.dataset.resumo : '';
  }
  function montarNo(no, caminho) {
    var li = document.createElement('li');
    var pasta = !!no.f;
    li.className = (pasta ? 'pasta' : 'arq') + (no.ig ? ' ignorado' : '') + (pasta && caminho.split('/').length > 2 && no.n !== 'src' ? ' fechada' : '');
    li.setAttribute('role', 'treeitem');
    var b = document.createElement('button');
    var cam = caminho ? caminho + '/' + no.n : no.n;
    var ico = pasta ? (li.classList.contains('fechada') ? '▸' : '▾') : '·';
    b.innerHTML = '<span class="ico">' + ico + '</span>' + (pasta ? '📁 ' : '') + esc(no.n);
    if (pasta) li.setAttribute('aria-expanded', String(!li.classList.contains('fechada')));
    b.addEventListener('click', function () {
      $$('.arvore button').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      if (pasta && !no.ig) {
        var fechou = li.classList.toggle('fechada');
        li.setAttribute('aria-expanded', String(!fechou));
        $('.ico', b).textContent = fechou ? '▸' : '▾';
      }
      var info = $('#arvoreInfo');
      var html = '<h4>' + esc(no.n) + '</h4><p class="caminho">' + esc(cam) + '</p><p>' + esc(descricaoDe(no)) + '</p>';
      if (no.a && FONTES[no.a] != null) {
        html += '<p class="caminho">' + FONTES[no.a].split('\n').length + ' linhas</p><p><a href="#' + idArquivo(no.a) + '">Ver o código explicado →</a></p>';
      }
      info.innerHTML = html;
    });
    li.appendChild(b);
    if (pasta && no.f && no.f.length) {
      var ul = document.createElement('ul'); ul.setAttribute('role', 'group');
      no.f.forEach(function (f) { ul.appendChild(montarNo(f, cam)); });
      li.appendChild(ul);
    } else if (pasta) {
      $('.ico', b).textContent = '·';
    }
    return li;
  }
  var ulR = document.createElement('ul'); ulR.appendChild(montarNo(ARVORE, ''));
  $('#arvoreRaiz').appendChild(ulR);
  // abre as pastas de src por padrão
  $$('#arvoreRaiz .pasta').forEach(function (li) {
    var nome = li.firstChild.textContent.replace(/[▸▾·📁\s]/g, '');
    if (['api', 'components', 'lib', 'pages', 'styles'].indexOf(nome) > -1) { li.classList.remove('fechada'); li.setAttribute('aria-expanded', 'true'); $('.ico', li.firstChild).textContent = '▾'; }
  });

  /* ---------- mini app (telas falsas) ---------- */
  function miniTopo(atual) {
    return '<div class="m-topo"><b>Controle de Estoque</b><div class="m-nav"><span class="' + (atual === 'm' ? 'atual' : '') + '">Mercadorias</span><span class="' + (atual === 'e' ? 'atual' : '') + '">Estoques</span></div></div>';
  }
  function miniTabelaMerc(linhas, opts) {
    opts = opts || {};
    var h = '<table><caption>' + linhas.length + (linhas.length === 1 ? ' mercadoria cadastrada' : ' mercadorias cadastradas') + '</caption><thead><tr><th class="num">Id</th><th>Nome</th><th class="num">Preço</th><th>Ações</th></tr></thead><tbody>';
    linhas.forEach(function (l) {
      h += '<tr class="' + (l.nova ? 'nova' : '') + '" data-id="' + l.id + '"><td class="num">' + l.id + '</td><th>' + esc(l.nome) + '</th><td class="num">' + esc(l.preco) + '</td><td>' +
        (opts.botoes ? '<button class="m-btn" type="button" aria-label="Editar ' + esc(l.nome) + '">Editar</button> <button class="m-btn perigo" type="button" data-excluir="' + l.id + '" aria-label="Excluir ' + esc(l.nome) + '">Excluir</button>' : '<span class="m-btn">Editar</span> <span class="m-btn perigo">Excluir</span>') + '</td></tr>';
    });
    return h + '</tbody></table>';
  }
  function miniPagina(atual, titulo, botao, corpo, pulsar) {
    return '<div class="mini">' + miniTopo(atual) + '<div class="m-corpo"><div class="m-cab"><h5>' + titulo + '</h5>' + (botao ? '<span class="m-btn pri' + (pulsar ? ' pulsa' : '') + '">' + botao + '</span>' : '') + '</div>' + corpo + '</div></div>';
  }
  function endereco(hash) { return 'localhost:5173/<span class="hash">#' + esc(hash) + '</span>'; }

  /* ---------- player genérico ---------- */
  function player(raiz, passos, mostrar, intervalo) {
    var i = 0, timer = null;
    var cont = $('.contador', raiz), btnT = $('[data-acao="tocar"]', raiz);
    function ir(n) { i = Math.max(0, Math.min(passos.length - 1, n)); mostrar(i); if (cont) cont.textContent = 'Passo ' + (i + 1) + ' de ' + passos.length; }
    function parar() { clearInterval(timer); timer = null; if (btnT) btnT.textContent = '▶ Tocar'; }
    function tocar() {
      if (timer) { parar(); return; }
      if (i >= passos.length - 1) ir(0);
      btnT.textContent = '❚❚ Pausar';
      timer = setInterval(function () { if (i >= passos.length - 1) { parar(); return; } ir(i + 1); }, intervalo || 3200);
    }
    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-acao]'); if (!b || !raiz.contains(b)) return;
      var a = b.dataset.acao;
      if (a === 'tocar') tocar();
      else { parar(); if (a === 'ant') ir(i - 1); else if (a === 'prox') ir(i + 1); else if (a === 'reiniciar') ir(0); }
    });
    ir(0);
    return { ir: ir, parar: parar };
  }

  /* ---------- 5. inicialização ---------- */
  var ELOS = ['npm run dev', 'index.html', 'main.jsx', 'App.jsx', 'Layout.jsx', 'MercadoriasLista.jsx'];
  var BOOT = [
    { e: 0, t: 'Você roda <code>npm run dev</code>', x: 'O Vite liga um servidor em <code>localhost:5173</code>. Ele entrega os arquivos do projeto e repassa chamadas de API ao backend.', c: '$ npm run dev\n\n  VITE v5  ready in 300 ms\n  ➜  Local:   http://localhost:5173/', tela: '<div class="mini"><div class="raiz-vazia" style="border-style:solid">(navegador ainda não abriu nada)</div></div>', end: '' },
    { e: 1, t: 'O navegador recebe o <code>index.html</code>', x: 'É um HTML quase vazio: só uma <code>&lt;div id="raiz"&gt;</code> e uma tag <code>&lt;script&gt;</code> apontando para <code>main.jsx</code>. Por enquanto a tela está em branco.', c: '<body>\n  <div id="raiz"></div>\n  <script type="module" src="/src/main.jsx"><\/script>\n</body>', ling: 'html', tela: '<div class="mini"><div class="raiz-vazia">&lt;div id="raiz"&gt;&lt;/div&gt;<br>(vazia)</div></div>', end: '/' },
    { e: 2, t: '<code>main.jsx</code> liga o React', x: 'Importa fontes e CSS (a página ganha cor de fundo), encontra a div <code>raiz</code> e manda o React desenhar o componente <code>&lt;App /&gt;</code> dentro dela.', c: "import './styles/tokens.css';\nimport './styles/base.css';\nimport './styles/componentes.css';\nimport App from './App.jsx';\n\ncreateRoot(document.getElementById('raiz'))\n  .render(<StrictMode><App /></StrictMode>);", tela: '<div class="mini"><div class="raiz-vazia" style="border-color:#0b5560;color:#0b5560">&lt;App /&gt; sendo montado...</div></div>', end: '/' },
    { e: 3, t: '<code>App.jsx</code> escolhe a rota', x: 'O <code>HashRouter</code> lê o que vem depois do <code>#</code>. O usuário clicou em Mercadorias, então o endereço é <code>#/mercadorias</code>, que casa com a rota <code>path="mercadorias"</code>. Essa rota está dentro da rota do Layout.', c: '<HashRouter>\n  <Routes>\n    <Route element={<Layout />}>\n      <Route path="mercadorias"\n             element={<MercadoriasLista />} />   ◄ casou!', tela: '<div class="mini"><div class="raiz-vazia" style="border-color:#0b5560;color:#0b5560">rota encontrada: mercadorias</div></div>', end: '/mercadorias' },
    { e: 4, t: '<code>Layout.jsx</code> desenha a moldura', x: 'Cabeçalho e menu aparecem. O <code>NavLink</code> de Mercadorias percebe que está ativo e fica sublinhado. No lugar do <code>&lt;Outlet /&gt;</code> entra a página.', c: '<header className="topo"> ... <NavLink to="/mercadorias"> ... </header>\n<main id="conteudo">\n  <Outlet />    ◄ a página entra aqui\n</main>', tela: '<div class="mini aparece">' + miniTopo('m') + '<div class="m-corpo"><div class="raiz-vazia" style="margin:0">&lt;Outlet /&gt;</div></div></div>', end: '/mercadorias' },
    { e: 5, t: 'A página busca os dados', x: '<code>MercadoriasLista</code> chama <code>useCarregar(listarMercadorias)</code>. Na primeira pintura o status é <code>carregando</code>, então aparece "Carregando mercadorias...".', c: 'const lista = useCarregar(listarMercadorias);\n\nif (lista.status === "carregando") {\n  conteudo = <Carregando texto="Carregando mercadorias..." />;\n}', tela: miniPagina('m', 'Mercadorias', 'Nova mercadoria', '<p class="m-carregando">Carregando mercadorias...</p>'), end: '/mercadorias' },
    { e: 5, t: 'Os dados chegam e a tabela aparece', x: 'O backend respondeu. O status vira <code>pronto</code>, o React redesenha a página e agora ela monta a tabela com <code>lista.dados.map(...)</code>.', c: 'conteudo = (\n  <table className="tabela">\n    {lista.dados.map((mercadoria) => (\n      <tr key={mercadoria.id}> ... </tr>\n    ))}\n  </table>\n);', tela: miniPagina('m', 'Mercadorias', 'Nova mercadoria', '<div class="aparece">' + miniTabelaMerc([{ id: 1, nome: 'Arroz 5kg', preco: 'R$ 25,90' }, { id: 2, nome: 'Feijão 1kg', preco: 'R$ 8,49' }]) + '</div>'), end: '/mercadorias' }
  ];
  (function () {
    var raiz = $('#boot');
    $('.cadeia', raiz).innerHTML = ELOS.map(function (e, i) { return (i ? '<span class="seta" aria-hidden="true">→</span>' : '') + '<span class="elo">' + e + '</span>'; }).join('');
    var elos = $$('.elo', raiz);
    player(raiz, BOOT, function (i) {
      var p = BOOT[i];
      elos.forEach(function (el, j) { el.className = 'elo' + (j < p.e ? ' feito' : j === p.e ? ' atual' : ''); });
      $('.passo-texto', raiz).innerHTML = '<h4>' + p.t + '</h4><p>' + p.x + '</p>';
      $('.boot-cod', raiz).innerHTML = realcarHtml(p.c, p.ling || 'js');
      $('.boot-tela', raiz).innerHTML = p.tela;
      $('.boot-end', raiz).innerHTML = p.end ? endereco(p.end) : 'about:blank';
    }, 3600);
  })();

  /* ---------- 6. rotas ---------- */
  (function () {
    var raiz = $('#rotasSim');
    var EXEMPLOS = ['/', '/mercadorias', '/mercadorias/nova', '/mercadorias/7/editar', '/mercadorias/abc/editar', '/estoques', '/estoques?situacao=abaixo', '/estoques/3/editar', '/relatorios'];
    var ROTAS = [
      { p: '(index)', re: /^$/, c: 'Inicio' },
      { p: 'mercadorias', re: /^mercadorias$/, c: 'MercadoriasLista' },
      { p: 'mercadorias/nova', re: /^mercadorias\/nova$/, c: 'MercadoriaForm' },
      { p: 'mercadorias/:id/editar', re: /^mercadorias\/([^/]+)\/editar$/, c: 'MercadoriaForm', id: true },
      { p: 'estoques', re: /^estoques$/, c: 'EstoquesLista' },
      { p: 'estoques/novo', re: /^estoques\/novo$/, c: 'EstoqueForm' },
      { p: 'estoques/:id/editar', re: /^estoques\/([^/]+)\/editar$/, c: 'EstoqueForm', id: true },
      { p: '*', re: /.*/, c: 'NaoEncontrada' }
    ];
    var urls = $('.urls', raiz);
    urls.innerHTML = EXEMPLOS.map(function (u) { return '<button class="btn" type="button" data-u="' + esc(u) + '">#' + esc(u) + '</button>'; }).join('');
    var timers = [];
    function telaPara(comp, info) {
      var m = comp.indexOf('Mercadoria') === 0 ? 'm' : comp.indexOf('Estoque') === 0 ? 'e' : '';
      if (comp === 'Inicio') return miniPagina('', 'Início', '', '<table><thead><tr><th>Cadastro</th><th class="num">Registros</th></tr></thead><tbody><tr><th>Mercadorias</th><td class="num">2</td></tr><tr><th>Estoques</th><td class="num">3</td></tr></tbody></table><p style="margin-top:6px"><b>1 estoque está abaixo do mínimo.</b></p>');
      if (comp === 'MercadoriasLista') return miniPagina(m, 'Mercadorias', 'Nova mercadoria', miniTabelaMerc([{ id: 1, nome: 'Arroz 5kg', preco: 'R$ 25,90' }, { id: 2, nome: 'Feijão 1kg', preco: 'R$ 8,49' }]));
      if (comp === 'MercadoriaForm') return miniPagina(m, info.id ? 'Editar mercadoria <small style="font-weight:400;color:#57594f">Id ' + esc(info.id) + '</small>' : 'Nova mercadoria', '', '<div class="m-campo"><label>Nome</label><div class="m-input">' + (info.id ? 'Café 500g' : '') + '</div></div><div class="m-campo"><label>Preço (R$)</label><div class="m-input">' + (info.id ? '17,90' : '') + '</div></div><span class="m-btn pri">Salvar mercadoria</span>');
      if (comp === 'EstoquesLista') {
        var linhas = [['Arroz 5kg', 4, 10, 50, 'A1', 'abaixo'], ['Feijão 1kg', 30, 10, 50, 'A2', 'faixa'], ['Café 500g', 70, 5, 60, 'B1', 'acima']];
        if (info.q === 'situacao=abaixo') linhas = linhas.filter(function (l) { return l[5] === 'abaixo'; });
        var rot = { abaixo: 'Abaixo do mínimo', faixa: 'Dentro da faixa', acima: 'Acima do máximo' };
        return miniPagina(m, 'Estoques', 'Novo estoque', (info.q === 'situacao=abaixo' ? '<p style="margin:0 0 6px">Mostrando só os estoques abaixo do mínimo.</p>' : '') + '<table><thead><tr><th>Mercadoria</th><th class="num">Qtd</th><th class="num">Mín</th><th class="num">Máx</th><th>Situação</th></tr></thead><tbody>' + linhas.map(function (l) { return '<tr><th>' + l[0] + '</th><td class="num">' + l[1] + '</td><td class="num">' + l[2] + '</td><td class="num">' + l[3] + '</td><td class="situ-' + l[5] + '">' + rot[l[5]] + '</td></tr>'; }).join('') + '</tbody></table>');
      }
      if (comp === 'EstoqueForm') return miniPagina(m, info.id ? 'Editar estoque <small style="font-weight:400;color:#57594f">Id ' + esc(info.id) + '</small>' : 'Novo estoque', '', '<div class="m-campo"><label>Mercadoria</label><div class="m-input">Arroz 5kg (id 1) ▾</div></div><div class="m-campo"><label>Quantidade atual</label><div class="m-input">4</div></div>');
      return miniPagina('', 'Página não encontrada', '', '<p>O endereço aberto não corresponde a nenhuma tela do sistema.</p><p style="color:#0b5560;text-decoration:underline">Voltar para o início</p>');
    }
    function simular(entrada) {
      timers.forEach(clearTimeout); timers = [];
      var u = entrada.trim().replace(/^#/, '');
      if (u.charAt(0) !== '/') u = '/' + u;
      $$('button', urls).forEach(function (b) { b.classList.toggle('sel', b.dataset.u === u); });
      var partes = u.split('?'), caminho = partes[0].replace(/^\/+|\/+$/g, '').toLowerCase(), q = partes[1] || '';
      var linhas = ['&lt;HashRouter&gt;   <span class="t-com">// lê "' + esc(u) + '"</span>', '  &lt;Routes&gt;', '    &lt;Route element={&lt;Layout /&gt;}&gt;  <span class="t-com">// sempre: cabeçalho + menu</span>'];
      var escolhida = null, info = { q: q };
      for (var k = 0; k < ROTAS.length; k++) {
        var r = ROTAS[k], m = caminho.match(r.re);
        if (!m) { linhas.push('      <span class="recusada">✗ ' + r.p + '</span>'); continue; }
        if (r.id) {
          var id = m[1];
          linhas.push('      <span class="escolhida">✓ ' + r.p + '</span>  <span class="t-com">// useParams() = { id: "' + esc(id) + '" }</span>');
          if (/^\d+$/.test(id)) { linhas.push('        &lt;ComIdNumerico&gt; <span class="t-com">// "' + esc(id) + '" só tem dígitos: ok</span>'); escolhida = r.c; info.id = id; }
          else { linhas.push('        &lt;ComIdNumerico&gt; <span class="recusada">// "' + esc(id) + '" não é número!</span>'); escolhida = 'NaoEncontrada'; }
        } else {
          linhas.push('      <span class="escolhida">✓ ' + r.p + '</span>' + (q ? '  <span class="t-com">// useSearchParams(): ' + esc(q) + '</span>' : ''));
          escolhida = r.c;
        }
        break;
      }
      linhas.push('          <span class="escolhida">&lt;' + escolhida + ' /&gt;</span>  <span class="t-com">// entra no &lt;Outlet /&gt;</span>');
      var arv = $('.arv-comp', raiz);
      arv.innerHTML = linhas.map(function (l) { return '<div>' + l + '</div>'; }).join('');
      var divs = $$('div', arv);
      $('.rota-tela', raiz).innerHTML = '<div class="mini"><div class="m-carregando" style="padding:20px">procurando rota...</div></div>';
      $('.rota-end', raiz).innerHTML = endereco(u);
      divs.forEach(function (d, j) { timers.push(setTimeout(function () { d.classList.add('vis'); }, reduzir ? 0 : 160 * j)); });
      timers.push(setTimeout(function () {
        $('.rota-tela', raiz).innerHTML = telaPara(escolhida, info);
        var ex = '';
        if (escolhida === 'NaoEncontrada' && /editar$/.test(caminho)) ex = 'A rota de edição casou, mas o porteiro <code>ComIdNumerico</code> recusou porque o id não é numérico. Sem ele, o front chamaria o backend com um id inválido.';
        else if (escolhida === 'NaoEncontrada') ex = 'Nenhuma rota casou, então a última, <code>path="*"</code>, pega o endereço.';
        else if (info.id) ex = 'Mesmo componente do cadastro, mas como <code>id</code> existe, <code>edicao</code> vira <code>true</code>: o título muda e os dados são buscados com <code>buscar' + (escolhida === 'EstoqueForm' ? 'Estoque' : 'Mercadoria') + '(' + esc(info.id) + ')</code>.';
        else if (q) ex = 'O <code>?situacao=abaixo</code> não faz parte da rota: é lido dentro da página com <code>useSearchParams</code> e filtra a tabela.';
        else ex = 'Rota encontrada. O Layout continua o mesmo; só o conteúdo do <code>&lt;Outlet /&gt;</code> muda.';
        $('.rota-expl', raiz).innerHTML = '<div class="dica" style="margin:0">' + ex + '</div>';
      }, reduzir ? 0 : 160 * divs.length + 150));
    }
    urls.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { $('input', raiz).value = b.dataset.u; simular(b.dataset.u); } });
    $('form', raiz).addEventListener('submit', function (e) { e.preventDefault(); simular($('input', raiz).value || '/'); });
    simular('/mercadorias/7/editar');
  })();

  /* ---------- 7. requisição ---------- */
  (function () {
    var raiz = $('#req');
    var CEN = [
      { nome: 'Listar (200)', met: 'GET', api: 'listarMercadorias()', passos: [
        [0, 'ida', 'A tela <code>MercadoriasLista</code> abre. <code>useCarregar(listarMercadorias)</code> põe o status em <code>carregando</code> e chama a função.'],
        [1, 'ida', '<code>listarMercadorias()</code> só repassa: <code>requisitar(\'/mercadorias\')</code>.'],
        [2, 'ida', '<code>fetch(BASE + \'/mercadorias\', { method: \'GET\' })</code>. Em desenvolvimento <code>BASE</code> é vazio, então a URL é relativa e vai para o próprio Vite.'],
        [3, 'ida', 'O proxy do Vite vê que o caminho começa com <code>/mercadorias</code>, remove o cabeçalho Origin e repassa para <code>http://localhost:8080/mercadorias</code>.'],
        [4, 'volta', 'O Spring consulta o MySQL e responde <code>200 OK</code> com <code>Content-Type: application/json</code>.'],
        [3, 'volta', 'O proxy devolve a resposta ao navegador sem mudar nada.'],
        [2, 'volta', 'Status não é 204, então <code>lerJson()</code> lê o corpo. <code>resposta.ok</code> é verdadeiro: <code>return dados</code>.'],
        [0, 'volta', 'A Promise termina. <code>useCarregar</code> grava <code>{ status: \'pronto\', dados }</code> e o React desenha a tabela.']
      ], res: { t: 'Dados devolvidos à página', c: '[\n  { "id": 1, "nome": "Arroz 5kg", "preco": 25.90 },\n  { "id": 2, "nome": "Feijão 1kg", "preco": 8.49 }\n]', ling: 'json' } },
      { nome: 'Cadastrar recusado (400)', met: 'POST', api: 'criarMercadoria(corpo)', falha: 1, passos: [
        [0, 'ida', 'No <code>salvar()</code> do formulário, a validação do front passou. <code>setEnviando(true)</code> e chama <code>criarMercadoria({ nome, preco })</code>.'],
        [1, 'ida', '<code>requisitar(\'/mercadorias\', { metodo: \'POST\', corpo: dados })</code>.'],
        [2, 'ida', 'Como há corpo, envia o cabeçalho <code>Content-Type: application/json</code> e <code>body: JSON.stringify(corpo)</code>.'],
        [3, 'ida', 'O proxy repassa o POST.'],
        [4, 'volta', 'Suponha que o backend recuse algum campo (a validação dele é a palavra final). Responde <code>400</code> com <code>{ status, mensagem: "Dados inválidos", campos: {...} }</code>.'],
        [3, 'volta', 'O proxy devolve.'],
        [2, 'volta', 'Lê o JSON. <code>resposta.ok</code> é falso e não é 502/503/504, então lança <code>new ErroApi({ status: 400, mensagem, campos })</code>.'],
        [0, 'volta', 'Cai no <code>catch</code> do <code>salvar()</code>: reabilita o botão, <code>setErros(erro.campos)</code> mostra o erro embaixo do campo e o alerta diz "Dados inválidos. Revise os campos indicados."']
      ], res: { t: 'Erro lançado (ErroApi)', c: '{\n  "status": 400,\n  "mensagem": "Dados inválidos",\n  "campos": { "nome": "O nome deve ter no máximo 100 caracteres" }\n}', ling: 'json' } },
      { nome: 'Excluir (204)', met: 'DELETE', api: 'excluirMercadoria(2)', passos: [
        [0, 'ida', 'O usuário confirmou no diálogo. <code>confirmarExclusao()</code> faz <code>setExcluindo(true)</code> e chama <code>excluirMercadoria(alvo.id)</code>.'],
        [1, 'ida', '<code>requisitar(\'/mercadorias/2\', { metodo: \'DELETE\' })</code>.'],
        [2, 'ida', '<code>fetch</code> com método DELETE e sem corpo.'],
        [3, 'ida', 'O proxy repassa.'],
        [4, 'volta', 'O Spring apaga e responde <code>204 No Content</code>: sucesso, sem corpo.'],
        [3, 'volta', 'O proxy devolve.'],
        [2, 'volta', '<code>if (resposta.status === 204) return null;</code> Nem tenta ler JSON.'],
        [0, 'volta', '<code>lista.alterarDados(d =&gt; d.filter(m =&gt; m.id !== 2))</code> remove a linha sem buscar a lista de novo e mostra "Mercadoria excluída."']
      ], res: { t: 'Valor devolvido', c: 'null', ling: 'json' } },
      { nome: 'Não encontrado (404)', met: 'GET', api: 'buscarMercadoria(999)', falha: 1, passos: [
        [0, 'ida', 'Alguém abriu <code>#/mercadorias/999/editar</code>. O formulário chama <code>buscarMercadoria(\'999\')</code> via <code>useCarregar</code>.'],
        [1, 'ida', '<code>requisitar(\'/mercadorias/999\')</code>.'],
        [2, 'ida', '<code>fetch</code> GET.'],
        [3, 'ida', 'O proxy repassa.'],
        [4, 'volta', 'Não existe mercadoria 999: o Spring responde <code>404</code> com <code>{ mensagem: "Mercadoria não encontrada: id 999" }</code>.'],
        [3, 'volta', 'O proxy devolve.'],
        [2, 'volta', 'Lança <code>ErroApi</code> com status 404 e a mensagem do backend.'],
        [0, 'volta', '<code>useCarregar</code> grava <code>status: \'erro\'</code>. <code>EstadoErro</code> mostra a mensagem e o link "Voltar para a lista", <strong>sem</strong> "Tentar de novo" (seria inútil num 404).']
      ], res: { t: 'Erro lançado (ErroApi)', c: '{\n  "status": 404,\n  "mensagem": "Mercadoria não encontrada: id 999",\n  "campos": null\n}', ling: 'json' } },
      { nome: 'Backend desligado', met: 'GET', api: 'listarMercadorias()', falha: 1, desligado: 1, passos: [
        [0, 'ida', 'A lista abre e pede os dados normalmente.'],
        [1, 'ida', '<code>requisitar(\'/mercadorias\')</code>.'],
        [2, 'ida', '<code>fetch</code> para o Vite.'],
        [3, 'volta', 'O proxy tenta conectar em <code>localhost:8080</code> e falha. O <code>proxy.on(\'error\')</code> do <code>vite.config.js</code> responde <code>502</code> com o texto "Backend indisponível" (não é JSON).'],
        [2, 'volta', '<code>lerJson</code> devolve <code>null</code> (não é JSON). Status 502 sem dados → lança <code>ErroApi</code> com <strong>status 0</strong> e <code>MENSAGEM_REDE</code>. (Sem o proxy, em produção, o próprio <code>fetch</code> falharia e cairia no <code>catch</code> da linha 38, com o mesmo resultado.)'],
        [0, 'volta', '<code>EstadoErro</code> mostra "Não foi possível falar com o servidor. Confira se o backend está rodando em localhost:8080." com o botão "Tentar de novo".']
      ], res: { t: 'Erro lançado (ErroApi)', c: '{\n  "status": 0,\n  "mensagem": "Não foi possível falar com o servidor. Confira se o backend está rodando em localhost:8080.",\n  "campos": null\n}', ling: 'json' } }
    ];
    var nos = $$('.no', raiz), pacote = $('.pacote', raiz), pista = $('.pista', raiz), diario = $('.diario', raiz), resultado = $('.resultado', raiz);
    var cen = CEN[0];
    $('.cenarios', raiz).innerHTML = CEN.map(function (c, i) { return '<button class="btn' + (i ? '' : ' sel') + '" type="button" data-c="' + i + '">' + c.nome + '</button>'; }).join('');
    function posicionar(n) {
      var r = nos[n].getBoundingClientRect(), p = pista.getBoundingClientRect();
      var vertical = getComputedStyle(pista).gridTemplateColumns.split(' ').length === 1;
      if (vertical) { pacote.style.left = '30px'; pacote.style.top = (r.top - p.top + r.height / 2) + 'px'; }
      else { pacote.style.left = (r.left - p.left + r.width / 2) + 'px'; pacote.style.top = '4px'; }
    }
    function mostrar(i) {
      var ps = cen.passos, p = ps[i];
      nos.forEach(function (n, j) { n.classList.toggle('ativo', j === p[0]); });
      $$('small', nos[1])[0].textContent = cen.api;
      pacote.classList.toggle('volta', p[1] === 'volta' && !cen.falha);
      pacote.classList.toggle('falha', p[1] === 'volta' && !!cen.falha);
      pacote.textContent = p[1] === 'ida' ? cen.met : (i === ps.length - 1 ? (cen.falha ? 'ErroApi' : 'dados') : 'resposta');
      nos[4].style.opacity = cen.desligado ? '.35' : '';
      posicionar(p[0]);
      diario.innerHTML = ps.slice(0, i + 1).map(function (q, j) { return '<p class="' + (j < i ? 'velho' : '') + '">' + (j + 1) + '. ' + q[2] + '</p>'; }).join('');
      diario.scrollTop = diario.scrollHeight;
      resultado.innerHTML = i === ps.length - 1 ? '<p><strong>' + cen.res.t + ':</strong></p><pre class="bloco">' + realcarHtml(cen.res.c, cen.res.ling) + '</pre>' : '';
    }
    var indice = 0;
    var cont = $('.contador', raiz), btnT = $('[data-acao="tocar"]', raiz), timer = null;
    function ir(n) { indice = Math.max(0, Math.min(cen.passos.length - 1, n)); mostrar(indice); cont.textContent = 'Passo ' + (indice + 1) + ' de ' + cen.passos.length; }
    function parar() { clearInterval(timer); timer = null; btnT.textContent = '▶ Tocar'; }
    function tocar() {
      if (timer) { parar(); return; }
      if (indice >= cen.passos.length - 1) ir(0);
      btnT.textContent = '❚❚ Pausar';
      timer = setInterval(function () { if (indice >= cen.passos.length - 1) { parar(); return; } ir(indice + 1); }, 2600);
    }
    raiz.addEventListener('click', function (e) {
      var c = e.target.closest('[data-c]');
      if (c) { parar(); cen = CEN[+c.dataset.c]; $$('[data-c]', raiz).forEach(function (b) { b.classList.toggle('sel', b === c); }); ir(0); return; }
      var b = e.target.closest('[data-acao]'); if (!b) return;
      if (b.dataset.acao === 'tocar') tocar(); else { parar(); ir(indice + (b.dataset.acao === 'prox' ? 1 : -1)); }
    });
    window.addEventListener('resize', function () { posicionar(cen.passos[indice][0]); });
    ir(0);
  })();

  /* ---------- 8. máquina de estados ---------- */
  (function () {
    var raiz = $('#maq');
    var s = { montado: false, status: '—', dados: 'null', erro: 'null', tentativa: 0, ativo: '—', pendente: false };
    var ant = {};
    var log = $('#maqLog'), vars = $('#maqVars'), tela = $('.maq-tela', raiz);
    function registrar(t) { var p = document.createElement('p'); p.innerHTML = t; log.appendChild(p); $$('p', log).forEach(function (x, i, a) { x.classList.toggle('velho', i < a.length - 1); }); log.scrollTop = log.scrollHeight; }
    function desenhar(seta) {
      var campos = [['montado', s.montado], ['status', s.status], ['dados', s.dados], ['erro', s.erro], ['tentativa', s.tentativa], ['ativo', s.ativo], ['requisição pendente', s.pendente]];
      vars.innerHTML = campos.map(function (c) { return '<div class="' + (ant[c[0]] !== undefined && String(ant[c[0]]) !== String(c[1]) ? 'mudou' : '') + '"><span>' + c[0] + '</span><span>' + esc(String(c[1])) + '</span></div>'; }).join('');
      campos.forEach(function (c) { ant[c[0]] = c[1]; });
      ['carregando', 'pronto', 'erro'].forEach(function (n) { $('#est-' + n).classList.toggle('on', s.montado && s.status === n); });
      ['ok', 'falha', 'rec'].forEach(function (n) { $('#ar-' + n).classList.toggle('on', seta === n); });
      if (!s.montado) tela.innerHTML = '<div class="mini"><p class="m-carregando" style="padding:20px;">(tela fechada)</p></div>'.replace('m-carregando', '');
      else if (s.status === 'carregando') tela.innerHTML = '<div class="mini"><div class="m-corpo"><p class="m-carregando">Carregando mercadorias...</p></div></div>';
      else if (s.status === 'pronto') tela.innerHTML = '<div class="mini"><div class="m-corpo aparece">' + miniTabelaMerc([{ id: 1, nome: 'Arroz 5kg', preco: 'R$ 25,90' }]) + '</div></div>';
      else tela.innerHTML = '<div class="mini"><div class="m-corpo aparece"><div class="m-vazio" style="border-color:#a8201a;background:#fbeceb">Não foi possível falar com o servidor.<br><span class="m-btn">Tentar de novo</span></div></div></div>';
    }
    function efeito() {
      s.ativo = true; s.status = 'carregando'; s.dados = 'null'; s.erro = 'null'; s.pendente = true;
      registrar('useEffect roda (tentativa=' + s.tentativa + '): <code>ativo = true</code>, status <code>carregando</code>, chama <code>carregarRef.current()</code>.');
    }
    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-acao]'); if (!b) return;
      var a = b.dataset.acao, seta = null;
      if (a === 'montar') {
        if (s.montado) { registrar('A tela já está aberta.'); return; }
        s.montado = true; s.tentativa = 0; registrar('<strong>Tela abriu.</strong> O hook cria o estado inicial.'); efeito();
      } else if (a === 'ok' || a === 'falha') {
        if (!s.pendente) { registrar('Nenhuma requisição em andamento. Abra a tela ou clique em "Tentar de novo".'); return; }
        s.pendente = false;
        if (s.ativo !== true) { registrar('<strong>Resposta chegou, mas <code>ativo</code> é false.</strong> <code>ativo &amp;&amp; setEstado(...)</code> não faz nada: a resposta é ignorada com segurança.'); }
        else if (a === 'ok') { s.status = 'pronto'; s.dados = '[{ id: 1, nome: "Arroz 5kg" }]'; seta = 'ok'; registrar('Promise resolvida → <code>setEstado({ status: \'pronto\', dados })</code>. A tabela aparece.'); }
        else { s.status = 'erro'; s.erro = 'ErroApi(status 0)'; seta = 'falha'; registrar('Promise rejeitada → <code>setEstado({ status: \'erro\', erro })</code>. Aparece o EstadoErro.'); }
      } else if (a === 'recarregar') {
        if (!s.montado) { registrar('A tela está fechada.'); return; }
        registrar('<code>recarregar()</code> → <code>setTentativa(n =&gt; n + 1)</code>. Como <code>tentativa</code> está nas dependências, o efeito roda de novo. Primeiro a limpeza: <code>ativo = false</code> da rodada anterior.');
        s.tentativa++; seta = 'rec'; efeito();
      } else if (a === 'sair') {
        if (!s.montado) { registrar('A tela já está fechada.'); return; }
        s.montado = false; s.ativo = false; s.status = '—';
        registrar('<strong>Usuário saiu da tela.</strong> A limpeza do efeito roda: <code>ativo = false</code>.' + (s.pendente ? ' A requisição continua em andamento... agora clique em "Servidor responde OK".' : ''));
      }
      desenhar(seta);
    });
    registrar('Clique em <strong>Abrir a tela</strong> para começar.');
    desenhar(null);
  })();

  /* ---------- 9. storyboard cadastro ---------- */
  (function () {
    var raiz = $('#story');
    var base = [{ id: 1, nome: 'Arroz 5kg', preco: 'R$ 25,90' }, { id: 2, nome: 'Feijão 1kg', preco: 'R$ 8,49' }];
    function form(nome, preco, o) {
      o = o || {};
      return miniPagina('m', 'Nova mercadoria', '', (o.alerta ? '<div class="m-alerta erro">' + o.alerta + '</div>' : '') +
        '<div class="m-campo"><label>Nome</label><div class="m-input' + (o.foco === 'nome' ? ' foco cursor' : '') + '">' + esc(nome) + '</div></div>' +
        '<div class="m-campo"><label>Preço (R$)</label><div class="m-dica">Use vírgula ou ponto para os centavos, por exemplo 25,90.</div><div class="m-input' + (o.erroPreco ? ' invalido' : '') + (o.foco === 'preco' ? ' foco cursor' : '') + '">' + esc(preco) + '</div>' + (o.erroPreco ? '<div class="m-erro">' + o.erroPreco + '</div>' : '') + '</div>' +
        '<span class="m-btn pri' + (o.pulsar ? ' pulsa' : '') + '">' + (o.enviando ? 'Salvando...' : 'Salvar mercadoria') + '</span> <span class="m-btn">Cancelar</span>');
    }
    var P = [
      { t: 'A lista de mercadorias', x: 'Estamos em <code>#/mercadorias</code>. O usuário vai clicar em <strong>Nova mercadoria</strong>, que é um <code>&lt;Link to="/mercadorias/nova"&gt;</code>.', c: '<Link className="botao botao-principal" to="/mercadorias/nova">\n  Nova mercadoria\n</Link>', h: '/mercadorias', tela: miniPagina('m', 'Mercadorias', 'Nova mercadoria', miniTabelaMerc(base), true) },
      { t: 'A URL muda e o formulário abre', x: 'O Router troca a página no <code>&lt;Outlet /&gt;</code> sem recarregar. <code>useParams()</code> não tem <code>id</code>, então <code>edicao = false</code> e o título é "Nova mercadoria". O Layout foca o <code>&lt;h1&gt;</code>.', c: "const { id } = useParams();      // undefined\nconst edicao = id !== undefined; // false\nconst titulo = edicao ? 'Editar mercadoria' : 'Nova mercadoria';", h: '/mercadorias/nova', tela: form('', '', { foco: 'nome' }) },
      { t: 'O usuário digita', x: 'Cada tecla dispara <code>onChange={alterar}</code>. A função usa o <code>name</code> do input para atualizar só aquele campo em <code>valores</code>. O React redesenha e o texto aparece. O preço foi digitado errado de propósito.', c: "function alterar(evento) {\n  const { name, value } = evento.target;\n  setValores((atuais) => ({ ...atuais, [name]: value }));\n}\n// valores = { nome: 'Arroz 5kg', preco: '25.9o' }", h: '/mercadorias/nova', tela: form('Arroz 5kg', '25.9o', { foco: 'preco' }) },
      { t: 'Clica em Salvar: a validação reprova', x: '<code>salvar()</code> chama <code>preventDefault()</code> e <code>validarMercadoria(valores)</code>. O preço não passa no formato. O erro aparece embaixo do campo, a borda fica vermelha (<code>aria-invalid</code>) e o foco vai para ele. <strong>Nada foi enviado ao servidor.</strong>', c: "const errosCliente = validarMercadoria(valores);\n// { preco: 'Informe o preço só com números, por exemplo 25,90' }\nsetErros(errosCliente);\nif (Object.keys(errosCliente).length) {\n  focarPrimeiroInvalido(formRef.current);\n  return;   // para aqui\n}", h: '/mercadorias/nova', tela: form('Arroz 5kg', '25.9o', { erroPreco: 'Informe o preço só com números, por exemplo 25,90', foco: 'preco' }) },
      { t: 'O usuário corrige', x: 'Ao digitar no preço, <code>alterar</code> também remove o erro daquele campo: <code>setErros(({ [name]: _removido, ...resto }) =&gt; resto)</code>. A mensagem some na hora.', c: "setErros(({ [name]: _removido, ...resto }) => resto);\n// erros = {}", h: '/mercadorias/nova', tela: form('Arroz 5kg', '25,90', { foco: 'preco', pulsar: true }) },
      { t: 'Salvar de novo: envia ao backend', x: 'Agora a validação devolve <code>{}</code>. O botão vira "Salvando..." e é desabilitado. O corpo é montado com o preço convertido para número e enviado com <code>POST /mercadorias</code>.', c: "setEnviando(true);\nconst corpo = { nome: valores.nome.trim(), preco: lerPreco(valores.preco) };\n// { nome: 'Arroz 5kg', preco: 25.9 }\nconst salva = await criarMercadoria(corpo);", h: '/mercadorias/nova', tela: form('Arroz 5kg', '25,90', { enviando: true }) },
      { t: 'Sucesso: volta para a lista levando um aviso', x: 'O backend responde <code>201</code> com a mercadoria criada (já com <code>id: 3</code>). O formulário navega para a lista e passa o aviso no <code>state</code> da navegação, uma "mochila" que vai junto com a troca de tela.', c: "navigate('/mercadorias', {\n  state: { aviso: { tipo: 'sucesso', texto: \"Mercadoria 'Arroz 5kg' cadastrada.\" } }\n});", h: '/mercadorias', tela: miniPagina('m', 'Mercadorias', 'Nova mercadoria', '<p class="m-carregando">Carregando mercadorias...</p>') },
      { t: 'A lista mostra o aviso e a linha nova', x: '<code>useAviso()</code> lê <code>location.state.aviso</code> e o <code>Alerta</code> mostra a faixa verde (anunciada pelo leitor de tela via <code>role="status"</code>). Em seguida o <code>state</code> é apagado do histórico, para o aviso não voltar com F5. A lista é buscada de novo e traz a mercadoria 3.', c: "const [aviso, setAviso] = useAviso();\n// aviso = { tipo: 'sucesso', texto: \"Mercadoria 'Arroz 5kg' cadastrada.\" }\nnavigate(..., { replace: true, state: null });  // limpa", h: '/mercadorias', tela: miniPagina('m', 'Mercadorias', 'Nova mercadoria', '<div class="m-alerta ok"><span>Mercadoria \'Arroz 5kg\' cadastrada.</span><span style="text-decoration:underline">Fechar aviso</span></div>' + miniTabelaMerc(base.concat([{ id: 3, nome: 'Arroz 5kg', preco: 'R$ 25,90', nova: 1 }]))) }
    ];
    player(raiz, P, function (i) {
      var p = P[i];
      $('.passo-texto', raiz).innerHTML = '<h4>' + (i + 1) + '. ' + p.t + '</h4><p>' + p.x + '</p>';
      $('.story-cod', raiz).innerHTML = realcarHtml(p.c, 'js');
      $('.story-end', raiz).innerHTML = endereco(p.h);
      $('.story-tela', raiz).innerHTML = p.tela;
    }, 4200);
  })();

  /* ---------- 10. exclusão ---------- */
  (function () {
    var INICIAIS = [{ id: 1, nome: 'Arroz 5kg', preco: 'R$ 25,90' }, { id: 2, nome: 'Feijão 1kg', preco: 'R$ 8,49' }, { id: 3, nome: 'Café 500g', preco: 'R$ 17,90' }];
    var dados = INICIAIS.slice(), alvo = null, excluindo = false, aviso = null;
    var tela = $('#excTela'), dlg = $('#excDlg'), vars = $('#excVars'), log = $('#excLog');
    var btnC = $('#excCancelar'), btnX = $('#excConfirmar');
    function registrar(t) { var p = document.createElement('p'); p.innerHTML = t; log.appendChild(p); $$('p', log).forEach(function (x, i, a) { x.classList.toggle('velho', i < a.length - 1); }); log.scrollTop = log.scrollHeight; }
    function desenharVars() {
      vars.innerHTML = [['alvo', alvo ? '{ id: ' + alvo.id + ', nome: "' + alvo.nome + '" }' : 'null'], ['excluindo', excluindo], ['aberto (prop)', Boolean(alvo)], ['lista.dados.length', dados.length]]
        .map(function (c) { return '<div><span>' + c[0] + '</span><span>' + esc(String(c[1])) + '</span></div>'; }).join('');
    }
    function desenhar() {
      var corpo = (aviso ? '<div class="m-alerta ok"><span>' + esc(aviso) + '</span><button type="button" class="m-btn" id="excFechar" style="border:0;background:none;text-decoration:underline">Fechar aviso</button></div>' : '') +
        (dados.length ? miniTabelaMerc(dados, { botoes: 1 }) : '<div class="m-vazio">Nenhuma mercadoria cadastrada. Cadastre a primeira para poder criar estoques.</div>');
      tela.innerHTML = '<div class="mini">' + miniTopo('m') + '<div class="m-corpo"><div class="m-cab"><h5 tabindex="-1" id="excH1">Mercadorias</h5><span class="m-btn pri">Nova mercadoria</span></div>' + corpo + '</div></div>';
      desenharVars();
    }
    tela.addEventListener('click', function (e) {
      if (e.target.id === 'excFechar') { aviso = null; registrar('<code>onFechar</code> → <code>setAviso(null)</code>.'); desenhar(); return; }
      var b = e.target.closest('[data-excluir]'); if (!b) return;
      alvo = dados.filter(function (d) { return d.id === +b.dataset.excluir; })[0];
      registrar('Clique em Excluir → <code>setAlvo(mercadoria)</code>. A prop <code>aberto</code> vira true e o efeito chama <code>showModal()</code>.');
      $('#excDlgM').textContent = "Excluir '" + alvo.nome + "'? Essa ação não pode ser desfeita.";
      btnX.textContent = 'Excluir'; btnX.disabled = btnC.disabled = false;
      dlg.showModal(); btnC.focus();
      desenharVars();
    });
    function fechar() { if (excluindo) return; registrar('Cancelar → <code>setAlvo(null)</code>. O efeito chama <code>dialogo.close()</code>.'); alvo = null; dlg.close(); desenharVars(); }
    btnC.addEventListener('click', fechar);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); if (!excluindo) { registrar('Tecla Esc → evento <code>cancel</code> → <code>preventDefault()</code> e <code>onCancelar()</code>.'); fechar(); } });
    btnX.addEventListener('click', function () {
      excluindo = true; btnX.textContent = 'Excluindo...'; btnX.disabled = btnC.disabled = true; desenharVars();
      registrar('Confirmar → <code>setExcluindo(true)</code>; <code>await excluirMercadoria(' + alvo.id + ')</code>... (DELETE)');
      setTimeout(function () {
        var id = alvo.id, nome = alvo.nome;
        registrar('Servidor respondeu 204. <code>lista.alterarDados(d =&gt; d.filter(m =&gt; m.id !== ' + id + '))</code>.');
        var tr = tela.querySelector('tr[data-id="' + id + '"]');
        excluindo = false; alvo = null; dlg.close();
        if (tr) tr.classList.add('saindo');
        setTimeout(function () {
          dados = dados.filter(function (d) { return d.id !== id; });
          aviso = "Mercadoria '" + nome + "' excluída.";
          desenhar();
          var h = $('#excH1'); if (h) h.focus({ preventScroll: true });
          registrar('<code>setAviso(...)</code> mostra o alerta; o foco volta ao <code>&lt;h1&gt;</code>; <code>finally</code>: <code>setExcluindo(false)</code> e <code>setAlvo(null)</code>.');
        }, reduzir ? 0 : 600);
      }, reduzir ? 100 : 1100);
    });
    $('#excRestaurar').addEventListener('click', function () { dados = INICIAIS.slice(); aviso = null; log.innerHTML = ''; registrar('Linhas restauradas. Clique em <strong>Excluir</strong> numa linha.'); desenhar(); });
    registrar('Clique em <strong>Excluir</strong> numa linha.');
    desenhar();
  })();

  /* ---------- 11. validação (cópia de src/lib/validar.js) ---------- */
  var MAIOR_INTEIRO = 2147483647;
  var lerPreco = function (texto) { return Number(texto.trim().replace(',', '.')); };
  function validarTexto(valor, rotulo, obrigatorioMsg) { var t = valor.trim(); if (!t) return obrigatorioMsg; if (t.length > 100) return rotulo + ' deve ter no máximo 100 caracteres'; return null; }
  function validarInteiro(valor, obrigatorioMsg, negativoMsg) { var t = valor.trim(); if (!t) return obrigatorioMsg; if (/^-\d/.test(t)) return negativoMsg; if (!/^\d+$/.test(t)) return 'Informe um número inteiro, sem vírgula ou ponto'; if (Number(t) > MAIOR_INTEIRO) return 'O valor informado é grande demais'; return null; }
  function semVazios(erros) { var o = {}; Object.keys(erros).forEach(function (k) { if (erros[k]) o[k] = erros[k]; }); return o; }
  function validarMercadoria(v) {
    var texto = v.preco.trim(), erroPreco = null;
    if (!texto) erroPreco = 'O preço é obrigatório';
    else if (/^-\d/.test(texto)) erroPreco = 'O preço não pode ser negativo';
    else if (!/^\d+([.,]\d+)?$/.test(texto)) erroPreco = 'Informe o preço só com números, por exemplo 25,90';
    else if (!/^\d{1,8}([.,]\d{1,2})?$/.test(texto)) erroPreco = 'O preço deve ter no máximo 8 dígitos inteiros e 2 decimais';
    return semVazios({ nome: validarTexto(v.nome, 'O nome', 'O nome é obrigatório'), preco: erroPreco });
  }
  function validarEstoque(v) {
    var erros = {
      idMerc: v.idMerc ? null : 'Selecione a mercadoria',
      quantidade: validarInteiro(v.quantidade, 'A quantidade é obrigatória', 'A quantidade não pode ser negativa'),
      quantidadeMinima: validarInteiro(v.quantidadeMinima, 'A quantidade mínima é obrigatória', 'A quantidade mínima não pode ser negativa'),
      quantidadeMaxima: validarInteiro(v.quantidadeMaxima, 'A quantidade máxima é obrigatória', 'A quantidade máxima não pode ser negativa'),
      localizacao: validarTexto(v.localizacao, 'A localização', 'A localização é obrigatória')
    };
    if (!erros.quantidadeMinima && !erros.quantidadeMaxima && Number(v.quantidadeMaxima) < Number(v.quantidadeMinima)) erros.quantidadeMaxima = 'A quantidade máxima não pode ser menor que a quantidade mínima';
    return semVazios(erros);
  }
  (function () {
    var form = $('#valForm'), aba = 'merc', erros = {};
    var CAMPOS = {
      merc: [['nome', 'Nome', '', 'Arroz 5kg'], ['preco', 'Preço (R$)', 'Use vírgula ou ponto para os centavos, por exemplo 25,90.', '25,9o']],
      est: [['idMerc', 'Mercadoria', '', ''], ['quantidade', 'Quantidade atual', '', '4.5'], ['quantidadeMinima', 'Quantidade mínima', '', '10'], ['quantidadeMaxima', 'Quantidade máxima', 'Precisa ser igual ou maior que a quantidade mínima.', '5'], ['localizacao', 'Localização', 'Onde a mercadoria fica guardada, por exemplo Prateleira A1.', '  ']]
    };
    function montar() {
      erros = {};
      form.innerHTML = CAMPOS[aba].map(function (c) {
        var ctrl = c[0] === 'idMerc'
          ? '<select id="v-' + c[0] + '" name="' + c[0] + '"><option value="">Selecione a mercadoria</option><option value="1">Arroz 5kg (id 1)</option><option value="2">Feijão 1kg (id 2)</option></select>'
          : '<input id="v-' + c[0] + '" name="' + c[0] + '" autocomplete="off" value="' + esc(c[3]) + '"' + (c[3] === '  ' ? ' placeholder="(só espaços)"' : '') + '>';
        return '<div class="campo-doc"><label for="v-' + c[0] + '">' + c[1] + '</label>' + (c[2] ? '<p class="hint" id="v-' + c[0] + '-dica">' + c[2] + '</p>' : '') + ctrl + '<div class="erro-slot"></div></div>';
      }).join('') + '<button type="submit" class="btn btn-pri">Salvar</button>';
      $('#valErros').textContent = '{}';
      $('#valCorpo').textContent = '(clique em Salvar)';
    }
    function pintarErros() {
      CAMPOS[aba].forEach(function (c) {
        var el = $('#v-' + c[0]), slot = el.parentNode.querySelector('.erro-slot');
        if (erros[c[0]]) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'v-' + c[0] + '-erro'); slot.innerHTML = '<p class="err" id="v-' + c[0] + '-erro">' + esc(erros[c[0]]) + '</p>'; }
        else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); slot.innerHTML = ''; }
      });
      $('#valErros').innerHTML = realcarHtml(JSON.stringify(erros, null, 2), 'json');
    }
    form.addEventListener('input', function (e) { if (e.target.name && erros[e.target.name]) { delete erros[e.target.name]; pintarErros(); } });
    form.addEventListener('change', function (e) { if (e.target.name && erros[e.target.name]) { delete erros[e.target.name]; pintarErros(); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {}; CAMPOS[aba].forEach(function (c) { v[c[0]] = $('#v-' + c[0]).value; });
      erros = aba === 'merc' ? validarMercadoria(v) : validarEstoque(v);
      pintarErros();
      if (Object.keys(erros).length) {
        $('#valCorpo').textContent = '(não envia: há erros)';
        var inv = form.querySelector('[aria-invalid="true"]'); if (inv) inv.focus();
      } else {
        var corpo;
        if (aba === 'merc') corpo = { nome: v.nome.trim(), preco: lerPreco(v.preco) };
        else { corpo = Object.assign({}, v, { localizacao: v.localizacao.trim() }); ['idMerc', 'quantidade', 'quantidadeMinima', 'quantidadeMaxima'].forEach(function (k) { corpo[k] = Number(v[k]); }); }
        $('#valCorpo').innerHTML = realcarHtml(JSON.stringify(corpo, null, 2), 'json');
      }
    });
    $$('[data-aba]').forEach(function (b) {
      b.addEventListener('click', function () {
        aba = b.dataset.aba;
        $$('[data-aba]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        montar();
      });
    });
    montar();
  })();

  /* ---------- 12. situação e formatação ---------- */
  (function () {
    var ROT = { abaixo: 'Abaixo do mínimo', faixa: 'Dentro da faixa', acima: 'Acima do máximo' };
    function situacaoDe(e) { if (e.quantidade < e.quantidadeMinima) return 'abaixo'; if (e.quantidade > e.quantidadeMaxima) return 'acima'; return 'faixa'; }
    var q = $('#sQtd'), mi = $('#sMin'), ma = $('#sMax');
    function atual() {
      var e = { quantidade: +q.value, quantidadeMinima: +mi.value || 0, quantidadeMaxima: +ma.value || 0 };
      var lim = +q.max, pct = function (n) { return Math.max(0, Math.min(100, n / lim * 100)) + '%'; };
      var s = situacaoDe(e);
      $('#sFaixa').style.left = pct(e.quantidadeMinima);
      $('#sFaixa').style.width = Math.max(0, parseFloat(pct(e.quantidadeMaxima)) - parseFloat(pct(e.quantidadeMinima))) + '%';
      $('#sMarcaMin').style.left = pct(e.quantidadeMinima); $('#sMarcaMin span').textContent = 'mín ' + e.quantidadeMinima;
      $('#sMarcaMax').style.left = pct(e.quantidadeMaxima); $('#sMarcaMax span').textContent = 'máx ' + e.quantidadeMaxima;
      $('#sCaixa').style.left = pct(e.quantidade); $('#sCaixaN').textContent = e.quantidade;
      $('#sChamada').textContent = 'situacaoDe({ quantidade: ' + e.quantidade + ', quantidadeMinima: ' + e.quantidadeMinima + ', quantidadeMaxima: ' + e.quantidadeMaxima + ' }) === \'' + s + '\'';
      var selo = $('#sSelo'); selo.className = 'selo ' + s; selo.textContent = ROT[s];
    }
    [q, mi, ma].forEach(function (el) { el.addEventListener('input', atual); });
    atual();
    var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), inteiro = new Intl.NumberFormat('pt-BR');
    function fmt() {
      var bruto = $('#fValor').value, n = Number(bruto.replace(',', '.'));
      var linhas = isNaN(n) ? ['// digite um número, ex.: 1234.5'] : [
        "formatarMoeda(" + n + ")      → '" + moeda.format(n) + "'",
        "formatarInteiro(" + Math.round(n) + ")  → '" + inteiro.format(Math.round(n)) + "'",
        "precoParaTexto(" + n + ")     → '" + n.toFixed(2).replace('.', ',') + "'",
        "contar(" + Math.round(n) + ", 'item', 'itens') → '" + inteiro.format(Math.round(n)) + ' ' + (Math.round(n) === 1 ? 'item' : 'itens') + "'"
      ];
      $('#fSaida').innerHTML = realcarHtml(linhas.join('\n'), 'js');
    }
    $('#fValor').addEventListener('input', fmt); fmt();
  })();

  /* ---------- 14. cores e espaços lidos do tokens.css ---------- */
  (function () {
    var css = FONTES['src/styles/tokens.css'] || '';
    var cores = [], esp = [], m, re = /(--[\w-]+):\s*([^;]+);/g;
    while ((m = re.exec(css))) { if (/^#/.test(m[2].trim())) cores.push(m); else if (/^--esp/.test(m[1])) esp.push(m); }
    $('#amostras').innerHTML = cores.map(function (c) { return '<div class="amostra"><i style="background:' + esc(c[2].trim()) + '"></i><div><code>' + esc(c[1]) + '</code><span class="mono" style="color:var(--texto-2)">' + esc(c[2].trim()) + '</span></div></div>'; }).join('');
    $('#espacos').innerHTML = esp.map(function (e) { return '<div style="display:flex;align-items:center;gap:10px;margin:4px 0;font-size:.85rem"><code style="min-width:80px">' + esc(e[1]) + '</code><span style="display:inline-block;height:12px;width:' + esc(e[2].trim()) + ';background:var(--primaria);border-radius:2px"></span><span class="mono" style="color:var(--texto-2)">' + esc(e[2].trim()) + ' = ' + (parseFloat(e[2]) * 16) + 'px</span></div>'; }).join('');
  })();
})();
