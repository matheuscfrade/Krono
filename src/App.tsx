import { useEffect, useRef, useState } from 'react'
import type { Calendario } from './dominio/calendario'
import { lerRascunho, nomeArquivoRascunho, serializarCalendario } from './dominio/rascunho'
import { baixarArquivo } from './exportar/arquivo'
import { CalendarioAno } from './telas/CalendarioAno'
import { Inicio } from './telas/Inicio'
import { NovoCalendario } from './telas/NovoCalendario'
import { Tutorial } from './ui/Tutorial'

type Tela = 'inicio' | 'novo' | 'ano'

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio')
  const [calendario, setCalendario] = useState<Calendario | null>(null)
  const [assinaturaBaixada, setAssinaturaBaixada] = useState('')
  const [recadoInicio, setRecadoInicio] = useState('')
  const [tutorialAberto, setTutorialAberto] = useState(false)
  const arquivoRef = useRef<HTMLInputElement>(null)

  const mudancasNaoBaixadas = Boolean(
    calendario && serializarCalendario(calendario) !== assinaturaBaixada,
  )

  useEffect(() => {
    function avisar(evento: BeforeUnloadEvent) {
      if (!mudancasNaoBaixadas) return
      evento.preventDefault()
      evento.returnValue = ''
    }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [mudancasNaoBaixadas])

  function abrirCalendario(criado: Calendario, baixado: boolean) {
    setCalendario(criado)
    setAssinaturaBaixada(baixado ? serializarCalendario(criado) : '')
    setTela('ano')
  }

  function salvarArquivo() {
    if (!calendario) return
    baixarArquivo(nomeArquivoRascunho(calendario), serializarCalendario(calendario), 'application/json')
    setAssinaturaBaixada(serializarCalendario(calendario))
  }

  function lerArquivo(arquivo: File) {
    const leitor = new FileReader()
    leitor.onload = () => {
      const texto = typeof leitor.result === 'string' ? leitor.result : ''
      const lido = lerRascunho(texto)
      if (!lido.ok) {
        setRecadoInicio(lido.mensagem)
        setTela('inicio')
        return
      }
      abrirCalendario(lido.calendario, true)
      setRecadoInicio('')
    }
    leitor.readAsText(arquivo)
  }

  const inputArquivo = (
    <input
      ref={arquivoRef}
      type="file"
      accept="application/json,.json"
      className="arquivo-escondido"
      aria-hidden="true"
      tabIndex={-1}
      onChange={(evento) => {
        const arquivo = evento.currentTarget.files?.[0]
        evento.currentTarget.value = ''
        if (arquivo) lerArquivo(arquivo)
      }}
    />
  )

  const tutorial = tutorialAberto ? (
    <Tutorial onFechar={() => setTutorialAberto(false)} />
  ) : null

  if (tela === 'novo') {
    return (
      <>
        {inputArquivo}
        <NovoCalendario
          onCriado={(criado) => abrirCalendario(criado, false)}
          onVoltar={() => setTela('inicio')}
          onComoUsar={() => setTutorialAberto(true)}
        />
        {tutorial}
      </>
    )
  }

  if (tela === 'ano' && calendario) {
    return (
      <>
        {inputArquivo}
        <CalendarioAno
          calendario={calendario}
          onMudou={setCalendario}
          mudancasNaoBaixadas={mudancasNaoBaixadas}
          onSalvarArquivo={salvarArquivo}
          onAbrirArquivo={() => arquivoRef.current?.click()}
          onComoUsar={() => setTutorialAberto(true)}
          onVoltar={() => {
            setCalendario(null)
            setAssinaturaBaixada('')
            setTela('inicio')
          }}
        />
        {tutorial}
      </>
    )
  }

  return (
    <>
      {inputArquivo}
      <Inicio
        recado={recadoInicio}
        onNovo={() => {
          setRecadoInicio('')
          setTela('novo')
          setTutorialAberto(true)
        }}
        onAbrirArquivo={() => arquivoRef.current?.click()}
      />
      {tutorial}
    </>
  )
}
