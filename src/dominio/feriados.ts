export const TIPO_FERIADO = 'tipo-feriado'
export const TIPO_RECESSO = 'tipo-recesso'

export type GrupoPonto = 'carnaval' | 'cinzas' | 'corpusChristi'

export type PontosFacultativos = {
  carnaval: boolean
  cinzas: boolean
  corpusChristi: boolean
}

export type ModeloFeriado = {
  chave: string
  inicio: string
  descricao: string
  tipoId: string
  grupo: GrupoPonto | null
}

const DATA = /^(\d{4})-(\d{2})-(\d{2})$/

export function isoDeUtc(ano: number, mes: number, dia: number): string {
  const mm = String(mes).padStart(2, '0')
  const dd = String(dia).padStart(2, '0')
  return `${ano}-${mm}-${dd}`
}

export function pascoa(ano: number): string {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return isoDeUtc(ano, mes, dia)
}

export function somarDias(iso: string, dias: number): string {
  const partes = DATA.exec(iso)
  if (!partes) return iso
  const dt = new Date(Date.UTC(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])))
  dt.setUTCDate(dt.getUTCDate() + dias)
  return isoDeUtc(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

export function moverParaAno(iso: string, anoNovo: number): string | null {
  const partes = DATA.exec(iso)
  if (!partes) return null
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const dt = new Date(Date.UTC(anoNovo, mes - 1, dia))
  if (dt.getUTCMonth() !== mes - 1 || dt.getUTCDate() !== dia) return null
  return isoDeUtc(anoNovo, mes, dia)
}

const FIXOS: { chave: string; mes: number; dia: number; descricao: string; desde?: number }[] = [
  { chave: 'nacional:confraternizacao', mes: 1, dia: 1, descricao: 'Confraternização Universal' },
  { chave: 'nacional:tiradentes', mes: 4, dia: 21, descricao: 'Tiradentes' },
  { chave: 'nacional:trabalho', mes: 5, dia: 1, descricao: 'Dia do Trabalho' },
  { chave: 'nacional:independencia', mes: 9, dia: 7, descricao: 'Independência' },
  { chave: 'nacional:aparecida', mes: 10, dia: 12, descricao: 'Nossa Senhora Aparecida' },
  { chave: 'nacional:finados', mes: 11, dia: 2, descricao: 'Finados' },
  { chave: 'nacional:proclamacao', mes: 11, dia: 15, descricao: 'Proclamação da República' },
  { chave: 'nacional:consciencia-negra', mes: 11, dia: 20, descricao: 'Dia da Consciência Negra', desde: 2024 },
  { chave: 'nacional:natal', mes: 12, dia: 25, descricao: 'Natal' },
]

export function modelosAutomaticos(ano: number): ModeloFeriado[] {
  const lista: ModeloFeriado[] = []
  for (const item of FIXOS) {
    if (item.desde && ano < item.desde) continue
    lista.push({
      chave: item.chave,
      inicio: isoDeUtc(ano, item.mes, item.dia),
      descricao: item.descricao,
      tipoId: TIPO_FERIADO,
      grupo: null,
    })
  }
  const domingo = pascoa(ano)
  lista.push({
    chave: 'movel:sexta-santa',
    inicio: somarDias(domingo, -2),
    descricao: 'Sexta-feira Santa',
    tipoId: TIPO_FERIADO,
    grupo: null,
  })
  lista.push({
    chave: 'facultativo:carnaval-segunda',
    inicio: somarDias(domingo, -48),
    descricao: 'Carnaval',
    tipoId: TIPO_RECESSO,
    grupo: 'carnaval',
  })
  lista.push({
    chave: 'facultativo:carnaval-terca',
    inicio: somarDias(domingo, -47),
    descricao: 'Carnaval',
    tipoId: TIPO_RECESSO,
    grupo: 'carnaval',
  })
  lista.push({
    chave: 'facultativo:cinzas',
    inicio: somarDias(domingo, -46),
    descricao: 'Quarta-feira de Cinzas',
    tipoId: TIPO_RECESSO,
    grupo: 'cinzas',
  })
  lista.push({
    chave: 'facultativo:corpus-christi',
    inicio: somarDias(domingo, 60),
    descricao: 'Corpus Christi',
    tipoId: TIPO_RECESSO,
    grupo: 'corpusChristi',
  })
  return lista
}

export const PONTOS_PADRAO: PontosFacultativos = {
  carnaval: true,
  cinzas: true,
  corpusChristi: true,
}

export function previsualizarFeriados(
  ano: number,
  pontos: PontosFacultativos = PONTOS_PADRAO,
): ModeloFeriado[] {
  return modelosAutomaticos(ano).filter((m) => {
    if (!m.grupo) return true
    return pontos[m.grupo]
  })
}

export function chavesDoGrupo(grupo: GrupoPonto): string[] {
  return modelosAutomaticos(2000)
    .filter((m) => m.grupo === grupo)
    .map((m) => m.chave)
}
