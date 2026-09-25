// Checagens PURAS da confirmação da foto (sem servidor, sem IA): o que perguntar,
// como aplicar menos/igual/mais e a troca de ingrediente. node scripts/teste-confirmacao.mjs
import 'dotenv/config';
import * as C from '../src/services/whatsapp/confirmacao.js';

const itens = [
  { name: 'Arroz branco cozido', grams: 150, portion: '150 g', medida: '2 colheres de servir', kcal: 190, p: 4, c: 42, f: 0.4 },
  { name: 'Batata-doce assada', grams: 120, portion: '120 g', medida: '3 pedaços', kcal: 92, p: 1.5, c: 22, f: 0.1 },
];
const plano = { slot: 'almoco', name: 'FRANGO GRELHADO COM ARROZ E ABÓBORA', kcal: 520, p: 40, c: 50, f: 15, code: 'PR-010', items: [{ name: 'FRANGO GRELHADO COM ARROZ E ABÓBORA', portion: '1 porção', code: 'PR-010', kcal: 520, p: 40, c: 50, f: 15 }] };

const q1 = C.perguntasAposFoto({ itens, confidence: 'medium', refeicaoDoPlano: plano, kcal: 282 });
console.log('plano tem abóbora, foto diz batata-doce →', q1.ingrediente ? `pergunta ingrediente idx ${q1.ingrediente.idx} atual ${q1.ingrediente.atual}` : 'NÃO perguntou', '| plano:', q1.plano);
const q2 = C.perguntasAposFoto({ itens: [itens[0]], confidence: 'medium', refeicaoDoPlano: plano, kcal: 190 });
console.log('só arroz 190 vs plano 520 →', q2.ingrediente, q2.plano?.direcao);
const q3 = C.perguntasAposFoto({ itens: [itens[0]], confidence: 'medium', refeicaoDoPlano: plano, kcal: 480 });
console.log('480 vs 520 (dentro de 25%) →', JSON.stringify(q3));
const q4 = C.perguntasAposFoto({ itens: [{ name: 'Legumes assados (abóbora/batata-doce)', grams: 100, kcal: 60, p: 1, c: 12, f: 0.5 }], confidence: 'high', refeicaoDoPlano: null, kcal: 60 });
console.log('nome hesitante sem plano →', q4.ingrediente ? 'pergunta' : 'não');
const q4b = C.perguntasAposFoto({ itens: [{ name: 'Frango grelhado/assado', grams: 100, kcal: 160, p: 30, c: 0, f: 3 }], confidence: 'medium', refeicaoDoPlano: null, kcal: 160 });
console.log('"frango grelhado/assado" (hesitação de preparo, não de comida) →', q4b.ingrediente ? 'pergunta (RUIM)' : 'silêncio (ok)');
const q5 = C.perguntasAposFoto({ itens: [{ name: 'Batata-doce assada', grams: 100, kcal: 77, p: 1, c: 18, f: 0 }], confidence: 'medium', refeicaoDoPlano: null, kcal: 77 });
console.log('batata-doce, confiança média, sem plano →', q5.ingrediente ? 'pergunta (RUIM)' : 'silêncio (ok)');
const q6 = C.perguntasAposFoto({ itens: [{ name: 'Purê de batata', grams: 100, kcal: 90, p: 1, c: 18, f: 0 }], confidence: 'low', refeicaoDoPlano: null, kcal: 90 });
console.log('purê de batata, confiança baixa →', q6.ingrediente ? `pergunta batata × mandioca (${q6.ingrediente.atual})` : 'silêncio');
console.log('igual →', C.aplicarPlano(plano, 'igual', itens).map((i) => `${i.name} ${i.kcal} ${i.portion} ${i.code}`));
console.log('menos (foto 282 < 390) → fica a foto:', C.aplicarPlano(plano, 'menos', itens).map((i) => `${i.name.slice(0, 12)} ${Math.round(i.kcal)}`));
console.log('mais (foto 282 < 650) → escala:', C.aplicarPlano(plano, 'mais', itens).map((i) => `${i.name.slice(0, 12)} ${Math.round(i.kcal)} ${i.portion}`));
const troca = C.itensComTroca(itens, 1, C.membroDoPar('abobora'));
console.log('troca →', troca[1].name, Math.round(troca[1].kcal), 'kcal (120 g × 48/100 = 58)', 'medida', troca[1].medida);
console.log('membroDoPar("era batata doce") →', C.membroDoPar('era batata doce')?.nome, '| "aipim" →', C.membroDoPar('aipim')?.nome, '| "purê de batata" →', C.membroDoPar('purê de batata')?.nome, '| "carne moída" →', C.membroDoPar('carne moída')?.nome);
console.log('medidaDe →', C.medidaDe(itens[0]), '|', C.medidaDe({ portion: '80 g' }));
console.log('porcaoTexto →', C.porcaoTexto(itens[0]), '|', C.porcaoTexto({ portion: '80 g', grams: 80 }), '|', C.porcaoTexto({ portion: '1 porção' }));
console.log('gramasDoTexto →', C.gramasDoTexto('150 g'), C.gramasDoTexto('150g'), C.gramasDoTexto('1,5 gramas'), C.gramasDoTexto('3 colheres'), C.gramasDoTexto('9000 g'));
const g = C.itemEmGramas(itens[0], 225);
console.log('itemEmGramas 150→225 →', g.grams, g.portion, Math.round(g.kcal), 'kcal (190 × 1,5 = 285)', 'medida?', 'medida' in g, '| sem base →', C.itemEmGramas({ name: 'x', kcal: 100 }, 50));
