# Custos por paciente e por cenário (gerado em 2026-09-17)

Planilha viva: `docs/custos-10mil-pacientes.xlsx` (aba **Premissas** é editável; o resto recalcula).
Regenerar: `node <scratchpad>/planilha-custos.mjs` (script fica fora do repo; copie pra `scripts/` se quiser versionar).

## Custo variável por paciente por mês (câmbio 5.5)

| Item | US$ | R$ |
|---|---:|---:|
| Chat da Luna (IA, 20 msgs) | 0.0675 | 0.37 |
| Foto do prato (IA, 30 fotos) | 0.0742 | 0.41 |
| Rascunho de resposta pra Luciana (IA, 2 dúvidas) | 0.0060 | 0.03 |
| R2 (fotos guardadas + operações) | 0.0006 | 0.00 |
| WhatsApp (0 até existir) | 0.0000 | 0.00 |
| **Total variável** | **0.1484** | **0.82** |

## Cenários (US$/mês → R$/mês)

| Pacientes | IA+R2 | E-mail | Railway | Total US$ | Total R$ | R$/paciente | Horas de nutri | Nutris |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.000 | US$ 148,38 | US$ 20,00 | US$ 92,25 | US$ 261,21 | R$ 1.436,68 | R$ 1,44 | 200 | 1.4 |
| 5.000 | US$ 741,90 | US$ 20,00 | US$ 168,25 | US$ 930,73 | R$ 5.119,02 | R$ 1,02 | 1000 | 7.1 |
| 10.000 | US$ 1.483,79 | US$ 90,00 | US$ 237,00 | US$ 1.811,38 | R$ 9.962,58 | R$ 1,00 | 2000 | 14.3 |
| 30.000 | US$ 4.451,38 | US$ 189,00 | US$ 467,00 | US$ 5.107,96 | R$ 28.093,79 | R$ 0,94 | 6000 | 42.9 |

## O que os números dizem

- **A IA é ~90% do custo variável.** Chat e foto do prato. Os tetos por conta (limites.js) são o freio; cache de prompt da OpenAI pode cortar a entrada do chat pela metade (não contado).
- **Infra e e-mail são pequenos** perto da IA, mas exigem troca de ferramenta: SMTP do Titan → provedor transacional; Railway Hobby → Pro com Postgres dimensionado.
- **O custo que não cabe é o humano.** Em 10 mil pacientes, 2000 horas/mês de nutri (14.3 pessoas em tempo integral) com o fluxo atual. Aprovação em lote e revisão por exceção são obrigatórias antes do volume.

## Decisões pendentes

1. Provedor de e-mail transacional (antes de abrir a venda).
2. Railway Pro e tamanho do Postgres (antes de ~1.000 pacientes).
3. Retenção das fotos do prato (custo + LGPD).
4. Desenho da aprovação em lote / equipe de nutris.
5. Ticket mensal (preencher na planilha pra ver a margem).
