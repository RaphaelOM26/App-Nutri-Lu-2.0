// AUTO-GERADO por scripts/fotos/importar-receitas.mjs — NÃO EDITE À MÃO.
// Fonte: Conteúdo/Receitas nutri Lu.xlsx (livro oficial da nutricionista).
// 407 receitas. Rode o script de novo quando a planilha mudar.

import type { Ingredient, DeclaredMacros, MealCategory } from '../api/client';

/** Tipo de prato — define a coleção na aba Receitas e o enquadramento da foto. */
export type TipoPrato =
  | 'prato' | 'salada' | 'bebida' | 'molho' | 'sopa'
  | 'petisco' | 'mingau' | 'sobremesa' | 'bolo';

/** As 6 tags que sobreviveram da planilha (decisão de 2026-08-18). */
export type TagReceita =
  | 'Vegetariana' | 'Vegana' | 'Sem glúten'
  | 'Sem lactose' | 'Rico em proteínas' | 'Rico em fibras';

export type NutriRecipe = {
  /** Código do livro (NL-001…). NUNCA renumerar: é a chave do plano da nutri. */
  id: string;
  name: string;
  tipo: TipoPrato;
  /** Refeições em que cabe. Vazio = não é refeição (molho, acompanhamento). */
  meals: MealCategory[];
  /** Tags afirmadas sem ressalva. */
  tags: TagReceita[];
  /** Tags que dependem do rótulo do produto — exibir com ressalva, nunca como
   *  equivalentes às absolutas. */
  tagsCondicionais: TagReceita[];
  ressalvas: string[];
  time: string;
  /** Quantas porções a receita rende. */
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  /** Macros MEDIDOS pela nutri, por porção. */
  macros: DeclaredMacros;
  conservacao?: string;
  substituicoes?: string;
};

