import { FORMATO_RASCUNHO_ATUAL } from './formato'
import {
  chavesDoGrupo,
  modelosAutomaticos,
  moverParaAno,
  PONTOS_PADRAO,
  previsualizarFeriados,
  somarDias,
  TIPO_FERIADO,
  TIPO_RECESSO,
  type GrupoPonto,
  type PontosFacultativos,
} from './feriados'

export type { GrupoPonto, PontosFacultativos }
export { previsualizarFeriados, TIPO_FERIADO, TIPO_RECESSO }

export type TipoDia = {
  id: string
  nome: string
  cor: string
  padrao: boolean
  corManual?: boolean
  corSugerida?: string
  combinaComLetivo?: boolean
  entraNoPrazo?: boolean
}

export type ParametrosTipo = {
  combinaComLetivo: boolean
  entraNoPrazo: boolean
}

export type Periodo = {
  id: string
  nome: string
  inicio: string
  fim: string
  tipoLetivoId: string
}

export type Evento = {
  id: string
  tipoId: string
  inicio: string
  fim: string
  descricao: string
  origem: 'automatico' | 'manual'
  chave?: string
  editado?: boolean
  dataOriginal?: string
  exclusivo?: boolean
  /** Dias em que o evento pode ficar em feriado, recesso ou férias sem aviso no calendário. */
  aceitosEmFeriado?: string[]
}

export type ModeloRegraUsuario = 'presenca' | 'prazo'

export type GravidadeRegra = 'aviso' | 'erro'

export type UnidadePrazo = 'corridos' | 'uteis' | 'letivos'

export const ANCORA_INICIO_PERIODO = 'inicio-periodo'
export const ANCORA_FIM_PERIODO = 'fim-periodo'

export type AncoraPrazo = typeof ANCORA_INICIO_PERIODO | typeof ANCORA_FIM_PERIODO | string

export type RegraUsuario = {
  id: string
  nome: string
  ligada: boolean
  modelo: ModeloRegraUsuario
  tipoId?: string
  palavra?: string
  origem?: AncoraPrazo
  destinoTipoId?: AncoraPrazo
  minimoDias?: number
  unidade?: UnidadePrazo
  gravidade: GravidadeRegra
}

export type RegrasCalendario = {
  mostrarTotais: boolean
  avisoMinimo: boolean
  regrasUsuario: RegraUsuario[]
}

export type EntradaRegraUsuario = {
  nome: string
  modelo: ModeloRegraUsuario
  tipoId?: string
  palavra?: string
  origem?: AncoraPrazo
  destinoTipoId?: AncoraPrazo
  minimoDias?: number
  unidade?: UnidadePrazo
  gravidade?: GravidadeRegra
}

export function ehAncoraPeriodo(id: string): boolean {
  return id === ANCORA_INICIO_PERIODO || id === ANCORA_FIM_PERIODO
}

/** Itens do formato 1, só para migrar rascunho antigo. */
export const ITENS_CONFERENCIA_PADRAO: { id: string; nome: string; padrao: boolean }[] = [
  { id: 'ferias', nome: 'Férias docentes', padrao: true },
  { id: 'recesso', nome: 'Recesso acadêmico', padrao: true },
  { id: 'exames', nome: 'Exames finais', padrao: true },
  { id: 'recuperacao', nome: 'Recuperação', padrao: true },
  { id: 'sabados', nome: 'Sábados letivos', padrao: true },
  { id: 'reposicao', nome: 'Reposição de aula perdida', padrao: true },
  { id: 'resultados-registro', nome: 'Prazo de entrega de resultados ao registro acadêmico', padrao: true },
  { id: 'transferencia', nome: 'Pedidos de transferência e de mudança de turno', padrao: true },
  { id: 'matriculas', nome: 'Matrículas', padrao: true },
  { id: 'trancamento', nome: 'Trancamento de matrícula', padrao: true },
  { id: 'publicacao-rendimento', nome: 'Publicação de resultados do rendimento', padrao: true },
  { id: 'aproveitamento', nome: 'Aproveitamento de estudos', padrao: false },
  { id: 'reintegracao', nome: 'Reintegração e reopção de curso', padrao: false },
  { id: 'diploma', nome: 'Solicitação de diploma', padrao: false },
  { id: 'colacao', nome: 'Colação de grau', padrao: false },
  { id: 'aluno-especial', nome: 'Seleção de aluno especial', padrao: false },
]

export const SEMANAS_TEMATICAS_PADRAO: { id: string; nome: string }[] = [
  {
    id: 'semana-violencia-mulher',
    nome: 'Semana Escolar de Combate à Violência contra a Mulher',
  },
  {
    id: 'semana-mulheres-historia',
    nome: 'Semana de Valorização de Mulheres que Fizeram História',
  },
]

export const TIPO_ITEM_CONFERENCIA_V1: Record<string, string> = {
  ferias: 'tipo-ferias',
  recesso: 'tipo-recesso',
  exames: 'tipo-exames',
  recuperacao: 'tipo-recuperacao',
}

export const PALAVRA_ITEM_CONFERENCIA_V1: Record<string, string> = {
  'resultados-registro': 'resultado',
  transferencia: 'transfer',
  matriculas: 'matrícul',
  trancamento: 'trancamento',
  'publicacao-rendimento': 'rendimento',
  aproveitamento: 'aproveitamento',
  reintegracao: 'reintegra',
  diploma: 'diploma',
  colacao: 'colação',
  'aluno-especial': 'aluno especial',
}

export function regrasPadrao(): RegrasCalendario {
  return {
    mostrarTotais: true,
    avisoMinimo: true,
    regrasUsuario: [],
  }
}

export function regrasDo(calendario: Calendario): RegrasCalendario {
  const base = regrasPadrao()
  const atual = calendario.regras
  if (!atual) return base
  return {
    mostrarTotais: atual.mostrarTotais ?? base.mostrarTotais,
    avisoMinimo: atual.avisoMinimo ?? base.avisoMinimo,
    regrasUsuario: Array.isArray(atual.regrasUsuario) ? atual.regrasUsuario : [],
  }
}

export type MarcaDoDia = {
  evento: Evento
  tipo: TipoDia
}

export const LIMITE_MARCAS_DIA = 4

export type PinturaDoDia = {
  fundo: TipoDia | null
  marcas: MarcaDoDia[]
  haMais: boolean
}

export type Calendario = {
  formato: number
  nome: string
  instituicao: string
  ano: number
  periodos: Periodo[]
  tiposDia: TipoDia[]
  eventos: Evento[]
  pontosFacultativos: PontosFacultativos
  chavesExcluidas: string[]
  minimoDiasLetivos: number
  regras: RegrasCalendario
}

export type ErroCampo = {
  campo: string
  mensagem: string
}

export type Resultado<T> =
  | { ok: true; calendario: T; avisos?: ErroCampo[] }
  | { ok: false; erros: ErroCampo[] }

const DATA = /^(\d{4})-(\d{2})-(\d{2})$/

const CORES_LETIVO = ['#2b6cb0', '#2c5282', '#3182ce', '#2a4365']

const HEX_COR = /^#[0-9a-fA-F]{6}$/

const PRIORIDADE_TIPO: Record<string, number> = {
  'tipo-feriado': 0,
  'tipo-recesso': 1,
  'tipo-ferias': 2,
  'tipo-exames': 3,
  'tipo-recuperacao': 4,
  'tipo-reposicao': 5,
  'tipo-evento': 6,
  'tipo-sabado-letivo': 7,
}

const TIPOS_PADRAO: TipoDia[] = [
  { id: 'tipo-feriado', nome: 'Feriado', cor: '#c53030', padrao: true, corSugerida: '#c53030' },
  { id: 'tipo-recesso', nome: 'Recesso', cor: '#dd6b20', padrao: true, corSugerida: '#dd6b20' },
  { id: 'tipo-ferias', nome: 'Férias', cor: '#319795', padrao: true, corSugerida: '#319795' },
  { id: 'tipo-exames', nome: 'Exames finais', cor: '#6b46c1', padrao: true, corSugerida: '#6b46c1' },
  { id: 'tipo-recuperacao', nome: 'Recuperação', cor: '#805ad5', padrao: true, corSugerida: '#805ad5' },
  { id: 'tipo-reposicao', nome: 'Reposição', cor: '#d69e2e', padrao: true, corSugerida: '#d69e2e' },
  { id: 'tipo-sabado-letivo', nome: 'Sábado letivo', cor: '#0e7490', padrao: true, corSugerida: '#0e7490' },
  { id: 'tipo-evento', nome: 'Evento', cor: '#38a169', padrao: true, corSugerida: '#38a169' },
]

