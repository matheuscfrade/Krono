import {
  cadaIsoDoAno,
  diaContaComoLetivo,
  ehTipoLetivo,
  formatarIntervaloBr,
  regrasDo,
  tiposDoDia,
  type Calendario,
} from './calendario'
import { somarDias } from './feriados'

export type LinhaTabela = {
  periodoId: string
  periodoNome: string
  inicio: string
  fim: string
  texto: string
}

export type TotaisLetivos = {
  ano: number
  porMes: { mes: number; total: number }[]
  porPeriodo: { periodoId: string; nome: string; total: number }[]
}

function descricaoDoDia(calendario: Calendario, iso: string): string {
  const tipos = tiposDoDia(calendario, iso).filter((tipo) => !ehTipoLetivo(tipo))
  if (tipos.length === 0) return ''
  const partes = tipos.map((tipo) => {
    const nomes = calendario.eventos
      .filter((e) => e.tipoId === tipo.id && e.inicio <= iso && iso <= e.fim)
      .map((e) => e.descricao)
    if (nomes.length === 0) return tipo.nome
    return nomes.map((n) => `${tipo.nome} — ${n}`).join('; ')
  })
  return partes.join('; ')
}

export function linhasTabela(calendario: Calendario): LinhaTabela[] {
  const linhas: LinhaTabela[] = []
  for (const periodo of calendario.periodos) {
    let atual: LinhaTabela | null = null
    let iso = periodo.inicio
    while (iso <= periodo.fim) {
      const texto = descricaoDoDia(calendario, iso)
      if (texto) {
        if (atual && atual.texto === texto) {
          atual.fim = iso
        } else {
          atual = {
            periodoId: periodo.id,
            periodoNome: periodo.nome,
            inicio: iso,
            fim: iso,
            texto,
          }
          linhas.push(atual)
        }
      } else {
        atual = null
      }
      if (iso === periodo.fim) break
      iso = somarDias(iso, 1)
    }
  }
  return linhas
}

export function rotuloLinha(linha: LinhaTabela): string {
  return `${formatarIntervaloBr(linha.inicio, linha.fim)} — ${linha.texto}`
}

export function totaisLetivos(calendario: Calendario): TotaisLetivos | null {
  if (!regrasDo(calendario).mostrarTotais) return null
  const porMes = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, total: 0 }))
  for (const iso of cadaIsoDoAno(calendario.ano)) {
    if (!diaContaComoLetivo(calendario, iso)) continue
    const mes = Number(iso.slice(5, 7))
    const item = porMes[mes - 1]
    if (item) item.total += 1
  }
  const porPeriodo = calendario.periodos.map((p) => {
    let total = 0
    let iso = p.inicio
    while (iso <= p.fim) {
      if (diaContaComoLetivo(calendario, iso)) total += 1
      if (iso === p.fim) break
      iso = somarDias(iso, 1)
    }
    return { periodoId: p.id, nome: p.nome, total }
  })
  return {
    ano: porMes.reduce((s, m) => s + m.total, 0),
    porMes,
    porPeriodo,
  }
}
