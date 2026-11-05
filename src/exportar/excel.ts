import {
  corTextoSobre,
  formatarIntervaloBr,
  gradeMes,
  NOMES_MESES,
  pinturaDoDia,
  type Calendario,
} from '../dominio/calendario'
import { linhasTabela, totaisLetivos } from '../dominio/tabela'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function xml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function idEstilo(cor: string): string {
  return `s${cor.replace('#', '').toLowerCase()}`
}

function corDaCelula(calendario: Calendario, iso: string): string | null {
  const pintura = pinturaDoDia(calendario, iso)
  if (pintura.fundo) return pintura.fundo.cor
  const marca = pintura.marcas[0]
  return marca ? marca.tipo.cor : null
}

function celula(texto: string, estilo?: string, indice?: number): string {
  const idx = indice !== undefined ? ` ss:Index="${indice}"` : ''
  const st = estilo ? ` ss:StyleID="${estilo}"` : ''
  return `<Cell${idx}${st}><Data ss:Type="String">${xml(texto)}</Data></Cell>`
}

function linha(celulas: string[]): string {
  return `<Row>${celulas.join('')}</Row>`
}

function estilosDoCalendario(calendario: Calendario): string {
  const cores = new Set<string>()
  for (let mes = 1; mes <= 12; mes += 1) {
    for (const c of gradeMes(calendario.ano, mes)) {
      if (c.foraDoMes) continue
      const cor = corDaCelula(calendario, c.iso)
      if (cor) cores.add(cor.toLowerCase())
    }
  }
  const pintados = [...cores].map((cor) => {
    const hex = cor.startsWith('#') ? cor : `#${cor}`
    return `<Style ss:ID="${idEstilo(hex)}"><Interior ss:Color="${hex.toUpperCase()}" ss:Pattern="Solid"/><Font ss:Color="${corTextoSobre(hex)}"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>`
  })
  return `<Styles>
<Style ss:ID="Default"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/></Style>
<Style ss:ID="titulo"><Font ss:Bold="1" ss:Size="12"/><Alignment ss:Horizontal="Center"/></Style>
<Style ss:ID="cab"><Font ss:Bold="1" ss:Size="9"/><Alignment ss:Horizontal="Center"/></Style>
<Style ss:ID="fora"><Font ss:Color="#9AA3AB"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
${pintados.join('')}
</Styles>`
}

function gradeCalendario(calendario: Calendario): string {
  const linhas: string[] = []
  for (let faixa = 0; faixa < 3; faixa += 1) {
    const meses = [1, 2, 3, 4].map((n) => faixa * 4 + n)
    linhas.push(
      linha(
        meses.map((mes, i) => {
          const nome = NOMES_MESES[mes - 1] ?? String(mes)
          const col = i * 8 + 1
          return `<Cell ss:Index="${col}" ss:MergeAcross="6" ss:StyleID="titulo"><Data ss:Type="String">${xml(`${nome} ${calendario.ano}`)}</Data></Cell>`
        }),
      ),
    )
    linhas.push(
      linha(
        meses.flatMap((_, i) =>
          DIAS_SEMANA.map((d, j) => celula(d, 'cab', i * 8 + 1 + j)),
        ),
      ),
    )
    for (let semana = 0; semana < 6; semana += 1) {
      const celulasSemana: string[] = []
      for (let i = 0; i < meses.length; i += 1) {
        const mes = meses[i] ?? 1
        const grade = gradeMes(calendario.ano, mes)
        for (let d = 0; d < 7; d += 1) {
          const cel = grade[semana * 7 + d]
          const col = i * 8 + 1 + d
          if (!cel) {
            celulasSemana.push(celula('', undefined, col))
            continue
          }
          if (cel.foraDoMes) {
            celulasSemana.push(celula(String(cel.dia), 'fora', col))
            continue
          }
          const cor = corDaCelula(calendario, cel.iso)
          celulasSemana.push(celula(String(cel.dia), cor ? idEstilo(cor) : undefined, col))
        }
      }
      linhas.push(linha(celulasSemana))
    }
    linhas.push('<Row></Row>')
  }
  return linhas.join('')
}

export function excelDoCalendario(calendario: Calendario): string {
  const linhas = linhasTabela(calendario)
  const totais = totaisLetivos(calendario)
  const detalhe = [
    linha([celula('Período', 'cab'), celula('Datas', 'cab'), celula('Lançamento', 'cab')]),
    ...linhas.map((l) =>
      linha([
        celula(l.periodoNome),
        celula(formatarIntervaloBr(l.inicio, l.fim)),
        celula(l.texto),
      ]),
    ),
  ].join('')
  const resumoLinhas = totais
    ? [
        linha([celula('Mês', 'cab'), celula('Dias letivos', 'cab')]),
        ...totais.porMes.map((m) =>
          linha([celula(NOMES_MESES[m.mes - 1] ?? String(m.mes)), celula(String(m.total))]),
        ),
        linha([celula('Ano', 'titulo'), celula(String(totais.ano))]),
        ...totais.porPeriodo.map((p) => linha([celula(p.nome), celula(String(p.total))])),
      ].join('')
    : linha([celula('Totais desligados nas regras')])
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${estilosDoCalendario(calendario)}
<Worksheet ss:Name="Calendário"><Table ss:DefaultColumnWidth="18">${gradeCalendario(calendario)}</Table></Worksheet>
<Worksheet ss:Name="Eventos"><Table>${detalhe}</Table></Worksheet>
<Worksheet ss:Name="Resumo"><Table>${linha([celula(calendario.nome, 'titulo'), celula(calendario.instituicao), celula(String(calendario.ano))])}${resumoLinhas}</Table></Worksheet>
</Workbook>`
}

export function nomeArquivoExcel(calendario: Calendario): string {
  const limpo = calendario.nome.replace(/[<>:"/\\|?*]/g, '').trim() || 'calendario'
  return `krono-${limpo}-${calendario.ano}.xls`
}
