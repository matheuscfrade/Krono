import { TIPO_EVENTO, TIPO_RETIRADA, tipoCriaAula, tipoNuncaCombina } from './calendario'

export type FundoAmostra = 'letivo' | 'feriado' | 'recesso'

export type AjudaPintura = {
  texto: string
  fundo: FundoAmostra | null
  marca: boolean
}

export const TEXTO_AJUDA_PERIODO =
  'Pinta o **fundo** de segunda a sexta na cor desta etapa. Sábado vira aula se você lançar um evento nesse dia. Domingo fica sem fundo.'

const TEXTO_MARCA_COMBINA =
  'Aparece um **quadradinho**. Se o dia já era aula, o fundo letivo **continua**.'

const TEXTO_MARCA_NAO_COMBINA =
  'Não pinta o fundo. Aparece um **quadradinho** no dia. Se o dia era letivo, deixa de ser.'

const TEXTO_EVENTO_NAO_COMBINA =
  'Não pinta o fundo. Aparece um **quadradinho**. Se o dia era letivo, deixa de ser. Em **sábado**, o dia ainda vira aula.'

const AJUDAS: Record<string, AjudaPintura> = {
  'tipo-feriado': {
    texto: 'Pinta o **fundo** do dia. Esse dia deixa de ser letivo.',
    fundo: 'feriado',
    marca: false,
  },
  'tipo-recesso': {
    texto: 'Pinta o **fundo** do dia (cor do recesso). Esse dia deixa de ser letivo.',
    fundo: 'recesso',
    marca: false,
  },
  'tipo-ferias': {
    texto: TEXTO_MARCA_NAO_COMBINA,
    fundo: null,
    marca: true,
  },
  'tipo-exames': {
    texto: TEXTO_MARCA_NAO_COMBINA,
    fundo: null,
    marca: true,
  },
  'tipo-recuperacao': {
    texto: TEXTO_MARCA_NAO_COMBINA,
    fundo: null,
    marca: true,
  },
  'tipo-sabado-letivo': {
    texto: 'Só em **sábado**. Fundo da etapa (se o sábado estiver no período) e um **quadradinho**.',
    fundo: 'letivo',
    marca: true,
  },
  'tipo-evento': {
    texto:
      'Aparece um **quadradinho**. Em dia letivo o fundo azul **continua**. Em **sábado**, o dia vira aula (fundo da etapa, se estiver no período).',
    fundo: 'letivo',
    marca: true,
  },
  'tipo-reposicao': {
    texto:
      'Fundo da etapa e um **quadradinho** de reposição. Se o dia já era aula, o total **não aumenta**. Para somar, reponha num dia que ainda não é letivo. Não cai em feriado nem recesso.',
    fundo: 'letivo',
    marca: true,
  },
}

export const TEXTO_AJUDA_RETIRADA =
  'Tira o **fundo** de aula. O dia fica em branco, sem marca.'

export function ajudaPintura(
  tipoId: string,
  opcoes?: { combinaComLetivo?: boolean },
): AjudaPintura | null {
  if (tipoId === TIPO_RETIRADA || tipoId === 'tipo-ponto-facultativo') return null
  const padrao = AJUDAS[tipoId]
  if (opcoes?.combinaComLetivo === undefined) return padrao ?? null
  if (tipoNuncaCombina(tipoId) || tipoCriaAula(tipoId)) {
    return padrao ?? null
  }
  if (opcoes.combinaComLetivo) {
    return {
      texto: padrao && tipoId === TIPO_EVENTO ? padrao.texto : TEXTO_MARCA_COMBINA,
      fundo: 'letivo',
      marca: true,
    }
  }
  return {
    texto: tipoId === TIPO_EVENTO ? TEXTO_EVENTO_NAO_COMBINA : TEXTO_MARCA_NAO_COMBINA,
    fundo: null,
    marca: true,
  }
}
