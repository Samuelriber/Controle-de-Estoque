# Controle de Estoque

Trabalho prático de **Desenvolvimento Web com Java e Spring Boot**.
Aplicação dividida em **Frontend** e **Backend**, com o backend expondo uma **API REST** que grava os dados em um **banco relacional (MySQL)**.

O tema escolhido foi o **Sistema de Controle de Estoque**, com duas entidades independentes:

| Entidade | O que guarda |
|---|---|
| **Mercadoria** | Os produtos: nome e preço. |
| **Estoque** | Quanto de cada mercadoria existe, as quantidades mínima e máxima e onde ela está guardada. |

---

## Sumário

1. [Estado do projeto](#1-estado-do-projeto)
2. [Tecnologias](#2-tecnologias)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Como o backend funciona](#4-como-o-backend-funciona)
5. [Banco de dados](#5-banco-de-dados)
6. [Endpoints da API](#6-endpoints-da-api)
7. [Validações e mensagens de erro](#7-validações-e-mensagens-de-erro)
8. [Como executar](#8-como-executar)
9. [Documentação interativa (Swagger)](#9-documentação-interativa-swagger)
10. [Pasta Apresentação](#10-pasta-apresentação)
11. [Problemas comuns](#11-problemas-comuns)

---

## 1. Estado do projeto

| Item exigido no trabalho | Situação |
|---|---|
| Backend em Java + Spring Boot | Pronto |
| Duas entidades com armazenamento independente | Pronto |
| API REST com GET, POST, PUT e DELETE | Pronto |
| Banco relacional com chaves primárias e estrangeira | Pronto |
| Script SQL de criação das tabelas | Pronto (`ScriptBancoPweb.sql`) |
| Validações e mensagens de resultado | Pronto |
| Documentação da API (Swagger) | Pronto |
| **Frontend** (páginas de cadastro, listagem, alteração e exclusão) | **A fazer** |

> O frontend ainda não foi desenvolvido. Enquanto isso, a API pode ser testada pelo Swagger (veja a seção 9).

---

## 2. Tecnologias

| Tecnologia | Para que serve no projeto |
|---|---|
| **Java 21** | Linguagem do backend. |
| **Spring Boot 4.1.2** | Framework que monta o servidor web e liga as partes da aplicação. |
| **Spring Web (MVC)** | Cria os controllers e os endpoints REST. |
| **Spring Data JPA / Hibernate** | Conversa com o banco sem precisar escrever SQL à mão. |
| **MySQL 8** | Banco de dados relacional. |
| **Bean Validation** | Valida os dados recebidos (`@NotBlank`, `@NotNull`...). |
| **Lombok** | Gera getters, setters e construtores automaticamente. |
| **springdoc-openapi (Swagger UI)** | Gera a documentação interativa da API. |
| **Maven (mvnw)** | Gerencia as dependências e compila o projeto. |

---

## 3. Estrutura de pastas

```
estoque/
├── README.md                  este arquivo
├── ScriptBancoPweb.sql        script de criação do banco e das tabelas
├── Apresentação/              página (HTML, CSS, JS) que explica o backend
│   ├── index.html
│   ├── style.css
│   └── script.js
└── backend/                   projeto Spring Boot
    ├── pom.xml                dependências do projeto
    └── src/main/
        ├── resources/
        │   └── application.properties     configuração do banco
        └── java/com/estoque/backend/
            ├── BackendApplication.java    ponto de partida da aplicação
            ├── config/       OpenApiConfig            título e descrição do Swagger
            ├── controller/   MercadoriaController, EstoqueController
            ├── service/      MercadoriaService, EstoqueService
            ├── repository/   MercadoriaRepository, EstoqueRepository
            ├── model/        Mercadoria, Estoque      (viram tabelas)
            ├── dto/          *Request e *Response     (formato do JSON)
            └── exception/    GlobalExceptionHandler e exceções próprias
```

---

## 4. Como o backend funciona

O backend é dividido em **camadas**. Cada camada tem uma responsabilidade, e uma só fala com a camada vizinha.

```
Cliente  ──►  Controller  ──►  Service  ──►  Repository  ──►  MySQL
(navegador,    recebe o         regras de      acesso ao        guarda os
 Swagger)      HTTP e valida    negócio        banco            dados
```

### 4.1 Controller (`controller/`)
Recebe a requisição HTTP, valida o corpo (`@Valid`) e chama o service. Não tem regra de negócio.
Cada controller tem 5 métodos: `listar`, `buscar`, `criar`, `atualizar` e `excluir`.

| Anotação | Significado |
|---|---|
| `@RestController` | A classe responde requisições HTTP e devolve JSON. |
| `@RequestMapping("/mercadorias")` | Prefixo da URL de todos os métodos da classe. |
| `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` | Ligam cada método ao verbo HTTP. |
| `@PathVariable` | Lê o `id` que vem na URL (`/mercadorias/3`). |
| `@RequestBody` | Lê o JSON enviado no corpo da requisição. |
| `@Valid` | Manda o Spring validar o JSON antes de entrar no método. |

### 4.2 Service (`service/`)
É onde ficam as **regras de negócio**. Exemplos reais deste projeto:
- Ao cadastrar um estoque, a **mercadoria precisa existir** (senão devolve erro 404).
- A **quantidade máxima não pode ser menor que a mínima** (senão devolve erro 400).
- O nome e a localização têm os espaços das pontas removidos (`trim`).

`@Transactional` garante que a operação acontece por inteiro ou não acontece (se der erro no meio, o banco volta ao estado anterior).

### 4.3 Repository (`repository/`)
São interfaces que **estendem `JpaRepository`**. Sem escrever nenhum SQL, o Spring entrega `findAll`, `findById`, `save`, `deleteById` e `existsById`.

```java
public interface MercadoriaRepository extends JpaRepository<Mercadoria, Integer> { }
```
Os dois tipos entre `< >` são a **entidade** e o **tipo do id**.

### 4.4 Model (`model/`)
As classes que representam as **tabelas**. Cada atributo vira uma coluna.

| Anotação | Significado |
|---|---|
| `@Entity` | A classe é uma tabela do banco. |
| `@Table(name = "mercadoria")` | Nome da tabela. |
| `@Id` | Chave primária. |
| `@GeneratedValue(strategy = IDENTITY)` | O banco gera o id sozinho (auto increment). |
| `@Column(...)` | Liga o atributo à coluna e define regras (`nullable`, `length`...). |
| `@ManyToOne` + `@JoinColumn` | Relacionamento: **muitos estoques para uma mercadoria** (chave estrangeira `id_merc`). |

### 4.5 DTO (`dto/`)
**DTO** (Data Transfer Object) é o formato do JSON que entra e sai da API. Eles evitam expor a entidade diretamente.

| Classe | Função |
|---|---|
| `MercadoriaRequest` | O que o cliente envia ao cadastrar ou alterar uma mercadoria. Traz as validações. |
| `MercadoriaResponse` | O que a API devolve. |
| `EstoqueRequest` | O que o cliente envia para um estoque (inclui `idMerc`, a mercadoria escolhida). |
| `EstoqueResponse` | O que a API devolve, incluindo `idMerc` e `nomeMercadoria`. |

### 4.6 Exceções (`exception/`)
Todos os erros passam pelo `GlobalExceptionHandler`, que os transforma em respostas JSON padronizadas, em vez de deixar o Spring mostrar uma página de erro.

| Exceção | Código HTTP | Quando acontece |
|---|---|---|
| `RecursoNaoEncontradoException` | 404 | O id pedido não existe. |
| `RegraNegocioException` | 400 | Violação de regra (ex.: máximo menor que mínimo). |
| `MethodArgumentNotValidException` | 400 | O JSON enviado falhou nas validações. |
| `DataIntegrityViolationException` | 409 | Tentativa de excluir uma mercadoria que ainda tem estoque. |

---

## 5. Banco de dados

Banco: **MySQL**. Nome do banco: `sistema_estoque`.
O script completo está em [`ScriptBancoPweb.sql`](ScriptBancoPweb.sql).

```
┌──────────────────────┐          ┌─────────────────────────────┐
│      mercadoria      │          │           estoque           │
├──────────────────────┤          ├─────────────────────────────┤
│ id_merc  (PK)        │◄─────────│ id_estoque   (PK)           │
│ nome                 │   1 : N  │ quantidade                  │
│ preco                │          │ quant_min                   │
└──────────────────────┘          │ quant_max                   │
                                  │ localizacao                 │
                                  │ id_merc      (FK) ──────────┘
                                  └─────────────────────────────┘
```

- `estoque.id_merc` é a **chave estrangeira** para `mercadoria.id_merc`.
- Uma mercadoria pode ter vários registros de estoque (por exemplo, em locais diferentes).
- O banco também protege os dados com regras `CHECK`: a quantidade não pode ser negativa e `quant_max` não pode ser menor que `quant_min`.
- Os ids são gerados automaticamente (`AUTO_INCREMENT`).

---

## 6. Endpoints da API

URL base: `http://localhost:8080`

### Mercadorias

| Método | Rota | O que faz | Resposta |
|---|---|---|---|
| GET | `/mercadorias` | Lista todas | 200 |
| GET | `/mercadorias/{id}` | Busca uma pelo id | 200 ou 404 |
| POST | `/mercadorias` | Cadastra | 201 |
| PUT | `/mercadorias/{id}` | Altera | 200 ou 404 |
| DELETE | `/mercadorias/{id}` | Exclui | 204, 404 ou 409 |

### Estoques

| Método | Rota | O que faz | Resposta |
|---|---|---|---|
| GET | `/estoques` | Lista todos | 200 |
| GET | `/estoques/{id}` | Busca um pelo id | 200 ou 404 |
| POST | `/estoques` | Cadastra | 201 ou 404 |
| PUT | `/estoques/{id}` | Altera | 200 ou 404 |
| DELETE | `/estoques/{id}` | Exclui | 204 ou 404 |

### Exemplos de JSON

**Cadastrar mercadoria** (`POST /mercadorias`)
```json
{
  "nome": "Arroz 5kg",
  "preco": 25.90
}
```
Resposta (201):
```json
{
  "id": 1,
  "nome": "Arroz 5kg",
  "preco": 25.90
}
```

**Cadastrar estoque** (`POST /estoques`), usando o `id` da mercadoria em `idMerc`:
```json
{
  "quantidade": 40,
  "quantidadeMinima": 10,
  "quantidadeMaxima": 100,
  "localizacao": "Prateleira A1",
  "idMerc": 1
}
```
Resposta (201):
```json
{
  "id": 1,
  "quantidade": 40,
  "quantidadeMinima": 10,
  "quantidadeMaxima": 100,
  "localizacao": "Prateleira A1",
  "idMerc": 1,
  "nomeMercadoria": "Arroz 5kg"
}
```

---

## 7. Validações e mensagens de erro

Todos os erros voltam no mesmo formato:

```json
{
  "status": 400,
  "mensagem": "Dados inválidos",
  "campos": {
    "nome": "O nome é obrigatório"
  }
}
```

| Campo | Regras |
|---|---|
| Mercadoria `nome` | Obrigatório, no máximo 100 caracteres. |
| Mercadoria `preco` | Obrigatório, não pode ser negativo, até 8 dígitos inteiros e 2 decimais. |
| Estoque `quantidade`, `quantidadeMinima`, `quantidadeMaxima` | Obrigatórios, não podem ser negativos. |
| Estoque `quantidadeMaxima` | Não pode ser menor que a `quantidadeMinima`. |
| Estoque `localizacao` | Obrigatória, no máximo 100 caracteres. |
| Estoque `idMerc` | Obrigatório, e a mercadoria precisa existir. |

Exemplos de mensagens: `Mercadoria não encontrada: id 99`, `A quantidade máxima não pode ser menor que a quantidade mínima`, `Operação não permitida: o registro está relacionado a outros dados (ex.: mercadoria com estoque cadastrado)`.

---

## 8. Como executar

### Pré-requisitos
- **Java 21** (`java -version`)
- **MySQL 8** em execução na porta 3306
- Não precisa instalar o Maven, pois o projeto traz o `mvnw`

### Passo 1: criar o banco
Execute o script `ScriptBancoPweb.sql` no MySQL. Ele cria o banco `sistema_estoque` e as duas tabelas.

Pelo terminal:
```bash
mysql -u root -p < ScriptBancoPweb.sql
```
Ou abra o arquivo no MySQL Workbench e execute.

### Passo 2: conferir a configuração
O arquivo `backend/src/main/resources/application.properties` está assim:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sistema_estoque
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
```
Se o seu MySQL tiver outro usuário ou senha, altere `username` e `password`.

> `ddl-auto=validate` significa que o Spring **não cria** as tabelas, apenas confere se elas existem como esperado. Por isso o script do Passo 1 é obrigatório.

### Passo 3: rodar o backend
Dentro da pasta `backend`:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```
(No Linux ou Mac: `./mvnw spring-boot:run`.)

Quando aparecer `Started BackendApplication`, a API está no ar em `http://localhost:8080`.

Para testar, abra no navegador `http://localhost:8080/mercadorias`. Uma lista vazia (`[]`) já mostra que está funcionando.

### Rodando pelo IntelliJ
Abra a pasta do projeto, espere o Maven baixar as dependências e clique no botão de execução ao lado do método `main` da classe `BackendApplication`.
O projeto usa Lombok: se o IntelliJ marcar erros nos getters, ative *Settings > Build > Compiler > Annotation Processors > Enable annotation processing*.

---

## 9. Documentação interativa (Swagger)

Com o backend rodando, abra:

```
http://localhost:8080/swagger-ui/index.html
```

Lá aparecem os grupos **Mercadorias** e **Estoques**, e dá para testar cada endpoint direto no navegador:
1. Clique no endpoint (ex.: `POST /mercadorias`).
2. Clique em **Try it out**.
3. Edite o JSON de exemplo.
4. Clique em **Execute** e veja a resposta.

A especificação em JSON fica em `http://localhost:8080/v3/api-docs`.

Para cadastrar um estoque, crie primeiro uma mercadoria, pois o estoque precisa do `idMerc` de uma mercadoria existente.

---

## 10. Pasta Apresentação

A pasta [`Apresentação`](Apresentação/index.html) tem uma página (HTML, CSS e JavaScript) que explica **cada parte do backend**, feita para apoiar a apresentação em aula.

Para abrir, dê um duplo clique em `Apresentação/index.html`. Não precisa de servidor nem de internet.

Ela contém:
- O caminho de uma requisição, passo a passo, por todas as camadas.
- A explicação de cada camada, com trechos do código real.
- O desenho das tabelas e do relacionamento.
- Um simulador com exemplos de requisição e resposta, incluindo os erros (404, 400, 409).

---

## 11. Problemas comuns

| Problema | Causa e solução |
|---|---|
| `Port 8080 was already in use` | Já existe um backend rodando. Encerre o anterior (Ctrl + C no terminal ou o botão de parar no IntelliJ). |
| `Communications link failure` ou `Connection refused` | O MySQL não está rodando na porta 3306. |
| `Access denied for user 'root'` | Usuário ou senha do `application.properties` não batem com o seu MySQL. |
| `Schema-validation: missing table` | O script `ScriptBancoPweb.sql` ainda não foi executado. |
| `404` em `/swagger-ui/index.html` | A dependência do springdoc não foi carregada: recarregue o Maven e reinicie o backend. |
| Getters e setters em vermelho no IntelliJ | Ative o *Annotation Processing* para o Lombok (veja a seção 8). |
| Erro 409 ao excluir uma mercadoria | Ela ainda tem estoque cadastrado: exclua o estoque primeiro. |

---

## Observação de segurança

A senha do banco (`root`) está escrita no `application.properties` para facilitar a execução do trabalho em sala. Em um projeto real, isso deve ficar em variáveis de ambiente e nunca ir para o repositório.
