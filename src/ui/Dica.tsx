import { useId, useState } from 'react'

export const DICA_COMBINA_SIM =
  'Se o dia já era aula, continua aula e ganha a marca deste tipo.'

export const DICA_COMBINA_NAO =
  'O lançamento ocupa o dia e some a aula, como num feriado.'

export const DICA_PRAZO =
  'Este tipo aparece em Origem e Destino ao criar uma regra de prazo mínimo — por exemplo, do fim do período até os exames.'

export function Dica({ texto }: { texto: string }) {
  const id = useId()
  const [aberta, setAberta] = useState(false)
  return (
    <span className={aberta ? 'dica dica-aberta' : 'dica'}>
      <button
        type="button"
        className="dica-botao"
        aria-label="Explicação"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={(evento) => {
          evento.preventDefault()
          evento.stopPropagation()
          setAberta((v) => !v)
        }}
      >
        ?
      </button>
      <span id={id} className="dica-balao" role="tooltip">
        {texto}
      </span>
    </span>
  )
}