export const NUTRI_RECIPES: NutriRecipe[] = [
  {
    "id": "NL-001",
    "name": "Molho de Manga para Saladas",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 10,
    "ingredients": [
      {
        "quantity": "165",
        "unit": "g",
        "name": "1 xícara (chá) de manga madura em cubos"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de mel"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "2 colheres (sopa) de vinagre de maçã"
      },
      {
        "quantity": "120",
        "unit": "ml",
        "name": "½ xícara (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "¼ de xícara (chá) de salsa fresca picada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "¼ de colher (sobremesa) de sal"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      }
    ],
    "steps": [
      "Higienize a manga e a salsa.",
      "Descasque a manga e corte-a em cubos.",
      "Coloque no liquidificador ou no mixer a manga, o mel, o vinagre de maçã, o azeite, a salsa e o sal.",
      "Bata por aproximadamente 1 minuto ou até obter um molho homogêneo e cremoso.",
      "Acrescente a pimenta-do-reino moída na hora e misture delicadamente.",
      "Transfira para um recipiente de vidro com tampa.",
      "Mantenha refrigerado até o momento de servir e misture antes de utilizar."
    ],
    "macros": {
      "kcal": 113,
      "p": 0.2,
      "c": 4.3,
      "f": 10.9,
      "fiber": 0.3
    },
    "conservacao": "Geladeira: até 3 dias em recipiente de vidro bem fechado.\r\nNão é recomendado congelar, pois pode ocorrer separação da emulsão e alteração da textura.\r\nSugestões de substituição\r\nManga → pêssego, damasco fresco ou abacaxi.\r\nMel → melado de cana ou xarope de bordo (maple syrup).\r\nVinagre de maçã → suco de limão ou vinagre de vinho branco.\r\nSalsa → hortelã, manjericão ou coentro.\r\nDica da Nutri Lu\r\nO azeite de oliva extravirgem é rico em gorduras monoinsaturadas e compostos fenólicos, que fazem parte do padrão alimentar mediterrâneo e estão associados à saúde cardiovascular. Apesar dos benefícios, continua sendo um alimento calórico. A quantidade ideal é cerca de 1 a 2 colheres de sopa por refeição, utilizando o molho para realçar o sabor da salada sem exageros.\r\nCombinações sugeridas\r\nEste molho harmoniza muito bem com:\r\nMix de folhas verdes\r\nFrango grelhado\r\nPeixes\r\nCamarão\r\nSalada de quinoa\r\nQueijo minas frescal\r\nMuçarela de búfala\r\nTomate-cereja\r\nPepino\r\nCenoura ralada\r\nDescrição para geração da foto por IA\r\nMolho de manga de coloração amarelo-dourada, textura cremosa e brilhante, servido em uma pequena molheira branca de porcelana sobre uma tábua de madeira clara. Ao redor, folhas verdes frescas, cubos de manga, salsa picada e grãos de pimenta-do-reino. Iluminação natural lateral, fotografia gastronômica profissional, estilo clean e sofisticado, com aparência fresca e apetitosa.\r\nTags\r\nMolho • Salada • Manga • Azeite • Sem lactose • Sem glúten • Vegetariano • Mediterrâneo • Verão • Molho caseiro\r\nO simples funciona!\r\n( o formato Gugu vai colocar pra mim )\r\n12:46",
    "substituicoes": "Manga → pêssego, damasco fresco ou abacaxi.\r\nMel → melado de cana ou xarope de bordo (maple syrup).\r\nVinagre de maçã → suco de limão ou vinagre de vinho branco.\r\nSalsa → hortelã, manjericão ou coentro."
  },
  {
    "id": "NL-002",
    "name": "Quibe de Forno de Quinoa Recheado com Cottage, Cenoura e Azeitonas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [
      "Sem glúten",
      "Sem lactose"
    ],
    "ressalvas": [
      "Pode ser sem lactose Desde que todos os ingredientes utilizados sejam certificados sem glúten."
    ],
    "time": "25min",
    "servings": 10,
    "ingredients": [
      {
        "quantity": "500",
        "unit": "g",
        "name": "carne moída magra (patinho ou coxão mole)"
      },
      {
        "quantity": "340",
        "unit": "g",
        "name": "2 xícaras (chá) de quinoa cozida"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "1 cebola média picada em cubos pequenos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "3 dentes de alho picados"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Hortelã fresca picada a gosto"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "½ xícara (chá) de cheiro-verde picado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "azeitonas verdes picadas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "200",
        "unit": "g",
        "name": "1 pote de Cottage LacFree ou 200 g de ricota amassada"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 cenoura média ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã picada (opcional)"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "1 colher (sopa) de azeite de oliva extravirgem"
      }
    ],
    "steps": [
      "Cozinhe a quinoa conforme as instruções da embalagem e deixe esfriar completamente.",
      "Em uma tigela grande, misture a carne moída, a quinoa cozida, o ovo, a cebola, o alho, a hortelã, o cheiro-verde, as azeitonas, o sal e a pimenta-do-reino.",
      "Misture bem até formar uma massa homogênea.",
      "Em outro recipiente, misture o cottage (ou a ricota) com a cenoura ralada e ajuste os temperos.",
      "Unte levemente uma travessa.",
      "Distribua metade da massa do quibe no fundo da travessa.",
      "Espalhe todo o recheio uniformemente.",
      "Cubra com o restante da massa.",
      "Com uma faca, faça cortes em formato de losangos na superfície.",
      "Regue com o azeite de oliva.",
      "Cubra com papel-alumínio.",
      "Asse em forno preaquecido a 200°C por aproximadamente 30 minutos.",
      "Retire o papel-alumínio e deixe assar por mais 10 a 15 minutos, até dourar levemente.",
      "Aguarde cerca de 10 minutos antes de cortar."
    ],
    "macros": {
      "kcal": 253,
      "p": 22,
      "c": 10,
      "f": 14,
      "fiber": 2.5
    },
    "conservacao": "Geladeira: até 3 dias.\r\nFreezer: até 90 dias em porções individuais.\r\nSugestões de substituição\r\nCarne bovina → frango moído ou carne de peru.\r\nCottage → ricota, cottage tradicional ou tofu amassado.\r\nQuinoa → trigo para quibe (para quem não necessita de uma versão sem glúten).\r\nCenoura → abobrinha ralada ou espinafre refogado.\r\nAzeitona verde → azeitona preta.\r\nDica da Nutri Lu\r\nA quinoa aumenta o teor de fibras e melhora o perfil nutricional do quibe, além de contribuir para maior saciedade. O recheio de cottage ou ricota deixa a preparação mais cremosa e acrescenta proteína de alta qualidade. É uma excelente opção para preparar em maior quantidade, congelar em porções e facilitar a rotina alimentar durante a semana.\r\n13:11",
    "substituicoes": "Carne bovina → frango moído ou carne de peru.\r\nCottage → ricota, cottage tradicional ou tofu amassado.\r\nQuinoa → trigo para quibe (para quem não necessita de uma versão sem glúten).\r\nCenoura → abobrinha ralada ou espinafre refogado.\r\nAzeitona verde → azeitona preta."
  },
  {
    "id": "NL-003",
    "name": "Quiche de Grão-de-Bico com Espinafre e Ricota",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Sem glúten",
      "Sem lactose"
    ],
    "ressalvas": [
      "Pode ser sem lactose Desde que todos os ingredientes utilizados sejam certificados sem glúten."
    ],
    "time": "25min",
    "servings": 8,
    "ingredients": [
      {
        "quantity": "500",
        "unit": "g",
        "name": "grão-de-bico cozido e escorrido"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "1 cebola média bem picada ou ralada"
      },
      {
        "quantity": "12",
        "unit": "g",
        "name": "4 dentes de alho amassados"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "½ xícara (chá) de salsa e cebolinha picadas"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "2 colheres (sopa) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "300",
        "unit": "g",
        "name": "ricota fresca amassada ou 300 g de cottage LacFree"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 maços de espinafre refogados e muito bem escorridos (aproximadamente 300 g após o preparo)"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "2 a 4 colheres (sopa) de leite de arroz , apenas se necessário para deixar o recheio mais cremoso"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Noz-moscada a gosto (opcional)"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "tomates-cereja para decorar"
      }
    ],
    "steps": [
      "Massa",
      "Cozinhe previamente o grão-de-bico até que esteja macio e escorra completamente.",
      "Coloque no processador o grão-de-bico, a cebola, o alho, a salsa, a cebolinha, o sal e a pimenta-do-reino.",
      "Bata até obter uma massa homogênea, mantendo uma leve textura.",
      "Transfira para uma tigela e misture o azeite até incorporar completamente.",
      "Unte uma forma de fundo removível (24 cm) com azeite.",
      "Distribua a massa no fundo e nas laterais da forma, pressionando delicadamente.",
      "Recheio",
      "Refogue rapidamente o espinafre até murchar.",
      "Escorra muito bem toda a água para evitar excesso de umidade.",
      "Misture a ricota (ou cottage), o espinafre, o ovo e os temperos.",
      "Se necessário, acrescente o leite de arroz aos poucos até atingir uma consistência cremosa.",
      "Espalhe o recheio sobre a massa.",
      "Distribua os tomates-cereja sobre a superfície.",
      "Finalização",
      "Leve ao forno preaquecido a 180°C.",
      "Asse por aproximadamente 30 minutos, ou até que a superfície esteja levemente dourada.",
      "Retire do forno e aguarde cerca de 10 minutos antes de desenformar."
    ],
    "macros": {
      "kcal": 257,
      "p": 16,
      "c": 18,
      "f": 14,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Ricota → Cottage LacFree, queijo minas frescal light ou tofu firme.\r\nEspinafre → Couve, escarola ou brócolis picado.\r\nLeite de arroz → Bebida de aveia sem açúcar ou leite desnatado.\r\nSalsa e cebolinha → Cheiro-verde.\r\nTomate-cereja → Tomate italiano em fatias."
  },
  {
    "id": "NL-004",
    "name": "Salada Janeiro",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [
      "Sem lactose"
    ],
    "ressalvas": [
      "Pode ser sem lactose (substituindo o queijo feta)"
    ],
    "time": "20min",
    "servings": 6,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "4 xícaras (chá) de folhas verdes (rúcula ou mix de folhas)"
      },
      {
        "quantity": "300",
        "unit": "g",
        "name": "3 beterrabas médias cozidas e cortadas em cubos"
      },
      {
        "quantity": "360",
        "unit": "g",
        "name": "3 laranjas médias sem casca e sem sementes, em gomos"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Queijo feta esfarelado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 cebola roxa média fatiada finamente"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "¼ de xícara (chá) de salsa fresca picada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "½ xícara (chá) de nozes picadas"
      },
      {
        "quantity": "45",
        "unit": "ml",
        "name": "3 colheres (sopa) de azeite de oliva extravirgem"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de mel"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      }
    ],
    "steps": [
      "Cozinhe as beterrabas até ficarem macias. Aguarde esfriar, descasque e corte em cubos médios.",
      "Higienize e seque bem as folhas.",
      "Descasque as laranjas retirando toda a parte branca e corte em gomos.",
      "Fatie finamente a cebola roxa.",
      "Pique grosseiramente as nozes.",
      "Em uma saladeira, disponha as folhas verdes.",
      "Acrescente a beterraba, os gomos de laranja, a cebola roxa e o queijo feta esfarelado.",
      "Finalize com a salsa picada e as nozes.",
      "Molho",
      "Misture o azeite, o mel, o sal e a pimenta-do-reino até formar uma emulsão.",
      "Regue a salada apenas no momento de servir."
    ],
    "macros": {
      "kcal": 235,
      "p": 7,
      "c": 18,
      "f": 16,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente no mesmo dia.\r\nSe necessário, conservar refrigerada por até 24 horas, armazenando o molho separadamente.",
    "substituicoes": "Queijo feta → queijo minas frescal, ricota temperada ou tofu firme.\r\nNozes → castanhas-do-pará, amêndoas ou castanha-de-caju.\r\nRúcula → agrião, alface-romana ou mix de folhas.\r\nMel → melado de cana ou xarope de bordo (maple syrup).\r\nLaranja → tangerina ou grapefruit."
  },
  {
    "id": "NL-005",
    "name": "Torta de Frango da Lu",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten",
      "Sem lactose"
    ],
    "ressalvas": [
      "Pode ser sem lactose Quando preparada com tapioca e ingredientes certificados sem glúten."
    ],
    "time": "15min",
    "servings": 6,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "3 ovos inteiros"
      },
      {
        "quantity": "300",
        "unit": "g",
        "name": "peito de frango cozido e desfiado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "½ pote de requeijão light"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "¾ de xícara (chá) de goma de tapioca ou farinha de sua preferência"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "⅔ de xícara (chá) de milho-verde cozido e escorrido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 cenoura média ralada"
      },
      {
        "quantity": "200",
        "unit": "g",
        "name": "2 xícaras (chá) de couve-flor ou brócolis cozidos e picados"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 xícara (chá) de queijo muçarela ralado"
      },
      {
        "quantity": "12",
        "unit": "g",
        "name": "1 colher (sopa) de fermento químico em pó"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica, cúrcuma, orégano e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Preaqueça o forno a 180°C.",
      "Cozinhe o peito de frango, desfie e reserve.",
      "Cozinhe rapidamente o brócolis ou a couve-flor, deixando os vegetais macios, mas ainda firmes.",
      "Escorra muito bem os vegetais e pique em pedaços pequenos. Esse cuidado evita que a torta fique excessivamente úmida.",
      "Em uma tigela grande, bata levemente os ovos com um garfo ou fouet.",
      "Acrescente o requeijão light e misture até formar um creme homogêneo.",
      "Adicione a tapioca e misture novamente.",
      "Junte o frango desfiado, o milho, a cenoura, o brócolis ou a couve-flor e metade da muçarela.",
      "Tempere com sal, pimenta-do-reino, páprica, cúrcuma, orégano e cheiro-verde.",
      "Misture todos os ingredientes até que fiquem bem distribuídos.",
      "Acrescente o fermento químico por último e misture delicadamente.",
      "Divida a massa entre 6 marmitinhas individuais próprias para forno, untadas levemente, ou coloque em uma assadeira média.",
      "Distribua o restante da muçarela sobre as porções.",
      "Leve ao forno preaquecido a 180°C por aproximadamente 30 minutos, ou até que a torta esteja firme e levemente dourada.",
      "Retire do forno e aguarde cerca de 5 minutos antes de servir ou tampar as marmitinhas."
    ],
    "macros": {
      "kcal": 276,
      "p": 25,
      "c": 21,
      "f": 10,
      "fiber": 2
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente bem fechado.\r\nEspere a preparação esfriar antes de tampar e refrigerar, evitando o acúmulo excessivo de umidade.",
    "substituicoes": "Tapioca → farinha de aveia, farinha de arroz ou farinha de grão-de-bico.\r\nRequeijão light → creme de ricota, cottage batido ou requeijão sem lactose.\r\nMuçarela → queijo minas padrão light, muçarela sem lactose ou queijo vegetal.\r\nMilho → ervilha, abobrinha picada ou palmito.\r\nBrócolis → couve-flor, espinafre ou abobrinha.\r\nFrango → atum escorrido ou carne moída magra.\r\nA substituição da tapioca por outra farinha modifica a textura e os valores nutricionais da receita."
  },
  {
    "id": "NL-006",
    "name": "Abobrinha Grelhada com Alho e Molho de Azeitonas Verdes",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "1 abobrinha italiana média"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente de alho inteiro"
      },
      {
        "quantity": "8",
        "unit": "ml",
        "name": "1 colher (sopa) rasa de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Molho de azeitonas verdes"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "10 azeitonas verdes sem caroço"
      },
      {
        "quantity": "32",
        "unit": "ml",
        "name": "4 colheres (sopa) rasas de azeite de oliva extravirgem"
      },
      {
        "quantity": "80",
        "unit": "ml",
        "name": "Suco de 2 limões médios"
      },
      {
        "quantity": "6",
        "unit": "g",
        "name": "1 colher (sopa) cheia de manjericão fresco picado"
      }
    ],
    "steps": [
      "Abobrinha",
      "Lave bem a abobrinha.",
      "Corte-a ao meio no sentido do comprimento e depois em fatias de aproximadamente 0,5 cm em formato de meia-lua.",
      "Aqueça uma frigideira em fogo médio.",
      "Acrescente o azeite e o dente de alho inteiro apenas para aromatizar.",
      "Disponha as fatias de abobrinha em uma única camada.",
      "Grelhe por aproximadamente 3 a 4 minutos de cada lado ou até dourarem levemente.",
      "Tempere com sal e pimenta-do-reino.",
      "Retire o alho antes de servir.",
      "Molho",
      "Pique finamente as azeitonas verdes.",
      "Extraia o suco dos limões.",
      "Misture o azeite, o suco de limão, o manjericão e as azeitonas até formar um molho homogêneo.",
      "Regue a abobrinha apenas na hora de servir."
    ],
    "macros": {
      "kcal": 185,
      "p": 2,
      "c": 7,
      "f": 17,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.\r\nCaso necessário, conservar em recipiente fechado na geladeira por até 2 dias, mantendo o molho separado da abobrinha para preservar a textura.",
    "substituicoes": "Abobrinha italiana → abobrinha amarela.\r\nManjericão → salsa, hortelã ou cheiro-verde.\r\nAzeitona verde → azeitona preta.\r\nLimão → limão-siciliano."
  },
  {
    "id": "NL-007",
    "name": "Batata Recheada com Frango e Muçarela",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "25min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "440",
        "unit": "g",
        "name": "4 batatas médias com casca"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "4 fatias médias de queijo muçarela"
      },
      {
        "quantity": "19",
        "unit": "g",
        "name": "1 colher (sopa) de manteiga"
      },
      {
        "quantity": "200",
        "unit": "g",
        "name": "peito de frango cozido e desfiado"
      },
      {
        "quantity": "2",
        "unit": "g",
        "name": "½ colher (chá) de alecrim seco"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "1 cebola pequena picada"
      },
      {
        "quantity": "16",
        "unit": "ml",
        "name": "2 colheres (sopa) rasas de azeite de oliva extravirgem"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "2 ovos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "2 colheres (sopa) de queijo parmesão ralado"
      }
    ],
    "steps": [
      "Preaqueça o forno a 200°C.",
      "Disponha as batatas em uma assadeira untada com um fio de azeite.",
      "Cubra com papel-alumínio e asse por aproximadamente 30 minutos.",
      "Retire o papel-alumínio e asse por mais 20 minutos, ou até que as batatas estejam macias.",
      "Corte cada batata ao meio no sentido do comprimento.",
      "Com uma colher, retire cuidadosamente parte da polpa, deixando aproximadamente 1 cm de espessura nas laterais.",
      "Amasse toda a polpa ainda quente e reserve.",
      "Tempere as cascas com sal e pimenta-do-reino.",
      "Retorne as cascas ao forno por 10 minutos, deixando-as levemente crocantes.",
      "Recheio",
      "Separe as claras das gemas.",
      "Misture à polpa da batata:",
      "* manteiga",
      "* muçarela",
      "* gemas",
      "Reserve.",
      "Em uma frigideira aqueça o azeite.",
      "Refogue a cebola até ficar transparente.",
      "Acrescente o frango desfiado.",
      "Tempere com sal, pimenta-do-reino e alecrim.",
      "Refogue por aproximadamente 5 minutos.",
      "Bata as claras em neve.",
      "Misture delicadamente o frango ao purê de batata.",
      "Incorpore as claras em neve aos poucos, mexendo suavemente para manter a leveza.",
      "Recheie todas as cascas de batata.",
      "Polvilhe o queijo parmesão sobre cada uma.",
      "Leve novamente ao forno por aproximadamente 20 minutos, ou até gratinar."
    ],
    "macros": {
      "kcal": 350,
      "p": 23,
      "c": 26,
      "f": 18,
      "fiber": 3
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente bem fechado.",
    "substituicoes": "Muçarela → queijo minas padrão light, cottage ou muçarela sem lactose.\r\nFrango → carne moída magra, atum ou peito de peru desfiado.\r\nManteiga → azeite de oliva extravirgem.\r\nAlecrim → orégano, tomilho ou páprica defumada.\r\nBatata inglesa → batata-doce ou mandioquinha."
  },
  {
    "id": "NL-008",
    "name": "Hambúrguer de Quinoa",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras",
      "Rico em proteínas",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Pode ser sem glúten* Desde que a farinha de aveia utilizada seja certificada sem glúten."
    ],
    "time": "20min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "1 xícara (chá) de quinoa em grãos"
      },
      {
        "quantity": "54",
        "unit": "g",
        "name": "3 colheres (sopa) cheias de farinha de aveia"
      },
      {
        "quantity": "45",
        "unit": "ml",
        "name": "3 colheres (sopa) de azeite de oliva extravirgem"
      },
      {
        "quantity": "6",
        "unit": "g",
        "name": "2 dentes de alho amassados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica doce ou defumada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Noz-moscada ralada a gosto"
      }
    ],
    "steps": [
      "Lave bem a quinoa em água corrente.",
      "Coloque-a em uma panela e cubra com água cerca de dois dedos acima dos grãos.",
      "Acrescente uma pitada de sal e cozinhe em fogo médio até toda a água secar.",
      "Desligue o fogo e deixe a quinoa esfriar completamente.",
      "Transfira a quinoa para uma tigela.",
      "Acrescente a farinha de aveia aos poucos.",
      "Adicione o alho, o azeite, o sal, a pimenta-do-reino, a páprica e a noz-moscada.",
      "Misture bem até formar uma massa firme e moldável.",
      "Se necessário, acrescente um pouco mais de farinha de aveia para dar ponto.",
      "Modele 4 hambúrgueres de espessura uniforme.",
      "Disponha-os em uma assadeira levemente untada com azeite.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 15 minutos.",
      "Vire os hambúrgueres cuidadosamente e asse por mais 15 minutos, até dourarem dos dois lados."
    ],
    "macros": {
      "kcal": 245,
      "p": 7,
      "c": 27,
      "f": 12,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 4 dias, em recipiente fechado.",
    "substituicoes": "Farinha de aveia → farinha de arroz, farinha de grão-de-bico ou farinha de quinoa.\r\nQuinoa branca → quinoa tricolor.\r\nPáprica doce → páprica defumada ou cúrcuma.\r\nAzeite → óleo de abacate."
  },
  {
    "id": "NL-009",
    "name": "Filé de Peixe Mediterrâneo",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "20min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "240",
        "unit": "g",
        "name": "2 filés médios de cação ou outro peixe branco firme (tilápia, linguado, robalo ou namorado)"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (sopa) rasa de coentro desidratado"
      },
      {
        "quantity": "4.5",
        "unit": "g",
        "name": "1½ colher (chá) de cominho em pó"
      },
      {
        "quantity": "6",
        "unit": "g",
        "name": "1½ colher (chá) de endro (dill) seco"
      },
      {
        "quantity": "2",
        "unit": "g",
        "name": "1 colher (chá) de cúrcuma"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "1 cebola média picada"
      },
      {
        "quantity": "24",
        "unit": "g",
        "name": "8 dentes de alho picados"
      },
      {
        "quantity": "55",
        "unit": "g",
        "name": "1 pimentão verde médio picado"
      },
      {
        "quantity": "500",
        "unit": "g",
        "name": "5 tomates médios em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "4 colheres (sopa) de extrato de tomate"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "Suco de 1 limão médio"
      },
      {
        "quantity": "120",
        "unit": "ml",
        "name": "½ copo americano de água"
      },
      {
        "quantity": "24",
        "unit": "g",
        "name": "4 colheres (sopa) de salsa fresca picada"
      },
      {
        "quantity": "16",
        "unit": "ml",
        "name": "2 colheres (sopa) de azeite de oliva extravirgem"
      }
    ],
    "steps": [
      "Em uma tigela, misture o coentro, o cominho, o endro e a cúrcuma. Reserve.",
      "Tempere os filés de peixe com sal, pimenta-do-reino e metade da mistura de especiarias.",
      "Aqueça o azeite em uma frigideira grande.",
      "Refogue a cebola por aproximadamente 2 minutos.",
      "Acrescente o alho e o pimentão e refogue até ficarem levemente macios.",
      "Adicione os tomates, o extrato de tomate, o suco de limão, a água e o restante das especiarias.",
      "Misture bem e cozinhe por cerca de 10 minutos, em fogo baixo, até formar um molho encorpado.",
      "Disponha cuidadosamente os filés sobre o molho.",
      "Tampe a panela e cozinhe por aproximadamente 10 a 15 minutos, ou até que o peixe esteja completamente cozido.",
      "Finalize com a salsa fresca picada e sirva imediatamente."
    ],
    "macros": {
      "kcal": 255,
      "p": 31,
      "c": 15,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Cação → tilápia, linguado, robalo, pescada-amarela ou namorado.\r\nPimentão verde → pimentão vermelho ou amarelo.\r\nEndro (dill) → erva-doce fresca ou salsinha.\r\nCoentro → salsa fresca.\r\nExtrato de tomate → tomates pelados triturados."
  },
  {
    "id": "NL-010",
    "name": "Filé Mignon com Risoto de Alho-Poró",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "240",
        "unit": "g",
        "name": "2 medalhões médios de filé mignon"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "16",
        "unit": "ml",
        "name": "2 colheres (sopa) rasas de óleo de soja"
      },
      {
        "quantity": "71",
        "unit": "g",
        "name": "1 xícara (chá) de alho-poró fatiado"
      },
      {
        "quantity": "4",
        "unit": "ml",
        "name": "½ colher (sopa) de azeite de oliva extravirgem"
      },
      {
        "quantity": "148",
        "unit": "g",
        "name": "1 xícara (chá) de arroz arbóreo"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "1 taça de vinho branco seco (opcional)"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água quente ou caldo de legumes caseiro"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha picada a gosto"
      }
    ],
    "steps": [
      "Filé mignon",
      "Tempere os medalhões com sal e pimenta-do-reino.",
      "Aqueça bem uma frigideira.",
      "Acrescente o óleo e sele os medalhões por aproximadamente 3 a 4 minutos de cada lado, ou até atingir o ponto desejado.",
      "Retire da frigideira e deixe descansar por cerca de 5 minutos antes de servir.",
      "Risoto",
      "Aqueça o azeite em uma panela.",
      "Refogue o alho-poró até ficar levemente transparente.",
      "Acrescente o arroz arbóreo e mexa por aproximadamente 2 minutos.",
      "Adicione o vinho branco e deixe evaporar completamente.",
      "Acrescente metade da água quente.",
      "Mexa continuamente e vá adicionando o restante da água aos poucos, conforme o líquido for sendo absorvido.",
      "Cozinhe até o arroz ficar al dente e o risoto adquirir textura cremosa.",
      "Ajuste o sal.",
      "Finalize com salsinha picada."
    ],
    "macros": {
      "kcal": 523,
      "p": 34,
      "c": 43,
      "f": 20,
      "fiber": 2
    },
    "conservacao": "Geladeira: até 3 dias em recipiente fechado.",
    "substituicoes": "Filé mignon → contrafilé magro, alcatra, patinho ou filé de frango.\r\nArroz arbóreo → arroz integral (não terá textura de risoto).\r\nVinho branco → caldo de legumes caseiro.\r\nAlho-poró → cebola ou erva-doce.\r\nÓleo de soja → azeite de oliva extravirgem."
  },
  {
    "id": "NL-011",
    "name": "Pão de Frango da Nutri Lu",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten",
      "Sem lactose"
    ],
    "ressalvas": [
      "Pode ser sem lactose Quando preparado com fermento e temperos certificados sem glúten."
    ],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "3 ovos inteiros"
      },
      {
        "quantity": "200",
        "unit": "g",
        "name": "peito de frango cozido e desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "2 fatias de queijo muçarela"
      },
      {
        "quantity": "45",
        "unit": "ml",
        "name": "3 colheres (sopa) de água"
      },
      {
        "quantity": "12",
        "unit": "g",
        "name": "1 colher (sopa) de fermento químico em pó"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Gergelim branco e preto para finalizar"
      }
    ],
    "steps": [
      "Preaqueça o forno a 180°C.",
      "Unte levemente uma forma tipo bolo inglês.",
      "Coloque no liquidificador os ovos, o frango desfiado, a muçarela, a água, o sal, a pimenta-do-reino e o orégano.",
      "Bata por aproximadamente 2 minutos, até obter uma massa homogênea.",
      "Acrescente o fermento químico por último e misture delicadamente apenas para incorporá-lo.",
      "Despeje a massa na forma.",
      "Salpique o gergelim sobre toda a superfície.",
      "Asse em forno preaquecido a 180°C por aproximadamente 25 minutos, ou até dourar.",
      "Faça o teste do palito. Se sair limpo, retire do forno.",
      "Aguarde cerca de 10 minutos antes de desenformar.",
      "Corte ao meio, formando 2 sanduíches médios, ou recheie conforme sua preferência."
    ],
    "macros": {
      "kcal": 480,
      "p": 50,
      "c": 5,
      "f": 27.5,
      "fiber": 1.5
    },
    "conservacao": "Geladeira: até 4 dias, em recipiente bem fechado.",
    "substituicoes": "Muçarela → queijo minas light, cottage firme ou muçarela sem lactose.\r\nOrégano → ervas finas, alecrim ou chimichurri.\r\nGergelim → chia, linhaça ou mix de sementes.\r\nFrango → atum em água escorrido ou peito de peru desfiado."
  },
  {
    "id": "NL-012",
    "name": "Lasanha de Carne com Abobrinha na Air Fryer",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "20min",
    "servings": 6,
    "ingredients": [
      {
        "quantity": "300",
        "unit": "g",
        "name": "carne moída magra (patinho)"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata inglesa cozida e amassada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "abobrinha italiana cortada em fatias finas"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "requeijão cremoso light"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "3 fatias de queijo muçarela"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "molho de tomate caseiro"
      },
      {
        "quantity": "6",
        "unit": "g",
        "name": "2 dentes de alho picados"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "¼ de cebola picada"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "2 colheres (sopa) de salsinha picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere a carne moída com alho, cebola, salsinha, sal e pimenta-do-reino.",
      "Refogue até que fique completamente cozida e toda a água evapore.",
      "Acrescente a batata cozida e amassada.",
      "Misture até formar uma massa homogênea.",
      "Corte a abobrinha em fatias bem finas.",
      "Coloque as fatias sobre papel-toalha, salpique uma pequena quantidade de sal e deixe descansar por 15 minutos para retirar o excesso de água.",
      "Seque bem as fatias antes da montagem.",
      "Montagem",
      "Em um refratário próprio para Air Fryer, coloque metade da massa de carne.",
      "Espalhe metade do requeijão.",
      "Distribua as fatias de abobrinha.",
      "Cubra com o restante do requeijão.",
      "Finalize com o restante da massa.",
      "Espalhe o molho de tomate sobre toda a superfície.",
      "Leve à Air Fryer preaquecida a 180°C por aproximadamente 30 minutos.",
      "Retire cuidadosamente.",
      "Cubra com a muçarela.",
      "Salpique orégano.",
      "Retorne à Air Fryer por mais 3 a 5 minutos, apenas para gratinar."
    ],
    "macros": {
      "kcal": 175,
      "p": 18.5,
      "c": 5.5,
      "f": 8.8,
      "fiber": 0.8
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente bem fechado.",
    "substituicoes": "Carne bovina → frango desfiado, carne de peru ou proteína de soja texturizada.\r\nRequeijão light → cottage batido ou creme de ricota.\r\nMuçarela → muçarela sem lactose ou queijo minas padrão light.\r\nBatata inglesa → batata-doce, mandioquinha ou couve-flor cozida.\r\nAbobrinha → berinjela em fatias finas."
  },
  {
    "id": "NL-013",
    "name": "Salada Morna de Quinoa com Frango e Legumes Assados",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "20min",
    "servings": 6,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "1 abobrinha italiana média em cubos"
      },
      {
        "quantity": "200",
        "unit": "g",
        "name": "abóbora cabotiá em cubos"
      },
      {
        "quantity": "300",
        "unit": "g",
        "name": "1 brócolis pequeno em floretes"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "1 cebola roxa média em cubos"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "1 xícara (chá) de tomate-cereja"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "2 colheres (sopa) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão seco ou fresco a gosto"
      },
      {
        "quantity": "170",
        "unit": "g",
        "name": "1 xícara (chá) de quinoa tricolor ou branca"
      },
      {
        "quantity": "480",
        "unit": "ml",
        "name": "2 xícaras (chá) de água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "300",
        "unit": "g",
        "name": "peito de frango cozido e desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "½ cebola pequena picada"
      },
      {
        "quantity": "6",
        "unit": "g",
        "name": "2 dentes de alho picados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de açafrão-da-terra (cúrcuma)"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "1 colher (sopa) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ pimenta dedo-de-moça sem sementes picada"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "2 colheres (sopa) de salsinha picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de 1 limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Azeite extravirgem a gosto (opcional)"
      }
    ],
    "steps": [
      "Legumes",
      "Preaqueça o forno a 200°C.",
      "Misture a abobrinha, a abóbora, o brócolis e a cebola com o azeite, o sal, a pimenta e o manjericão.",
      "Distribua os legumes em uma assadeira, sem sobrepor.",
      "Asse por aproximadamente 30 minutos.",
      "Acrescente os tomates-cereja e retorne ao forno por mais 5 minutos.",
      "Quinoa",
      "Lave bem a quinoa em água corrente.",
      "Coloque em uma panela com a água e uma pitada de sal.",
      "Cozinhe em fogo baixo até toda a água secar, como no preparo do arroz.",
      "Solte os grãos com um garfo e reserve.",
      "Frango",
      "Aqueça o azeite em uma frigideira.",
      "Refogue a cebola até ficar transparente.",
      "Acrescente o alho.",
      "Junte o frango desfiado.",
      "Tempere com cúrcuma, sal e pimenta-do-reino.",
      "Refogue até ficar levemente dourado.",
      "Montagem",
      "Em uma travessa grande misture a quinoa cozida, os legumes assados e o frango.",
      "Acrescente a salsinha, a pimenta dedo-de-moça e o suco de limão.",
      "Misture delicadamente.",
      "Se desejar, finalize com um fio de azeite extravirgem antes de servir."
    ],
    "macros": {
      "kcal": 305,
      "p": 22,
      "c": 27,
      "f": 12,
      "fiber": 6
    },
    "conservacao": "Geladeira: até 4 dias, em recipiente bem fechado.",
    "substituicoes": "Quinoa → arroz integral ou trigo-sarraceno.\r\nFrango → filé de peixe grelhado, carne bovina magra ou grão-de-bico para versão vegetariana.\r\nAbóbora cabotiá → batata-doce ou cenoura.\r\nBrócolis → couve-flor.\r\nLimão → limão-siciliano."
  },
  {
    "id": "NL-014",
    "name": "Crepioca Recheada com Frango e Queijo",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten",
      "Sem lactose"
    ],
    "ressalvas": [
      "Pode ser sem lactose Desde que a goma de tapioca e os demais ingredientes sejam certificados sem glúten."
    ],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "2 colheres (sopa) de goma de tapioca hidratada"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (café) de requeijão light"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "peito de frango cozido, desfiado e refogado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 fatia média de queijo muçarela ou queijo de sua preferência"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o ovo em uma tigela e bata levemente com um garfo.",
      "Acrescente a goma de tapioca, o requeijão light, o sal e o orégano.",
      "Misture bem até obter uma massa uniforme.",
      "Aqueça uma frigideira antiaderente pequena em fogo baixo.",
      "Despeje a mistura e espalhe delicadamente, formando um disco.",
      "Cozinhe por aproximadamente 2 minutos, até que a parte de baixo esteja firme e levemente dourada.",
      "Vire cuidadosamente com uma espátula.",
      "Distribua o frango desfiado e a fatia de queijo sobre metade da crepioca.",
      "Tempere o recheio com pimenta-do-reino e orégano, se desejar.",
      "Dobre a crepioca ao meio, cobrindo o recheio.",
      "Tampe a frigideira e mantenha em fogo baixo por mais 1 a 2 minutos, até o queijo derreter.",
      "Retire da frigideira e sirva imediatamente."
    ],
    "macros": {
      "kcal": 295,
      "p": 27,
      "c": 18,
      "f": 12,
      "fiber": 0.3
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.\r\nCaso necessário, conservar na geladeira por até 24 horas, em recipiente fechado.",
    "substituicoes": "Requeijão light → creme de ricota, cottage ou requeijão sem lactose.\r\nMuçarela → queijo minas, ricota, cottage ou muçarela sem lactose.\r\nFrango → atum escorrido, carne moída magra ou queijo com tomate.\r\nOvo inteiro → 1 ovo e 1 clara, para aumentar o teor proteico.\r\nOrégano → salsa, cebolinha, páprica ou ervas finas."
  },
  {
    "id": "NL-015",
    "name": "Nuvem de Claras com Muçarela",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "3 claras de ovos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "queijo muçarela ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica defumada (opcional)"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho em pó (opcional)"
      }
    ],
    "steps": [
      "Preaqueça o forno ou a Air Fryer a 180°C.",
      "Bata as claras em neve até formar picos firmes.",
      "Acrescente delicadamente a muçarela ralada.",
      "Tempere com sal, pimenta-do-reino, orégano e os temperos de sua preferência.",
      "Misture cuidadosamente para manter a leveza das claras.",
      "Forre uma assadeira ou o cesto da Air Fryer com papel manteiga.",
      "Distribua a mistura em 3 porções iguais, formando discos ou montinhos levemente achatados.",
      "Leve ao forno ou Air Fryer por 12 a 15 minutos, até dourar e ficar levemente crocante nas bordas.",
      "Aguarde alguns minutos antes de servir."
    ],
    "macros": {
      "kcal": 112,
      "p": 10,
      "c": 0.8,
      "f": 7.2,
      "fiber": 0
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente hermético.",
    "substituicoes": "Muçarela → parmesão, queijo minas padrão ou muçarela sem lactose.\r\nOrégano → ervas finas, chimichurri ou alecrim.\r\nPáprica defumada → cúrcuma ou curry."
  },
  {
    "id": "NL-016",
    "name": "Pastel Proteico de Frango",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "peito de frango moído"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica defumada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Curry a gosto"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de requeijão light"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "½ fatia de queijo muçarela"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Tomate em rodelas finas a gosto"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Rúcula a gosto"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "queijo parmesão ralado"
      }
    ],
    "steps": [
      "Tempere o peito de frango moído com sal, páprica defumada, curry e pimenta-do-reino.",
      "Misture bem até formar uma massa homogênea.",
      "Sobre uma folha de papel manteiga ou plástico culinário, abra o frango formando um retângulo fino, semelhante à massa de um pastel.",
      "Espalhe o requeijão light sobre metade da massa.",
      "Acrescente a muçarela, o tomate e a rúcula.",
      "Feche cuidadosamente formando um pastel e pressione bem as bordas para evitar que o recheio escape.",
      "Polvilhe o queijo parmesão ralado sobre toda a superfície.",
      "Disponha o pastel na cesta da Air Fryer ou em uma assadeira forrada com papel manteiga.",
      "Asse na Air Fryer a 160°C por 15 a 20 minutos, ou até dourar completamente.",
      "Caso utilize forno convencional, asse em forno preaquecido a 180°C por aproximadamente 25 minutos.",
      "Aguarde cerca de 3 minutos antes de servir para estabilizar o recheio."
    ],
    "macros": {
      "kcal": 366,
      "p": 44,
      "c": 4,
      "f": 19,
      "fiber": 0.7
    },
    "conservacao": "Após o preparo, conservar em recipiente fechado por até 3 dias sob refrigeração.",
    "substituicoes": "Frango moído → peito de peru moído ou carne bovina magra moída.\r\nRequeijão light → cottage, ricota cremosa ou creme de ricota.\r\nMuçarela → queijo minas padrão, prato light ou muçarela sem lactose.\r\nRúcula → espinafre, agrião ou alface.\r\nTomate → tomate-cereja picado ou tomate seco (em pequena quantidade)."
  },
  {
    "id": "NL-017",
    "name": "Sanduíche Gourmet de Filé Mignon com Abacaxi Grelhado",
    "tipo": "prato",
    "meals": [
      "snack",
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão francês médio"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "filé mignon em bife"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "2 fatias de abacaxi fresco"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de maionese light"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva ou apenas uma frigideira antiaderente"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho em pó ou 1 dente de alho amassado (opcional)"
      }
    ],
    "steps": [
      "Tempere o filé mignon com sal, pimenta-do-reino e alho, se desejar.",
      "Aqueça uma frigideira em fogo alto.",
      "Adicione um fio de azeite ou utilize uma frigideira antiaderente.",
      "Grelhe o filé mignon por aproximadamente 3 a 4 minutos de cada lado, ou até atingir o ponto desejado.",
      "Retire a carne e deixe descansar por 2 minutos antes de montar o sanduíche.",
      "Na mesma frigideira, coloque as fatias de abacaxi.",
      "Grelhe dos dois lados até que fiquem douradas e levemente caramelizadas naturalmente, sem adicionar açúcar.",
      "Corte o abacaxi em cubos.",
      "Corte o pão francês ao meio.",
      "Se desejar, aqueça o pão na torradeira ou na própria frigideira até ficar levemente crocante.",
      "Espalhe a maionese light nas duas metades do pão.",
      "Coloque o filé mignon grelhado.",
      "Distribua os cubos de abacaxi caramelizado sobre a carne.",
      "Feche o sanduíche e sirva imediatamente."
    ],
    "macros": {
      "kcal": 510,
      "p": 41,
      "c": 36,
      "f": 21,
      "fiber": 3
    },
    "conservacao": "O ideal é consumir logo após o preparo.\r\nCaso necessário, mantenha a carne e o abacaxi refrigerados por até 48 horas e monte o sanduíche somente na hora de consumir.",
    "substituicoes": "Filé mignon → patinho grelhado, alcatra, contra-filé magro ou peito de frango.\r\nPão francês → pão integral, pão australiano integral ou pão sem glúten.\r\nMaionese light → creme de ricota, cottage batido ou iogurte natural temperado.\r\nAbacaxi → manga grelhada ou pêssego grelhado."
  },
  {
    "id": "NL-018",
    "name": "Bolo de Maçã com Aveia na Air Fryer",
    "tipo": "bolo",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "65",
        "unit": "g",
        "name": "½ maçã ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pitada de canela em pó"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "1 colher (sopa) de uvas-passas"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "2 colheres (sopa) de aveia em flocos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "1 colher (sopa) de eritritol ou outro adoçante culinário"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de fermento químico em pó"
      }
    ],
    "steps": [
      "Preaqueça o forno a 180°C ou a Air Fryer na mesma temperatura.",
      "Rale a maçã utilizando o lado grosso do ralador.",
      "Em uma tigela, misture a maçã ralada, a canela, as uvas-passas, a aveia, o eritritol e o ovo batido.",
      "Misture até obter uma massa homogênea.",
      "Acrescente o fermento químico por último e incorpore delicadamente.",
      "Unte um ramequim ou recipiente de aproximadamente 12 cm de diâmetro.",
      "Despeje a massa no recipiente.",
      "Asse no forno a 180°C por 20 a 25 minutos ou na Air Fryer a 180°C por 15 a 20 minutos, até dourar.",
      "Faça o teste do palito. Se sair limpo, retire do forno.",
      "Aguarde cerca de 5 minutos antes de servir."
    ],
    "macros": {
      "kcal": 255,
      "p": 10,
      "c": 34,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.\r\nSe necessário, conservar sob refrigeração por até 2 dias, em recipiente fechado.",
    "substituicoes": "Maçã → pera ou banana madura.\r\nUvas-passas → cranberry sem açúcar ou damasco picado.\r\nEritritol → xilitol ou outro adoçante culinário.\r\nAveia → farelo de aveia ou farinha de aveia.\r\nCanela → especiarias para torta de maçã (apple pie spice)."
  },
  {
    "id": "NL-019",
    "name": "Omelete Caprese da Nutri Lu",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "2 ovos inteiros"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 fatia de queijo muçarela"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "1 tomate pequeno em rodelas finas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de manjericão fresco a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva ou spray de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino moída na hora a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano (opcional)"
      }
    ],
    "steps": [
      "Quebre os ovos em uma tigela.",
      "Tempere com sal e pimenta-do-reino.",
      "Bata levemente com um garfo até misturar as claras e as gemas.",
      "Aqueça uma frigideira antiaderente em fogo baixo e adicione o azeite.",
      "Despeje os ovos batidos na frigideira.",
      "Cozinhe por aproximadamente 2 minutos, até a base começar a firmar.",
      "Distribua as rodelas de tomate sobre metade da omelete.",
      "Acrescente a fatia de muçarela e finalize com folhas de manjericão fresco.",
      "Se desejar, salpique um pouco de orégano.",
      "Dobre a omelete ao meio.",
      "Tampe a frigideira por cerca de 1 minuto, permitindo que o queijo derreta completamente.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 270,
      "p": 19,
      "c": 4,
      "f": 20,
      "fiber": 1
    },
    "conservacao": "O ideal é consumir logo após o preparo.\r\nCaso necessário, conservar sob refrigeração por até 24 horas, em recipiente fechado.",
    "substituicoes": "Muçarela → queijo minas, cottage, ricota ou muçarela sem lactose.\r\nTomate → tomate-cereja ou tomate italiano.\r\nManjericão → salsinha, cebolinha ou espinafre.\r\nAzeite → manteiga ghee ou preparo em frigideira antiaderente sem gordura."
  },
  {
    "id": "NL-020",
    "name": "Creme Proteico de Maracujá da Nutri Lu",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "polpa de maracujá"
      },
      {
        "quantity": "50",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "iogurte natural desnatado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "leite em pó desnatado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "1 scoop de whey protein sabor baunilha"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "coco ralado sem açúcar"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Opcional: adoçante culinário a gosto, caso utilize apenas leite em pó no lugar do whey."
      }
    ],
    "steps": [
      "Bata a polpa de maracujá com a água no liquidificador.",
      "Passe a mistura por uma peneira para retirar as sementes.",
      "Transfira o suco coado para uma tigela.",
      "Acrescente o iogurte desnatado.",
      "Adicione o leite em pó desnatado.",
      "Junte o whey protein e misture bem com um fouet ou espátula até obter um creme homogêneo.",
      "Acrescente o coco ralado sem açúcar e misture delicadamente.",
      "Distribua em potes individuais.",
      "Leve à geladeira por aproximadamente 2 horas, ou até firmar.",
      "Sirva gelado."
    ],
    "macros": {
      "kcal": 160,
      "p": 16,
      "c": 10,
      "f": 6,
      "fiber": 2
    },
    "conservacao": "Conservar em recipiente fechado na geladeira por até 3 dias.",
    "substituicoes": "Whey protein → mesma quantidade de leite em pó desnatado + adoçante culinário a gosto.\r\nIogurte desnatado → iogurte natural zero lactose.\r\nCoco ralado → raspas de chocolate 70% ou castanhas picadas.\r\nMaracujá → morango, manga ou limão."
  },
  {
    "id": "NL-021",
    "name": "Pãozinho de Frigideira com Parmesão e Chia",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [
      "Prático Utilizar farinha de aveia certificada sem glúten quando necessária a exclusão rigorosa."
    ],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "2 colheres (sopa) de farinha de aveia sem glúten"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de iogurte natural"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "1 colher (sopa) de queijo parmesão ralado"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de chia"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Bata levemente o ovo com um garfo.",
      "Acrescente o iogurte, a farinha de aveia, o parmesão e a chia.",
      "Tempere com sal e orégano e misture até obter uma massa homogênea.",
      "Acrescente o fermento por último e misture delicadamente.",
      "Despeje em uma frigideira pequena antiaderente.",
      "Tampe e cozinhe em fogo baixo por aproximadamente 3 minutos.",
      "Quando a massa estiver firme, vire cuidadosamente.",
      "Doure o outro lado por mais 2 a 3 minutos.",
      "Para uma textura mais parecida com pão, corte ao meio e doure rapidamente a parte interna na frigideira."
    ],
    "macros": {
      "kcal": 245,
      "p": 16,
      "c": 17,
      "f": 13
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Iogurte natural → iogurte zero lactose.\r\nParmesão → queijo minas ou muçarela ralada.\r\nChia → linhaça moída.\r\nPode ser recheado com cottage, frango desfiado ou queijo minas. Os recheios acrescentados alteram os macros."
  },
  {
    "id": "NL-022",
    "name": "Bolinho de Banana com Canela e Chocolate",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [
      "Rico em proteínas Utilizar aveia certificada sem glúten. Considerando que não seja adicionado açúcar além do naturalmente presente nos ingredientes e observando a composição do chocolate."
    ],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "1 banana pequena madura"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "2 colheres (sopa) de farinha de aveia sem glúten"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "1 colher (sopa) de whey protein sabor baunilha"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de cacau em pó"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Chocolate 70% picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela em pó a gosto"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      }
    ],
    "steps": [
      "Amasse bem a banana.",
      "Acrescente o ovo e misture.",
      "Adicione a farinha de aveia, o whey, o cacau e a canela.",
      "Misture até obter uma massa homogênea.",
      "Acrescente o fermento por último.",
      "Transfira para uma forminha pequena própria para Air Fryer.",
      "Distribua o chocolate picado sobre a massa.",
      "Asse na Air Fryer a 160°C por aproximadamente 10 a 12 minutos.",
      "Retire quando estiver assado nas bordas e macio no centro."
    ],
    "macros": {
      "kcal": 300,
      "p": 19,
      "c": 38,
      "f": 9
    },
    "conservacao": "Geladeira: até 2 dias em recipiente fechado.",
    "substituicoes": "Chocolate 70% → castanhas picadas.\r\nWhey de baunilha → whey neutro ou sabor leite em pó.\r\nBanana → banana-prata ou nanica bem madura."
  },
  {
    "id": "NL-023",
    "name": "Crepioca Caprese",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "2 colheres (sopa) de goma de tapioca"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de cottage"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Queijo muçarela"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "4 tomates-cereja cortados ao meio"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de manjericão fresco a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Misture o ovo, a goma de tapioca, o cottage e uma pequena quantidade de sal.",
      "Aqueça uma frigideira antiaderente em fogo baixo.",
      "Despeje a massa e espalhe formando um disco.",
      "Cozinhe até a base ficar firme.",
      "Vire e deixe dourar levemente o outro lado.",
      "Distribua a muçarela, os tomates-cereja e o manjericão sobre metade da massa.",
      "Salpique orégano.",
      "Dobre ao meio.",
      "Tampe a frigideira e mantenha em fogo baixo até o queijo derreter.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 310,
      "p": 21,
      "c": 27,
      "f": 14
    },
    "conservacao": "Consumir preferencialmente após o preparo. Se necessário, conservar na geladeira por até 24 horas.",
    "substituicoes": "Muçarela → queijo minas padrão ou muçarela sem lactose.\r\nCottage → creme de ricota.\r\nTomate-cereja → tomate italiano em cubos."
  },
  {
    "id": "NL-024",
    "name": "Overnight de Morango com Cheesecake",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Iogurte natural ou grego"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Aveia sem glúten"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Chia"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Whey sabor baunilha ou leite em pó"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Morangos picados"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cream cheese light"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Essência de baunilha a gosto"
      }
    ],
    "steps": [
      "Misture o iogurte, a aveia, a chia e o whey.",
      "Transfira para um pote individual com tampa.",
      "Leve à geladeira durante a noite, por aproximadamente 6 a 8 horas.",
      "No momento de servir, misture o cream cheese com algumas gotas de baunilha.",
      "Espalhe esse creme sobre o overnight.",
      "Finalize com os morangos picados.",
      "Sirva gelado."
    ],
    "macros": {
      "kcal": 320,
      "p": 27,
      "c": 32,
      "f": 11
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Morango → frutas vermelhas ou manga.\r\nCream cheese light → creme de ricota.\r\nIogurte → versão zero lactose.\r\nWhey → versão sem lactose adequada à necessidade individual."
  },
  {
    "id": "NL-025",
    "name": "Cuscuz Cremoso com Ovo e Queijo",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "40",
        "unit": "g",
        "name": "Flocão de milho"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pitada de sal"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Queijo minas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de cottage ou requeijão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano ou cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Misture o flocão com a água e uma pitada de sal.",
      "Deixe hidratar por aproximadamente 5 minutos.",
      "Transfira para a cuscuzeira e cozinhe até ficar macio.",
      "Enquanto isso, prepare o ovo mexido em uma frigideira antiaderente.",
      "Coloque o cuscuz ainda quente em uma tigela.",
      "Acrescente o ovo, o queijo minas e o cottage.",
      "Misture enquanto estiver quente para que o queijo amoleça e a preparação fique cremosa.",
      "Finalize com orégano ou cheiro-verde."
    ],
    "macros": {
      "kcal": 315,
      "p": 18,
      "c": 34,
      "f": 12
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Queijo minas → muçarela ou queijo coalho em menor quantidade.\r\nCottage → requeijão light.\r\nPara aumentar o aporte proteico, acrescentar frango desfiado. Os macros deverão ser recalculados."
  },
  {
    "id": "NL-026",
    "name": "Panqueca de Maçã com Canela e Creme de Iogurte",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "½ maçã pequena ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Farinha de aveia sem glúten"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Whey sabor baunilha"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Essência de baunilha a gosto"
      }
    ],
    "steps": [
      "Bata levemente o ovo.",
      "Acrescente a maçã ralada, a farinha de aveia, o whey e a canela.",
      "Misture até ficar homogêneo.",
      "Adicione o fermento por último.",
      "Aqueça uma frigideira antiaderente em fogo baixo.",
      "Divida a massa em 2 ou 3 pequenas panquecas.",
      "Cozinhe dos dois lados até ficarem levemente douradas.",
      "Misture o iogurte com a canela e a baunilha.",
      "Sirva o creme sobre as panquecas."
    ],
    "macros": {
      "kcal": 270,
      "p": 23,
      "c": 29,
      "f": 8
    },
    "conservacao": "Geladeira: até 2 dias. Conservar o creme separadamente.",
    "substituicoes": "Maçã → pera.\r\nWhey de baunilha → whey neutro.\r\nIogurte natural → iogurte zero lactose."
  },
  {
    "id": "NL-027",
    "name": "Tortinha de Frango Cremosa na Air Fryer",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Farinha de aveia sem glúten"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e temperos a gosto"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cottage ou requeijão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Tomate picado a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      }
    ],
    "steps": [
      "Misture o ovo, a farinha de aveia, o iogurte, o sal e os temperos.",
      "Acrescente o fermento por último.",
      "Em outra tigela, misture o frango com o cottage, o tomate, o cheiro-verde e a páprica.",
      "Coloque metade da massa em uma forminha de silicone.",
      "Distribua o recheio de frango.",
      "Cubra com o restante da massa.",
      "Leve à Air Fryer preaquecida a 160°C.",
      "Asse por aproximadamente 12 a 15 minutos, até ficar firme e levemente dourada.",
      "Aguarde alguns minutos antes de desenformar."
    ],
    "macros": {
      "kcal": 300,
      "p": 34,
      "c": 18,
      "f": 10
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Frango → atum escorrido.\r\nCottage → requeijão light ou creme de ricota.\r\nIogurte → iogurte zero lactose."
  },
  {
    "id": "NL-028",
    "name": "Tapioca Crocante de Banana, Pasta de Amendoim e Canela",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "Goma de tapioca"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "½ banana grande ou 1 banana pequena"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Pasta de amendoim integral"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Whey protein"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "1 colher (sopa) de água , aproximadamente"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Aqueça bem uma frigideira antiaderente.",
      "Distribua a goma de tapioca uniformemente.",
      "Cozinhe até unir os grãos e deixe dourar um pouco mais do que o habitual para ficar levemente crocante.",
      "Vire rapidamente, se desejar dourar os dois lados.",
      "Distribua a banana fatiada e a pasta de amendoim.",
      "Misture o whey com a água aos poucos até formar um creme.",
      "Coloque o creme de whey sobre a banana.",
      "Finalize com canela.",
      "Dobre e sirva ainda quente."
    ],
    "macros": {
      "kcal": 285,
      "p": 13,
      "c": 43,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente imediatamente após o preparo.",
    "substituicoes": "Banana → morangos.\r\nPasta de amendoim → pasta de amêndoas ou castanha-de-caju.\r\nWhey → proteína em pó adequada à necessidade individual."
  },
  {
    "id": "NL-029",
    "name": "Pão de Queijo Proteico de Frigideira",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Sem glúten",
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Polvilho azedo"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cottage"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Muçarela ralada"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Parmesão ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pitada de sal"
      }
    ],
    "steps": [
      "Coloque o ovo em uma tigela e bata com um garfo.",
      "Acrescente o cottage e misture.",
      "Adicione o polvilho azedo, a muçarela, o parmesão e uma pequena pitada de sal.",
      "Misture até obter uma massa homogênea.",
      "Despeje em uma frigideira pequena antiaderente.",
      "Tampe e cozinhe em fogo baixo.",
      "Quando a base estiver firme e dourada, vire cuidadosamente.",
      "Doure o outro lado.",
      "Sirva ainda quente para aproveitar melhor a textura do queijo."
    ],
    "macros": {
      "kcal": 290,
      "p": 19,
      "c": 24,
      "f": 13
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Cottage → creme de ricota.\r\nMuçarela → queijo minas padrão ralado.\r\nPara versão sem lactose → utilizar queijos e cottage sem lactose."
  },
  {
    "id": "NL-030",
    "name": "Baked Oats de Cenoura com Chocolate",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Aveia sem glúten"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Whey sabor baunilha"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cenoura crua ralada"
      },
      {
        "quantity": "50",
        "unit": "ml",
        "name": "Leite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Chocolate 70% picado"
      }
    ],
    "steps": [
      "Em uma tigela, bata levemente o ovo.",
      "Acrescente a aveia, o whey, a cenoura e o leite.",
      "Misture bem até obter uma massa uniforme. Se preferir uma textura mais lisa, bata rapidamente no liquidificador.",
      "Acrescente a canela.",
      "Adicione o fermento por último e misture delicadamente.",
      "Transfira para uma pequena travessa ou forminha própria para Air Fryer.",
      "Distribua o chocolate 70% sobre a superfície.",
      "Leve à Air Fryer preaquecida a 160°C por aproximadamente 12 minutos.",
      "Retire quando as laterais estiverem assadas e o centro ainda estiver macio.",
      "Aguarde alguns minutos e sirva ainda morno."
    ],
    "macros": {
      "kcal": 315,
      "p": 26,
      "c": 30,
      "f": 11
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Leite → leite zero lactose ou bebida vegetal sem açúcar.\r\nWhey de baunilha → whey sabor leite em pó ou neutro.\r\nChocolate 70% → chocolate com maior percentual de cacau ou castanhas picadas.\r\nCanela → essência de baunilha."
  },
  {
    "id": "NL-031",
    "name": "Escondidinho de Frango com Purê de Batata-Doce",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Batata-doce cozida"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "2 colheres (sopa) de bebida vegetal sem açúcar ou leite sem lactose"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente de alho amassado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      }
    ],
    "steps": [
      "Cozinhe a batata-doce até ficar bem macia.",
      "Ainda quente, amasse até formar um purê.",
      "Acrescente o azeite, a bebida vegetal ou leite sem lactose e o sal.",
      "Misture até obter uma textura cremosa e reserve.",
      "Aqueça o azeite em uma frigideira.",
      "Refogue a cebola e o alho.",
      "Acrescente o tomate e cozinhe por aproximadamente 2 minutos.",
      "Adicione o frango desfiado.",
      "Tempere com páprica, cheiro-verde e sal.",
      "Em um refratário pequeno, coloque todo o recheio de frango.",
      "Cubra com o purê de batata-doce.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 15 minutos.",
      "Sirva ainda quente."
    ],
    "macros": {
      "kcal": 420,
      "p": 40,
      "c": 45,
      "f": 10
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Batata-doce → mandioca, abóbora ou batata inglesa.\r\nFrango → carne moída magra ou carne desfiada.\r\nBebida vegetal → leite zero lactose."
  },
  {
    "id": "NL-032",
    "name": "Frango Cremoso com Leite de Coco e Curry",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "60",
        "unit": "ml",
        "name": "Leite de coco"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ colher (chá) de curry"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cúrcuma a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Coentro ou cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma frigideira.",
      "Refogue a cebola até ficar transparente.",
      "Acrescente o alho e mexa rapidamente.",
      "Adicione os cubos de frango.",
      "Doure bem todos os lados.",
      "Acrescente o tomate.",
      "Tempere com curry, cúrcuma, pimenta-do-reino e sal.",
      "Adicione o leite de coco.",
      "Cozinhe em fogo baixo por aproximadamente 8 minutos, até o molho ficar cremoso.",
      "Finalize com coentro ou cheiro-verde."
    ],
    "macros": {
      "kcal": 360,
      "p": 44,
      "c": 8,
      "f": 17
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Frango → peixe branco ou camarão.\r\nLeite de coco → creme vegetal sem lactose.\r\nCurry → páprica, cúrcuma e cominho."
  },
  {
    "id": "NL-033",
    "name": "Risoto Cremoso de Limão-Siciliano com Frango",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "Arroz arbóreo cru"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango grelhado em tiras"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "300",
        "unit": "ml",
        "name": "Caldo de legumes caseiro quente"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Raspas de ½ limão-siciliano"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de creme vegetal culinário ou creme de castanhas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Aqueça o caldo e mantenha-o quente.",
      "Em uma panela, aqueça o azeite.",
      "Refogue a cebola.",
      "Acrescente o arroz arbóreo e misture por 1 minuto.",
      "Adicione uma concha do caldo quente.",
      "Mexa até o líquido ser quase totalmente absorvido.",
      "Continue adicionando o caldo aos poucos.",
      "Cozinhe por aproximadamente 18 a 20 minutos, até o arroz ficar al dente e cremoso.",
      "Acrescente o creme vegetal.",
      "Adicione as raspas de limão-siciliano.",
      "Ajuste o sal e a pimenta.",
      "Sirva com o frango grelhado em tiras."
    ],
    "macros": {
      "kcal": 500,
      "p": 37,
      "c": 61,
      "f": 12
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Frango → cogumelos para versão vegetariana.\r\nCreme vegetal → creme de castanhas.\r\nLimão-siciliano → limão-taiti, com sabor mais intenso."
  },
  {
    "id": "NL-034",
    "name": "Almôndegas ao Molho de Tomate com Purê de Abóbora",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      },
      {
        "quantity": "180",
        "unit": "g",
        "name": "Abóbora cabotiá cozida"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Noz-moscada a gosto"
      }
    ],
    "steps": [
      "Misture a carne, a farinha de aveia, a cebola e os temperos.",
      "Modele pequenas almôndegas.",
      "Doure em frigideira antiaderente ou asse até ficarem firmes.",
      "Acrescente o molho de tomate e o manjericão.",
      "Cozinhe por mais alguns minutos.",
      "Amasse a abóbora cozida.",
      "Acrescente o azeite, o sal e a noz-moscada.",
      "Misture até formar um purê.",
      "Sirva as almôndegas sobre o purê."
    ],
    "macros": {
      "kcal": 430,
      "p": 39,
      "c": 35,
      "f": 15
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Patinho → frango moído.\r\nAbóbora cabotiá → batata-doce ou mandioquinha.\r\nFarinha de aveia → farinha de arroz."
  },
  {
    "id": "NL-035",
    "name": "Moqueca Rápida de Peixe",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Filé de peixe branco"
      },
      {
        "quantity": "60",
        "unit": "ml",
        "name": "Leite de coco"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Pimentão em tiras"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola em rodelas"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Coentro a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta a gosto"
      }
    ],
    "steps": [
      "Tempere o peixe com limão e sal.",
      "Em uma panela pequena, coloque a cebola, o tomate e o pimentão.",
      "Disponha o peixe sobre os vegetais.",
      "Acrescente o leite de coco.",
      "Tempere com páprica e pimenta.",
      "Tampe e cozinhe em fogo baixo por aproximadamente 12 minutos.",
      "Verifique se o peixe está completamente cozido.",
      "Finalize com coentro."
    ],
    "macros": {
      "kcal": 330,
      "p": 35,
      "c": 10,
      "f": 17
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Peixe branco → camarão.\r\nPimentão → combinação de vermelho e amarelo.\r\nCoentro → salsinha."
  },
  {
    "id": "NL-036",
    "name": "Macarrão Cremoso de Atum e Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "Macarrão cru"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Atum em água escorrido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Creme de castanhas ou creme vegetal"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe o macarrão conforme as instruções da embalagem.",
      "Em uma frigideira, refogue a cebola e o alho.",
      "Acrescente o molho de tomate.",
      "Adicione o atum.",
      "Misture o creme vegetal.",
      "Cozinhe por 2 a 3 minutos.",
      "Acrescente o macarrão cozido.",
      "Misture até envolver toda a massa no molho.",
      "Finalize com manjericão e pimenta-do-reino."
    ],
    "macros": {
      "kcal": 480,
      "p": 35,
      "c": 63,
      "f": 10
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Macarrão tradicional → macarrão de arroz ou milho para versão sem glúten.\r\nAtum → frango desfiado.\r\nCreme de castanhas → creme vegetal culinário."
  },
  {
    "id": "NL-037",
    "name": "Arroz Cremoso de Frango com Legumes",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "Arroz cozido"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Frango desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Cenoura em cubos"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Abobrinha em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Ervilha"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "Leite de coco leve ou creme vegetal"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cúrcuma a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma frigideira.",
      "Acrescente a cenoura e refogue por aproximadamente 2 minutos.",
      "Adicione a abobrinha e a ervilha.",
      "Acrescente o frango desfiado.",
      "Tempere com sal e cúrcuma.",
      "Junte o arroz cozido.",
      "Acrescente o leite de coco ou creme vegetal.",
      "Misture em fogo baixo até ficar cremoso.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 450,
      "p": 40,
      "c": 48,
      "f": 12
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Frango → carne moída magra.\r\nArroz branco → arroz integral.\r\nAbobrinha → brócolis ou couve-flor."
  },
  {
    "id": "NL-038",
    "name": "Quibe Assado Recheado com Homus",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em fibras",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Trigo para quibe hidratado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-síria a gosto"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Homus"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      }
    ],
    "steps": [
      "Hidrate o trigo para quibe e retire bem o excesso de água.",
      "Misture o trigo com a carne moída.",
      "Acrescente a cebola.",
      "Tempere com hortelã, sal e pimenta-síria.",
      "Em uma travessa pequena, coloque metade da mistura.",
      "Espalhe o homus formando uma camada.",
      "Cubra com o restante da massa do quibe.",
      "Regue com o azeite.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 25 minutos.",
      "Aguarde alguns minutos antes de cortar."
    ],
    "macros": {
      "kcal": 440,
      "p": 34,
      "c": 37,
      "f": 18
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Trigo para quibe → quinoa cozida para versão sem glúten.\r\nPatinho → frango moído.\r\nHomus → pasta de grão-de-bico sem tahine."
  },
  {
    "id": "NL-039",
    "name": "Fricassê de Frango sem Lactose",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Milho"
      },
      {
        "quantity": "60",
        "unit": "ml",
        "name": "Leite de coco leve"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Creme de castanhas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente de alho"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Batata-palha"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Bata metade do milho com o leite de coco e o creme de castanhas.",
      "Reserve o creme.",
      "Refogue a cebola e o alho.",
      "Acrescente o frango desfiado.",
      "Adicione o restante do milho.",
      "Tempere com sal e páprica.",
      "Acrescente o creme batido.",
      "Cozinhe em fogo baixo até ficar cremoso.",
      "Finalize com cheiro-verde.",
      "Acrescente a batata-palha somente no momento de servir."
    ],
    "macros": {
      "kcal": 450,
      "p": 36,
      "c": 38,
      "f": 17
    },
    "conservacao": "Geladeira: até 3 dias, sem a batata-palha.",
    "substituicoes": "Creme de castanhas → creme vegetal culinário.\r\nFrango → carne desfiada.\r\nBatata-palha → batata assada em tirinhas para uma versão caseira."
  },
  {
    "id": "NL-040",
    "name": "Lasanha de Abobrinha com Carne e Molho Cremoso",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem lactose",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Abobrinha cortada em lâminas"
      },
      {
        "quantity": "130",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Creme de castanhas ou creme vegetal"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte a abobrinha em lâminas finas.",
      "Aqueça uma frigideira antiaderente.",
      "Doure rapidamente as lâminas dos dois lados para retirar parte da água.",
      "Reserve.",
      "Aqueça o azeite.",
      "Refogue a cebola e o alho.",
      "Acrescente o patinho moído.",
      "Cozinhe até a carne ficar bem dourada.",
      "Acrescente o molho de tomate.",
      "Tempere com sal, pimenta e manjericão.",
      "Em um refratário pequeno, faça uma camada de abobrinha.",
      "Acrescente parte da carne.",
      "Distribua pequenas porções do creme vegetal.",
      "Repita as camadas.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 20 minutos.",
      "Aguarde alguns minutos antes de servir."
    ],
    "macros": {
      "kcal": 410,
      "p": 39,
      "c": 18,
      "f": 21
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Abobrinha → berinjela.\r\nPatinho → frango moído.\r\nCreme de castanhas → creme vegetal culinário."
  },
  {
    "id": "NL-041",
    "name": "Cestinha Crocante de Pão com Ovo e Queijo",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão de forma integral"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Queijo minas frescal"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Achate levemente as fatias de pão com um rolo ou com as mãos.",
      "Acomode cada fatia em uma forminha de silicone, moldando o formato de cestinha.",
      "Distribua o tomate picado no fundo.",
      "Acrescente o queijo minas.",
      "Divida o ovo entre as duas cestinhas ou utilize um ovo pequeno em cada uma, caso queira aumentar o volume da receita.",
      "Tempere com sal, pimenta-do-reino e orégano.",
      "Leve à Air Fryer preaquecida a 180°C por aproximadamente 8 a 10 minutos.",
      "Retire quando o pão estiver crocante e o ovo atingir o ponto desejado.",
      "Sirva ainda quente."
    ],
    "macros": {
      "kcal": 310,
      "p": 19,
      "c": 26,
      "f": 14,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.\r\nSe necessário, conservar em recipiente fechado na geladeira por até 24 horas.",
    "substituicoes": "Queijo minas → ricota ou cottage.\r\nPão integral → pão sem glúten, quando necessário.\r\nTomate → tomate-cereja.\r\nPara uma alimentação vegetariana estrita quanto ao processo de fabricação, utilizar queijo produzido com coalho microbiano ou vegetal."
  },
  {
    "id": "NL-042",
    "name": "Bolinho de Mandioca com Queijo na Air Fryer",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Prática Desde que a farinha de aveia utilizada seja certificada sem glúten."
    ],
    "time": "10min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Mandioca cozida e amassada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Queijo minas em cubinhos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "1 colher (sopa) de farinha de aveia sem glúten"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      }
    ],
    "steps": [
      "Cozinhe a mandioca até ficar bem macia.",
      "Escorra completamente e amasse ainda quente.",
      "Acrescente a farinha de aveia, o azeite, o cheiro-verde e uma pequena quantidade de sal.",
      "Misture até formar uma massa moldável.",
      "Divida a massa em 4 partes iguais.",
      "Abra cada porção na palma da mão.",
      "Coloque um cubinho de queijo no centro.",
      "Feche cuidadosamente, formando bolinhos.",
      "Disponha na cesta da Air Fryer.",
      "Asse a 190°C por aproximadamente 15 minutos.",
      "Vire os bolinhos na metade do tempo para dourarem por igual.",
      "Sirva ainda quentes."
    ],
    "macros": {
      "kcal": 350,
      "p": 12,
      "c": 48,
      "f": 13,
      "fiber": 3
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Mandioca → batata inglesa ou mandioquinha.\r\nQueijo minas → muçarela ou queijo minas padrão.\r\nFarinha de aveia → farinha de arroz."
  },
  {
    "id": "NL-043",
    "name": "Sanduíche Quente de Ricota Cremosa e Tomate",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão integral"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Ricota"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de manjericão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Amasse a ricota com um garfo.",
      "Acrescente o requeijão e misture até formar um creme.",
      "Espalhe o creme sobre uma das fatias de pão.",
      "Distribua o tomate em rodelas.",
      "Acrescente o manjericão, o orégano e a pimenta-do-reino.",
      "Feche o sanduíche com a segunda fatia.",
      "Leve à sanduicheira ou frigideira antiaderente.",
      "Doure dos dois lados até o pão ficar crocante e o recheio aquecido.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 330,
      "p": 20,
      "c": 31,
      "f": 13,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.",
    "substituicoes": "Requeijão → creme de ricota.\r\nRicota → cottage.\r\nPão integral → pão sem glúten ou pão de fermentação natural.\r\nTomate → tomate-cereja."
  },
  {
    "id": "NL-044",
    "name": "Batata Rosti de Frigideira com Queijo",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Batata inglesa crua"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Queijo minas padrão ralado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Descasque e rale a batata no ralo grosso.",
      "Coloque em um pano limpo ou papel-toalha.",
      "Aperte bem para retirar o máximo possível de água.",
      "Tempere com sal e pimenta-do-reino.",
      "Aqueça metade do azeite em uma frigideira pequena.",
      "Coloque metade da batata e pressione formando um disco.",
      "Distribua o queijo no centro.",
      "Cubra com o restante da batata.",
      "Pressione levemente.",
      "Cozinhe em fogo baixo até dourar.",
      "Vire cuidadosamente.",
      "Acrescente o restante do azeite.",
      "Doure o outro lado.",
      "Finalize com orégano e sirva quente."
    ],
    "macros": {
      "kcal": 345,
      "p": 14,
      "c": 35,
      "f": 17,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente na hora.\r\nSe necessário, conservar sob refrigeração por até 2 dias.",
    "substituicoes": "Queijo minas padrão → muçarela ou queijo minas frescal.\r\nBatata inglesa → batata-doce.\r\nPode acrescentar cheiro-verde ou tomate picado ao recheio."
  },
  {
    "id": "NL-045",
    "name": "Bolo de Caneca de Milho com Coco",
    "tipo": "bolo",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Milho cozido"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Fubá"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "Leite"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Coco ralado sem açúcar"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Açúcar demerara ou adoçante culinário equivalente"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      }
    ],
    "steps": [
      "Coloque o ovo, o milho e o leite no mixer ou liquidificador.",
      "Bata até obter uma mistura homogênea.",
      "Transfira para uma tigela.",
      "Acrescente o fubá, o coco e o açúcar ou adoçante.",
      "Misture bem.",
      "Acrescente o fermento por último.",
      "Despeje em uma caneca grande própria para micro-ondas.",
      "Leve ao micro-ondas por aproximadamente 2 a 3 minutos.",
      "Aguarde 1 minuto antes de consumir."
    ],
    "macros": {
      "kcal": 290,
      "p": 11,
      "c": 35,
      "f": 12,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Leite → leite sem lactose ou bebida vegetal.\r\nAçúcar demerara → adoçante culinário.\r\nPode acrescentar canela ou essência de baunilha."
  },
  {
    "id": "NL-046",
    "name": "Pão Francês Recheado com Ovo Cremoso e Queijo Minas",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão francês pequeno"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "2 ovos inteiros"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Queijo minas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "1 colher (sopa) de leite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Quebre os ovos em uma tigela.",
      "Acrescente o leite e uma pequena pitada de sal.",
      "Bata levemente.",
      "Despeje em uma frigideira antiaderente em fogo baixo.",
      "Mexa delicadamente até os ovos começarem a firmar, mantendo textura cremosa.",
      "Acrescente o queijo minas e o tomate.",
      "Misture apenas até o queijo aquecer.",
      "Abra o pão francês ao meio.",
      "Recheie com os ovos ainda quentes.",
      "Finalize com pimenta-do-reino e cheiro-verde.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 410,
      "p": 25,
      "c": 31,
      "f": 21,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.",
    "substituicoes": "Pão francês → pão integral.\r\nQueijo minas → muçarela ou cottage.\r\nLeite → leite sem lactose."
  },
  {
    "id": "NL-047",
    "name": "Croquete Assado de Batata e Ricota",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 5,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Batata cozida e amassada"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Ricota"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a batata até ficar macia.",
      "Escorra e amasse completamente.",
      "Acrescente a ricota amassada.",
      "Adicione a farinha de aveia e o azeite.",
      "Tempere com cheiro-verde, orégano, sal e pimenta-do-reino.",
      "Misture até formar uma massa moldável.",
      "Divida e modele 5 pequenos croquetes.",
      "Disponha em uma assadeira ou cesta da Air Fryer.",
      "Asse a 190°C por aproximadamente 15 minutos.",
      "Vire na metade do tempo.",
      "Retire quando estiverem levemente dourados."
    ],
    "macros": {
      "kcal": 310,
      "p": 14,
      "c": 39,
      "f": 11,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Ricota → cottage mais firme.\r\nBatata → batata-doce ou mandioquinha.\r\nPode acrescentar cenoura ralada ou espinafre bem picado."
  },
  {
    "id": "NL-048",
    "name": "Pãozinho Assado de Iogurte e Queijo",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Farinha de trigo integral"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Queijo minas ralado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "2.5",
        "unit": "g",
        "name": "½ colher (chá) de fermento químico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Coloque a farinha em uma tigela.",
      "Acrescente o iogurte, o queijo e o azeite.",
      "Tempere com sal e orégano.",
      "Misture até formar uma massa macia.",
      "Acrescente o fermento e incorpore delicadamente.",
      "Divida a massa em 2 partes.",
      "Modele dois pãezinhos.",
      "Disponha em uma forminha ou assadeira pequena.",
      "Leve à Air Fryer a 180°C por aproximadamente 12 a 15 minutos.",
      "Retire quando estiverem crescidos e dourados."
    ],
    "macros": {
      "kcal": 320,
      "p": 15,
      "c": 37,
      "f": 13,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Queijo minas → parmesão ou muçarela.\r\nIogurte natural → iogurte zero lactose.\r\nPode acrescentar ervas secas, chia ou gergelim à massa."
  },
  {
    "id": "NL-049",
    "name": "Creme de Mamão com Iogurte, Coco e Castanhas",
    "tipo": "sobremesa",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Mamão"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Iogurte natural ou grego"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Coco ralado sem açúcar"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Castanhas picadas"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Chia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Coloque o mamão e o iogurte no liquidificador ou mixer.",
      "Bata até formar um creme homogêneo.",
      "Transfira para uma tigela.",
      "Finalize com o coco ralado.",
      "Acrescente as castanhas picadas.",
      "Salpique a chia.",
      "Finalize com canela a gosto.",
      "Sirva imediatamente ou gelado."
    ],
    "macros": {
      "kcal": 275,
      "p": 13,
      "c": 27,
      "f": 13,
      "fiber": 6
    },
    "conservacao": "Geladeira: até 24 horas, em recipiente fechado.",
    "substituicoes": "Iogurte natural → iogurte grego ou iogurte com maior teor de proteína.\r\nCastanhas → amêndoas ou nozes.\r\nMamão → manga, quando desejar variar."
  },
  {
    "id": "NL-050",
    "name": "Tortinha Rápida de Pão com Queijo, Tomate e Espinafre",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão integral"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "Leite"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Queijo minas"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Espinafre picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte o pão em pequenos cubos.",
      "Distribua os cubos em um refratário individual próprio para Air Fryer.",
      "Em uma tigela, bata o ovo com o leite.",
      "Tempere com sal e pimenta-do-reino.",
      "Acrescente o tomate, o espinafre e o queijo sobre os cubos de pão.",
      "Despeje a mistura de ovo por cima.",
      "Pressione levemente com uma colher para que o líquido seja absorvido pelo pão.",
      "Finalize com orégano.",
      "Leve à Air Fryer a 180°C por aproximadamente 10 a 12 minutos.",
      "Retire quando estiver firme e dourada.",
      "Aguarde alguns minutos antes de servir."
    ],
    "macros": {
      "kcal": 350,
      "p": 22,
      "c": 29,
      "f": 17,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Espinafre → cenoura ralada, abobrinha ou cheiro-verde.\r\nQueijo minas → muçarela ou ricota.\r\nLeite → leite sem lactose.\r\nPão integral → pão sem glúten quando necessário."
  },
  {
    "id": "NL-051",
    "name": "Frango à Pizzaiolo Gratinado",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Filé de peito de frango"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Muçarela"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de manjericão a gosto"
      }
    ],
    "steps": [
      "Tempere o filé de frango com alho, sal e pimenta-do-reino.",
      "Aqueça o azeite em uma frigideira.",
      "Doure o filé dos dois lados até ficar praticamente cozido.",
      "Transfira para um refratário pequeno.",
      "Espalhe o molho de tomate sobre o frango.",
      "Cubra com a muçarela.",
      "Distribua as rodelas de tomate.",
      "Finalize com orégano.",
      "Leve ao forno ou à Air Fryer preaquecida a 200°C por aproximadamente 8 minutos, até o queijo derreter e gratinar.",
      "Finalize com folhas de manjericão fresco e sirva."
    ],
    "macros": {
      "kcal": 440,
      "p": 55,
      "c": 8,
      "f": 20,
      "fiber": 2
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Muçarela → queijo minas padrão ou muçarela zero lactose.\r\nFrango → filé de peru.\r\nMolho de tomate → molho caseiro de tomates frescos."
  },
  {
    "id": "NL-052",
    "name": "Abobrinha Recheada com Carne Moída e Queijo",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "1 abobrinha média"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Muçarela ralada"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Lave a abobrinha e corte ao meio no sentido do comprimento.",
      "Retire cuidadosamente parte do miolo com uma colher, formando duas cavidades.",
      "Pique o miolo retirado e reserve.",
      "Aqueça o azeite em uma frigideira.",
      "Refogue a cebola e o alho.",
      "Acrescente o patinho e cozinhe até ficar bem soltinho e dourado.",
      "Junte o miolo da abobrinha e o molho de tomate.",
      "Tempere com sal, páprica e cheiro-verde.",
      "Recheie as duas metades da abobrinha com a carne.",
      "Cubra com a muçarela.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 20 minutos, até a abobrinha ficar macia e o queijo gratinar.",
      "Sirva ainda quente."
    ],
    "macros": {
      "kcal": 475,
      "p": 48,
      "c": 13,
      "f": 26,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Patinho → frango desfiado.\r\nMuçarela → queijo minas ou muçarela sem lactose.\r\nAbobrinha → berinjela."
  },
  {
    "id": "NL-053",
    "name": "Filé de Tilápia Crocante com Parmesão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Air Fryer Desde que todos os ingredientes utilizados sejam certificados sem glúten."
    ],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Filé de tilápia"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Queijo parmesão ralado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "1 ovo pequeno batido"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Farinha de linhaça"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere a tilápia com limão, alho, sal, páprica e pimenta-do-reino.",
      "Em um prato, misture o parmesão com a farinha de linhaça.",
      "Passe o filé no ovo batido, cobrindo toda a superfície.",
      "Em seguida, passe na mistura de parmesão e linhaça.",
      "Pressione levemente para que a cobertura fique bem aderida.",
      "Coloque na cesta da Air Fryer preaquecida.",
      "Asse a 190°C por aproximadamente 12 a 15 minutos.",
      "Retire quando o peixe estiver cozido e a cobertura dourada e crocante.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 390,
      "p": 52,
      "c": 4,
      "f": 19,
      "fiber": 2
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Tilápia → linguado, pescada ou outro peixe branco.\r\nParmesão → queijo curado ralado.\r\nFarinha de linhaça → farinha de amêndoas."
  },
  {
    "id": "NL-054",
    "name": "Rocambole de Carne Moída Recheado com Queijo",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Muçarela"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "1 colher (sopa) de cheiro-verde"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "1 ovo pequeno"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque a carne moída em uma tigela.",
      "Acrescente o ovo, a cebola, o cheiro-verde e os temperos.",
      "Misture até obter uma massa homogênea.",
      "Abra a carne sobre uma folha de papel-manteiga, formando um retângulo.",
      "Distribua a muçarela e a cenoura sobre a carne, deixando as bordas livres.",
      "Com auxílio do papel, enrole cuidadosamente formando um rocambole.",
      "Feche bem as laterais para evitar que o recheio escape.",
      "Transfira para uma assadeira.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 30 minutos.",
      "Retire e aguarde cerca de 5 minutos antes de fatiar."
    ],
    "macros": {
      "kcal": 520,
      "p": 54,
      "c": 7,
      "f": 30,
      "fiber": 1.5
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Muçarela → queijo minas ou ricota temperada.\r\nPatinho → frango moído.\r\nCenoura → espinafre refogado."
  },
  {
    "id": "NL-055",
    "name": "Frango Cremoso com Mostarda e Queijo",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Creme de leite leve ou zero lactose"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Queijo minas padrão ralado"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "1 colher (sopa) de mostarda"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere os cubos de frango com alho, sal e pimenta-do-reino.",
      "Aqueça o azeite em uma frigideira.",
      "Acrescente o frango e deixe dourar bem.",
      "Junte a cebola e refogue até ficar macia.",
      "Acrescente a mostarda.",
      "Adicione o creme de leite e misture.",
      "Cozinhe em fogo baixo por aproximadamente 3 minutos.",
      "Acrescente o queijo minas.",
      "Misture até derreter e formar um molho cremoso.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 465,
      "p": 55,
      "c": 7,
      "f": 23,
      "fiber": 1
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Creme de leite → versão zero lactose ou creme de ricota.\r\nQueijo minas → muçarela.\r\nFrango → filé suíno em cubos."
  },
  {
    "id": "NL-056",
    "name": "Berinjela Recheada com Frango Cremoso",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "1 berinjela pequena"
      },
      {
        "quantity": "140",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Creme de ricota"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Muçarela ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Corte a berinjela ao meio no sentido do comprimento.",
      "Retire cuidadosamente parte da polpa.",
      "Pique a polpa retirada e reserve.",
      "Aqueça o azeite em uma frigideira.",
      "Refogue a cebola.",
      "Acrescente a polpa da berinjela e o tomate.",
      "Adicione o frango desfiado.",
      "Tempere com sal, páprica e cheiro-verde.",
      "Acrescente o creme de ricota e misture até formar um recheio cremoso.",
      "Distribua o recheio nas duas metades da berinjela.",
      "Cubra com a muçarela.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 20 minutos.",
      "Retire quando a berinjela estiver macia e o queijo gratinado."
    ],
    "macros": {
      "kcal": 430,
      "p": 51,
      "c": 17,
      "f": 19,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Creme de ricota → requeijão light ou zero lactose.\r\nFrango → carne moída magra.\r\nMuçarela → queijo minas padrão."
  },
  {
    "id": "NL-057",
    "name": "Camarão ao Alho e Limão com Abobrinha Salteada",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Camarão limpo"
      },
      {
        "quantity": "180",
        "unit": "g",
        "name": "Abobrinha em meia-lua"
      },
      {
        "quantity": "6",
        "unit": "g",
        "name": "2 dentes de alho amassados ou picados"
      },
      {
        "quantity": "10",
        "unit": "ml",
        "name": "2 colheres (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      }
    ],
    "steps": [
      "Tempere o camarão com limão, sal, pimenta-do-reino e páprica.",
      "Aqueça metade do azeite em uma frigideira.",
      "Acrescente o alho e deixe perfumar rapidamente, sem queimar.",
      "Adicione o camarão.",
      "Cozinhe por aproximadamente 2 minutos de cada lado, apenas até mudar de cor e ficar cozido.",
      "Retire o camarão e reserve.",
      "Na mesma frigideira, acrescente o restante do azeite.",
      "Adicione a abobrinha.",
      "Salteie em fogo alto até dourar, mantendo-a levemente firme.",
      "Retorne o camarão à frigideira.",
      "Misture por alguns segundos.",
      "Finalize com salsinha e sirva."
    ],
    "macros": {
      "kcal": 340,
      "p": 43,
      "c": 10,
      "f": 14,
      "fiber": 3
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Camarão → cubos de peixe ou frango.\r\nAbobrinha → brócolis ou aspargos.\r\nSalsinha → coentro."
  },
  {
    "id": "NL-058",
    "name": "Bife ao Molho Cremoso de Cebola com Brócolis",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Sem glúten* Desde que a mostarda e os demais produtos utilizados sejam certificados sem glúten."
    ],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Bife de alcatra ou contrafilé"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Brócolis cozido al dente"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cebola fatiada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Creme de leite leve"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere o bife com sal e pimenta-do-reino.",
      "Aqueça bem uma frigideira.",
      "Grelhe o bife dos dois lados até atingir o ponto desejado.",
      "Retire e reserve por alguns minutos.",
      "Na mesma frigideira, acrescente o azeite.",
      "Adicione a cebola e refogue até ficar macia e levemente dourada.",
      "Acrescente o creme de leite e a mostarda.",
      "Misture em fogo baixo até formar um molho cremoso.",
      "Retorne o bife à frigideira por alguns segundos.",
      "Sirva acompanhado do brócolis cozido al dente."
    ],
    "macros": {
      "kcal": 510,
      "p": 47,
      "c": 13,
      "f": 30,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Creme de leite → versão zero lactose.\r\nAlcatra → filé mignon ou contrafilé.\r\nBrócolis → couve-flor, abobrinha ou vagem."
  },
  {
    "id": "NL-059",
    "name": "Frango Crocante à Parmegiana Low Carb",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Air Fryer Desde que todos os ingredientes utilizados sejam certificados sem glúten."
    ],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Filé de peito de frango"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "1 ovo pequeno"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Queijo parmesão ralado"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Farinha de linhaça"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Muçarela"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Tempere o frango com alho, sal e páprica.",
      "Bata levemente o ovo.",
      "Em outro recipiente, misture o parmesão e a farinha de linhaça.",
      "Passe o filé no ovo.",
      "Em seguida, empane na mistura de parmesão e linhaça.",
      "Coloque na Air Fryer preaquecida a 190°C.",
      "Asse por aproximadamente 12 minutos, virando na metade do tempo.",
      "Cubra o frango com o molho de tomate.",
      "Distribua a muçarela sobre o molho.",
      "Retorne à Air Fryer por mais 4 a 5 minutos.",
      "Retire quando o queijo estiver derretido e gratinado.",
      "Finalize com orégano."
    ],
    "macros": {
      "kcal": 520,
      "p": 62,
      "c": 8,
      "f": 26,
      "fiber": 2
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Muçarela → queijo minas padrão.\r\nParmesão → queijo curado ralado.\r\nFrango → filé de peixe branco firme.\r\nAcompanhar com salada, legumes assados ou purê de couve-flor."
  },
  {
    "id": "NL-060",
    "name": "Carne Desfiada com Repolho Cremoso",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Refeição completa Desde que o requeijão e os demais produtos utilizados sejam certificados sem glúten."
    ],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Carne bovina cozida e desfiada"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Repolho fatiado fino"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Requeijão light"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma frigideira grande.",
      "Refogue a cebola e o alho.",
      "Acrescente o repolho fatiado.",
      "Refogue até ficar macio, porém ainda levemente crocante.",
      "Acrescente o tomate.",
      "Adicione a carne desfiada.",
      "Tempere com sal, páprica e pimenta-do-reino.",
      "Misture até a carne estar completamente aquecida.",
      "Acrescente o requeijão light.",
      "Misture em fogo baixo até envolver toda a preparação e formar um molho cremoso.",
      "Finalize com cheiro-verde e sirva."
    ],
    "macros": {
      "kcal": 455,
      "p": 45,
      "c": 14,
      "f": 24,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Requeijão light → requeijão zero lactose ou creme de ricota.\r\nCarne bovina → frango desfiado.\r\nRepolho → acelga ou couve fatiada."
  },
  {
    "id": "NL-061",
    "name": "Nachos Crocantes de Rap10 com Guacamole",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Vegana"
    ],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "40",
        "unit": "g",
        "name": "1 unidade de Rap10 ou wrap"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Abacate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Corte o Rap10 em triângulos.",
      "Pincele o azeite sobre os pedaços.",
      "Tempere com páprica e orégano.",
      "Leve à Air Fryer preaquecida a 180°C por aproximadamente 6 a 8 minutos, até ficarem dourados e crocantes.",
      "Enquanto isso, amasse o abacate com um garfo.",
      "Acrescente o tomate e a cebola.",
      "Tempere com limão, sal e cheiro-verde.",
      "Misture até formar um guacamole rústico.",
      "Sirva os nachos ainda crocantes com o guacamole."
    ],
    "macros": {
      "kcal": 330,
      "p": 7,
      "c": 34,
      "f": 20,
      "fiber": 7
    },
    "conservacao": "O guacamole pode ser conservado na geladeira por até 24 horas, bem fechado e com contato reduzido com o ar. Os nachos devem ser mantidos em recipiente seco e fechado.",
    "substituicoes": "Rap10 → wrap integral ou versão sem glúten.\r\nGuacamole → molho de iogurte temperado.\r\nCheiro-verde → coentro."
  },
  {
    "id": "NL-062",
    "name": "Pão de Alho Cremoso na Air Fryer",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão francês pequeno"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Muçarela ralada"
      },
      {
        "quantity": "3",
        "unit": "g",
        "name": "1 dente pequeno de alho amassado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Misture o requeijão com o alho, o azeite e a salsinha.",
      "Faça cortes no pão sem separar completamente as fatias.",
      "Distribua o creme entre os cortes.",
      "Acrescente a muçarela por cima.",
      "Finalize com orégano.",
      "Leve à Air Fryer preaquecida a 180°C por aproximadamente 5 a 7 minutos.",
      "Retire quando o pão estiver crocante e o queijo derretido."
    ],
    "macros": {
      "kcal": 320,
      "p": 13,
      "c": 31,
      "f": 16
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.",
    "substituicoes": "Pão francês → pão integral ou pão de fermentação natural.\r\nRequeijão → creme de ricota.\r\nMuçarela → queijo minas padrão."
  },
  {
    "id": "NL-063",
    "name": "Frango Crocante em Tirinhas na Air Fryer",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Peito de frango em tiras"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo pequeno"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Parmesão ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere as tiras de frango com alho, sal, páprica e pimenta-do-reino.",
      "Bata levemente o ovo.",
      "Em outro recipiente, misture a farinha de aveia com o parmesão.",
      "Passe cada tira de frango no ovo.",
      "Em seguida, empane na mistura de farinha e queijo.",
      "Distribua na cesta da Air Fryer sem sobrepor.",
      "Asse a 190°C por aproximadamente 15 minutos.",
      "Vire na metade do tempo.",
      "Retire quando estiverem douradas e completamente cozidas."
    ],
    "macros": {
      "kcal": 390,
      "p": 48,
      "c": 18,
      "f": 14
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Farinha de aveia → farinha de arroz.\r\nParmesão → queijo curado ralado.\r\nPode ser servido com molho de mostarda e iogurte ou molho de tomate temperado."
  },
  {
    "id": "NL-064",
    "name": "Mini Pizza no Pão Sírio",
    "tipo": "prato",
    "meals": [
      "snack",
      "dinner"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão sírio pequeno"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Muçarela"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      }
    ],
    "steps": [
      "Coloque o pão sírio em uma assadeira ou diretamente na cesta da Air Fryer.",
      "Espalhe o molho de tomate.",
      "Distribua a muçarela.",
      "Acrescente as rodelas de tomate.",
      "Finalize com orégano.",
      "Asse a 180°C por aproximadamente 7 a 8 minutos.",
      "Retire quando o queijo estiver derretido e as bordas do pão crocantes.",
      "Finalize com manjericão fresco."
    ],
    "macros": {
      "kcal": 360,
      "p": 19,
      "c": 41,
      "f": 14
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.",
    "substituicoes": "Pão sírio → pão sírio integral ou versão sem glúten.\r\nMuçarela → queijo minas padrão.\r\nPode acrescentar milho, cebola, rúcula ou azeitonas."
  },
  {
    "id": "NL-065",
    "name": "Batata Rústica com Molho Cremoso de Ervas",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "Batata inglesa com casca"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Lave bem as batatas e mantenha a casca.",
      "Corte em gomos de tamanho semelhante.",
      "Misture com azeite, páprica, alecrim, sal e pimenta.",
      "Distribua na Air Fryer sem sobrepor.",
      "Asse a 200°C por aproximadamente 20 a 25 minutos.",
      "Mexa ou vire na metade do tempo.",
      "Enquanto isso, misture o iogurte, a mostarda, o limão e o cheiro-verde.",
      "Sirva as batatas bem quentes com o molho cremoso."
    ],
    "macros": {
      "kcal": 290,
      "p": 8,
      "c": 47,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 2 dias, mantendo o molho separado.",
    "substituicoes": "Batata inglesa → batata-doce.\r\nIogurte natural → iogurte zero lactose.\r\nAlecrim → orégano ou tomilho."
  },
  {
    "id": "NL-066",
    "name": "Empadinha Rápida de Frango Cremoso",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pitada de sal"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Frango desfiado"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Misture a farinha de aveia, o ovo, o azeite e o sal.",
      "Trabalhe a massa até ficar moldável.",
      "Divida entre 3 pequenas forminhas de silicone.",
      "Forre o fundo e as laterais.",
      "Misture o frango com o requeijão, o tomate e o cheiro-verde.",
      "Distribua o recheio entre as forminhas.",
      "Leve à Air Fryer a 180°C por aproximadamente 15 minutos.",
      "Retire quando as bordas estiverem douradas e o recheio bem aquecido."
    ],
    "macros": {
      "kcal": 410,
      "p": 31,
      "c": 34,
      "f": 17
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Frango → carne moída.\r\nRequeijão → creme de ricota.\r\nFarinha de aveia → farinha de aveia sem glúten certificada."
  },
  {
    "id": "NL-067",
    "name": "Queijo Coalho Crocante com Tomate e Orégano",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "Queijo coalho em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de manjericão a gosto"
      }
    ],
    "steps": [
      "Corte o queijo coalho em cubos médios.",
      "Distribua na cesta da Air Fryer.",
      "Asse a 190°C por aproximadamente 5 a 7 minutos.",
      "Retire quando estiver dourado por fora.",
      "Sirva com os tomates-cereja.",
      "Finalize com orégano, pimenta-do-reino e manjericão."
    ],
    "macros": {
      "kcal": 340,
      "p": 24,
      "c": 8,
      "f": 24
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.",
    "substituicoes": "Queijo coalho → queijo minas padrão firme.\r\nTomate-cereja → tomate italiano em cubos.\r\nPara uma versão vegetariana mais criteriosa, escolher queijo produzido com coalho microbiano ou vegetal."
  },
  {
    "id": "NL-068",
    "name": "Torradinhas de Alho com Creme de Ricota Temperado",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão integral"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente pequeno de alho"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Ricota"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Corte o pão em tiras.",
      "Misture o azeite com o alho amassado.",
      "Pincele a mistura sobre as tiras de pão.",
      "Leve à Air Fryer a 180°C por aproximadamente 6 a 8 minutos.",
      "Enquanto isso, amasse a ricota.",
      "Acrescente o requeijão.",
      "Tempere com limão, sal, pimenta e cheiro-verde.",
      "Misture até formar um creme.",
      "Sirva as torradas ainda crocantes com o creme."
    ],
    "macros": {
      "kcal": 300,
      "p": 16,
      "c": 29,
      "f": 14,
      "fiber": 4
    },
    "conservacao": "O creme pode ser mantido na geladeira por até 3 dias. As torradas devem ser mantidas separadas em recipiente seco e bem fechado.",
    "substituicoes": "Requeijão → creme de ricota.\r\nPão integral → pão sem glúten.\r\nPode acrescentar ervas frescas ou tomate seco picado ao creme."
  },
  {
    "id": "NL-069",
    "name": "Mini Hambúrguer Caseiro com Queijo e Molho Especial",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 mini pães de hambúrguer (50 g no total)"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Muçarela"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de alface a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Ketchup"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      }
    ],
    "steps": [
      "Tempere o patinho com sal, pimenta-do-reino e páprica.",
      "Divida a carne em 2 partes iguais.",
      "Modele dois mini hambúrgueres.",
      "Aqueça uma frigideira antiaderente.",
      "Grelhe por aproximadamente 3 minutos de cada lado, ou até estarem completamente cozidos.",
      "Coloque a muçarela sobre os hambúrgueres ainda quentes.",
      "Tampe por alguns segundos para derreter.",
      "Misture o iogurte, a mostarda, o ketchup e a páprica.",
      "Aqueça rapidamente os mini pães.",
      "Espalhe o molho.",
      "Acrescente o hambúrguer com queijo.",
      "Finalize com tomate e alface.",
      "Feche e sirva."
    ],
    "macros": {
      "kcal": 430,
      "p": 35,
      "c": 34,
      "f": 19,
      "fiber": 3
    },
    "conservacao": "O hambúrguer preparado pode ser conservado na geladeira por até 3 dias. O sanduíche deve ser montado no momento do consumo.",
    "substituicoes": "Patinho → acém magro ou peito de frango moído.\r\nMuçarela → queijo minas padrão.\r\nMini pão tradicional → versão integral."
  },
  {
    "id": "NL-070",
    "name": "Banana Assada com Chocolate e Pasta de Amendoim",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Sem glúten",
      "Vegana"
    ],
    "ressalvas": [
      "Sem açúcar adicionado** Desde que todos os ingredientes utilizados sejam certificados sem glúten. Considerando chocolate e pasta de amendoim sem adição de açúcar."
    ],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 banana média"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Chocolate 70%"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Pasta de amendoim integral"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Castanhas picadas"
      }
    ],
    "steps": [
      "Faça um corte longitudinal na banana sem atravessá-la completamente.",
      "Abra delicadamente a parte central.",
      "Distribua o chocolate picado dentro da banana.",
      "Leve à Air Fryer a 180°C por aproximadamente 7 a 8 minutos.",
      "Retire quando a banana estiver macia e o chocolate derretido.",
      "Finalize com a pasta de amendoim.",
      "Acrescente as castanhas picadas.",
      "Salpique canela.",
      "Sirva ainda quente."
    ],
    "macros": {
      "kcal": 280,
      "p": 6,
      "c": 38,
      "f": 13,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente imediatamente após o preparo.",
    "substituicoes": "Pasta de amendoim → pasta de castanhas ou amêndoas.\r\nCastanhas → amendoim torrado ou nozes.\r\nChocolate 70% → chocolate com maior percentual de cacau."
  },
  {
    "id": "NL-071",
    "name": "Frango Grelhado com Feijão-Branco e Legumes",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Peito de frango"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Feijão-branco cozido e escorrido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Abobrinha em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Cenoura em rodelas finas"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere o frango com alho, sal, páprica e pimenta-do-reino.",
      "Aqueça uma frigideira antiaderente e grelhe o frango dos dois lados até ficar dourado e completamente cozido.",
      "Retire da frigideira e reserve.",
      "Em outra frigideira, aqueça o azeite.",
      "Acrescente a cenoura e refogue por alguns minutos.",
      "Junte a abobrinha e o tomate.",
      "Refogue até os legumes ficarem cozidos, mas ainda levemente firmes.",
      "Acrescente o feijão-branco cozido.",
      "Misture delicadamente para não desmanchar os grãos.",
      "Ajuste os temperos e finalize com cheiro-verde.",
      "Fatie o frango e sirva sobre ou ao lado dos legumes com feijão."
    ],
    "macros": {
      "kcal": 410,
      "p": 48,
      "c": 32,
      "f": 11,
      "fiber": 9
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Feijão-branco → feijão-preto, carioca ou fradinho.\r\nFrango → peixe grelhado ou patinho em tiras.\r\nAbobrinha → chuchu ou vagem.\r\nCenoura → abóbora em pequena quantidade."
  },
  {
    "id": "NL-072",
    "name": "Carne Moída com Abóbora e Vagem",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Abóbora cabotiá em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Vagem picada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente o patinho moído.",
      "Cozinhe em fogo médio, mexendo para deixar a carne bem soltinha.",
      "Quando estiver dourada, acrescente o tomate.",
      "Junte a abóbora e a vagem.",
      "Acrescente um pequeno volume de água.",
      "Tampe a panela e cozinhe até os legumes ficarem macios, evitando deixar a abóbora desmanchar completamente.",
      "Ajuste o sal e a pimenta-do-reino.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 430,
      "p": 42,
      "c": 25,
      "f": 19,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Abóbora → chuchu ou abobrinha.\r\nPatinho → frango moído.\r\nVagem → brócolis ou couve-flor."
  },
  {
    "id": "NL-073",
    "name": "Peixe Assado com Crosta de Ervas e Lentilha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "Filé de peixe branco"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Lentilha cozida e escorrida"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cebola picada"
      }
    ],
    "steps": [
      "Tempere o peixe com limão, alho, sal e pimenta-do-reino.",
      "Misture a farinha de aveia com a salsinha e o azeite.",
      "Distribua a mistura sobre a superfície do peixe, pressionando delicadamente para formar uma crosta fina.",
      "Coloque em um refratário.",
      "Leve ao forno preaquecido a 200°C por aproximadamente 15 a 20 minutos.",
      "Enquanto isso, coloque a lentilha cozida em uma tigela.",
      "Acrescente o tomate e a cebola.",
      "Misture delicadamente e ajuste os temperos.",
      "Retire o peixe quando estiver completamente cozido e com a crosta levemente dourada.",
      "Sirva acompanhado da lentilha."
    ],
    "macros": {
      "kcal": 405,
      "p": 45,
      "c": 33,
      "f": 10,
      "fiber": 10
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Peixe branco → tilápia, pescada ou linguado.\r\nLentilha → feijão-fradinho ou grão-de-bico.\r\nFarinha de aveia → farinha de linhaça ou aveia certificada sem glúten."
  },
  {
    "id": "NL-074",
    "name": "Picadinho de Carne com Quiabo e Arroz Integral",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "140",
        "unit": "g",
        "name": "Patinho em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Quiabo"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Arroz integral cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Aqueça bem uma panela ou frigideira.",
      "Acrescente o azeite e doure os cubos de carne.",
      "Junte a cebola e o alho.",
      "Refogue até a cebola ficar macia.",
      "Acrescente o tomate.",
      "Adicione o quiabo cortado em pedaços.",
      "Cozinhe até ficar macio, mexendo delicadamente.",
      "Ajuste o sal e a pimenta-do-reino.",
      "Aqueça o arroz integral previamente cozido.",
      "Sirva o picadinho acompanhado do arroz."
    ],
    "macros": {
      "kcal": 440,
      "p": 39,
      "c": 34,
      "f": 18,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Patinho → coxão mole.\r\nQuiabo → vagem ou abobrinha.\r\nArroz integral → quinoa cozida."
  },
  {
    "id": "NL-075",
    "name": "Frango com Brócolis ao Molho de Iogurte e Limão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Brócolis"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere o frango com alho, sal e pimenta-do-reino.",
      "Aqueça o azeite em uma frigideira.",
      "Acrescente o frango e deixe dourar bem.",
      "Junte o brócolis.",
      "Salteie até ficar cozido, mantendo alguma crocância.",
      "Em um recipiente separado, misture o iogurte, o limão e a mostarda.",
      "Desligue o fogo.",
      "Acrescente o molho de iogurte à frigideira.",
      "Misture delicadamente apenas até envolver o frango e o brócolis.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 360,
      "p": 52,
      "c": 14,
      "f": 11,
      "fiber": 6
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Iogurte natural → iogurte zero lactose.\r\nBrócolis → couve-flor.\r\nFrango → peixe branco em cubos."
  },
  {
    "id": "NL-076",
    "name": "Omelete de Forno com Frango e Legumes",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "2 ovos inteiros"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Abobrinha ralada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Queijo minas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Preaqueça o forno a 180°C.",
      "Quebre os ovos em uma tigela e bata ligeiramente com um garfo.",
      "Acrescente o frango desfiado.",
      "Junte a abobrinha, a cenoura, o tomate e a cebola.",
      "Tempere com sal, orégano e cheiro-verde.",
      "Misture até distribuir bem os ingredientes.",
      "Transfira para um refratário individual.",
      "Distribua o queijo minas por cima.",
      "Leve ao forno por aproximadamente 20 minutos.",
      "Retire quando o centro estiver firme e a superfície levemente dourada."
    ],
    "macros": {
      "kcal": 390,
      "p": 43,
      "c": 13,
      "f": 19,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Frango → atum ou carne moída.\r\nQueijo minas → muçarela ou cottage.\r\nAbobrinha → espinafre ou brócolis picado."
  },
  {
    "id": "NL-077",
    "name": "Lombo Suíno com Couve Refogada e Feijão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Lombo suíno em bifes"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Feijão carioca cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Couve fatiada finamente"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho amassado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere o lombo com alho, limão, sal e pimenta-do-reino.",
      "Aqueça bem uma frigideira antiaderente.",
      "Grelhe os bifes dos dois lados até ficarem dourados e completamente cozidos.",
      "Retire e reserve.",
      "Na mesma frigideira ou em outra panela, aqueça o azeite.",
      "Acrescente a couve.",
      "Refogue rapidamente, apenas até murchar, preservando a textura e a cor.",
      "Aqueça o feijão previamente cozido.",
      "Sirva o lombo acompanhado da couve e do feijão."
    ],
    "macros": {
      "kcal": 430,
      "p": 46,
      "c": 23,
      "f": 17,
      "fiber": 8
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Lombo suíno → peito de frango.\r\nFeijão carioca → feijão-preto ou fradinho.\r\nCouve → brócolis ou escarola."
  },
  {
    "id": "NL-078",
    "name": "Frango com Berinjela e Tomate à Mediterrânea",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Berinjela em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Azeitonas picadas"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere os cubos de frango com alho, sal e pimenta-do-reino.",
      "Aqueça o azeite em uma frigideira grande.",
      "Acrescente o frango e deixe dourar.",
      "Junte a cebola e o alho.",
      "Acrescente a berinjela.",
      "Refogue até começar a ficar macia.",
      "Adicione o tomate e as azeitonas.",
      "Misture e cozinhe por mais alguns minutos.",
      "Ajuste o sal, lembrando que as azeitonas já apresentam sabor salgado.",
      "Finalize com orégano e sirva."
    ],
    "macros": {
      "kcal": 380,
      "p": 46,
      "c": 17,
      "f": 15,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Frango → peixe branco em cubos.\r\nBerinjela → abobrinha.\r\nAzeitonas → alcaparras em pequena quantidade."
  },
  {
    "id": "NL-079",
    "name": "Salmão com Purê Rústico de Couve-Flor e Alho",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Filé de salmão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "180",
        "unit": "g",
        "name": "Couve-flor"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "20",
        "unit": "ml",
        "name": "Leite ou bebida vegetal sem açúcar"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      }
    ],
    "steps": [
      "Tempere o salmão com limão, sal e pimenta-do-reino.",
      "Grelhe em uma frigideira antiaderente ou asse até atingir o ponto desejado.",
      "Enquanto isso, cozinhe a couve-flor até ficar bem macia.",
      "Escorra completamente.",
      "Amasse grosseiramente com um garfo ou amassador.",
      "Acrescente o alho, o azeite e o leite aos poucos.",
      "Misture até obter um purê cremoso, mantendo uma textura levemente rústica.",
      "Ajuste o sal e a pimenta.",
      "Finalize com salsinha.",
      "Sirva o salmão acompanhado do purê."
    ],
    "macros": {
      "kcal": 455,
      "p": 37,
      "c": 12,
      "f": 29,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Salmão → tilápia ou outro peixe.\r\nCouve-flor → brócolis.\r\nLeite → bebida vegetal sem açúcar ou leite zero lactose."
  },
  {
    "id": "NL-080",
    "name": "Almôndegas de Frango com Molho de Tomate e Abobrinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Frango moído"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Abobrinha cortada em tiras finas"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      }
    ],
    "steps": [
      "Coloque o frango moído em uma tigela.",
      "Acrescente a cebola, a farinha de aveia, o alho, o sal, a páprica e o cheiro-verde.",
      "Misture até formar uma massa homogênea.",
      "Modele pequenas almôndegas.",
      "Aqueça uma frigideira antiaderente.",
      "Doure as almôndegas de todos os lados.",
      "Acrescente o molho de tomate.",
      "Tampe e cozinhe em fogo baixo por aproximadamente 8 minutos ou até as almôndegas estarem completamente cozidas.",
      "Em outra frigideira, aqueça o azeite.",
      "Acrescente as tiras de abobrinha.",
      "Salteie rapidamente, mantendo-as levemente firmes.",
      "Coloque a abobrinha no prato e distribua as almôndegas com o molho por cima.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 390,
      "p": 43,
      "c": 20,
      "f": 15,
      "fiber": 6
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Frango moído → patinho moído.\r\nFarinha de aveia → farinha de linhaça ou aveia certificada sem glúten.\r\nAbobrinha → berinjela ou brócolis.\r\nMolho de tomate → molho caseiro de tomates frescos."
  },
  {
    "id": "NL-081",
    "name": "Salada de Frango Grelhado com Manga e Molho de Mostarda",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Peito de frango grelhado em tiras"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Manga em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Alface"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Rúcula"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere o frango com sal e pimenta-do-reino.",
      "Grelhe em frigideira antiaderente até dourar e ficar completamente cozido.",
      "Corte em tiras e reserve.",
      "Higienize e seque bem as folhas.",
      "Disponha alface e rúcula em uma tigela.",
      "Acrescente o tomate-cereja, a cenoura e a manga.",
      "Distribua o frango sobre a salada.",
      "Em um recipiente separado, misture o iogurte, a mostarda, o azeite e o limão.",
      "Ajuste o sal e a pimenta.",
      "Tempere a salada somente no momento de servir."
    ],
    "macros": {
      "kcal": 390,
      "p": 43,
      "c": 30,
      "f": 11,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 24 horas, mantendo o molho separado.",
    "substituicoes": "Manga → abacaxi ou maçã.\r\nIogurte natural → iogurte zero lactose.\r\nFrango → camarão ou peixe grelhado."
  },
  {
    "id": "NL-082",
    "name": "Salada Crocante de Carne em Tiras com Molho de Limão",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Alcatra ou patinho em tiras"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Alface"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Repolho roxo fatiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Pepino"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere a carne com sal e pimenta.",
      "Aqueça bem uma frigideira.",
      "Acrescente o azeite e grelhe a carne rapidamente até dourar.",
      "Reserve mantendo a carne morna.",
      "Misture alface, repolho, pepino, tomate e cenoura.",
      "Distribua a carne sobre os vegetais.",
      "Misture o limão, azeite e mostarda.",
      "Ajuste sal e pimenta.",
      "Tempere somente na hora de servir."
    ],
    "macros": {
      "kcal": 410,
      "p": 37,
      "c": 15,
      "f": 23,
      "fiber": 6
    },
    "conservacao": "Geladeira: até 24 horas, mantendo carne e molho separados quando possível.",
    "substituicoes": "Alcatra → patinho ou filé mignon.\r\nRepolho roxo → repolho branco.\r\nPepino → abobrinha crua em lâminas finas."
  },
  {
    "id": "NL-083",
    "name": "Salada de Atum com Batata, Ovo e Vagem",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "Atum em água escorrido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Batata cozida em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Vagem cozida"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Folhas verdes"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão ou vinagre a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a batata até ficar macia, mas firme.",
      "Cozinhe a vagem até ficar al dente.",
      "Cozinhe o ovo e corte em quartos.",
      "Disponha as folhas verdes em uma tigela.",
      "Acrescente a batata, a vagem, o tomate e a cebola.",
      "Junte o atum escorrido.",
      "Distribua o ovo.",
      "Misture azeite, limão ou vinagre e mostarda.",
      "Ajuste os temperos.",
      "Regue a salada apenas na hora de servir."
    ],
    "macros": {
      "kcal": 405,
      "p": 35,
      "c": 33,
      "f": 15,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Batata inglesa → batata-doce.\r\nAtum → frango desfiado.\r\nVagem → brócolis."
  },
  {
    "id": "NL-084",
    "name": "Salada de Frango com Abacaxi e Molho Cremoso",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Frango grelhado em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Abacaxi em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Alface americana"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Repolho fatiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Milho"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere e grelhe o frango.",
      "Corte em cubos e reserve.",
      "Em uma tigela, misture alface, repolho e cenoura.",
      "Acrescente o milho.",
      "Junte o abacaxi.",
      "Distribua o frango sobre os vegetais.",
      "Misture o iogurte com mostarda e limão.",
      "Ajuste sal e pimenta.",
      "Envolva a salada no molho somente na hora de consumir."
    ],
    "macros": {
      "kcal": 370,
      "p": 42,
      "c": 29,
      "f": 9,
      "fiber": 6
    },
    "conservacao": "Geladeira: até 24 horas, mantendo o molho separado.",
    "substituicoes": "Abacaxi → manga.\r\nFrango → camarão.\r\nIogurte → versão zero lactose."
  },
  {
    "id": "NL-085",
    "name": "Salada de Salmão com Abacate e Pepino",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Salmão grelhado"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Abacate"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Pepino"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Folhas verdes"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Ervas a gosto"
      }
    ],
    "steps": [
      "Tempere o salmão com sal e pimenta.",
      "Grelhe até atingir o ponto desejado.",
      "Higienize e seque as folhas.",
      "Misture as folhas com pepino, tomate e cebola.",
      "Acrescente o abacate em cubos.",
      "Corte o salmão em pedaços grandes.",
      "Distribua sobre a salada.",
      "Misture limão, azeite e ervas.",
      "Regue no momento de servir."
    ],
    "macros": {
      "kcal": 510,
      "p": 32,
      "c": 14,
      "f": 36,
      "fiber": 7
    },
    "conservacao": "Geladeira: até 24 horas, preferencialmente mantendo salmão e molho separados.",
    "substituicoes": "Salmão → atum fresco ou tilápia.\r\nAbacate → avocado.\r\nPepino → abobrinha crua em lâminas finas."
  },
  {
    "id": "NL-086",
    "name": "Salada de Frango com Grão-de-Bico e Tomate",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "110",
        "unit": "g",
        "name": "Frango grelhado em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Grão-de-bico cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Pepino"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Folhas verdes"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere e grelhe o frango.",
      "Corte em cubos.",
      "Em uma tigela, misture o grão-de-bico, tomate, pepino e cebola.",
      "Acrescente as folhas verdes.",
      "Junte o frango.",
      "Tempere com azeite, limão, páprica, sal e pimenta.",
      "Finalize com cheiro-verde.",
      "Misture delicadamente e sirva."
    ],
    "macros": {
      "kcal": 430,
      "p": 42,
      "c": 37,
      "f": 13,
      "fiber": 10
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Grão-de-bico → lentilha ou feijão-fradinho.\r\nFrango → atum ou carne em tiras.\r\nPepino → abobrinha crua."
  },
  {
    "id": "NL-087",
    "name": "Salada Caesar Leve com Frango",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "140",
        "unit": "g",
        "name": "Peito de frango grelhado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Alface romana ou americana"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Parmesão ralado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Pão integral em cubinhos"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ dente pequeno de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte o pão em cubinhos.",
      "Doure na Air Fryer ou frigideira até ficar crocante.",
      "Tempere e grelhe o frango.",
      "Corte em tiras.",
      "Disponha a alface em uma tigela.",
      "Acrescente o frango.",
      "Distribua o parmesão.",
      "Acrescente os croutons.",
      "Misture iogurte, mostarda, azeite, limão e alho.",
      "Tempere com sal e pimenta.",
      "Regue a salada somente na hora de servir."
    ],
    "macros": {
      "kcal": 405,
      "p": 49,
      "c": 17,
      "f": 16,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 24 horas, mantendo molho e croutons separados.",
    "substituicoes": "Croutons → podem ser retirados para reduzir os carboidratos.\r\nParmesão → queijo minas padrão.\r\nIogurte → versão zero lactose."
  },
  {
    "id": "NL-088",
    "name": "Salada de Camarão com Manga, Pepino e Folhas",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Camarão limpo"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Manga"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Pepino"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Rúcula"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde ou coentro a gosto"
      }
    ],
    "steps": [
      "Tempere o camarão com alho, sal e pimenta.",
      "Aqueça o azeite em uma frigideira.",
      "Doure os camarões rapidamente por aproximadamente 2 minutos de cada lado.",
      "Retire e reserve.",
      "Em uma tigela, misture rúcula, pepino, tomate e manga.",
      "Acrescente os camarões.",
      "Misture limão, azeite e ervas.",
      "Regue a salada apenas no momento de servir."
    ],
    "macros": {
      "kcal": 350,
      "p": 37,
      "c": 24,
      "f": 12,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Camarão → peixe branco grelhado.\r\nManga → abacaxi.\r\nRúcula → mix de folhas."
  },
  {
    "id": "NL-089",
    "name": "Salada de Ovos com Batata-Doce e Molho de Iogurte",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "2 ovos cozidos"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Batata-doce cozida em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Folhas verdes"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Pepino"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe os ovos.",
      "Cozinhe a batata-doce até ficar macia, mantendo os cubos firmes.",
      "Higienize e seque as folhas.",
      "Misture folhas, tomate, pepino e cenoura.",
      "Acrescente a batata-doce.",
      "Corte os ovos e distribua sobre a salada.",
      "Misture o iogurte com mostarda e limão.",
      "Tempere com sal e pimenta.",
      "Regue somente na hora de servir."
    ],
    "macros": {
      "kcal": 390,
      "p": 20,
      "c": 40,
      "f": 17,
      "fiber": 8
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Batata-doce → batata inglesa.\r\nIogurte → versão zero lactose.\r\nPara aumentar o teor proteico, acrescentar cottage (50 g), recalculando os macros."
  },
  {
    "id": "NL-090",
    "name": "Salada de Carne Desfiada com Feijão-Fradinho e Vinagrete",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Carne bovina cozida e desfiada"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Feijão-fradinho cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate em cubos"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Pimentão"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Folhas verdes"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Vinagre ou limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o feijão-fradinho em uma tigela.",
      "Acrescente tomate, pimentão e cebola.",
      "Misture delicadamente.",
      "Adicione a carne desfiada.",
      "Acrescente as folhas verdes.",
      "Misture azeite, vinagre ou limão.",
      "Tempere com sal e pimenta.",
      "Regue a salada.",
      "Finalize com bastante cheiro-verde.",
      "Sirva fria ou em temperatura ambiente."
    ],
    "macros": {
      "kcal": 440,
      "p": 39,
      "c": 30,
      "f": 19,
      "fiber": 9
    },
    "conservacao": "Geladeira: até 2 dias, em recipiente fechado.",
    "substituicoes": "Carne bovina → patinho, acém magro ou músculo desfiado.\r\nFeijão-fradinho → feijão-branco.\r\nPimentão → pepino ou cenoura."
  },
  {
    "id": "NL-091",
    "name": "Molho Cremoso de Mostarda e Mel",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "40",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mel"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o iogurte em um recipiente pequeno.",
      "Acrescente a mostarda e o mel.",
      "Adicione o azeite.",
      "Tempere com limão, sal e pimenta-do-reino.",
      "Misture vigorosamente até obter um molho homogêneo e cremoso.",
      "Mantenha refrigerado até o momento de servir."
    ],
    "macros": {
      "kcal": 35,
      "p": 0.6,
      "c": 2.5,
      "f": 2.5,
      "fiber": 0.1
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Iogurte natural → iogurte zero lactose.\r\nMel → melado ou retirar para uma versão menos adocicada.\r\nMostarda tradicional → mostarda Dijon."
  },
  {
    "id": "NL-092",
    "name": "Molho de Iogurte com Limão e Ervas",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha picada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha picada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o iogurte em uma tigela.",
      "Acrescente o suco de limão.",
      "Adicione o azeite.",
      "Junte a salsinha e a cebolinha.",
      "Tempere com sal e pimenta.",
      "Misture até ficar cremoso e homogêneo.",
      "Sirva gelado ou mantenha refrigerado até o consumo."
    ],
    "macros": {
      "kcal": 27,
      "p": 0.8,
      "c": 1.3,
      "f": 2,
      "fiber": 0.1
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Iogurte natural → versão zero lactose.\r\nSalsinha e cebolinha → hortelã, dill ou manjericão."
  },
  {
    "id": "NL-093",
    "name": "Molho de Laranja com Mostarda",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Vegana"
    ],
    "ressalvas": [],
    "time": "3min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "ml",
        "name": "Suco natural de laranja"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de vinagre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o suco de laranja em um recipiente.",
      "Acrescente a mostarda e o vinagre.",
      "Adicione o azeite lentamente.",
      "Tempere com sal e pimenta.",
      "Misture vigorosamente até o molho ficar uniforme.",
      "Sirva imediatamente ou mantenha refrigerado."
    ],
    "macros": {
      "kcal": 24,
      "p": 0.2,
      "c": 2.2,
      "f": 1.7,
      "fiber": 0.1
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Laranja → tangerina.\r\nVinagre → vinagre de maçã.\r\nMostarda tradicional → mostarda Dijon."
  },
  {
    "id": "NL-094",
    "name": "Molho Cremoso de Alho",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ dente pequeno de alho amassado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Coloque o iogurte em uma tigela.",
      "Acrescente o alho bem amassado.",
      "Adicione o azeite e algumas gotas de limão.",
      "Tempere com sal.",
      "Acrescente o cheiro-verde.",
      "Misture bem.",
      "Deixe descansar na geladeira por 10 a 15 minutos antes de servir para intensificar o sabor."
    ],
    "macros": {
      "kcal": 28,
      "p": 0.7,
      "c": 1.4,
      "f": 2.2,
      "fiber": 0.1
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Iogurte → iogurte zero lactose.\r\nCheiro-verde → salsinha, cebolinha ou dill."
  },
  {
    "id": "NL-095",
    "name": "Molho de Azeite, Limão e Orégano",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegana",
      "Sem lactose",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "2min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "10",
        "unit": "ml",
        "name": "1 colher (sopa) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o azeite, o limão e a água em um recipiente pequeno.",
      "Acrescente orégano, sal e pimenta.",
      "Misture vigorosamente com um garfo até formar uma emulsão.",
      "Utilize imediatamente sobre a salada."
    ],
    "macros": {
      "kcal": 45,
      "p": 0,
      "c": 0.5,
      "f": 5,
      "fiber": 0
    },
    "conservacao": "Pode ser mantido na geladeira por até 3 dias. Misture novamente antes de usar.",
    "substituicoes": "Limão → vinagre de maçã.\r\nOrégano → manjericão seco, tomilho ou ervas finas."
  },
  {
    "id": "NL-096",
    "name": "Molho Rosé Leve",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "40",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Ketchup"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Algumas gotas de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o iogurte em uma tigela.",
      "Acrescente o ketchup e a mostarda.",
      "Adicione algumas gotas de limão.",
      "Tempere com páprica e pimenta.",
      "Misture até ficar uniforme e cremoso.",
      "Mantenha refrigerado até servir."
    ],
    "macros": {
      "kcal": 15,
      "p": 0.6,
      "c": 2,
      "f": 0.5,
      "fiber": 0.1
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Iogurte → versão zero lactose.\r\nKetchup tradicional → ketchup sem adição de açúcar.\r\nMostarda → mostarda Dijon."
  },
  {
    "id": "NL-097",
    "name": "Molho de Vinagre Balsâmico e Mel",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "2min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "10",
        "unit": "ml",
        "name": "Vinagre balsâmico"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mel"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o vinagre balsâmico e o mel em um recipiente.",
      "Misture até dissolver.",
      "Acrescente a água.",
      "Adicione o azeite.",
      "Tempere com sal e pimenta.",
      "Misture vigorosamente até ficar uniforme."
    ],
    "macros": {
      "kcal": 35,
      "p": 0,
      "c": 4,
      "f": 2.5,
      "fiber": 0
    },
    "conservacao": "Geladeira: até 5 dias, em recipiente fechado.",
    "substituicoes": "Mel → melado.\r\nVinagre balsâmico → vinagre de vinho tinto, com sabor diferente."
  },
  {
    "id": "NL-098",
    "name": "Molho Cremoso de Parmesão",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [
      "Cremoso Para uma versão vegetariana criteriosa, utilizar parmesão elaborado com coalho microbiano ou vegetal."
    ],
    "time": "4min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Parmesão ralado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o iogurte em uma tigela.",
      "Acrescente o parmesão.",
      "Adicione o azeite e o limão.",
      "Tempere com pimenta-do-reino.",
      "Misture até obter um creme homogêneo.",
      "Se desejar uma textura mais fluida, acrescente uma pequena quantidade de água."
    ],
    "macros": {
      "kcal": 46,
      "p": 2.7,
      "c": 1.2,
      "f": 3.5,
      "fiber": 0
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Iogurte → iogurte zero lactose.\r\nParmesão → queijo minas padrão ralado.\r\nLimão → limão-siciliano."
  },
  {
    "id": "NL-099",
    "name": "Molho de Maracujá com Mostarda",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "4min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "Polpa de maracujá"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mel"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "1 colher (sopa) de água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pitada de sal"
      }
    ],
    "steps": [
      "Coloque a polpa de maracujá em um recipiente.",
      "Acrescente a mostarda e o mel.",
      "Adicione o azeite e a água.",
      "Tempere com uma pequena pitada de sal.",
      "Misture vigorosamente até formar um molho levemente encorpado.",
      "Sirva sobre a salada apenas no momento do consumo."
    ],
    "macros": {
      "kcal": 32,
      "p": 0.3,
      "c": 4,
      "f": 1.7,
      "fiber": 0.6
    },
    "conservacao": "Geladeira: até 3 dias.",
    "substituicoes": "Mel → melado.\r\nMaracujá → manga batida ou suco concentrado de laranja.\r\nMostarda tradicional → Dijon."
  },
  {
    "id": "NL-100",
    "name": "Molho Cremoso de Requeijão e Ervas",
    "tipo": "molho",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o requeijão e o iogurte em uma tigela.",
      "Misture até formar um creme.",
      "Acrescente a água aos poucos para ajustar a consistência.",
      "Adicione o limão.",
      "Acrescente salsinha, cebolinha e orégano.",
      "Tempere com sal e pimenta-do-reino.",
      "Misture novamente até ficar uniforme.",
      "Mantenha refrigerado até servir."
    ],
    "macros": {
      "kcal": 27,
      "p": 1,
      "c": 1.3,
      "f": 2,
      "fiber": 0.1
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Requeijão → requeijão light, zero lactose ou creme de ricota.\r\nIogurte natural → iogurte zero lactose.\r\nSalsinha e cebolinha → manjericão, dill ou outras ervas frescas."
  },
  {
    "id": "NL-101",
    "name": "Salada Crocante de Repolho com Maçã e Cenoura",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "Repolho roxo fatiado fino"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Repolho branco fatiado fino"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Maçã em tiras finas"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa fatiada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Higienize os vegetais e a maçã.",
      "Fatie finamente os dois tipos de repolho.",
      "Acrescente a cenoura, a maçã e a cebola roxa.",
      "Em outro recipiente, misture o iogurte, a mostarda e o limão.",
      "Tempere com sal e pimenta.",
      "Misture o molho à salada apenas na hora de servir.",
      "Sirva imediatamente ou mantenha refrigerada."
    ],
    "macros": {
      "kcal": 78,
      "p": 2,
      "c": 16,
      "f": 1,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 24 horas, preferencialmente com o molho separado.",
    "substituicoes": "Maçã → pera.\r\nIogurte natural → iogurte zero lactose.\r\nRepolho roxo → aumentar a quantidade de repolho branco."
  },
  {
    "id": "NL-102",
    "name": "Salada de Folhas com Morango e Vinagrete Balsâmico",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Alface"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Rúcula"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Morangos fatiados"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "10",
        "unit": "ml",
        "name": "Vinagre balsâmico"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher (chá) de mel"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Higienize e seque bem as folhas.",
      "Fatie os morangos.",
      "Corte os tomates-cereja ao meio.",
      "Fatie finamente a cebola.",
      "Misture os ingredientes da salada.",
      "Em um recipiente pequeno, misture azeite, vinagre balsâmico e mel.",
      "Tempere com sal e pimenta.",
      "Regue apenas no momento de servir."
    ],
    "macros": {
      "kcal": 72,
      "p": 1.5,
      "c": 11,
      "f": 2.5,
      "fiber": 2.5
    },
    "conservacao": "Geladeira: até 24 horas, com o molho separado.",
    "substituicoes": "Morango → uvas cortadas ao meio.\r\nRúcula → agrião.\r\nMel → melado."
  },
  {
    "id": "NL-103",
    "name": "Salada de Pepino Cremosa com Limão e Hortelã",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Pepino em rodelas finas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola roxa fatiada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã picada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Fatie o pepino bem fino.",
      "Acrescente a cebola roxa.",
      "Em outro recipiente, misture o iogurte e o limão.",
      "Tempere com sal e pimenta.",
      "Acrescente a hortelã.",
      "Envolva o pepino e a cebola no molho.",
      "Leve à geladeira por alguns minutos, se desejar servir mais gelada."
    ],
    "macros": {
      "kcal": 43,
      "p": 2,
      "c": 7,
      "f": 1,
      "fiber": 1.5
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Hortelã → cheiro-verde.\r\nIogurte → versão zero lactose.\r\nCebola roxa → cebola branca em pequena quantidade."
  },
  {
    "id": "NL-104",
    "name": "Salada de Tomate, Manga e Cebola Roxa",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana",
      "Sem glúten",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Tomate em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Manga em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola roxa fatiada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte o tomate e a manga em cubos.",
      "Fatie finamente a cebola.",
      "Misture os três ingredientes.",
      "Tempere com limão e azeite.",
      "Acrescente sal e pimenta.",
      "Finalize com cheiro-verde.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 86,
      "p": 1.5,
      "c": 15,
      "f": 2.5,
      "fiber": 2.5
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Manga → abacaxi.\r\nCheiro-verde → coentro.\r\nTomate → tomate-cereja."
  },
  {
    "id": "NL-105",
    "name": "Salada de Abobrinha Crua com Limão e Ervas",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana",
      "Sem glúten",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "Abobrinha fatiada bem fina"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Fatie a abobrinha em lâminas bem finas.",
      "Corte os tomates-cereja ao meio.",
      "Fatie a cebola.",
      "Misture os vegetais.",
      "Tempere com limão e azeite.",
      "Acrescente orégano, manjericão, sal e pimenta.",
      "Deixe descansar por aproximadamente 5 minutos.",
      "Sirva."
    ],
    "macros": {
      "kcal": 56,
      "p": 2,
      "c": 7,
      "f": 2.5,
      "fiber": 2
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Abobrinha → pepino.\r\nManjericão → salsinha.\r\nTomate-cereja → tomate italiano."
  },
  {
    "id": "NL-106",
    "name": "Salada de Beterraba com Laranja e Hortelã",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana",
      "Rico em fibras",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Beterraba cozida em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Laranja em gomos"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de hortelã a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte a beterraba cozida em cubos.",
      "Separe a laranja em gomos.",
      "Fatie a cebola finamente.",
      "Misture a beterraba com a laranja.",
      "Acrescente a cebola.",
      "Tempere com azeite e limão.",
      "Ajuste sal e pimenta.",
      "Finalize com folhas de hortelã."
    ],
    "macros": {
      "kcal": 92,
      "p": 2,
      "c": 17,
      "f": 2.5,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Laranja → tangerina.\r\nHortelã → salsinha.\r\nCebola roxa → cebola branca."
  },
  {
    "id": "NL-107",
    "name": "Salada de Cenoura com Uva-Passa e Molho de Laranja",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana",
      "Rico em fibras",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Uva-passa"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Maçã picada"
      },
      {
        "quantity": "20",
        "unit": "ml",
        "name": "Suco de laranja"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      }
    ],
    "steps": [
      "Rale a cenoura.",
      "Corte a maçã em pequenos cubos.",
      "Misture cenoura, maçã e uva-passa.",
      "Acrescente o suco de laranja.",
      "Junte o azeite e algumas gotas de limão.",
      "Tempere com uma pequena quantidade de sal.",
      "Misture bem.",
      "Leve à geladeira por alguns minutos antes de servir, se desejar."
    ],
    "macros": {
      "kcal": 108,
      "p": 1.5,
      "c": 21,
      "f": 2.5,
      "fiber": 4
    },
    "conservacao": "Geladeira: até 24 horas.",
    "substituicoes": "Uva-passa → pode ser retirada sem prejuízo da receita.\r\nMaçã → pera.\r\nLaranja → tangerina."
  },
  {
    "id": "NL-108",
    "name": "Salada de Chuchu com Tomate e Vinagrete",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana",
      "Sem glúten",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Chuchu cozido em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Pimentão picado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Vinagre ou limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte o chuchu em cubos.",
      "Cozinhe até ficar macio, mas ainda firme.",
      "Escorra e espere esfriar completamente.",
      "Acrescente tomate, cebola e pimentão.",
      "Tempere com azeite e vinagre ou limão.",
      "Ajuste sal e pimenta.",
      "Finalize com cheiro-verde.",
      "Sirva fria ou em temperatura ambiente."
    ],
    "macros": {
      "kcal": 58,
      "p": 1.5,
      "c": 8,
      "f": 2.5,
      "fiber": 2.5
    },
    "conservacao": "Geladeira: até 2 dias.",
    "substituicoes": "Chuchu → abobrinha cozida al dente.\r\nPimentão → pepino.\r\nVinagre → limão."
  },
  {
    "id": "NL-109",
    "name": "Salada de Folhas com Pera e Molho de Mostarda",
    "tipo": "salada",
    "meals": [],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Alface"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Rúcula"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Pera fatiada"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola roxa"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mel"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Higienize e seque as folhas.",
      "Fatie a pera.",
      "Corte os tomates-cereja.",
      "Fatie finamente a cebola.",
      "Misture todos os ingredientes da salada.",
      "Em outro recipiente, misture mostarda, mel, azeite e limão.",
      "Ajuste sal e pimenta.",
      "Tempere a salada somente na hora de servir."
    ],
    "macros": {
      "kcal": 105,
      "p": 2,
      "c": 17,
      "f": 3,
      "fiber": 3
    },
    "conservacao": "Geladeira: até 24 horas, mantendo o molho separado.",
    "substituicoes": "Pera → maçã.\r\nRúcula → agrião.\r\nMel → melado."
  },
  {
    "id": "NL-110",
    "name": "Salada Colorida de Legumes Assados",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras",
      "Sem glúten",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "Abobrinha em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Berinjela em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Pimentão em cubos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Tomate-cereja"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cebola em pedaços"
      },
      {
        "quantity": "10",
        "unit": "ml",
        "name": "2 colheres (chá) de azeite de oliva extravirgem"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde ou manjericão a gosto"
      }
    ],
    "steps": [
      "Corte todos os vegetais em tamanhos semelhantes.",
      "Coloque em uma tigela.",
      "Acrescente o azeite.",
      "Tempere com alho, orégano, sal e pimenta.",
      "Misture bem para envolver todos os vegetais.",
      "Distribua na cesta da Air Fryer ou em uma assadeira.",
      "Asse a 200°C por aproximadamente 20 minutos.",
      "Mexa na metade do tempo para dourar por igual.",
      "Retire quando estiverem macios e levemente dourados.",
      "Espere amornar.",
      "Finalize com cheiro-verde ou manjericão.",
      "Sirva morna ou fria."
    ],
    "macros": {
      "kcal": 115,
      "p": 3,
      "c": 15,
      "f": 5,
      "fiber": 5
    },
    "conservacao": "Geladeira: até 3 dias, em recipiente fechado.",
    "substituicoes": "Abobrinha → chuchu.\r\nBerinjela → abóbora.\r\nPimentão → cenoura.\r\nManjericão → cheiro-verde."
  },
  {
    "id": "NL-111",
    "name": "Flan de Coco com Banana",
    "tipo": "sobremesa",
    "meals": [
      "breakfast",
      "snack",
      "dessert"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Sem glúten* Desde que todos os ingredientes utilizados sejam certificados sem glúten."
    ],
    "time": "5min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "2 ovos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 banana média madura"
      },
      {
        "quantity": "240",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "coco ralado sem açúcar"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (sopa) de eritritol ou outro adoçante culinário, opcional"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Coco ralado a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Morangos frescos a gosto"
      }
    ],
    "steps": [
      "Coloque no liquidificador ou mixer os ovos, a banana, o iogurte, o coco ralado e o eritritol.",
      "Bata até obter uma mistura lisa e homogênea.",
      "Unte levemente uma forma ou refratário pequeno próprio para micro-ondas.",
      "Despeje a mistura no recipiente.",
      "Leve ao micro-ondas, em potência máxima, por aproximadamente 5 minutos.",
      "Verifique o ponto: o centro deve estar firme, mas ainda úmido e macio.",
      "Retire e deixe esfriar completamente.",
      "Para uma textura mais firme, leve à geladeira por pelo menos 1 hora.",
      "Finalize com coco ralado e morangos frescos, se desejar."
    ],
    "macros": {
      "kcal": 175,
      "p": 6,
      "c": 12,
      "f": 12,
      "fiber": 2
    },
    "conservacao": "Conservar em recipiente fechado na geladeira por até 3 dias.",
    "substituicoes": "Iogurte natural → iogurte natural zero lactose.\r\nEritritol → outro adoçante culinário de preferência.\r\nMorango → manga, kiwi ou outra fruta fresca de preferência."
  },
  {
    "id": "NL-112",
    "name": "Pudim da Nutri",
    "tipo": "sobremesa",
    "meals": [
      "dessert",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Sem glúten** Quando preparado sem mel. Desde que os ingredientes utilizados sejam certificados sem glúten."
    ],
    "time": "5min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "1 copo de leite desnatado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "2 colheres (sopa) de leite em pó desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Algumas gotas de essência de baunilha"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante culinário a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Para a calda, opcional"
      },
      {
        "quantity": "7",
        "unit": "g",
        "name": "1 colher (chá) de mel"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "1 colher (sopa) de doce de leite sem açúcar"
      }
    ],
    "steps": [
      "Coloque no liquidificador o ovo, o leite desnatado, o leite em pó, a essência de baunilha e o adoçante.",
      "Bata somente até obter uma mistura homogênea.",
      "Se utilizar a calda, espalhe o mel ou o doce de leite sem açúcar no fundo de uma forma pequena ou refratário adequado para airfryer.",
      "Despeje cuidadosamente a mistura do pudim.",
      "Leve à airfryer preaquecida a 170 °C por aproximadamente 30 minutos.",
      "Verifique o ponto: as laterais devem estar firmes e o centro ainda levemente macio.",
      "Retire e deixe esfriar em temperatura ambiente.",
      "Leve à geladeira por aproximadamente 1 hora para ficar mais firme e gelado.",
      "Desenforme somente depois de frio."
    ],
    "macros": {
      "kcal": 115,
      "p": 10,
      "c": 11,
      "f": 3
    },
    "conservacao": "Conservar em recipiente fechado na geladeira por até 3 dias.",
    "substituicoes": "Leite desnatado → leite desnatado zero lactose.\r\nLeite em pó desnatado → leite em pó desnatado zero lactose.\r\nMel → doce de leite sem açúcar, considerando a diferença nutricional.\r\nEssência de baunilha → canela ou raspas de limão para variar o sabor."
  },
  {
    "id": "NL-113",
    "name": "Sorvete Cremoso de Mamão com Leite em Pó",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Prática Desde que o leite em pó utilizado seja certificado sem glúten quando necessário."
    ],
    "time": "5min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "mamão previamente congelado em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "leite em pó desnatado"
      }
    ],
    "steps": [
      "Corte previamente o mamão em cubos e leve ao congelador até ficar completamente congelado.",
      "Coloque os 200 g de mamão congelado no processador ou liquidificador potente.",
      "Acrescente o leite em pó desnatado.",
      "Bata até começar a formar um creme.",
      "Se necessário, desligue o aparelho, raspe as laterais e misture com uma colher ou espátula.",
      "Bata novamente até obter uma textura lisa, espessa e cremosa, semelhante à de sorvete.",
      "Sirva imediatamente para uma textura mais cremosa.",
      "Se preferir um sorvete mais firme, leve ao congelador por aproximadamente 30 minutos antes de servir."
    ],
    "macros": {
      "kcal": 225,
      "p": 18,
      "c": 37,
      "f": 1,
      "fiber": 2
    },
    "conservacao": "Para melhor textura, consumir imediatamente após o preparo.",
    "substituicoes": "Os 200 g de mamão congelado podem ser substituídos pela mesma quantidade de:\r\nMorango congelado.\r\nUva congelada.\r\nAbacaxi congelado.\r\nA quantidade de leite em pó pode ser adicionada gradualmente durante o processamento para facilitar a obtenção da textura desejada."
  },
  {
    "id": "NL-114",
    "name": "Chá de Hibisco com Maçã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "5",
        "unit": "g",
        "name": "hibisco seco, aproximadamente 1 colher (sopa) rasa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 fatias finas de maçã"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Aqueça a água até iniciar a fervura.",
      "Desligue o fogo.",
      "Acrescente o hibisco e as fatias de maçã.",
      "Tampe e deixe em infusão por 5 a 7 minutos.",
      "Coe.",
      "Consuma morno ou leve à geladeira e sirva com gelo."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar em recipiente fechado na geladeira por até 24 horas.",
    "substituicoes": "Maçã → morango ou abacaxi.\r\nPode acrescentar canela em pau para variar o sabor."
  },
  {
    "id": "NL-115",
    "name": "Chá de Cavalinha com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "2",
        "unit": "g",
        "name": "cavalinha seca, aproximadamente 2 colheres (chá)"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 a 4 folhas de hortelã"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Coloque a cavalinha e a hortelã em uma xícara.",
      "Acrescente a água fervente.",
      "Tampe e deixe em infusão por aproximadamente 10 minutos.",
      "Coe.",
      "Consuma morno ou gelado."
    ],
    "macros": {
      "kcal": 15,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Hortelã → algumas gotas de limão após o preparo.\r\nPode ser consumido gelado com gelo."
  },
  {
    "id": "NL-116",
    "name": "Chá Gelado de Hibisco com Abacaxi",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "5",
        "unit": "g",
        "name": "hibisco seco"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "abacaxi em cubos"
      },
      {
        "quantity": "300",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Aqueça a água até iniciar a fervura.",
      "Desligue o fogo.",
      "Acrescente o hibisco.",
      "Tampe e deixe em infusão por aproximadamente 5 minutos.",
      "Coe e espere esfriar.",
      "Acrescente o abacaxi.",
      "Finalize com gelo e sirva."
    ],
    "macros": {
      "kcal": 25,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Abacaxi → morango.\r\nPode acrescentar folhas de hortelã."
  },
  {
    "id": "NL-117",
    "name": "Chá de Dente-de-Leão com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "3",
        "unit": "g",
        "name": "dente-de-leão seco"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 folhas de hortelã"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Coloque o dente-de-leão e a hortelã em uma xícara.",
      "Acrescente a água fervente.",
      "Tampe.",
      "Deixe em infusão por aproximadamente 10 minutos.",
      "Coe.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Hortelã → casca de limão bem higienizada para aromatizar."
  },
  {
    "id": "NL-118",
    "name": "Chá Gelado de Hibisco com Morango",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "5",
        "unit": "g",
        "name": "hibisco seco"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 morangos fatiados, aproximadamente 45 g"
      },
      {
        "quantity": "300",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Aqueça a água até iniciar a fervura.",
      "Desligue o fogo e acrescente o hibisco.",
      "Tampe e deixe em infusão por aproximadamente 5 minutos.",
      "Coe e espere esfriar.",
      "Acrescente os morangos fatiados.",
      "Finalize com gelo.",
      "Sirva bem gelado."
    ],
    "macros": {
      "kcal": 15,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Morango → abacaxi ou maçã.\r\nPode acrescentar folhas de hortelã."
  },
  {
    "id": "NL-119",
    "name": "Chá de Camomila com Maçã e Canela",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "3",
        "unit": "g",
        "name": "flores secas de camomila, aproximadamente 1 colher (sopa)"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 fatias finas de maçã"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequeno pedaço de canela em pau"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Aqueça a água até iniciar a fervura.",
      "Desligue o fogo.",
      "Acrescente a camomila, a maçã e a canela.",
      "Tampe e deixe em infusão por aproximadamente 5 minutos.",
      "Coe.",
      "Consuma morno."
    ],
    "macros": {
      "kcal": 5,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Preferencialmente consumir logo após o preparo.",
    "substituicoes": "Maçã → pera.\r\nCanela → pequena tira de casca de laranja bem higienizada."
  },
  {
    "id": "NL-120",
    "name": "Chá de Erva-Cidreira",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "2",
        "unit": "g",
        "name": "folhas secas de erva-cidreira (Melissa officinalis)"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Aqueça a água.",
      "Desligue o fogo ao iniciar a fervura.",
      "Acrescente a erva-cidreira.",
      "Tampe por 5 a 10 minutos.",
      "Coe.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Preferencialmente consumir após o preparo. Se necessário, manter refrigerado por até 24 horas.",
    "substituicoes": "Pode acrescentar uma pequena tira de casca de laranja.\r\nPode combinar com pequena quantidade de camomila."
  },
  {
    "id": "NL-121",
    "name": "Chá de Capim-Cidreira com Camomila",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "1",
        "unit": "g",
        "name": "capim-cidreira seco"
      },
      {
        "quantity": "1",
        "unit": "g",
        "name": "camomila seca"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Aqueça a água até iniciar a fervura.",
      "Desligue o fogo.",
      "Acrescente as ervas.",
      "Tampe por aproximadamente 5 minutos.",
      "Coe cuidadosamente.",
      "Consuma morno."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Consumir preferencialmente logo após o preparo.",
    "substituicoes": "Pode utilizar somente uma das ervas.\r\nUma pequena tira de casca de laranja pode ser acrescentada para aromatizar."
  },
  {
    "id": "NL-122",
    "name": "Chá de Camomila com Casca de Laranja",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "3",
        "unit": "g",
        "name": "camomila seca"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequena tira de casca de laranja bem higienizada"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Aqueça a água.",
      "Desligue ao iniciar a fervura.",
      "Acrescente a camomila e a casca de laranja.",
      "Tampe por aproximadamente 5 minutos.",
      "Coe.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 15,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Preferencialmente consumir no momento do preparo.",
    "substituicoes": "Casca de laranja → maçã.\r\nPode acrescentar um pequeno pedaço de canela em pau."
  },
  {
    "id": "NL-123",
    "name": "Chá de Erva-Cidreira com Maracujá",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "2",
        "unit": "g",
        "name": "erva-cidreira seca (Melissa officinalis)"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (sopa) de polpa de maracujá, aproximadamente 15 g"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Coloque a erva-cidreira em uma xícara.",
      "Acrescente a água quente.",
      "Tampe por aproximadamente 5 minutos.",
      "Coe.",
      "Acrescente a polpa do maracujá.",
      "Misture delicadamente.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Consumir preferencialmente após o preparo.",
    "substituicoes": "Maracujá → pequena tira de casca de laranja.\r\nPode preparar apenas com a erva-cidreira."
  },
  {
    "id": "NL-124",
    "name": "Chá de Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "1.5",
        "unit": "g",
        "name": "hortelã-pimenta seca"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Coloque a hortelã em uma xícara.",
      "Acrescente a água fervente.",
      "Tampe por aproximadamente 5 minutos.",
      "Coe.",
      "Consuma morno."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Pode utilizar folhas frescas de hortelã em quantidade adequada.\r\nAlgumas gotas de limão podem ser adicionadas depois do preparo."
  },
  {
    "id": "NL-125",
    "name": "Chá de Gengibre com Laranja",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "2",
        "unit": "g",
        "name": "gengibre fresco, aproximadamente 2 fatias finas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 pequenas tiras de casca de laranja bem higienizada"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Coloque o gengibre na água.",
      "Leve ao fogo e deixe ferver por aproximadamente 3 minutos.",
      "Desligue o fogo.",
      "Acrescente a casca de laranja.",
      "Tampe por mais 3 minutos.",
      "Coe.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 15,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Casca de laranja → casca de limão bem higienizada.\r\nPode reduzir a quantidade de gengibre para um sabor mais suave."
  },
  {
    "id": "NL-126",
    "name": "Chá de Erva-Doce com Canela",
    "tipo": "bebida",
    "meals": [],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "1.5",
        "unit": "g",
        "name": "erva-doce"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequeno pedaço de canela em pau"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Amasse levemente a erva-doce.",
      "Coloque-a em uma xícara com a canela.",
      "Acrescente água quente.",
      "Tampe por 5 a 10 minutos.",
      "Coe.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 15,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Conservar na geladeira por até 24 horas.",
    "substituicoes": "Canela → pequena tira de casca de laranja.\r\nPode preparar somente com a erva-doce."
  },
  {
    "id": "NL-127",
    "name": "Chá de Camomila com Erva-Doce",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "1.5",
        "unit": "g",
        "name": "camomila seca"
      },
      {
        "quantity": "1",
        "unit": "g",
        "name": "erva-doce"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Amasse levemente a erva-doce.",
      "Coloque a camomila e a erva-doce em uma xícara.",
      "Acrescente a água quente.",
      "Tampe por aproximadamente 5 minutos.",
      "Coe.",
      "Sirva morno."
    ],
    "macros": {
      "kcal": 15,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Preferencialmente consumir logo após o preparo.",
    "substituicoes": "Pode utilizar somente camomila ou somente erva-doce.\r\nPode acrescentar pequena quantidade de casca de laranja para aromatizar."
  },
  {
    "id": "NL-128",
    "name": "Chá de Boldo com Hortelã",
    "tipo": "bebida",
    "meals": [],
    "tags": [],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "1",
        "unit": "g",
        "name": "boldo-nacional seco, aproximadamente 1 colher (chá)"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 folhas de hortelã"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água"
      }
    ],
    "steps": [
      "Coloque o boldo e a hortelã em uma xícara.",
      "Acrescente a água fervente.",
      "Tampe por 3 a 5 minutos.",
      "Coe.",
      "Consuma morno."
    ],
    "macros": {
      "kcal": 10,
      "p": 0,
      "c": 0,
      "f": 0
    },
    "conservacao": "Preferencialmente consumir logo após o preparo.",
    "substituicoes": "Para uma preparação mais suave, utilizar apenas hortelã.\r\nA quantidade de boldo não deve ser aumentada para tentar intensificar o efeito."
  },
  {
    "id": "NL-129",
    "name": "Mingau Cremoso de Banana com Canela",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia em flocos finos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "1 banana pequena madura"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de essência de baunilha, opcional"
      }
    ],
    "steps": [
      "Amasse metade da banana.",
      "Coloque o leite, a aveia e a banana amassada em uma panela.",
      "Cozinhe em fogo baixo, mexendo sempre, até engrossar.",
      "Acrescente a essência de baunilha e a canela.",
      "Finalize com o restante da banana em rodelas."
    ],
    "macros": {
      "kcal": 270,
      "p": 10,
      "c": 48,
      "f": 5,
      "fiber": 6
    }
  },
  {
    "id": "NL-130",
    "name": "Mingau de Chocolate com Morangos",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia em flocos finos"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "cacau em pó 100%"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "leite em pó desnatado"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "morangos picados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante a gosto, opcional"
      }
    ],
    "steps": [
      "Coloque o leite, a aveia, o cacau e o leite em pó em uma panela.",
      "Cozinhe em fogo baixo, mexendo sempre.",
      "Quando atingir uma consistência cremosa, desligue o fogo.",
      "Acrescente adoçante, se desejar.",
      "Finalize com os morangos picados."
    ],
    "macros": {
      "kcal": 245,
      "p": 13,
      "c": 37,
      "f": 6,
      "fiber": 6
    }
  },
  {
    "id": "NL-131",
    "name": "Mingau de Maçã Cremosa com Canela",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia em flocos finos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "maçã em cubinhos"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher de chá de mel , opcional"
      }
    ],
    "steps": [
      "Coloque metade da maçã em uma panela com 1 colher de sopa de água e canela.",
      "Cozinhe por aproximadamente 2 minutos, até começar a amolecer.",
      "Acrescente o leite e a aveia.",
      "Cozinhe em fogo baixo, mexendo sempre, até ficar cremoso.",
      "Finalize com o restante da maçã e, se desejar, um fio de mel."
    ],
    "macros": {
      "kcal": 260,
      "p": 9,
      "c": 46,
      "f": 5,
      "fiber": 6
    }
  },
  {
    "id": "NL-132",
    "name": "Mingau Cremoso de Coco com Manga",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "20",
        "unit": "ml",
        "name": "leite de coco"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia em flocos finos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "manga em cubos"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "coco ralado sem açúcar"
      }
    ],
    "steps": [
      "Coloque o leite, o leite de coco e a aveia em uma panela.",
      "Cozinhe em fogo baixo, mexendo sempre, até engrossar.",
      "Desligue o fogo.",
      "Acrescente metade da manga e misture delicadamente.",
      "Finalize com o restante da manga e o coco ralado."
    ],
    "macros": {
      "kcal": 285,
      "p": 9,
      "c": 43,
      "f": 9,
      "fiber": 5
    }
  },
  {
    "id": "NL-133",
    "name": "Mingau de Café com Leite e Canela",
    "tipo": "mingau",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Vegetariana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "café coado forte"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia em flocos finos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "leite em pó desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante a gosto, opcional"
      }
    ],
    "steps": [
      "Coloque o leite, o café, a aveia e o leite em pó em uma panela.",
      "Cozinhe em fogo baixo, mexendo sempre.",
      "Quando atingir uma textura cremosa, desligue o fogo.",
      "Finalize com canela.",
      "Adoce somente se necessário."
    ],
    "macros": {
      "kcal": 220,
      "p": 12,
      "c": 32,
      "f": 5,
      "fiber": 4
    }
  },
  {
    "id": "NL-134",
    "name": "Creme de Batata com Alho-Poró e Frango",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Batata inglesa em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Alho-poró fatiado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "Água ou caldo caseiro de legumes"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Creme de leite leve ou zero lactose"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola, o alho e o alho-poró até ficarem levemente macios.",
      "Acrescente a batata em cubos.",
      "Adicione a água ou o caldo caseiro.",
      "Cozinhe em fogo médio até a batata ficar bem macia.",
      "Bata a preparação com um mixer ou transfira cuidadosamente para o liquidificador.",
      "Bata até obter um creme homogêneo.",
      "Retorne o creme à panela.",
      "Acrescente o creme de leite e misture.",
      "Adicione o frango desfiado.",
      "Ajuste o sal e a pimenta-do-reino.",
      "Cozinhe por mais aproximadamente 3 minutos.",
      "Finalize com cheiro-verde e sirva quente."
    ],
    "macros": {
      "kcal": 300,
      "p": 23,
      "c": 31,
      "f": 9,
      "fiber": 3
    }
  },
  {
    "id": "NL-135",
    "name": "Sopa de Feijão com Carne e Legumes",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Feijão carioca cozido com caldo"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Patinho em cubinhos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Cenoura em cubos ou rodelas"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Chuchu em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva"
      },
      {
        "quantity": "300",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folha de louro a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente o patinho e deixe dourar.",
      "Adicione o tomate e misture.",
      "Acrescente a cenoura e o chuchu.",
      "Junte o feijão com o caldo.",
      "Adicione a água e o louro.",
      "Tampe parcialmente e cozinhe até os legumes ficarem macios.",
      "Amasse uma pequena quantidade dos grãos de feijão contra a lateral da panela para deixar o caldo mais encorpado.",
      "Ajuste o sal.",
      "Finalize com cheiro-verde e sirva quente."
    ],
    "macros": {
      "kcal": 320,
      "p": 25,
      "c": 35,
      "f": 10,
      "fiber": 9
    }
  },
  {
    "id": "NL-136",
    "name": "Creme de Cenoura com Frango e Requeijão",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Sem glúten* Desde que todos os ingredientes industrializados utilizados sejam certificados sem glúten quando necessário."
    ],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "Cenoura em rodelas"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Batata inglesa em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente a cenoura e a batata.",
      "Adicione a água.",
      "Cozinhe até os legumes ficarem bem macios.",
      "Bata com mixer ou liquidificador até obter um creme liso.",
      "Retorne à panela.",
      "Acrescente o frango desfiado.",
      "Adicione o requeijão e misture até incorporar.",
      "Tempere com sal e páprica.",
      "Aqueça por mais alguns minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 260,
      "p": 22,
      "c": 25,
      "f": 9,
      "fiber": 5
    }
  },
  {
    "id": "NL-137",
    "name": "Sopa Cremosa de Milho com Frango",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Milho cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "Leite"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "Água ou caldo caseiro"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Coloque metade do milho no liquidificador.",
      "Acrescente o leite e a água ou caldo caseiro.",
      "Bata até formar um creme homogêneo.",
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente o creme de milho batido.",
      "Junte o restante do milho.",
      "Adicione o frango desfiado.",
      "Cozinhe em fogo baixo por aproximadamente 8 minutos, mexendo ocasionalmente.",
      "Ajuste o sal e a pimenta.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 290,
      "p": 23,
      "c": 32,
      "f": 8,
      "fiber": 4
    }
  },
  {
    "id": "NL-138",
    "name": "Creme de Couve-Flor com Queijo e Frango",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "250",
        "unit": "g",
        "name": "Couve-flor em floretes"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Queijo minas padrão"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "350",
        "unit": "ml",
        "name": "Água ou caldo caseiro"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Noz-moscada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente a couve-flor.",
      "Adicione a água ou caldo.",
      "Cozinhe até a couve-flor ficar bem macia.",
      "Bata com mixer ou liquidificador até formar um creme.",
      "Retorne à panela.",
      "Acrescente o queijo.",
      "Misture em fogo baixo até derreter.",
      "Adicione o frango desfiado.",
      "Tempere com sal, noz-moscada e pimenta-do-reino.",
      "Aqueça por mais alguns minutos e sirva."
    ],
    "macros": {
      "kcal": 275,
      "p": 27,
      "c": 12,
      "f": 14,
      "fiber": 5
    }
  },
  {
    "id": "NL-139",
    "name": "Sopa de Legumes com Carne Desfiada",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Carne bovina cozida e desfiada"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Batata em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Cenoura em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Chuchu em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Abobrinha em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "500",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente o tomate e misture.",
      "Adicione a batata, a cenoura e o chuchu.",
      "Cubra com a água.",
      "Cozinhe até os legumes começarem a ficar macios.",
      "Acrescente a abobrinha.",
      "Junte a carne desfiada.",
      "Cozinhe por mais aproximadamente 5 minutos.",
      "Ajuste o sal.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 310,
      "p": 25,
      "c": 31,
      "f": 10,
      "fiber": 6
    }
  },
  {
    "id": "NL-140",
    "name": "Creme de Mandioquinha com Carne Moída",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "Mandioquinha descascada em cubos"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Coloque a mandioquinha em uma panela com a água.",
      "Cozinhe até ficar bem macia.",
      "Bata a mandioquinha com parte da água do cozimento até formar um creme.",
      "Reserve.",
      "Em outra panela, aqueça o azeite.",
      "Refogue a cebola e o alho.",
      "Acrescente o patinho moído.",
      "Cozinhe até ficar dourado e soltinho.",
      "Junte o tomate e tempere com sal e pimenta.",
      "Acrescente o creme de mandioquinha.",
      "Misture e cozinhe por mais aproximadamente 3 minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 340,
      "p": 24,
      "c": 38,
      "f": 11,
      "fiber": 4
    }
  },
  {
    "id": "NL-141",
    "name": "Sopa Cremosa de Ervilha com Frango",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Ervilha seca"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "500",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folha de louro a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente a ervilha seca.",
      "Adicione a água e o louro.",
      "Cozinhe até a ervilha ficar bem macia e começar a se desmanchar.",
      "Retire a folha de louro.",
      "Bata rapidamente parte da sopa com mixer, mantendo alguma textura.",
      "Acrescente o frango desfiado.",
      "Tempere com sal e pimenta.",
      "Aqueça por mais alguns minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 365,
      "p": 30,
      "c": 43,
      "f": 8,
      "fiber": 12
    }
  },
  {
    "id": "NL-142",
    "name": "Creme de Tomate Assado com Ricota",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "300",
        "unit": "g",
        "name": "Tomate maduro"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Ricota fresca"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "Água ou caldo caseiro"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Preaqueça o forno a 200°C.",
      "Corte os tomates e a cebola em pedaços.",
      "Disponha em uma assadeira.",
      "Acrescente o alho.",
      "Regue com o azeite.",
      "Tempere com sal e pimenta-do-reino.",
      "Asse por aproximadamente 20 minutos.",
      "Transfira os vegetais assados para o liquidificador.",
      "Acrescente a água ou caldo.",
      "Bata até formar um creme homogêneo.",
      "Retorne à panela.",
      "Acrescente a ricota amassada ou bata a ricota junto ao creme para uma textura mais lisa.",
      "Aqueça por alguns minutos.",
      "Finalize com manjericão."
    ],
    "macros": {
      "kcal": 190,
      "p": 10,
      "c": 15,
      "f": 10,
      "fiber": 4
    }
  },
  {
    "id": "NL-143",
    "name": "Sopa Cremosa de Frango com Legumes e Macarrão",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango em cubinhos ou cozido e desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Macarrão cru"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Cenoura em cubos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Chuchu em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Abobrinha em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "500",
        "unit": "ml",
        "name": "Água ou caldo caseiro"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma panela.",
      "Refogue a cebola e o alho.",
      "Acrescente o frango e deixe dourar levemente.",
      "Junte o tomate.",
      "Acrescente a cenoura e o chuchu.",
      "Adicione a água ou caldo caseiro.",
      "Cozinhe por aproximadamente 10 minutos.",
      "Acrescente a abobrinha e o macarrão.",
      "Cozinhe até o macarrão ficar macio e os legumes completamente cozidos.",
      "Amasse alguns pedaços de legumes contra a lateral da panela para deixar o caldo levemente cremoso.",
      "Ajuste o sal.",
      "Finalize com cheiro-verde e sirva quente."
    ],
    "macros": {
      "kcal": 300,
      "p": 23,
      "c": 39,
      "f": 7,
      "fiber": 5
    }
  },
  {
    "id": "NL-144",
    "name": "Frango Dourado com Limão, Alho e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Filé de peito de frango"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho amassado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite de oliva"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      }
    ],
    "steps": [
      "Tempere o filé de frango com alho, limão, sal, pimenta-do-reino e orégano.",
      "Se possível, deixe descansar por aproximadamente 5 minutos para absorver melhor os temperos.",
      "Aqueça bem uma frigideira.",
      "Acrescente o azeite.",
      "Coloque o filé e deixe dourar sem mexer por aproximadamente 4 minutos.",
      "Vire cuidadosamente.",
      "Cozinhe o outro lado até ficar dourado por fora e completamente cozido por dentro.",
      "Retire do fogo.",
      "Finalize com salsinha picada e sirva."
    ],
    "macros": {
      "kcal": 260,
      "p": 46,
      "c": 2,
      "f": 8
    }
  },
  {
    "id": "NL-145",
    "name": "Carne Acebolada de Frigideira",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [
      "Prática Para versão estritamente sem glúten, conferir a composição do molho inglês utilizado."
    ],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Alcatra ou patinho em bifes"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Cebola em rodelas"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de molho inglês, opcional"
      }
    ],
    "steps": [
      "Tempere a carne com alho, sal e pimenta-do-reino.",
      "Aqueça bem uma frigideira.",
      "Acrescente o azeite.",
      "Coloque os bifes e deixe dourar dos dois lados.",
      "Retire a carne e reserve.",
      "Na mesma frigideira, acrescente a cebola.",
      "Refogue até ficar macia e levemente dourada.",
      "Acrescente o molho inglês, se desejar.",
      "Retorne a carne à frigideira.",
      "Misture rapidamente apenas para incorporar os sabores.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 360,
      "p": 39,
      "c": 7,
      "f": 20
    }
  },
  {
    "id": "NL-146",
    "name": "Frango Suculento com Páprica e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cebola fatiada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher (chá) de páprica doce ou defumada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere os cubos de frango com alho, páprica, sal e pimenta-do-reino.",
      "Aqueça bem uma frigideira.",
      "Acrescente o azeite.",
      "Distribua o frango sem amontoar.",
      "Deixe dourar antes de começar a mexer.",
      "Quando estiver quase completamente cozido, acrescente a cebola.",
      "Refogue até a cebola ficar macia e o frango bem dourado.",
      "Ajuste os temperos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 300,
      "p": 49,
      "c": 5,
      "f": 9
    }
  },
  {
    "id": "NL-147",
    "name": "Filé de Peixe ao Alho e Limão na Frigideira",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Filé de pescada, linguado ou tilápia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de ½ limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      }
    ],
    "steps": [
      "Tempere o peixe com sal, pimenta-do-reino e limão.",
      "Aqueça uma frigideira antiaderente.",
      "Acrescente o azeite.",
      "Junte o alho e deixe perfumar rapidamente, sem queimar.",
      "Coloque o filé de peixe.",
      "Doure por aproximadamente 3 a 4 minutos de um lado.",
      "Vire cuidadosamente.",
      "Cozinhe o outro lado até o peixe ficar completamente cozido.",
      "Evite mexer excessivamente para não desmanchar o filé.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 250,
      "p": 39,
      "c": 1,
      "f": 10
    }
  },
  {
    "id": "NL-148",
    "name": "Lombo Suíno Dourado com Laranja e Alecrim",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Lombo suíno em bifes"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "Suco natural de laranja"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere o lombo com alho, sal, pimenta-do-reino e alecrim.",
      "Aqueça o azeite em uma frigideira.",
      "Coloque os bifes de lombo.",
      "Doure bem dos dois lados.",
      "Acrescente o suco de laranja.",
      "Abaixe o fogo.",
      "Cozinhe por mais alguns minutos, virando a carne para envolver no molho.",
      "Deixe o líquido reduzir levemente.",
      "Retire quando o lombo estiver completamente cozido e ainda suculento.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 320,
      "p": 43,
      "c": 5,
      "f": 13
    }
  },
  {
    "id": "NL-149",
    "name": "Carne de Panela Desfiada com Molho Caseiro",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 4,
    "ingredients": [
      {
        "quantity": "500",
        "unit": "g",
        "name": "Acém ou músculo em pedaços grandes"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 dentes de alho"
      },
      {
        "quantity": "10",
        "unit": "ml",
        "name": "1 colher (sopa) de azeite"
      },
      {
        "quantity": "300",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 folha de louro"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Corte a carne em pedaços grandes.",
      "Aqueça o azeite na panela de pressão.",
      "Acrescente a carne e deixe dourar bem.",
      "Junte a cebola e o alho.",
      "Refogue por alguns minutos.",
      "Acrescente o tomate.",
      "Tempere com sal, páprica, pimenta e louro.",
      "Adicione a água.",
      "Tampe a panela.",
      "Após pegar pressão, cozinhe por aproximadamente 30 minutos.",
      "Desligue o fogo e aguarde a pressão sair completamente antes de abrir.",
      "Retire a carne e desfie.",
      "Retorne a carne desfiada ao molho.",
      "Cozinhe sem tampa por alguns minutos, até o molho ficar mais encorpado e a carne bem suculenta.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 300,
      "p": 36,
      "c": 5,
      "f": 15
    }
  },
  {
    "id": "NL-150",
    "name": "Camarão Cremoso com Tomate e Requeijão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Prática Desde que o requeijão e os demais ingredientes industrializados sejam certificados sem glúten quando necessário."
    ],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Camarão limpo"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere o camarão com sal e pimenta-do-reino.",
      "Aqueça o azeite em uma frigideira.",
      "Acrescente o alho e a cebola.",
      "Refogue rapidamente.",
      "Adicione o camarão.",
      "Cozinhe por aproximadamente 2 minutos.",
      "Acrescente o tomate.",
      "Misture e cozinhe rapidamente.",
      "Adicione o requeijão.",
      "Mexa até formar um molho cremoso.",
      "Cozinhe apenas até o camarão ficar rosado e macio.",
      "Finalize com páprica e cheiro-verde."
    ],
    "macros": {
      "kcal": 330,
      "p": 41,
      "c": 7,
      "f": 15
    }
  },
  {
    "id": "NL-151",
    "name": "Iscas de Carne com Pimentão e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Patinho ou alcatra em tiras"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Pimentão vermelho em tiras"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cebola fatiada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Aqueça bem uma frigideira.",
      "Acrescente o azeite.",
      "Coloque as tiras de carne.",
      "Deixe dourar rapidamente em fogo alto para manter a carne macia.",
      "Acrescente o alho.",
      "Junte a cebola e o pimentão.",
      "Refogue por mais aproximadamente 3 a 4 minutos.",
      "Tempere com sal e pimenta-do-reino.",
      "Finalize com cheiro-verde.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 350,
      "p": 39,
      "c": 8,
      "f": 18
    }
  },
  {
    "id": "NL-152",
    "name": "Sobrecoxa Desossada Assada com Mostarda e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Forno ou Air Fryer Desde que a mostarda utilizada seja certificada sem glúten quando necessário."
    ],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "Sobrecoxa de frango desossada e sem pele"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Em uma tigela, misture a mostarda, o alho, o azeite, o limão, a páprica, o orégano, o sal e a pimenta.",
      "Espalhe o tempero sobre toda a sobrecoxa.",
      "Coloque em uma assadeira ou na cesta da Air Fryer.",
      "Asse a 190°C por aproximadamente 20 a 25 minutos.",
      "Vire na metade do tempo para dourar dos dois lados.",
      "Verifique se a carne está completamente cozida.",
      "Retire quando estiver bem dourada e suculenta.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 350,
      "p": 40,
      "c": 2,
      "f": 20
    }
  },
  {
    "id": "NL-153",
    "name": "Salmão Assado com Mel e Mostarda",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [
      "Sem glúten"
    ],
    "ressalvas": [
      "Fonte de gorduras insaturadas Desde que a mostarda utilizada seja certificada sem glúten quando necessário."
    ],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Filé de salmão"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mel"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher (chá) de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Em um recipiente pequeno, misture a mostarda, o mel, o azeite e algumas gotas de limão.",
      "Tempere o salmão com sal e pimenta-do-reino.",
      "Espalhe o molho sobre a superfície do peixe.",
      "Coloque em uma assadeira ou na Air Fryer.",
      "Asse a 190°C por aproximadamente 12 a 15 minutos.",
      "Verifique o ponto do salmão e evite cozinhar excessivamente.",
      "Retire quando estiver cozido e ainda suculento.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 390,
      "p": 32,
      "c": 6,
      "f": 26
    }
  },
  {
    "id": "NL-154",
    "name": "Pão Francês com Creme de Ricota e Frango",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "25",
        "unit": "g",
        "name": "½ pão francês"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Creme de ricota"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Coloque o frango desfiado em uma tigela.",
      "Acrescente o creme de ricota.",
      "Adicione o cheiro-verde e misture até formar um recheio cremoso.",
      "Acrescente o tomate picado e misture delicadamente.",
      "Abra a metade do pão francês.",
      "Distribua todo o recheio.",
      "Consuma em temperatura ambiente ou aqueça rapidamente na sanduicheira, se desejar."
    ],
    "macros": {
      "kcal": 230,
      "p": 24,
      "c": 18,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Creme de ricota por cottage ou requeijão light. Pão francês por pão integral em quantidade equivalente."
  },
  {
    "id": "NL-155",
    "name": "Iogurte Proteico com Morango e Aveia Crocante",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "Iogurte natural proteico"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Morangos picados"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Aveia em flocos"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Chia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Coloque o iogurte em uma tigela ou taça.",
      "Higienize e pique os morangos.",
      "Distribua os morangos sobre o iogurte.",
      "Acrescente a aveia.",
      "Finalize com a chia e a canela.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 220,
      "p": 20,
      "c": 27,
      "f": 5,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Iogurte zero lactose. Morango por mamão, kiwi ou outra fruta em porção equivalente."
  },
  {
    "id": "NL-156",
    "name": "Torrada com Cottage, Ovo e Tomate",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "1 fatia de pão integral"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Cottage"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate picado ou em rodelas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Torre a fatia de pão até ficar levemente crocante.",
      "Prepare o ovo mexido em frigideira antiaderente ou cozinhe-o, conforme preferência.",
      "Espalhe o cottage sobre a torrada.",
      "Acrescente o ovo.",
      "Distribua o tomate.",
      "Finalize com orégano.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 250,
      "p": 19,
      "c": 19,
      "f": 11
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Cottage por creme de ricota ou ricota temperada. Para versão sem lactose, utilizar produtos adequados."
  },
  {
    "id": "NL-157",
    "name": "Creme Gelado de Banana com Iogurte e Leite em Pó",
    "tipo": "sobremesa",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "Banana previamente congelada"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Leite em pó desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Corte previamente a banana em pedaços e congele.",
      "Coloque a banana congelada no processador ou liquidificador.",
      "Acrescente o iogurte natural.",
      "Adicione o leite em pó.",
      "Bata até obter um creme homogêneo e espesso.",
      "Finalize com canela.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 220,
      "p": 14,
      "c": 34,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Iogurte zero lactose. Banana por morango congelado."
  },
  {
    "id": "NL-158",
    "name": "Cuscuz Pequeno com Ricota Cremosa e Ovo",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "Flocão de milho"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Ricota"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Requeijão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Hidrate o flocão com uma pequena quantidade de água e uma pitada de sal.",
      "Deixe descansar por aproximadamente 5 minutos.",
      "Cozinhe na cuscuzeira até ficar macio.",
      "Amasse a ricota com um garfo.",
      "Acrescente o requeijão e o cheiro-verde.",
      "Misture até formar um creme.",
      "Prepare o ovo mexido em uma frigideira antiaderente.",
      "Sirva o cuscuz acompanhado do creme de ricota e do ovo."
    ],
    "macros": {
      "kcal": 285,
      "p": 18,
      "c": 27,
      "f": 12
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Ricota por cottage. Requeijão por creme de ricota. Para versão sem lactose, utilizar equivalentes adequados."
  },
  {
    "id": "NL-159",
    "name": "Vitamina Cremosa de Morango com Whey",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "ml",
        "name": "Leite desnatado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Morangos"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Whey protein"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Higienize os morangos.",
      "Coloque o leite no liquidificador.",
      "Acrescente os morangos e o whey protein.",
      "Adicione gelo a gosto.",
      "Bata até obter uma bebida lisa e cremosa.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 190,
      "p": 23,
      "c": 18,
      "f": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Leite zero lactose. Morango por outra fruta em quantidade equivalente."
  },
  {
    "id": "NL-160",
    "name": "Pãozinho de Queijo e Ovo na Sanduicheira",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "1 fatia de pão integral"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Queijo minas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Bata o ovo rapidamente com um garfo.",
      "Coloque a fatia de pão em uma sanduicheira.",
      "Distribua o ovo sobre o pão cuidadosamente.",
      "Acrescente o queijo minas.",
      "Adicione o tomate.",
      "Finalize com orégano.",
      "Feche a sanduicheira.",
      "Cozinhe até o ovo ficar completamente firme, o pão dourar e o queijo derreter.",
      "Sirva ainda quente."
    ],
    "macros": {
      "kcal": 250,
      "p": 17,
      "c": 18,
      "f": 12
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Queijo minas por muçarela, cottage ou queijo sem lactose. Pão integral por pão tradicional ou versão sem glúten."
  },
  {
    "id": "NL-161",
    "name": "Taça de Mamão com Creme Proteico de Iogurte",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Mamão em cubos"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Iogurte natural"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Leite em pó desnatado"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Chia"
      }
    ],
    "steps": [
      "Coloque o iogurte em uma tigela.",
      "Acrescente o leite em pó.",
      "Misture até formar um creme homogêneo.",
      "Corte o mamão em cubos.",
      "Distribua o mamão em uma taça.",
      "Cubra com o creme de iogurte.",
      "Finalize com a chia.",
      "Sirva imediatamente ou mantenha refrigerado até o consumo."
    ],
    "macros": {
      "kcal": 200,
      "p": 13,
      "c": 27,
      "f": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Iogurte zero lactose. Mamão por manga, morango ou outra fruta em quantidade equivalente."
  },
  {
    "id": "NL-162",
    "name": "Wrap Pequeno de Ovo com Creme de Ricota",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "20",
        "unit": "g",
        "name": "½ unidade de wrap ou Rap10"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 ovo inteiro"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de alface a gosto"
      }
    ],
    "steps": [
      "Prepare o ovo mexido em uma frigideira antiaderente.",
      "Aqueça o wrap rapidamente para deixá-lo mais maleável.",
      "Espalhe o creme de ricota.",
      "Acrescente o ovo mexido.",
      "Distribua o tomate.",
      "Finalize com as folhas de alface.",
      "Enrole cuidadosamente.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 235,
      "p": 15,
      "c": 18,
      "f": 12
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Creme de ricota por cottage ou requeijão light. Para versão sem glúten, utilizar wrap certificado adequado."
  },
  {
    "id": "NL-163",
    "name": "Mingau Proteico Cremoso de Baunilha",
    "tipo": "mingau",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "ml",
        "name": "Leite desnatado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Aveia em flocos finos"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Whey protein sabor baunilha"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Leite em pó desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Coloque o leite e a aveia em uma panela pequena.",
      "Leve ao fogo baixo.",
      "Mexa continuamente até a aveia cozinhar e o mingau engrossar.",
      "Desligue o fogo.",
      "Aguarde alguns segundos para reduzir levemente a temperatura.",
      "Acrescente o whey protein e o leite em pó.",
      "Misture vigorosamente até obter um creme homogêneo.",
      "Finalize com canela.",
      "Sirva ainda morno."
    ],
    "macros": {
      "kcal": 245,
      "p": 24,
      "c": 31,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-164",
    "name": "Strogonoff Leve de Frango com Arroz",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Arroz branco cozido"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Creme de leite leve ou zero lactose"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola picada"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Mostarda"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e páprica a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite e refogue a cebola.",
      "Acrescente o frango e deixe dourar.",
      "Adicione o molho de tomate e a mostarda.",
      "Cozinhe por aproximadamente 3 minutos.",
      "Desligue o fogo e misture o creme de leite.",
      "Sirva com o arroz."
    ],
    "macros": {
      "kcal": 390,
      "p": 39,
      "c": 31,
      "f": 12
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Pode utilizar creme de leite zero lactose."
  },
  {
    "id": "NL-165",
    "name": "Macarrão à Bolonhesa de Patinho",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "Macarrão cru"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, orégano e manjericão a gosto"
      }
    ],
    "steps": [
      "Cozinhe o macarrão até ficar al dente.",
      "Refogue a cebola e o alho no azeite.",
      "Acrescente o patinho e deixe dourar.",
      "Junte a cenoura e o molho de tomate.",
      "Tempere e cozinhe por aproximadamente 5 minutos.",
      "Sirva o molho sobre o macarrão."
    ],
    "macros": {
      "kcal": 410,
      "p": 31,
      "c": 45,
      "f": 12
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-166",
    "name": "Peixe Assado com Batata e Tomate",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Filé de tilápia, pescada ou linguado"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Batata inglesa em rodelas finas"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, alho, sal e orégano a gosto"
      }
    ],
    "steps": [
      "Tempere o peixe com limão, alho e sal.",
      "Cozinhe previamente as rodelas de batata por aproximadamente 5 minutos.",
      "Em um refratário, distribua a batata, o tomate e a cebola.",
      "Coloque o peixe por cima.",
      "Regue com azeite e finalize com orégano.",
      "Asse a 200 °C por aproximadamente 15 a 20 minutos."
    ],
    "macros": {
      "kcal": 330,
      "p": 35,
      "c": 25,
      "f": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-167",
    "name": "Panqueca de Carne com Molho de Tomate",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "60",
        "unit": "ml",
        "name": "Leite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pitada de sal"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Molho de tomate"
      }
    ],
    "steps": [
      "Bata o ovo, a farinha, o leite e o sal.",
      "Despeje em uma frigideira antiaderente e doure dos dois lados.",
      "Refogue separadamente a carne com a cebola e o tomate.",
      "Recheie a panqueca e enrole.",
      "Cubra com o molho de tomate.",
      "Aqueça por alguns minutos antes de servir."
    ],
    "macros": {
      "kcal": 390,
      "p": 34,
      "c": 27,
      "f": 17
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Pode utilizar frango desfiado no recheio."
  },
  {
    "id": "NL-168",
    "name": "Frango Xadrez Caseiro com Arroz",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Peito de frango em cubos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Arroz cozido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Pimentão"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cenoura"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Molho shoyu com menor teor de sódio"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite em uma frigideira.",
      "Doure o frango.",
      "Acrescente a cebola, a cenoura e o pimentão.",
      "Refogue mantendo os legumes levemente firmes.",
      "Acrescente o shoyu e misture.",
      "Finalize com cebolinha e sirva com o arroz."
    ],
    "macros": {
      "kcal": 375,
      "p": 39,
      "c": 34,
      "f": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-169",
    "name": "Polenta Cremosa com Frango Desfiado ao Molho",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "35",
        "unit": "g",
        "name": "Fubá"
      },
      {
        "quantity": "180",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Frango cozido e desfiado"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Molho de tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Parmesão ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Cozinhe o fubá com a água e uma pitada de sal, mexendo até ficar cremoso.",
      "Refogue a cebola e acrescente o frango.",
      "Junte o molho de tomate e cozinhe por alguns minutos.",
      "Coloque a polenta em um prato fundo.",
      "Distribua o frango por cima.",
      "Finalize com o parmesão e o cheiro-verde."
    ],
    "macros": {
      "kcal": 350,
      "p": 34,
      "c": 34,
      "f": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-170",
    "name": "Arroz de Uma Panela com Frango e Cenoura",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Peito de frango em cubinhos"
      },
      {
        "quantity": "35",
        "unit": "g",
        "name": "Arroz cru"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "Água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola e o alho no azeite.",
      "Acrescente o frango e deixe dourar.",
      "Junte o arroz, a cenoura e o tomate.",
      "Acrescente a água e ajuste o sal.",
      "Cozinhe em fogo baixo até o arroz ficar macio.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 385,
      "p": 38,
      "c": 38,
      "f": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-171",
    "name": "Filé Mignon Suíno com Purê de Batata",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Filé mignon suíno em medalhões"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "Batata inglesa cozida"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "Leite"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e alecrim a gosto"
      }
    ],
    "steps": [
      "Tempere a carne com alho, sal e alecrim.",
      "Grelhe em frigideira com azeite até dourar e cozinhar completamente.",
      "Amasse a batata ainda quente.",
      "Acrescente o leite aos poucos até obter um purê cremoso.",
      "Sirva os medalhões acompanhados do purê."
    ],
    "macros": {
      "kcal": 390,
      "p": 35,
      "c": 25,
      "f": 17
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-172",
    "name": "Tilápia Desfiada com Arroz Cremoso de Abobrinha",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Filé de tilápia"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Arroz cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Abobrinha ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Creme de ricota"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Grelhe a tilápia e desfie grosseiramente.",
      "Refogue a cebola e a abobrinha no azeite.",
      "Acrescente o arroz cozido.",
      "Misture o creme de ricota até ficar levemente cremoso.",
      "Acrescente o peixe e misture delicadamente.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 375,
      "p": 36,
      "c": 30,
      "f": 13
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-173",
    "name": "Batata Recheada com Carne Moída Cremosa",
    "tipo": "prato",
    "meals": [
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "Batata inglesa"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Patinho moído"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Creme de ricota"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e páprica a gosto"
      }
    ],
    "steps": [
      "Cozinhe ou asse a batata até ficar macia.",
      "Refogue a carne com a cebola e o tomate.",
      "Abra a batata ao meio e retire delicadamente uma pequena quantidade do miolo.",
      "Misture o miolo com o creme de ricota.",
      "Junte à carne moída.",
      "Recheie a batata e aqueça por mais alguns minutos no forno ou na airfryer.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 395,
      "p": 33,
      "c": 33,
      "f": 15
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-174",
    "name": "Sanduíche Cremoso de Grão-de-Bico",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão integral sem ingredientes de origem animal"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "Grão-de-bico cozido"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Amasse o grão-de-bico com um garfo.",
      "Acrescente azeite, limão, sal e pimenta.",
      "Misture a cenoura e o cheiro-verde.",
      "Recheie o pão.",
      "Acrescente o tomate e sirva."
    ],
    "macros": {
      "kcal": 330,
      "p": 12,
      "c": 49,
      "f": 10,
      "fiber": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Pode acrescentar folhas de alface ou rúcula."
  },
  {
    "id": "NL-175",
    "name": "Bolinho de Batata com Milho na Airfryer",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 5,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "Batata inglesa cozida e amassada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "Milho cozido"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cenoura ralada"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal, orégano e páprica a gosto"
      }
    ],
    "steps": [
      "Misture a batata amassada com o milho e a cenoura.",
      "Acrescente a farinha de aveia, o azeite e os temperos.",
      "Modele pequenos bolinhos.",
      "Leve à airfryer a 190 °C por aproximadamente 15 minutos.",
      "Vire na metade do tempo para dourar dos dois lados."
    ],
    "macros": {
      "kcal": 285,
      "p": 7,
      "c": 48,
      "f": 8,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-176",
    "name": "Bolo de Caneca de Chocolate",
    "tipo": "bolo",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Vegana",
      "Sem lactose",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "Farinha de aveia"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Cacau em pó"
      },
      {
        "quantity": "60",
        "unit": "ml",
        "name": "Bebida vegetal"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Banana madura amassada"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Açúcar demerara ou adoçante culinário"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Óleo vegetal"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ colher de chá de fermento químico"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Chocolate 70% sem leite picado"
      }
    ],
    "steps": [
      "Misture a banana, a bebida vegetal e o óleo.",
      "Acrescente a farinha, o cacau e o açúcar.",
      "Misture bem.",
      "Acrescente o fermento.",
      "Finalize com o chocolate picado.",
      "Leve ao micro-ondas por aproximadamente 1 minuto e 30 segundos a 2 minutos."
    ],
    "macros": {
      "kcal": 280,
      "p": 7,
      "c": 43,
      "f": 10,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-177",
    "name": "Bruschetta de Tomate com Manjericão",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "2 fatias de pão italiano ou integral sem ingredientes de origem animal"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão e orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Torre levemente as fatias de pão.",
      "Esfregue o alho sobre o pão ainda quente.",
      "Misture o tomate, o azeite, o manjericão, o sal e a pimenta.",
      "Distribua sobre as torradas.",
      "Finalize com orégano e sirva."
    ],
    "macros": {
      "kcal": 250,
      "p": 7,
      "c": 39,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-178",
    "name": "Pastel Assado de Palmito e Tomate",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 discos pequenos de massa para pastel sem ingredientes de origem animal"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "Palmito picado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "Cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola, o tomate e o palmito no azeite.",
      "Tempere e deixe o recheio esfriar levemente.",
      "Distribua sobre os discos de massa.",
      "Feche pressionando as bordas com um garfo.",
      "Leve à airfryer a 180 °C por aproximadamente 12 a 15 minutos."
    ],
    "macros": {
      "kcal": 300,
      "p": 6,
      "c": 42,
      "f": 12,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Verificar no rótulo se a massa não contém leite, ovos ou gordura de origem animal."
  },
  {
    "id": "NL-179",
    "name": "Creme Gelado de Manga com Coco",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Vegana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Manga congelada"
      },
      {
        "quantity": "80",
        "unit": "ml",
        "name": "Bebida de coco ou bebida vegetal"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Coco ralado sem açúcar"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Chia"
      }
    ],
    "steps": [
      "Bata a manga congelada com a bebida vegetal.",
      "Continue batendo até formar um creme espesso.",
      "Coloque em uma tigela.",
      "Finalize com coco ralado e chia."
    ],
    "macros": {
      "kcal": 180,
      "p": 3,
      "c": 29,
      "f": 7,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-180",
    "name": "Pão Francês com Pasta Cremosa de Abacate e Tomate",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão francês pequeno sem ingredientes de origem animal"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "Abacate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "Tomate em rodelas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e orégano a gosto"
      }
    ],
    "steps": [
      "Amasse o abacate.",
      "Tempere com algumas gotas de limão, sal e pimenta.",
      "Abra o pão.",
      "Espalhe o creme de abacate.",
      "Acrescente o tomate.",
      "Finalize com orégano."
    ],
    "macros": {
      "kcal": 285,
      "p": 7,
      "c": 39,
      "f": 12,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-181",
    "name": "Bolinho Assado de Banana, Aveia e Coco",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "1 banana pequena madura"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Aveia em flocos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Coco ralado"
      },
      {
        "quantity": "20",
        "unit": "ml",
        "name": "Bebida vegetal"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "½ colher de chá de fermento"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "Uva-passa , opcional"
      }
    ],
    "steps": [
      "Amasse a banana.",
      "Misture a aveia, o coco, a bebida vegetal e a canela.",
      "Acrescente o fermento.",
      "Distribua em duas forminhas pequenas.",
      "Leve à airfryer a 170 °C por aproximadamente 12 a 15 minutos."
    ],
    "macros": {
      "kcal": 245,
      "p": 5,
      "c": 43,
      "f": 7,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-182",
    "name": "Milho Quentinho Temperado com Páprica e Ervas",
    "tipo": "petisco",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "Milho cozido"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "Azeite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "Tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica, orégano e sal a gosto"
      }
    ],
    "steps": [
      "Aqueça o milho em uma frigideira.",
      "Acrescente o azeite e o tomate.",
      "Tempere com páprica e orégano.",
      "Refogue por aproximadamente 2 minutos.",
      "Finalize com cheiro-verde.",
      "Sirva ainda quente."
    ],
    "macros": {
      "kcal": 190,
      "p": 5,
      "c": 30,
      "f": 6,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-183",
    "name": "Maçã Quente com Canela, Aveia e Pasta de Amendoim",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Vegana",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "1 maçã média"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "Aveia em flocos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "Pasta de amendoim integral"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "Água"
      }
    ],
    "steps": [
      "Corte a maçã em cubinhos.",
      "Coloque em uma frigideira com a água e a canela.",
      "Cozinhe em fogo baixo até começar a amolecer.",
      "Acrescente a aveia e misture.",
      "Transfira para uma tigela.",
      "Finalize com a pasta de amendoim."
    ],
    "macros": {
      "kcal": 240,
      "p": 6,
      "c": 38,
      "f": 8,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-184",
    "name": "Pão Francês com Patê Cremoso de Atum e Ovo",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão francês pequeno"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo cozido"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Amasse o ovo cozido.",
      "Misture com o atum e o creme de ricota.",
      "Acrescente tomate e cheiro-verde.",
      "Tempere e recheie o pão.",
      "Se desejar, aqueça rapidamente na sanduicheira."
    ],
    "macros": {
      "kcal": 390,
      "p": 35,
      "c": 32,
      "f": 14,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "O creme de ricota pode ser substituído por cottage."
  },
  {
    "id": "NL-185",
    "name": "Bolo Salgado de Caneca com Frango e Queijo",
    "tipo": "bolo",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "frango cozido e desfiado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "farinha de aveia"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "queijo minas ralado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de fermento químico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, orégano e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Misture o ovo e o iogurte.",
      "Acrescente a farinha, o frango, o queijo e o tomate.",
      "Tempere.",
      "Adicione o fermento por último.",
      "Coloque em recipiente próprio para micro-ondas.",
      "Cozinhe por aproximadamente 3 minutos."
    ],
    "macros": {
      "kcal": 320,
      "p": 34,
      "c": 18,
      "f": 13,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-186",
    "name": "Cuscuz com Sardinha, Ovo e Tomate",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "35",
        "unit": "g",
        "name": "flocão de milho"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "sardinha escorrida"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Hidrate o flocão por 5 minutos.",
      "Cozinhe o cuscuz.",
      "Prepare o ovo mexido.",
      "Misture a sardinha com tomate e cheiro-verde.",
      "Sirva junto ao cuscuz."
    ],
    "macros": {
      "kcal": 350,
      "p": 27,
      "c": 29,
      "f": 14,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-187",
    "name": "Ovos Mexidos Cremosos com Cottage e Pão Integral",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "2 ovos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "35",
        "unit": "g",
        "name": "1 fatia de pão integral"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Bata ligeiramente os ovos.",
      "Cozinhe em fogo baixo, mexendo delicadamente.",
      "Quando estiverem quase prontos, acrescente o cottage.",
      "Sirva com o pão tostado e os tomates."
    ],
    "macros": {
      "kcal": 330,
      "p": 25,
      "c": 20,
      "f": 17,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-188",
    "name": "Tapioca com Carne Desfiada e Creme de Ricota",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "goma de tapioca"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "carne bovina cozida e desfiada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Prepare a tapioca.",
      "Misture a carne com o creme de ricota.",
      "Acrescente tomate e cheiro-verde.",
      "Recheie e dobre."
    ],
    "macros": {
      "kcal": 350,
      "p": 29,
      "c": 28,
      "f": 14,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-189",
    "name": "Muffin Proteico de Atum e Queijo",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 3,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "2 ovos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas ralado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "1 colher de sopa de farinha de aveia sem glúten"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de fermento químico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano, cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Bata os ovos com um garfo.",
      "Acrescente o atum, o queijo, o tomate e a cenoura.",
      "Misture a farinha de aveia e os temperos.",
      "Acrescente o fermento por último.",
      "Distribua em forminhas de silicone.",
      "Leve à airfryer a 180 °C por aproximadamente 12 a 15 minutos."
    ],
    "macros": {
      "kcal": 340,
      "p": 36,
      "c": 10,
      "f": 18,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "O queijo minas pode ser substituído por cottage."
  },
  {
    "id": "NL-190",
    "name": "Cottage Cremoso com Ovos, Tomate e Torrada",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "2 ovos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "1 fatia de pão integral"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha e orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Prepare os ovos mexidos em fogo baixo.",
      "Coloque o cottage em uma tigela ou prato.",
      "Acrescente os ovos ainda quentes.",
      "Finalize com tomate, cebolinha e orégano.",
      "Torre o pão e sirva ao lado."
    ],
    "macros": {
      "kcal": 350,
      "p": 28,
      "c": 20,
      "f": 19,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Pode usar cottage zero lactose para uma versão sem lactose."
  },
  {
    "id": "NL-191",
    "name": "Pão Sírio com Frango, Queijo e Tomate",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão sírio pequeno"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "frango cozido e desfiado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate em rodelas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Abra o pão sírio.",
      "Misture o frango com o creme de ricota.",
      "Recheie com o frango, o queijo e o tomate.",
      "Finalize com orégano.",
      "Leve à sanduicheira ou frigideira até o pão ficar levemente crocante e o queijo aquecer."
    ],
    "macros": {
      "kcal": 390,
      "p": 38,
      "c": 37,
      "f": 11,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-192",
    "name": "Queijo Minas Grelhado com Ovos e Tomate",
    "tipo": "prato",
    "meals": [
      "breakfast"
    ],
    "tags": [
      "Rico em proteínas",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "2 ovos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "queijo minas frescal"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Grelhe o queijo dos dois lados.",
      "Reserve.",
      "Prepare os ovos.",
      "Doure rapidamente o tomate.",
      "Sirva tudo junto e finalize com orégano."
    ],
    "macros": {
      "kcal": 390,
      "p": 27,
      "c": 7,
      "f": 28,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-193",
    "name": "Tostada de Frango com Creme de Ricota e Tomate",
    "tipo": "prato",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão integral"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "frango cozido e desfiado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "parmesão ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Misture o frango com o creme de ricota.",
      "Distribua sobre o pão.",
      "Acrescente tomate.",
      "Finalize com parmesão e orégano.",
      "Leve à airfryer a 180 °C por aproximadamente 5 minutos."
    ],
    "macros": {
      "kcal": 360,
      "p": 35,
      "c": 30,
      "f": 12,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-194",
    "name": "Frango ao Molho de Laranja com Arroz e Cenoura",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "peito de frango em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "50",
        "unit": "ml",
        "name": "suco de laranja natural"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere o frango.",
      "Doure no azeite.",
      "Acrescente cebola e cenoura.",
      "Junte o suco de laranja e cozinhe até reduzir levemente.",
      "Sirva com o arroz.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 420,
      "p": 43,
      "c": 40,
      "f": 10,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-195",
    "name": "Carne Moída com Batata e Ervilha",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "batata em cubos"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "ervilha"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, páprica e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e alho no azeite.",
      "Acrescente a carne e deixe dourar.",
      "Junte o tomate.",
      "Acrescente a batata previamente cozida e a ervilha.",
      "Misture e deixe apurar por alguns minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 450,
      "p": 41,
      "c": 31,
      "f": 19,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-196",
    "name": "Filé de Peixe Assado com Tomate, Cebola e Batata",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "filé de pescada ou linguado"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "batata em rodelas"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, alho, sal e orégano a gosto"
      }
    ],
    "steps": [
      "Tempere o peixe.",
      "Cozinhe a batata por 5 minutos.",
      "Monte um refratário com batata, tomate e cebola.",
      "Coloque o peixe por cima.",
      "Regue com azeite.",
      "Asse a 200 °C por aproximadamente 20 minutos."
    ],
    "macros": {
      "kcal": 345,
      "p": 37,
      "c": 27,
      "f": 10,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-197",
    "name": "Frango Gratinado com Espinafre e Creme de Ricota",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "frango em tiras"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "muçarela"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e pimenta a gosto"
      }
    ],
    "steps": [
      "Doure o frango com cebola e alho.",
      "Acrescente o espinafre e deixe murchar.",
      "Misture o creme de ricota.",
      "Transfira para um refratário.",
      "Acrescente tomate e muçarela.",
      "Leve ao forno até gratinar."
    ],
    "macros": {
      "kcal": 430,
      "p": 53,
      "c": 9,
      "f": 20,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-198",
    "name": "Escondidinho de Carne com Purê de Abóbora",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "140",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "200",
        "unit": "g",
        "name": "abóbora cabotiá cozida"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Amasse a abóbora com o leite.",
      "Refogue a carne com cebola, alho e tomate.",
      "Coloque a carne em um refratário.",
      "Cubra com o purê.",
      "Finalize com o queijo.",
      "Leve ao forno até dourar."
    ],
    "macros": {
      "kcal": 440,
      "p": 41,
      "c": 29,
      "f": 19,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-199",
    "name": "Arroz de Forno com Frango, Milho e Queijo",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "milho"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e orégano a gosto"
      }
    ],
    "steps": [
      "Misture o arroz com o frango, milho, tomate e creme de ricota.",
      "Coloque em um refratário.",
      "Cubra com o queijo.",
      "Finalize com orégano.",
      "Leve ao forno por aproximadamente 15 minutos."
    ],
    "macros": {
      "kcal": 455,
      "p": 38,
      "c": 45,
      "f": 14,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-200",
    "name": "Bife Rolê com Cenoura ao Molho de Tomate",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "patinho em bifes finos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cenoura em palitos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Tempere os bifes.",
      "Coloque palitos de cenoura sobre cada um.",
      "Enrole e prenda com palitos.",
      "Doure no azeite.",
      "Acrescente cebola e molho de tomate.",
      "Tampe e cozinhe até a carne ficar macia."
    ],
    "macros": {
      "kcal": 390,
      "p": 43,
      "c": 13,
      "f": 18,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-201",
    "name": "Frango com Quiabo e Arroz",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "peito de frango em cubos"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "quiabo"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, páprica e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Doure o frango no azeite.",
      "Acrescente cebola e alho.",
      "Junte o quiabo e o tomate.",
      "Cozinhe até ficar macio.",
      "Sirva com o arroz.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 410,
      "p": 43,
      "c": 38,
      "f": 10,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-202",
    "name": "Salmão com Crosta de Gergelim e Legumes",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "salmão"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "gergelim"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "cenoura"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "brócolis"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Tempere o salmão.",
      "Pressione o gergelim sobre a superfície.",
      "Asse ou grelhe até atingir o ponto desejado.",
      "Salteie os legumes no azeite.",
      "Sirva juntos."
    ],
    "macros": {
      "kcal": 480,
      "p": 37,
      "c": 18,
      "f": 30,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-203",
    "name": "Carne Assada com Batata-Doce e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "carne bovina magra"
      },
      {
        "quantity": "130",
        "unit": "g",
        "name": "batata-doce"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, páprica e alecrim a gosto"
      }
    ],
    "steps": [
      "Tempere a carne.",
      "Corte a batata em cubos.",
      "Disponha carne, batata e cebola em uma assadeira.",
      "Regue com azeite.",
      "Asse a 200 °C até dourar e a carne atingir o ponto desejado."
    ],
    "macros": {
      "kcal": 445,
      "p": 42,
      "c": 31,
      "f": 18,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-204",
    "name": "Frango com Creme de Abóbora e Queijo",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "frango em cubos"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "abóbora cozida"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, páprica e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Bata ou amasse a abóbora com o creme de ricota.",
      "Doure o frango com a cebola.",
      "Acrescente o creme de abóbora.",
      "Misture bem.",
      "Finalize com queijo.",
      "Tampe até derreter."
    ],
    "macros": {
      "kcal": 400,
      "p": 51,
      "c": 19,
      "f": 14,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-205",
    "name": "Peixe ao Molho de Tomate com Alcaparras",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "filé de peixe branco"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "alcaparras"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, pimenta e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere o peixe.",
      "Doure rapidamente no azeite.",
      "Acrescente cebola e molho de tomate.",
      "Junte as alcaparras.",
      "Tampe e cozinhe até o peixe ficar macio.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 300,
      "p": 38,
      "c": 10,
      "f": 11,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-206",
    "name": "Carne Moída com Berinjela e Queijo Gratinado",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "140",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "berinjela em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "muçarela"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho e orégano a gosto"
      }
    ],
    "steps": [
      "Refogue a carne com cebola e alho.",
      "Acrescente a berinjela.",
      "Junte o molho de tomate.",
      "Cozinhe até a berinjela ficar macia.",
      "Transfira para um refratário.",
      "Cubra com queijo e gratine."
    ],
    "macros": {
      "kcal": 440,
      "p": 44,
      "c": 15,
      "f": 23,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-207",
    "name": "Frango Assado com Batata, Cebola e Tomate",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "peito de frango"
      },
      {
        "quantity": "130",
        "unit": "g",
        "name": "batata"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, páprica, sal e orégano a gosto"
      }
    ],
    "steps": [
      "Tempere o frango.",
      "Corte batata, tomate e cebola.",
      "Disponha tudo em uma assadeira.",
      "Regue com azeite.",
      "Asse a 200 °C por aproximadamente 30 minutos."
    ],
    "macros": {
      "kcal": 405,
      "p": 45,
      "c": 31,
      "f": 10,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-208",
    "name": "Lombo Suíno com Molho de Mostarda e Mel",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "lombo suíno"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "mostarda"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "mel"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Tempere o lombo.",
      "Doure no azeite.",
      "Retire e reserve.",
      "Refogue a cebola.",
      "Misture mostarda e mel.",
      "Retorne o lombo e envolva no molho."
    ],
    "macros": {
      "kcal": 350,
      "p": 43,
      "c": 8,
      "f": 16
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-209",
    "name": "Arroz com Lentilha e Carne em Tiras",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "carne bovina em tiras"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "lentilha cozida"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Doure a carne.",
      "Acrescente cebola e tomate.",
      "Misture arroz e lentilha.",
      "Acrescente à frigideira.",
      "Ajuste os temperos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 470,
      "p": 38,
      "c": 52,
      "f": 12,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-210",
    "name": "Torta de Batata com Atum e Tomate",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata cozida"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e orégano a gosto"
      }
    ],
    "steps": [
      "Amasse a batata.",
      "Misture com o ovo.",
      "Coloque metade em um refratário.",
      "Recheie com atum, tomate e cebola.",
      "Cubra com o restante.",
      "Finalize com queijo e orégano.",
      "Asse até dourar."
    ],
    "macros": {
      "kcal": 445,
      "p": 38,
      "c": 35,
      "f": 17,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-211",
    "name": "Grão-de-Bico ao Molho de Tomate com Ovos",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "grão-de-bico cozido"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 ovos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e páprica a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e tomate.",
      "Acrescente o molho e o grão-de-bico.",
      "Abra dois espaços e coloque os ovos.",
      "Tampe até os ovos cozinharem.",
      "Finalize com o queijo e cheiro-verde."
    ],
    "macros": {
      "kcal": 445,
      "p": 25,
      "c": 40,
      "f": 21,
      "fiber": 11
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-212",
    "name": "Lentilha Cremosa com Legumes e Ovo",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "lentilha cozida"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 ovos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue os legumes no azeite.",
      "Acrescente a lentilha.",
      "Amasse uma pequena parte para deixar o caldo cremoso.",
      "Prepare os ovos separadamente.",
      "Sirva sobre a lentilha.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 410,
      "p": 24,
      "c": 41,
      "f": 17,
      "fiber": 13
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-213",
    "name": "Frango com Feijão-Preto, Arroz e Vinagrete",
    "tipo": "prato",
    "meals": [
      "lunch"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "peito de frango grelhado"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "feijão-preto cozido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "pimentão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Tempere e grelhe o frango.",
      "Aqueça arroz e feijão.",
      "Misture tomate, cebola, pimentão, limão e cheiro-verde para fazer o vinagrete.",
      "Monte o prato com todos os componentes."
    ],
    "macros": {
      "kcal": 480,
      "p": 44,
      "c": 50,
      "f": 11,
      "fiber": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-214",
    "name": "Arroz com Brócolis e Alho",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "brócolis picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue o alho no azeite.",
      "Acrescente o brócolis e cozinhe por alguns minutos.",
      "Junte o arroz cozido.",
      "Misture bem.",
      "Ajuste o sal e finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 190,
      "p": 5,
      "c": 36,
      "f": 4,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-215",
    "name": "Arroz com Cenoura e Ervilha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "ervilha"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente a cenoura e a ervilha.",
      "Cozinhe por 2 a 3 minutos.",
      "Adicione o arroz.",
      "Misture bem e ajuste o sal."
    ],
    "macros": {
      "kcal": 210,
      "p": 5,
      "c": 40,
      "f": 4,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-216",
    "name": "Arroz Cremoso com Abóbora",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "abóbora cozida e amassada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, noz-moscada e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente a abóbora.",
      "Adicione a água e misture até formar um creme.",
      "Junte o arroz.",
      "Misture bem.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 205,
      "p": 4,
      "c": 39,
      "f": 4,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-217",
    "name": "Arroz com Lentilha e Cebola Dourada",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "lentilha cozida"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cebola fatiada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Doure a cebola no azeite em fogo baixo.",
      "Acrescente a lentilha.",
      "Junte o arroz.",
      "Misture bem.",
      "Ajuste o sal e a pimenta."
    ],
    "macros": {
      "kcal": 250,
      "p": 8,
      "c": 46,
      "f": 4,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-218",
    "name": "Arroz com Açafrão, Milho e Cheiro-Verde",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "milho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de cúrcuma"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e sal a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente a cúrcuma.",
      "Junte o milho.",
      "Adicione o arroz.",
      "Misture bem.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 205,
      "p": 4,
      "c": 40,
      "f": 4,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-219",
    "name": "Arroz com Espinafre e Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e alho a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e alho.",
      "Acrescente o tomate.",
      "Junte o espinafre e deixe murchar.",
      "Adicione o arroz.",
      "Misture bem."
    ],
    "macros": {
      "kcal": 190,
      "p": 5,
      "c": 35,
      "f": 4,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-220",
    "name": "Arroz com Abobrinha e Cenoura",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "abobrinha ralada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e alho.",
      "Acrescente a cenoura e a abobrinha.",
      "Cozinhe rapidamente.",
      "Junte o arroz.",
      "Misture e finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 195,
      "p": 4,
      "c": 36,
      "f": 4,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-221",
    "name": "Arroz com Feijão-Fradinho e Pimentão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "feijão-fradinho cozido"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "pimentão picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e pimentão.",
      "Acrescente o tomate.",
      "Junte o feijão-fradinho.",
      "Adicione o arroz.",
      "Misture e finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 255,
      "p": 8,
      "c": 47,
      "f": 4,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-222",
    "name": "Arroz Integral com Cogumelos e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz integral cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "cogumelos fatiados"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, salsinha e tomilho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e alho no azeite.",
      "Acrescente os cogumelos.",
      "Cozinhe até dourarem.",
      "Junte o arroz integral.",
      "Finalize com as ervas."
    ],
    "macros": {
      "kcal": 200,
      "p": 6,
      "c": 34,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-223",
    "name": "Arroz com Couve e Alho",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "couve fatiada fina"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Doure o alho no azeite.",
      "Acrescente a couve e refogue rapidamente.",
      "Junte o arroz.",
      "Misture bem.",
      "Ajuste os temperos."
    ],
    "macros": {
      "kcal": 185,
      "p": 4,
      "c": 34,
      "f": 4,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-224",
    "name": "Arroz com Abacaxi e Cebola Dourada",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "abacaxi em cubos pequenos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola fatiada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite e doure a cebola.",
      "Acrescente o abacaxi.",
      "Cozinhe por 2 a 3 minutos.",
      "Junte o arroz.",
      "Misture delicadamente.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 210,
      "p": 3,
      "c": 43,
      "f": 4,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-225",
    "name": "Arroz com Amêndoas em Lascas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "amêndoas em lascas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Doure levemente as amêndoas em uma frigideira seca.",
      "Retire e reserve.",
      "Na mesma frigideira, aqueça o azeite e refogue a cebola.",
      "Acrescente o arroz.",
      "Junte as amêndoas.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 225,
      "p": 5,
      "c": 33,
      "f": 9,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-226",
    "name": "Arroz com Coco Seco Ralado",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "coco seco ralado sem açúcar"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite e refogue a cebola.",
      "Acrescente o coco ralado e mexa por alguns segundos.",
      "Junte o arroz cozido.",
      "Misture bem.",
      "Ajuste o sal.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 235,
      "p": 4,
      "c": 36,
      "f": 9,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-227",
    "name": "Salada Fria de Feijão-Branco com Tomate e Pepino",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "feijão-branco cozido e escorrido"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "tomate-cereja cortado ao meio"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "pepino em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa fatiada"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "salsinha picada"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o feijão-branco já frio em uma tigela.",
      "Acrescente o tomate, o pepino, a cebola e a salsinha.",
      "Tempere com azeite, limão, sal e pimenta.",
      "Misture delicadamente.",
      "Mantenha refrigerada até servir."
    ],
    "macros": {
      "kcal": 230,
      "p": 10,
      "c": 34,
      "f": 6,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-228",
    "name": "Salada Fria de Feijão-Rajado com Milho e Vinagrete",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "feijão-rajado cozido e escorrido"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "milho cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "pimentão amarelo picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de vinagre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Deixe o feijão esfriar completamente.",
      "Misture com o milho, tomate, cebola e pimentão.",
      "Tempere com azeite, vinagre, sal e pimenta.",
      "Acrescente cheiro-verde.",
      "Leve à geladeira até o momento de servir."
    ],
    "macros": {
      "kcal": 245,
      "p": 10,
      "c": 39,
      "f": 6,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-229",
    "name": "Salada Fria de Feijão-Fradinho com Manga e Hortelã",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "feijão-fradinho cozido e escorrido"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "manga em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "pepino em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã picada a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Coloque o feijão-fradinho frio em uma tigela.",
      "Acrescente manga, pepino e cebola.",
      "Tempere com azeite, limão, sal e pimenta.",
      "Misture delicadamente.",
      "Finalize com hortelã."
    ],
    "macros": {
      "kcal": 245,
      "p": 9,
      "c": 42,
      "f": 5,
      "fiber": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-230",
    "name": "Salada Fria de Feijão-Vermelho com Cenoura e Tomate",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "feijão-vermelho cozido e escorrido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "pimentão amarelo"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de vinagre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Misture o feijão frio com a cenoura.",
      "Acrescente o tomate, a cebola e o pimentão.",
      "Tempere com azeite, vinagre, sal e pimenta.",
      "Finalize com salsinha.",
      "Sirva bem fresca."
    ],
    "macros": {
      "kcal": 235,
      "p": 10,
      "c": 36,
      "f": 6,
      "fiber": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-231",
    "name": "Salada Fria de Feijão-Carioca com Abobrinha e Tomate",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "feijão-carioca cozido e bem escorrido"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "abobrinha em cubinhos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Deixe o feijão completamente frio e bem escorrido.",
      "Misture com a abobrinha, tomate, cebola e cenoura.",
      "Tempere com azeite, limão, sal e pimenta.",
      "Finalize com cheiro-verde.",
      "Mantenha refrigerada até servir."
    ],
    "macros": {
      "kcal": 220,
      "p": 9,
      "c": 34,
      "f": 6,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-232",
    "name": "Sopa de Mandioca com Frango e Couve",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "peito de frango cozido e desfiado"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "mandioca cozida"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "couve fatiada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "água ou caldo caseiro"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Bata a mandioca com parte da água até formar um creme.",
      "Refogue cebola e alho no azeite.",
      "Acrescente o frango.",
      "Junte o creme de mandioca e o restante da água.",
      "Cozinhe por alguns minutos.",
      "Acrescente a couve no final e cozinhe até murchar."
    ],
    "macros": {
      "kcal": 430,
      "p": 42,
      "c": 50,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-233",
    "name": "Sopa de Lentilha com Carne Moída e Cenoura",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "lentilha cozida"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "cenoura em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, páprica e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e alho.",
      "Acrescente a carne e deixe dourar.",
      "Junte tomate e cenoura.",
      "Acrescente a lentilha e a água.",
      "Cozinhe até os legumes ficarem macios.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 410,
      "p": 35,
      "c": 40,
      "f": 12,
      "fiber": 11
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-234",
    "name": "Creme de Abóbora com Carne Seca Desfiada",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "abóbora cabotiá cozida"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "carne seca dessalgada, cozida e desfiada"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "350",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Bata a abóbora com a água.",
      "Refogue cebola e alho no azeite.",
      "Acrescente a carne seca.",
      "Junte o creme de abóbora.",
      "Cozinhe por 5 a 8 minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 390,
      "p": 35,
      "c": 24,
      "f": 17,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-235",
    "name": "Sopa de Feijão-Branco com Frango e Espinafre",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "feijão-branco cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Bata metade do feijão com parte da água.",
      "Refogue cebola e alho.",
      "Acrescente o frango.",
      "Junte o feijão batido e o feijão inteiro.",
      "Acrescente o tomate.",
      "Finalize com o espinafre e cozinhe até murchar."
    ],
    "macros": {
      "kcal": 370,
      "p": 38,
      "c": 36,
      "f": 7,
      "fiber": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-236",
    "name": "Caldo de Batata-Doce com Carne Desfiada",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "carne bovina magra cozida e desfiada"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata-doce cozida"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "350",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Bata a batata-doce com a água.",
      "Refogue cebola e alho no azeite.",
      "Acrescente a carne.",
      "Junte o creme de batata-doce.",
      "Cozinhe até ficar bem quente e cremoso.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 445,
      "p": 40,
      "c": 38,
      "f": 15,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-237",
    "name": "Sopa de Grão-de-Bico com Frango e Legumes",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "grão-de-bico cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Coloque a cenoura, a abobrinha e o tomate para cozinhar.",
      "Acrescente o grão-de-bico.",
      "Junte o frango desfiado.",
      "Cozinhe por mais alguns minutos.",
      "Amasse parte do grão-de-bico para deixar o caldo mais encorpado.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 390,
      "p": 36,
      "c": 42,
      "f": 8,
      "fiber": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-238",
    "name": "Creme de Inhame com Frango e Alho-Poró",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "inhame cozido"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "frango cozido e desfiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "alho-poró fatiado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "350",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Bata o inhame com a água.",
      "Refogue cebola e alho-poró.",
      "Acrescente o frango.",
      "Junte o creme de inhame.",
      "Cozinhe por alguns minutos.",
      "Ajuste os temperos."
    ],
    "macros": {
      "kcal": 400,
      "p": 37,
      "c": 42,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-239",
    "name": "Sopa de Abóbora com Lentilha e Espinafre",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "abóbora em cubos"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "lentilha cozida"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e páprica a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e alho.",
      "Acrescente abóbora e tomate.",
      "Junte a água e cozinhe até a abóbora amaciar.",
      "Acrescente a lentilha.",
      "Amasse alguns cubos de abóbora para engrossar o caldo.",
      "Finalize com o espinafre."
    ],
    "macros": {
      "kcal": 315,
      "p": 14,
      "c": 48,
      "f": 7,
      "fiber": 13
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-240",
    "name": "Sopa de Arroz com Frango e Legumes",
    "tipo": "sopa",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "frango cozido e desfiado"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "arroz cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "chuchu"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "450",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Cozinhe cenoura e chuchu na água.",
      "Acrescente tomate e cebola.",
      "Junte o frango.",
      "Adicione o arroz.",
      "Cozinhe por mais 5 minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 350,
      "p": 37,
      "c": 35,
      "f": 6,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-241",
    "name": "Caldo Verde Leve com Frango",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "frango cozido e desfiado"
      },
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata cozida"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "couve fatiada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "400",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Bata a batata com a água até formar um caldo cremoso.",
      "Refogue cebola e alho.",
      "Acrescente o frango.",
      "Junte o creme de batata.",
      "Cozinhe por alguns minutos.",
      "Acrescente a couve no final e cozinhe rapidamente."
    ],
    "macros": {
      "kcal": 360,
      "p": 37,
      "c": 33,
      "f": 8,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-242",
    "name": "Salada de Macarrão com Frango, Rúcula e Tomate",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "peito de frango grelhado em tiras"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "rúcula"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe o macarrão e deixe esfriar.",
      "Grelhe o frango e corte em tiras.",
      "Misture o iogurte, a mostarda e o azeite.",
      "Em uma tigela, coloque o macarrão, a rúcula, o tomate e a cenoura.",
      "Acrescente o frango.",
      "Finalize com o molho e misture delicadamente."
    ],
    "macros": {
      "kcal": 430,
      "p": 38,
      "c": 44,
      "f": 12,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-243",
    "name": "Salada de Penne com Atum, Alface e Pepino",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "penne cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "alface americana"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "pepino em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Cozinhe o penne e espere esfriar.",
      "Misture com o atum.",
      "Acrescente alface, pepino, tomate e cebola.",
      "Tempere com azeite, limão, sal e pimenta.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 390,
      "p": 32,
      "c": 45,
      "f": 10,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-244",
    "name": "Salada de Massa com Carne em Tiras, Agrião e Tomate",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão parafuso cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "carne bovina magra em tiras"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "agrião"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a massa e deixe esfriar.",
      "Grelhe a carne e corte em tiras.",
      "Misture o azeite, a mostarda e o limão.",
      "Junte a massa, o agrião, o tomate, a cenoura e a cebola.",
      "Acrescente a carne.",
      "Finalize com o molho."
    ],
    "macros": {
      "kcal": 440,
      "p": 34,
      "c": 46,
      "f": 15,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-245",
    "name": "Salada de Macarrão com Salmão, Espinafre e Tomate",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "salmão grelhado em lascas"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "espinafre baby"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Dill ou cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Cozinhe a massa e deixe esfriar.",
      "Grelhe o salmão e separe em lascas.",
      "Misture a massa com o espinafre, tomate e pepino.",
      "Acrescente o salmão.",
      "Tempere com azeite, limão, sal e pimenta.",
      "Finalize com dill ou cheiro-verde."
    ],
    "macros": {
      "kcal": 455,
      "p": 30,
      "c": 39,
      "f": 20,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-246",
    "name": "Salada de Macarrão com Frango, Alface e Manga",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "frango grelhado em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "alface"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "manga em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Cozinhe o macarrão e deixe esfriar.",
      "Grelhe o frango e corte em cubos.",
      "Misture o iogurte, a mostarda e o azeite.",
      "Junte a massa, alface, manga, pepino e cebola.",
      "Acrescente o frango.",
      "Finalize com o molho e misture delicadamente."
    ],
    "macros": {
      "kcal": 420,
      "p": 37,
      "c": 45,
      "f": 11,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-247",
    "name": "Abobrinha Refogada com Alho e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "abobrinha em meia-lua"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano, salsinha, sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite e refogue a cebola e o alho.",
      "Acrescente a abobrinha.",
      "Cozinhe por poucos minutos, mexendo delicadamente.",
      "Tempere e finalize com salsinha."
    ],
    "macros": {
      "kcal": 85,
      "p": 3,
      "c": 8,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-248",
    "name": "Chuchu Refogado com Tomate e Cheiro-Verde",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "chuchu cozido em cubos"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola e o alho no azeite.",
      "Acrescente o tomate e deixe amolecer.",
      "Junte o chuchu.",
      "Misture bem e cozinhe por mais alguns minutos.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 80,
      "p": 2,
      "c": 10,
      "f": 4,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-249",
    "name": "Berinjela Refogada com Pimentão e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "140",
        "unit": "g",
        "name": "berinjela em cubos"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "pimentão"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, orégano, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola e o alho.",
      "Acrescente a berinjela e o pimentão.",
      "Cozinhe em fogo médio até começarem a amaciar.",
      "Junte o tomate.",
      "Tempere e cozinhe por mais alguns minutos."
    ],
    "macros": {
      "kcal": 110,
      "p": 3,
      "c": 15,
      "f": 5,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-250",
    "name": "Mix de Couve-Flor e Cenoura Refogados",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "couve-flor"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura em tiras finas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, cúrcuma, sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe rapidamente a couve-flor, deixando-a firme.",
      "Refogue cebola e alho no azeite.",
      "Acrescente a cenoura.",
      "Junte a couve-flor.",
      "Tempere e refogue por mais 2 a 3 minutos."
    ],
    "macros": {
      "kcal": 105,
      "p": 4,
      "c": 14,
      "f": 5,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-251",
    "name": "Repolho Refogado com Cenoura e Cebolinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "repolho fatiado fino"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha, alho, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite e refogue cebola e alho.",
      "Acrescente o repolho e a cenoura.",
      "Refogue rapidamente, mantendo os legumes levemente crocantes.",
      "Tempere.",
      "Finalize com cebolinha."
    ],
    "macros": {
      "kcal": 95,
      "p": 3,
      "c": 13,
      "f": 4,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-252",
    "name": "Abóbora Cozida com Especiarias",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "abóbora em cubos"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica doce a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cúrcuma a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Cozinhe a abóbora até ficar macia, sem desmanchar.",
      "Escorra bem.",
      "Misture com o azeite e as especiarias.",
      "Ajuste o sal.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 110,
      "p": 2,
      "c": 19,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-253",
    "name": "Vagem Refogada com Alho e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "vagem"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      }
    ],
    "steps": [
      "Cozinhe a vagem rapidamente, mantendo-a firme.",
      "Refogue cebola e alho no azeite.",
      "Acrescente a vagem.",
      "Refogue por mais 2 a 3 minutos.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 95,
      "p": 3,
      "c": 13,
      "f": 5,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-254",
    "name": "Beterraba Cozida Temperada com Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "beterraba cozida em cubos"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha ou cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a beterraba até ficar macia.",
      "Deixe amornar e corte em cubos.",
      "Tempere com azeite e limão.",
      "Ajuste sal e pimenta.",
      "Finalize com ervas."
    ],
    "macros": {
      "kcal": 105,
      "p": 2,
      "c": 16,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-255",
    "name": "Purê Cremoso de Mandioca",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "mandioca cozida"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "1 colher de chá de manteiga"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe a mandioca até ficar bem macia.",
      "Retire o fio central.",
      "Amasse ainda quente.",
      "Acrescente o leite aos poucos.",
      "Misture a manteiga.",
      "Tempere com sal e noz-moscada."
    ],
    "macros": {
      "kcal": 205,
      "p": 3,
      "c": 39,
      "f": 5,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilizar leite e manteiga zero lactose."
  },
  {
    "id": "NL-256",
    "name": "Purê de Inhame",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "inhame cozido"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe o inhame até ficar bem macio.",
      "Amasse ainda quente.",
      "Acrescente o leite aos poucos.",
      "Misture o azeite.",
      "Tempere com sal e noz-moscada."
    ],
    "macros": {
      "kcal": 180,
      "p": 3,
      "c": 34,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilizar leite zero lactose."
  },
  {
    "id": "NL-257",
    "name": "Purê Cremoso de Couve-Flor",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "couve-flor"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe a couve-flor até ficar bem macia.",
      "Escorra muito bem.",
      "Bata ou processe com o creme de ricota.",
      "Acrescente o azeite.",
      "Tempere.",
      "Leve novamente ao fogo por 2 minutos para encorpar."
    ],
    "macros": {
      "kcal": 125,
      "p": 6,
      "c": 10,
      "f": 7,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilizar creme de ricota zero lactose."
  },
  {
    "id": "NL-258",
    "name": "Acelga Refogada com Alho e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "acelga fatiada"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Aqueça o azeite.",
      "Refogue cebola e alho.",
      "Acrescente a acelga.",
      "Refogue rapidamente, apenas até começar a murchar.",
      "Ajuste os temperos."
    ],
    "macros": {
      "kcal": 80,
      "p": 3,
      "c": 8,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-259",
    "name": "Chicória Refogada com Alho",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "chicória fatiada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Lave e corte a chicória em tiras.",
      "Aqueça o azeite.",
      "Doure levemente o alho.",
      "Acrescente a chicória.",
      "Refogue rapidamente até murchar.",
      "Tempere com sal e pimenta."
    ],
    "macros": {
      "kcal": 75,
      "p": 3,
      "c": 7,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-260",
    "name": "Frango ao Limão com Alho e Salsinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "peito de frango"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de 1/2 limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      },
      {
        "quantity": "2",
        "unit": "ml",
        "name": "1 colher de café de azeite"
      }
    ],
    "steps": [
      "Tempere o frango com limão, alho, sal e pimenta.",
      "Aqueça uma frigideira antiaderente com o azeite.",
      "Grelhe dos dois lados até dourar e cozinhar completamente.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 220,
      "p": 37,
      "c": 2,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-261",
    "name": "Frango com Tomate e Manjericão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "peito de frango em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão fresco a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de café de azeite"
      }
    ],
    "steps": [
      "Doure o frango.",
      "Acrescente cebola e alho.",
      "Junte o tomate e cozinhe até começar a formar um molho.",
      "Finalize com manjericão."
    ],
    "macros": {
      "kcal": 230,
      "p": 38,
      "c": 6,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-262",
    "name": "Frango com Páprica e Cebola Roxa",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "peito de frango em tiras"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica doce ou defumada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de café de azeite"
      }
    ],
    "steps": [
      "Tempere o frango com páprica, alho, sal e pimenta.",
      "Grelhe em frigideira antiaderente.",
      "Acrescente a cebola e deixe dourar levemente."
    ],
    "macros": {
      "kcal": 225,
      "p": 37,
      "c": 5,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-263",
    "name": "Frango ao Molho de Mostarda",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "peito de frango"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "mostarda"
      },
      {
        "quantity": "20",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho e pimenta a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de café de azeite"
      }
    ],
    "steps": [
      "Grelhe o frango.",
      "Misture mostarda e água.",
      "Acrescente à frigideira.",
      "Cozinhe por mais 1 a 2 minutos até envolver o frango."
    ],
    "macros": {
      "kcal": 220,
      "p": 37,
      "c": 2,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-264",
    "name": "Frango com Abobrinha e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "110",
        "unit": "g",
        "name": "peito de frango em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim ou orégano a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de café de azeite"
      }
    ],
    "steps": [
      "Doure o frango.",
      "Acrescente cebola e abobrinha.",
      "Refogue rapidamente.",
      "Finalize com ervas."
    ],
    "macros": {
      "kcal": 215,
      "p": 34,
      "c": 5,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-265",
    "name": "Tilápia com Limão e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "filé de tilápia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de 1/2 limão"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, pimenta e ervas a gosto"
      }
    ],
    "steps": [
      "Tempere a tilápia.",
      "Aqueça o azeite em frigideira antiaderente.",
      "Grelhe dos dois lados até dourar."
    ],
    "macros": {
      "kcal": 220,
      "p": 38,
      "c": 1,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-266",
    "name": "Pescada Assada com Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "filé de pescada"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, alho, sal e orégano"
      }
    ],
    "steps": [
      "Coloque o peixe em um refratário.",
      "Cubra com tomate e cebola.",
      "Tempere e regue com azeite.",
      "Asse a 200 °C por aproximadamente 20 minutos."
    ],
    "macros": {
      "kcal": 220,
      "p": 34,
      "c": 6,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-267",
    "name": "Merluza com Alho e Cheiro-Verde",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "filé de merluza"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e pimenta"
      }
    ],
    "steps": [
      "Tempere o peixe.",
      "Grelhe com o azeite e o alho.",
      "Finalize com cheiro-verde e limão."
    ],
    "macros": {
      "kcal": 215,
      "p": 34,
      "c": 1,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-268",
    "name": "Linguado com Alcaparras e Limão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "filé de linguado"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "alcaparras"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de 1/2 limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Pimenta e salsinha a gosto"
      }
    ],
    "steps": [
      "Grelhe o linguado no azeite.",
      "Acrescente limão e alcaparras.",
      "Cozinhe por mais 1 minuto.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 200,
      "p": 32,
      "c": 1,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-269",
    "name": "Atum Fresco Grelhado com Gergelim",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "atum fresco"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "gergelim"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Tempere o atum.",
      "Passe o gergelim sobre a superfície.",
      "Grelhe rapidamente em frigideira bem quente.",
      "Sirva no ponto desejado."
    ],
    "macros": {
      "kcal": 220,
      "p": 38,
      "c": 2,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-270",
    "name": "Camarão ao Alho e Limão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "160",
        "unit": "g",
        "name": "camarão limpo"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de 1/2 limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e salsinha"
      }
    ],
    "steps": [
      "Aqueça o azeite e doure levemente o alho.",
      "Acrescente o camarão.",
      "Cozinhe rapidamente até mudar de cor.",
      "Finalize com limão e salsinha."
    ],
    "macros": {
      "kcal": 205,
      "p": 36,
      "c": 2,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-271",
    "name": "Camarão com Tomate e Páprica",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "camarão"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica, alho, sal e cheiro-verde"
      }
    ],
    "steps": [
      "Refogue cebola e alho.",
      "Acrescente o tomate.",
      "Junte os camarões e a páprica.",
      "Cozinhe rapidamente.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 210,
      "p": 34,
      "c": 6,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-272",
    "name": "Lombo Suíno com Limão e Alecrim",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "lombo suíno magro"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de 1/2 limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de café de azeite"
      }
    ],
    "steps": [
      "Tempere o lombo.",
      "Grelhe em fogo médio dos dois lados.",
      "Finalize com limão e alecrim."
    ],
    "macros": {
      "kcal": 230,
      "p": 35,
      "c": 1,
      "f": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-273",
    "name": "Filé Mignon Suíno com Mostarda e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "filé mignon suíno"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "mostarda"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Ervas secas a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta"
      }
    ],
    "steps": [
      "Tempere a carne.",
      "Grelhe em frigideira antiaderente.",
      "Acrescente a mostarda diluída em uma colher de sopa de água.",
      "Envolva a carne no molho."
    ],
    "macros": {
      "kcal": 215,
      "p": 34,
      "c": 2,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-274",
    "name": "Patinho em Tiras com Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "patinho em tiras"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      }
    ],
    "steps": [
      "Aqueça bem uma frigideira antiaderente.",
      "Doure a carne sem acrescentar óleo.",
      "Acrescente a cebola e o alho.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 220,
      "p": 30,
      "c": 4,
      "f": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-275",
    "name": "Patinho Moído com Tomate e Abobrinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, pimenta e cheiro-verde"
      }
    ],
    "steps": [
      "Doure o patinho em uma panela antiaderente.",
      "Acrescente cebola e alho.",
      "Junte abobrinha e tomate.",
      "Cozinhe até os legumes ficarem macios.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 235,
      "p": 30,
      "c": 7,
      "f": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-276",
    "name": "Rosbife de Patinho com Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "patinho em peça ou bife alto"
      }
    ],
    "steps": [
      "Tempere a carne.",
      "Sele todos os lados em frigideira antiaderente bem quente.",
      "Termine o cozimento no forno, se necessário.",
      "Deixe descansar por alguns minutos.",
      "Corte em fatias finas."
    ],
    "macros": {
      "kcal": 215,
      "p": 30,
      "c": 0,
      "f": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-277",
    "name": "Omelete de Claras com Atum",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "4 claras de ovo"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Bata ligeiramente as claras.",
      "Coloque em frigideira antiaderente.",
      "Acrescente o atum e o tomate.",
      "Dobre a omelete.",
      "Finalize com cebolinha."
    ],
    "macros": {
      "kcal": 175,
      "p": 34,
      "c": 4,
      "f": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-278",
    "name": "Omelete de Claras com Frango e Espinafre",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "4 claras"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue rapidamente o espinafre em frigideira antiaderente.",
      "Acrescente as claras.",
      "Distribua o frango e o tomate.",
      "Cozinhe em fogo baixo.",
      "Dobre e sirva."
    ],
    "macros": {
      "kcal": 190,
      "p": 35,
      "c": 5,
      "f": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-279",
    "name": "Bacalhau Desfiado com Tomate e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "130",
        "unit": "g",
        "name": "bacalhau dessalgado e desfiado"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente o bacalhau.",
      "Junte o tomate.",
      "Cozinhe por alguns minutos.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 225,
      "p": 34,
      "c": 5,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-280",
    "name": "Salada Caprese com Manjericão",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "tomate em rodelas"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "muçarela de búfala"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas de manjericão a gosto"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Intercale as rodelas de tomate e a muçarela.",
      "Distribua as folhas de manjericão.",
      "Regue com azeite.",
      "Tempere com sal e pimenta.",
      "Sirva fria."
    ],
    "macros": {
      "kcal": 220,
      "p": 12,
      "c": 7,
      "f": 16,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-281",
    "name": "Salada de Palmito, Tomate e Pepino",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "palmito em rodelas"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Corte os vegetais.",
      "Misture com o palmito.",
      "Tempere com azeite e limão.",
      "Finalize com cheiro-verde.",
      "Mantenha refrigerada até servir."
    ],
    "macros": {
      "kcal": 115,
      "p": 3,
      "c": 13,
      "f": 6,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-282",
    "name": "Salada de Alface, Abacate e Tomate-Cereja",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "alface"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "abacate"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Distribua as folhas em uma tigela.",
      "Acrescente tomate e pepino.",
      "Corte o abacate em cubos e adicione por último.",
      "Tempere com limão, sal e pimenta."
    ],
    "macros": {
      "kcal": 150,
      "p": 3,
      "c": 14,
      "f": 11,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-283",
    "name": "Salada de Rabanete, Pepino e Folhas Verdes",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "alface"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "rúcula"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "rabanete em rodelas finas"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Higienize e seque as folhas.",
      "Acrescente o rabanete e o pepino.",
      "Tempere com azeite e limão.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 90,
      "p": 3,
      "c": 9,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-284",
    "name": "Salada de Grão-de-Bico com Pepino e Salsa",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "grão-de-bico cozido e frio"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Misture o grão-de-bico com os vegetais.",
      "Acrescente a salsinha.",
      "Tempere com azeite e limão.",
      "Leve à geladeira até servir."
    ],
    "macros": {
      "kcal": 225,
      "p": 9,
      "c": 34,
      "f": 7,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-285",
    "name": "Salada de Folhas com Figo e Nozes",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "folhas verdes variadas"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "2 figos frescos pequenos"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "nozes picadas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de vinagre balsâmico"
      }
    ],
    "steps": [
      "Disponha as folhas no prato.",
      "Corte os figos em quatro partes.",
      "Acrescente o queijo e as nozes.",
      "Regue com azeite e balsâmico."
    ],
    "macros": {
      "kcal": 225,
      "p": 7,
      "c": 22,
      "f": 14,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-286",
    "name": "Salada de Couve Crua com Abacaxi e Cenoura",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "couve fatiada bem fina"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "abacaxi em cubos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão e sal a gosto"
      }
    ],
    "steps": [
      "Massageie rapidamente a couve com algumas gotas de limão.",
      "Acrescente cenoura e abacaxi.",
      "Regue com azeite.",
      "Ajuste o sal e misture."
    ],
    "macros": {
      "kcal": 135,
      "p": 3,
      "c": 23,
      "f": 5,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-287",
    "name": "Salada de Alface com Palmito, Azeitona e Tomate-Cereja",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Sem glúten",
      "Sem lactose",
      "Vegana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "alface"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "palmito"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "azeitonas fatiadas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Vinagre, sal e orégano a gosto"
      }
    ],
    "steps": [
      "Distribua as folhas.",
      "Acrescente palmito, tomate, azeitona e cebola.",
      "Tempere com azeite e vinagre.",
      "Finalize com orégano."
    ],
    "macros": {
      "kcal": 125,
      "p": 3,
      "c": 10,
      "f": 9,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-288",
    "name": "Salada de Quinoa com Tomate, Pepino e Hortelã",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "quinoa cozida e fria"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã e salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Deixe a quinoa esfriar completamente.",
      "Misture com tomate, pepino e cebola.",
      "Acrescente as ervas.",
      "Tempere com azeite e limão."
    ],
    "macros": {
      "kcal": 200,
      "p": 6,
      "c": 29,
      "f": 7,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-289",
    "name": "Salada de Agrião com Laranja e Amêndoas",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "agrião"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "laranja em gomos"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "amêndoas em lascas"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Disponha o agrião no prato.",
      "Acrescente os gomos de laranja.",
      "Junte cebola e amêndoas.",
      "Regue com azeite.",
      "Tempere e sirva fria."
    ],
    "macros": {
      "kcal": 170,
      "p": 5,
      "c": 19,
      "f": 10,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-290",
    "name": "Salada de Alface, Uva e Castanha-do-Pará",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "alface"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "uvas cortadas ao meio"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "castanha-do-pará picada"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão e sal a gosto"
      }
    ],
    "steps": [
      "Disponha as folhas.",
      "Acrescente uva e pepino.",
      "Finalize com castanhas.",
      "Tempere com azeite e limão."
    ],
    "macros": {
      "kcal": 170,
      "p": 3,
      "c": 19,
      "f": 10,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-291",
    "name": "Salada de Repolho Roxo com Abacaxi e Hortelã",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "repolho roxo fatiado fino"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "abacaxi em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão e sal a gosto"
      }
    ],
    "steps": [
      "Fatie o repolho bem fino.",
      "Acrescente o abacaxi e a cebola.",
      "Tempere com azeite e limão.",
      "Finalize com hortelã.",
      "Sirva gelada."
    ],
    "macros": {
      "kcal": 130,
      "p": 2,
      "c": 21,
      "f": 5,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-292",
    "name": "Salada de Endívia com Maçã Verde e Nozes",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "endívia"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "maçã verde"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "nozes"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Corte a maçã em fatias finas.",
      "Misture com a endívia e o pepino.",
      "Acrescente as nozes.",
      "Tempere com azeite e limão."
    ],
    "macros": {
      "kcal": 185,
      "p": 3,
      "c": 24,
      "f": 10,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-293",
    "name": "Salada de Rúcula com Pêssego e Queijo Minas",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "rúcula"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "pêssego em fatias"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "queijo minas em cubos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "sementes de girassol"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Vinagre balsâmico a gosto"
      }
    ],
    "steps": [
      "Coloque a rúcula no prato.",
      "Acrescente o pêssego e o queijo.",
      "Finalize com as sementes.",
      "Regue com azeite e balsâmico."
    ],
    "macros": {
      "kcal": 220,
      "p": 10,
      "c": 18,
      "f": 13,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-294",
    "name": "Salada de Pepino, Abacate e Tomate com Coentro",
    "tipo": "salada",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "pepino"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "abacate"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola roxa"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Coentro ou cheiro-verde a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Corte pepino, tomate e abacate em cubos.",
      "Acrescente a cebola.",
      "Tempere com limão, sal e pimenta.",
      "Finalize com coentro ou cheiro-verde.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 145,
      "p": 3,
      "c": 15,
      "f": 10,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-295",
    "name": "Molho Cremoso de Limão e Ricota",
    "tipo": "molho",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 2,
    "ingredients": [
      {
        "quantity": "40",
        "unit": "g",
        "name": "ricota"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Amasse bem a ricota.",
      "Misture com a água e o limão.",
      "Acrescente o azeite.",
      "Tempere e misture até formar um molho cremoso."
    ],
    "macros": {
      "kcal": 45,
      "p": 2,
      "c": 1,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-296",
    "name": "Vitamina Proteica de Banana com Canela",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "1 banana pequena"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Coloque todos os ingredientes no liquidificador.",
      "Bata até ficar homogêneo e cremoso.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 280,
      "p": 31,
      "c": 35,
      "f": 3,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilize leite e whey zero lactose."
  },
  {
    "id": "NL-297",
    "name": "Vitamina Proteica de Mamão com Aveia",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "mamão"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "aveia em flocos"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata o mamão com o leite e o whey.",
      "Acrescente a aveia.",
      "Bata novamente até ficar cremoso.",
      "Finalize com canela."
    ],
    "macros": {
      "kcal": 300,
      "p": 32,
      "c": 36,
      "f": 4,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-298",
    "name": "Vitamina de Manga com Whey e Iogurte",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "manga"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "80",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Coloque todos os ingredientes no liquidificador.",
      "Bata até obter uma vitamina espessa e cremosa.",
      "Sirva gelada."
    ],
    "macros": {
      "kcal": 265,
      "p": 30,
      "c": 30,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Use iogurte e whey zero lactose para versão sem lactose."
  },
  {
    "id": "NL-299",
    "name": "Vitamina Proteica de Abacaxi com Coco",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "abacaxi"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein zero lactose sabor baunilha"
      },
      {
        "quantity": "180",
        "unit": "ml",
        "name": "leite desnatado zero lactose"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "coco ralado sem açúcar"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata o abacaxi com o leite e o whey.",
      "Acrescente o coco ralado.",
      "Bata rapidamente.",
      "Sirva bem gelada."
    ],
    "macros": {
      "kcal": 285,
      "p": 30,
      "c": 29,
      "f": 7,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-300",
    "name": "Vitamina de Maçã com Canela e Whey",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "4min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 maçã pequena com casca"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Corte a maçã em pedaços e retire as sementes.",
      "Bata com o leite e o whey.",
      "Acrescente canela e gelo.",
      "Bata até ficar homogêneo."
    ],
    "macros": {
      "kcal": 270,
      "p": 30,
      "c": 33,
      "f": 3,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-301",
    "name": "Vitamina Proteica de Cacau com Banana",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "banana"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor chocolate"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "cacau em pó 100%"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Coloque todos os ingredientes no liquidificador.",
      "Bata até ficar bem cremoso.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 285,
      "p": 32,
      "c": 32,
      "f": 4,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-302",
    "name": "Vitamina de Pêssego com Whey e Iogurte",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "pêssego fresco"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "80",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata o pêssego com o iogurte.",
      "Acrescente o whey e a água.",
      "Bata novamente.",
      "Sirva gelado."
    ],
    "macros": {
      "kcal": 245,
      "p": 30,
      "c": 25,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-303",
    "name": "Vitamina Proteica de Maracujá",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "polpa de maracujá"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein zero lactose sabor baunilha"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado zero lactose"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante a gosto, opcional"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata rapidamente a polpa de maracujá com o leite.",
      "Acrescente o whey.",
      "Bata novamente até ficar cremoso.",
      "Se desejar uma bebida sem sementes, coe a polpa antes de bater com os demais ingredientes."
    ],
    "macros": {
      "kcal": 245,
      "p": 30,
      "c": 24,
      "f": 3,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-304",
    "name": "Vitamina de Uva com Whey e Iogurte",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "uvas sem sementes"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "80",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata as uvas com o iogurte e a água.",
      "Acrescente o whey.",
      "Bata até ficar homogêneo.",
      "Sirva bem gelado."
    ],
    "macros": {
      "kcal": 280,
      "p": 29,
      "c": 34,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-305",
    "name": "Vitamina Proteica de Pera com Canela",
    "tipo": "bebida",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "3min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "1 pera pequena com casca"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Corte a pera e retire apenas as sementes.",
      "Bata com o leite e o whey.",
      "Acrescente canela e gelo.",
      "Bata até ficar bem cremoso."
    ],
    "macros": {
      "kcal": 275,
      "p": 30,
      "c": 35,
      "f": 3,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-306",
    "name": "Mingau Proteico de Morango com Whey",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "aveia em flocos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "morangos picados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Aqueça o leite com a aveia em fogo baixo.",
      "Mexa até engrossar.",
      "Desligue o fogo e espere cerca de 1 minuto.",
      "Acrescente o whey e misture bem.",
      "Finalize com os morangos."
    ],
    "macros": {
      "kcal": 335,
      "p": 32,
      "c": 42,
      "f": 5,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-307",
    "name": "Mingau de Paçoca com Whey",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "pasta de amendoim"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "amendoim torrado sem sal, picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Cozinhe o leite com a aveia até engrossar.",
      "Retire do fogo.",
      "Misture o whey e a pasta de amendoim.",
      "Finalize com o amendoim picado e canela."
    ],
    "macros": {
      "kcal": 350,
      "p": 34,
      "c": 32,
      "f": 11,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-308",
    "name": "Mingau de Pera com Aveia e Chia",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "aveia em flocos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "pera com casca em cubos"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "chia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Coloque o leite, a aveia e metade da pera em uma panela.",
      "Cozinhe em fogo baixo até engrossar.",
      "Acrescente a chia e misture.",
      "Finalize com o restante da pera e canela."
    ],
    "macros": {
      "kcal": 280,
      "p": 10,
      "c": 45,
      "f": 8,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-309",
    "name": "Mingau Proteico de Coco com Whey",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia sem glúten"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "coco seco ralado sem açúcar"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Cozinhe o leite com a aveia.",
      "Quando atingir consistência cremosa, desligue o fogo.",
      "Misture o whey.",
      "Finalize com coco ralado e canela."
    ],
    "macros": {
      "kcal": 330,
      "p": 32,
      "c": 30,
      "f": 10,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-310",
    "name": "Mingau de Milho com Canela",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "12min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "fubá fino"
      },
      {
        "quantity": "100",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "leite em pó"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante culinário a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela em pó a gosto"
      }
    ],
    "steps": [
      "Dissolva o fubá na água fria.",
      "Acrescente o leite.",
      "Leve ao fogo baixo, mexendo sempre.",
      "Quando engrossar, misture o leite em pó e o adoçante.",
      "Finalize com canela."
    ],
    "macros": {
      "kcal": 230,
      "p": 9,
      "c": 39,
      "f": 4,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-311",
    "name": "Mingau de Aveia com Abacaxi e Canela",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "abacaxi em cubos"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Cozinhe o abacaxi por 2 a 3 minutos em uma panela.",
      "Acrescente o leite e a aveia.",
      "Cozinhe em fogo baixo até engrossar.",
      "Finalize com canela."
    ],
    "macros": {
      "kcal": 255,
      "p": 9,
      "c": 45,
      "f": 5,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-312",
    "name": "Mingau Proteico de Doce de Leite",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor baunilha"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "doce de leite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Cozinhe o leite com a aveia.",
      "Retire do fogo quando estiver cremoso.",
      "Misture o whey.",
      "Finalize com o doce de leite e uma pitada de canela."
    ],
    "macros": {
      "kcal": 335,
      "p": 32,
      "c": 39,
      "f": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-313",
    "name": "Mingau de Ameixa com Chia",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "3 ameixas secas picadas"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "chia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Coloque o leite, a aveia e as ameixas na panela.",
      "Cozinhe em fogo baixo, mexendo.",
      "Quando engrossar, acrescente a chia.",
      "Finalize com canela."
    ],
    "macros": {
      "kcal": 300,
      "p": 10,
      "c": 46,
      "f": 8,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-314",
    "name": "Mingau Proteico de Chocolate com Pasta de Amendoim",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein sabor chocolate"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "cacau em pó"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "pasta de amendoim"
      }
    ],
    "steps": [
      "Cozinhe o leite com a aveia e o cacau.",
      "Quando engrossar, desligue o fogo.",
      "Acrescente o whey e misture.",
      "Finalize com a pasta de amendoim."
    ],
    "macros": {
      "kcal": 355,
      "p": 34,
      "c": 32,
      "f": 11,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-315",
    "name": "Mingau de Aveia com Uva-Passa e Castanhas",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "8min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "uva-passa"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "castanhas picadas"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Cozinhe o leite com a aveia em fogo baixo.",
      "Acrescente a uva-passa e continue mexendo.",
      "Quando estiver cremoso, desligue o fogo.",
      "Finalize com castanhas e canela."
    ],
    "macros": {
      "kcal": 300,
      "p": 10,
      "c": 40,
      "f": 11,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-316",
    "name": "Batata Rústica com Páprica e Alecrim",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata com casca em gomos"
      },
      {
        "quantity": "5",
        "unit": "ml",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica doce ou defumada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim, sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Corte a batata em gomos.",
      "Misture com azeite e temperos.",
      "Distribua na airfryer ou assadeira sem sobrepor.",
      "Asse a 200 °C por aproximadamente 20 a 25 minutos, virando na metade do tempo."
    ],
    "macros": {
      "kcal": 165,
      "p": 3,
      "c": 30,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-317",
    "name": "Batata-Doce Assada com Canela e Páprica",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata-doce em cubos"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica, canela, sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Misture a batata com os temperos e o azeite.",
      "Leve à airfryer ou forno a 200 °C.",
      "Asse por aproximadamente 20 minutos ou até dourar."
    ],
    "macros": {
      "kcal": 180,
      "p": 2,
      "c": 33,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-318",
    "name": "Batata Bolinha com Alho e Salsinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata bolinha"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Cozinhe as batatas até ficarem macias.",
      "Corte ao meio.",
      "Doure rapidamente no azeite com alho.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 165,
      "p": 3,
      "c": 29,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-319",
    "name": "Polenta Cremosa com Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "30",
        "unit": "g",
        "name": "fubá"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "parmesão ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e ervas a gosto"
      }
    ],
    "steps": [
      "Dissolva o fubá em parte da água fria.",
      "Leve ao fogo com o restante da água.",
      "Mexa até engrossar.",
      "Acrescente parmesão e azeite.",
      "Finalize com ervas."
    ],
    "macros": {
      "kcal": 175,
      "p": 5,
      "c": 24,
      "f": 7,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-320",
    "name": "Cuscuz Temperado com Tomate e Cheiro-Verde",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "flocão de milho"
      },
      {
        "quantity": "60",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e sal a gosto"
      }
    ],
    "steps": [
      "Hidrate o flocão e deixe descansar por 5 minutos.",
      "Cozinhe na cuscuzeira.",
      "Refogue rapidamente cebola e tomate.",
      "Misture ao cuscuz.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 215,
      "p": 4,
      "c": 37,
      "f": 6,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-321",
    "name": "Quinoa com Cenoura e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "quinoa cozida"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha e cebolinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Misture a quinoa já cozida com a cenoura e o tomate.",
      "Acrescente o azeite.",
      "Tempere.",
      "Finalize com bastante cheiro-verde."
    ],
    "macros": {
      "kcal": 190,
      "p": 5,
      "c": 27,
      "f": 7,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-322",
    "name": "Quinoa com Abobrinha e Limão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "quinoa cozida"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "abobrinha em cubinhos"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue rapidamente a abobrinha no azeite.",
      "Acrescente a quinoa.",
      "Misture por 1 a 2 minutos.",
      "Desligue o fogo e finalize com limão e salsinha."
    ],
    "macros": {
      "kcal": 180,
      "p": 5,
      "c": 25,
      "f": 7,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-323",
    "name": "Farofa Leve de Cenoura e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "25",
        "unit": "g",
        "name": "farinha de mandioca"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura ralada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente a cenoura.",
      "Junte a farinha aos poucos.",
      "Misture em fogo baixo até ficar levemente crocante.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 160,
      "p": 2,
      "c": 27,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-324",
    "name": "Farofa de Couve com Alho",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "25",
        "unit": "g",
        "name": "farinha de mandioca"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "couve fatiada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Doure levemente o alho no azeite.",
      "Acrescente a couve.",
      "Junte a farinha de mandioca.",
      "Misture por alguns minutos e tempere."
    ],
    "macros": {
      "kcal": 155,
      "p": 3,
      "c": 25,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-325",
    "name": "Farofa de Banana com Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "25",
        "unit": "g",
        "name": "farinha de mandioca"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "banana em cubos"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Doure a cebola no azeite.",
      "Acrescente a banana e mexa delicadamente.",
      "Junte a farinha.",
      "Misture rapidamente.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 210,
      "p": 2,
      "c": 39,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-326",
    "name": "Grão-de-Bico Crocante com Páprica",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "grão-de-bico cozido"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica, cúrcuma, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Seque bem o grão-de-bico.",
      "Misture com o azeite e os temperos.",
      "Leve à airfryer a 190 °C por aproximadamente 15 minutos.",
      "Mexa na metade do tempo."
    ],
    "macros": {
      "kcal": 210,
      "p": 9,
      "c": 28,
      "f": 7,
      "fiber": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-327",
    "name": "Lentilha Temperada com Tomate e Cebola",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "lentilha cozida"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola e o tomate rapidamente.",
      "Acrescente a lentilha.",
      "Misture delicadamente.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 195,
      "p": 10,
      "c": 29,
      "f": 5,
      "fiber": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-328",
    "name": "Ervilha Fresca Refogada com Cebola e Hortelã",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "ervilha"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente a ervilha.",
      "Cozinhe por alguns minutos.",
      "Finalize com hortelã, sal e pimenta."
    ],
    "macros": {
      "kcal": 150,
      "p": 7,
      "c": 20,
      "f": 5,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-329",
    "name": "Palmito Assado com Tomate e Orégano",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "palmito em rodelas"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Distribua o palmito e o tomate em um refratário.",
      "Regue com azeite.",
      "Tempere com orégano, sal e pimenta.",
      "Leve ao forno por aproximadamente 15 minutos."
    ],
    "macros": {
      "kcal": 115,
      "p": 4,
      "c": 12,
      "f": 6,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-330",
    "name": "Tomates Assados com Alho e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "tomates"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano e manjericão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Corte os tomates.",
      "Disponha em uma assadeira.",
      "Acrescente alho, azeite e temperos.",
      "Asse a 200 °C por aproximadamente 20 minutos."
    ],
    "macros": {
      "kcal": 95,
      "p": 2,
      "c": 10,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-331",
    "name": "Mini Pimentões Assados Recheados com Ricota",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "pimentões"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "ricota"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate picado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano e salsinha a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Corte os pimentões ao meio e retire as sementes.",
      "Misture ricota, tomate e ervas.",
      "Recheie os pimentões.",
      "Asse a 200 °C por aproximadamente 20 minutos."
    ],
    "macros": {
      "kcal": 170,
      "p": 10,
      "c": 14,
      "f": 9,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilize ricota zero lactose."
  },
  {
    "id": "NL-332",
    "name": "Cogumelos Salteados com Alho e Salsinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "cogumelos frescos fatiados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Aqueça bem a frigideira.",
      "Acrescente o azeite e os cogumelos.",
      "Deixe dourar antes de mexer.",
      "Acrescente o alho.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 110,
      "p": 6,
      "c": 9,
      "f": 6,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-333",
    "name": "Milho Refogado com Tomate e Cebolinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "milho cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola no azeite.",
      "Acrescente o milho.",
      "Junte o tomate e cozinhe rapidamente.",
      "Finalize com cebolinha."
    ],
    "macros": {
      "kcal": 175,
      "p": 4,
      "c": 27,
      "f": 6,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-334",
    "name": "Cebolas Assadas com Balsâmico e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "cebola em gomos"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de sopa de vinagre balsâmico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim ou tomilho a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Coloque as cebolas em um refratário.",
      "Acrescente azeite e balsâmico.",
      "Tempere com ervas.",
      "Asse a 200 °C por aproximadamente 25 minutos."
    ],
    "macros": {
      "kcal": 120,
      "p": 2,
      "c": 18,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-335",
    "name": "Legumes Assados com Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "berinjela"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "pimentão"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alecrim, orégano, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Corte os vegetais em pedaços semelhantes.",
      "Misture com azeite e ervas.",
      "Distribua em uma assadeira.",
      "Asse a 200 °C por 25 a 30 minutos, mexendo na metade do tempo."
    ],
    "macros": {
      "kcal": 160,
      "p": 4,
      "c": 23,
      "f": 6,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-336",
    "name": "Refresco de Melancia com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "melancia"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "5 folhas de hortelã"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Coloque a melancia e a água no liquidificador.",
      "Bata até ficar homogêneo.",
      "Acrescente a hortelã e bata rapidamente.",
      "Adicione gelo e sirva imediatamente."
    ],
    "macros": {
      "kcal": 50,
      "p": 1,
      "c": 12,
      "f": 0,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-337",
    "name": "Refresco de Morango com Água de Coco",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "morangos"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água de coco"
      },
      {
        "quantity": "50",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Higienize os morangos.",
      "Bata com a água de coco e a água.",
      "Acrescente gelo.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 65,
      "p": 1,
      "c": 15,
      "f": 0,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-338",
    "name": "Refresco de Manga com Maracujá",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "manga"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "polpa de maracujá"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata a manga com a água.",
      "Acrescente a polpa de maracujá.",
      "Bata rapidamente.",
      "Adicione gelo e sirva."
    ],
    "macros": {
      "kcal": 70,
      "p": 1,
      "c": 16,
      "f": 0,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-339",
    "name": "Refresco de Acerola com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "acerola"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "5 folhas de hortelã"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata a acerola com a água.",
      "Coe, se desejar.",
      "Acrescente a hortelã e bata rapidamente.",
      "Sirva com gelo."
    ],
    "macros": {
      "kcal": 35,
      "p": 1,
      "c": 8,
      "f": 0,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-340",
    "name": "Refresco de Goiaba com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "goiaba"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata a goiaba com a água.",
      "Coe, se desejar.",
      "Acrescente a hortelã.",
      "Sirva bem gelado."
    ],
    "macros": {
      "kcal": 70,
      "p": 2,
      "c": 14,
      "f": 1,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-341",
    "name": "Refresco de Pêssego com Chá de Camomila",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "pêssego"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "chá de camomila preparado e frio"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Prepare o chá de camomila e espere esfriar completamente.",
      "Bata o chá com o pêssego.",
      "Acrescente gelo.",
      "Sirva imediatamente."
    ],
    "macros": {
      "kcal": 40,
      "p": 1,
      "c": 10,
      "f": 0,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-342",
    "name": "Refresco de Maçã com Canela",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "maçã com casca"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Corte a maçã e retire as sementes.",
      "Bata com a água gelada.",
      "Acrescente a canela.",
      "Sirva imediatamente com gelo."
    ],
    "macros": {
      "kcal": 55,
      "p": 0.5,
      "c": 14,
      "f": 0,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-343",
    "name": "Refresco de Abacaxi com Gengibre",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "abacaxi"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequena lasca de gengibre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata o abacaxi com a água.",
      "Acrescente o gengibre.",
      "Bata novamente por alguns segundos.",
      "Sirva com gelo."
    ],
    "macros": {
      "kcal": 50,
      "p": 0.5,
      "c": 13,
      "f": 0,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-344",
    "name": "Refresco de Kiwi com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "1 kiwi médio"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Descasque o kiwi.",
      "Bata com a água.",
      "Acrescente a hortelã e bata rapidamente.",
      "Sirva com gelo."
    ],
    "macros": {
      "kcal": 50,
      "p": 1,
      "c": 12,
      "f": 0.5,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-345",
    "name": "Refresco de Melão com Gengibre",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "melão"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequena lasca de gengibre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata o melão com a água.",
      "Acrescente o gengibre.",
      "Bata rapidamente.",
      "Sirva com bastante gelo."
    ],
    "macros": {
      "kcal": 50,
      "p": 1,
      "c": 12,
      "f": 0,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-346",
    "name": "Refresco de Morango com Manjericão",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "morangos"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 folhas de manjericão fresco"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata os morangos com a água.",
      "Acrescente o manjericão.",
      "Bata rapidamente apenas para incorporar.",
      "Sirva gelado."
    ],
    "macros": {
      "kcal": 35,
      "p": 1,
      "c": 8,
      "f": 0,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-347",
    "name": "Refresco de Pera com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "pera com casca"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Corte a pera e retire as sementes.",
      "Bata com a água.",
      "Acrescente a hortelã e bata rapidamente.",
      "Sirva com gelo."
    ],
    "macros": {
      "kcal": 60,
      "p": 0.5,
      "c": 15,
      "f": 0,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-348",
    "name": "Refresco de Melancia com Gengibre",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "melancia"
      },
      {
        "quantity": "200",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequena lasca de gengibre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata a melancia com a água.",
      "Acrescente o gengibre.",
      "Bata por mais alguns segundos.",
      "Sirva bem gelado."
    ],
    "macros": {
      "kcal": 50,
      "p": 1,
      "c": 12,
      "f": 0,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-349",
    "name": "Refresco de Caju com Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "caju"
      },
      {
        "quantity": "250",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Bata o caju com a água.",
      "Coe, se desejar.",
      "Acrescente a hortelã.",
      "Sirva bem gelado."
    ],
    "macros": {
      "kcal": 45,
      "p": 1,
      "c": 10,
      "f": 0,
      "fiber": 2
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-350",
    "name": "Refresco de Laranja com Gengibre e Canela",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "ml",
        "name": "suco de laranja natural"
      },
      {
        "quantity": "150",
        "unit": "ml",
        "name": "água gelada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 pequena lasca de gengibre"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Misture o suco de laranja com a água.",
      "Acrescente o gengibre.",
      "Finalize com uma pequena pitada de canela.",
      "Adicione gelo e sirva."
    ],
    "macros": {
      "kcal": 50,
      "p": 1,
      "c": 11,
      "f": 0,
      "fiber": 0.5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-351",
    "name": "Água Saborizada de Morango e Hortelã",
    "tipo": "bebida",
    "meals": [
      "snack"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 litro de água"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "morangos fatiados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "10 folhas de hortelã"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gelo a gosto"
      }
    ],
    "steps": [
      "Coloque os morangos e a hortelã em uma jarra.",
      "Acrescente a água.",
      "Leve à geladeira por pelo menos 1 hora.",
      "Acrescente gelo antes de servir."
    ],
    "macros": {
      "kcal": 0,
      "p": 0,
      "c": 0,
      "f": 0,
      "fiber": 0
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-352",
    "name": "Gelatina Cremosa de Morango com Iogurte",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 pacote de gelatina zero sabor morango"
      },
      {
        "quantity": "100",
        "unit": "ml",
        "name": "água quente"
      },
      {
        "quantity": "100",
        "unit": "ml",
        "name": "água fria"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "iogurte natural desnatado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "morangos picados"
      }
    ],
    "steps": [
      "Dissolva a gelatina na água quente.",
      "Acrescente a água fria.",
      "Leve à geladeira até começar a firmar.",
      "Bata a gelatina com o iogurte até formar um creme.",
      "Coloque em uma taça.",
      "Finalize com os morangos e leve novamente à geladeira."
    ],
    "macros": {
      "kcal": 100,
      "p": 6,
      "c": 15,
      "f": 1,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilizar iogurte zero lactose."
  },
  {
    "id": "NL-353",
    "name": "Gelatina Batida de Maracujá com Iogurte",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 pacote de gelatina zero sabor maracujá"
      },
      {
        "quantity": "100",
        "unit": "ml",
        "name": "água quente"
      },
      {
        "quantity": "100",
        "unit": "ml",
        "name": "água fria"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "iogurte natural desnatado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "polpa de maracujá"
      }
    ],
    "steps": [
      "Dissolva a gelatina na água quente.",
      "Acrescente a água fria.",
      "Leve à geladeira até ficar parcialmente firme.",
      "Bata com o iogurte.",
      "Coloque em uma taça.",
      "Finalize com a polpa de maracujá."
    ],
    "macros": {
      "kcal": 95,
      "p": 6,
      "c": 14,
      "f": 1,
      "fiber": 1
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-354",
    "name": "Overnight Oats de Banana e Canela",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia em flocos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "iogurte natural desnatado"
      },
      {
        "quantity": "50",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "banana em rodelas"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "chia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Misture a aveia, o iogurte, o leite e a chia.",
      "Coloque em um pote com tampa.",
      "Acrescente a banana.",
      "Finalize com canela.",
      "Leve à geladeira de um dia para o outro."
    ],
    "macros": {
      "kcal": 235,
      "p": 10,
      "c": 39,
      "f": 5,
      "fiber": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-355",
    "name": "Overnight Oats de Cacau e Morango",
    "tipo": "mingau",
    "meals": [
      "breakfast",
      "snack"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "25",
        "unit": "g",
        "name": "aveia"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "iogurte natural desnatado"
      },
      {
        "quantity": "50",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "morangos"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "cacau em pó"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "chia"
      }
    ],
    "steps": [
      "Misture a aveia, o iogurte, o leite, o cacau e a chia.",
      "Acrescente metade dos morangos picados.",
      "Tampe e deixe na geladeira durante a noite.",
      "Finalize com o restante dos morangos antes de servir."
    ],
    "macros": {
      "kcal": 210,
      "p": 11,
      "c": 30,
      "f": 6,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-356",
    "name": "Pudim de Chia com Morango",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "15",
        "unit": "g",
        "name": "chia"
      },
      {
        "quantity": "120",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "morangos picados"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de essência de baunilha"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante a gosto, opcional"
      }
    ],
    "steps": [
      "Misture a chia com o leite e a baunilha.",
      "Aguarde 5 minutos e mexa novamente.",
      "Leve à geladeira por pelo menos 2 horas.",
      "Finalize com os morangos."
    ],
    "macros": {
      "kcal": 150,
      "p": 6,
      "c": 18,
      "f": 6,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-357",
    "name": "Pudim de Chia com Manga e Coco",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "15",
        "unit": "g",
        "name": "chia"
      },
      {
        "quantity": "120",
        "unit": "ml",
        "name": "bebida vegetal sem açúcar"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "manga em cubos"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "coco seco ralado sem açúcar"
      }
    ],
    "steps": [
      "Misture a chia com a bebida vegetal.",
      "Aguarde 5 minutos e mexa novamente.",
      "Leve à geladeira por pelo menos 2 horas.",
      "Finalize com a manga e o coco ralado."
    ],
    "macros": {
      "kcal": 175,
      "p": 4,
      "c": 22,
      "f": 8,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-358",
    "name": "Pudim Fit de Caneca de Chocolate",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "100",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "leite em pó desnatado"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "cacau em pó 100%"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante culinário a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de essência de baunilha"
      }
    ],
    "steps": [
      "Bata o ovo com um garfo.",
      "Acrescente o leite, o leite em pó, o cacau, o adoçante e a baunilha.",
      "Misture bem até ficar homogêneo.",
      "Coloque em uma caneca ou ramequim próprio para micro-ondas.",
      "Leve ao micro-ondas em intervalos curtos até firmar, totalizando aproximadamente 2 a 3 minutos.",
      "Espere amornar antes de servir."
    ],
    "macros": {
      "kcal": 170,
      "p": 13,
      "c": 11,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-359",
    "name": "Salada de Frutas Vermelhas com Iogurte",
    "tipo": "salada",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em fibras",
      "Sem glúten",
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "morango"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "uva"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "maçã com casca"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "iogurte natural desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      }
    ],
    "steps": [
      "Higienize e corte as frutas.",
      "Misture delicadamente.",
      "Acrescente o iogurte.",
      "Finalize com hortelã.",
      "Sirva bem gelada."
    ],
    "macros": {
      "kcal": 155,
      "p": 5,
      "c": 30,
      "f": 2,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-360",
    "name": "Salada Tropical de Frutas com Maracujá",
    "tipo": "salada",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "7min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "mamão"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "melão"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "manga"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "abacaxi"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "polpa de maracujá"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã a gosto"
      }
    ],
    "steps": [
      "Corte todas as frutas em cubos pequenos.",
      "Misture delicadamente.",
      "Acrescente a polpa de maracujá.",
      "Finalize com hortelã.",
      "Mantenha refrigerada até servir."
    ],
    "macros": {
      "kcal": 160,
      "p": 2,
      "c": 39,
      "f": 1,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-361",
    "name": "Macarrão ao Molho de Tomate com Abobrinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "15min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "abobrinha em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, manjericão, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola e o alho no azeite.",
      "Acrescente a abobrinha e cozinhe rapidamente.",
      "Junte o molho de tomate.",
      "Acrescente o macarrão e misture.",
      "Finalize com manjericão."
    ],
    "macros": {
      "kcal": 285,
      "p": 8,
      "c": 48,
      "f": 7,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-362",
    "name": "Macarrão com Frango, Tomate e Espinafre",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      }
    ],
    "steps": [
      "Refogue a cebola.",
      "Acrescente o frango.",
      "Junte tomate e espinafre.",
      "Acrescente o macarrão.",
      "Misture e ajuste os temperos."
    ],
    "macros": {
      "kcal": 325,
      "p": 32,
      "c": 33,
      "f": 8,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-363",
    "name": "Macarrão Cremoso com Cottage e Brócolis",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "brócolis"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, pimenta e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe o brócolis deixando-o firme.",
      "Misture o cottage com o leite.",
      "Aqueça em fogo baixo.",
      "Acrescente o brócolis e o macarrão.",
      "Tempere e misture até ficar cremoso."
    ],
    "macros": {
      "kcal": 290,
      "p": 18,
      "c": 39,
      "f": 7,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-364",
    "name": "Macarrão com Atum e Molho de Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cheiro-verde e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue a cebola.",
      "Acrescente o molho de tomate.",
      "Junte o atum.",
      "Misture o macarrão.",
      "Finalize com cheiro-verde."
    ],
    "macros": {
      "kcal": 300,
      "p": 29,
      "c": 36,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-365",
    "name": "Macarrão com Berinjela, Tomate e Manjericão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "berinjela em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e berinjela no azeite.",
      "Acrescente o tomate.",
      "Cozinhe até formar um molho rústico.",
      "Junte o macarrão.",
      "Finalize com manjericão."
    ],
    "macros": {
      "kcal": 290,
      "p": 8,
      "c": 48,
      "f": 7,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-366",
    "name": "Macarrão com Camarão, Limão e Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "camarão limpo"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Suco de limão a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal, pimenta e salsinha"
      }
    ],
    "steps": [
      "Doure o alho no azeite.",
      "Acrescente os camarões e cozinhe rapidamente.",
      "Junte os tomates.",
      "Acrescente o macarrão.",
      "Finalize com limão e salsinha."
    ],
    "macros": {
      "kcal": 310,
      "p": 28,
      "c": 34,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-367",
    "name": "Macarrão Integral com Frango e Brócolis",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Rico em fibras"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão integral cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "frango em cubos"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "brócolis"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Grelhe o frango.",
      "Acrescente o brócolis.",
      "Junte o macarrão integral.",
      "Regue com azeite.",
      "Tempere e misture."
    ],
    "macros": {
      "kcal": 330,
      "p": 30,
      "c": 36,
      "f": 8,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-368",
    "name": "Macarrão ao Alho e Óleo Leve com Tomate-Cereja",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "90",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "tomate-cereja"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Doure o alho no azeite.",
      "Acrescente o tomate.",
      "Junte o macarrão.",
      "Misture bem.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 275,
      "p": 7,
      "c": 47,
      "f": 7,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-369",
    "name": "Macarrão com Ricota, Espinafre e Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "ricota"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "espinafre"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Refogue o espinafre.",
      "Amasse a ricota com o leite.",
      "Acrescente o tomate.",
      "Junte o macarrão.",
      "Misture até ficar cremoso."
    ],
    "macros": {
      "kcal": 300,
      "p": 16,
      "c": 39,
      "f": 9,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-370",
    "name": "Macarrão com Carne Moída e Abobrinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "65",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      }
    ],
    "steps": [
      "Doure a carne.",
      "Acrescente cebola e abobrinha.",
      "Junte o molho de tomate.",
      "Acrescente o macarrão.",
      "Misture e sirva."
    ],
    "macros": {
      "kcal": 340,
      "p": 28,
      "c": 33,
      "f": 12,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-371",
    "name": "Macarrão com Cogumelos e Creme de Ricota",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "cogumelos"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha e pimenta a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e cogumelos.",
      "Acrescente creme de ricota e leite.",
      "Misture até formar um molho.",
      "Acrescente o macarrão.",
      "Finalize com salsinha."
    ],
    "macros": {
      "kcal": 285,
      "p": 12,
      "c": 38,
      "f": 9,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-372",
    "name": "Macarrão com Abóbora Cremosa e Frango",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "60",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "120",
        "unit": "g",
        "name": "abóbora cozida"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "leite"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Amasse a abóbora com o leite.",
      "Refogue a cebola e o frango.",
      "Acrescente o creme de abóbora.",
      "Junte o macarrão.",
      "Misture até ficar bem cremoso."
    ],
    "macros": {
      "kcal": 315,
      "p": 31,
      "c": 34,
      "f": 6,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-373",
    "name": "Macarrão com Sardinha, Tomate e Cheiro-Verde",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "70",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "sardinha escorrida"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Limão e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue cebola e tomate.",
      "Acrescente a sardinha.",
      "Junte o macarrão.",
      "Misture delicadamente.",
      "Finalize com limão e cheiro-verde."
    ],
    "macros": {
      "kcal": 335,
      "p": 25,
      "c": 35,
      "f": 12
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-374",
    "name": "Macarrão com Cenoura, Ervilha e Molho de Tomate",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "75",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "cenoura"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "ervilha"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "molho de tomate"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      }
    ],
    "steps": [
      "Refogue a cebola e a cenoura.",
      "Acrescente a ervilha.",
      "Junte o molho de tomate.",
      "Acrescente o macarrão.",
      "Misture bem."
    ],
    "macros": {
      "kcal": 315,
      "p": 10,
      "c": 52,
      "f": 7,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-375",
    "name": "Macarrão com Peixe Branco, Tomate e Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "65",
        "unit": "g",
        "name": "macarrão cozido"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "peixe branco em cubos"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, limão, salsinha, sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Tempere o peixe.",
      "Doure rapidamente no azeite.",
      "Acrescente cebola e tomate.",
      "Junte o macarrão.",
      "Misture delicadamente.",
      "Finalize com limão e salsinha."
    ],
    "macros": {
      "kcal": 300,
      "p": 28,
      "c": 32,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-376",
    "name": "Purê Cremoso de Cenoura com Ervas",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "5min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "cenoura cozida"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha ou cebolinha a gosto"
      }
    ],
    "steps": [
      "Cozinhe a cenoura até ficar bem macia.",
      "Bata ou amasse com o leite.",
      "Acrescente o creme de ricota.",
      "Leve ao fogo baixo e mexa até ficar cremoso.",
      "Tempere e finalize com ervas."
    ],
    "macros": {
      "kcal": 130,
      "p": 5,
      "c": 20,
      "f": 4,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilize leite e creme de ricota zero lactose."
  },
  {
    "id": "NL-377",
    "name": "Purê de Abóbora Cabotiá com Gengibre",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "abóbora cabotiá cozida"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Gengibre ralado a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta-do-reino e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe a abóbora até ficar bem macia.",
      "Amasse ainda quente.",
      "Acrescente o azeite e o gengibre.",
      "Tempere.",
      "Leve ao fogo por alguns minutos, mexendo até ficar cremoso."
    ],
    "macros": {
      "kcal": 145,
      "p": 3,
      "c": 25,
      "f": 5,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-378",
    "name": "Purê de Batata com Alho Assado",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata inglesa cozida"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho assado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de manteiga"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe a batata até ficar macia.",
      "Amasse ainda quente.",
      "Amasse também o alho assado e misture.",
      "Acrescente o leite aos poucos.",
      "Junte a manteiga e ajuste os temperos."
    ],
    "macros": {
      "kcal": 185,
      "p": 4,
      "c": 31,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Para versão sem lactose, utilize leite e manteiga zero lactose."
  },
  {
    "id": "NL-379",
    "name": "Purê de Batata-Doce com Páprica",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "batata-doce cozida"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "água do cozimento"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Páprica doce ou defumada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a batata-doce.",
      "Amasse ainda quente.",
      "Acrescente a água aos poucos até atingir a textura desejada.",
      "Misture o azeite.",
      "Tempere com páprica, sal e pimenta."
    ],
    "macros": {
      "kcal": 175,
      "p": 2,
      "c": 32,
      "f": 5,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-380",
    "name": "Purê de Mandioquinha com Salsinha",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "140",
        "unit": "g",
        "name": "mandioquinha cozida"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Salsinha picada a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a mandioquinha até ficar bem macia.",
      "Amasse.",
      "Acrescente o leite aos poucos.",
      "Misture o azeite.",
      "Tempere e finalize com salsinha."
    ],
    "macros": {
      "kcal": 190,
      "p": 3,
      "c": 34,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-381",
    "name": "Purê de Ervilha com Hortelã",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegana",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "ervilha cozida"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Hortelã fresca a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a ervilha até ficar macia.",
      "Bata com a água.",
      "Acrescente o azeite.",
      "Tempere.",
      "Finalize com hortelã picada."
    ],
    "macros": {
      "kcal": 175,
      "p": 8,
      "c": 22,
      "f": 6,
      "fiber": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-382",
    "name": "Purê Cremoso de Chuchu com Alho e Parmesão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "220",
        "unit": "g",
        "name": "chuchu cozido"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "10",
        "unit": "g",
        "name": "parmesão ralado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 dente de alho"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e noz-moscada a gosto"
      }
    ],
    "steps": [
      "Cozinhe o chuchu e escorra muito bem.",
      "Bata ou amasse com o alho.",
      "Acrescente o creme de ricota.",
      "Leve ao fogo baixo para retirar o excesso de água.",
      "Finalize com parmesão e temperos."
    ],
    "macros": {
      "kcal": 115,
      "p": 6,
      "c": 11,
      "f": 6,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-383",
    "name": "Purê de Brócolis com Creme de Ricota",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "200",
        "unit": "g",
        "name": "brócolis cozido"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Alho, sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe o brócolis até ficar macio.",
      "Escorra muito bem.",
      "Bata com o creme de ricota.",
      "Acrescente o azeite.",
      "Leve ao fogo por alguns minutos e ajuste os temperos."
    ],
    "macros": {
      "kcal": 145,
      "p": 8,
      "c": 14,
      "f": 7,
      "fiber": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-384",
    "name": "Purê de Abobrinha com Ricota e Manjericão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "220",
        "unit": "g",
        "name": "abobrinha"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Manjericão fresco a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, alho e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe ou refogue a abobrinha até amaciar.",
      "Escorra bem qualquer excesso de líquido.",
      "Bata com a ricota.",
      "Acrescente o azeite.",
      "Tempere e finalize com manjericão."
    ],
    "macros": {
      "kcal": 145,
      "p": 8,
      "c": 9,
      "f": 9,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-385",
    "name": "Purê de Beterraba com Iogurte e Limão",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em fibras",
      "Vegetariana",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "180",
        "unit": "g",
        "name": "beterraba cozida"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Cozinhe a beterraba até ficar bem macia.",
      "Bata com o iogurte até formar um creme.",
      "Acrescente o azeite e o limão.",
      "Tempere.",
      "Sirva morno ou em temperatura ambiente."
    ],
    "macros": {
      "kcal": 150,
      "p": 5,
      "c": 20,
      "f": 6,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-386",
    "name": "Frango ao Molho de Maracujá",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten",
      "Sem lactose"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "filé de peito de frango"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "polpa de maracujá"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "cebola picada"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 colher de chá de azeite"
      },
      {
        "quantity": "40",
        "unit": "ml",
        "name": "água"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta-do-reino a gosto"
      }
    ],
    "steps": [
      "Tempere o frango e grelhe no azeite.",
      "Retire e reserve.",
      "Na mesma frigideira, refogue a cebola.",
      "Acrescente o maracujá e a água.",
      "Cozinhe por alguns minutos até reduzir.",
      "Volte o frango para a frigideira e envolva no molho."
    ],
    "macros": {
      "kcal": 315,
      "p": 47,
      "c": 9,
      "f": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-387",
    "name": "Frango Cremoso com Palmito e Alho-Poró",
    "tipo": "prato",
    "meals": [
      "lunch",
      "dinner"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "peito de frango em cubos"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "palmito picado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "alho-poró"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "leite desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal e pimenta a gosto"
      }
    ],
    "steps": [
      "Doure o frango em uma frigideira antiaderente.",
      "Acrescente o alho-poró e refogue.",
      "Junte o palmito.",
      "Misture o creme de ricota com o leite.",
      "Acrescente ao frango e cozinhe em fogo baixo até ficar cremoso."
    ],
    "macros": {
      "kcal": 330,
      "p": 49,
      "c": 9,
      "f": 11
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-388",
    "name": "Wrap Proteico de Frango com Cottage",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "10min",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "40",
        "unit": "g",
        "name": "1 wrap integral pequeno"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Folhas verdes a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Sal, pimenta e ervas a gosto"
      }
    ],
    "steps": [
      "Misture o frango com o cottage.",
      "Tempere a gosto.",
      "Distribua sobre o wrap.",
      "Acrescente tomate e folhas.",
      "Enrole e sirva."
    ],
    "macros": {
      "kcal": 310,
      "p": 36,
      "c": 25,
      "f": 8,
      "fiber": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-389",
    "name": "Sanduíche Proteico de Rosbife e Creme de Ricota",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "2 fatias de pão integral"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "rosbife caseiro de patinho"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Tomate e rúcula a gosto"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Mostarda a gosto"
      }
    ],
    "steps": [
      "Passe o creme de ricota no pão.",
      "Acrescente o rosbife.",
      "Complete com tomate, rúcula e mostarda.",
      "Feche o sanduíche."
    ],
    "macros": {
      "kcal": 330,
      "p": 32,
      "c": 28,
      "f": 11,
      "fiber": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-390",
    "name": "Pão Francês com Carne Moída Cremosa e Queijo",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "50",
        "unit": "g",
        "name": "1 pão francês pequeno"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "creme de ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Tomate e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Refogue a carne e tempere.",
      "Misture o creme de ricota.",
      "Abra o pão e coloque o recheio.",
      "Acrescente o queijo.",
      "Leve rapidamente à sanduicheira ou forno."
    ],
    "macros": {
      "kcal": 390,
      "p": 32,
      "c": 30,
      "f": 16
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-391",
    "name": "Crepe Proteico de Frango e Ricota",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "2 claras"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "tapioca"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "ricota"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Temperos a gosto"
      }
    ],
    "steps": [
      "Bata o ovo, as claras e a tapioca.",
      "Despeje em frigideira antiaderente.",
      "Cozinhe dos dois lados.",
      "Recheie com frango e ricota.",
      "Dobre e sirva."
    ],
    "macros": {
      "kcal": 310,
      "p": 37,
      "c": 19,
      "f": 9
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-392",
    "name": "Omelete de Caneca com Frango e Cottage",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 claras"
      },
      {
        "quantity": "60",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Tomate e cheiro-verde a gosto"
      }
    ],
    "steps": [
      "Bata o ovo e as claras.",
      "Misture o frango, o cottage e os temperos.",
      "Coloque em recipiente próprio para micro-ondas.",
      "Cozinhe em intervalos curtos até firmar."
    ],
    "macros": {
      "kcal": 265,
      "p": 39,
      "c": 4,
      "f": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-393",
    "name": "Cestinha Proteica de Atum e Cottage",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "35",
        "unit": "g",
        "name": "1 pão folha pequeno ou wrap"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "atum em água escorrido"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Orégano a gosto"
      }
    ],
    "steps": [
      "Coloque o wrap em uma forminha, formando uma cestinha.",
      "Leve ao forno por alguns minutos.",
      "Misture atum, cottage e tomate.",
      "Recheie a cestinha.",
      "Finalize com orégano."
    ],
    "macros": {
      "kcal": 280,
      "p": 31,
      "c": 22,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-394",
    "name": "Batata Pequena Recheada com Frango e Cottage",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "120",
        "unit": "g",
        "name": "batata inglesa"
      },
      {
        "quantity": "90",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebolinha e páprica a gosto"
      }
    ],
    "steps": [
      "Cozinhe ou asse a batata.",
      "Abra ao meio e retire uma pequena parte do miolo.",
      "Misture o frango com cottage.",
      "Recheie a batata.",
      "Leve ao forno para aquecer."
    ],
    "macros": {
      "kcal": 300,
      "p": 34,
      "c": 27,
      "f": 6
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-395",
    "name": "Mini Quiche Proteica de Frango sem Massa",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 claras"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "frango desfiado"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "tomate"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Temperos a gosto"
      }
    ],
    "steps": [
      "Bata o ovo e as claras.",
      "Misture cottage, frango e tomate.",
      "Distribua em forminhas.",
      "Asse a 180 °C por aproximadamente 20 minutos."
    ],
    "macros": {
      "kcal": 275,
      "p": 40,
      "c": 5,
      "f": 10
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-396",
    "name": "Pão de Frigideira Proteico com Frango",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "farinha de aveia sem glúten"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de fermento"
      },
      {
        "quantity": "70",
        "unit": "g",
        "name": "frango desfiado"
      }
    ],
    "steps": [
      "Misture ovo, aveia, cottage e fermento.",
      "Coloque metade em uma frigideira pequena.",
      "Acrescente o frango.",
      "Cubra com o restante.",
      "Cozinhe dos dois lados em fogo baixo."
    ],
    "macros": {
      "kcal": 330,
      "p": 35,
      "c": 23,
      "f": 11
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-397",
    "name": "Bolinho Salgado Proteico de Carne e Queijo",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "100",
        "unit": "g",
        "name": "patinho moído"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "queijo minas"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "farinha de aveia sem glúten"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Cebola, salsinha e páprica a gosto"
      }
    ],
    "steps": [
      "Misture a carne, o ovo, a aveia e os temperos.",
      "Modele os bolinhos.",
      "Coloque um pequeno pedaço de queijo no centro.",
      "Feche bem.",
      "Asse ou prepare na airfryer até dourar."
    ],
    "macros": {
      "kcal": 340,
      "p": 34,
      "c": 10,
      "f": 18
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-398",
    "name": "Creme Proteico de Chocolate com Morango",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "iogurte proteico natural"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "whey protein"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "cacau em pó"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "morangos"
      }
    ],
    "steps": [
      "Misture o iogurte com whey e cacau.",
      "Mexa até formar um creme uniforme.",
      "Finalize com os morangos."
    ],
    "macros": {
      "kcal": 230,
      "p": 32,
      "c": 18,
      "f": 4,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-399",
    "name": "Mousse Proteica de Limão",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "whey sabor baunilha"
      },
      {
        "quantity": "15",
        "unit": "ml",
        "name": "suco de limão"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Raspas de limão a gosto"
      }
    ],
    "steps": [
      "Misture o iogurte com o whey.",
      "Acrescente o limão aos poucos.",
      "Mexa até ficar cremoso.",
      "Finalize com raspas.",
      "Leve à geladeira antes de servir."
    ],
    "macros": {
      "kcal": 200,
      "p": 31,
      "c": 12,
      "f": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-400",
    "name": "Cheesecake Proteico de Taça com Frutas Vermelhas",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "150",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "cottage"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "whey sabor baunilha"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "frutas vermelhas"
      }
    ],
    "steps": [
      "Bata ou misture iogurte, cottage e whey.",
      "Coloque em uma taça.",
      "Cubra com as frutas.",
      "Leve à geladeira por 30 minutos."
    ],
    "macros": {
      "kcal": 250,
      "p": 35,
      "c": 20,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-401",
    "name": "Sorvete Proteico de Banana e Whey",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "80",
        "unit": "g",
        "name": "banana congelada"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "whey protein"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Bata a banana congelada com o iogurte.",
      "Acrescente o whey.",
      "Bata até ficar cremoso.",
      "Consuma imediatamente ou leve ao congelador por 30 minutos."
    ],
    "macros": {
      "kcal": 265,
      "p": 31,
      "c": 31,
      "f": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-402",
    "name": "Pudim Proteico de Café",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "whey sabor baunilha"
      },
      {
        "quantity": "30",
        "unit": "ml",
        "name": "café forte frio"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "chia"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Adoçante a gosto"
      }
    ],
    "steps": [
      "Misture o iogurte, whey e café.",
      "Acrescente a chia.",
      "Mexa novamente após 5 minutos.",
      "Leve à geladeira por pelo menos 2 horas."
    ],
    "macros": {
      "kcal": 225,
      "p": 31,
      "c": 14,
      "f": 5,
      "fiber": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-403",
    "name": "Panqueca Proteica de Cacau e Banana",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "3 claras"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "whey"
      },
      {
        "quantity": "50",
        "unit": "g",
        "name": "banana"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "cacau"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Amasse a banana.",
      "Misture com ovo, claras, whey e cacau.",
      "Coloque em frigideira antiaderente.",
      "Cozinhe dos dois lados."
    ],
    "macros": {
      "kcal": 270,
      "p": 31,
      "c": 21,
      "f": 7
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-404",
    "name": "Bowl Proteico de Iogurte, Mamão e Leite em Pó",
    "tipo": "prato",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "20",
        "unit": "g",
        "name": "whey"
      },
      {
        "quantity": "100",
        "unit": "g",
        "name": "mamão"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "leite em pó desnatado"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Misture o iogurte com o whey.",
      "Acrescente o mamão.",
      "Polvilhe leite em pó e canela."
    ],
    "macros": {
      "kcal": 270,
      "p": 33,
      "c": 28,
      "f": 3
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-405",
    "name": "Creme Proteico de Coco e Abacaxi",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "whey sabor baunilha"
      },
      {
        "quantity": "80",
        "unit": "g",
        "name": "abacaxi picado"
      },
      {
        "quantity": "5",
        "unit": "g",
        "name": "coco ralado sem açúcar"
      }
    ],
    "steps": [
      "Misture o iogurte com o whey.",
      "Acrescente metade do abacaxi.",
      "Finalize com o restante da fruta e o coco."
    ],
    "macros": {
      "kcal": 245,
      "p": 31,
      "c": 23,
      "f": 5
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-406",
    "name": "Bolo Proteico de Caneca de Banana e Canela",
    "tipo": "bolo",
    "meals": [
      "snack"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "",
        "unit": "",
        "name": "1 ovo"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "whey"
      },
      {
        "quantity": "40",
        "unit": "g",
        "name": "banana amassada"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "farinha de aveia sem glúten"
      },
      {
        "quantity": "30",
        "unit": "g",
        "name": "iogurte natural"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "1/2 colher de chá de fermento"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela a gosto"
      }
    ],
    "steps": [
      "Misture todos os ingredientes, deixando o fermento por último.",
      "Coloque em caneca grande.",
      "Leve ao micro-ondas por aproximadamente 1 minuto e 30 segundos a 2 minutos.",
      "Aguarde alguns minutos antes de consumir."
    ],
    "macros": {
      "kcal": 290,
      "p": 28,
      "c": 27,
      "f": 8
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  },
  {
    "id": "NL-407",
    "name": "Creme Gelado Proteico de Doce de Leite",
    "tipo": "sobremesa",
    "meals": [
      "snack",
      "dessert"
    ],
    "tags": [
      "Rico em proteínas",
      "Sem glúten"
    ],
    "tagsCondicionais": [],
    "ressalvas": [],
    "time": "—",
    "servings": 1,
    "ingredients": [
      {
        "quantity": "170",
        "unit": "g",
        "name": "iogurte proteico"
      },
      {
        "quantity": "25",
        "unit": "g",
        "name": "whey sabor baunilha"
      },
      {
        "quantity": "15",
        "unit": "g",
        "name": "doce de leite"
      },
      {
        "quantity": "",
        "unit": "",
        "name": "Canela ou flor de sal, opcional"
      }
    ],
    "steps": [
      "Misture o iogurte com o whey.",
      "Acrescente metade do doce de leite e misture levemente.",
      "Finalize com o restante por cima.",
      "Leve à geladeira por 20 a 30 minutos antes de servir."
    ],
    "macros": {
      "kcal": 240,
      "p": 31,
      "c": 21,
      "f": 4
    },
    "conservacao": "Consumir preferencialmente após o preparo. Prazo e condições de armazenamento não foram informados na conversa e devem ser validados antes da publicação.",
    "substituicoes": "Não informadas na conversa."
  }
];

export const NUTRI_RECIPES_BY_ID: Record<string, NutriRecipe> = Object.fromEntries(
  NUTRI_RECIPES.map((r) => [r.id, r]),
);
