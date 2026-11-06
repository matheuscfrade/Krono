import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEventHandler,
  type PointerEvent,
  type ReactNode,
} from 'react'
import {
  adicionarEvento,
  adicionarFeriadoManual,
  adicionarPeriodo,
  ANCORA_FIM_PERIODO,
  ANCORA_INICIO_PERIODO,
  adicionarRegraUsuario,
  adicionarTipoDia,
  apagarEvento,
  apagarEventoNoIntervalo,
  apagarPeriodo,
  apagarRegraUsuario,
  apagarTipoDia,
  atualizarEvento,
  atualizarPeriodo,
  atualizarRegraUsuario,
  aulasARepor,
  corTextoSobre,
  definirCorTipo,
  definirParametrosTipo,
  definirRegraLigada,
  diaEhLetivo,
  editarEvento,
  ehTipoLetivo,
  formatarDataBr,
  formatarIntervaloBr,
  gradeMes,
  isoDeDataBr,
  legenda,
  nomeReposicao,
  NOMES_MESES,
  parametrosDoTipo,
  regrasDo,
  LIMITE_MARCAS_DIA,
  pinturaDoDia,
  resumoTrocaAno,
  tipoEhLancavel,
  tipoMostraCombina,
  tipoPodeApagar,
  tiposCriadosOrdenados,
  tiposDiaOrdenados,
  tiposPadraoOrdenados,
  tiposParaPrazo,
  tiposDoDia,
  TIPO_FERIADO,
  TIPO_RECESSO,
  TIPO_REPOSICAO,
  TIPO_RETIRADA,
  TIPO_SABADO_LETIVO,
  ehSabado,
  trocarAno,
  voltarCorSugerida,
  type Calendario,
  type EntradaRegraUsuario,
  type ErroCampo,
  type ModeloRegraUsuario,
  type PinturaDoDia,
  type RegraUsuario,
  type UnidadePrazo,
} from '../dominio/calendario'
import {
  aceitarAvisoEventoNoDia,
  conflitosDoCalendario,
  conflitosDoDia,
  type Conflito,
} from '../dominio/conflitos'
import { linhasTabela, totaisLetivos } from '../dominio/tabela'
import { baixarArquivo } from '../exportar/arquivo'
import { excelDoCalendario, nomeArquivoExcel } from '../exportar/excel'
import { AjudaDeCombina, AjudaDoTipo, AjudaPeriodo } from '../ui/AjudaPintura'
import { Dica, DICA_COMBINA_NAO, DICA_COMBINA_SIM, DICA_PRAZO } from '../ui/Dica'
import { CampoData } from '../ui/CampoData'
import { MesesImpressao } from '../ui/MesesImpressao'
import { Rodape } from '../ui/Rodape'

type Props = {
  calendario: Calendario
  onMudou: (calendario: Calendario) => void
  onVoltar: () => void
  onSalvarArquivo: () => void
  onAbrirArquivo: () => void
  mudancasNaoBaixadas: boolean
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CONFIRMA_VOLTAR =
  'Este calendário ainda não foi baixado. Se voltar, o trabalho some. Voltar mesmo assim?'

function erroDoCampo(erros: ErroCampo[], campo: string): string {
  return erros.find((e) => e.campo === campo)?.mensagem ?? ''
}

function tituloDoDia(iso: string): string {
  const partes = iso.split('-')
  const ano = partes[0]
  const mes = Number(partes[1])
  const dia = Number(partes[2])
  const nomeMes = NOMES_MESES[mes - 1] ?? ''
  const mesMin = nomeMes.charAt(0).toLowerCase() + nomeMes.slice(1)
  return `${dia} de ${mesMin} de ${ano}`
}

function estiloPintura(fundo: PinturaDoDia['fundo']): CSSProperties | undefined {
  if (!fundo) return undefined
  return { background: fundo.cor, color: corTextoSobre(fundo.cor) }
}

function AmostraTipo({ cor }: { cor?: string }) {
  if (!cor) return null
  return <span className="amostra" style={{ background: cor }} aria-hidden="true" />
}

function ItemConflito({
  c,
  onAceitar,
}: {
  c: Conflito
  onAceitar: (c: Conflito) => void
}) {
  return (
    <li className={c.gravidade === 'erro' ? 'conflito-erro' : 'conflito-aviso'}>
      <strong>{c.gravidade === 'erro' ? 'Erro' : 'Aviso'}</strong>
      <p>
        {c.mensagem} {c.comoResolver}
      </p>
      {c.podeAceitar && c.eventoId && c.iso ? (
        <div className="acoes">
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => onAceitar(c)}
          >
            Manter neste dia
          </button>
        </div>
      ) : null}
    </li>
  )
}

function linhasDica(
  calendario: Calendario,
  iso: string,
  pintura: PinturaDoDia,
  conflitosDoIso: Conflito[] = [],
) {
  const linhas: { cor: string; texto: string }[] = []
  for (const c of conflitosDoIso) {
    linhas.push({
      cor: c.gravidade === 'erro' ? '#c53030' : '#b7791f',
      texto: `${c.gravidade === 'erro' ? 'Erro' : 'Aviso'} — ${c.mensagem}`,
    })
  }
  if (pintura.fundo) {
    const eventosFundo = eventosDoTipo(calendario, iso, pintura.fundo.id)
    if (eventosFundo.length === 0) {
      linhas.push({ cor: pintura.fundo.cor, texto: pintura.fundo.nome })
    } else {
      for (const ev of eventosFundo) {
        linhas.push({
          cor: pintura.fundo.cor,
          texto: `${pintura.fundo.nome} — ${ev.descricao}`,
        })
      }
    }
  }
  for (const marca of pintura.marcas) {
    linhas.push({
      cor: marca.tipo.cor,
      texto: `${marca.tipo.nome} — ${marca.evento.descricao}`,
    })
  }
  return linhas
}

function eventosDoTipo(calendario: Calendario, iso: string, tipoId: string) {
  return calendario.eventos.filter(
    (e) => e.tipoId === tipoId && e.inicio <= iso && iso <= e.fim,
  )
}

function ehFeriadoOuRecesso(tipoId: string): boolean {
  return tipoId === TIPO_FERIADO || tipoId === TIPO_RECESSO
}

function intervalosCruzam(aInicio: string, aFim: string, bInicio: string, bFim: string): boolean {
  return aInicio <= bFim && bInicio <= aFim
}

function cadastrosDoIntervalo(calendario: Calendario, inicio: string, fim: string) {
  const eventos = calendario.eventos
    .filter(
      (e) =>
        e.tipoId !== TIPO_RETIRADA && intervalosCruzam(e.inicio, e.fim, inicio, fim),
    )
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.fim.localeCompare(b.fim))
  return { eventos }
}

function rotuloDoDia(calendario: Calendario, iso: string, dia: number): string {
  const tipos = tiposDoDia(calendario, iso)
  if (tipos.length === 0) return String(dia)
  const partes = tipos.flatMap((tipo) => {
    const nomes = eventosDoTipo(calendario, iso, tipo.id).map((e) => e.descricao)
    if (nomes.length === 0) return [tipo.nome]
    return nomes.map((nome) => `${tipo.nome} — ${nome}`)
  })
  return `${dia}\n${partes.join('\n')}`
}