function novoId(prefixo: string): string {
  return `${prefixo}-${crypto.randomUUID()}`
}

function nomeLetivo(nomePeriodo: string): string {
  return `Dia letivo — ${nomePeriodo}`
}

function hslParaHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const lig = l / 100
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c)
  }
  const hex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`
}

export function corLetivoAmostra(calendario: Calendario, tipoLetivoId?: string): string {
  if (tipoLetivoId) {
    const tipo = calendario.tiposDia.find((t) => t.id === tipoLetivoId)
    if (tipo) return tipo.cor
  }
  return corParaNovoLetivo(calendario)
}

function corParaNovoLetivo(calendario: Calendario): string {
  const indice = calendario.periodos.length
  if (indice < CORES_LETIVO.length) {
    return CORES_LETIVO[indice]!
  }
  const usadas = new Set(calendario.tiposDia.map((t) => t.cor.toLowerCase()))
  const extra = indice - CORES_LETIVO.length
  for (let i = 0; i < 48; i += 1) {
    const h = (25 + extra * 41 + i * 17) % 360
    const s = 55 + ((extra + i) % 3) * 5
    const l = (extra + i) % 2 === 0 ? 38 : 52
    const hex = hslParaHex(h, s, l)
    if (!usadas.has(hex.toLowerCase())) return hex
  }
  return hslParaHex(25, 60, 38)
}

function prioridadeTipo(tipo: TipoDia): number {
  return PRIORIDADE_TIPO[tipo.id] ?? 50
}

export function formatarDataBr(iso: string): string {
  const partes = DATA.exec(iso)
  if (!partes) return iso
  return `${partes[3]}/${partes[2]}/${partes[1]}`
}

export function formatarIntervaloBr(inicio: string, fim: string): string {
  if (inicio === fim) return formatarDataBr(inicio)
  return `${formatarDataBr(inicio)} a ${formatarDataBr(fim)}`
}

export const TIPO_SABADO_LETIVO = 'tipo-sabado-letivo'
export const TIPO_EVENTO = 'tipo-evento'
export const TIPO_REPOSICAO = 'tipo-reposicao'
export const TIPO_RETIRADA = 'tipo-retirada-letivo'

export const TIPOS_EVENTO = [
  'tipo-ferias',
  'tipo-exames',
  'tipo-recuperacao',
  'tipo-reposicao',
  'tipo-sabado-letivo',
  'tipo-evento',
] as const

const PARAMETROS_TIPO_NOVO: ParametrosTipo = {
  combinaComLetivo: true,
  entraNoPrazo: false,
}

const PARAMETROS_TIPO_PADRAO: Record<string, ParametrosTipo> = {
  [TIPO_FERIADO]: { combinaComLetivo: false, entraNoPrazo: false },
  [TIPO_RECESSO]: { combinaComLetivo: false, entraNoPrazo: false },
  'tipo-ferias': { combinaComLetivo: false, entraNoPrazo: false },
  'tipo-exames': { combinaComLetivo: false, entraNoPrazo: true },
  'tipo-recuperacao': { combinaComLetivo: false, entraNoPrazo: false },
  [TIPO_RETIRADA]: { combinaComLetivo: false, entraNoPrazo: false },
  [TIPO_REPOSICAO]: { combinaComLetivo: true, entraNoPrazo: false },
  [TIPO_SABADO_LETIVO]: { combinaComLetivo: true, entraNoPrazo: false },
  [TIPO_EVENTO]: { combinaComLetivo: true, entraNoPrazo: false },
}

export function ehTipoLetivo(tipo: { id: string }): boolean {
  return tipo.id.startsWith('tipo-letivo-')
}

function combinaDoTipo(tipo: TipoDia, padrao: boolean): boolean {
  if (tipoNuncaCombina(tipo.id)) return false
  if (typeof tipo.combinaComLetivo === 'boolean') return tipo.combinaComLetivo
  const legado = tipo as TipoDia & { tiraLetivo?: boolean; viraAula?: boolean }
  if (legado.tiraLetivo === true && legado.viraAula !== true) return false
  if (legado.tiraLetivo === false || legado.viraAula === true) return true
  return padrao
}

export function parametrosDoTipo(tipo: TipoDia): ParametrosTipo {
  const base =
    PARAMETROS_TIPO_PADRAO[tipo.id] ??
    (ehTipoLetivo(tipo) ? { combinaComLetivo: true, entraNoPrazo: false } : PARAMETROS_TIPO_NOVO)
  return {
    combinaComLetivo: combinaDoTipo(tipo, base.combinaComLetivo),
    entraNoPrazo: tipo.entraNoPrazo ?? base.entraNoPrazo,
  }
}

export function parametrosDoTipoId(calendario: Calendario, tipoId: string): ParametrosTipo {
  const tipo = calendario.tiposDia.find((t) => t.id === tipoId)
  if (tipo) return parametrosDoTipo(tipo)
  return PARAMETROS_TIPO_PADRAO[tipoId] ?? PARAMETROS_TIPO_NOVO
}

export function tipoCriaAula(tipoId: string): boolean {
  return tipoId === TIPO_REPOSICAO || tipoId === TIPO_SABADO_LETIVO
}

export function tipoNuncaCombina(tipoId: string): boolean {
  return tipoId === TIPO_FERIADO || tipoId === TIPO_RECESSO || tipoId === 'tipo-ferias'
}

export function tipoMostraCombina(tipo: TipoDia): boolean {
  if (ehTipoLetivo(tipo)) return false
  if (tipoNuncaCombina(tipo.id)) return false
  return !tipoCriaAula(tipo.id)
}

export function tipoTiraAula(calendario: Calendario, tipoId: string): boolean {
  if (tipoCriaAula(tipoId)) return false
  return !parametrosDoTipoId(calendario, tipoId).combinaComLetivo
}

export function tipoEhLancavel(tipo: TipoDia): boolean {
  if (ehTipoLetivo(tipo)) return false
  if (tipo.id === TIPO_FERIADO || tipo.id === TIPO_RECESSO || tipo.id === TIPO_RETIRADA) return false
  return true
}

const TIPOS_ESSENCIAIS = new Set([
  TIPO_FERIADO,
  TIPO_RECESSO,
  TIPO_REPOSICAO,
  TIPO_EVENTO,
  TIPO_RETIRADA,
])

export function tipoPodeApagar(tipo: TipoDia): boolean {
  if (ehTipoLetivo(tipo)) return false
  if (TIPOS_ESSENCIAIS.has(tipo.id)) return false
  return true
}

export function tipoEhCriado(tipo: TipoDia): boolean {
  return !tipo.padrao && !ehTipoLetivo(tipo)
}

function compararNomeTipo(a: TipoDia, b: TipoDia): number {
  const porNome = a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
  if (porNome !== 0) return porNome
  return a.id.localeCompare(b.id)
}

export function tiposPadraoOrdenados(tipos: TipoDia[]): TipoDia[] {
  return tipos.filter((t) => !tipoEhCriado(t)).slice().sort(compararNomeTipo)
}

export function tiposCriadosOrdenados(tipos: TipoDia[]): TipoDia[] {
  return tipos.filter(tipoEhCriado).slice().sort(compararNomeTipo)
}

export function tiposDiaOrdenados(tipos: TipoDia[]): TipoDia[] {
  return [...tiposPadraoOrdenados(tipos), ...tiposCriadosOrdenados(tipos)]
}

export function tipoEntraNoPrazo(tipo: TipoDia): boolean {
  if (ehTipoLetivo(tipo)) return false
  return parametrosDoTipo(tipo).entraNoPrazo
}

export function tiposParaPrazo(calendario: Calendario, incluirIds: string[] = []): TipoDia[] {
  const extras = new Set(incluirIds.filter((id) => id && !ehAncoraPeriodo(id)))
  return tiposDiaOrdenados(
    calendario.tiposDia.filter((t) => tipoEntraNoPrazo(t) || extras.has(t.id)),
  )
}

const TIPOS_SEM_CRUZAR = new Set([
  TIPO_FERIADO,
  TIPO_RECESSO,
  'tipo-ferias',
  'tipo-exames',
  'tipo-recuperacao',
  TIPO_REPOSICAO,
  TIPO_SABADO_LETIVO,
  TIPO_RETIRADA,
])

export function isoDeDataBr(texto: string): string | null {
  const bruto = texto.trim()
  if (DATA.test(bruto) && dataValida(bruto)) return bruto
  const partes = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(bruto)
  if (!partes) return null
  const iso = `${partes[3]}-${partes[2].padStart(2, '0')}-${partes[1].padStart(2, '0')}`
  if (!dataValida(iso)) return null
  return iso
}

function anoDaData(iso: string): number | null {
  const partes = DATA.exec(iso)
  if (!partes) return null
  return Number(partes[1])
}

export function diaDaSemanaUtc(iso: string): number | null {
  const partes = DATA.exec(iso)
  if (!partes) return null
  const ano = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
}

export function ehSabado(iso: string): boolean {
  return diaDaSemanaUtc(iso) === 6
}

export function eventoTornaSabadoLetivo(evento: Evento, _calendario?: Calendario): boolean {
  return evento.tipoId === TIPO_SABADO_LETIVO || evento.tipoId === TIPO_EVENTO
}

function temAulaDeSabado(calendario: Calendario, iso: string, ignorarId?: string): boolean {
  if (!ehSabado(iso)) return false
  return calendario.eventos.some(
    (e) => e.id !== ignorarId && eventoTornaSabadoLetivo(e, calendario) && eventoCobreIso(e, iso),
  )
}

function intervaloTemSabado(inicio: string, fim: string): boolean {
  let iso = inicio
  while (iso <= fim) {
    if (ehSabado(iso)) return true
    if (iso === fim) break
    iso = somarDias(iso, 1)
  }
  return false
}

export function declaraSabadoLetivo(calendario: Calendario): boolean {
  return calendario.eventos.some(
    (e) => eventoTornaSabadoLetivo(e, calendario) && intervaloTemSabado(e.inicio, e.fim),
  )
}

export function ehDomingo(iso: string): boolean {
  return diaDaSemanaUtc(iso) === 0
}

const NOMES_DIA_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]

export function nomeDiaSemana(iso: string): string {
  const wd = diaDaSemanaUtc(iso)
  if (wd === null) return iso
  return NOMES_DIA_SEMANA[wd] ?? iso
}

export function nomeReposicao(dataOriginal: string): string {
  return `Reposição de aula de ${nomeDiaSemana(dataOriginal)} (${formatarDataBr(dataOriginal)})`
}

export function eventoCobreIso(evento: Evento, iso: string): boolean {
  return compararIso(evento.inicio, iso) <= 0 && compararIso(iso, evento.fim) <= 0
}

function bloqueiaLetivo(calendario: Calendario, iso: string, ignorarId?: string): boolean {
  return calendario.eventos.some(
    (e) => e.id !== ignorarId && eventoCobreIso(e, iso) && tipoTiraAula(calendario, e.tipoId),
  )
}

function temViraAula(calendario: Calendario, iso: string, ignorarId?: string): boolean {
  if (ehDomingo(iso)) return false
  return calendario.eventos.some((e) => {
    if (e.id === ignorarId || !eventoCobreIso(e, iso)) return false
    return tipoCriaAula(e.tipoId)
  })
}

export function diaEhLetivo(
  calendario: Calendario,
  iso: string,
  ignorarId?: string,
): boolean {
  if (ehDomingo(iso)) return false
  if (bloqueiaLetivo(calendario, iso, ignorarId)) return false
  if (temViraAula(calendario, iso, ignorarId)) return true
  const weekday = diaDaSemanaUtc(iso)
  if (weekday === null || weekday === 0) return false
  const noPeriodo = calendario.periodos.some(
    (p) => compararIso(p.inicio, iso) <= 0 && compararIso(iso, p.fim) <= 0,
  )
  if (weekday >= 1 && weekday <= 5) return noPeriodo
  if (weekday === 6) return temAulaDeSabado(calendario, iso, ignorarId)
  return false
}

function dataValida(iso: string): boolean {
  const partes = DATA.exec(iso)
  if (!partes) return false
  const ano = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const dt = new Date(Date.UTC(ano, mes - 1, dia))
  return (
    dt.getUTCFullYear() === ano &&
    dt.getUTCMonth() === mes - 1 &&
    dt.getUTCDate() === dia
  )
}

function compararIso(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function cruzam(aInicio: string, aFim: string, bInicio: string, bFim: string): boolean {
  return compararIso(aInicio, bFim) <= 0 && compararIso(bInicio, aFim) <= 0
}

function lerAno(ano: number | string): number | null {
  if (typeof ano === 'number' && Number.isInteger(ano)) return ano
  if (typeof ano === 'string' && /^\d{4}$/.test(ano.trim())) return Number(ano.trim())
  return null
}

function eventosDosModelos(
  ano: number,
  pontos: PontosFacultativos,
  excluidas: string[],
): Evento[] {
  return previsualizarFeriados(ano, pontos)
    .filter((m) => !excluidas.includes(m.chave))
    .map((m) => ({
      id: `auto-${m.chave}`,
      tipoId: m.tipoId,
      inicio: m.inicio,
      fim: m.inicio,
      descricao: m.descricao,
      origem: 'automatico' as const,
      chave: m.chave,
    }))
}

export function criarCalendario(entrada: {
  nome: string
  instituicao: string
  ano: number | string
  pontosFacultativos?: PontosFacultativos
}): Resultado<Calendario> {
  const nome = entrada.nome.trim()
  const instituicao = entrada.instituicao.trim()
  const ano = lerAno(entrada.ano)
  const erros: ErroCampo[] = []
  if (!nome) {
    erros.push({ campo: 'nome', mensagem: 'Escreva o nome do calendário.' })
  }
  if (!instituicao) {
    erros.push({ campo: 'instituicao', mensagem: 'Escreva o nome da instituição.' })
  }
  if (ano === null || ano < 1900 || ano > 2100) {
    erros.push({
      campo: 'ano',
      mensagem: 'Informe um ano com quatro números, entre 1900 e 2100.',
    })
  }
  if (erros.length > 0 || ano === null) {
    return { ok: false, erros }
  }
  const pontos = entrada.pontosFacultativos ?? { ...PONTOS_PADRAO }
  return {
    ok: true,
    calendario: {
      formato: FORMATO_RASCUNHO_ATUAL,
      nome,
      instituicao,
      ano,
      periodos: [],
      tiposDia: TIPOS_PADRAO.map((t) => ({ ...t })),
      pontosFacultativos: pontos,
      chavesExcluidas: [],
      minimoDiasLetivos: 200,
      regras: regrasPadrao(),
      eventos: eventosDosModelos(ano, pontos, []),
    },
  }
}

function validarPeriodo(
  calendario: Calendario,
  entrada: { nome: string; inicio: string; fim: string },
  ignorarId?: string,
): ErroCampo[] {
  const nome = entrada.nome.trim()
  const erros: ErroCampo[] = []
  if (!nome) {
    erros.push({ campo: 'nome', mensagem: 'Escreva o nome do período.' })
  }
  if (!entrada.inicio) {
    erros.push({ campo: 'inicio', mensagem: 'Informe o início.' })
  } else if (!dataValida(entrada.inicio) || anoDaData(entrada.inicio) !== calendario.ano) {
    erros.push({ campo: 'inicio', mensagem: `Use uma data de ${calendario.ano}.` })
  }
  if (!entrada.fim) {
    erros.push({ campo: 'fim', mensagem: 'Informe o fim.' })
  } else if (!dataValida(entrada.fim) || anoDaData(entrada.fim) !== calendario.ano) {
    erros.push({ campo: 'fim', mensagem: `Use uma data de ${calendario.ano}.` })
  }
  if (
    entrada.inicio &&
    entrada.fim &&
    dataValida(entrada.inicio) &&
    dataValida(entrada.fim) &&
    compararIso(entrada.fim, entrada.inicio) < 0
  ) {
    erros.push({
      campo: 'fim',
      mensagem: 'A data final precisa ser no mesmo dia ou depois da inicial.',
    })
  }
  if (erros.length > 0) return erros
  const cruzado = calendario.periodos.find(
    (p) =>
      p.id !== ignorarId &&
      cruzam(entrada.inicio, entrada.fim, p.inicio, p.fim),
  )
  if (cruzado) {
    erros.push({
      campo: 'inicio',
      mensagem: `Este período cruza com ${cruzado.nome} (${formatarDataBr(cruzado.inicio)} a ${formatarDataBr(cruzado.fim)}). Ajuste as datas.`,
    })
  }
  return erros
}

export function adicionarPeriodo(
  calendario: Calendario,
  entrada: { nome: string; inicio: string; fim: string },
): Resultado<Calendario> {
  const erros = validarPeriodo(calendario, entrada)
  if (erros.length > 0) return { ok: false, erros }
  const nome = entrada.nome.trim()
  const tipoId = novoId('tipo-letivo')
  const cor = corParaNovoLetivo(calendario)
  const tipo: TipoDia = {
    id: tipoId,
    nome: nomeLetivo(nome),
    cor,
    padrao: false,
    corSugerida: cor,
  }
  const periodo: Periodo = {
    id: novoId('periodo'),
    nome,
    inicio: entrada.inicio,
    fim: entrada.fim,
    tipoLetivoId: tipoId,
  }
  return {
    ok: true,
    calendario: {
      ...calendario,
      periodos: [...calendario.periodos, periodo],
      tiposDia: [...calendario.tiposDia, tipo],
    },
  }
}

export function atualizarPeriodo(
  calendario: Calendario,
  id: string,
  entrada: { nome: string; inicio: string; fim: string },
): Resultado<Calendario> {
  const erros = validarPeriodo(calendario, entrada, id)
  if (erros.length > 0) return { ok: false, erros }
  const nome = entrada.nome.trim()
  return {
    ok: true,
    calendario: {
      ...calendario,
      periodos: calendario.periodos.map((p) =>
        p.id === id
          ? { ...p, nome, inicio: entrada.inicio, fim: entrada.fim }
          : p,
      ),
      tiposDia: calendario.tiposDia.map((t) => {
        const periodo = calendario.periodos.find((p) => p.id === id)
        if (!periodo || t.id !== periodo.tipoLetivoId) return t
        return { ...t, nome: nomeLetivo(nome) }
      }),
    },
  }
}

export function apagarPeriodo(calendario: Calendario, id: string): Calendario {
  const periodo = calendario.periodos.find((p) => p.id === id)
  return {
    ...calendario,
    periodos: calendario.periodos.filter((p) => p.id !== id),
    tiposDia: calendario.tiposDia.filter((t) => t.id !== periodo?.tipoLetivoId),
  }
}

export function tiposDoDia(calendario: Calendario, iso: string): TipoDia[] {
  const vistos = new Set<string>()
  const tipos: TipoDia[] = []
  function incluir(tipo: TipoDia | undefined) {
    if (!tipo || vistos.has(tipo.id)) return
    vistos.add(tipo.id)
    tipos.push(tipo)
  }
  for (const evento of calendario.eventos) {
    if (evento.tipoId === TIPO_SABADO_LETIVO) continue
    if (evento.tipoId === TIPO_RETIRADA) continue
    if (compararIso(evento.inicio, iso) <= 0 && compararIso(iso, evento.fim) <= 0) {
      incluir(calendario.tiposDia.find((t) => t.id === evento.tipoId))
    }
  }
  const weekday = diaDaSemanaUtc(iso)
  const cobreLetivo = !bloqueiaLetivo(calendario, iso)
  if (cobreLetivo && weekday === 6) {
    for (const evento of calendario.eventos) {
      if (evento.tipoId !== TIPO_SABADO_LETIVO) continue
      if (compararIso(evento.inicio, iso) <= 0 && compararIso(iso, evento.fim) <= 0) {
        incluir(calendario.tiposDia.find((t) => t.id === evento.tipoId))
      }
    }
    const temReposicao = tipos.some((t) => t.id === TIPO_REPOSICAO)
    if (temAulaDeSabado(calendario, iso) || temReposicao || temViraAula(calendario, iso)) {
      const periodoSabado = calendario.periodos.find(
        (p) => compararIso(p.inicio, iso) <= 0 && compararIso(iso, p.fim) <= 0,
      )
      if (periodoSabado) {
        incluir(calendario.tiposDia.find((t) => t.id === periodoSabado.tipoLetivoId))
      }
    }
  }
  if (cobreLetivo && weekday !== null && weekday !== 0 && weekday !== 6) {
    const periodo = calendario.periodos.find(
      (p) => compararIso(p.inicio, iso) <= 0 && compararIso(iso, p.fim) <= 0,
    )
    if (periodo) {
      incluir(calendario.tiposDia.find((t) => t.id === periodo.tipoLetivoId))
    }
  }
  if (cobreLetivo && (tipos.some((t) => t.id === TIPO_REPOSICAO) || temViraAula(calendario, iso))) {
    const periodoReposicao = periodoLetivoDaReposicao(calendario, iso)
    if (periodoReposicao) {
      incluir(calendario.tiposDia.find((t) => t.id === periodoReposicao.tipoLetivoId))
    }
  }
  tipos.sort((a, b) => prioridadeTipo(a) - prioridadeTipo(b))
  return tipos
}

export function tipoDoDia(calendario: Calendario, iso: string): TipoDia | null {
  return tiposDoDia(calendario, iso)[0] ?? null
}

function periodoCobreIso(periodo: Periodo, iso: string): boolean {
  return compararIso(periodo.inicio, iso) <= 0 && compararIso(iso, periodo.fim) <= 0
}

function periodoLetivoDaReposicao(calendario: Calendario, iso: string): Periodo | undefined {
  const noDia = calendario.periodos.find((p) => periodoCobreIso(p, iso))
  if (noDia) return noDia
  const reposicao = calendario.eventos.find(
    (e) => e.tipoId === TIPO_REPOSICAO && eventoCobreIso(e, iso),
  )
  if (reposicao?.dataOriginal) {
    const daOriginal = calendario.periodos.find((p) =>
      periodoCobreIso(p, reposicao.dataOriginal as string),
    )
    if (daOriginal) return daOriginal
  }
  return calendario.periodos[0]
}

function eventoCobreDia(evento: Evento, iso: string): boolean {
  return eventoCobreIso(evento, iso)
}

function eventosNoDia(calendario: Calendario, iso: string): Evento[] {
  const weekday = diaDaSemanaUtc(iso)
  const outros: Evento[] = []
  const sabados: Evento[] = []
  for (const evento of calendario.eventos) {
    if (!eventoCobreDia(evento, iso)) continue
    if (evento.tipoId === TIPO_SABADO_LETIVO) sabados.push(evento)
    else outros.push(evento)
  }
  const cobreLetivo = !outros.some((e) => tipoTiraAula(calendario, e.tipoId))
  const lista = cobreLetivo && weekday === 6 ? [...outros, ...sabados] : [...outros]
  lista.sort((a, b) => (PRIORIDADE_TIPO[a.tipoId] ?? 50) - (PRIORIDADE_TIPO[b.tipoId] ?? 50))
  return lista
}

export function pinturaDoDia(calendario: Calendario, iso: string): PinturaDoDia {
  if (calendario.eventos.some((e) => e.tipoId === TIPO_RETIRADA && eventoCobreIso(e, iso))) {
    return { fundo: null, marcas: [], haMais: false }
  }
  const tipos = tiposDoDia(calendario, iso)
  const feriado = tipos.find((t) => t.id === TIPO_FERIADO) ?? null
  const recesso = tipos.find((t) => t.id === TIPO_RECESSO) ?? null
  const letivo = tipos.find((t) => ehTipoLetivo(t)) ?? null
  const fundo = feriado ?? recesso ?? letivo
  const marcas: MarcaDoDia[] = []
  for (const evento of eventosNoDia(calendario, iso)) {
    if (fundo && evento.tipoId === fundo.id) continue
    const tipo = calendario.tiposDia.find((t) => t.id === evento.tipoId)
    if (!tipo) continue
    marcas.push({ evento, tipo })
  }
  return {
    fundo,
    marcas,
    haMais: marcas.length > LIMITE_MARCAS_DIA,
  }
}

export function definirCorTipo(
  calendario: Calendario,
  tipoId: string,
  cor: string,
): Resultado<Calendario> {
  if (!HEX_COR.test(cor)) {
    return {
      ok: false,
      erros: [{ campo: 'cor', mensagem: 'Use uma cor no formato #RRGGBB.' }],
    }
  }
  if (!calendario.tiposDia.some((t) => t.id === tipoId)) {
    return {
      ok: false,
      erros: [{ campo: 'cor', mensagem: 'Tipo de marcação não encontrado.' }],
    }
  }
  return {
    ok: true,
    calendario: {
      ...calendario,
      tiposDia: calendario.tiposDia.map((t) =>
        t.id === tipoId ? { ...t, cor, corManual: true } : t,
      ),
    },
  }
}

export function voltarCorSugerida(calendario: Calendario, tipoId: string): Calendario {
  return {
    ...calendario,
    tiposDia: calendario.tiposDia.map((t) => {
      if (t.id !== tipoId) return t
      const sugerida =
        t.corSugerida ?? TIPOS_PADRAO.find((p) => p.id === t.id)?.cor ?? t.cor
      return { ...t, cor: sugerida, corManual: undefined }
    }),
  }
}

export function definirParametrosTipo(
  calendario: Calendario,
  tipoId: string,
  parametros: Partial<ParametrosTipo>,
): Calendario {
  return {
    ...calendario,
    tiposDia: calendario.tiposDia.map((t) => {
      if (t.id !== tipoId) return t
      const atual = parametrosDoTipo(t)
      const resto = { ...t } as TipoDia & {
        tiraLetivo?: boolean
        viraAula?: boolean
        contaNosTotais?: boolean
      }
      delete resto.tiraLetivo
      delete resto.viraAula
      delete resto.contaNosTotais
      return {
        ...resto,
        combinaComLetivo: tipoCriaAula(tipoId)
          ? true
          : tipoNuncaCombina(tipoId)
            ? false
            : (parametros.combinaComLetivo ?? atual.combinaComLetivo),
        entraNoPrazo: parametros.entraNoPrazo ?? atual.entraNoPrazo,
      }
    }),
  }
}

export function adicionarTipoDia(
  calendario: Calendario,
  entrada: {
    nome: string
    cor: string
    combinaComLetivo?: boolean
    entraNoPrazo?: boolean
  },
): Resultado<Calendario> {
  const nome = entrada.nome.trim()
  const erros: ErroCampo[] = []
  if (!nome) {
    erros.push({ campo: 'nome', mensagem: 'Escreva o nome do tipo.' })
  }
  if (!HEX_COR.test(entrada.cor)) {
    erros.push({ campo: 'cor', mensagem: 'Use uma cor no formato #RRGGBB.' })
  }
  if (erros.length > 0) return { ok: false, erros }
  const tipo: TipoDia = {
    id: novoId('tipo'),
    nome,
    cor: entrada.cor,
    padrao: false,
    corSugerida: entrada.cor,
    combinaComLetivo: entrada.combinaComLetivo ?? PARAMETROS_TIPO_NOVO.combinaComLetivo,
    entraNoPrazo: entrada.entraNoPrazo ?? PARAMETROS_TIPO_NOVO.entraNoPrazo,
  }
  return {
    ok: true,
    calendario: { ...calendario, tiposDia: [...calendario.tiposDia, tipo] },
  }
}

export function apagarTipoDia(calendario: Calendario, tipoId: string): Resultado<Calendario> {
  const tipo = calendario.tiposDia.find((t) => t.id === tipoId)
  if (!tipo) {
    return { ok: false, erros: [{ campo: 'tipoId', mensagem: 'Este tipo não existe.' }] }
  }
  if (!tipoPodeApagar(tipo)) {
    return {
      ok: false,
      erros: [{ campo: 'tipoId', mensagem: 'Este tipo faz parte do Krono e não pode ser apagado.' }],
    }
  }
  const nEventos = calendario.eventos.filter((e) => e.tipoId === tipoId).length
  if (nEventos === 1) {
    return {
      ok: false,
      erros: [{ campo: 'tipoId', mensagem: 'Há 1 lançamento deste tipo. Apague-o primeiro.' }],
    }
  }
  if (nEventos > 1) {
    return {
      ok: false,
      erros: [
        { campo: 'tipoId', mensagem: `Há ${nEventos} lançamentos deste tipo. Apague-os primeiro.` },
      ],
    }
  }
  const regra = regrasDo(calendario).regrasUsuario.find(
    (r) => r.tipoId === tipoId || r.origem === tipoId || r.destinoTipoId === tipoId,
  )
  if (regra) {
    return {
      ok: false,
      erros: [
        {
          campo: 'tipoId',
          mensagem: `A regra “${regra.nome}” usa este tipo. Apague ou altere a regra primeiro.`,
        },
      ],
    }
  }
  return {
    ok: true,
    calendario: { ...calendario, tiposDia: calendario.tiposDia.filter((t) => t.id !== tipoId) },
  }
}

function validarRegraUsuario(entrada: EntradaRegraUsuario): ErroCampo[] {
  const erros: ErroCampo[] = []
  if (!entrada.nome.trim()) {
    erros.push({ campo: 'nome', mensagem: 'Escreva o nome da regra.' })
  }
  if (entrada.modelo === 'presenca') {
    const tipoId = entrada.tipoId?.trim() ?? ''
    const palavra = entrada.palavra?.trim() ?? ''
    if (!tipoId && !palavra) {
      erros.push({ campo: 'tipoId', mensagem: 'Escolha um tipo ou escreva uma palavra.' })
    }
  } else if (entrada.modelo === 'prazo') {
    const destino = entrada.destinoTipoId?.trim() ?? ''
    const n = entrada.minimoDias
    if (!destino || n === undefined || !Number.isFinite(n) || n < 1) {
      erros.push({
        campo: 'minimoDias',
        mensagem: 'Informe o destino e um número de dias maior que zero.',
      })
    }
  }
  return erros
}

function montarRegraUsuario(entrada: EntradaRegraUsuario, id: string): RegraUsuario {
  const regra: RegraUsuario = {
    id,
    nome: entrada.nome.trim(),
    ligada: true,
    modelo: entrada.modelo,
    gravidade: entrada.gravidade ?? 'aviso',
  }
  if (entrada.modelo === 'presenca') {
    const tipoId = entrada.tipoId?.trim()
    const palavra = entrada.palavra?.trim()
    if (tipoId) regra.tipoId = tipoId
    if (palavra) regra.palavra = palavra
  } else {
    regra.origem = entrada.origem?.trim() || ANCORA_FIM_PERIODO
    regra.destinoTipoId = entrada.destinoTipoId?.trim()
    regra.minimoDias = entrada.minimoDias
    regra.unidade = entrada.unidade ?? 'corridos'
  }
  return regra
}

export function adicionarRegraUsuario(
  calendario: Calendario,
  entrada: EntradaRegraUsuario,
): Resultado<Calendario> {
  const erros = validarRegraUsuario(entrada)
  if (erros.length > 0) return { ok: false, erros }
  const regra = montarRegraUsuario(entrada, novoId('regra'))
  return {
    ok: true,
    calendario: {
      ...calendario,
      regras: {
        ...regrasDo(calendario),
        regrasUsuario: [...regrasDo(calendario).regrasUsuario, regra],
      },
    },
  }
}

export function atualizarRegraUsuario(
  calendario: Calendario,
  id: string,
  entrada: EntradaRegraUsuario,
): Resultado<Calendario> {
  const atual = regrasDo(calendario).regrasUsuario.find((r) => r.id === id)
  if (!atual) {
    return { ok: false, erros: [{ campo: 'nome', mensagem: 'Regra não encontrada.' }] }
  }
  const erros = validarRegraUsuario(entrada)
  if (erros.length > 0) return { ok: false, erros }
  const regra = { ...montarRegraUsuario(entrada, id), ligada: atual.ligada }
  return {
    ok: true,
    calendario: {
      ...calendario,
      regras: {
        ...regrasDo(calendario),
        regrasUsuario: regrasDo(calendario).regrasUsuario.map((r) => (r.id === id ? regra : r)),
      },
    },
  }
}

export function apagarRegraUsuario(calendario: Calendario, id: string): Calendario {
  const regras = regrasDo(calendario)
  return {
    ...calendario,
    regras: {
      ...regras,
      regrasUsuario: regras.regrasUsuario.filter((r) => r.id !== id),
    },
  }
}

export function definirRegraLigada(calendario: Calendario, id: string, ligada: boolean): Calendario {
  const regras = regrasDo(calendario)
  return {
    ...calendario,
    regras: {
      ...regras,
      regrasUsuario: regras.regrasUsuario.map((r) => (r.id === id ? { ...r, ligada } : r)),
    },
  }
}

export function diasCorridos(origemIso: string, destinoIso: string): number {
  const a = DATA.exec(origemIso)
  const b = DATA.exec(destinoIso)
  if (!a || !b) return 0
  const t0 = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]))
  const t1 = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]))
  return Math.round((t1 - t0) / 86400000)
}

function temFeriadoOuRecesso(calendario: Calendario, iso: string): boolean {
  return calendario.eventos.some(
    (e) => (e.tipoId === TIPO_FERIADO || e.tipoId === TIPO_RECESSO) && eventoCobreIso(e, iso),
  )
}

export function diaEhUtil(calendario: Calendario, iso: string): boolean {
  const weekday = diaDaSemanaUtc(iso)
  if (weekday === null || weekday === 0 || weekday === 6) return false
  return !temFeriadoOuRecesso(calendario, iso)
}

export function diasDoPrazo(
  calendario: Calendario,
  origemIso: string,
  destinoIso: string,
  unidade: UnidadePrazo = 'corridos',
): number {
  if (destinoIso <= origemIso) return destinoIso === origemIso ? 0 : 0
  let n = 0
  let iso = somarDias(origemIso, 1)
  while (iso <= destinoIso) {
    if (unidade === 'corridos') n += 1
    else if (unidade === 'uteis' && diaEhUtil(calendario, iso)) n += 1
    else if (unidade === 'letivos' && diaEhLetivo(calendario, iso)) n += 1
    iso = somarDias(iso, 1)
  }
  return n
}

export function rotuloUnidadePrazo(n: number, unidade: UnidadePrazo): string {
  if (unidade === 'uteis') return n === 1 ? 'dia útil' : 'dias úteis'
  if (unidade === 'letivos') return n === 1 ? 'dia letivo' : 'dias letivos'
  return n === 1 ? 'dia corrido' : 'dias corridos'
}

function cadaDiaDoAno(ano: number): string[] {
  const dias: string[] = []
  const cursor = new Date(Date.UTC(ano, 0, 1))
  const fim = Date.UTC(ano, 11, 31)
  while (cursor.getTime() <= fim) {
    const y = cursor.getUTCFullYear()
    const m = String(cursor.getUTCMonth() + 1).padStart(2, '0')
    const d = String(cursor.getUTCDate()).padStart(2, '0')
    dias.push(`${y}-${m}-${d}`)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dias
}

export function legenda(
  calendario: Calendario,
): { id: string; nome: string; cor: string; quantidade: number }[] {
  const contagem = new Map<string, number>()
  for (const iso of cadaDiaDoAno(calendario.ano)) {
    for (const tipo of tiposDoDia(calendario, iso)) {
      contagem.set(tipo.id, (contagem.get(tipo.id) ?? 0) + 1)
    }
  }
  return tiposDiaOrdenados(calendario.tiposDia)
    .filter((t) => (contagem.get(t.id) ?? 0) > 0)
    .map((t) => ({
      id: t.id,
      nome: t.nome,
      cor: t.cor,
      quantidade: contagem.get(t.id) ?? 0,
    }))
}

export type CelulaMes = {
  iso: string
  dia: number
  foraDoMes: boolean
}

export function gradeMes(ano: number, mes: number): CelulaMes[] {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1))
  const inicioSemana = primeiro.getUTCDay()
  const cursor = new Date(Date.UTC(ano, mes - 1, 1 - inicioSemana))
  const celulas: CelulaMes[] = []
  for (let i = 0; i < 42; i += 1) {
    const y = cursor.getUTCFullYear()
    const m = cursor.getUTCMonth() + 1
    const d = cursor.getUTCDate()
    const mm = String(m).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    celulas.push({
      iso: `${y}-${mm}-${dd}`,
      dia: d,
      foraDoMes: m !== mes,
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  while (celulas.length > 35) {
    const ultimaSemana = celulas.slice(35)
    if (ultimaSemana.every((c) => c.foraDoMes)) {
      celulas.splice(35)
      break
    }
    break
  }
  return celulas
}

export const NOMES_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function definirPontoFacultativo(
  calendario: Calendario,
  grupo: GrupoPonto,
  ligado: boolean,
): Calendario {
  const pontos = { ...calendario.pontosFacultativos, [grupo]: ligado }
  const chaves = chavesDoGrupo(grupo)
  const excluidas = calendario.chavesExcluidas.filter((c) => !chaves.includes(c))
  const semGrupo = calendario.eventos.filter((e) => !e.chave || !chaves.includes(e.chave))
  const novos = ligado
    ? eventosDosModelos(calendario.ano, pontos, excluidas).filter(
        (e) => e.chave && chaves.includes(e.chave),
      )
    : []
  return {
    ...calendario,
    pontosFacultativos: pontos,
    chavesExcluidas: excluidas,
    eventos: [...semGrupo, ...novos],
  }
}

function intervalosCruzam(aIni: string, aFim: string, bIni: string, bFim: string): boolean {
  return compararIso(aIni, bFim) <= 0 && compararIso(bIni, aFim) <= 0
}

function validarEvento(
  calendario: Calendario,
  entrada: { tipoId: string; descricao: string; inicio: string; fim: string; dataOriginal?: string },
  ignorarId?: string,
): { erros: ErroCampo[]; avisos: ErroCampo[]; descricao: string; inicio: string; fim: string; dataOriginal?: string } {
  let descricao = entrada.descricao.trim()
  const erros: ErroCampo[] = []
  const avisos: ErroCampo[] = []
  const tipoEntrada = calendario.tiposDia.find((t) => t.id === entrada.tipoId)
  if (!tipoEntrada || !tipoEhLancavel(tipoEntrada)) {
    erros.push({ campo: 'tipoId', mensagem: 'Escolha o tipo do evento.' })
  }
  const inicio = entrada.inicio
  const fim = entrada.fim.trim() === '' ? inicio : entrada.fim
  const dataOriginal = entrada.dataOriginal?.trim() || undefined
  if (entrada.tipoId === TIPO_REPOSICAO) {
    if (!dataOriginal) {
      erros.push({ campo: 'dataOriginal', mensagem: 'Informe a data da aula original.' })
    } else if (!dataValida(dataOriginal) || anoDaData(dataOriginal) !== calendario.ano) {
      erros.push({ campo: 'dataOriginal', mensagem: `Use uma data de ${calendario.ano}.` })
    } else if (!descricao) {
      descricao = nomeReposicao(dataOriginal)
    }
  }
  if (!descricao) {
    erros.push({ campo: 'descricao', mensagem: 'Escreva o nome do evento.' })
  }
  if (!inicio) {
    erros.push({ campo: 'inicio', mensagem: 'Informe o início.' })
  } else if (!dataValida(inicio) || anoDaData(inicio) !== calendario.ano) {
    erros.push({ campo: 'inicio', mensagem: `Use uma data de ${calendario.ano}.` })
  }
  if (fim && (!dataValida(fim) || anoDaData(fim) !== calendario.ano)) {
    erros.push({ campo: 'fim', mensagem: `Use uma data de ${calendario.ano}.` })
  }
  if (inicio && fim && dataValida(inicio) && dataValida(fim) && compararIso(fim, inicio) < 0) {
    erros.push({ campo: 'fim', mensagem: 'O fim não pode ser antes do início.' })
  }
  if (entrada.tipoId === TIPO_SABADO_LETIVO) {
    const msg = 'Sábado letivo só pode cair em sábado.'
    if (inicio && dataValida(inicio) && !ehSabado(inicio)) {
      erros.push({ campo: 'inicio', mensagem: msg })
    }
    if (fim && dataValida(fim) && !ehSabado(fim)) {
      erros.push({ campo: 'fim', mensagem: msg })
    }
  }
  if (entrada.tipoId === TIPO_REPOSICAO && inicio && dataValida(inicio)) {
    if (fim && fim !== inicio) {
      erros.push({ campo: 'fim', mensagem: 'Reposição é um dia só.' })
    }
    if (ehDomingo(inicio)) {
      erros.push({ campo: 'inicio', mensagem: 'Reposição não pode cair no domingo.' })
    } else if (
      calendario.eventos.some(
        (e) =>
          e.id !== ignorarId &&
          eventoCobreIso(e, inicio) &&
          (e.tipoId === TIPO_FERIADO || e.tipoId === TIPO_RECESSO),
      )
    ) {
      erros.push({
        campo: 'inicio',
        mensagem: 'Reposição não pode cair em feriado ou recesso.',
      })
    } else if (
      calendario.eventos.some(
        (e) =>
          e.id !== ignorarId &&
          eventoCobreIso(e, inicio) &&
          tipoTiraAula(calendario, e.tipoId),
      )
    ) {
      erros.push({
        campo: 'inicio',
        mensagem: 'Reposição não pode cair neste dia.',
      })
    } else if (diaEhLetivo(calendario, inicio, ignorarId)) {
      avisos.push({
        campo: 'inicio',
        mensagem:
          'Este dia já é aula. A reposição marca o calendário e não aumenta o total de dias letivos. Para somar um dia, reponha num sábado ou em outro dia que ainda não seja letivo.',
      })
    }
    if (dataOriginal && dataValida(dataOriginal)) {
      const mesmaOrig = calendario.eventos.find(
        (e) =>
          e.id !== ignorarId &&
          e.tipoId === TIPO_REPOSICAO &&
          e.dataOriginal === dataOriginal,
      )
      if (mesmaOrig) {
        erros.push({
          campo: 'dataOriginal',
          mensagem: `Esta aula original já foi reposta em ${formatarDataBr(mesmaOrig.inicio)}.`,
        })
      }
      if (diaDaSemanaUtc(inicio) === diaDaSemanaUtc(dataOriginal)) {
        avisos.push({
          campo: 'inicio',
          mensagem: 'Esta reposição cai no mesmo dia da semana da aula original.',
        })
      }
    }
  }
  if (
    inicio &&
    fim &&
    dataValida(inicio) &&
    dataValida(fim) &&
    TIPOS_SEM_CRUZAR.has(entrada.tipoId)
  ) {
    const cruzado = calendario.eventos.find(
      (e) =>
        e.id !== ignorarId &&
        e.tipoId === entrada.tipoId &&
        intervalosCruzam(e.inicio, e.fim, inicio, fim),
    )
    if (cruzado) {
      const mensagem =
        entrada.tipoId === TIPO_REPOSICAO
          ? `Já existe ${cruzado.descricao} neste dia.`
          : `Este intervalo cruza com ${cruzado.descricao} (${formatarIntervaloBr(cruzado.inicio, cruzado.fim)}). Ajuste as datas.`
      erros.push({ campo: 'inicio', mensagem })
    }
  }
  return { erros, avisos, descricao, inicio, fim, dataOriginal }
}

export function adicionarEvento(
  calendario: Calendario,
  entrada: { tipoId: string; descricao: string; inicio: string; fim: string; dataOriginal?: string },
): Resultado<Calendario> {
  const { erros, avisos, descricao, inicio, fim, dataOriginal } = validarEvento(
    calendario,
    entrada,
  )
  if (erros.length > 0) return { ok: false, erros }
  const evento: Evento = {
    id: novoId('evento'),
    tipoId: entrada.tipoId,
    inicio,
    fim,
    descricao,
    origem: 'manual',
    ...(dataOriginal ? { dataOriginal } : {}),
  }
  return {
    ok: true,
    avisos: avisos.length > 0 ? avisos : undefined,
    calendario: { ...calendario, eventos: [...calendario.eventos, evento] },
  }
}

export function atualizarEvento(
  calendario: Calendario,
  id: string,
  entrada: { tipoId: string; descricao: string; inicio: string; fim: string; dataOriginal?: string },
): Resultado<Calendario> {
  const atual = calendario.eventos.find((e) => e.id === id)
  if (!atual) {
    return { ok: false, erros: [{ campo: 'descricao', mensagem: 'Evento não encontrado.' }] }
  }
  const { erros, avisos, descricao, inicio, fim, dataOriginal } = validarEvento(
    calendario,
    entrada,
    id,
  )
  if (erros.length > 0) return { ok: false, erros }
  return {
    ok: true,
    avisos: avisos.length > 0 ? avisos : undefined,
    calendario: {
      ...calendario,
      eventos: calendario.eventos.map((e) =>
        e.id === id
          ? {
              ...e,
              tipoId: entrada.tipoId,
              descricao,
              inicio,
              fim,
              dataOriginal: entrada.tipoId === TIPO_REPOSICAO ? dataOriginal : undefined,
              aceitosEmFeriado: aceitosAindaNoIntervalo(e, inicio, fim),
            }
          : e,
      ),
    },
  }
}

function aceitosAindaNoIntervalo(
  evento: Evento,
  inicio: string,
  fim: string,
): string[] | undefined {
  const ainda = evento.aceitosEmFeriado?.filter(
    (iso) => compararIso(inicio, iso) <= 0 && compararIso(iso, fim) <= 0,
  )
  if (!ainda || ainda.length === 0) return undefined
  return ainda
}

function validarDatasFeriado(
  calendario: Calendario,
  inicio: string,
  fimBruto: string,
  tipoId: string,
  ignorarId?: string,
): { erros: ErroCampo[]; inicio: string; fim: string } {
  const erros: ErroCampo[] = []
  const fim = fimBruto.trim() === '' ? inicio : fimBruto
  if (!inicio) {
    erros.push({ campo: 'inicio', mensagem: 'Informe a data.' })
  } else if (!dataValida(inicio) || anoDaData(inicio) !== calendario.ano) {
    erros.push({ campo: 'inicio', mensagem: `Use uma data de ${calendario.ano}.` })
  }
  if (fim && (!dataValida(fim) || anoDaData(fim) !== calendario.ano)) {
    erros.push({ campo: 'fim', mensagem: `Use uma data de ${calendario.ano}.` })
  }
  if (inicio && fim && dataValida(inicio) && dataValida(fim) && compararIso(fim, inicio) < 0) {
    erros.push({ campo: 'fim', mensagem: 'O fim não pode ser antes do início.' })
  }
  if (inicio && fim && dataValida(inicio) && dataValida(fim)) {
    const outro = calendario.eventos.find(
      (e) =>
        e.id !== ignorarId &&
        e.tipoId === tipoId &&
        intervalosCruzam(e.inicio, e.fim, inicio, fim),
    )
    if (outro) {
      erros.push({
        campo: 'inicio',
        mensagem: `Já existe ${outro.descricao} neste dia.`,
      })
    }
  }
  return { erros, inicio, fim }
}

export function adicionarFeriadoManual(
  calendario: Calendario,
  entrada: { descricao: string; inicio: string; fim?: string; tipo: 'feriado' | 'recesso' },
): Resultado<Calendario> {
  const descricao = entrada.descricao.trim()
  const erros: ErroCampo[] = []
  if (!descricao) {
    erros.push({ campo: 'descricao', mensagem: 'Escreva o nome do feriado.' })
  }
  const tipoId = entrada.tipo === 'recesso' ? TIPO_RECESSO : TIPO_FERIADO
  const datas = validarDatasFeriado(calendario, entrada.inicio, entrada.fim ?? '', tipoId)
  erros.push(...datas.erros)
  if (erros.length > 0) return { ok: false, erros }
  const evento: Evento = {
    id: novoId('evento'),
    tipoId,
    inicio: datas.inicio,
    fim: datas.fim,
    descricao,
    origem: 'manual',
  }
  return {
    ok: true,
    calendario: { ...calendario, eventos: [...calendario.eventos, evento] },
  }
}

export function editarEvento(
  calendario: Calendario,
  id: string,
  entrada: { descricao: string; inicio: string; fim?: string },
): Resultado<Calendario> {
  const atual = calendario.eventos.find((e) => e.id === id)
  if (!atual) {
    return { ok: false, erros: [{ campo: 'descricao', mensagem: 'Evento não encontrado.' }] }
  }
  const descricao = entrada.descricao.trim()
  const erros: ErroCampo[] = []
  if (!descricao) {
    erros.push({ campo: 'descricao', mensagem: 'Escreva o nome do feriado.' })
  }
  const datas = validarDatasFeriado(
    calendario,
    entrada.inicio,
    entrada.fim ?? entrada.inicio,
    atual.tipoId,
    id,
  )
  erros.push(...datas.erros)
  if (erros.length > 0) return { ok: false, erros }
  return {
    ok: true,
    calendario: {
      ...calendario,
      eventos: calendario.eventos.map((e) =>
        e.id === id
          ? {
              ...e,
              descricao,
              inicio: datas.inicio,
              fim: datas.fim,
              editado: e.origem === 'automatico' ? true : e.editado,
            }
          : e,
      ),
    },
  }
}

export function apagarEvento(calendario: Calendario, id: string): Calendario {
  const alvo = calendario.eventos.find((e) => e.id === id)
  const chavesExcluidas =
    alvo?.chave && !calendario.chavesExcluidas.includes(alvo.chave)
      ? [...calendario.chavesExcluidas, alvo.chave]
      : calendario.chavesExcluidas
  return {
    ...calendario,
    chavesExcluidas,
    eventos: calendario.eventos.filter((e) => e.id !== id),
  }
}

export function apagarEventoNoIntervalo(
  calendario: Calendario,
  id: string,
  corteInicio: string,
  corteFim: string,
): Resultado<Calendario> {
  const ev = calendario.eventos.find((e) => e.id === id)
  if (!ev) {
    return { ok: false, erros: [{ campo: 'inicio', mensagem: 'Evento não encontrado.' }] }
  }
  if (!intervalosCruzam(ev.inicio, ev.fim, corteInicio, corteFim)) {
    return {
      ok: false,
      erros: [{ campo: 'inicio', mensagem: 'Este lançamento não cobre esses dias.' }],
    }
  }
  const corteA = compararIso(corteInicio, ev.inicio) < 0 ? ev.inicio : corteInicio
  const corteB = compararIso(corteFim, ev.fim) > 0 ? ev.fim : corteFim
  if (compararIso(corteA, ev.inicio) <= 0 && compararIso(corteB, ev.fim) >= 0) {
    return { ok: true, calendario: apagarEvento(calendario, id) }
  }
  const esquerdaFim = somarDias(corteA, -1)
  const direitaInicio = somarDias(corteB, 1)
  const temEsquerda = compararIso(ev.inicio, esquerdaFim) <= 0
  const temDireita = compararIso(direitaInicio, ev.fim) <= 0
  const editado = ev.origem === 'automatico' ? true : ev.editado
  const eventos = calendario.eventos.flatMap((e) => {
    if (e.id !== id) return [e]
    const partes: Evento[] = []
    if (temEsquerda) {
      partes.push({ ...e, fim: esquerdaFim, editado })
    }
    if (temDireita) {
      partes.push(
        temEsquerda
          ? {
              ...e,
              id: novoId('evento'),
              inicio: direitaInicio,
              origem: 'manual',
              chave: undefined,
              editado: undefined,
            }
          : { ...e, inicio: direitaInicio, editado },
      )
    }
    return partes
  })
  return { ok: true, calendario: { ...calendario, eventos } }
}

export function resumoTrocaAno(calendario: Calendario): string {
  const partes: string[] = []
  const nomesApagados = calendario.chavesExcluidas.map((chave) => {
    const modelo = modelosAutomaticos(calendario.ano).find((m) => m.chave === chave)
    return modelo?.descricao ?? chave
  })
  if (nomesApagados.length > 0) {
    partes.push(`Você apagou ${nomesApagados.join(', ')}`)
  }
  const editados = calendario.eventos
    .filter((e) => e.origem === 'automatico' && e.editado)
    .map((e) => e.descricao)
  if (editados.length > 0) {
    partes.push(`editou ${editados.join(', ')}`)
  }
  if (partes.length === 0) return ''
  return `${partes.join('; ')}.`
}

export function trocarAno(
  calendario: Calendario,
  anoNovo: number | string,
  modo: 'manter' | 'padrao',
): Resultado<Calendario> {
  const ano = lerAno(anoNovo)
  if (ano === null || ano < 1900 || ano > 2100) {
    return {
      ok: false,
      erros: [
        {
          campo: 'ano',
          mensagem: 'Informe um ano com quatro números, entre 1900 e 2100.',
        },
      ],
    }
  }
  const modelosAntigos = modelosAutomaticos(calendario.ano)
  let excluidas =
    modo === 'padrao' ? [] : [...calendario.chavesExcluidas]
  const nomePorChave = new Map<string, string>()
  const manuais: Evento[] = []

  for (const evento of calendario.eventos) {
    if (evento.origem === 'manual') {
      const novo = moverParaAno(evento.inicio, ano)
      if (novo) {
        manuais.push({ ...evento, id: novoId('evento'), inicio: novo, fim: novo })
      }
      continue
    }
    if (modo === 'padrao' || !evento.chave) continue
    const padraoAntigo = modelosAntigos.find((m) => m.chave === evento.chave)
    const dataFoiEditada = padraoAntigo ? padraoAntigo.inicio !== evento.inicio : false
    if (dataFoiEditada) {
      excluidas = excluidas.includes(evento.chave)
        ? excluidas
        : [...excluidas, evento.chave]
      const novo = moverParaAno(evento.inicio, ano)
      if (novo) {
        manuais.push({
          ...evento,
          id: novoId('evento'),
          origem: 'manual',
          chave: undefined,
          editado: undefined,
          inicio: novo,
          fim: novo,
        })
      }
      continue
    }
    if (evento.editado) {
      nomePorChave.set(evento.chave, evento.descricao)
    }
  }

  const pontos = calendario.pontosFacultativos
  const automaticos = eventosDosModelos(ano, pontos, excluidas).map((e) => {
    if (e.chave && nomePorChave.has(e.chave)) {
      return { ...e, descricao: nomePorChave.get(e.chave)!, editado: true }
    }
    return e
  })

  return {
    ok: true,
    calendario: {
      ...calendario,
      ano,
      chavesExcluidas: excluidas,
      eventos: [...automaticos, ...manuais],
    },
  }
}

export function cadaIsoDoAno(ano: number): string[] {
  const lista: string[] = []
  let iso = `${ano}-01-01`
  const limite = `${ano}-12-31`
  while (iso <= limite) {
    lista.push(iso)
    iso = somarDias(iso, 1)
  }
  return lista
}

function seriaAulaSemFeriadoRecesso(calendario: Calendario, iso: string): boolean {
  if (
    calendario.eventos.some(
      (e) =>
        eventoCobreIso(e, iso) &&
        e.tipoId !== TIPO_FERIADO &&
        e.tipoId !== TIPO_RECESSO &&
        tipoTiraAula(calendario, e.tipoId),
    )
  ) {
    return false
  }
  const weekday = diaDaSemanaUtc(iso)
  if (weekday === null || weekday === 0) return false
  if (weekday === 6) return temAulaDeSabado(calendario, iso)
  return calendario.periodos.some(
    (p) => compararIso(p.inicio, iso) <= 0 && compararIso(iso, p.fim) <= 0,
  )
}

export function aulasARepor(
  calendario: Calendario,
): { dataOriginal: string; descricao: string; eventoId: string }[] {
  const minimo = calendario.minimoDiasLetivos ?? 200
  if (totalDiasLetivos(calendario) >= minimo) return []
  const repostas = new Set(
    calendario.eventos
      .filter((e) => e.tipoId === TIPO_REPOSICAO && e.dataOriginal)
      .map((e) => e.dataOriginal as string),
  )
  const lista: { dataOriginal: string; descricao: string; eventoId: string }[] = []
  const vistos = new Set<string>()
  for (const evento of calendario.eventos) {
    if (evento.tipoId !== TIPO_FERIADO && evento.tipoId !== TIPO_RECESSO) continue
    let iso = evento.inicio
    while (iso <= evento.fim) {
      if (
        !vistos.has(iso) &&
        !repostas.has(iso) &&
        seriaAulaSemFeriadoRecesso(calendario, iso)
      ) {
        vistos.add(iso)
        lista.push({
          dataOriginal: iso,
          descricao: evento.descricao,
          eventoId: evento.id,
        })
      }
      if (iso === evento.fim) break
      iso = somarDias(iso, 1)
    }
  }
  lista.sort((a, b) => a.dataOriginal.localeCompare(b.dataOriginal))
  return lista
}

export function diaContaComoLetivo(calendario: Calendario, iso: string): boolean {
  return diaEhLetivo(calendario, iso)
}

export function totalDiasLetivos(calendario: Calendario): number {
  return cadaIsoDoAno(calendario.ano).filter((iso) => diaContaComoLetivo(calendario, iso)).length
}

export function excessoDiasLetivos(calendario: Calendario): number {
  const minimo = calendario.minimoDiasLetivos ?? 200
  return Math.max(0, totalDiasLetivos(calendario) - minimo)
}

export function retirarLetivo(calendario: Calendario, iso: string): Resultado<Calendario> {
  const erros: ErroCampo[] = []
  if (!iso) {
    erros.push({ campo: 'inicio', mensagem: 'Informe o início.' })
  } else if (!dataValida(iso) || anoDaData(iso) !== calendario.ano) {
    erros.push({ campo: 'inicio', mensagem: `Use uma data de ${calendario.ano}.` })
  } else if (ehDomingo(iso)) {
    erros.push({ campo: 'inicio', mensagem: 'Escolha um dia de aula.' })
  } else if (calendario.eventos.some((e) => e.tipoId === TIPO_RETIRADA && eventoCobreIso(e, iso))) {
    erros.push({ campo: 'inicio', mensagem: 'Este dia já foi retirado.' })
  } else if (!diaEhLetivo(calendario, iso)) {
    erros.push({ campo: 'inicio', mensagem: 'Este dia já não é letivo.' })
  }
  if (erros.length > 0) return { ok: false, erros }
  const evento: Evento = {
    id: novoId('evento'),
    tipoId: TIPO_RETIRADA,
    inicio: iso,
    fim: iso,
    descricao: 'Letivo retirado',
    origem: 'manual',
  }
  return {
    ok: true,
    calendario: { ...calendario, eventos: [...calendario.eventos, evento] },
  }
}

export function corTextoSobre(fundo: string): string {
  const hex = fundo.replace('#', '')
  if (hex.length !== 6) return '#1b1f23'
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum > 0.55 ? '#1b1f23' : '#ffffff'
}
