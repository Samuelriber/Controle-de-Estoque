(function () {
  "use strict";

  /* =========================================================
     Utilidades
     ========================================================= */
  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };

  function escapar(texto) {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Coloridor de codigo simples (comentarios, textos, anotacoes e palavras-chave) */
  var PADRAO = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|(@\w+)|\b(public|private|class|interface|record|return|new|if|throw|extends|final|void|import|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|CONSTRAINT|CHECK|AND|INT|VARCHAR|DECIMAL|AUTO_INCREMENT)\b/g;

  function colorir(texto) {
    var saida = "";
    var ultimo = 0;
    var m;
    PADRAO.lastIndex = 0;
    while ((m = PADRAO.exec(texto)) !== null) {
      saida += escapar(texto.slice(ultimo, m.index));
      var classe = m[1] ? "tk-com" : m[2] ? "tk-str" : m[3] ? "tk-anot" : "tk-pal";
      saida += '<span class="' + classe + '">' + escapar(m[0]) + "</span>";
      ultimo = m.index + m[0].length;
    }
    saida += escapar(texto.slice(ultimo));
    return saida;
  }

  function mostrarCodigo(pre, texto) {
    var code = $("code", pre);
    code.innerHTML = colorir(texto);
    pre.dataset.texto = texto;
  }

  /* =========================================================
     Tema claro / escuro
     ========================================================= */
  var raiz = document.documentElement;
  try {
    var salvo = localStorage.getItem("tema-estoque");
    if (salvo === "claro" || salvo === "escuro") { raiz.setAttribute("data-tema", salvo); }
  } catch (e) { /* sem armazenamento: segue o tema do sistema */ }

  $("#temaBtn").addEventListener("click", function () {
    var atual = raiz.getAttribute("data-tema");
    if (!atual) {
      atual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
    }
    var novo = atual === "escuro" ? "claro" : "escuro";
    raiz.setAttribute("data-tema", novo);
    try { localStorage.setItem("tema-estoque", novo); } catch (e) { /* ignora */ }
  });

  /* =========================================================
     Navegacao entre secoes
     ========================================================= */
  var links = $$(".menu a");
  var ids = links.map(function (a) { return a.dataset.secao; });
  var menu = $("#menu");
  var menuBtn = $("#menuBtn");
  var atualId = ids[0];

  function irPara(id, atualizarHash) {
    if (ids.indexOf(id) === -1) { id = ids[0]; }
    atualId = id;
    $$(".secao").forEach(function (s) { s.classList.toggle("ativa", s.id === id); });
    links.forEach(function (a) { a.classList.toggle("ativo", a.dataset.secao === id); });
    var pos = ids.indexOf(id);
    $("#secAnt").disabled = pos === 0;
    $("#secProx").disabled = pos === ids.length - 1;
    if (atualizarHash) { history.replaceState(null, "", "#" + id); }
    menu.classList.remove("aberto");
    menuBtn.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      irPara(a.dataset.secao, true);
    });
  });

  $("#secAnt").addEventListener("click", function () {
    var i = ids.indexOf(atualId);
    if (i > 0) { irPara(ids[i - 1], true); }
  });
  $("#secProx").addEventListener("click", function () {
    var i = ids.indexOf(atualId);
    if (i < ids.length - 1) { irPara(ids[i + 1], true); }
  });

  menuBtn.addEventListener("click", function () {
    var aberto = menu.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.target.closest && ev.target.closest("input, textarea, select")) { return; }
    var i = ids.indexOf(atualId);
    if (ev.key === "ArrowRight" && i < ids.length - 1) { irPara(ids[i + 1], true); }
    if (ev.key === "ArrowLeft" && i > 0) { irPara(ids[i - 1], true); }
  });

  /* =========================================================
     Camadas (visao geral)
     ========================================================= */
  var TEXTO_CAMADAS = {
    controller: "<strong>Controller:</strong> a porta de entrada. Recebe a requisição HTTP (GET, POST, PUT ou DELETE), valida o JSON com <code>@Valid</code> e chama o service. Não tem regra de negócio.",
    service: "<strong>Service:</strong> onde ficam as regras de negócio. Exemplo: o estoque só pode ser cadastrado se a mercadoria existir, e o máximo não pode ser menor que o mínimo.",
    repository: "<strong>Repository:</strong> conversa com o banco. É uma interface que estende <code>JpaRepository</code>, e o Spring gera o SQL (<code>findAll</code>, <code>save</code>, <code>deleteById</code>...).",
    banco: "<strong>MySQL:</strong> guarda os dados nas tabelas <code>mercadoria</code> e <code>estoque</code>, ligadas pela chave estrangeira <code>id_merc</code>."
  };

  $$(".camada").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".camada").forEach(function (b) { b.classList.remove("ativa"); });
      btn.classList.add("ativa");
      $("#camadaTexto").innerHTML = TEXTO_CAMADAS[btn.dataset.camada];
    });
  });

  /* =========================================================
     Caminho de uma requisicao (POST /estoques)
     ========================================================= */
  var PASSOS = [
    {
      nome: "Cliente",
      titulo: "O cliente envia a requisição",
      texto: "O navegador, o Swagger ou o frontend faz um POST para /estoques com o JSON no corpo. Repare que o cliente só informa o idMerc: o id do estoque será gerado pelo banco.",
      codigo: 'POST http://localhost:8080/estoques\n\n{\n  "quantidade": 40,\n  "quantidadeMinima": 10,\n  "quantidadeMaxima": 100,\n  "localizacao": "Prateleira A1",\n  "idMerc": 1\n}'
    },
    {
      nome: "Controller",
      titulo: "O controller recebe e valida",
      texto: "O @PostMapping casa com o POST /estoques. O @RequestBody transforma o JSON em um EstoqueRequest, e o @Valid confere as validações (campos obrigatórios, números não negativos). Se algo falhar, o GlobalExceptionHandler devolve 400 e o fluxo para aqui.",
      codigo: '@PostMapping\n@ResponseStatus(HttpStatus.CREATED)\npublic EstoqueResponse criar(@Valid @RequestBody EstoqueRequest request) {\n    return service.criar(request);\n}'
    },
    {
      nome: "Service",
      titulo: "O service aplica as regras",
      texto: "Duas regras: o máximo não pode ser menor que o mínimo (senão, erro 400), e a mercadoria informada em idMerc precisa existir (senão, erro 404). Depois preenche a entidade Estoque com os dados.",
      codigo: 'if (request.quantidadeMaxima() < request.quantidadeMinima()) {\n    throw new RegraNegocioException("A quantidade máxima não pode ser menor que a quantidade mínima");\n}\n\nMercadoria mercadoria = mercadoriaRepository.findById(request.idMerc())\n    .orElseThrow(() -> new RecursoNaoEncontradoException("Mercadoria não encontrada: id " + request.idMerc()));'
    },
    {
      nome: "Repository",
      titulo: "O repository salva",
      texto: "O service chama save(). O Spring Data JPA e o Hibernate montam o INSERT sozinhos, a partir da entidade Estoque. Tudo roda dentro de uma transação (@Transactional): ou grava por inteiro, ou nada é gravado.",
      codigo: 'estoqueRepository.save(estoque);\n\n// SQL gerado pelo Hibernate:\n// INSERT INTO estoque (quantidade, quant_min, quant_max, localizacao, id_merc)\n// VALUES (40, 10, 100, \'Prateleira A1\', 1)'
    },
    {
      nome: "MySQL",
      titulo: "O banco grava e confere",
      texto: "O MySQL gera o id_estoque (AUTO_INCREMENT) e confere as restrições: a chave estrangeira id_merc precisa existir em mercadoria, e os CHECK impedem quantidades negativas e máximo menor que o mínimo.",
      codigo: 'FOREIGN KEY (id_merc) REFERENCES mercadoria(id_merc),\nCONSTRAINT chk_quantidade CHECK (quantidade >= 0),\nCONSTRAINT chk_limites CHECK (quant_min >= 0 AND quant_max >= quant_min)'
    },
    {
      nome: "Resposta",
      titulo: "A resposta volta ao cliente",
      texto: "O service converte a entidade em EstoqueResponse (que traz também o nome da mercadoria) e o controller responde com o status 201 Created.",
      codigo: 'HTTP 201 Created\n\n{\n  "id": 1,\n  "quantidade": 40,\n  "quantidadeMinima": 10,\n  "quantidadeMaxima": 100,\n  "localizacao": "Prateleira A1",\n  "idMerc": 1,\n  "nomeMercadoria": "Arroz 5kg"\n}'
    }
  ];

  var passoAtual = 0;
  var listaPassos = $("#passos");

  PASSOS.forEach(function (p, i) {
    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = "<b>" + (i + 1) + "</b><span>" + p.nome + "</span>";
    btn.addEventListener("click", function () { mostrarPasso(i); });
    li.appendChild(btn);
    listaPassos.appendChild(li);
  });

  function mostrarPasso(i) {
    passoAtual = i;
    var p = PASSOS[i];
    $("#passoNum").textContent = i + 1;
    $("#passoTitulo").textContent = p.titulo;
    $("#passoTexto").textContent = p.texto;
    mostrarCodigo($("#passoCodigo"), p.codigo);
    $("#passoContador").textContent = "Passo " + (i + 1) + " de " + PASSOS.length;
    $("#passoAnt").disabled = i === 0;
    $("#passoProx").disabled = i === PASSOS.length - 1;
    $$("li", listaPassos).forEach(function (li, j) {
      li.classList.toggle("atual", j === i);
      li.classList.toggle("feito", j < i);
    });
  }

  $("#passoAnt").addEventListener("click", function () { if (passoAtual > 0) { mostrarPasso(passoAtual - 1); } });
  $("#passoProx").addEventListener("click", function () { if (passoAtual < PASSOS.length - 1) { mostrarPasso(passoAtual + 1); } });

  /* =========================================================
     Simulador de requisicoes (exemplos ilustrativos)
     ========================================================= */
  var EXEMPLOS = [
    {
      metodo: "GET", url: "/mercadorias", titulo: "Listar mercadorias",
      desc: "Devolve todas as mercadorias cadastradas.",
      req: null, status: 200,
      res: '[\n  { "id": 1, "nome": "Arroz 5kg", "preco": 25.90 },\n  { "id": 2, "nome": "Feijão 1kg", "preco": 8.49 }\n]',
      quem: "Quem responde: MercadoriaController.listar() → MercadoriaService.listar() → findAll()."
    },
    {
      metodo: "GET", url: "/mercadorias/1", titulo: "Buscar uma mercadoria",
      desc: "Devolve a mercadoria de id 1.",
      req: null, status: 200,
      res: '{ "id": 1, "nome": "Arroz 5kg", "preco": 25.90 }',
      quem: "Quem responde: MercadoriaService.buscar(1) → findById(1)."
    },
    {
      metodo: "GET", url: "/mercadorias/99", titulo: "Buscar id que não existe",
      desc: "O id 99 não está no banco.",
      req: null, status: 404,
      res: '{\n  "status": 404,\n  "mensagem": "Mercadoria não encontrada: id 99",\n  "campos": null\n}',
      quem: "Quem responde: o service lança RecursoNaoEncontradoException e o GlobalExceptionHandler a transforma em 404."
    },
    {
      metodo: "POST", url: "/mercadorias", titulo: "Cadastrar mercadoria",
      desc: "Cria uma mercadoria nova. O id é gerado pelo banco.",
      req: '{\n  "nome": "Macarrão 500g",\n  "preco": 5.75\n}', status: 201,
      res: '{ "id": 3, "nome": "Macarrão 500g", "preco": 5.75 }',
      quem: "Quem responde: MercadoriaController.criar() com @ResponseStatus(CREATED)."
    },
    {
      metodo: "POST", url: "/mercadorias", titulo: "Cadastrar com dados inválidos",
      desc: "Nome vazio e preço negativo.",
      req: '{\n  "nome": "",\n  "preco": -5\n}', status: 400,
      res: '{\n  "status": 400,\n  "mensagem": "Dados inválidos",\n  "campos": {\n    "nome": "O nome é obrigatório",\n    "preco": "O preço não pode ser negativo"\n  }\n}',
      quem: "Quem responde: o @Valid reprova o JSON antes de entrar no método, e o GlobalExceptionHandler monta a resposta."
    },
    {
      metodo: "PUT", url: "/mercadorias/1", titulo: "Alterar mercadoria",
      desc: "Troca o nome e o preço da mercadoria 1.",
      req: '{\n  "nome": "Arroz 5kg Tipo 1",\n  "preco": 27.50\n}', status: 200,
      res: '{ "id": 1, "nome": "Arroz 5kg Tipo 1", "preco": 27.50 }',
      quem: "Quem responde: MercadoriaService.atualizar() busca a existente e usa o mesmo preencher() do cadastro."
    },
    {
      metodo: "DELETE", url: "/mercadorias/2", titulo: "Excluir mercadoria sem estoque",
      desc: "A mercadoria 2 não tem nenhum estoque ligado a ela.",
      req: null, status: 204, res: null,
      quem: "Quem responde: 204 No Content, ou seja, deu certo e não há corpo na resposta."
    },
    {
      metodo: "DELETE", url: "/mercadorias/1", titulo: "Excluir mercadoria com estoque",
      desc: "A mercadoria 1 ainda tem um estoque cadastrado.",
      req: null, status: 409,
      res: '{\n  "status": 409,\n  "mensagem": "Operação não permitida: o registro está relacionado a outros dados (ex.: mercadoria com estoque cadastrado)",\n  "campos": null\n}',
      quem: "Quem responde: a chave estrangeira do MySQL recusa a exclusão, e o handler de DataIntegrityViolationException devolve 409."
    },
    {
      metodo: "GET", url: "/estoques", titulo: "Listar estoques",
      desc: "Cada estoque já vem com o nome da mercadoria.",
      req: null, status: 200,
      res: '[\n  {\n    "id": 1,\n    "quantidade": 40,\n    "quantidadeMinima": 10,\n    "quantidadeMaxima": 100,\n    "localizacao": "Prateleira A1",\n    "idMerc": 1,\n    "nomeMercadoria": "Arroz 5kg"\n  }\n]',
      quem: "Quem responde: EstoqueResponse.de() copia o nome da mercadoria relacionada."
    },
    {
      metodo: "POST", url: "/estoques", titulo: "Cadastrar estoque",
      desc: "Guarda 40 unidades da mercadoria 1 na prateleira A1.",
      req: '{\n  "quantidade": 40,\n  "quantidadeMinima": 10,\n  "quantidadeMaxima": 100,\n  "localizacao": "Prateleira A1",\n  "idMerc": 1\n}', status: 201,
      res: '{\n  "id": 1,\n  "quantidade": 40,\n  "quantidadeMinima": 10,\n  "quantidadeMaxima": 100,\n  "localizacao": "Prateleira A1",\n  "idMerc": 1,\n  "nomeMercadoria": "Arroz 5kg"\n}',
      quem: "Quem responde: EstoqueService.criar() depois de conferir as regras e buscar a mercadoria."
    },
    {
      metodo: "POST", url: "/estoques", titulo: "Máximo menor que o mínimo",
      desc: "Quebra a regra de negócio do estoque.",
      req: '{\n  "quantidade": 5,\n  "quantidadeMinima": 50,\n  "quantidadeMaxima": 20,\n  "localizacao": "Prateleira B2",\n  "idMerc": 1\n}', status: 400,
      res: '{\n  "status": 400,\n  "mensagem": "A quantidade máxima não pode ser menor que a quantidade mínima",\n  "campos": null\n}',
      quem: "Quem responde: o service lança RegraNegocioException, convertida em 400 pelo handler."
    },
    {
      metodo: "POST", url: "/estoques", titulo: "Mercadoria que não existe",
      desc: "O idMerc 99 não está cadastrado.",
      req: '{\n  "quantidade": 10,\n  "quantidadeMinima": 1,\n  "quantidadeMaxima": 50,\n  "localizacao": "Prateleira C3",\n  "idMerc": 99\n}', status: 404,
      res: '{\n  "status": 404,\n  "mensagem": "Mercadoria não encontrada: id 99",\n  "campos": null\n}',
      quem: "Quem responde: o service não acha a mercadoria no repository e lança RecursoNaoEncontradoException."
    }
  ];

  var lista = $("#simLista");

  EXEMPLOS.forEach(function (ex, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sim-item";
    btn.setAttribute("role", "option");
    btn.innerHTML = '<span class="metodo m-' + ex.metodo + '">' + ex.metodo + "</span>" +
      "<span>" + ex.titulo + "<small>" + ex.url + "</small></span>";
    btn.addEventListener("click", function () { mostrarExemplo(i); });
    lista.appendChild(btn);
  });

  function classeStatus(codigo) {
    if (codigo >= 200 && codigo < 300) { return "s-2"; }
    if (codigo === 409) { return "s-409"; }
    return "s-4";
  }

  function mostrarExemplo(i) {
    var ex = EXEMPLOS[i];
    $$(".sim-item", lista).forEach(function (b, j) {
      b.classList.toggle("ativo", j === i);
      b.setAttribute("aria-selected", j === i ? "true" : "false");
    });
    var metodo = $("#simMetodo");
    metodo.textContent = ex.metodo;
    metodo.className = "metodo m-" + ex.metodo;
    $("#simUrl").textContent = ex.url;
    $("#simDesc").textContent = ex.desc;
    mostrarCodigo($("#simReq"), ex.req === null ? "(sem corpo)" : ex.req);
    mostrarCodigo($("#simRes"), ex.res === null ? "(sem corpo)" : ex.res);
    var st = $("#simStatus");
    st.textContent = ex.status;
    st.className = "status-http " + classeStatus(ex.status);
    $("#simQuem").textContent = ex.quem;
  }

  /* =========================================================
     Colorir os blocos de codigo fixos e criar botao copiar
     ========================================================= */
  $$("pre.codigo").forEach(function (pre) {
    if (pre.id) { return; }
    var code = $("code", pre);
    mostrarCodigo(pre, code.textContent);
  });

  $$("pre[data-copiar]").forEach(function (pre) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copiar";
    btn.textContent = "Copiar";
    btn.addEventListener("click", function () {
      var texto = pre.dataset.texto || "";
      function pronto() {
        btn.textContent = "Copiado";
        setTimeout(function () { btn.textContent = "Copiar"; }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(pronto, function () { btn.textContent = "Erro"; });
      } else {
        var area = document.createElement("textarea");
        area.value = texto;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); pronto(); } catch (e) { btn.textContent = "Erro"; }
        document.body.removeChild(area);
      }
    });
    pre.appendChild(btn);
  });

  /* =========================================================
     Inicio
     ========================================================= */
  mostrarPasso(0);
  mostrarExemplo(0);
  var inicial = location.hash ? location.hash.slice(1) : ids[0];
  irPara(inicial, false);
  window.scrollTo(0, 0);
})();