function Dialogo({
  tituloId,
  titulo,
  className,
  children,
}: {
  tituloId: string
  titulo: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className="dialogo-fundo">
      <div
        className={className ? `dialogo ${className}` : 'dialogo'}
        role="dialog"
        aria-labelledby={tituloId}
        aria-modal="true"
      >
        <h2 id={tituloId}>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

function FormularioRegra({
  calendario,
  regra,
  modelo,
  onModelo,
  erros,
  onSubmit,
  onCancelar,
}: {
  calendario: Calendario
  regra: RegraUsuario | null
  modelo: ModeloRegraUsuario
  onModelo: (modelo: ModeloRegraUsuario) => void
  erros: ErroCampo[]
  onSubmit: (entrada: EntradaRegraUsuario) => void
  onCancelar: () => void
}) {
  const tipos = tiposDiaOrdenados(calendario.tiposDia.filter((t) => !ehTipoLetivo(t)))
  const tiposPrazo = tiposParaPrazo(
    calendario,
    regra?.modelo === 'prazo' ? [regra.origem ?? '', regra.destinoTipoId ?? ''] : [],
  )
  const opcoesPrazo = (
    <>
      <option value={ANCORA_INICIO_PERIODO}>Início de cada período</option>
      <option value={ANCORA_FIM_PERIODO}>Fim de cada período</option>
      {tiposPrazo.map((t) => (
        <option key={t.id} value={t.id}>
          {t.nome}
        </option>
      ))}
    </>
  )
  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault()
        const dados = new FormData(evento.currentTarget)
        onSubmit({
          nome: String(dados.get('nome') ?? ''),
          modelo,
          tipoId: String(dados.get('tipoId') ?? ''),
          palavra: String(dados.get('palavra') ?? ''),
          origem: String(dados.get('origem') ?? ANCORA_FIM_PERIODO),
          destinoTipoId: String(dados.get('destinoTipoId') ?? ''),
          minimoDias: Number(dados.get('minimoDias')),
          unidade: (['corridos', 'uteis', 'letivos'].includes(String(dados.get('unidade')))
            ? String(dados.get('unidade'))
            : 'corridos') as UnidadePrazo,
          gravidade: dados.get('gravidade') === 'erro' ? 'erro' : 'aviso',
        })
      }}
    >
      <div className="campo">
        <label htmlFor="regra-nome">Nome</label>
        <input id="regra-nome" name="nome" autoComplete="off" defaultValue={regra?.nome ?? ''} />
        {erroDoCampo(erros, 'nome') ? <p className="erro-campo">{erroDoCampo(erros, 'nome')}</p> : null}
      </div>
      <fieldset className="grupo-interruptores">
        <legend>Modelo</legend>
        <label className="interruptor">
          <input
            type="radio"
            name="modelo"
            checked={modelo === 'presenca'}
            onChange={() => onModelo('presenca')}
          />
          Precisa existir
        </label>
        <label className="interruptor">
          <input
            type="radio"
            name="modelo"
            checked={modelo === 'prazo'}
            onChange={() => onModelo('prazo')}
          />
          Prazo mínimo
        </label>
      </fieldset>
      {modelo === 'presenca' ? (
        <>
          <div className="campo">
            <label htmlFor="regra-tipo">Tipo de marcação</label>
            <select id="regra-tipo" name="tipoId" defaultValue={regra?.tipoId ?? ''}>
              <option value="">Nenhum (usar palavra)</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
            {erroDoCampo(erros, 'tipoId') ? (
              <p className="erro-campo">{erroDoCampo(erros, 'tipoId')}</p>
            ) : null}
          </div>
          <div className="campo">
            <label htmlFor="regra-palavra">Ou palavra no nome do evento</label>
            <input
              id="regra-palavra"
              name="palavra"
              autoComplete="off"
              defaultValue={regra?.palavra ?? ''}
            />
          </div>
        </>
      ) : (
        <>
          <div className="campo">
            <label htmlFor="regra-origem">Origem</label>
            <select id="regra-origem" name="origem" defaultValue={regra?.origem ?? ANCORA_FIM_PERIODO}>
              {opcoesPrazo}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="regra-destino">Destino</label>
            <select id="regra-destino" name="destinoTipoId" defaultValue={regra?.destinoTipoId ?? ''}>
              <option value="">Escolha…</option>
              {opcoesPrazo}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="regra-unidade">Como contar</label>
            <select id="regra-unidade" name="unidade" defaultValue={regra?.unidade ?? 'corridos'}>
              <option value="corridos">Dias corridos</option>
              <option value="uteis">Dias úteis</option>
              <option value="letivos">Dias letivos</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="regra-dias">Mínimo de dias</label>
            <input
              id="regra-dias"
              name="minimoDias"
              inputMode="numeric"
              defaultValue={regra?.minimoDias ? String(regra.minimoDias) : '3'}
            />
            {erroDoCampo(erros, 'minimoDias') ? (
              <p className="erro-campo">{erroDoCampo(erros, 'minimoDias')}</p>
            ) : null}
          </div>
        </>
      )}
      <fieldset className="grupo-interruptores">
        <legend>Gravidade</legend>
        <label className="interruptor">
          <input type="radio" name="gravidade" value="aviso" defaultChecked={regra?.gravidade !== 'erro'} />
          Aviso
        </label>
        <label className="interruptor">
          <input type="radio" name="gravidade" value="erro" defaultChecked={regra?.gravidade === 'erro'} />
          Erro
        </label>
      </fieldset>
      <div className="acoes">
        <button type="submit" className="botao botao-principal">
          Salvar regra
        </button>
        <button type="button" className="botao botao-secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

type AbaCadastro = 'periodos' | 'feriados' | 'eventos' | 'avisos' | 'tabela'

type VoltaPopup =
  | { tipo: 'dia'; iso: string }
  | { tipo: 'escolha'; inicio: string; fim: string }

const ABAS_CADASTRO: { id: AbaCadastro; rotulo: string }[] = [
  { id: 'periodos', rotulo: 'Períodos' },
  { id: 'feriados', rotulo: 'Feriados e recessos' },
  { id: 'eventos', rotulo: 'Eventos' },
  { id: 'avisos', rotulo: 'Avisos e conflitos' },
  { id: 'tabela', rotulo: 'Tabela de detalhamento' },
]

function BlocoColapsavel({
  id,
  titulo,
  resumo,
  aberto,
  onAberto,
  children,
}: {
  id: string
  titulo: string
  resumo: string
  aberto: boolean
  onAberto: (aberto: boolean) => void
  children: ReactNode
}) {
  return (
    <details
      className="cartao bloco-colapsavel"
      open={aberto}
      onToggle={(evento) => {
        const proximo = evento.currentTarget.open
        if (proximo !== aberto) onAberto(proximo)
      }}
    >
      <summary className="bloco-resumo">
        <span className="bloco-resumo-texto">
          <h2 id={id}>{titulo}</h2>
          <p className="meta">{resumo}</p>
        </span>
      </summary>
      <div className="bloco-corpo">{children}</div>
    </details>
  )
}

export function CalendarioAno({
  calendario,
  onMudou,
  onVoltar,
  onSalvarArquivo,
  onAbrirArquivo,
  mudancasNaoBaixadas,
}: Props) {
  const [formAberto, setFormAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [erros, setErros] = useState<ErroCampo[]>([])
  const [anoDigitado, setAnoDigitado] = useState(String(calendario.ano))
  const [anoPendente, setAnoPendente] = useState<number | null>(null)
  const [formFeriado, setFormFeriado] = useState(false)
  const [editandoFeriadoId, setEditandoFeriadoId] = useState<string | null>(null)
  const [errosFeriado, setErrosFeriado] = useState<ErroCampo[]>([])
  const [feriadoInicio, setFeriadoInicio] = useState('')
  const [feriadoFim, setFeriadoFim] = useState('')
  const [feriadoTipo, setFeriadoTipo] = useState<'feriado' | 'recesso'>('feriado')
  const [escolhaLancamento, setEscolhaLancamento] = useState<{
    inicio: string
    fim: string
  } | null>(null)
  const [diaAberto, setDiaAberto] = useState<string | null>(null)
  const [cadastroAberto, setCadastroAberto] = useState(calendario.periodos.length === 0)
  const [abaCadastro, setAbaCadastro] = useState<AbaCadastro>('periodos')
  const [formTipos, setFormTipos] = useState(false)
  const [formEvento, setFormEvento] = useState(false)
  const [editandoEventoId, setEditandoEventoId] = useState<string | null>(null)
  const [errosEvento, setErrosEvento] = useState<ErroCampo[]>([])
  const [eventoInicio, setEventoInicio] = useState('')
  const [eventoFim, setEventoFim] = useState('')
  const [eventoTipoId, setEventoTipoId] = useState('tipo-evento')
  const [eventoDataOriginal, setEventoDataOriginal] = useState('')
  const [formRegras, setFormRegras] = useState(false)
  const [formRegra, setFormRegra] = useState<'nova' | string | null>(null)
  const [errosRegra, setErrosRegra] = useState<ErroCampo[]>([])
  const [modeloRegra, setModeloRegra] = useState<ModeloRegraUsuario>('presenca')
  const [formTipo, setFormTipo] = useState(false)
  const [errosTipo, setErrosTipo] = useState<ErroCampo[]>([])
  const [novoTipoCor, setNovoTipoCor] = useState('#38a169')
  const [novoTipoCombina, setNovoTipoCombina] = useState(true)
  const conflitos = conflitosDoCalendario(calendario)
  const regras = regrasDo(calendario)
  const linhas = linhasTabela(calendario)
  const totais = totaisLetivos(calendario)
  const conflitosPorIso = new Map<string, Conflito[]>()
  const diasComErro = new Set<string>()
  const diasComAviso = new Set<string>()
  for (const c of conflitos) {
    if (!c.iso) continue
    const doDia = conflitosPorIso.get(c.iso) ?? []
    doDia.push(c)
    conflitosPorIso.set(c.iso, doDia)
    if (c.gravidade === 'erro') diasComErro.add(c.iso)
    else diasComAviso.add(c.iso)
  }
  const nErros = conflitos.filter((c) => c.gravidade === 'erro').length
  const nAvisos = conflitos.length - nErros
  const listaConflitos = [...conflitos].sort((a, b) => {
    if (a.gravidade !== b.gravidade) return a.gravidade === 'erro' ? -1 : 1
    return a.numero - b.numero || (a.iso ?? '').localeCompare(b.iso ?? '')
  })
  const [selecao, setSelecao] = useState<{ a: string; b: string } | null>(null)
  const origemDia = useRef<HTMLButtonElement | null>(null)
  const fecharDiaRef = useRef<HTMLButtonElement | null>(null)
  const arraste = useRef<{
    origem: string
    atual: string
    x: number
    y: number
    ativo: boolean
  } | null>(null)
  const ignorarClique = useRef(false)
  const periodoEditando = calendario.periodos.find((p) => p.id === editandoId)
  const feriadoEditando = calendario.eventos.find((e) => e.id === editandoFeriadoId)
  const eventoEditando = calendario.eventos.find((e) => e.id === editandoEventoId)
  const listaFeriados = calendario.eventos.filter((e) => ehFeriadoOuRecesso(e.tipoId))
  const listaEventos = calendario.eventos.filter((e) => {
    const tipo = calendario.tiposDia.find((t) => t.id === e.tipoId)
    return tipo ? tipoEhLancavel(tipo) : false
  })
  const listaARepor = aulasARepor(calendario)
  const cadastrosEscolha = escolhaLancamento
    ? cadastrosDoIntervalo(calendario, escolhaLancamento.inicio, escolhaLancamento.fim)
    : { eventos: [] }
  const voltaPopup = useRef<VoltaPopup | null>(null)
  const inicioTipoEvento = eventoEditando?.inicio ?? eventoInicio
  const fimTipoEvento = (eventoEditando?.fim ?? eventoFim) || inicioTipoEvento
  const tiposLancaveis = tiposDiaOrdenados(calendario.tiposDia).filter((t) => {
    if (!tipoEhLancavel(t)) return false
    if (t.id === TIPO_REPOSICAO) {
      if (editandoEventoId && eventoEditando?.tipoId === TIPO_REPOSICAO) return true
      if (!inicioTipoEvento) return true
      if (diaEhLetivo(calendario, inicioTipoEvento, editandoEventoId ?? undefined)) {
        return false
      }
      return !calendario.eventos.some(
        (e) =>
          ehFeriadoOuRecesso(e.tipoId) &&
          e.inicio <= inicioTipoEvento &&
          inicioTipoEvento <= e.fim,
      )
    }
    if (t.id !== TIPO_SABADO_LETIVO) return true
    if (!inicioTipoEvento) return true
    return ehSabado(inicioTipoEvento) && (!fimTipoEvento || ehSabado(fimTipoEvento))
  })

  useEffect(() => {
    if (diaAberto) fecharDiaRef.current?.focus()
  }, [diaAberto])

  useEffect(() => {
    if (!formAberto && !formEvento && !formFeriado && !formTipo && !formRegra && !formTipos && !formRegras) return
    const dialogo = document.querySelector('.dialogo')
    const campo = dialogo?.querySelector<HTMLElement>('input, select, textarea')
    campo?.focus()
  }, [formAberto, formEvento, formFeriado, formTipo, formRegra, formTipos, formRegras])

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return
      if (arraste.current) {
        arraste.current = null
        setSelecao(null)
        return
      }
      if (formEvento) {
        fecharFormEvento()
        return
      }
      if (formFeriado) {
        fecharFormFeriado()
        return
      }
      if (formAberto) {
        fecharFormPeriodo()
        return
      }
      if (formRegra) {
        setFormRegra(null)
        setErrosRegra([])
        return
      }
      if (formTipo) {
        setFormTipo(false)
        setErrosTipo([])
        return
      }
      if (formTipos) {
        setFormTipos(false)
        return
      }
      if (formRegras) {
        setFormRegras(false)
        return
      }
      if (escolhaLancamento) {
        setEscolhaLancamento(null)
        return
      }
      if (diaAberto) {
        fecharDia()
        return
      }
      if (anoPendente !== null) {
        setAnoPendente(null)
        setAnoDigitado(String(calendario.ano))
      }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [escolhaLancamento, diaAberto, formEvento, formFeriado, formAberto, formRegra, formTipo, formTipos, formRegras, anoPendente, calendario.ano])

  const itensLegenda = legenda(calendario)
  const resumoConflitos = [
    ...(nErros > 0 ? [nErros === 1 ? '1 erro' : `${nErros} erros`] : []),
    nAvisos === 0
      ? nErros > 0
        ? null
        : 'nenhum aviso'
      : nAvisos === 1
        ? '1 aviso'
        : `${nAvisos} avisos`,
  ].filter(Boolean)
  const resumoCadastro =
    calendario.periodos.length === 0
      ? ['Nenhum período ainda', ...resumoConflitos].join(' · ')
      : [
          calendario.periodos.length === 1
            ? '1 período'
            : `${calendario.periodos.length} períodos`,
          listaFeriados.length === 1 ? '1 feriado' : `${listaFeriados.length} feriados`,
          listaEventos.length === 1 ? '1 evento' : `${listaEventos.length} eventos`,
          ...resumoConflitos,
          ...(listaARepor.length > 0
            ? [
                listaARepor.length === 1
                  ? '1 aula a repor'
                  : `${listaARepor.length} aulas a repor`,
              ]
            : []),
        ]
          .filter(Boolean)
          .join(' · ')

  function capturarVoltaPopup() {
    if (voltaPopup.current) return
    if (diaAberto) {
      voltaPopup.current = { tipo: 'dia', iso: diaAberto }
      return
    }
    if (escolhaLancamento) {
      voltaPopup.current = {
        tipo: 'escolha',
        inicio: escolhaLancamento.inicio,
        fim: escolhaLancamento.fim,
      }
    }
  }

  function restaurarVoltaPopup() {
    const volta = voltaPopup.current
    voltaPopup.current = null
    if (!volta) return
    if (volta.tipo === 'dia') setDiaAberto(volta.iso)
    else setEscolhaLancamento({ inicio: volta.inicio, fim: volta.fim })
  }

  function limparFormPeriodo() {
    setFormAberto(false)
    setEditandoId(null)
    setErros([])
  }

  function limparFormFeriado() {
    setFormFeriado(false)
    setEditandoFeriadoId(null)
    setErrosFeriado([])
  }

  function limparFormEvento() {
    setFormEvento(false)
    setEditandoEventoId(null)
    setErrosEvento([])
  }

  function fecharFormPeriodo() {
    limparFormPeriodo()
    restaurarVoltaPopup()
  }

  function fecharFormFeriado() {
    limparFormFeriado()
    restaurarVoltaPopup()
  }

  function fecharFormEvento() {
    limparFormEvento()
    restaurarVoltaPopup()
  }

  function abrirNovo() {
    capturarVoltaPopup()
    limparFormFeriado()
    limparFormEvento()
    setDiaAberto(null)
    setEscolhaLancamento(null)
    setEditandoId(null)
    setErros([])
    setFormAberto(true)
  }

  function abrirEdicao(id: string) {
    capturarVoltaPopup()
    limparFormFeriado()
    limparFormEvento()
    setDiaAberto(null)
    setEscolhaLancamento(null)
    setEditandoId(id)
    setErros([])
    setFormAberto(true)
  }

  const enviar: FormEventHandler<HTMLFormElement> = (evento) => {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const nome = String(dados.get('nome') ?? '')
    const inicio = isoDeDataBr(String(dados.get('inicio') ?? '')) ?? String(dados.get('inicio') ?? '')
    const fim = isoDeDataBr(String(dados.get('fim') ?? '')) ?? String(dados.get('fim') ?? '')
    const resultado = editandoId
      ? atualizarPeriodo(calendario, editandoId, { nome, inicio, fim })
      : adicionarPeriodo(calendario, { nome, inicio, fim })
    if (!resultado.ok) {
      setErros(resultado.erros)
      return
    }
    onMudou(resultado.calendario)
    fecharFormPeriodo()
  }

  function confirmarApagar(id: string, nomePeriodo: string) {
    const ok = window.confirm(
      `Apagar ${nomePeriodo}? Os dias letivos desse período saem do calendário.`,
    )
    if (!ok) return
    onMudou(apagarPeriodo(calendario, id))
    if (editandoId === id) fecharFormPeriodo()
  }

  function confirmarVoltar() {
    if (mudancasNaoBaixadas && !window.confirm(CONFIRMA_VOLTAR)) return
    onVoltar()
  }

  function pedirTrocaAno() {
    const novo = Number(anoDigitado)
    if (novo === calendario.ano) return
    setAnoPendente(novo)
  }

  function confirmarTroca(modo: 'manter' | 'padrao') {
    if (anoPendente === null) return
    const r = trocarAno(calendario, anoPendente, modo)
    if (!r.ok) {
      setAnoPendente(null)
      setAnoDigitado(String(calendario.ano))
      return
    }
    onMudou(r.calendario)
    setAnoPendente(null)
    setAnoDigitado(String(r.calendario.ano))
  }

  function abrirDia(iso: string, botao: HTMLButtonElement) {
    origemDia.current = botao
    setDiaAberto(iso)
  }

  function fecharDia() {
    setDiaAberto(null)
    origemDia.current?.focus()
  }

  function trocarCor(tipoId: string, cor: string) {
    const r = definirCorTipo(calendario, tipoId, cor)
    if (r.ok) onMudou(r.calendario)
  }

  const enviarFeriado: FormEventHandler<HTMLFormElement> = (evento) => {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const descricao = String(dados.get('descricao') ?? '')
    const inicio = isoDeDataBr(String(dados.get('inicio') ?? '')) ?? String(dados.get('inicio') ?? '')
    const fim = isoDeDataBr(String(dados.get('fim') ?? '')) ?? String(dados.get('fim') ?? '')
    const tipo = dados.get('tipo') === 'recesso' ? 'recesso' : 'feriado'
    const resultado = editandoFeriadoId
      ? editarEvento(calendario, editandoFeriadoId, { descricao, inicio, fim })
      : adicionarFeriadoManual(calendario, { descricao, inicio, fim, tipo })
    if (!resultado.ok) {
      setErrosFeriado(resultado.erros)
      return
    }
    onMudou(resultado.calendario)
    fecharFormFeriado()
  }

  function abrirFormFeriado(inicio: string, fim: string, id: string | null = null) {
    const ev = id ? calendario.eventos.find((e) => e.id === id) : null
    capturarVoltaPopup()
    limparFormPeriodo()
    limparFormEvento()
    setDiaAberto(null)
    setEscolhaLancamento(null)
    setEditandoFeriadoId(id)
    setErrosFeriado([])
    setFeriadoInicio(inicio)
    setFeriadoFim(fim)
    setFeriadoTipo(ev?.tipoId === TIPO_RECESSO ? 'recesso' : 'feriado')
    setFormFeriado(true)
  }

  function abrirFormEvento(inicio: string, fim: string, id: string | null = null) {
    const ev = id ? calendario.eventos.find((e) => e.id === id) : null
    capturarVoltaPopup()
    limparFormPeriodo()
    limparFormFeriado()
    setDiaAberto(null)
    setEscolhaLancamento(null)
    setEditandoEventoId(id)
    setErrosEvento([])
    setEventoInicio(inicio)
    setEventoFim(fim)
    setEventoTipoId(ev?.tipoId ?? 'tipo-evento')
    setEventoDataOriginal(ev?.dataOriginal ?? '')
    setFormEvento(true)
  }

  function aceitarAviso(c: Conflito) {
    if (!c.eventoId || !c.iso) return
    onMudou(aceitarAvisoEventoNoDia(calendario, c.eventoId, c.iso))
  }

  function abrirRepor(dataOriginal: string) {
    capturarVoltaPopup()
    limparFormPeriodo()
    limparFormFeriado()
    setDiaAberto(null)
    setEscolhaLancamento(null)
    setEditandoEventoId(null)
    setErrosEvento([])
    setEventoInicio('')
    setEventoFim('')
    setEventoTipoId(TIPO_REPOSICAO)
    setEventoDataOriginal(dataOriginal)
    setFormEvento(true)
  }

  const enviarEvento: FormEventHandler<HTMLFormElement> = (evento) => {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const tipoId = String(dados.get('tipoId') ?? '')
    const descricao = String(dados.get('descricao') ?? '')
    const inicio = isoDeDataBr(String(dados.get('inicio') ?? '')) ?? String(dados.get('inicio') ?? '')
    const fim = isoDeDataBr(String(dados.get('fim') ?? '')) ?? String(dados.get('fim') ?? '')
    const dataOriginalBruto = String(dados.get('dataOriginal') ?? '')
    const dataOriginal =
      isoDeDataBr(dataOriginalBruto) ?? (dataOriginalBruto.trim() === '' ? undefined : dataOriginalBruto)
    const resultado = editandoEventoId
      ? atualizarEvento(calendario, editandoEventoId, {
          tipoId,
          descricao,
          inicio,
          fim,
          dataOriginal,
        })
      : adicionarEvento(calendario, { tipoId, descricao, inicio, fim, dataOriginal })
    if (!resultado.ok) {
      setErrosEvento(resultado.erros)
      return
    }
    if (resultado.avisos && resultado.avisos.length > 0) {
      window.alert(resultado.avisos.map((a) => a.mensagem).join('\n'))
    }
    onMudou(resultado.calendario)
    fecharFormEvento()
  }

  function confirmarApagarEvento(id: string, nome: string, inicio: string, fim: string): boolean {
    if (!window.confirm(`Apagar ${nome} (${formatarIntervaloBr(inicio, fim)})?`)) return false
    onMudou(apagarEvento(calendario, id))
    if (editandoEventoId === id) fecharFormEvento()
    return true
  }

  function abrirCadastroDoEvento(ev: { id: string; tipoId: string; inicio: string; fim: string }) {
    if (ehFeriadoOuRecesso(ev.tipoId)) abrirFormFeriado(ev.inicio, ev.fim, ev.id)
    else abrirFormEvento(ev.inicio, ev.fim, ev.id)
  }

  function apagarCadastroDoEvento(
    ev: {
      id: string
      tipoId: string
      descricao: string
      inicio: string
      fim: string
    },
    corte?: { inicio: string; fim: string },
  ): boolean {
    const corteIni = corte?.inicio ?? ev.inicio
    const corteFim = corte?.fim ?? ev.fim
    const cobreTudo = corteIni <= ev.inicio && corteFim >= ev.fim
    if (!cobreTudo) {
      const recorte =
        corteIni === corteFim
          ? formatarDataBr(corteIni)
          : formatarIntervaloBr(corteIni, corteFim)
      if (
        !window.confirm(
          `Tirar ${recorte} de ${ev.descricao} (${formatarIntervaloBr(ev.inicio, ev.fim)})? O restante do intervalo continua.`,
        )
      ) {
        return false
      }
      const resultado = apagarEventoNoIntervalo(calendario, ev.id, corteIni, corteFim)
      if (!resultado.ok) {
        window.alert(resultado.erros[0]?.mensagem ?? 'Não foi possível apagar.')
        return false
      }
      onMudou(resultado.calendario)
      return true
    }
    if (ehFeriadoOuRecesso(ev.tipoId)) {
      if (!window.confirm(`Apagar ${ev.descricao} em ${formatarDataBr(ev.inicio)}?`)) return false
      onMudou(apagarEvento(calendario, ev.id))
      if (editandoFeriadoId === ev.id) fecharFormFeriado()
      return true
    }
    return confirmarApagarEvento(ev.id, ev.descricao, ev.inicio, ev.fim)
  }

  function confirmarApagarRetirada(id: string, iso: string): boolean {
    if (!window.confirm(`Desfazer a retirada de ${formatarDataBr(iso)}?`)) return false
    onMudou(apagarEvento(calendario, id))
    return true
  }

  function isoNaSelecao(iso: string): boolean {
    if (!selecao) return false
    const a = selecao.a <= selecao.b ? selecao.a : selecao.b
    const b = selecao.a <= selecao.b ? selecao.b : selecao.a
    return iso >= a && iso <= b
  }

  function iniciarArraste(iso: string, e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === 'touch') return
    arraste.current = { origem: iso, atual: iso, x: e.clientX, y: e.clientY, ativo: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function moverArraste(e: PointerEvent<HTMLButtonElement>) {
    const estado = arraste.current
    if (!estado) return
    const dx = e.clientX - estado.x
    const dy = e.clientY - estado.y
    if (!estado.ativo && Math.hypot(dx, dy) < 5) return
    estado.ativo = true
    const alvo = document.elementFromPoint(e.clientX, e.clientY)
    const botao = alvo instanceof Element ? alvo.closest('[data-iso]') : null
    const iso = botao?.getAttribute('data-iso')
    if (iso) {
      estado.atual = iso
      setSelecao({ a: estado.origem, b: iso })
    }
  }

  function soltarArraste() {
    const estado = arraste.current
    arraste.current = null
    if (estado?.ativo) {
      ignorarClique.current = true
      const inicio = estado.origem <= estado.atual ? estado.origem : estado.atual
      const fim = estado.origem <= estado.atual ? estado.atual : estado.origem
      setSelecao(null)
      setDiaAberto(null)
      setEscolhaLancamento({ inicio, fim })
      return
    }
    setSelecao(null)
  }

  return (
    <main className="pagina pagina-ano">
      <header className="cabecalho-tela">
        <div>
          <h1>{calendario.nome}</h1>
          <p className="meta">{calendario.instituicao}</p>
          <div className="campo">
            <label htmlFor="ano-calendario">Ano</label>
            <input
              id="ano-calendario"
              inputMode="numeric"
              maxLength={4}
              value={anoDigitado}
              onChange={(e) => setAnoDigitado(e.target.value)}
              onBlur={pedirTrocaAno}
            />
          </div>
        </div>
        <div className="acoes">
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => {
              setFormTipos(false)
              setFormRegras(true)
            }}
          >
            Regras
          </button>
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => {
              setFormRegras(false)
              setFormTipos(true)
            }}
          >
            Tipos de marcação
          </button>
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => window.print()}
          >
            Imprimir / PDF
          </button>
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() =>
              baixarArquivo(
                nomeArquivoExcel(calendario),
                excelDoCalendario(calendario),
                'application/vnd.ms-excel',
              )
            }
          >
            Excel
          </button>
          <button type="button" className="botao botao-secundario" onClick={confirmarVoltar}>
            Voltar ao início
          </button>
        </div>
      </header>

      <BlocoColapsavel
        id="cadastro"
        titulo="Cadastro"
        resumo={resumoCadastro}
        aberto={cadastroAberto}
        onAberto={setCadastroAberto}
      >
        <div className="abas-cadastro" role="tablist" aria-label="Cadastro">
          {ABAS_CADASTRO.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`aba-${item.id}`}
              aria-selected={abaCadastro === item.id}
              aria-controls={`painel-${item.id}`}
              className="aba-cadastro"
              onClick={() => setAbaCadastro(item.id)}
            >
              {item.rotulo}
              {item.id === 'avisos' && nErros > 0 ? (
                <span className="contagem-aba contagem-erro">{nErros}</span>
              ) : null}
              {item.id === 'avisos' && nAvisos > 0 ? (
                <span className="contagem-aba contagem-aviso">{nAvisos}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div
          className="painel-aba"
          role="tabpanel"
          id="painel-periodos"
          aria-labelledby="aba-periodos"
          hidden={abaCadastro !== 'periodos'}
        >
          {calendario.periodos.length === 0 ? (
            <p className="vazio">Nenhum período ainda. Adicione o primeiro para pintar os dias letivos.</p>
          ) : (
            <ul className="lista-periodos">
              {calendario.periodos.map((p) => (
                <li key={p.id} className="item-periodo">
                  <span>
                    {p.nome}: {formatarDataBr(p.inicio)} a {formatarDataBr(p.fim)}
                  </span>
                  <span className="acoes">
                    <button
                      type="button"
                      className="botao botao-secundario"
                      onClick={() => abrirEdicao(p.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="botao botao-secundario"
                      onClick={() => confirmarApagar(p.id, p.nome)}
                    >
                      Apagar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="botao botao-principal" onClick={abrirNovo}>
            Adicionar período
          </button>
        </div>

        <div
          className="painel-aba"
          role="tabpanel"
          id="painel-feriados"
          aria-labelledby="aba-feriados"
          hidden={abaCadastro !== 'feriados'}
        >
          <ul className="lista-feriados">
            {[...listaFeriados]
              .sort((a, b) => a.inicio.localeCompare(b.inicio))
              .map((ev) => {
                const tipo = calendario.tiposDia.find((t) => t.id === ev.tipoId)
                const proximaARepor = listaARepor.find((a) => a.eventoId === ev.id)
                return (
                  <li key={ev.id} className="item-feriado">
                    <span className="item-com-cor">
                      <AmostraTipo cor={tipo?.cor} />
                      <span>
                        {formatarIntervaloBr(ev.inicio, ev.fim)} — {ev.descricao} ({tipo?.nome}
                        {ev.origem === 'manual' ? ', manual' : ', automático'})
                      </span>
                    </span>
                    <span className="acoes">
                      {proximaARepor ? (
                        <button
                          type="button"
                          className="botao botao-principal"
                          onClick={() => abrirRepor(proximaARepor.dataOriginal)}
                        >
                          Repor
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="botao botao-secundario"
                        onClick={() => abrirFormFeriado(ev.inicio, ev.fim, ev.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="botao botao-secundario"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Apagar ${ev.descricao} em ${formatarDataBr(ev.inicio)}?`,
                            )
                          ) {
                            onMudou(apagarEvento(calendario, ev.id))
                            if (editandoFeriadoId === ev.id) fecharFormFeriado()
                          }
                        }}
                      >
                        Apagar
                      </button>
                    </span>
                  </li>
                )
              })}
          </ul>
          <button
            type="button"
            className="botao botao-principal"
            onClick={() => abrirFormFeriado('', '')}
          >
            Adicionar feriado ou recesso
          </button>
        </div>

        <div
          className="painel-aba"
          role="tabpanel"
          id="painel-eventos"
          aria-labelledby="aba-eventos"
          hidden={abaCadastro !== 'eventos'}
        >
          {listaEventos.length === 0 ? (
            <p className="vazio">Nenhum evento ainda. Adicione férias, reposição ou outro. Um evento no sábado já torna o dia letivo.</p>
          ) : (
            <ul className="lista-feriados">
              {[...listaEventos]
                .sort((a, b) => a.inicio.localeCompare(b.inicio))
                .map((ev) => {
                  const tipo = calendario.tiposDia.find((t) => t.id === ev.tipoId)
                  return (
                    <li key={ev.id} className="item-feriado">
                      <span className="item-com-cor">
                        <AmostraTipo cor={tipo?.cor} />
                        <span>
                          {formatarIntervaloBr(ev.inicio, ev.fim)} — {ev.descricao} (
                          {tipo?.nome})
                        </span>
                      </span>
                      <span className="acoes">
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => abrirFormEvento(ev.inicio, ev.fim, ev.id)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() =>
                            confirmarApagarEvento(ev.id, ev.descricao, ev.inicio, ev.fim)
                          }
                        >
                          Apagar
                        </button>
                      </span>
                    </li>
                  )
                })}
            </ul>
          )}
          <button
            type="button"
            className="botao botao-principal"
            onClick={() => abrirFormEvento('', '')}
          >
            Adicionar evento
          </button>
        </div>

        <div
          className="painel-aba"
          role="tabpanel"
          id="painel-avisos"
          aria-labelledby="aba-avisos"
          hidden={abaCadastro !== 'avisos'}
        >
          {conflitos.length === 0 ? (
            <p className="vazio">Nenhum aviso neste calendário.</p>
          ) : (
            <ul className="lista-conflitos">
              {listaConflitos.map((c) => (
                <ItemConflito key={c.id} c={c} onAceitar={aceitarAviso} />
              ))}
            </ul>
          )}
        </div>

        <div
          className="painel-aba"
          role="tabpanel"
          id="painel-tabela"
          aria-labelledby="aba-tabela"
          hidden={abaCadastro !== 'tabela'}
        >
          {calendario.periodos.length === 0 ? (
            <p className="vazio">Lance um período para ver a tabela.</p>
          ) : linhas.length === 0 ? (
            <p className="vazio">Nenhum feriado, recesso ou evento neste período. Os dias letivos aparecem só no calendário.</p>
          ) : (
            <div className="tabela-envolve">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Datas</th>
                    <th>Lançamento</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr key={`${l.periodoId}-${l.inicio}-${l.texto}`}>
                      <td>{l.periodoNome}</td>
                      <td>{formatarIntervaloBr(l.inicio, l.fim)}</td>
                      <td>
                        <span className="item-com-cor">
                          {tiposDoDia(calendario, l.inicio)
                            .filter((tipo) => !ehTipoLetivo(tipo))
                            .map((tipo) => (
                              <AmostraTipo key={tipo.id} cor={tipo.cor} />
                            ))}
                          <span>{l.texto}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totais ? (
            <p className="meta">
              Dias letivos no ano: {totais.ano}
              {totais.porPeriodo.map((p) => ` · ${p.nome}: ${p.total}`).join('')}
            </p>
          ) : null}
        </div>
      </BlocoColapsavel>

      <section aria-label="Meses do ano">
        <div className="meses">
          {NOMES_MESES.map((nomeMes, indice) => {
            const mes = indice + 1
            const celulas = gradeMes(calendario.ano, mes)
            return (
              <article key={nomeMes} className="cartao mes">
                <h3>
                  {nomeMes} {calendario.ano}
                </h3>
                <div className="grade-mes">
                  {DIAS_SEMANA.map((d) => (
                    <div key={d} className="dia-semana">
                      {d}
                    </div>
                  ))}
                  {celulas.map((celula) => {
                    if (celula.foraDoMes) {
                      return (
                        <div key={celula.iso} className="dia dia-fora">
                          {celula.dia}
                        </div>
                      )
                    }
                    const pintura = pinturaDoDia(calendario, celula.iso)
                    const title = rotuloDoDia(calendario, celula.iso, celula.dia)
                    const conflitosDoIso = conflitosPorIso.get(celula.iso) ?? []
                    const dica = linhasDica(calendario, celula.iso, pintura, conflitosDoIso)
                    const marcasVisiveis = pintura.marcas.slice(0, LIMITE_MARCAS_DIA)
                    const selecionado = isoNaSelecao(celula.iso)
                    const temErro = diasComErro.has(celula.iso)
                    const temAviso = diasComAviso.has(celula.iso)
                    return (
                      <button
                        key={celula.iso}
                        type="button"
                        className={[
                          'dia',
                          'dia-botao',
                          selecionado ? 'dia-selecionado' : '',
                          temErro ? 'dia-erro' : temAviso ? 'dia-aviso' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        data-iso={celula.iso}
                        style={estiloPintura(pintura.fundo)}
                        aria-label={title}
                        onPointerDown={(e) => iniciarArraste(celula.iso, e)}
                        onPointerMove={moverArraste}
                        onPointerUp={soltarArraste}
                        onPointerCancel={soltarArraste}
                        onClick={(e) => {
                          if (ignorarClique.current) {
                            ignorarClique.current = false
                            return
                          }
                          abrirDia(celula.iso, e.currentTarget)
                        }}
                      >
                        <span className="dia-numero">{celula.dia}</span>
                        {temErro || temAviso ? (
                          <span
                            className={temErro ? 'marca-conflito marca-erro' : 'marca-conflito'}
                            title={temErro ? 'Há um erro neste dia' : 'Há um aviso neste dia'}
                          >
                            !
                          </span>
                        ) : null}
                        {marcasVisiveis.length > 0 || pintura.haMais ? (
                          <span className="dia-marcas" aria-hidden="true">
                            {marcasVisiveis.map((marca) => (
                              <span
                                key={marca.evento.id}
                                className="dia-marca"
                                style={{ background: marca.tipo.cor }}
                              />
                            ))}
                            {pintura.haMais ? <span className="dia-mais-sinal">+</span> : null}
                          </span>
                        ) : null}
                        {dica.length > 0 ? (
                          <span className="dia-dica" role="tooltip">
                            {dica.map((linha, indice) => (
                              <span key={`${indice}-${linha.texto}`} className="dia-dica-linha">
                                <span
                                  className="dia-dica-cor"
                                  style={{ background: linha.cor }}
                                />
                                {linha.texto}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="cartao" aria-labelledby="legenda">
        <h2 id="legenda">Legenda</h2>
        {itensLegenda.length === 0 ? (
          <p className="vazio">Nenhum tipo de marcação usado ainda.</p>
        ) : (
          <ul className="legenda">
            {itensLegenda.map((item) => (
              <li key={item.id} className="item-legenda">
                <span
                  className="amostra"
                  style={{ background: item.cor }}
                  aria-hidden="true"
                />
                {item.nome} ({item.quantidade})
              </li>
            ))}
          </ul>
        )}
      </section>

      {formAberto ? (
        <Dialogo
          tituloId="form-periodo-titulo"
          titulo={editandoId ? 'Editar período' : 'Novo período'}
        >
          <form onSubmit={enviar} noValidate key={editandoId ?? 'novo'}>
            <div className="campo">
              <label htmlFor="periodo-nome">Nome</label>
              <input
                id="periodo-nome"
                name="nome"
                defaultValue={periodoEditando?.nome ?? ''}
                autoComplete="off"
              />
              {erroDoCampo(erros, 'nome') ? (
                <p className="erro-campo">{erroDoCampo(erros, 'nome')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="periodo-inicio">Início</label>
              <CampoData
                id="periodo-inicio"
                name="inicio"
                defaultValue={periodoEditando?.inicio}
              />
              {erroDoCampo(erros, 'inicio') ? (
                <p className="erro-campo">{erroDoCampo(erros, 'inicio')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="periodo-fim">Fim</label>
              <CampoData
                id="periodo-fim"
                name="fim"
                defaultValue={periodoEditando?.fim}
              />
              {erroDoCampo(erros, 'fim') ? (
                <p className="erro-campo">{erroDoCampo(erros, 'fim')}</p>
              ) : null}
            </div>
            <AjudaPeriodo
              calendario={calendario}
              tipoLetivoId={periodoEditando?.tipoLetivoId}
            />
            <div className="acoes">
              <button type="submit" className="botao botao-principal">
                Salvar período
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={fecharFormPeriodo}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Dialogo>
      ) : null}

      {formFeriado ? (
        <Dialogo
          tituloId="form-feriado-titulo"
          titulo={
            editandoFeriadoId ? 'Editar feriado ou recesso' : 'Adicionar feriado ou recesso'
          }
        >
          <form
            onSubmit={enviarFeriado}
            noValidate
            key={`${editandoFeriadoId ?? 'novo-feriado'}-${feriadoInicio}-${feriadoFim}`}
          >
            <div className="campo">
              <label htmlFor="feriado-nome">Nome</label>
              <input
                id="feriado-nome"
                name="descricao"
                defaultValue={feriadoEditando?.descricao ?? ''}
                autoComplete="off"
              />
              {erroDoCampo(errosFeriado, 'descricao') ? (
                <p className="erro-campo">{erroDoCampo(errosFeriado, 'descricao')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="feriado-data">Início</label>
              <CampoData
                id="feriado-data"
                name="inicio"
                defaultValue={feriadoEditando?.inicio ?? feriadoInicio}
              />
              {erroDoCampo(errosFeriado, 'inicio') ? (
                <p className="erro-campo">{erroDoCampo(errosFeriado, 'inicio')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="feriado-fim">Fim</label>
              <CampoData
                id="feriado-fim"
                name="fim"
                defaultValue={feriadoEditando?.fim ?? feriadoFim}
              />
              {erroDoCampo(errosFeriado, 'fim') ? (
                <p className="erro-campo">{erroDoCampo(errosFeriado, 'fim')}</p>
              ) : null}
            </div>
            {editandoFeriadoId ? null : (
              <div className="campo">
                <label htmlFor="feriado-tipo">Tipo</label>
                <select
                  id="feriado-tipo"
                  name="tipo"
                  value={feriadoTipo}
                  onChange={(e) =>
                    setFeriadoTipo(e.target.value === 'recesso' ? 'recesso' : 'feriado')
                  }
                >
                  <option value="feriado">Feriado</option>
                  <option value="recesso">Recesso</option>
                </select>
              </div>
            )}
            <AjudaDoTipo
              calendario={calendario}
              tipoId={
                editandoFeriadoId
                  ? (feriadoEditando?.tipoId ?? TIPO_FERIADO)
                  : feriadoTipo === 'recesso'
                    ? TIPO_RECESSO
                    : TIPO_FERIADO
              }
            />
            <div className="acoes">
              <button type="submit" className="botao botao-principal">
                Salvar
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={fecharFormFeriado}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Dialogo>
      ) : null}

      {formEvento ? (
        <Dialogo
          tituloId="form-evento-titulo"
          titulo={editandoEventoId ? 'Editar evento' : 'Novo evento'}
        >
          <form
            onSubmit={enviarEvento}
            noValidate
            key={`${editandoEventoId ?? 'novo-evento'}-${eventoInicio}-${eventoFim}-${eventoDataOriginal}`}
          >
            <div className="campo">
              <label htmlFor="evento-tipo">Tipo de marcação</label>
              <select
                id="evento-tipo"
                name="tipoId"
                value={
                  tiposLancaveis.some((t) => t.id === eventoTipoId)
                    ? eventoTipoId
                    : (tiposLancaveis[0]?.id ?? 'tipo-evento')
                }
                onChange={(e) => setEventoTipoId(e.target.value)}
              >
                {tiposLancaveis.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
              {erroDoCampo(errosEvento, 'tipoId') ? (
                <p className="erro-campo">{erroDoCampo(errosEvento, 'tipoId')}</p>
              ) : null}
            </div>
            <AjudaDoTipo
              calendario={calendario}
              tipoId={
                tiposLancaveis.some((t) => t.id === eventoTipoId)
                  ? eventoTipoId
                  : (tiposLancaveis[0]?.id ?? 'tipo-evento')
              }
              tipoLetivoId={calendario.periodos[0]?.tipoLetivoId}
            />
            {(tiposLancaveis.some((t) => t.id === eventoTipoId)
              ? eventoTipoId
              : tiposLancaveis[0]?.id) === TIPO_REPOSICAO ? (
              <div className="campo">
                <label htmlFor="evento-data-original">Data da aula original</label>
                <CampoData
                  id="evento-data-original"
                  name="dataOriginal"
                  defaultValue={eventoEditando?.dataOriginal ?? eventoDataOriginal}
                />
                {erroDoCampo(errosEvento, 'dataOriginal') ? (
                  <p className="erro-campo">{erroDoCampo(errosEvento, 'dataOriginal')}</p>
                ) : null}
              </div>
            ) : null}
            <div className="campo">
              <label htmlFor="evento-nome">Nome</label>
              <input
                id="evento-nome"
                name="descricao"
                defaultValue={
                  eventoEditando?.descricao ??
                  ((tiposLancaveis.some((t) => t.id === eventoTipoId)
                    ? eventoTipoId
                    : tiposLancaveis[0]?.id) === TIPO_REPOSICAO &&
                  (eventoEditando?.dataOriginal ?? eventoDataOriginal)
                    ? nomeReposicao(eventoEditando?.dataOriginal ?? eventoDataOriginal)
                    : '')
                }
                autoComplete="off"
              />
              {erroDoCampo(errosEvento, 'descricao') ? (
                <p className="erro-campo">{erroDoCampo(errosEvento, 'descricao')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="evento-inicio">Início</label>
              <CampoData
                id="evento-inicio"
                name="inicio"
                defaultValue={eventoEditando?.inicio ?? eventoInicio}
              />
              {erroDoCampo(errosEvento, 'inicio') ? (
                <p className="erro-campo">{erroDoCampo(errosEvento, 'inicio')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="evento-fim">Fim</label>
              <CampoData
                id="evento-fim"
                name="fim"
                defaultValue={eventoEditando?.fim ?? eventoFim}
              />
              {erroDoCampo(errosEvento, 'fim') ? (
                <p className="erro-campo">{erroDoCampo(errosEvento, 'fim')}</p>
              ) : null}
            </div>
            <div className="acoes">
              <button type="submit" className="botao botao-principal">
                Salvar evento
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={fecharFormEvento}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Dialogo>
      ) : null}

      {escolhaLancamento ? (
        <div className="dialogo-fundo">
          <div
            className="dialogo"
            role="dialog"
            aria-labelledby="escolha-titulo"
            aria-modal="true"
          >
            <h2 id="escolha-titulo">
              {escolhaLancamento.inicio === escolhaLancamento.fim
                ? tituloDoDia(escolhaLancamento.inicio)
                : formatarIntervaloBr(escolhaLancamento.inicio, escolhaLancamento.fim)}
            </h2>
            {cadastrosEscolha.eventos.length > 0 ? (
              <>
                <p className="meta">
                  {cadastrosEscolha.eventos.length === 1
                    ? 'Já cadastrado neste intervalo'
                    : `${cadastrosEscolha.eventos.length} lançamentos neste intervalo`}
                </p>
                <ul className="lista-dia">
                  {cadastrosEscolha.eventos.map((ev) => {
                    const tipo = calendario.tiposDia.find((t) => t.id === ev.tipoId)
                    return (
                      <li key={ev.id} className="item-legenda">
                        <AmostraTipo cor={tipo?.cor} />
                        <span>
                          {tipo?.nome} — {ev.descricao} (
                          {formatarIntervaloBr(ev.inicio, ev.fim)})
                        </span>
                        <span className="acoes">
                          <button
                            type="button"
                            className="botao botao-principal"
                            onClick={() => abrirCadastroDoEvento(ev)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="botao botao-secundario"
                            onClick={() => {
                              if (
                                apagarCadastroDoEvento(ev, {
                                  inicio: escolhaLancamento.inicio,
                                  fim: escolhaLancamento.fim,
                                })
                              ) {
                                setEscolhaLancamento(null)
                              }
                            }}
                          >
                            Apagar
                          </button>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <p className="meta">O que você quer lançar nestes dias?</p>
            )}
            <div className="acoes">
              <button
                type="button"
                className="botao botao-principal"
                onClick={() => {
                  const { inicio, fim } = escolhaLancamento
                  abrirFormEvento(inicio, fim)
                }}
              >
                Adicionar evento
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => {
                  const { inicio, fim } = escolhaLancamento
                  abrirFormFeriado(inicio, fim)
                }}
              >
                Adicionar feriado ou recesso
              </button>

              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => setEscolhaLancamento(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {diaAberto ? (
        <div className="dialogo-fundo">
          <div
            className="dialogo"
            role="dialog"
            aria-labelledby="dia-titulo"
            aria-modal="true"
          >
            <h2 id="dia-titulo">{tituloDoDia(diaAberto)}</h2>
            {conflitosDoDia(calendario, diaAberto).length > 0 ? (
              <ul className="lista-conflitos">
                {conflitosDoDia(calendario, diaAberto).map((c) => (
                  <ItemConflito key={c.id} c={c} onAceitar={aceitarAviso} />
                ))}
              </ul>
            ) : null}
            {tiposDoDia(calendario, diaAberto).length === 0 &&
            eventosDoTipo(calendario, diaAberto, TIPO_RETIRADA).length === 0 ? (
              <p className="vazio">Nada lançado neste dia.</p>
            ) : (
              <ul className="lista-dia">
                {eventosDoTipo(calendario, diaAberto, TIPO_RETIRADA).map((ev) => (
                  <li key={ev.id} className="item-legenda">
                    <span>Letivo retirado</span>
                    <span className="acoes">
                      <button
                        type="button"
                        className="botao botao-secundario"
                        onClick={() => {
                          if (confirmarApagarRetirada(ev.id, ev.inicio)) fecharDia()
                        }}
                      >
                        Apagar
                      </button>
                    </span>
                  </li>
                ))}
                {tiposDoDia(calendario, diaAberto).flatMap((tipo) => {
                  const eventos = eventosDoTipo(calendario, diaAberto, tipo.id)
                  if (eventos.length === 0) {
                    return [
                      <li key={tipo.id} className="item-legenda">
                        <span
                          className="amostra"
                          style={{ background: tipo.cor }}
                          aria-hidden="true"
                        />
                        <span>{tipo.nome}</span>
                      </li>,
                    ]
                  }
                  return eventos.map((ev) => (
                    <li key={ev.id} className="item-legenda">
                      <span
                        className="amostra"
                        style={{ background: tipo.cor }}
                        aria-hidden="true"
                      />
                      <span>
                        {tipo.nome} — {ev.descricao} (
                        {ev.origem === 'automatico' ? 'automático' : 'manual'})
                      </span>
                      <span className="acoes">
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => abrirCadastroDoEvento(ev)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => {
                            if (
                              diaAberto &&
                              apagarCadastroDoEvento(ev, { inicio: diaAberto, fim: diaAberto })
                            ) {
                              fecharDia()
                            }
                          }}
                        >
                          Apagar
                        </button>
                      </span>
                    </li>
                  ))
                })}
              </ul>
            )}
            <div className="acoes">
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => {
                  if (diaAberto) abrirFormEvento(diaAberto, diaAberto)
                }}
              >
                Adicionar evento
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => {
                  if (diaAberto) abrirFormFeriado(diaAberto, diaAberto)
                }}
              >
                Adicionar feriado ou recesso
              </button>

              <button
                type="button"
                className="botao botao-principal"
                ref={fecharDiaRef}
                onClick={fecharDia}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {anoPendente !== null ? (
        <div className="dialogo-fundo">
          <div
            className="dialogo"
            role="dialog"
            aria-labelledby="troca-ano-titulo"
            aria-modal="true"
          >
            <h2 id="troca-ano-titulo">Trocar o ano</h2>
            <p>
              O ano passa de {calendario.ano} para {anoPendente}. Os feriados
              automáticos serão recalculados.
            </p>
            {resumoTrocaAno(calendario) ? (
              <p>{resumoTrocaAno(calendario)}</p>
            ) : null}
            <div className="acoes">
              <button
                type="button"
                className="botao botao-principal"
                onClick={() => confirmarTroca('manter')}
              >
                Manter minhas alterações
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => confirmarTroca('padrao')}
              >
                Voltar aos feriados padrão
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => {
                  setAnoPendente(null)
                  setAnoDigitado(String(calendario.ano))
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {formTipos && !formTipo ? (
        <Dialogo tituloId="tipos-dia-titulo" titulo="Tipos de marcação" className="dialogo-tipos">
          {[
            { titulo: 'Padrão', tipos: tiposPadraoOrdenados(calendario.tiposDia) },
            { titulo: 'Criados', tipos: tiposCriadosOrdenados(calendario.tiposDia) },
          ]
            .filter((grupo) => grupo.tipos.length > 0)
            .map((grupo, _indice, grupos) => (
          <div key={grupo.titulo} className="grupo-tipos">
            {grupos.length > 1 ? <h3>{grupo.titulo}</h3> : null}
            <ul className="lista-tipos-dia">
            {grupo.tipos.map((tipo) => {
              const params = parametrosDoTipo(tipo)
              return (
                <li key={tipo.id} className="item-tipo-cor">
                  <div className="item-tipo-cabecalho">
                    <span
                      className="amostra"
                      style={{ background: tipo.cor }}
                      aria-hidden="true"
                    />
                    <span className="nome-tipo">{tipo.nome}</span>
                    <div className="item-tipo-acoes">
                      <label className="campo-cor">
                        <span className="sr-only">Cor de {tipo.nome}</span>
                        <input
                          type="color"
                          value={tipo.cor}
                          onChange={(e) => trocarCor(tipo.id, e.target.value)}
                        />
                        <span className="hex-cor">{tipo.cor}</span>
                      </label>
                      {tipo.corManual ? (
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => onMudou(voltarCorSugerida(calendario, tipo.id))}
                        >
                          Voltar à cor sugerida
                        </button>
                      ) : null}
                      {tipoPodeApagar(tipo) ? (
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => {
                            if (!window.confirm(`Apagar o tipo ${tipo.nome}?`)) return
                            const r = apagarTipoDia(calendario, tipo.id)
                            if (!r.ok) {
                              window.alert(r.erros[0]?.mensagem ?? 'Não foi possível apagar.')
                              return
                            }
                            onMudou(r.calendario)
                          }}
                        >
                          Apagar
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {ehTipoLetivo(tipo) ? null : (
                    <div className="params-tipo">
                      {tipoMostraCombina(tipo) ? (
                        <fieldset className="grupo-interruptores">
                          <legend>Dia letivo</legend>
                          <label className="interruptor">
                            <input
                              type="radio"
                              name={`combina-${tipo.id}`}
                              checked={params.combinaComLetivo}
                              onChange={() =>
                                onMudou(
                                  definirParametrosTipo(calendario, tipo.id, {
                                    combinaComLetivo: true,
                                  }),
                                )
                              }
                            />
                            <span className="interruptor-texto">
                              Permite combinar com dia letivo
                              <Dica texto={DICA_COMBINA_SIM} />
                            </span>
                          </label>
                          <label className="interruptor">
                            <input
                              type="radio"
                              name={`combina-${tipo.id}`}
                              checked={!params.combinaComLetivo}
                              onChange={() =>
                                onMudou(
                                  definirParametrosTipo(calendario, tipo.id, {
                                    combinaComLetivo: false,
                                  }),
                                )
                              }
                            />
                            <span className="interruptor-texto">
                              Não permite combinar com dia letivo
                              <Dica texto={DICA_COMBINA_NAO} />
                            </span>
                          </label>
                        </fieldset>
                      ) : null}
                      <AjudaDoTipo
                        calendario={calendario}
                        tipoId={tipo.id}
                        tipoLetivoId={calendario.periodos[0]?.tipoLetivoId}
                      />
                      <label className="interruptor">
                        <input
                          type="checkbox"
                          checked={params.entraNoPrazo}
                          onChange={(e) =>
                            onMudou(
                              definirParametrosTipo(calendario, tipo.id, {
                                entraNoPrazo: e.target.checked,
                              }),
                            )
                          }
                        />
                        <span className="interruptor-texto">
                          Pode ser origem ou destino de prazo
                          <Dica texto={DICA_PRAZO} />
                        </span>
                      </label>
                    </div>
                  )}
                </li>
              )
            })}
            </ul>
          </div>
            ))}
          <div className="acoes">
            <button
              type="button"
              className="botao botao-principal"
              onClick={() => {
                setErrosTipo([])
                setNovoTipoCor('#38a169')
                setNovoTipoCombina(true)
                setFormTipo(true)
              }}
            >
              Criar tipo
            </button>
            <button
              type="button"
              className="botao botao-secundario"
              onClick={() => setFormTipos(false)}
            >
              Fechar
            </button>
          </div>
        </Dialogo>
      ) : null}

      {formTipo ? (
        <Dialogo tituloId="form-tipo-titulo" titulo="Novo tipo de marcação">
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              const dados = new FormData(evento.currentTarget)
              const r = adicionarTipoDia(calendario, {
                nome: String(dados.get('nome') ?? ''),
                cor: String(dados.get('cor') ?? '#38a169'),
                combinaComLetivo: dados.get('combina') !== 'nao',
                entraNoPrazo: dados.get('entraNoPrazo') === 'on',
              })
              if (!r.ok) {
                setErrosTipo(r.erros)
                return
              }
              onMudou(r.calendario)
              setFormTipo(false)
              setErrosTipo([])
            }}
          >
            <div className="campo">
              <label htmlFor="tipo-nome">Nome</label>
              <input id="tipo-nome" name="nome" autoComplete="off" />
              {erroDoCampo(errosTipo, 'nome') ? (
                <p className="erro-campo">{erroDoCampo(errosTipo, 'nome')}</p>
              ) : null}
            </div>
            <div className="campo">
              <label htmlFor="tipo-cor">Cor</label>
              <input
                id="tipo-cor"
                name="cor"
                type="color"
                value={novoTipoCor}
                onChange={(e) => setNovoTipoCor(e.target.value)}
              />
              {erroDoCampo(errosTipo, 'cor') ? (
                <p className="erro-campo">{erroDoCampo(errosTipo, 'cor')}</p>
              ) : null}
            </div>
            <fieldset className="grupo-interruptores">
              <legend>Dia letivo</legend>
              <label className="interruptor">
                <input
                  type="radio"
                  name="combina"
                  value="sim"
                  checked={novoTipoCombina}
                  onChange={() => setNovoTipoCombina(true)}
                />
                <span className="interruptor-texto">
                  Permite combinar com dia letivo
                  <Dica texto={DICA_COMBINA_SIM} />
                </span>
              </label>
              <label className="interruptor">
                <input
                  type="radio"
                  name="combina"
                  value="nao"
                  checked={!novoTipoCombina}
                  onChange={() => setNovoTipoCombina(false)}
                />
                <span className="interruptor-texto">
                  Não permite combinar com dia letivo
                  <Dica texto={DICA_COMBINA_NAO} />
                </span>
              </label>
            </fieldset>
            <AjudaDeCombina
              calendario={calendario}
              combinaComLetivo={novoTipoCombina}
              corMarca={novoTipoCor}
            />
            <label className="interruptor">
              <input type="checkbox" name="entraNoPrazo" />
              <span className="interruptor-texto">
                Pode ser origem ou destino de prazo
                <Dica texto={DICA_PRAZO} />
              </span>
            </label>
            <div className="acoes">
              <button type="submit" className="botao botao-principal">
                Criar tipo
              </button>
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => {
                  setFormTipo(false)
                  setErrosTipo([])
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Dialogo>
      ) : null}

      {formRegras && !formRegra ? (
        <Dialogo tituloId="regras-titulo" titulo="Regras deste calendário">
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              const dados = new FormData(evento.currentTarget)
              const minimo = Number(String(dados.get('minimo') ?? '200'))
              onMudou({
                ...calendario,
                minimoDiasLetivos: Number.isFinite(minimo) && minimo > 0 ? minimo : 200,
                regras: {
                  ...regras,
                  mostrarTotais: dados.get('mostrarTotais') === 'on',
                  avisoMinimo: dados.get('avisoMinimo') === 'on',
                },
              })
              setFormRegras(false)
            }}
          >
            <div className="campo">
              <label htmlFor="minimo-dias">Mínimo de dias letivos no ano</label>
              <input
                id="minimo-dias"
                name="minimo"
                inputMode="numeric"
                defaultValue={String(calendario.minimoDiasLetivos ?? 200)}
              />
            </div>
            <label className="interruptor">
              <input type="checkbox" name="avisoMinimo" defaultChecked={regras.avisoMinimo} />
              Avisar se o total ficar abaixo ou acima do mínimo
            </label>
            <label className="interruptor">
              <input type="checkbox" name="mostrarTotais" defaultChecked={regras.mostrarTotais} />
              Mostrar totais na tabela
            </label>
            <fieldset className="grupo-interruptores">
              <legend>Regras da pessoa</legend>
              {regras.regrasUsuario.length === 0 ? (
                <p className="vazio">Nenhuma regra ainda. Adicione o que a sua instituição precisa conferir.</p>
              ) : (
                <ul className="lista-regras">
                  {regras.regrasUsuario.map((regra) => (
                    <li key={regra.id} className="item-regra">
                      <label className="interruptor">
                        <input
                          type="checkbox"
                          checked={regra.ligada}
                          onChange={(e) =>
                            onMudou(definirRegraLigada(calendario, regra.id, e.target.checked))
                          }
                        />
                        {regra.nome}
                      </label>
                      <span className="acoes">
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => {
                            setErrosRegra([])
                            setModeloRegra(regra.modelo)
                            setFormRegra(regra.id)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="botao botao-secundario"
                          onClick={() => onMudou(apagarRegraUsuario(calendario, regra.id))}
                        >
                          Apagar
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="botao botao-principal"
                onClick={() => {
                  setErrosRegra([])
                  setModeloRegra('presenca')
                  setFormRegra('nova')
                }}
              >
                Adicionar regra
              </button>
            </fieldset>
            <div className="acoes">
              <button type="submit" className="botao botao-principal">
                Salvar regras
              </button>
              <button type="button" className="botao botao-secundario" onClick={() => setFormRegras(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </Dialogo>
      ) : null}

      {formRegra ? (
        <Dialogo
          tituloId="form-regra-titulo"
          titulo={formRegra === 'nova' ? 'Nova regra' : 'Editar regra'}
        >
          <FormularioRegra
            calendario={calendario}
            regra={
              formRegra === 'nova'
                ? null
                : (regras.regrasUsuario.find((r) => r.id === formRegra) ?? null)
            }
            modelo={modeloRegra}
            onModelo={setModeloRegra}
            erros={errosRegra}
            onSubmit={(entrada) => {
              const r =
                formRegra === 'nova'
                  ? adicionarRegraUsuario(calendario, entrada)
                  : atualizarRegraUsuario(calendario, formRegra, entrada)
              if (!r.ok) {
                setErrosRegra(r.erros)
                return
              }
              onMudou(r.calendario)
              setFormRegra(null)
              setErrosRegra([])
            }}
            onCancelar={() => {
              setFormRegra(null)
              setErrosRegra([])
            }}
          />
        </Dialogo>
      ) : null}

      <div className="impressao" aria-hidden="true">
        <header className="impressao-cabecalho">
          <h1>
            {calendario.nome} — {calendario.ano}
          </h1>
          <p>{calendario.instituicao}</p>
        </header>
        <MesesImpressao calendario={calendario} />
        {itensLegenda.length > 0 ? (
          <ul className="legenda impressao-legenda">
            {itensLegenda.map((item) => (
              <li key={item.id} className="item-legenda">
                <span className="amostra" style={{ background: item.cor }} />
                {item.nome} ({item.quantidade})
              </li>
            ))}
          </ul>
        ) : null}
        <section className="impressao-tabela">
          <h2>Tabela de detalhamento</h2>
          {linhas.length === 0 ? (
            <p>Nenhum feriado, recesso ou evento neste período.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Datas</th>
                  <th>Lançamento</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={`${l.periodoId}-${l.inicio}-imp`}>
                    <td>{l.periodoNome}</td>
                    <td>{formatarIntervaloBr(l.inicio, l.fim)}</td>
                    <td>
                      <span className="item-com-cor">
                        {tiposDoDia(calendario, l.inicio)
                          .filter((tipo) => !ehTipoLetivo(tipo))
                          .map((tipo) => (
                            <AmostraTipo key={tipo.id} cor={tipo.cor} />
                          ))}
                        <span>{l.texto}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totais ? <p>Dias letivos no ano: {totais.ano}</p> : null}
        </section>
      </div>

      <div className="barra-rascunho">
        <button type="button" className="botao botao-secundario" onClick={onAbrirArquivo}>
          Abrir rascunho
        </button>
        <button type="button" className="botao botao-principal" onClick={onSalvarArquivo}>
          Salvar rascunho
        </button>
        {mudancasNaoBaixadas ? (
          <p className="recado" role="status">
            Há mudanças ainda não baixadas. O navegador guarda uma cópia que pode ser apagada.
          </p>
        ) : (
          <p className="meta">Rascunho baixado. O navegador também guarda uma cópia recente.</p>
        )}
      </div>
      <Rodape />
    </main>
  )
}
