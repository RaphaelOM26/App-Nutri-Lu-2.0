# Aprovação de planos em lote

Construída em 18/09/2026. É o que faz 10 mil pacientes caberem na agenda de
uma nutricionista: o **sistema monta o rascunho do mês** de cada paciente que
termina o cadastro, confere uma **lista verde**, e a Luciana aprova em grupo
quem passou e um a um quem precisa do olho dela. Nada é publicado sem o
clique dela.

Critérios e números vêm do documento "Critérios da aprovação em lote" (a
Luciana está preenchendo). Enquanto ela não devolve, valem os sugeridos.

## Onde mora

| Peça | Arquivo |
|---|---|
| Números e versão das regras | `backend/src/services/lote/regras.js` |
| Lista verde da paciente + checagens do plano | `backend/src/services/lote/elegibilidade.js` |
| Geração automática (trabalho `plano` da fila) | `backend/src/services/lote/gerar.js` |
| Gerador de rascunho no servidor (cópia fiel de `web/src/lib/gerarPlano.ts`) | `backend/src/services/plano/gerador.js` |
| Metas pela fórmula de bolso (meio da faixa) | `backend/src/services/plano/metas.js` |
| Livro PR no servidor (477 receitas) | `backend/data/receitas-praticas.json`, gerado por `scripts/receitas-praticas/importar.mjs` |
| Rotas | `backend/src/routes/lote.js` (`/nutri/lote/*`) |
| Painel | `web/src/pages/painel/Lote.tsx` (`/painel/planos/lote`), aviso no `PlanoEditor.tsx` |
| Teste ponta a ponta | `node backend/scripts/teste-lote.mjs` |

## O fluxo

1. **Cadastro termina** (ou a anamnese muda) → `pedirGeracao()` põe um trabalho
   `plano` na fila (90 s de espera; um pedido pendente por paciente). Uma
   varredura por hora pega quem ficou sem, quem está na última semana do mês
   de plano (renovação) e rascunhos intocados feitos com regras antigas.
2. **O trabalhador gera o mês**: 4 semanas (sementes 1..4), metas no meio da
   faixa da fórmula de bolso, mesmo filtro duro de restrição e alergia da web,
   ajuste fino de porções pra fechar o dia a ±5% da meta. Grava 4 linhas em
   `meal_plans` com `status = 'rascunho'`, `created_by = 'sistema'`,
   `elegivel_lote`, `motivos_revisao` e `regras_versao`.
3. **Lista verde** (`avaliarPaciente`): idade, gestante/amamentando, IMC, peso
   máximo, objetivo/atividade/sexo, meta coerente, alergia, restrição fora da
   lista, textos livres pelo dicionário de saúde, e a anamnese clínica
   (doença, medicamento, caneta, sintoma, exames, intestino, perda de
   controle, álcool, suplementos). **Qualquer coisa que não dê pra avaliar
   tira do lote.** A anamnese é lida só aqui e sai como motivo fechado
   ("caneta emagrecedora"), nunca o texto.
4. **Checagens do plano** (`checarPlano`): piso de calorias, déficit máximo
   contra o gasto estimado, dias fora da meta, receitas só do livro PR,
   restrição/alergia conferidas de novo, repetição, "não abro mão".
5. **Painel → Plano alimentar → Fila do sistema**: "Prontos pro lote" e
   "Precisam de você" (com os motivos). Ela marca até 10 do **mesmo perfil**
   (objetivo × sexo) e abre o lote; o sistema sorteia 2 de amostra.
6. Ela abre cada um da amostra no editor (`?lote=ID`) e clica em **"Conferi,
   está bom"**. Se salvar qualquer mudança em alguém da amostra, o lote
   inteiro **trava** e todos voltam pra revisão individual.
7. **Aprovar o lote**: cada plano é avaliado DE NOVO com as regras de agora;
   quem passa é publicado (`aprovacao = 'lote'`, `aprovado_por`), quem não
   passa volta pra fila com o motivo. WhatsApp pela fila e e-mail pela API.

## Calibração

O lote de um perfil só abre depois que a Luciana publicou **20 rascunhos do
sistema um a um** com **menos de 5% de correção** (`alterado_pela_nutri`:
comparação canônica do JSON, então publicar sem mexer não conta). A tela
mostra o placar por perfil. Até lá, tudo é individual: o rascunho do sistema
já aparece no editor com o veredito, e "Montar o plano do mês" abre ele.

## Mudar uma regra

Editar `regras.js`, subir a `VERSAO`, fazer push. Rascunhos intocados são
refeitos na varredura seguinte; lote aberto com versão antiga não aprova
(precisa cancelar e montar outro). Cada plano guarda a versão com que foi
avaliado.

## Conta em 10 mil pacientes

Gerar um mês leva ~50 ms de CPU (sem IA, sem rede). 10 mil cadastros no dia
do lançamento = ~8 min de trabalhador, em fila. A varredura horária é uma
query com índice parcial (`idx_meal_plans_sistema`). Custo de IA: zero.
