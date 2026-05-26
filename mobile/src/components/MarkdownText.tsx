// Renderizador de markdown minimalista pra mensagens da Lu.
// Suporta: **negrito**, *itálico*, listas com "- " ou "* ", quebras de linha,
// e mantém parágrafos com espaçamento. Não pretende ser CommonMark completo —
// foca no que o LLM costuma usar em respostas curtas.

import React from 'react';
import { View, Text, type TextStyle, type StyleProp } from 'react-native';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
  /** Estilo extra aplicado a partes em **negrito**. */
  boldStyle?: StyleProp<TextStyle>;
};

// Quebra um trecho de uma linha em partes [normal, bold, normal, bold, ...] usando **
function splitBold(text: string): Array<{ bold: boolean; text: string }> {
  const out: Array<{ bold: boolean; text: string }> = [];
  const parts = text.split(/\*\*/);
  parts.forEach((p, i) => {
    if (p) out.push({ bold: i % 2 === 1, text: p });
  });
  return out;
}

// Dentro de cada parte, processa *itálico* (single asterisk) — apenas no não-bold
function splitItalic(text: string): Array<{ italic: boolean; text: string }> {
  const out: Array<{ italic: boolean; text: string }> = [];
  // Só split em *single* (não ** que já foi tratado). Regex evita ** consecutivos.
  const parts = text.split(/(?<!\*)\*(?!\*)/);
  parts.forEach((p, i) => {
    if (p) out.push({ italic: i % 2 === 1, text: p });
  });
  return out;
}

const InlineLine: React.FC<{ text: string; style?: StyleProp<TextStyle>; boldStyle?: StyleProp<TextStyle> }> = ({
  text,
  style,
  boldStyle,
}) => {
  const boldParts = splitBold(text);
  return (
    <>
      {boldParts.flatMap((bp, bi) => {
        if (bp.bold) {
          return [
            <Text key={`b-${bi}`} style={[style, { fontWeight: '800' as const }, boldStyle]}>
              {bp.text}
            </Text>,
          ];
        }
        // Não bold: pode ter *itálico*
        return splitItalic(bp.text).map((ip, ii) => (
          <Text key={`i-${bi}-${ii}`} style={[style, ip.italic ? { fontStyle: 'italic' as const } : null]}>
            {ip.text}
          </Text>
        ));
      })}
    </>
  );
};

export const MarkdownText: React.FC<Props> = ({ children, style, boldStyle }) => {
  const text = String(children || '');
  const lines = text.split('\n');

  // Agrupar linhas em blocos: parágrafos vs. listas vs. linhas vazias
  type Block = { kind: 'p' | 'li' | 'gap'; text?: string };
  const blocks: Block[] = [];
  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trimStart();
    if (!trimmed) { blocks.push({ kind: 'gap' }); continue; }
    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ kind: 'li', text: trimmed.replace(/^[-*]\s+/, '') });
    } else {
      blocks.push({ kind: 'p', text: line });
    }
  }

  return (
    <View>
      {blocks.map((b, i) => {
        if (b.kind === 'gap') return <View key={i} style={{ height: 6 }} />;
        if (b.kind === 'li') {
          return (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginVertical: 1 }}>
              <Text style={style}>•</Text>
              <Text style={[style, { flex: 1 }]}>
                <InlineLine text={b.text || ''} style={style} boldStyle={boldStyle} />
              </Text>
            </View>
          );
        }
        return (
          <Text key={i} style={style}>
            <InlineLine text={b.text || ''} style={style} boldStyle={boldStyle} />
          </Text>
        );
      })}
    </View>
  );
};
