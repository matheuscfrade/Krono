import { describe, expect, it } from 'vitest'
import { adicionarEvento, adicionarPeriodo, criarCalendario } from './calendario'
import { linhasTabela, totaisLetivos } from './tabela'

function etapa2026() {
  const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'IFMG', ano: 2026 })
  if (!r.ok) throw new Error('criar')
  const p = adicionarPeriodo(r.calendario, {
    nome: '1ª Etapa',
    inicio: '2026-02-02',
    fim: '2026-04-30',
  })
  if (!p.ok) throw new Error('periodo')
  return p.calendario
}

describe('tabela', () => {
  it('não lista dia que é só letivo; junta marcações seguidas', () => {
    const cal = etapa2026()
    const linhas = linhasTabela(cal)
    expect(linhas.some((l) => l.texto.includes('Dia letivo'))).toBe(false)
    const carnaval = linhas.find((l) => l.texto.includes('Carnaval'))
    expect(carnaval).toBeTruthy()
    const totais = totaisLetivos(cal)
    expect(totais?.ano).toBeGreaterThan(50)
    expect(totais?.porPeriodo[0]?.total).toBe(totais?.ano)
  })

  it('evento no dia letivo aparece só como marcação', () => {
    const ev = adicionarEvento(etapa2026(), {
      tipoId: 'tipo-evento',
      descricao: 'Acolhimento',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    expect(ev.ok).toBe(true)
    if (!ev.ok) return
    const linha = linhasTabela(ev.calendario).find((l) => l.inicio === '2026-03-10')
    expect(linha?.texto).toBe('Evento — Acolhimento')
    expect(linha?.texto.includes('Dia letivo')).toBe(false)
  })
})
