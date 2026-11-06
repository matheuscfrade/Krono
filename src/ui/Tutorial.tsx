import { useEffect, useId, useRef, useState } from 'react'
import { PASSOS_TUTORIAL } from './passosTutorial'

type Props = {
  onFechar: () => void
}

export function Tutorial({ onFechar }: Props) {
  const [indice, setIndice] = useState(0)
  const dialogoRef = useRef<HTMLDivElement>(null)
  const tituloId = useId()
  const passo = PASSOS_TUTORIAL[indice]
  const ultimo = indice === PASSOS_TUTORIAL.length - 1

  useEffect(() => {
    dialogoRef.current?.focus()
  }, [])

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        evento.stopImmediatePropagation()
        onFechar()
        return
      }
      if (evento.key === 'ArrowRight' && !ultimo) {
        evento.preventDefault()
        setIndice((i) => i + 1)
      }
      if (evento.key === 'ArrowLeft' && indice > 0) {
        evento.preventDefault()
        setIndice((i) => i - 1)
      }
    }
    window.addEventListener('keydown', tecla, true)
    return () => window.removeEventListener('keydown', tecla, true)
  }, [indice, ultimo, onFechar])

  return (
    <div className="dialogo-fundo dialogo-fundo-tutorial">
      <div
        ref={dialogoRef}
        className="dialogo dialogo-tutorial"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
      >
        <p className="tutorial-progresso" aria-live="polite">
          {indice + 1} de {PASSOS_TUTORIAL.length}
        </p>
        <h2 id={tituloId}>{passo.titulo}</h2>
        <p>{passo.texto}</p>
        <div className="tutorial-pontos" aria-hidden="true">
          {PASSOS_TUTORIAL.map((item, i) => (
            <span
              key={item.titulo}
              className={i === indice ? 'tutorial-ponto atual' : 'tutorial-ponto'}
            />
          ))}
        </div>
        <div className="acoes">
          <button
            type="button"
            className="botao botao-secundario"
            disabled={indice === 0}
            onClick={() => setIndice((i) => i - 1)}
          >
            Anterior
          </button>
          {ultimo ? (
            <button type="button" className="botao botao-principal" onClick={onFechar}>
              Entendi
            </button>
          ) : (
            <button
              type="button"
              className="botao botao-principal"
              onClick={() => setIndice((i) => i + 1)}
            >
              Próximo
            </button>
          )}
        </div>
        <button type="button" className="botao botao-texto" onClick={onFechar}>
          Pular
        </button>
      </div>
    </div>
  )
}
