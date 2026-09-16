# Nutri Lu 2.0 — regras do projeto (backend + app)

## Premissa de escala (definida em 17/09/2026)

A nutricionista Luciana tem ~300 mil seguidores no Instagram e ainda não vende
produto. Quando a venda abrir, a estimativa é de **10 mil pacientes em poucos
meses**. Toda ação, estrutura, orçamento e ferramenta deve ser dimensionada
pra esse volume, não pro beta dos 20.

Na prática, antes de propor ou implementar qualquer coisa:

- **Faça a conta em 10 mil pacientes**: custo por mês, pedidos por dia, tempo
  de resposta, tempo humano. Se só funciona pra 100, diga isso na hora.
- **Listas da equipe são paginadas e filtradas no servidor** (`LIMIT`/cursor,
  contadores por query, índices). Nunca "carrega tudo e filtra no navegador".
- **Trabalho pesado sai do request**: dashboard, síntese por IA, e-mail em
  massa, notificações, ranking de receitas → cache com validade
  (`painel_cache`), job agendado ou fila. Publicar/enviar nunca bloqueia a tela.
- **Custo por paciente por mês é a métrica**: IA (chat da Lu, síntese), e-mail,
  R2, Postgres, Railway. Toda funcionalidade que chama IA tem teto de uso por
  conta e custo estimado registrado.
- **O gargalo humano é a Lu**: 10 mil planos por mês não se aprova à mão.
  Desenhe pra aprovação em lote, regras por perfil, geração automática com
  revisão por exceção e mais de uma nutri (papel `nutri` não é uma pessoa só).
- **Migrações e dados pensados pra volume**: índice em toda coluna de filtro,
  chave composta onde há "um por paciente por X" (ex.: avaliação por
  `(user_id, code)`), nada de JSON gigante lido inteiro por request.

## Regras já em vigor (não mudam com a escala)

- Dado clínico da anamnese nunca entra em prompt de IA nem no bot; no
  dashboard só agregado, com corte "menos de 5".
- Restrição e alergia são filtro DURO em código (`permitida`), nunca instrução
  pra modelo. Texto livre é classificado por dicionário, não por IA.
- Plano da Lu e trocas da cliente saem SÓ do livro de receitas práticas (PR);
  o livro da nutri (NL) é pra quem quer cozinhar algo elaborado.
- Papel do usuário (`users.role`) é lido do banco a cada pedido, nunca do JWT.
- `.env` não se lê nem se imprime.
