# Fotos de teste da precisão da Foto IA (#4)

Ponha aqui as **fotos de comida com peso real conhecido** pra medir a precisão da
análise antes de publicar mudanças pros 20.

## Como gerar um bom ground truth

1. Pese o alimento numa balança de cozinha (ou use embalagem com peso no rótulo).
2. Fotografe **como um usuário fotografaria** — de cima ou 45°, com o prato/talher
   visível (ajuda o modelo a ancorar a escala).
3. Salve a foto aqui (jpg/png) e anote o peso real no `expected.json`.

Quanto mais variado melhor: prato montado, alimento solto, comida brasileira,
porções grandes e pequenas. Mire em **8–15 fotos**.

## expected.json

Mapeia o nome do arquivo → valores reais. Pode informar `grams` (soma do prato),
`kcal`, ou os dois. Exemplo:

```json
{
  "cebolas.jpg": { "grams": 485 },
  "marmita-frango.jpg": { "grams": 520, "kcal": 640 },
  "banana.jpg": { "grams": 130 }
}
```

## Rodar o teste

No diretório `backend/`:

```
node scripts/test-analyze-food.mjs
```

Ele imprime, por foto: a referência de escala que a IA usou, cada item (unidades,
gramas, kcal, e o raciocínio de tamanho), o total, e — se houver `expected.json` —
o **erro %**. No fim mostra o **erro médio** (meta: < 20%).

Rode com o prompt **atual** e depois com o **novo** pra comparar os números.
