// Auto-gerado de scripts/extract-pdf/taco-to-json.mjs
// Fonte: TACO 4ª edição (NEPA/Unicamp, 2011)
// Valores por 100g de parte comestível.

export type TacoFood = {
  id: number;
  name: string;
  group: string;
  kcal: number;
  p: number | null;     // proteína (g)
  c: number | null;     // carboidrato (g)
  f: number | null;     // gordura (g)
  fiber: number | null; // fibra alimentar (g)
};

export const TACO_FOODS: TacoFood[] = [
  {
    "id": 1,
    "name": "Arroz, integral, cozido",
    "group": "",
    "kcal": 123.53,
    "p": 2.59,
    "c": 25.81,
    "f": 1,
    "fiber": 2.75
  },
  {
    "id": 2,
    "name": "Arroz, integral, cru",
    "group": "",
    "kcal": 359.68,
    "p": 7.32,
    "c": 77.45,
    "f": 1.86,
    "fiber": 4.82
  },
  {
    "id": 3,
    "name": "Arroz, tipo 1, cozido",
    "group": "",
    "kcal": 128.26,
    "p": 2.52,
    "c": 28.06,
    "f": 0.23,
    "fiber": 1.56
  },
  {
    "id": 4,
    "name": "Arroz, tipo 1, cru",
    "group": "",
    "kcal": 357.79,
    "p": 7.16,
    "c": 78.76,
    "f": 0.34,
    "fiber": 1.64
  },
  {
    "id": 5,
    "name": "Arroz, tipo 2, cozido",
    "group": "",
    "kcal": 130.12,
    "p": 2.57,
    "c": 28.19,
    "f": 0.36,
    "fiber": 1.07
  },
  {
    "id": 6,
    "name": "Arroz, tipo 2, cru",
    "group": "",
    "kcal": 358.12,
    "p": 7.24,
    "c": 78.88,
    "f": 0.28,
    "fiber": 1.72
  },
  {
    "id": 7,
    "name": "Aveia, flocos, crua",
    "group": "",
    "kcal": 393.82,
    "p": 13.92,
    "c": 66.64,
    "f": 8.5,
    "fiber": 9.13
  },
  {
    "id": 8,
    "name": "Biscoito, doce, maisena",
    "group": "",
    "kcal": 442.82,
    "p": 8.07,
    "c": 75.23,
    "f": 11.97,
    "fiber": 2.1
  },
  {
    "id": 9,
    "name": "Biscoito, doce, recheado com chocolate",
    "group": "",
    "kcal": 471.82,
    "p": 6.4,
    "c": 70.55,
    "f": 19.58,
    "fiber": 2.96
  },
  {
    "id": 10,
    "name": "Biscoito, doce, recheado com morango",
    "group": "",
    "kcal": 471.17,
    "p": 5.72,
    "c": 71.01,
    "f": 19.57,
    "fiber": 1.53
  },
  {
    "id": 11,
    "name": "Biscoito, doce, wafer, recheado de chocolate",
    "group": "",
    "kcal": 502.46,
    "p": 5.56,
    "c": 67.54,
    "f": 24.67,
    "fiber": 1.8
  },
  {
    "id": 12,
    "name": "Biscoito, doce, wafer, recheado de morango",
    "group": "",
    "kcal": 513.45,
    "p": 4.52,
    "c": 67.35,
    "f": 26.4,
    "fiber": 0.82
  },
  {
    "id": 13,
    "name": "Biscoito, salgado, cream cracker",
    "group": "",
    "kcal": 431.73,
    "p": 10.06,
    "c": 68.73,
    "f": 14.44,
    "fiber": 2.51
  },
  {
    "id": 14,
    "name": "Bolo, mistura para",
    "group": "",
    "kcal": 418.63,
    "p": 6.16,
    "c": 84.71,
    "f": 6.13,
    "fiber": 1.7
  },
  {
    "id": 15,
    "name": "Bolo, pronto, aipim",
    "group": "",
    "kcal": 323.85,
    "p": 4.42,
    "c": 47.86,
    "f": 12.75,
    "fiber": 0.69
  },
  {
    "id": 16,
    "name": "Bolo, pronto, chocolate",
    "group": "",
    "kcal": 410.01,
    "p": 6.22,
    "c": 54.72,
    "f": 18.47,
    "fiber": 1.43
  },
  {
    "id": 17,
    "name": "Bolo, pronto, coco",
    "group": "",
    "kcal": 333.44,
    "p": 5.67,
    "c": 52.28,
    "f": 11.3,
    "fiber": 1.06
  },
  {
    "id": 18,
    "name": "Bolo, pronto, milho",
    "group": "",
    "kcal": 311.39,
    "p": 4.8,
    "c": 45.11,
    "f": 12.42,
    "fiber": 0.71
  },
  {
    "id": 19,
    "name": "Canjica, branca, crua",
    "group": "",
    "kcal": 357.6,
    "p": 7.2,
    "c": 78.06,
    "f": 0.97,
    "fiber": 5.5
  },
  {
    "id": 20,
    "name": "Canjica, com leite integral",
    "group": "",
    "kcal": 112.46,
    "p": 2.36,
    "c": 23.63,
    "f": 1.24,
    "fiber": 1.22
  },
  {
    "id": 21,
    "name": "Cereais, milho, flocos, com sal",
    "group": "",
    "kcal": 369.6,
    "p": 7.29,
    "c": 80.83,
    "f": 1.6,
    "fiber": 5.29
  },
  {
    "id": 22,
    "name": "Cereais, milho, flocos, sem sal",
    "group": "",
    "kcal": 363.34,
    "p": 6.88,
    "c": 80.45,
    "f": 1.18,
    "fiber": 1.84
  },
  {
    "id": 23,
    "name": "Cereais, mingau, milho, infantil",
    "group": "",
    "kcal": 394.43,
    "p": 6.43,
    "c": 87.27,
    "f": 1.09,
    "fiber": 3.21
  },
  {
    "id": 24,
    "name": "Cereais, mistura para vitamina, trigo, cevada e aveia",
    "group": "",
    "kcal": 381.13,
    "p": 8.9,
    "c": 81.62,
    "f": 2.12,
    "fiber": 4.98
  },
  {
    "id": 25,
    "name": "Cereal matinal, milho",
    "group": "",
    "kcal": 365.35,
    "p": 7.16,
    "c": 83.82,
    "f": 0.96,
    "fiber": 4.12
  },
  {
    "id": 26,
    "name": "Cereal matinal, milho, açúcar",
    "group": "",
    "kcal": 376.56,
    "p": 4.74,
    "c": 88.84,
    "f": 0.67,
    "fiber": 2.11
  },
  {
    "id": 27,
    "name": "Creme de arroz, pó",
    "group": "",
    "kcal": 386,
    "p": 7.03,
    "c": 83.87,
    "f": 1.23,
    "fiber": 1.07
  },
  {
    "id": 28,
    "name": "Creme de milho, pó",
    "group": "",
    "kcal": 333.03,
    "p": 4.82,
    "c": 86.15,
    "f": 1.64,
    "fiber": 3.72
  },
  {
    "id": 29,
    "name": "Curau, milho verde",
    "group": "",
    "kcal": 78.43,
    "p": 2.36,
    "c": 13.94,
    "f": 1.64,
    "fiber": 0.46
  },
  {
    "id": 30,
    "name": "Curau, milho verde, mistura para",
    "group": "",
    "kcal": 402.29,
    "p": 2.22,
    "c": 79.82,
    "f": 13.37,
    "fiber": 2.52
  },
  {
    "id": 31,
    "name": "Farinha, de arroz, enriquecida",
    "group": "",
    "kcal": 363.06,
    "p": 1.27,
    "c": 85.5,
    "f": 0.3,
    "fiber": 0.58
  },
  {
    "id": 32,
    "name": "Farinha, de centeio, integral",
    "group": "",
    "kcal": 335.78,
    "p": 12.52,
    "c": 73.3,
    "f": 1.75,
    "fiber": 15.48
  },
  {
    "id": 33,
    "name": "Farinha, de milho, amarela",
    "group": "",
    "kcal": 350.59,
    "p": 7.19,
    "c": 79.08,
    "f": 1.47,
    "fiber": 5.49
  },
  {
    "id": 34,
    "name": "Farinha, de rosca",
    "group": "",
    "kcal": 370.58,
    "p": 11.38,
    "c": 75.79,
    "f": 1.46,
    "fiber": 4.82
  },
  {
    "id": 35,
    "name": "Farinha, de trigo",
    "group": "",
    "kcal": 360.47,
    "p": 9.79,
    "c": 75.09,
    "f": 1.37,
    "fiber": 2.35
  },
  {
    "id": 36,
    "name": "Farinha, láctea, de cereais",
    "group": "",
    "kcal": 414.85,
    "p": 11.88,
    "c": 77.77,
    "f": 5.79,
    "fiber": 1.94
  },
  {
    "id": 37,
    "name": "Lasanha, massa fresca, cozida",
    "group": "",
    "kcal": 163.76,
    "p": 5.81,
    "c": 32.52,
    "f": 1.16,
    "fiber": 1.64
  },
  {
    "id": 38,
    "name": "Lasanha, massa fresca, crua",
    "group": "",
    "kcal": 220.31,
    "p": 7.01,
    "c": 45.06,
    "f": 1.34,
    "fiber": 1.61
  },
  {
    "id": 39,
    "name": "Macarrão, instantâneo",
    "group": "",
    "kcal": 435.86,
    "p": 8.79,
    "c": 62.43,
    "f": 17.24,
    "fiber": 5.61
  },
  {
    "id": 40,
    "name": "Macarrão, trigo, cru",
    "group": "",
    "kcal": 371.12,
    "p": 10,
    "c": 77.94,
    "f": 1.3,
    "fiber": 2.93
  },
  {
    "id": 41,
    "name": "Macarrão, trigo, cru, com ovos",
    "group": "",
    "kcal": 370.57,
    "p": 10.32,
    "c": 76.62,
    "f": 1.97,
    "fiber": 2.3
  },
  {
    "id": 42,
    "name": "Milho, amido, cru",
    "group": "",
    "kcal": 361.37,
    "p": 0.6,
    "c": 87.15,
    "f": null,
    "fiber": 0.74
  },
  {
    "id": 43,
    "name": "Milho, fubá, cru",
    "group": "",
    "kcal": 353.48,
    "p": 7.21,
    "c": 78.87,
    "f": 1.9,
    "fiber": 4.71
  },
  {
    "id": 44,
    "name": "Milho, verde, cru",
    "group": "",
    "kcal": 138.17,
    "p": 6.59,
    "c": 28.56,
    "f": 0.61,
    "fiber": 3.92
  },
  {
    "id": 45,
    "name": "Milho, verde, enlatado, drenado",
    "group": "",
    "kcal": 97.56,
    "p": 3.23,
    "c": 17.14,
    "f": 2.35,
    "fiber": 4.64
  },
  {
    "id": 46,
    "name": "Mingau tradicional, pó",
    "group": "",
    "kcal": 373.42,
    "p": 0.58,
    "c": 89.34,
    "f": 0.37,
    "fiber": 0.88
  },
  {
    "id": 47,
    "name": "Pamonha, barra para cozimento, pré-cozida",
    "group": "",
    "kcal": 171.22,
    "p": 2.55,
    "c": 30.68,
    "f": 4.85,
    "fiber": 2.37
  },
  {
    "id": 48,
    "name": "Pão, aveia, forma",
    "group": "",
    "kcal": 343.09,
    "p": 12.35,
    "c": 59.57,
    "f": 5.69,
    "fiber": 5.98
  },
  {
    "id": 49,
    "name": "Pão, de soja",
    "group": "",
    "kcal": 308.73,
    "p": 11.34,
    "c": 56.51,
    "f": 3.58,
    "fiber": 5.71
  },
  {
    "id": 50,
    "name": "Pão, glúten, forma",
    "group": "",
    "kcal": 252.99,
    "p": 11.95,
    "c": 44.12,
    "f": 2.73,
    "fiber": 2.48
  },
  {
    "id": 51,
    "name": "Pão, milho, forma",
    "group": "",
    "kcal": 292.01,
    "p": 8.3,
    "c": 56.4,
    "f": 3.11,
    "fiber": 4.3
  },
  {
    "id": 52,
    "name": "Pão, trigo, forma, integral",
    "group": "",
    "kcal": 253.19,
    "p": 9.43,
    "c": 49.94,
    "f": 3.65,
    "fiber": 6.88
  },
  {
    "id": 53,
    "name": "Pão, trigo, francês",
    "group": "",
    "kcal": 299.81,
    "p": 7.95,
    "c": 58.65,
    "f": 3.1,
    "fiber": 2.31
  },
  {
    "id": 54,
    "name": "Pão, trigo, sovado",
    "group": "",
    "kcal": 310.96,
    "p": 8.4,
    "c": 61.45,
    "f": 2.84,
    "fiber": 2.43
  },
  {
    "id": 55,
    "name": "Pastel, de carne, cru",
    "group": "",
    "kcal": 288.7,
    "p": 10.74,
    "c": 42.02,
    "f": 8.79,
    "fiber": 1.04
  },
  {
    "id": 56,
    "name": "Pastel, de carne, frito",
    "group": "",
    "kcal": 388.37,
    "p": 10.1,
    "c": 43.77,
    "f": 20.14,
    "fiber": 0.99
  },
  {
    "id": 57,
    "name": "Pastel, de queijo, cru",
    "group": "",
    "kcal": 308.47,
    "p": 9.85,
    "c": 45.95,
    "f": 9.63,
    "fiber": 1.11
  },
  {
    "id": 58,
    "name": "Pastel, de queijo, frito",
    "group": "",
    "kcal": 422.11,
    "p": 8.71,
    "c": 48.13,
    "f": 22.67,
    "fiber": 0.94
  },
  {
    "id": 59,
    "name": "Pastel, massa, crua",
    "group": "",
    "kcal": 310.2,
    "p": 6.9,
    "c": 57.38,
    "f": 5.48,
    "fiber": 1.41
  },
  {
    "id": 60,
    "name": "Pastel, massa, frita",
    "group": "",
    "kcal": 569.67,
    "p": 6.02,
    "c": 49.34,
    "f": 40.86,
    "fiber": 1.31
  },
  {
    "id": 61,
    "name": "Pipoca, com óleo de soja, sem sal",
    "group": "",
    "kcal": 448.33,
    "p": 9.93,
    "c": 70.31,
    "f": 15.94,
    "fiber": 14.34
  },
  {
    "id": 62,
    "name": "Polenta, pré-cozida",
    "group": "",
    "kcal": 102.74,
    "p": 2.29,
    "c": 23.31,
    "f": 0.3,
    "fiber": 2.4
  },
  {
    "id": 63,
    "name": "Torrada, pão francês",
    "group": "",
    "kcal": 377.42,
    "p": 10.52,
    "c": 74.56,
    "f": 3.3,
    "fiber": 3.4
  },
  {
    "id": 64,
    "name": "Abóbora, cabotian, cozida",
    "group": "",
    "kcal": 48.04,
    "p": 1.44,
    "c": 10.76,
    "f": 0.73,
    "fiber": 2.46
  },
  {
    "id": 65,
    "name": "Abóbora, cabotian, crua",
    "group": "",
    "kcal": 38.6,
    "p": 1.75,
    "c": 8.36,
    "f": 0.54,
    "fiber": 2.17
  },
  {
    "id": 66,
    "name": "Abóbora, menina brasileira, crua",
    "group": "",
    "kcal": 13.61,
    "p": 0.61,
    "c": 3.3,
    "f": null,
    "fiber": 1.17
  },
  {
    "id": 67,
    "name": "Abóbora, moranga, crua",
    "group": "",
    "kcal": 12.36,
    "p": 0.96,
    "c": 2.67,
    "f": 0.06,
    "fiber": 1.7
  },
  {
    "id": 68,
    "name": "Abóbora, moranga, refogada",
    "group": "",
    "kcal": 29,
    "p": 0.39,
    "c": 5.98,
    "f": 0.8,
    "fiber": 1.55
  },
  {
    "id": 69,
    "name": "Abóbora, pescoço, crua",
    "group": "",
    "kcal": 24.47,
    "p": 0.67,
    "c": 6.12,
    "f": 0.12,
    "fiber": 2.3
  },
  {
    "id": 70,
    "name": "Abobrinha, italiana, cozida",
    "group": "",
    "kcal": 15.04,
    "p": 1.13,
    "c": 2.98,
    "f": 0.2,
    "fiber": 1.59
  },
  {
    "id": 71,
    "name": "Abobrinha, italiana, crua",
    "group": "",
    "kcal": 19.28,
    "p": 1.14,
    "c": 4.29,
    "f": 0.14,
    "fiber": 1.35
  },
  {
    "id": 72,
    "name": "Abobrinha, italiana, refogada",
    "group": "",
    "kcal": 24.43,
    "p": 1.07,
    "c": 4.19,
    "f": 0.82,
    "fiber": 1.38
  },
  {
    "id": 73,
    "name": "Abobrinha, paulista, crua",
    "group": "",
    "kcal": 30.81,
    "p": 0.64,
    "c": 7.87,
    "f": 0.14,
    "fiber": 2.61
  },
  {
    "id": 74,
    "name": "Acelga, crua",
    "group": "",
    "kcal": 20.94,
    "p": 1.44,
    "c": 4.63,
    "f": 0.11,
    "fiber": 1.12
  },
  {
    "id": 75,
    "name": "Agrião, cru",
    "group": "",
    "kcal": 16.58,
    "p": 2.69,
    "c": 2.25,
    "f": 0.24,
    "fiber": 2.14
  },
  {
    "id": 76,
    "name": "Aipo, cru",
    "group": "",
    "kcal": 19.09,
    "p": 0.76,
    "c": 4.27,
    "f": 0.07,
    "fiber": 0.96
  },
  {
    "id": 77,
    "name": "Alface, americana, crua",
    "group": "",
    "kcal": 8.79,
    "p": 0.61,
    "c": 1.75,
    "f": 0.13,
    "fiber": 1.02
  },
  {
    "id": 78,
    "name": "Alface, crespa, crua",
    "group": "",
    "kcal": 10.68,
    "p": 1.35,
    "c": 1.7,
    "f": 0.16,
    "fiber": 1.83
  },
  {
    "id": 79,
    "name": "Alface, lisa, crua",
    "group": "",
    "kcal": 13.82,
    "p": 1.69,
    "c": 2.43,
    "f": 0.12,
    "fiber": 2.33
  },
  {
    "id": 80,
    "name": "Alface, roxa, crua",
    "group": "",
    "kcal": 12.72,
    "p": 0.91,
    "c": 2.49,
    "f": 0.19,
    "fiber": 2.01
  },
  {
    "id": 81,
    "name": "Alfavaca, crua",
    "group": "",
    "kcal": 29.18,
    "p": 2.66,
    "c": 5.24,
    "f": 0.48,
    "fiber": 4.14
  },
  {
    "id": 82,
    "name": "Alho, cru",
    "group": "",
    "kcal": 113.13,
    "p": 7.01,
    "c": 23.91,
    "f": 0.22,
    "fiber": 4.32
  },
  {
    "id": 83,
    "name": "Alho-poró, cru",
    "group": "",
    "kcal": 31.51,
    "p": 1.41,
    "c": 6.88,
    "f": 0.14,
    "fiber": 2.51
  },
  {
    "id": 84,
    "name": "Almeirão, cru",
    "group": "",
    "kcal": 18.03,
    "p": 1.77,
    "c": 3.34,
    "f": 0.22,
    "fiber": 2.59
  },
  {
    "id": 85,
    "name": "Almeirão, refogado",
    "group": "",
    "kcal": 65.08,
    "p": 1.7,
    "c": 5.7,
    "f": 4.85,
    "fiber": 3.43
  },
  {
    "id": 86,
    "name": "Batata, baroa, cozida",
    "group": "",
    "kcal": 80.12,
    "p": 0.85,
    "c": 18.95,
    "f": 0.17,
    "fiber": 1.76
  },
  {
    "id": 87,
    "name": "Batata, baroa, crua",
    "group": "",
    "kcal": 100.98,
    "p": 1.05,
    "c": 23.98,
    "f": 0.17,
    "fiber": 2.06
  },
  {
    "id": 88,
    "name": "Batata, doce, cozida",
    "group": "",
    "kcal": 76.76,
    "p": 0.64,
    "c": 18.42,
    "f": 0.09,
    "fiber": 2.21
  },
  {
    "id": 89,
    "name": "Batata, doce, crua",
    "group": "",
    "kcal": 118.24,
    "p": 1.26,
    "c": 28.2,
    "f": 0.13,
    "fiber": 2.57
  },
  {
    "id": 90,
    "name": "Batata, frita, tipo chips, industrializada",
    "group": "",
    "kcal": 542.73,
    "p": 5.58,
    "c": 51.22,
    "f": 36.62,
    "fiber": 2.46
  },
  {
    "id": 91,
    "name": "Batata, inglesa, cozida",
    "group": "",
    "kcal": 51.59,
    "p": 1.16,
    "c": 11.94,
    "f": null,
    "fiber": 1.34
  },
  {
    "id": 92,
    "name": "Batata, inglesa, crua",
    "group": "",
    "kcal": 64.37,
    "p": 1.77,
    "c": 14.69,
    "f": null,
    "fiber": 1.16
  },
  {
    "id": 93,
    "name": "Batata, inglesa, frita",
    "group": "",
    "kcal": 267.16,
    "p": 4.97,
    "c": 35.64,
    "f": 13.11,
    "fiber": 8.06
  },
  {
    "id": 94,
    "name": "Batata, inglesa, sauté",
    "group": "",
    "kcal": 67.89,
    "p": 1.29,
    "c": 14.09,
    "f": 0.9,
    "fiber": 1.38
  },
  {
    "id": 95,
    "name": "Berinjela, cozida",
    "group": "",
    "kcal": 18.85,
    "p": 0.68,
    "c": 4.47,
    "f": 0.15,
    "fiber": 2.52
  },
  {
    "id": 96,
    "name": "Berinjela, crua",
    "group": "",
    "kcal": 19.63,
    "p": 1.22,
    "c": 4.43,
    "f": 0.1,
    "fiber": 2.87
  },
  {
    "id": 97,
    "name": "Beterraba, cozida",
    "group": "",
    "kcal": 32.15,
    "p": 1.29,
    "c": 7.23,
    "f": 0.09,
    "fiber": 1.88
  },
  {
    "id": 98,
    "name": "Beterraba, crua",
    "group": "",
    "kcal": 48.83,
    "p": 1.95,
    "c": 11.11,
    "f": 0.09,
    "fiber": 3.37
  },
  {
    "id": 99,
    "name": "Biscoito, polvilho doce",
    "group": "",
    "kcal": 437.55,
    "p": 1.29,
    "c": 80.54,
    "f": 12.25,
    "fiber": 1.16
  },
  {
    "id": 100,
    "name": "Brócolis, cozido",
    "group": "",
    "kcal": 24.64,
    "p": 2.13,
    "c": 4.37,
    "f": 0.46,
    "fiber": 3.42
  },
  {
    "id": 101,
    "name": "Brócolis, cru",
    "group": "",
    "kcal": 25.5,
    "p": 3.64,
    "c": 4.03,
    "f": 0.27,
    "fiber": 2.88
  },
  {
    "id": 102,
    "name": "Cará, cozido",
    "group": "",
    "kcal": 77.58,
    "p": 1.53,
    "c": 18.85,
    "f": 0.11,
    "fiber": 2.63
  },
  {
    "id": 103,
    "name": "Cará, cru",
    "group": "",
    "kcal": 95.63,
    "p": 2.28,
    "c": 22.95,
    "f": 0.14,
    "fiber": 7.27
  },
  {
    "id": 104,
    "name": "Caruru, cru",
    "group": "",
    "kcal": 34.03,
    "p": 3.2,
    "c": 5.97,
    "f": 0.59,
    "fiber": 4.47
  },
  {
    "id": 105,
    "name": "Catalonha, crua",
    "group": "",
    "kcal": 23.89,
    "p": 1.87,
    "c": 4.75,
    "f": 0.28,
    "fiber": 2.05
  },
  {
    "id": 106,
    "name": "Catalonha, refogada",
    "group": "",
    "kcal": 63.45,
    "p": 1.95,
    "c": 4.81,
    "f": 4.81,
    "fiber": 3.65
  },
  {
    "id": 107,
    "name": "Cebola, crua",
    "group": "",
    "kcal": 39.42,
    "p": 1.71,
    "c": 8.85,
    "f": 0.08,
    "fiber": 2.19
  },
  {
    "id": 108,
    "name": "Cebolinha, crua",
    "group": "",
    "kcal": 19.52,
    "p": 1.87,
    "c": 3.37,
    "f": 0.35,
    "fiber": 3.55
  },
  {
    "id": 109,
    "name": "Cenoura, cozida",
    "group": "",
    "kcal": 29.86,
    "p": 0.85,
    "c": 6.69,
    "f": 0.22,
    "fiber": 2.63
  },
  {
    "id": 110,
    "name": "Cenoura, crua",
    "group": "",
    "kcal": 34.14,
    "p": 1.32,
    "c": 7.66,
    "f": 0.17,
    "fiber": 3.18
  },
  {
    "id": 111,
    "name": "Chicória, crua",
    "group": "",
    "kcal": 13.84,
    "p": 1.14,
    "c": 2.85,
    "f": 0.14,
    "fiber": 2.2
  },
  {
    "id": 112,
    "name": "Chuchu, cozido",
    "group": "",
    "kcal": 18.54,
    "p": 0.41,
    "c": 4.79,
    "f": null,
    "fiber": 1.04
  },
  {
    "id": 113,
    "name": "Chuchu, cru",
    "group": "",
    "kcal": 16.98,
    "p": 0.7,
    "c": 4.14,
    "f": 0.06,
    "fiber": 1.28
  },
  {
    "id": 114,
    "name": "Coentro, folhas desidratadas",
    "group": "",
    "kcal": 309.07,
    "p": 20.88,
    "c": 47.96,
    "f": 10.39,
    "fiber": 37.29
  },
  {
    "id": 115,
    "name": "Couve, manteiga, crua",
    "group": "",
    "kcal": 27.06,
    "p": 2.87,
    "c": 4.33,
    "f": 0.55,
    "fiber": 3.12
  },
  {
    "id": 116,
    "name": "Couve, manteiga, refogada",
    "group": "",
    "kcal": 90.34,
    "p": 1.67,
    "c": 8.71,
    "f": 6.59,
    "fiber": 5.74
  },
  {
    "id": 117,
    "name": "Couve-flor, crua",
    "group": "",
    "kcal": 22.56,
    "p": 1.91,
    "c": 4.52,
    "f": 0.21,
    "fiber": 2.35
  },
  {
    "id": 118,
    "name": "Couve-flor, cozida",
    "group": "",
    "kcal": 19.11,
    "p": 1.24,
    "c": 3.88,
    "f": 0.27,
    "fiber": 2.13
  },
  {
    "id": 119,
    "name": "Espinafre, Nova Zelândia, cru",
    "group": "",
    "kcal": 16.1,
    "p": 2,
    "c": 2.57,
    "f": 0.24,
    "fiber": 2.1
  },
  {
    "id": 120,
    "name": "Espinafre, Nova Zelândia, refogado",
    "group": "",
    "kcal": 67.25,
    "p": 2.72,
    "c": 4.24,
    "f": 5.43,
    "fiber": 2.52
  },
  {
    "id": 121,
    "name": "Farinha, de mandioca, crua",
    "group": "",
    "kcal": 360.87,
    "p": 1.55,
    "c": 87.9,
    "f": 0.28,
    "fiber": 6.39
  },
  {
    "id": 122,
    "name": "Farinha, de mandioca, torrada",
    "group": "",
    "kcal": 365.27,
    "p": 1.23,
    "c": 89.19,
    "f": 0.29,
    "fiber": 6.54
  },
  {
    "id": 123,
    "name": "Farinha, de puba",
    "group": "",
    "kcal": 360.18,
    "p": 1.62,
    "c": 87.29,
    "f": 0.47,
    "fiber": 4.24
  },
  {
    "id": 124,
    "name": "Fécula, de mandioca",
    "group": "",
    "kcal": 330.85,
    "p": 0.52,
    "c": 81.15,
    "f": 0.28,
    "fiber": 0.65
  },
  {
    "id": 125,
    "name": "Feijão, broto, cru",
    "group": "",
    "kcal": 38.72,
    "p": 4.17,
    "c": 7.76,
    "f": 0.1,
    "fiber": 1.97
  },
  {
    "id": 126,
    "name": "Inhame, cru",
    "group": "",
    "kcal": 96.7,
    "p": 2.05,
    "c": 23.23,
    "f": 0.21,
    "fiber": 1.65
  },
  {
    "id": 127,
    "name": "Jiló, cru",
    "group": "",
    "kcal": 27.37,
    "p": 1.4,
    "c": 6.19,
    "f": 0.22,
    "fiber": 4.83
  },
  {
    "id": 128,
    "name": "Jurubeba, crua",
    "group": "",
    "kcal": 125.81,
    "p": 4.41,
    "c": 23.06,
    "f": 3.91,
    "fiber": 23.92
  },
  {
    "id": 129,
    "name": "Mandioca, cozida",
    "group": "",
    "kcal": 125.36,
    "p": 0.57,
    "c": 30.09,
    "f": 0.3,
    "fiber": 1.56
  },
  {
    "id": 130,
    "name": "Mandioca, crua",
    "group": "",
    "kcal": 151.42,
    "p": 1.13,
    "c": 36.17,
    "f": 0.3,
    "fiber": 1.88
  },
  {
    "id": 131,
    "name": "Mandioca, farofa, temperada",
    "group": "",
    "kcal": 405.69,
    "p": 2.06,
    "c": 80.3,
    "f": 9.12,
    "fiber": 7.82
  },
  {
    "id": 132,
    "name": "Mandioca, frita",
    "group": "",
    "kcal": 300.06,
    "p": 1.38,
    "c": 50.25,
    "f": 11.2,
    "fiber": 1.87
  },
  {
    "id": 133,
    "name": "Manjericão, cru",
    "group": "",
    "kcal": 21.15,
    "p": 1.99,
    "c": 3.64,
    "f": 0.39,
    "fiber": 3.31
  },
  {
    "id": 134,
    "name": "Maxixe, cru",
    "group": "",
    "kcal": 13.75,
    "p": 1.39,
    "c": 2.73,
    "f": 0.07,
    "fiber": 2.19
  },
  {
    "id": 135,
    "name": "Mostarda, folha, crua",
    "group": "",
    "kcal": 18.11,
    "p": 2.11,
    "c": 3.24,
    "f": 0.17,
    "fiber": 1.89
  },
  {
    "id": 136,
    "name": "Nhoque, batata, cozido",
    "group": "",
    "kcal": 180.78,
    "p": 5.86,
    "c": 36.78,
    "f": 1.94,
    "fiber": 1.78
  },
  {
    "id": 137,
    "name": "Nabo, cru",
    "group": "",
    "kcal": 18.19,
    "p": 1.2,
    "c": 4.15,
    "f": 0.05,
    "fiber": 2.64
  },
  {
    "id": 138,
    "name": "Palmito, juçara, em conserva",
    "group": "",
    "kcal": 23.2,
    "p": 1.79,
    "c": 4.33,
    "f": 0.4,
    "fiber": 3.15
  },
  {
    "id": 139,
    "name": "Palmito, pupunha, em conserva",
    "group": "",
    "kcal": 29.43,
    "p": 2.46,
    "c": 5.51,
    "f": 0.45,
    "fiber": 2.55
  },
  {
    "id": 140,
    "name": "Pão, de queijo, assado",
    "group": "",
    "kcal": 363.08,
    "p": 5.12,
    "c": 34.24,
    "f": 24.57,
    "fiber": 0.56
  },
  {
    "id": 141,
    "name": "Pão, de queijo, cru",
    "group": "",
    "kcal": 294.54,
    "p": 3.65,
    "c": 38.51,
    "f": 13.99,
    "fiber": 0.98
  },
  {
    "id": 142,
    "name": "Pepino, cru",
    "group": "",
    "kcal": 9.53,
    "p": 0.87,
    "c": 2.04,
    "f": null,
    "fiber": 1.12
  },
  {
    "id": 143,
    "name": "Pimentão, amarelo, cru",
    "group": "",
    "kcal": 27.93,
    "p": 1.22,
    "c": 5.96,
    "f": 0.44,
    "fiber": 1.92
  },
  {
    "id": 144,
    "name": "Pimentão, verde, cru",
    "group": "",
    "kcal": 21.29,
    "p": 1.05,
    "c": 4.89,
    "f": 0.15,
    "fiber": 2.56
  },
  {
    "id": 145,
    "name": "Pimentão, vermelho, cru",
    "group": "",
    "kcal": 23.28,
    "p": 1.04,
    "c": 5.47,
    "f": 0.15,
    "fiber": 1.59
  },
  {
    "id": 146,
    "name": "Polvilho, doce",
    "group": "",
    "kcal": 351.23,
    "p": 0.43,
    "c": 86.77,
    "f": null,
    "fiber": 0.24
  },
  {
    "id": 147,
    "name": "Quiabo, cru",
    "group": "",
    "kcal": 29.94,
    "p": 1.92,
    "c": 6.37,
    "f": 0.3,
    "fiber": 4.55
  },
  {
    "id": 148,
    "name": "Rabanete, cru",
    "group": "",
    "kcal": 13.74,
    "p": 1.39,
    "c": 2.73,
    "f": 0.07,
    "fiber": 2.19
  },
  {
    "id": 149,
    "name": "Repolho, branco, cru",
    "group": "",
    "kcal": 17.12,
    "p": 0.88,
    "c": 3.86,
    "f": 0.14,
    "fiber": 1.89
  },
  {
    "id": 150,
    "name": "Repolho, roxo, cru",
    "group": "",
    "kcal": 30.91,
    "p": 1.91,
    "c": 7.2,
    "f": 0.06,
    "fiber": 1.97
  },
  {
    "id": 151,
    "name": "Repolho, roxo, refogado",
    "group": "",
    "kcal": 41.77,
    "p": 1.8,
    "c": 7.56,
    "f": 1.24,
    "fiber": 1.75
  },
  {
    "id": 152,
    "name": "Rúcula, crua",
    "group": "",
    "kcal": 13.13,
    "p": 1.77,
    "c": 2.22,
    "f": 0.11,
    "fiber": 1.74
  },
  {
    "id": 153,
    "name": "Salsa, crua",
    "group": "",
    "kcal": 33.42,
    "p": 3.26,
    "c": 5.71,
    "f": 0.61,
    "fiber": 1.85
  },
  {
    "id": 154,
    "name": "Seleta de legumes, enlatada",
    "group": "",
    "kcal": 56.53,
    "p": 3.42,
    "c": 12.67,
    "f": 0.35,
    "fiber": 3.09
  },
  {
    "id": 155,
    "name": "Serralha, crua",
    "group": "",
    "kcal": 30.4,
    "p": 2.67,
    "c": 4.95,
    "f": 0.74,
    "fiber": 3.52
  },
  {
    "id": 156,
    "name": "Taioba, crua",
    "group": "",
    "kcal": 34.21,
    "p": 2.9,
    "c": 5.43,
    "f": 0.93,
    "fiber": 4.45
  },
  {
    "id": 157,
    "name": "Tomate, com semente, cru",
    "group": "",
    "kcal": 15.34,
    "p": 1.1,
    "c": 3.14,
    "f": 0.17,
    "fiber": 1.17
  },
  {
    "id": 158,
    "name": "Tomate, extrato",
    "group": "",
    "kcal": 60.93,
    "p": 2.43,
    "c": 14.96,
    "f": 0.19,
    "fiber": 2.8
  },
  {
    "id": 159,
    "name": "Tomate, molho industrializado",
    "group": "",
    "kcal": 38.45,
    "p": 1.38,
    "c": 7.71,
    "f": 0.9,
    "fiber": 3.12
  },
  {
    "id": 160,
    "name": "Tomate, purê",
    "group": "",
    "kcal": 27.94,
    "p": 1.36,
    "c": 6.89,
    "f": null,
    "fiber": 1.03
  },
  {
    "id": 161,
    "name": "Tomate, salada",
    "group": "",
    "kcal": 20.55,
    "p": 0.81,
    "c": 5.12,
    "f": null,
    "fiber": 2.27
  },
  {
    "id": 162,
    "name": "Vagem, crua",
    "group": "",
    "kcal": 24.9,
    "p": 1.79,
    "c": 5.35,
    "f": 0.17,
    "fiber": 2.38
  },
  {
    "id": 163,
    "name": "Abacate, cru",
    "group": "",
    "kcal": 96.15,
    "p": 1.24,
    "c": 6.03,
    "f": 8.4,
    "fiber": 6.31
  },
  {
    "id": 164,
    "name": "Abacaxi, cru",
    "group": "",
    "kcal": 48.32,
    "p": 0.86,
    "c": 12.33,
    "f": 0.12,
    "fiber": 0.99
  },
  {
    "id": 165,
    "name": "Abacaxi, polpa, congelada",
    "group": "",
    "kcal": 30.59,
    "p": 0.47,
    "c": 7.8,
    "f": 0.11,
    "fiber": 0.33
  },
  {
    "id": 166,
    "name": "Abiu, cru",
    "group": "",
    "kcal": 62.42,
    "p": 0.83,
    "c": 14.93,
    "f": 0.7,
    "fiber": 1.7
  },
  {
    "id": 167,
    "name": "Açaí, polpa, com xarope de guaraná e glucose",
    "group": "",
    "kcal": 110.3,
    "p": 0.72,
    "c": 21.46,
    "f": 3.66,
    "fiber": 1.72
  },
  {
    "id": 168,
    "name": "Açaí, polpa, congelada",
    "group": "",
    "kcal": 58.05,
    "p": 0.8,
    "c": 6.21,
    "f": 3.94,
    "fiber": 2.55
  },
  {
    "id": 169,
    "name": "Acerola, crua",
    "group": "",
    "kcal": 33.46,
    "p": 0.91,
    "c": 7.97,
    "f": 0.21,
    "fiber": 1.51
  },
  {
    "id": 170,
    "name": "Acerola, polpa, congelada",
    "group": "",
    "kcal": 21.94,
    "p": 0.59,
    "c": 5.54,
    "f": null,
    "fiber": 0.7
  },
  {
    "id": 171,
    "name": "Ameixa, calda, enlatada",
    "group": "",
    "kcal": 182.85,
    "p": 0.41,
    "c": 46.89,
    "f": null,
    "fiber": 0.52
  },
  {
    "id": 172,
    "name": "Ameixa, crua",
    "group": "",
    "kcal": 52.54,
    "p": 0.77,
    "c": 13.85,
    "f": null,
    "fiber": 2.43
  },
  {
    "id": 173,
    "name": "Ameixa, em calda, enlatada, drenada",
    "group": "",
    "kcal": 177.36,
    "p": 1.02,
    "c": 47.66,
    "f": 0.28,
    "fiber": 4.55
  },
  {
    "id": 174,
    "name": "Atemóia, crua",
    "group": "",
    "kcal": 96.97,
    "p": 0.97,
    "c": 25.33,
    "f": 0.3,
    "fiber": 2.14
  },
  {
    "id": 175,
    "name": "Banana, da terra, crua",
    "group": "",
    "kcal": 128.02,
    "p": 1.43,
    "c": 33.67,
    "f": 0.24,
    "fiber": 1.53
  },
  {
    "id": 176,
    "name": "Banana, doce em barra",
    "group": "",
    "kcal": 280.11,
    "p": 2.17,
    "c": 75.67,
    "f": 0.05,
    "fiber": 3.83
  },
  {
    "id": 177,
    "name": "Banana, figo, crua",
    "group": "",
    "kcal": 105.08,
    "p": 1.13,
    "c": 27.8,
    "f": 0.14,
    "fiber": 2.8
  },
  {
    "id": 178,
    "name": "Banana, maçã, crua",
    "group": "",
    "kcal": 86.81,
    "p": 1.75,
    "c": 22.34,
    "f": 0.06,
    "fiber": 2.59
  },
  {
    "id": 179,
    "name": "Banana, nanica, crua",
    "group": "",
    "kcal": 91.53,
    "p": 1.4,
    "c": 23.85,
    "f": 0.12,
    "fiber": 1.95
  },
  {
    "id": 180,
    "name": "Banana, ouro, crua",
    "group": "",
    "kcal": 112.37,
    "p": 1.48,
    "c": 29.34,
    "f": 0.21,
    "fiber": 1.95
  },
  {
    "id": 181,
    "name": "Banana, pacova, crua",
    "group": "",
    "kcal": 77.91,
    "p": 1.23,
    "c": 20.31,
    "f": 0.08,
    "fiber": 2.03
  },
  {
    "id": 182,
    "name": "Banana, prata, crua",
    "group": "",
    "kcal": 98.25,
    "p": 1.27,
    "c": 25.96,
    "f": 0.07,
    "fiber": 2.04
  },
  {
    "id": 183,
    "name": "Cacau, cru",
    "group": "",
    "kcal": 74.29,
    "p": 0.95,
    "c": 19.41,
    "f": 0.14,
    "fiber": 2.19
  },
  {
    "id": 184,
    "name": "Cajá-Manga, cru",
    "group": "",
    "kcal": 45.58,
    "p": 1.28,
    "c": 11.43,
    "f": null,
    "fiber": 2.58
  },
  {
    "id": 185,
    "name": "Cajá, polpa, congelada",
    "group": "",
    "kcal": 26.33,
    "p": 0.59,
    "c": 6.37,
    "f": 0.17,
    "fiber": 1.36
  },
  {
    "id": 186,
    "name": "Caju, cru",
    "group": "",
    "kcal": 43.07,
    "p": 0.97,
    "c": 10.29,
    "f": 0.33,
    "fiber": 1.68
  },
  {
    "id": 187,
    "name": "Caju, polpa, congelada",
    "group": "",
    "kcal": 36.57,
    "p": 0.48,
    "c": 9.35,
    "f": 0.15,
    "fiber": 0.81
  },
  {
    "id": 188,
    "name": "Caju, suco concentrado, envasado",
    "group": "",
    "kcal": 45.11,
    "p": 0.4,
    "c": 10.73,
    "f": 0.2,
    "fiber": 0.63
  },
  {
    "id": 189,
    "name": "Caqui, chocolate, cru",
    "group": "",
    "kcal": 71.35,
    "p": 0.36,
    "c": 19.33,
    "f": 0.07,
    "fiber": 6.52
  },
  {
    "id": 190,
    "name": "Carambola, crua",
    "group": "",
    "kcal": 45.74,
    "p": 0.87,
    "c": 11.48,
    "f": 0.18,
    "fiber": 2.03
  },
  {
    "id": 191,
    "name": "Ciriguela, crua",
    "group": "",
    "kcal": 75.59,
    "p": 1.4,
    "c": 18.86,
    "f": 0.36,
    "fiber": 3.9
  },
  {
    "id": 192,
    "name": "Cupuaçu, cru",
    "group": "",
    "kcal": 49.42,
    "p": 1.16,
    "c": 10.43,
    "f": 0.95,
    "fiber": 3.12
  },
  {
    "id": 193,
    "name": "Cupuaçu, polpa, congelada",
    "group": "",
    "kcal": 48.8,
    "p": 0.84,
    "c": 11.39,
    "f": 0.59,
    "fiber": 1.59
  },
  {
    "id": 194,
    "name": "Figo, cru",
    "group": "",
    "kcal": 41.45,
    "p": 0.97,
    "c": 10.25,
    "f": 0.16,
    "fiber": 1.79
  },
  {
    "id": 195,
    "name": "Figo, enlatado, em calda",
    "group": "",
    "kcal": 184.36,
    "p": 0.56,
    "c": 50.34,
    "f": 0.15,
    "fiber": 1.98
  },
  {
    "id": 196,
    "name": "Fruta-pão, crua",
    "group": "",
    "kcal": 67.05,
    "p": 1.08,
    "c": 17.17,
    "f": 0.19,
    "fiber": 5.55
  },
  {
    "id": 197,
    "name": "Goiaba, branca, com casca, crua",
    "group": "",
    "kcal": 51.74,
    "p": 0.9,
    "c": 12.4,
    "f": 0.49,
    "fiber": 6.33
  },
  {
    "id": 198,
    "name": "Goiaba, doce em pasta",
    "group": "",
    "kcal": 268.96,
    "p": 0.58,
    "c": 74.12,
    "f": 0,
    "fiber": 3.73
  },
  {
    "id": 199,
    "name": "Goiaba, doce, cascão",
    "group": "",
    "kcal": 285.59,
    "p": 0.41,
    "c": 78.7,
    "f": 0.1,
    "fiber": 4.37
  },
  {
    "id": 200,
    "name": "Goiaba, vermelha, com casca, crua",
    "group": "",
    "kcal": 54.17,
    "p": 1.09,
    "c": 13.01,
    "f": 0.44,
    "fiber": 6.22
  },
  {
    "id": 201,
    "name": "Graviola, crua",
    "group": "",
    "kcal": 61.62,
    "p": 0.85,
    "c": 15.84,
    "f": 0.21,
    "fiber": 1.91
  },
  {
    "id": 202,
    "name": "Graviola, polpa, congelada",
    "group": "",
    "kcal": 38.27,
    "p": 0.57,
    "c": 9.78,
    "f": 0.14,
    "fiber": 1.19
  },
  {
    "id": 203,
    "name": "Jabuticaba, crua",
    "group": "",
    "kcal": 58.05,
    "p": 0.61,
    "c": 15.26,
    "f": 0.13,
    "fiber": 2.3
  },
  {
    "id": 204,
    "name": "Jaca, crua",
    "group": "",
    "kcal": 87.92,
    "p": 1.4,
    "c": 22.5,
    "f": 0.27,
    "fiber": 2.39
  },
  {
    "id": 205,
    "name": "Jambo, cru",
    "group": "",
    "kcal": 26.91,
    "p": 0.89,
    "c": 6.49,
    "f": 0.07,
    "fiber": 5.07
  },
  {
    "id": 206,
    "name": "Jamelão, cru",
    "group": "",
    "kcal": 41.01,
    "p": 0.55,
    "c": 10.63,
    "f": 0.11,
    "fiber": 1.78
  },
  {
    "id": 207,
    "name": "Kiwi, cru",
    "group": "",
    "kcal": 51.14,
    "p": 1.34,
    "c": 11.5,
    "f": 0.63,
    "fiber": 2.65
  },
  {
    "id": 208,
    "name": "Laranja, baía, crua",
    "group": "",
    "kcal": 45.44,
    "p": 0.98,
    "c": 11.47,
    "f": 0.1,
    "fiber": 1.12
  },
  {
    "id": 209,
    "name": "Laranja, baía, suco",
    "group": "",
    "kcal": 36.65,
    "p": 0.65,
    "c": 8.7,
    "f": null,
    "fiber": null
  },
  {
    "id": 210,
    "name": "Laranja, da terra, crua",
    "group": "",
    "kcal": 51.47,
    "p": 1.08,
    "c": 12.86,
    "f": 0.19,
    "fiber": 3.98
  },
  {
    "id": 211,
    "name": "Laranja, da terra, suco",
    "group": "",
    "kcal": 40.96,
    "p": 0.67,
    "c": 9.57,
    "f": 0.14,
    "fiber": 1.03
  },
  {
    "id": 212,
    "name": "Laranja, lima, crua",
    "group": "",
    "kcal": 45.7,
    "p": 1.06,
    "c": 11.53,
    "f": 0.08,
    "fiber": 1.78
  },
  {
    "id": 213,
    "name": "Laranja, lima, suco",
    "group": "",
    "kcal": 39.34,
    "p": 0.71,
    "c": 9.17,
    "f": 0.12,
    "fiber": 0.42
  },
  {
    "id": 214,
    "name": "Laranja, pêra, crua",
    "group": "",
    "kcal": 36.77,
    "p": 1.04,
    "c": 8.95,
    "f": 0.13,
    "fiber": 0.77
  },
  {
    "id": 215,
    "name": "Laranja, pêra, suco",
    "group": "",
    "kcal": 32.71,
    "p": 0.74,
    "c": 7.55,
    "f": 0.07,
    "fiber": null
  },
  {
    "id": 216,
    "name": "Laranja, valência, crua",
    "group": "",
    "kcal": 46.11,
    "p": 0.77,
    "c": 11.72,
    "f": 0.16,
    "fiber": 1.73
  },
  {
    "id": 217,
    "name": "Laranja, valência, suco",
    "group": "",
    "kcal": 36.2,
    "p": 0.48,
    "c": 8.55,
    "f": 0.12,
    "fiber": 0.42
  },
  {
    "id": 218,
    "name": "Limão, cravo, suco",
    "group": "",
    "kcal": 14.1,
    "p": 0.33,
    "c": 5.25,
    "f": null,
    "fiber": null
  },
  {
    "id": 219,
    "name": "Limão, galego, suco",
    "group": "",
    "kcal": 22.23,
    "p": 0.57,
    "c": 7.32,
    "f": 0.07,
    "fiber": null
  },
  {
    "id": 220,
    "name": "Limão, tahiti, cru",
    "group": "",
    "kcal": 31.82,
    "p": 0.94,
    "c": 11.08,
    "f": 0.14,
    "fiber": 1.18
  },
  {
    "id": 221,
    "name": "Maçã, Argentina, com casca, crua",
    "group": "",
    "kcal": 62.53,
    "p": 0.23,
    "c": 16.59,
    "f": 0.25,
    "fiber": 2.03
  },
  {
    "id": 222,
    "name": "Maçã, Fuji, com casca, crua",
    "group": "",
    "kcal": 55.52,
    "p": 0.29,
    "c": 15.15,
    "f": null,
    "fiber": 1.35
  },
  {
    "id": 223,
    "name": "Macaúba, crua",
    "group": "",
    "kcal": 404.28,
    "p": 2.08,
    "c": 13.95,
    "f": 40.66,
    "fiber": 13.44
  },
  {
    "id": 224,
    "name": "Mamão, doce em calda, drenado",
    "group": "",
    "kcal": 195.63,
    "p": 0.19,
    "c": 54,
    "f": 0.07,
    "fiber": 1.31
  },
  {
    "id": 225,
    "name": "Mamão, Formosa, cru",
    "group": "",
    "kcal": 45.34,
    "p": 0.82,
    "c": 11.55,
    "f": 0.12,
    "fiber": 1.81
  },
  {
    "id": 226,
    "name": "Mamão, Papaia, cru",
    "group": "",
    "kcal": 40.16,
    "p": 0.46,
    "c": 10.44,
    "f": 0.12,
    "fiber": 1.04
  },
  {
    "id": 227,
    "name": "Mamão verde, doce em calda, drenado",
    "group": "",
    "kcal": 209.38,
    "p": 0.32,
    "c": 57.64,
    "f": 0.1,
    "fiber": 1.23
  },
  {
    "id": 228,
    "name": "Manga, Haden, crua",
    "group": "",
    "kcal": 63.5,
    "p": 0.41,
    "c": 16.66,
    "f": 0.26,
    "fiber": 1.58
  },
  {
    "id": 229,
    "name": "Manga, Palmer, crua",
    "group": "",
    "kcal": 72.49,
    "p": 0.41,
    "c": 19.35,
    "f": 0.17,
    "fiber": 1.63
  },
  {
    "id": 230,
    "name": "Manga, polpa, congelada",
    "group": "",
    "kcal": 48.31,
    "p": 0.38,
    "c": 12.52,
    "f": 0.23,
    "fiber": 1.07
  },
  {
    "id": 231,
    "name": "Manga, Tommy Atkins, crua",
    "group": "",
    "kcal": 50.69,
    "p": 0.86,
    "c": 12.77,
    "f": 0.22,
    "fiber": 2.07
  },
  {
    "id": 232,
    "name": "Maracujá, cru",
    "group": "",
    "kcal": 68.44,
    "p": 1.99,
    "c": 12.26,
    "f": 2.1,
    "fiber": 1.14
  },
  {
    "id": 233,
    "name": "Maracujá, polpa, congelada",
    "group": "",
    "kcal": 38.76,
    "p": 0.81,
    "c": 9.6,
    "f": 0.18,
    "fiber": 0.51
  },
  {
    "id": 234,
    "name": "Maracujá, suco concentrado, envasado",
    "group": "",
    "kcal": 41.97,
    "p": 0.77,
    "c": 9.64,
    "f": 0.19,
    "fiber": 0.35
  },
  {
    "id": 235,
    "name": "Melancia, crua",
    "group": "",
    "kcal": 32.61,
    "p": 0.88,
    "c": 8.14,
    "f": null,
    "fiber": 0.12
  },
  {
    "id": 236,
    "name": "Melão, cru",
    "group": "",
    "kcal": 29.37,
    "p": 0.68,
    "c": 7.53,
    "f": null,
    "fiber": 0.25
  },
  {
    "id": 237,
    "name": "Mexerica, Murcote, crua",
    "group": "",
    "kcal": 57.59,
    "p": 0.88,
    "c": 14.86,
    "f": 0.13,
    "fiber": 3.07
  },
  {
    "id": 238,
    "name": "Mexerica, Rio, crua",
    "group": "",
    "kcal": 36.87,
    "p": 0.65,
    "c": 9.34,
    "f": 0.13,
    "fiber": 2.73
  },
  {
    "id": 239,
    "name": "Morango, cru",
    "group": "",
    "kcal": 30.15,
    "p": 0.89,
    "c": 6.82,
    "f": 0.31,
    "fiber": 1.72
  },
  {
    "id": 240,
    "name": "Nêspera, crua",
    "group": "",
    "kcal": 42.54,
    "p": 0.31,
    "c": 11.53,
    "f": null,
    "fiber": 2.96
  },
  {
    "id": 241,
    "name": "Pequi, cru",
    "group": "",
    "kcal": 204.97,
    "p": 2.34,
    "c": 12.97,
    "f": 17.97,
    "fiber": 19.04
  },
  {
    "id": 242,
    "name": "Pêra, Park, crua",
    "group": "",
    "kcal": 60.59,
    "p": 0.24,
    "c": 16.07,
    "f": 0.23,
    "fiber": 2.98
  },
  {
    "id": 243,
    "name": "Pêra, Williams, crua",
    "group": "",
    "kcal": 53.31,
    "p": 0.57,
    "c": 14.02,
    "f": 0.11,
    "fiber": 3.01
  },
  {
    "id": 244,
    "name": "Pêssego, Aurora, cru",
    "group": "",
    "kcal": 36.33,
    "p": 0.83,
    "c": 9.32,
    "f": null,
    "fiber": 1.42
  },
  {
    "id": 245,
    "name": "Pêssego, enlatado, em calda",
    "group": "",
    "kcal": 63.14,
    "p": 0.71,
    "c": 16.88,
    "f": null,
    "fiber": 1.02
  },
  {
    "id": 246,
    "name": "Pinha, crua",
    "group": "",
    "kcal": 88.47,
    "p": 1.49,
    "c": 22.45,
    "f": 0.32,
    "fiber": 3.36
  },
  {
    "id": 247,
    "name": "Pitanga, crua",
    "group": "",
    "kcal": 41.42,
    "p": 0.93,
    "c": 10.24,
    "f": 0.17,
    "fiber": 3.24
  },
  {
    "id": 248,
    "name": "Pitanga, polpa, congelada",
    "group": "",
    "kcal": 19.11,
    "p": 0.29,
    "c": 4.76,
    "f": 0.12,
    "fiber": 0.74
  },
  {
    "id": 249,
    "name": "Romã, crua",
    "group": "",
    "kcal": 55.74,
    "p": 0.4,
    "c": 15.11,
    "f": null,
    "fiber": 0.44
  },
  {
    "id": 250,
    "name": "Tamarindo, cru",
    "group": "",
    "kcal": 275.7,
    "p": 3.21,
    "c": 72.53,
    "f": 0.46,
    "fiber": 6.45
  },
  {
    "id": 251,
    "name": "Tangerina, Poncã, crua",
    "group": "",
    "kcal": 37.83,
    "p": 0.85,
    "c": 9.61,
    "f": 0.07,
    "fiber": 0.94
  },
  {
    "id": 252,
    "name": "Tangerina, Poncã, suco",
    "group": "",
    "kcal": 36.11,
    "p": 0.52,
    "c": 8.8,
    "f": null,
    "fiber": null
  },
  {
    "id": 253,
    "name": "Tucumã, cru",
    "group": "",
    "kcal": 262.02,
    "p": 2.09,
    "c": 26.47,
    "f": 19.08,
    "fiber": 12.65
  },
  {
    "id": 254,
    "name": "Umbu, cru",
    "group": "",
    "kcal": 37.02,
    "p": 0.84,
    "c": 9.4,
    "f": null,
    "fiber": 1.98
  },
  {
    "id": 255,
    "name": "Umbu, polpa, congelada",
    "group": "",
    "kcal": 33.94,
    "p": 0.51,
    "c": 8.79,
    "f": 0.07,
    "fiber": 1.34
  },
  {
    "id": 256,
    "name": "Uva, Itália, crua",
    "group": "",
    "kcal": 52.87,
    "p": 0.75,
    "c": 13.57,
    "f": 0.2,
    "fiber": 0.92
  },
  {
    "id": 257,
    "name": "Uva, Rubi, crua",
    "group": "",
    "kcal": 49.06,
    "p": 0.61,
    "c": 12.7,
    "f": 0.16,
    "fiber": 0.93
  },
  {
    "id": 258,
    "name": "Uva, suco concentrado, envasado",
    "group": "",
    "kcal": 57.66,
    "p": null,
    "c": 14.71,
    "f": null,
    "fiber": 0.23
  },
  {
    "id": 259,
    "name": "Azeite, de dendê",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 260,
    "name": "Azeite, de oliva, extra virgem",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 261,
    "name": "Manteiga, com sal",
    "group": "",
    "kcal": 725.97,
    "p": 0.41,
    "c": 0.06,
    "f": 82.36,
    "fiber": null
  },
  {
    "id": 262,
    "name": "Manteiga, sem sal",
    "group": "",
    "kcal": 757.54,
    "p": 0.4,
    "c": 0,
    "f": 86.04,
    "fiber": null
  },
  {
    "id": 263,
    "name": "Margarina, com óleo hidrogenado, com sal (65% de lipídeos)",
    "group": "",
    "kcal": 596.12,
    "p": null,
    "c": 0,
    "f": 67.43,
    "fiber": null
  },
  {
    "id": 264,
    "name": "Margarina, com óleo hidrogenado, sem sal (80% de lipídeos)",
    "group": "",
    "kcal": 722.53,
    "p": null,
    "c": 0,
    "f": 81.73,
    "fiber": null
  },
  {
    "id": 265,
    "name": "Margarina, com óleo interesterificado, com sal (65%de lipídeos)",
    "group": "",
    "kcal": 594.45,
    "p": null,
    "c": 0,
    "f": 67.25,
    "fiber": null
  },
  {
    "id": 266,
    "name": "Margarina, com óleo interesterificado, sem sal (65% de lipídeos)",
    "group": "",
    "kcal": 593.14,
    "p": null,
    "c": 0,
    "f": 67.1,
    "fiber": null
  },
  {
    "id": 267,
    "name": "Óleo, de babaçu",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 268,
    "name": "Óleo, de canola",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 269,
    "name": "Óleo, de girassol",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 270,
    "name": "Óleo, de milho",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 271,
    "name": "Óleo, de pequi",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 272,
    "name": "Óleo, de soja",
    "group": "",
    "kcal": 884,
    "p": null,
    "c": null,
    "f": 100,
    "fiber": null
  },
  {
    "id": 273,
    "name": "Abadejo, filé, congelado, assado",
    "group": "",
    "kcal": 111.62,
    "p": 23.53,
    "c": 0,
    "f": 1.24,
    "fiber": null
  },
  {
    "id": 274,
    "name": "Abadejo, filé, congelado,cozido",
    "group": "",
    "kcal": 91.1,
    "p": 19.35,
    "c": 0,
    "f": 0.94,
    "fiber": null
  },
  {
    "id": 275,
    "name": "Abadejo, filé, congelado, cru",
    "group": "",
    "kcal": 59.11,
    "p": 13.08,
    "c": 0,
    "f": 0.36,
    "fiber": null
  },
  {
    "id": 276,
    "name": "Abadejo, filé, congelado, grelhado",
    "group": "",
    "kcal": 129.64,
    "p": 27.61,
    "c": 0,
    "f": 1.3,
    "fiber": null
  },
  {
    "id": 277,
    "name": "Atum, conserva em óleo",
    "group": "",
    "kcal": 165.91,
    "p": 26.19,
    "c": 0,
    "f": 6,
    "fiber": null
  },
  {
    "id": 278,
    "name": "Atum, fresco, cru",
    "group": "",
    "kcal": 117.5,
    "p": 25.68,
    "c": 0,
    "f": 0.87,
    "fiber": null
  },
  {
    "id": 279,
    "name": "Bacalhau, salgado, cru",
    "group": "",
    "kcal": 135.89,
    "p": 29.04,
    "c": 0,
    "f": 1.32,
    "fiber": null
  },
  {
    "id": 280,
    "name": "Bacalhau, salgado, refogado",
    "group": "",
    "kcal": 139.66,
    "p": 23.98,
    "c": 1.22,
    "f": 3.61,
    "fiber": null
  },
  {
    "id": 281,
    "name": "Cação, posta, com farinha de trigo, frita",
    "group": "",
    "kcal": 208.33,
    "p": 24.95,
    "c": 3.1,
    "f": 9.95,
    "fiber": 0.54
  },
  {
    "id": 282,
    "name": "Cação, posta, cozida",
    "group": "",
    "kcal": 116.01,
    "p": 25.59,
    "c": 0,
    "f": 0.75,
    "fiber": null
  },
  {
    "id": 283,
    "name": "Cação, posta, crua",
    "group": "",
    "kcal": 83.33,
    "p": 17.85,
    "c": 0,
    "f": 0.79,
    "fiber": null
  },
  {
    "id": 284,
    "name": "Camarão, Rio Grande, grande, cozido",
    "group": "",
    "kcal": 90.01,
    "p": 18.97,
    "c": 0,
    "f": 1,
    "fiber": null
  },
  {
    "id": 285,
    "name": "Camarão, Rio Grande, grande, cru",
    "group": "",
    "kcal": 47.18,
    "p": 9.99,
    "c": 0,
    "f": 0.5,
    "fiber": null
  },
  {
    "id": 286,
    "name": "Camarão, Sete Barbas, sem cabeça, com casca, frito",
    "group": "",
    "kcal": 231.25,
    "p": 18.39,
    "c": 2.88,
    "f": 15.62,
    "fiber": null
  },
  {
    "id": 287,
    "name": "Caranguejo, cozido",
    "group": "",
    "kcal": 82.72,
    "p": 18.48,
    "c": 0,
    "f": 0.42,
    "fiber": null
  },
  {
    "id": 288,
    "name": "Corimba, cru",
    "group": "",
    "kcal": 128.16,
    "p": 17.37,
    "c": -0.03,
    "f": 5.99,
    "fiber": null
  },
  {
    "id": 289,
    "name": "Corimbatá, assado",
    "group": "",
    "kcal": 261.45,
    "p": 19.9,
    "c": 0,
    "f": 19.57,
    "fiber": null
  },
  {
    "id": 290,
    "name": "Corimbatá, cozido",
    "group": "",
    "kcal": 238.7,
    "p": 20.13,
    "c": 0,
    "f": 16.93,
    "fiber": null
  },
  {
    "id": 291,
    "name": "Corvina de água doce, crua",
    "group": "",
    "kcal": 101.01,
    "p": 18.92,
    "c": 0,
    "f": 2.24,
    "fiber": null
  },
  {
    "id": 292,
    "name": "Corvina do mar, crua",
    "group": "",
    "kcal": 94,
    "p": 18.57,
    "c": 0,
    "f": 1.58,
    "fiber": null
  },
  {
    "id": 293,
    "name": "Corvina grande, assada",
    "group": "",
    "kcal": 146.53,
    "p": 26.77,
    "c": 0,
    "f": 3.57,
    "fiber": null
  },
  {
    "id": 294,
    "name": "Corvina grande, cozida",
    "group": "",
    "kcal": 100.08,
    "p": 23.44,
    "c": 0,
    "f": 2.56,
    "fiber": null
  },
  {
    "id": 295,
    "name": "Dourada de água doce, fresca",
    "group": "",
    "kcal": 131.21,
    "p": 18.81,
    "c": 0,
    "f": 5.64,
    "fiber": null
  },
  {
    "id": 296,
    "name": "Lambari, congelado, cru",
    "group": "",
    "kcal": 130.84,
    "p": 16.81,
    "c": 0,
    "f": 6.55,
    "fiber": null
  },
  {
    "id": 297,
    "name": "Lambari, congelado, frito",
    "group": "",
    "kcal": 326.87,
    "p": 28.43,
    "c": 0,
    "f": 22.78,
    "fiber": null
  },
  {
    "id": 298,
    "name": "Lambari, fresco, cru",
    "group": "",
    "kcal": 151.6,
    "p": 15.65,
    "c": 0,
    "f": 9.4,
    "fiber": null
  },
  {
    "id": 299,
    "name": "Manjuba, com farinha de trigo, frita",
    "group": "",
    "kcal": 343.55,
    "p": 23.45,
    "c": 10.24,
    "f": 22.59,
    "fiber": 0.36
  },
  {
    "id": 300,
    "name": "Manjuba, frita",
    "group": "",
    "kcal": 349.33,
    "p": 30.14,
    "c": 0,
    "f": 24.46,
    "fiber": null
  },
  {
    "id": 301,
    "name": "Merluza, filé, assado",
    "group": "",
    "kcal": 121.91,
    "p": 26.6,
    "c": 0,
    "f": 0.92,
    "fiber": null
  },
  {
    "id": 302,
    "name": "Merluza, filé, cru",
    "group": "",
    "kcal": 89.13,
    "p": 16.61,
    "c": 0,
    "f": 2.02,
    "fiber": null
  },
  {
    "id": 303,
    "name": "Merluza, filé, frito",
    "group": "",
    "kcal": 191.63,
    "p": 26.93,
    "c": 0,
    "f": 8.5,
    "fiber": null
  },
  {
    "id": 304,
    "name": "Pescada, branca, crua",
    "group": "",
    "kcal": 110.88,
    "p": 16.26,
    "c": 0,
    "f": 4.59,
    "fiber": null
  },
  {
    "id": 305,
    "name": "Pescada, branca, frita",
    "group": "",
    "kcal": 223.04,
    "p": 27.36,
    "c": 0,
    "f": 11.78,
    "fiber": null
  },
  {
    "id": 306,
    "name": "Pescada, filé, com farinha de trigo, frito",
    "group": "",
    "kcal": 283.43,
    "p": 21.44,
    "c": 5.03,
    "f": 19.11,
    "fiber": null
  },
  {
    "id": 307,
    "name": "Pescada, filé, cru",
    "group": "",
    "kcal": 107.21,
    "p": 16.65,
    "c": 0,
    "f": 4,
    "fiber": null
  },
  {
    "id": 308,
    "name": "Pescada, filé, frito",
    "group": "",
    "kcal": 154.27,
    "p": 28.59,
    "c": 0,
    "f": 3.57,
    "fiber": null
  },
  {
    "id": 309,
    "name": "Pescada, filé, molho escabeche",
    "group": "",
    "kcal": 141.96,
    "p": 11.75,
    "c": 5.02,
    "f": 8.02,
    "fiber": 0.78
  },
  {
    "id": 310,
    "name": "Pescadinha, crua",
    "group": "",
    "kcal": 76.41,
    "p": 15.48,
    "c": 0,
    "f": 1.14,
    "fiber": null
  },
  {
    "id": 311,
    "name": "Pintado, assado",
    "group": "",
    "kcal": 191.56,
    "p": 36.45,
    "c": 0,
    "f": 3.98,
    "fiber": null
  },
  {
    "id": 312,
    "name": "Pintado, cru",
    "group": "",
    "kcal": 91.08,
    "p": 18.56,
    "c": 0,
    "f": 1.31,
    "fiber": null
  },
  {
    "id": 313,
    "name": "Pintado, grelhado",
    "group": "",
    "kcal": 152.19,
    "p": 30.8,
    "c": 0,
    "f": 2.29,
    "fiber": null
  },
  {
    "id": 314,
    "name": "Porquinho, cru",
    "group": "",
    "kcal": 93.02,
    "p": 20.49,
    "c": 0,
    "f": 0.61,
    "fiber": null
  },
  {
    "id": 315,
    "name": "Salmão, filé, com pele, fresco,  grelhado",
    "group": "",
    "kcal": 228.73,
    "p": 23.92,
    "c": 0,
    "f": 14.04,
    "fiber": null
  },
  {
    "id": 316,
    "name": "Salmão, sem pele, fresco, cru",
    "group": "",
    "kcal": 169.78,
    "p": 19.25,
    "c": 0,
    "f": 9.71,
    "fiber": null
  },
  {
    "id": 317,
    "name": "Salmão, sem pele, fresco, grelhado",
    "group": "",
    "kcal": 242.71,
    "p": 26.14,
    "c": 0,
    "f": 14.53,
    "fiber": null
  },
  {
    "id": 318,
    "name": "Sardinha, assada",
    "group": "",
    "kcal": 164.35,
    "p": 32.18,
    "c": 0,
    "f": 2.99,
    "fiber": null
  },
  {
    "id": 319,
    "name": "Sardinha, conserva em óleo",
    "group": "",
    "kcal": 284.98,
    "p": 15.94,
    "c": 0,
    "f": 24.05,
    "fiber": null
  },
  {
    "id": 320,
    "name": "Sardinha, frita",
    "group": "",
    "kcal": 257.04,
    "p": 33.38,
    "c": 0,
    "f": 12.69,
    "fiber": null
  },
  {
    "id": 321,
    "name": "Sardinha, inteira, crua",
    "group": "",
    "kcal": 113.9,
    "p": 21.08,
    "c": 0,
    "f": 2.65,
    "fiber": null
  },
  {
    "id": 322,
    "name": "Tucunaré, filé, congelado, cru",
    "group": "",
    "kcal": 87.69,
    "p": 17.96,
    "c": -0.05,
    "f": 1.22,
    "fiber": null
  },
  {
    "id": 323,
    "name": "Apresuntado",
    "group": "",
    "kcal": 128.86,
    "p": 13.45,
    "c": 2.86,
    "f": 6.69,
    "fiber": null
  },
  {
    "id": 324,
    "name": "Caldo de carne, tablete",
    "group": "",
    "kcal": 240.62,
    "p": 7.82,
    "c": 15.05,
    "f": 16.57,
    "fiber": 0.58
  },
  {
    "id": 325,
    "name": "Caldo de galinha, tablete",
    "group": "",
    "kcal": 251.45,
    "p": 6.28,
    "c": 10.65,
    "f": 20.42,
    "fiber": 11.81
  },
  {
    "id": 326,
    "name": "Carne, bovina, acém, moído, cozido",
    "group": "",
    "kcal": 212.42,
    "p": 26.69,
    "c": 0,
    "f": 10.92,
    "fiber": null
  },
  {
    "id": 327,
    "name": "Carne, bovina, acém, moído, cru",
    "group": "",
    "kcal": 136.56,
    "p": 19.42,
    "c": 0,
    "f": 5.95,
    "fiber": null
  },
  {
    "id": 328,
    "name": "Carne, bovina, acém, sem gordura, cozido",
    "group": "",
    "kcal": 214.61,
    "p": 27.27,
    "c": 0,
    "f": 10.88,
    "fiber": null
  },
  {
    "id": 329,
    "name": "Carne, bovina, acém, sem gordura, cru",
    "group": "",
    "kcal": 144.03,
    "p": 20.82,
    "c": 0,
    "f": 6.11,
    "fiber": null
  },
  {
    "id": 330,
    "name": "Carne, bovina, almôndegas, cruas",
    "group": "",
    "kcal": 189.26,
    "p": 12.31,
    "c": 9.79,
    "f": 11.2,
    "fiber": null
  },
  {
    "id": 331,
    "name": "Carne, bovina, almôndegas, fritas",
    "group": "",
    "kcal": 271.81,
    "p": 18.16,
    "c": 14.29,
    "f": 15.78,
    "fiber": null
  },
  {
    "id": 332,
    "name": "Carne, bovina, bucho, cozido",
    "group": "",
    "kcal": 133.02,
    "p": 21.64,
    "c": 0,
    "f": 4.5,
    "fiber": null
  },
  {
    "id": 333,
    "name": "Carne, bovina, bucho, cru",
    "group": "",
    "kcal": 137.3,
    "p": 20.53,
    "c": 0,
    "f": 5.5,
    "fiber": null
  },
  {
    "id": 334,
    "name": "Carne, bovina, capa de contra-filé, com gordura, crua",
    "group": "",
    "kcal": 216.91,
    "p": 19.2,
    "c": 0,
    "f": 14.96,
    "fiber": null
  },
  {
    "id": 335,
    "name": "Carne, bovina, capa de contra-filé, com gordura, grelhada",
    "group": "",
    "kcal": 311.7,
    "p": 30.69,
    "c": 0,
    "f": 20.03,
    "fiber": null
  },
  {
    "id": 336,
    "name": "Carne, bovina, capa de contra-filé, sem gordura, crua",
    "group": "",
    "kcal": 131.06,
    "p": 21.54,
    "c": 0,
    "f": 4.33,
    "fiber": null
  },
  {
    "id": 337,
    "name": "Carne, bovina, capa de contra-filé, sem gordura, grelhada",
    "group": "",
    "kcal": 239.44,
    "p": 35.06,
    "c": -0.01,
    "f": 9.95,
    "fiber": null
  },
  {
    "id": 338,
    "name": "Carne, bovina, charque, cozido",
    "group": "",
    "kcal": 262.78,
    "p": 36.36,
    "c": 0,
    "f": 11.92,
    "fiber": null
  },
  {
    "id": 339,
    "name": "Carne, bovina, charque, cru",
    "group": "",
    "kcal": 248.86,
    "p": 22.71,
    "c": 0,
    "f": 16.84,
    "fiber": null
  },
  {
    "id": 340,
    "name": "Carne, bovina, contra-filé, à milanesa",
    "group": "",
    "kcal": 351.59,
    "p": 20.61,
    "c": 12.17,
    "f": 24,
    "fiber": 0.37
  },
  {
    "id": 341,
    "name": "Carne, bovina, contra-filé de costela, cru",
    "group": "",
    "kcal": 202.44,
    "p": 19.8,
    "c": 0,
    "f": 13.07,
    "fiber": null
  },
  {
    "id": 342,
    "name": "Carne, bovina, contra-filé de costela, grelhado",
    "group": "",
    "kcal": 274.91,
    "p": 29.88,
    "c": 0,
    "f": 16.33,
    "fiber": null
  },
  {
    "id": 343,
    "name": "Carne, bovina, contra-filé, com gordura, cru",
    "group": "",
    "kcal": 205.86,
    "p": 21.15,
    "c": 0,
    "f": 12.81,
    "fiber": null
  },
  {
    "id": 344,
    "name": "Carne, bovina, contra-filé, com gordura, grelhado",
    "group": "",
    "kcal": 278.05,
    "p": 32.4,
    "c": 0,
    "f": 15.49,
    "fiber": null
  },
  {
    "id": 345,
    "name": "Carne, bovina, contra-filé, sem gordura, cru",
    "group": "",
    "kcal": 156.62,
    "p": 24,
    "c": 0,
    "f": 6,
    "fiber": null
  },
  {
    "id": 346,
    "name": "Carne, bovina, contra-filé, sem gordura, grelhado",
    "group": "",
    "kcal": 193.69,
    "p": 35.88,
    "c": 0,
    "f": 4.49,
    "fiber": null
  },
  {
    "id": 347,
    "name": "Carne, bovina, costela, assada",
    "group": "",
    "kcal": 373.04,
    "p": 28.81,
    "c": 0,
    "f": 27.72,
    "fiber": null
  },
  {
    "id": 348,
    "name": "Carne, bovina, costela, crua",
    "group": "",
    "kcal": 357.72,
    "p": 16.71,
    "c": 0,
    "f": 31.75,
    "fiber": null
  },
  {
    "id": 349,
    "name": "Carne, bovina, coxão duro, sem gordura, cozido",
    "group": "",
    "kcal": 216.62,
    "p": 31.88,
    "c": 0,
    "f": 8.92,
    "fiber": null
  },
  {
    "id": 350,
    "name": "Carne, bovina, coxão duro, sem gordura, cru",
    "group": "",
    "kcal": 147.97,
    "p": 21.51,
    "c": 0,
    "f": 6.22,
    "fiber": null
  },
  {
    "id": 351,
    "name": "Carne, bovina, coxão mole, sem gordura, cozido",
    "group": "",
    "kcal": 218.68,
    "p": 32.38,
    "c": 0,
    "f": 8.91,
    "fiber": null
  },
  {
    "id": 352,
    "name": "Carne, bovina, coxão mole, sem gordura, cru",
    "group": "",
    "kcal": 169.07,
    "p": 21.23,
    "c": 0,
    "f": 8.69,
    "fiber": null
  },
  {
    "id": 353,
    "name": "Carne, bovina, cupim, assado",
    "group": "",
    "kcal": 330.1,
    "p": 28.63,
    "c": 0,
    "f": 23.04,
    "fiber": null
  },
  {
    "id": 354,
    "name": "Carne, bovina, cupim, cru",
    "group": "",
    "kcal": 221.4,
    "p": 19.54,
    "c": 0,
    "f": 15.3,
    "fiber": null
  },
  {
    "id": 355,
    "name": "Carne, bovina, fígado, cru",
    "group": "",
    "kcal": 141.05,
    "p": 20.71,
    "c": 1.11,
    "f": 5.36,
    "fiber": null
  },
  {
    "id": 356,
    "name": "Carne, bovina, fígado, grelhado",
    "group": "",
    "kcal": 225.03,
    "p": 29.86,
    "c": 4.2,
    "f": 9.01,
    "fiber": null
  },
  {
    "id": 357,
    "name": "Carne, bovina, filé mingnon, sem gordura, cru",
    "group": "",
    "kcal": 142.86,
    "p": 21.6,
    "c": 0,
    "f": 5.61,
    "fiber": null
  },
  {
    "id": 358,
    "name": "Carne, bovina, filé mingnon, sem gordura, grelhado",
    "group": "",
    "kcal": 219.7,
    "p": 32.8,
    "c": 0,
    "f": 8.83,
    "fiber": null
  },
  {
    "id": 359,
    "name": "Carne, bovina, flanco, sem gordura, cozido",
    "group": "",
    "kcal": 195.58,
    "p": 29.38,
    "c": 0,
    "f": 7.77,
    "fiber": null
  },
  {
    "id": 360,
    "name": "Carne, bovina, flanco, sem gordura, cru",
    "group": "",
    "kcal": 141.46,
    "p": 20,
    "c": 0,
    "f": 6.22,
    "fiber": null
  },
  {
    "id": 361,
    "name": "Carne, bovina, fraldinha, com gordura, cozida",
    "group": "",
    "kcal": 338.45,
    "p": 24.24,
    "c": 0,
    "f": 26.05,
    "fiber": null
  },
  {
    "id": 362,
    "name": "Carne, bovina, fraldinha, com gordura, crua",
    "group": "",
    "kcal": 220.72,
    "p": 17.58,
    "c": 0,
    "f": 16.15,
    "fiber": null
  },
  {
    "id": 363,
    "name": "Carne, bovina, lagarto, cozido",
    "group": "",
    "kcal": 222.47,
    "p": 32.86,
    "c": 0,
    "f": 9.11,
    "fiber": null
  },
  {
    "id": 364,
    "name": "Carne, bovina, lagarto, cru",
    "group": "",
    "kcal": 134.86,
    "p": 20.54,
    "c": 0,
    "f": 5.23,
    "fiber": null
  },
  {
    "id": 365,
    "name": "Carne, bovina, língua, cozida",
    "group": "",
    "kcal": 314.9,
    "p": 21.37,
    "c": 0,
    "f": 24.8,
    "fiber": null
  },
  {
    "id": 366,
    "name": "Carne, bovina, língua, crua",
    "group": "",
    "kcal": 215.25,
    "p": 17.09,
    "c": 0,
    "f": 15.77,
    "fiber": null
  },
  {
    "id": 367,
    "name": "Carne, bovina, maminha, crua",
    "group": "",
    "kcal": 152.77,
    "p": 20.93,
    "c": 0,
    "f": 7.03,
    "fiber": null
  },
  {
    "id": 368,
    "name": "Carne, bovina, maminha, grelhada",
    "group": "",
    "kcal": 153.09,
    "p": 30.74,
    "c": 0,
    "f": 2.42,
    "fiber": null
  },
  {
    "id": 369,
    "name": "Carne, bovina, miolo de alcatra, sem gordura, cru",
    "group": "",
    "kcal": 162.87,
    "p": 21.61,
    "c": 0,
    "f": 7.83,
    "fiber": null
  },
  {
    "id": 370,
    "name": "Carne, bovina, miolo de alcatra, sem gordura, grelhado",
    "group": "",
    "kcal": 241.36,
    "p": 31.93,
    "c": 0,
    "f": 11.64,
    "fiber": null
  },
  {
    "id": 371,
    "name": "Carne, bovina, músculo, sem gordura, cozido",
    "group": "",
    "kcal": 193.8,
    "p": 31.23,
    "c": 0,
    "f": 6.7,
    "fiber": null
  },
  {
    "id": 372,
    "name": "Carne, bovina, músculo, sem gordura, cru",
    "group": "",
    "kcal": 141.58,
    "p": 21.56,
    "c": 0,
    "f": 5.49,
    "fiber": null
  },
  {
    "id": 373,
    "name": "Carne, bovina, paleta, com gordura, crua",
    "group": "",
    "kcal": 158.71,
    "p": 21.41,
    "c": 0,
    "f": 7.46,
    "fiber": null
  },
  {
    "id": 374,
    "name": "Carne, bovina, paleta, sem gordura, cozida",
    "group": "",
    "kcal": 193.65,
    "p": 29.72,
    "c": 0,
    "f": 7.4,
    "fiber": null
  },
  {
    "id": 375,
    "name": "Carne, bovina, paleta, sem gordura, crua",
    "group": "",
    "kcal": 140.94,
    "p": 21.03,
    "c": 0,
    "f": 5.67,
    "fiber": null
  },
  {
    "id": 376,
    "name": "Carne, bovina, patinho, sem gordura, cru",
    "group": "",
    "kcal": 133.47,
    "p": 21.72,
    "c": 0,
    "f": 4.51,
    "fiber": null
  },
  {
    "id": 377,
    "name": "Carne, bovina, patinho, sem gordura, grelhado",
    "group": "",
    "kcal": 219.26,
    "p": 35.9,
    "c": 0,
    "f": 7.31,
    "fiber": null
  },
  {
    "id": 378,
    "name": "Carne, bovina, peito, sem gordura, cozido",
    "group": "",
    "kcal": 338.47,
    "p": 22.25,
    "c": 0,
    "f": 26.99,
    "fiber": null
  },
  {
    "id": 379,
    "name": "Carne, bovina, peito, sem gordura, cru",
    "group": "",
    "kcal": 259.28,
    "p": 17.56,
    "c": 0,
    "f": 20.43,
    "fiber": null
  },
  {
    "id": 380,
    "name": "Carne, bovina, picanha, com gordura, crua",
    "group": "",
    "kcal": 212.88,
    "p": 18.82,
    "c": 0,
    "f": 14.69,
    "fiber": null
  },
  {
    "id": 381,
    "name": "Carne, bovina, picanha, com gordura, grelhada",
    "group": "",
    "kcal": 288.77,
    "p": 26.42,
    "c": 0,
    "f": 19.51,
    "fiber": null
  },
  {
    "id": 382,
    "name": "Carne, bovina, picanha, sem gordura, crua",
    "group": "",
    "kcal": 133.52,
    "p": 21.25,
    "c": 0,
    "f": 4.74,
    "fiber": null
  },
  {
    "id": 383,
    "name": "Carne, bovina, picanha, sem gordura, grelhada",
    "group": "",
    "kcal": 238.47,
    "p": 31.91,
    "c": 0,
    "f": 11.33,
    "fiber": null
  },
  {
    "id": 384,
    "name": "Carne, bovina, seca, cozida",
    "group": "",
    "kcal": 312.8,
    "p": 26.93,
    "c": 0,
    "f": 21.93,
    "fiber": null
  },
  {
    "id": 385,
    "name": "Carne, bovina, seca, crua",
    "group": "",
    "kcal": 312.75,
    "p": 19.66,
    "c": 0,
    "f": 25.37,
    "fiber": null
  },
  {
    "id": 386,
    "name": "Coxinha de frango, frita",
    "group": "",
    "kcal": 283.05,
    "p": 9.61,
    "c": 34.52,
    "f": 11.84,
    "fiber": 4.97
  },
  {
    "id": 387,
    "name": "Croquete, de carne, cru",
    "group": "",
    "kcal": 245.77,
    "p": 12.04,
    "c": 13.95,
    "f": 15.56,
    "fiber": null
  },
  {
    "id": 388,
    "name": "Croquete, de carne, frito",
    "group": "",
    "kcal": 346.74,
    "p": 16.86,
    "c": 18.15,
    "f": 22.67,
    "fiber": null
  },
  {
    "id": 389,
    "name": "Empada de frango, pré-cozida, assada",
    "group": "",
    "kcal": 358.19,
    "p": 6.94,
    "c": 47.49,
    "f": 15.61,
    "fiber": 2.16
  },
  {
    "id": 390,
    "name": "Empada, de frango, pré-cozida",
    "group": "",
    "kcal": 377.48,
    "p": 7.34,
    "c": 35.53,
    "f": 22.89,
    "fiber": 2.22
  },
  {
    "id": 391,
    "name": "Frango, asa, com pele, crua",
    "group": "",
    "kcal": 213.19,
    "p": 18.1,
    "c": 0,
    "f": 15.07,
    "fiber": null
  },
  {
    "id": 392,
    "name": "Frango, caipira, inteiro, com pele, cozido",
    "group": "",
    "kcal": 242.89,
    "p": 23.88,
    "c": 0,
    "f": 15.62,
    "fiber": null
  },
  {
    "id": 393,
    "name": "Frango, caipira, inteiro, sem pele, cozido",
    "group": "",
    "kcal": 195.76,
    "p": 29.58,
    "c": 0,
    "f": 7.7,
    "fiber": null
  },
  {
    "id": 394,
    "name": "Frango, coração, cru",
    "group": "",
    "kcal": 221.5,
    "p": 12.58,
    "c": 0,
    "f": 18.6,
    "fiber": null
  },
  {
    "id": 395,
    "name": "Frango, coração, grelhado",
    "group": "",
    "kcal": 207.27,
    "p": 22.44,
    "c": 0.61,
    "f": 12.1,
    "fiber": null
  },
  {
    "id": 396,
    "name": "Frango, coxa, com pele, assada",
    "group": "",
    "kcal": 215.12,
    "p": 28.49,
    "c": 0.06,
    "f": 10.36,
    "fiber": null
  },
  {
    "id": 397,
    "name": "Frango, coxa, com pele, crua",
    "group": "",
    "kcal": 161.47,
    "p": 17.09,
    "c": 0,
    "f": 9.81,
    "fiber": null
  },
  {
    "id": 398,
    "name": "Frango, coxa, sem pele, cozida",
    "group": "",
    "kcal": 167.43,
    "p": 26.86,
    "c": 0,
    "f": 5.85,
    "fiber": null
  },
  {
    "id": 399,
    "name": "Frango, coxa, sem pele, crua",
    "group": "",
    "kcal": 119.95,
    "p": 17.81,
    "c": 0.02,
    "f": 4.86,
    "fiber": null
  },
  {
    "id": 400,
    "name": "Frango, fígado, cru",
    "group": "",
    "kcal": 106.48,
    "p": 17.59,
    "c": -0.02,
    "f": 3.49,
    "fiber": null
  },
  {
    "id": 401,
    "name": "Frango, filé, à milanesa",
    "group": "",
    "kcal": 220.87,
    "p": 28.46,
    "c": 7.51,
    "f": 7.79,
    "fiber": 1.13
  },
  {
    "id": 402,
    "name": "Frango, inteiro, com pele, cru",
    "group": "",
    "kcal": 226.32,
    "p": 16.44,
    "c": 0,
    "f": 17.31,
    "fiber": null
  },
  {
    "id": 403,
    "name": "Frango, inteiro, sem pele, assado",
    "group": "",
    "kcal": 187.34,
    "p": 28.03,
    "c": 0,
    "f": 7.5,
    "fiber": null
  },
  {
    "id": 404,
    "name": "Frango, inteiro, sem pele, cozido",
    "group": "",
    "kcal": 170.39,
    "p": 24.99,
    "c": 0,
    "f": 7.06,
    "fiber": null
  },
  {
    "id": 405,
    "name": "Frango, inteiro, sem pele, cru",
    "group": "",
    "kcal": 129.1,
    "p": 20.59,
    "c": 0,
    "f": 4.57,
    "fiber": null
  },
  {
    "id": 406,
    "name": "Frango, peito, com pele, assado",
    "group": "",
    "kcal": 211.68,
    "p": 33.42,
    "c": 0,
    "f": 7.65,
    "fiber": null
  },
  {
    "id": 407,
    "name": "Frango, peito, com pele, cru",
    "group": "",
    "kcal": 149.47,
    "p": 20.78,
    "c": 0,
    "f": 6.73,
    "fiber": null
  },
  {
    "id": 408,
    "name": "Frango, peito, sem pele, cozido",
    "group": "",
    "kcal": 162.87,
    "p": 31.47,
    "c": 0,
    "f": 3.16,
    "fiber": null
  },
  {
    "id": 409,
    "name": "Frango, peito, sem pele, cru",
    "group": "",
    "kcal": 119.16,
    "p": 21.53,
    "c": 0,
    "f": 3.02,
    "fiber": null
  },
  {
    "id": 410,
    "name": "Frango, peito, sem pele, grelhado",
    "group": "",
    "kcal": 159.19,
    "p": 32.03,
    "c": 0,
    "f": 2.48,
    "fiber": null
  },
  {
    "id": 411,
    "name": "Frango, sobrecoxa, com pele, assada",
    "group": "",
    "kcal": 259.6,
    "p": 28.7,
    "c": 0,
    "f": 15.19,
    "fiber": null
  },
  {
    "id": 412,
    "name": "Frango, sobrecoxa, com pele, crua",
    "group": "",
    "kcal": 254.53,
    "p": 15.46,
    "c": 0,
    "f": 20.9,
    "fiber": null
  },
  {
    "id": 413,
    "name": "Frango, sobrecoxa, sem pele, assada",
    "group": "",
    "kcal": 232.88,
    "p": 29.18,
    "c": 0,
    "f": 12.01,
    "fiber": null
  },
  {
    "id": 414,
    "name": "Frango, sobrecoxa, sem pele, crua",
    "group": "",
    "kcal": 161.8,
    "p": 17.57,
    "c": 0,
    "f": 9.62,
    "fiber": null
  },
  {
    "id": 415,
    "name": "Hambúrguer, bovino, cru",
    "group": "",
    "kcal": 214.84,
    "p": 13.16,
    "c": 4.15,
    "f": 16.18,
    "fiber": null
  },
  {
    "id": 416,
    "name": "Hambúrguer, bovino, frito",
    "group": "",
    "kcal": 258.28,
    "p": 19.97,
    "c": 6.32,
    "f": 17.01,
    "fiber": null
  },
  {
    "id": 417,
    "name": "Hambúrguer, bovino, grelhado",
    "group": "",
    "kcal": 209.83,
    "p": 13.16,
    "c": 11.33,
    "f": 12.43,
    "fiber": null
  },
  {
    "id": 418,
    "name": "Lingüiça, frango, crua",
    "group": "",
    "kcal": 218.11,
    "p": 14.24,
    "c": 0,
    "f": 17.44,
    "fiber": null
  },
  {
    "id": 419,
    "name": "Lingüiça, frango, frita",
    "group": "",
    "kcal": 245.46,
    "p": 18.32,
    "c": 0,
    "f": 18.54,
    "fiber": null
  },
  {
    "id": 420,
    "name": "Lingüiça, frango, grelhada",
    "group": "",
    "kcal": 243.66,
    "p": 18.19,
    "c": 0,
    "f": 18.4,
    "fiber": null
  },
  {
    "id": 421,
    "name": "Lingüiça, porco, crua",
    "group": "",
    "kcal": 227.2,
    "p": 16.06,
    "c": 0,
    "f": 17.58,
    "fiber": null
  },
  {
    "id": 422,
    "name": "Lingüiça, porco, frita",
    "group": "",
    "kcal": 279.54,
    "p": 20.45,
    "c": 0,
    "f": 21.31,
    "fiber": null
  },
  {
    "id": 423,
    "name": "Lingüiça, porco, grelhada",
    "group": "",
    "kcal": 296.49,
    "p": 23.17,
    "c": 0,
    "f": 21.9,
    "fiber": null
  },
  {
    "id": 424,
    "name": "Mortadela",
    "group": "",
    "kcal": 268.82,
    "p": 11.95,
    "c": 5.82,
    "f": 21.65,
    "fiber": null
  },
  {
    "id": 425,
    "name": "Peru, congelado, assado",
    "group": "",
    "kcal": 163.07,
    "p": 26.2,
    "c": 0,
    "f": 5.68,
    "fiber": null
  },
  {
    "id": 426,
    "name": "Peru, congelado, cru",
    "group": "",
    "kcal": 93.72,
    "p": 18.08,
    "c": 0,
    "f": 1.83,
    "fiber": null
  },
  {
    "id": 427,
    "name": "Porco, bisteca, crua",
    "group": "",
    "kcal": 164.12,
    "p": 21.5,
    "c": 0,
    "f": 8.02,
    "fiber": null
  },
  {
    "id": 428,
    "name": "Porco, bisteca, frita",
    "group": "",
    "kcal": 311.17,
    "p": 33.75,
    "c": 0,
    "f": 18.52,
    "fiber": null
  },
  {
    "id": 429,
    "name": "Porco, bisteca, grelhada",
    "group": "",
    "kcal": 280.08,
    "p": 28.89,
    "c": 0,
    "f": 17.38,
    "fiber": null
  },
  {
    "id": 430,
    "name": "Porco, costela, assada",
    "group": "",
    "kcal": 402.17,
    "p": 30.22,
    "c": 0,
    "f": 30.28,
    "fiber": null
  },
  {
    "id": 431,
    "name": "Porco, costela, crua",
    "group": "",
    "kcal": 255.61,
    "p": 18,
    "c": 0,
    "f": 19.82,
    "fiber": null
  },
  {
    "id": 432,
    "name": "Porco, lombo, assado",
    "group": "",
    "kcal": 210.23,
    "p": 35.73,
    "c": 0,
    "f": 6.4,
    "fiber": null
  },
  {
    "id": 433,
    "name": "Porco, lombo, cru",
    "group": "",
    "kcal": 175.63,
    "p": 22.6,
    "c": 0,
    "f": 8.77,
    "fiber": null
  },
  {
    "id": 434,
    "name": "Porco, orelha, salgada, crua",
    "group": "",
    "kcal": 258.49,
    "p": 18.52,
    "c": 0,
    "f": 19.89,
    "fiber": null
  },
  {
    "id": 435,
    "name": "Porco, pernil, assado",
    "group": "",
    "kcal": 262.26,
    "p": 32.13,
    "c": 0,
    "f": 13.86,
    "fiber": null
  },
  {
    "id": 436,
    "name": "Porco, pernil, cru",
    "group": "",
    "kcal": 186.06,
    "p": 20.13,
    "c": 0,
    "f": 11.1,
    "fiber": null
  },
  {
    "id": 437,
    "name": "Porco, rabo, salgado, cru",
    "group": "",
    "kcal": 377.42,
    "p": 15.58,
    "c": 0,
    "f": 34.47,
    "fiber": null
  },
  {
    "id": 438,
    "name": "Presunto, com capa de gordura",
    "group": "",
    "kcal": 127.85,
    "p": 14.37,
    "c": 1.4,
    "f": 6.77,
    "fiber": null
  },
  {
    "id": 439,
    "name": "Presunto, sem capa de gordura",
    "group": "",
    "kcal": 93.74,
    "p": 14.29,
    "c": 2.15,
    "f": 2.71,
    "fiber": null
  },
  {
    "id": 440,
    "name": "Quibe, assado",
    "group": "",
    "kcal": 136.23,
    "p": 14.59,
    "c": 12.86,
    "f": 2.68,
    "fiber": 1.9
  },
  {
    "id": 441,
    "name": "Quibe, cru",
    "group": "",
    "kcal": 109.49,
    "p": 12.35,
    "c": 10.77,
    "f": 1.67,
    "fiber": 1.65
  },
  {
    "id": 442,
    "name": "Quibe, frito",
    "group": "",
    "kcal": 253.83,
    "p": 14.89,
    "c": 12.34,
    "f": 15.8,
    "fiber": null
  },
  {
    "id": 443,
    "name": "Salame",
    "group": "",
    "kcal": 397.84,
    "p": 25.81,
    "c": 2.91,
    "f": 30.64,
    "fiber": null
  },
  {
    "id": 444,
    "name": "Toucinho, cru",
    "group": "",
    "kcal": 592.53,
    "p": 11.48,
    "c": 0,
    "f": 60.26,
    "fiber": null
  },
  {
    "id": 445,
    "name": "Toucinho, frito",
    "group": "",
    "kcal": 696.56,
    "p": 27.28,
    "c": 0,
    "f": 64.31,
    "fiber": null
  },
  {
    "id": 446,
    "name": "Bebida láctea, pêssego",
    "group": "",
    "kcal": 55.16,
    "p": 2.13,
    "c": 7.57,
    "f": 1.91,
    "fiber": 0.29
  },
  {
    "id": 447,
    "name": "Creme de Leite",
    "group": "",
    "kcal": 221.48,
    "p": 1.51,
    "c": 4.51,
    "f": 22.48,
    "fiber": null
  },
  {
    "id": 448,
    "name": "Iogurte, natural",
    "group": "",
    "kcal": 51.49,
    "p": 4.06,
    "c": 1.92,
    "f": 3.04,
    "fiber": null
  },
  {
    "id": 449,
    "name": "Iogurte, natural, desnatado",
    "group": "",
    "kcal": 41.49,
    "p": 3.83,
    "c": 5.77,
    "f": 0.32,
    "fiber": null
  },
  {
    "id": 451,
    "name": "Iogurte, sabor morango",
    "group": "",
    "kcal": 69.57,
    "p": 2.71,
    "c": 9.69,
    "f": 2.33,
    "fiber": 0.22
  },
  {
    "id": 452,
    "name": "Iogurte, sabor pêssego",
    "group": "",
    "kcal": 67.85,
    "p": 2.53,
    "c": 9.43,
    "f": 2.34,
    "fiber": 0.72
  },
  {
    "id": 453,
    "name": "Leite, condensado",
    "group": "",
    "kcal": 312.57,
    "p": 7.67,
    "c": 57,
    "f": 6.74,
    "fiber": null
  },
  {
    "id": 454,
    "name": "Leite, de cabra",
    "group": "",
    "kcal": 66.42,
    "p": 3.07,
    "c": 5.25,
    "f": 3.75,
    "fiber": null
  },
  {
    "id": 455,
    "name": "Leite, de vaca, achocolatado",
    "group": "",
    "kcal": 82.82,
    "p": 2.1,
    "c": 14.16,
    "f": 2.17,
    "fiber": 0.65
  },
  {
    "id": 456,
    "name": "Leite, de vaca, desnatado, pó",
    "group": "",
    "kcal": 361.61,
    "p": 34.69,
    "c": 53.04,
    "f": 0.93,
    "fiber": null
  },
  {
    "id": 459,
    "name": "Leite, de vaca, integral, pó",
    "group": "",
    "kcal": 496.65,
    "p": 25.42,
    "c": 39.18,
    "f": 26.9,
    "fiber": null
  },
  {
    "id": 460,
    "name": "Leite, fermentado",
    "group": "",
    "kcal": 69.62,
    "p": 1.89,
    "c": 15.67,
    "f": 0.1,
    "fiber": null
  },
  {
    "id": 461,
    "name": "Queijo, minas, frescal",
    "group": "",
    "kcal": 264.27,
    "p": 17.41,
    "c": 3.24,
    "f": 20.18,
    "fiber": null
  },
  {
    "id": 462,
    "name": "Queijo, minas, meia cura",
    "group": "",
    "kcal": 320.72,
    "p": 21.21,
    "c": 3.57,
    "f": 24.61,
    "fiber": null
  },
  {
    "id": 463,
    "name": "Queijo, mozarela",
    "group": "",
    "kcal": 329.87,
    "p": 22.65,
    "c": 3.05,
    "f": 25.18,
    "fiber": null
  },
  {
    "id": 464,
    "name": "Queijo, parmesão",
    "group": "",
    "kcal": 452.96,
    "p": 35.55,
    "c": 1.66,
    "f": 33.53,
    "fiber": null
  },
  {
    "id": 465,
    "name": "Queijo, pasteurizado",
    "group": "",
    "kcal": 303.08,
    "p": 9.36,
    "c": 5.68,
    "f": 27.44,
    "fiber": null
  },
  {
    "id": 466,
    "name": "Queijo, petit suisse, morango",
    "group": "",
    "kcal": 121.11,
    "p": 5.79,
    "c": 18.46,
    "f": 2.84,
    "fiber": null
  },
  {
    "id": 467,
    "name": "Queijo, prato",
    "group": "",
    "kcal": 359.88,
    "p": 22.66,
    "c": 1.88,
    "f": 29.11,
    "fiber": null
  },
  {
    "id": 468,
    "name": "Queijo, requeijão, cremoso",
    "group": "",
    "kcal": 256.58,
    "p": 9.63,
    "c": 2.43,
    "f": 23.44,
    "fiber": null
  },
  {
    "id": 469,
    "name": "Queijo, ricota",
    "group": "",
    "kcal": 139.73,
    "p": 12.6,
    "c": 3.79,
    "f": 8.11,
    "fiber": null
  },
  {
    "id": 470,
    "name": "Bebida isotônica, sabores variados",
    "group": "",
    "kcal": 25.61,
    "p": 0,
    "c": 6.4,
    "f": 0,
    "fiber": null
  },
  {
    "id": 471,
    "name": "Café, infusão 10%",
    "group": "",
    "kcal": 9.07,
    "p": 0.71,
    "c": 1.48,
    "f": 0.07,
    "fiber": null
  },
  {
    "id": 472,
    "name": "Cana, aguardente 1",
    "group": "",
    "kcal": 215.66,
    "p": null,
    "c": null,
    "f": null,
    "fiber": null
  },
  {
    "id": 473,
    "name": "Cana, caldo de",
    "group": "",
    "kcal": 65.34,
    "p": null,
    "c": 18.15,
    "f": null,
    "fiber": 0.14
  },
  {
    "id": 474,
    "name": "Cerveja, pilsen 2",
    "group": "",
    "kcal": 40.72,
    "p": 0.56,
    "c": 3.32,
    "f": null,
    "fiber": null
  },
  {
    "id": 475,
    "name": "Chá, erva-doce, infusão 5%",
    "group": "",
    "kcal": 1.4,
    "p": 0,
    "c": 0.39,
    "f": 0,
    "fiber": null
  },
  {
    "id": 476,
    "name": "Chá, mate, infusão 5%",
    "group": "",
    "kcal": 2.73,
    "p": 0,
    "c": 0.64,
    "f": 0.05,
    "fiber": null
  },
  {
    "id": 477,
    "name": "Chá, preto, infusão 5%",
    "group": "",
    "kcal": 2.25,
    "p": 0,
    "c": 0.63,
    "f": 0,
    "fiber": null
  },
  {
    "id": 478,
    "name": "Coco, água de",
    "group": "",
    "kcal": 21.51,
    "p": 0,
    "c": 5.28,
    "f": 0,
    "fiber": 0.13
  },
  {
    "id": 479,
    "name": "Refrigerante, tipo água tônica",
    "group": "",
    "kcal": 30.78,
    "p": 0,
    "c": 7.95,
    "f": 0,
    "fiber": null
  },
  {
    "id": 480,
    "name": "Refrigerante, tipo cola",
    "group": "",
    "kcal": 33.51,
    "p": 0,
    "c": 8.66,
    "f": 0,
    "fiber": null
  },
  {
    "id": 481,
    "name": "Refrigerante, tipo guaraná",
    "group": "",
    "kcal": 38.7,
    "p": 0,
    "c": 10,
    "f": 0,
    "fiber": null
  },
  {
    "id": 482,
    "name": "Refrigerante, tipo laranja",
    "group": "",
    "kcal": 45.63,
    "p": 0,
    "c": 11.79,
    "f": 0,
    "fiber": null
  },
  {
    "id": 483,
    "name": "Refrigerante, tipo limão",
    "group": "",
    "kcal": 39.72,
    "p": 0,
    "c": 10.26,
    "f": 0,
    "fiber": null
  },
  {
    "id": 484,
    "name": "Omelete, de queijo",
    "group": "",
    "kcal": 268.01,
    "p": 15.57,
    "c": 0.44,
    "f": 22.01,
    "fiber": null
  },
  {
    "id": 485,
    "name": "Ovo, de codorna, inteiro, cru",
    "group": "",
    "kcal": 176.89,
    "p": 13.69,
    "c": 0.77,
    "f": 12.68,
    "fiber": null
  },
  {
    "id": 486,
    "name": "Ovo, de galinha, clara, cozida/10minutos",
    "group": "",
    "kcal": 59.44,
    "p": 13.45,
    "c": 0,
    "f": 0.09,
    "fiber": null
  },
  {
    "id": 487,
    "name": "Ovo, de galinha, gema, cozida/10minutos",
    "group": "",
    "kcal": 352.67,
    "p": 15.9,
    "c": 1.56,
    "f": 30.78,
    "fiber": null
  },
  {
    "id": 488,
    "name": "Ovo, de galinha, inteiro, cozido/10minutos",
    "group": "",
    "kcal": 145.7,
    "p": 13.29,
    "c": 0.61,
    "f": 9.48,
    "fiber": null
  },
  {
    "id": 489,
    "name": "Ovo, de galinha, inteiro, cru",
    "group": "",
    "kcal": 143.11,
    "p": 13.03,
    "c": 1.64,
    "f": 8.9,
    "fiber": null
  },
  {
    "id": 490,
    "name": "Ovo, de galinha, inteiro, frito",
    "group": "",
    "kcal": 240.19,
    "p": 15.62,
    "c": 1.19,
    "f": 18.59,
    "fiber": null
  },
  {
    "id": 491,
    "name": "Achocolatado, pó",
    "group": "",
    "kcal": 401.02,
    "p": 4.2,
    "c": 91.18,
    "f": 2.17,
    "fiber": 3.89
  },
  {
    "id": 492,
    "name": "Açúcar, cristal",
    "group": "",
    "kcal": 386.85,
    "p": 0.32,
    "c": 99.61,
    "f": null,
    "fiber": null
  },
  {
    "id": 493,
    "name": "Açúcar, mascavo",
    "group": "",
    "kcal": 368.55,
    "p": 0.76,
    "c": 94.45,
    "f": 0.09,
    "fiber": null
  },
  {
    "id": 494,
    "name": "Açúcar, refinado",
    "group": "",
    "kcal": 386.57,
    "p": 0.32,
    "c": 99.54,
    "f": null,
    "fiber": null
  },
  {
    "id": 495,
    "name": "Chocolate, ao leite",
    "group": "",
    "kcal": 539.59,
    "p": 7.22,
    "c": 59.58,
    "f": 30.27,
    "fiber": 2.17
  },
  {
    "id": 496,
    "name": "Chocolate, ao leite, com castanha do Pará",
    "group": "",
    "kcal": 558.88,
    "p": 7.41,
    "c": 55.38,
    "f": 34.19,
    "fiber": 2.46
  },
  {
    "id": 497,
    "name": "Chocolate, ao leite, dietético",
    "group": "",
    "kcal": 556.82,
    "p": 6.9,
    "c": 56.32,
    "f": 33.77,
    "fiber": 2.85
  },
  {
    "id": 498,
    "name": "Chocolate, meio amargo",
    "group": "",
    "kcal": 474.92,
    "p": 4.86,
    "c": 62.42,
    "f": 29.86,
    "fiber": 4.94
  },
  {
    "id": 499,
    "name": "Cocada branca",
    "group": "",
    "kcal": 448.85,
    "p": 1.12,
    "c": 81.38,
    "f": 13.59,
    "fiber": 3.57
  },
  {
    "id": 500,
    "name": "Doce, de abóbora, cremoso",
    "group": "",
    "kcal": 198.94,
    "p": 0.92,
    "c": 54.61,
    "f": 0.21,
    "fiber": 2.28
  },
  {
    "id": 501,
    "name": "Doce, de leite, cremoso",
    "group": "",
    "kcal": 306.31,
    "p": 5.48,
    "c": 59.49,
    "f": 5.99,
    "fiber": null
  },
  {
    "id": 502,
    "name": "Geléia, mocotó, natural",
    "group": "",
    "kcal": 106.09,
    "p": 2.13,
    "c": 24.23,
    "f": 0.07,
    "fiber": null
  },
  {
    "id": 503,
    "name": "Glicose de milho",
    "group": "",
    "kcal": 292.12,
    "p": 0,
    "c": 79.38,
    "f": 0,
    "fiber": null
  },
  {
    "id": 504,
    "name": "Maria mole",
    "group": "",
    "kcal": 301.24,
    "p": 3.81,
    "c": 73.55,
    "f": 0.19,
    "fiber": 0.67
  },
  {
    "id": 505,
    "name": "Maria mole, coco queimado",
    "group": "",
    "kcal": 306.63,
    "p": 3.93,
    "c": 75.06,
    "f": 0.09,
    "fiber": 0.64
  },
  {
    "id": 506,
    "name": "Marmelada",
    "group": "",
    "kcal": 257.24,
    "p": 0.4,
    "c": 70.76,
    "f": 0.14,
    "fiber": 4.07
  },
  {
    "id": 507,
    "name": "Mel, de abelha",
    "group": "",
    "kcal": 309.24,
    "p": 0,
    "c": 84.03,
    "f": 0,
    "fiber": null
  },
  {
    "id": 508,
    "name": "Melado",
    "group": "",
    "kcal": 296.51,
    "p": 0,
    "c": 76.62,
    "f": 0,
    "fiber": null
  },
  {
    "id": 509,
    "name": "Quindim",
    "group": "",
    "kcal": 411.35,
    "p": 4.74,
    "c": 46.3,
    "f": 24.43,
    "fiber": 3.22
  },
  {
    "id": 510,
    "name": "Rapadura",
    "group": "",
    "kcal": 351.96,
    "p": 0.99,
    "c": 90.79,
    "f": 0.07,
    "fiber": null
  },
  {
    "id": 511,
    "name": "Café, pó, torrado",
    "group": "",
    "kcal": 418.62,
    "p": 14.7,
    "c": 65.75,
    "f": 11.95,
    "fiber": 51.23
  },
  {
    "id": 512,
    "name": "Capuccino, pó",
    "group": "",
    "kcal": 417.41,
    "p": 11.31,
    "c": 73.61,
    "f": 8.63,
    "fiber": 2.44
  },
  {
    "id": 513,
    "name": "Fermento em pó, químico",
    "group": "",
    "kcal": 89.72,
    "p": 0.48,
    "c": 43.91,
    "f": 0.07,
    "fiber": null
  },
  {
    "id": 514,
    "name": "Fermento, biológico, levedura, tablete",
    "group": "",
    "kcal": 89.79,
    "p": 16.96,
    "c": 7.7,
    "f": 1.52,
    "fiber": 4.17
  },
  {
    "id": 515,
    "name": "Gelatina, sabores variados, pó",
    "group": "",
    "kcal": 380.22,
    "p": 8.89,
    "c": 89.22,
    "f": null,
    "fiber": null
  },
  {
    "id": 518,
    "name": "Shoyu",
    "group": "",
    "kcal": 60.93,
    "p": 3.31,
    "c": 11.65,
    "f": 0.33,
    "fiber": null
  },
  {
    "id": 519,
    "name": "Tempero a base de sal",
    "group": "",
    "kcal": 21.33,
    "p": 2.67,
    "c": 2.07,
    "f": 0.26,
    "fiber": 0.56
  },
  {
    "id": 520,
    "name": "Azeitona, preta, conserva",
    "group": "",
    "kcal": 194.15,
    "p": 1.16,
    "c": 5.54,
    "f": 20.35,
    "fiber": 4.56
  },
  {
    "id": 521,
    "name": "Azeitona, verde, conserva",
    "group": "",
    "kcal": 136.94,
    "p": 0.95,
    "c": 4.1,
    "f": 14.22,
    "fiber": 3.85
  },
  {
    "id": 522,
    "name": "Chantilly, spray, com gordura vegetal",
    "group": "",
    "kcal": 314.96,
    "p": 0.53,
    "c": 16.86,
    "f": 27.27,
    "fiber": null
  },
  {
    "id": 523,
    "name": "Leite, de coco",
    "group": "",
    "kcal": 166.16,
    "p": 1.01,
    "c": 2.19,
    "f": 18.36,
    "fiber": 0.68
  },
  {
    "id": 524,
    "name": "Maionese, tradicional com ovos",
    "group": "",
    "kcal": 302.15,
    "p": 0.58,
    "c": 7.9,
    "f": 30.5,
    "fiber": null
  },
  {
    "id": 525,
    "name": "Acarajé",
    "group": "",
    "kcal": 289.21,
    "p": 8.35,
    "c": 19.11,
    "f": 19.93,
    "fiber": 9.36
  },
  {
    "id": 526,
    "name": "Arroz carreteiro",
    "group": "",
    "kcal": 153.77,
    "p": 10.83,
    "c": 11.58,
    "f": 7.12,
    "fiber": 1.5
  },
  {
    "id": 527,
    "name": "Baião de dois, arroz e feijão-de-corda",
    "group": "",
    "kcal": 135.68,
    "p": 6.24,
    "c": 20.42,
    "f": 3.23,
    "fiber": 5.07
  },
  {
    "id": 528,
    "name": "Barreado",
    "group": "",
    "kcal": 164.98,
    "p": 18.27,
    "c": 0.24,
    "f": 9.53,
    "fiber": 0.15
  },
  {
    "id": 529,
    "name": "Bife à cavalo, com contra filé",
    "group": "",
    "kcal": 291.23,
    "p": 23.66,
    "c": 0,
    "f": 21.15,
    "fiber": null
  },
  {
    "id": 530,
    "name": "Bolinho de arroz",
    "group": "",
    "kcal": 273.51,
    "p": 8.04,
    "c": 41.68,
    "f": 8.29,
    "fiber": 2.74
  },
  {
    "id": 531,
    "name": "Camarão à baiana",
    "group": "",
    "kcal": 100.78,
    "p": 7.94,
    "c": 3.17,
    "f": 5.97,
    "fiber": 0.39
  },
  {
    "id": 532,
    "name": "Charuto, de repolho",
    "group": "",
    "kcal": 78.23,
    "p": 6.78,
    "c": 10.13,
    "f": 1.12,
    "fiber": 1.46
  },
  {
    "id": 533,
    "name": "Cuscuz, de milho, cozido com sal",
    "group": "",
    "kcal": 113.46,
    "p": 2.16,
    "c": 25.28,
    "f": 0.68,
    "fiber": 2.05
  },
  {
    "id": 534,
    "name": "Cuscuz, paulista",
    "group": "",
    "kcal": 142.12,
    "p": 2.56,
    "c": 22.51,
    "f": 4.65,
    "fiber": 2.43
  },
  {
    "id": 535,
    "name": "Cuxá, molho",
    "group": "",
    "kcal": 80.09,
    "p": 5.64,
    "c": 5.74,
    "f": 3.59,
    "fiber": 3.02
  },
  {
    "id": 536,
    "name": "Dobradinha",
    "group": "",
    "kcal": 124.5,
    "p": 19.77,
    "c": 0,
    "f": 4.44,
    "fiber": null
  },
  {
    "id": 537,
    "name": "Estrogonofe de carne",
    "group": "",
    "kcal": 173.14,
    "p": 15.03,
    "c": 2.98,
    "f": 10.8,
    "fiber": null
  },
  {
    "id": 538,
    "name": "Estrogonofe de frango",
    "group": "",
    "kcal": 156.81,
    "p": 17.55,
    "c": 2.59,
    "f": 7.96,
    "fiber": null
  },
  {
    "id": 539,
    "name": "Feijão tropeiro mineiro",
    "group": "",
    "kcal": 151.56,
    "p": 10.17,
    "c": 19.58,
    "f": 6.79,
    "fiber": 3.57
  },
  {
    "id": 540,
    "name": "L",
    "group": "",
    "kcal": 116.93,
    "p": 8.67,
    "c": 11.64,
    "f": 6.48,
    "fiber": 5.09
  },
  {
    "id": 541,
    "name": "Frango, com açafrão",
    "group": "",
    "kcal": 112.78,
    "p": 9.7,
    "c": 4.06,
    "f": 6.17,
    "fiber": 0.22
  },
  {
    "id": 542,
    "name": "Macarrão, molho bolognesa",
    "group": "",
    "kcal": 119.53,
    "p": 4.93,
    "c": 22.52,
    "f": 0.89,
    "fiber": 0.78
  },
  {
    "id": 543,
    "name": "Maniçoba",
    "group": "",
    "kcal": 134.22,
    "p": 9.96,
    "c": 3.42,
    "f": 8.7,
    "fiber": 2.16
  },
  {
    "id": 544,
    "name": "Quibebe",
    "group": "",
    "kcal": 86.35,
    "p": 8.56,
    "c": 6.64,
    "f": 2.67,
    "fiber": 1.67
  },
  {
    "id": 545,
    "name": "Salada, de legumes, com maionese",
    "group": "",
    "kcal": 96.1,
    "p": 1.05,
    "c": 8.92,
    "f": 7.04,
    "fiber": 2.22
  },
  {
    "id": 546,
    "name": "Salada, de legumes, cozida no vapor",
    "group": "",
    "kcal": 35.41,
    "p": 2.01,
    "c": 7.09,
    "f": 0.31,
    "fiber": 2.51
  },
  {
    "id": 547,
    "name": "Salpicão, de frango",
    "group": "",
    "kcal": 147.86,
    "p": 13.93,
    "c": 4.57,
    "f": 7.84,
    "fiber": 0.41
  },
  {
    "id": 548,
    "name": "Sarapatel",
    "group": "",
    "kcal": 122.98,
    "p": 18.47,
    "c": 1.09,
    "f": 4.42,
    "fiber": null
  },
  {
    "id": 549,
    "name": "Tabule",
    "group": "",
    "kcal": 57.45,
    "p": 2.05,
    "c": 10.58,
    "f": 1.21,
    "fiber": 2.08
  },
  {
    "id": 550,
    "name": "Tacacá",
    "group": "",
    "kcal": 46.89,
    "p": 6.96,
    "c": 3.39,
    "f": 0.36,
    "fiber": 0.21
  },
  {
    "id": 551,
    "name": "Tapioca, com manteiga",
    "group": "",
    "kcal": 347.83,
    "p": 0.09,
    "c": 63.59,
    "f": 10.91,
    "fiber": null
  },
  {
    "id": 552,
    "name": "Tucupi, com pimenta-de-cheiro",
    "group": "",
    "kcal": 27.18,
    "p": 2.06,
    "c": 4.74,
    "f": 0.28,
    "fiber": 0.23
  },
  {
    "id": 553,
    "name": "Vaca atolada",
    "group": "",
    "kcal": 144.9,
    "p": 5.12,
    "c": 10.06,
    "f": 9.32,
    "fiber": 2.34
  },
  {
    "id": 554,
    "name": "Vatapá",
    "group": "",
    "kcal": 254.89,
    "p": 6,
    "c": 9.75,
    "f": 23.23,
    "fiber": 1.7
  },
  {
    "id": 555,
    "name": "Virado à paulista",
    "group": "",
    "kcal": 306.95,
    "p": 10.18,
    "c": 14.11,
    "f": 25.59,
    "fiber": 2.16
  },
  {
    "id": 556,
    "name": "Yakisoba",
    "group": "",
    "kcal": 112.8,
    "p": 7.52,
    "c": 18.25,
    "f": 2.61,
    "fiber": 1.06
  },
  {
    "id": 557,
    "name": "Amendoim, grão, cru",
    "group": "",
    "kcal": 544.05,
    "p": 27.19,
    "c": 20.31,
    "f": 43.85,
    "fiber": 8.04
  },
  {
    "id": 558,
    "name": "Amendoim, torrado, salgado",
    "group": "",
    "kcal": 605.78,
    "p": 22.48,
    "c": 18.7,
    "f": 53.96,
    "fiber": 7.76
  },
  {
    "id": 559,
    "name": "Ervilha, em vagem",
    "group": "",
    "kcal": 88.09,
    "p": 7.45,
    "c": 14.23,
    "f": 0.47,
    "fiber": 9.72
  },
  {
    "id": 560,
    "name": "Ervilha, enlatada, drenada",
    "group": "",
    "kcal": 73.84,
    "p": 4.6,
    "c": 13.44,
    "f": 0.38,
    "fiber": 5.08
  },
  {
    "id": 561,
    "name": "Feijão, carioca, cozido",
    "group": "",
    "kcal": 76.42,
    "p": 4.78,
    "c": 13.59,
    "f": 0.54,
    "fiber": 8.51
  },
  {
    "id": 562,
    "name": "Feijão, carioca, cru",
    "group": "",
    "kcal": 329.03,
    "p": 19.98,
    "c": 61.22,
    "f": 1.26,
    "fiber": 18.42
  },
  {
    "id": 563,
    "name": "Feijão, fradinho, cozido",
    "group": "",
    "kcal": 78.01,
    "p": 5.09,
    "c": 13.5,
    "f": 0.64,
    "fiber": 7.47
  },
  {
    "id": 564,
    "name": "Feijão, fradinho, cru",
    "group": "",
    "kcal": 339.16,
    "p": 20.21,
    "c": 61.24,
    "f": 2.37,
    "fiber": 23.59
  },
  {
    "id": 565,
    "name": "Feijão, jalo, cozido",
    "group": "",
    "kcal": 92.74,
    "p": 6.14,
    "c": 16.5,
    "f": 0.51,
    "fiber": 13.87
  },
  {
    "id": 566,
    "name": "Feijão, jalo, cru",
    "group": "",
    "kcal": 327.91,
    "p": 20.1,
    "c": 61.48,
    "f": 0.95,
    "fiber": 30.32
  },
  {
    "id": 567,
    "name": "Feijão, preto, cozido",
    "group": "",
    "kcal": 77.03,
    "p": 4.48,
    "c": 14.01,
    "f": 0.54,
    "fiber": 8.4
  },
  {
    "id": 568,
    "name": "Feijão, preto, cru",
    "group": "",
    "kcal": 323.57,
    "p": 21.34,
    "c": 58.75,
    "f": 1.24,
    "fiber": 21.83
  },
  {
    "id": 569,
    "name": "Feijão, rajado, cozido",
    "group": "",
    "kcal": 84.7,
    "p": 5.54,
    "c": 15.27,
    "f": 0.4,
    "fiber": 9.32
  },
  {
    "id": 570,
    "name": "Feijão, rajado, cru",
    "group": "",
    "kcal": 325.84,
    "p": 17.27,
    "c": 62.93,
    "f": 1.17,
    "fiber": 24.01
  },
  {
    "id": 571,
    "name": "Feijão, rosinha, cozido",
    "group": "",
    "kcal": 67.87,
    "p": 4.54,
    "c": 11.82,
    "f": 0.48,
    "fiber": 4.76
  },
  {
    "id": 572,
    "name": "Feijão, rosinha, cru",
    "group": "",
    "kcal": 336.96,
    "p": 20.92,
    "c": 62.22,
    "f": 1.33,
    "fiber": 20.63
  },
  {
    "id": 573,
    "name": "Feijão, roxo, cozido",
    "group": "",
    "kcal": 76.89,
    "p": 5.72,
    "c": 12.91,
    "f": 0.54,
    "fiber": 11.51
  },
  {
    "id": 574,
    "name": "Feijão, roxo, cru",
    "group": "",
    "kcal": 331.41,
    "p": 22.17,
    "c": 59.99,
    "f": 1.24,
    "fiber": 33.84
  },
  {
    "id": 575,
    "name": "Grão-de-bico, cru",
    "group": "",
    "kcal": 354.7,
    "p": 21.23,
    "c": 57.88,
    "f": 5.43,
    "fiber": 12.36
  },
  {
    "id": 576,
    "name": "Guandu, cru",
    "group": "",
    "kcal": 344.13,
    "p": 18.96,
    "c": 64,
    "f": 2.13,
    "fiber": 21.31
  },
  {
    "id": 577,
    "name": "Lentilha, cozida",
    "group": "",
    "kcal": 92.64,
    "p": 6.31,
    "c": 16.3,
    "f": 0.52,
    "fiber": 7.86
  },
  {
    "id": 578,
    "name": "Lentilha, crua",
    "group": "",
    "kcal": 339.14,
    "p": 23.15,
    "c": 62,
    "f": 0.77,
    "fiber": 16.94
  },
  {
    "id": 579,
    "name": "Paçoca, amendoim",
    "group": "",
    "kcal": 486.93,
    "p": 16,
    "c": 52.38,
    "f": 26.08,
    "fiber": 7.32
  },
  {
    "id": 580,
    "name": "Pé-de-moleque, amendoim",
    "group": "",
    "kcal": 503.19,
    "p": 13.16,
    "c": 54.73,
    "f": 28.05,
    "fiber": 3.39
  },
  {
    "id": 581,
    "name": "Soja, farinha",
    "group": "",
    "kcal": 403.96,
    "p": 36.03,
    "c": 38.44,
    "f": 14.63,
    "fiber": 20.18
  },
  {
    "id": 582,
    "name": "Soja, extrato solúvel, natural, fluido",
    "group": "",
    "kcal": 39.1,
    "p": 2.38,
    "c": 4.28,
    "f": 1.61,
    "fiber": 0.37
  },
  {
    "id": 583,
    "name": "Soja, extrato solúvel, pó",
    "group": "",
    "kcal": 458.9,
    "p": 35.69,
    "c": 28.48,
    "f": 26.18,
    "fiber": 7.31
  },
  {
    "id": 584,
    "name": "Soja, queijo (tofu)",
    "group": "",
    "kcal": 64.49,
    "p": 6.55,
    "c": 2.13,
    "f": 3.95,
    "fiber": 0.75
  },
  {
    "id": 585,
    "name": "Tremoço, cru",
    "group": "",
    "kcal": 381.28,
    "p": 33.58,
    "c": 43.79,
    "f": 10.34,
    "fiber": 32.31
  },
  {
    "id": 586,
    "name": "Tremoço, em conserva",
    "group": "",
    "kcal": 120.64,
    "p": 11.11,
    "c": 12.39,
    "f": 3.78,
    "fiber": 14.44
  },
  {
    "id": 587,
    "name": "Amêndoa, torrada, salgada",
    "group": "",
    "kcal": 580.75,
    "p": 18.55,
    "c": 29.55,
    "f": 47.32,
    "fiber": 11.64
  },
  {
    "id": 588,
    "name": "Castanha-de-caju, torrada, salgada",
    "group": "",
    "kcal": 570.17,
    "p": 18.51,
    "c": 29.13,
    "f": 46.28,
    "fiber": 3.66
  },
  {
    "id": 589,
    "name": "Castanha-do-Brasil, crua",
    "group": "",
    "kcal": 642.96,
    "p": 14.54,
    "c": 15.08,
    "f": 63.46,
    "fiber": 7.93
  },
  {
    "id": 590,
    "name": "Coco, cru",
    "group": "",
    "kcal": 406.49,
    "p": 3.69,
    "c": 10.4,
    "f": 41.98,
    "fiber": 5.38
  },
  {
    "id": 592,
    "name": "Farinha, de mesocarpo de babaçu, crua",
    "group": "",
    "kcal": 328.77,
    "p": 1.41,
    "c": 79.17,
    "f": 0.2,
    "fiber": 17.86
  },
  {
    "id": 593,
    "name": "Gergelim, semente",
    "group": "",
    "kcal": 583.55,
    "p": 21.16,
    "c": 21.62,
    "f": 50.43,
    "fiber": 11.87
  },
  {
    "id": 594,
    "name": "Linhaça, semente",
    "group": "",
    "kcal": 495.1,
    "p": 14.08,
    "c": 43.31,
    "f": 32.25,
    "fiber": 33.5
  },
  {
    "id": 595,
    "name": "Pinhão, cozido",
    "group": "",
    "kcal": 174.37,
    "p": 2.98,
    "c": 43.92,
    "f": 0.75,
    "fiber": 15.6
  },
  {
    "id": 596,
    "name": "Pupunha, cozida",
    "group": "",
    "kcal": 218.53,
    "p": 2.52,
    "c": 29.57,
    "f": 12.76,
    "fiber": 4.25
  },
  {
    "id": 597,
    "name": "Noz, crua",
    "group": "",
    "kcal": 620.06,
    "p": 13.97,
    "c": 18.36,
    "f": 59.36,
    "fiber": 7.25
  }
];
