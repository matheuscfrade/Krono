import { ajudaPintura, TEXTO_AJUDA_PERIODO, TEXTO_AJUDA_RETIRADA } from '../dominio/ajudaPintura'
import {
  corLetivoAmostra,
  corTextoSobre,
  parametrosDoTipoId,
  TIPO_FERIADO,
  TIPO_RECESSO,
  type Calendario,
} from '../dominio/calendario'

function TextoComDestaque({ texto }: { texto: string }) {
  const partes = texto.split('**')
  return (
    <p>
      {partes.map((parte, indice) =>
        indice % 2 === 1 ? <strong key={indice}>{parte}</strong> : parte,
      )}
    </p>
  )
}

type Props = {
  texto: string
  corFundo: string | null
  corMarca: string | null
}

export function AjudaPintura({ texto, corFundo, corMarca }: Props) {
  const estiloFundo = corFundo
    ? { background: corFundo, color: corTextoSobre(corFundo) }
    : undefined
  return (
    <div className="ajuda-pintura">
      <div className="dia dia-amostra" aria-hidden="true" style={estiloFundo}>
        <span className="dia-numero">12</span>
        {corMarca ? (
          <span className="dia-marcas">
            <span className="dia-marca" style={{ background: corMarca }} />
          </span>
        ) : null}
      </div>
      <TextoComDestaque texto={texto} />
    </div>
  )
}

function corDoTipo(calendario: Calendario, tipoId: string): string | null {
  return calendario.tiposDia.find((t) => t.id === tipoId)?.cor ?? null
}

export function AjudaDoTipo({
  calendario,
  tipoId,
  tipoLetivoId,
}: {
  calendario: Calendario
  tipoId: string
  tipoLetivoId?: string
}) {
  const ajuda = ajudaPintura(tipoId, {
    combinaComLetivo: parametrosDoTipoId(calendario, tipoId).combinaComLetivo,
  })
  if (!ajuda) return null
  const corFundo =
    ajuda.fundo === 'letivo'
      ? corLetivoAmostra(calendario, tipoLetivoId)
      : ajuda.fundo === 'feriado'
        ? corDoTipo(calendario, TIPO_FERIADO)
        : ajuda.fundo === 'recesso'
          ? corDoTipo(calendario, TIPO_RECESSO)
          : null
  return (
    <AjudaPintura
      texto={ajuda.texto}
      corFundo={corFundo}
      corMarca={ajuda.marca ? corDoTipo(calendario, tipoId) : null}
    />
  )
}

export function AjudaDeCombina({
  calendario,
  combinaComLetivo,
  corMarca,
}: {
  calendario: Calendario
  combinaComLetivo: boolean
  corMarca: string
}) {
  const ajuda = ajudaPintura('tipo-criado', { combinaComLetivo })
  if (!ajuda) return null
  return (
    <AjudaPintura
      texto={ajuda.texto}
      corFundo={ajuda.fundo === 'letivo' ? corLetivoAmostra(calendario) : null}
      corMarca={ajuda.marca ? corMarca : null}
    />
  )
}

export function AjudaRetirada() {
  return <AjudaPintura texto={TEXTO_AJUDA_RETIRADA} corFundo={null} corMarca={null} />
}

export function AjudaPeriodo({
  calendario,
  tipoLetivoId,
}: {
  calendario: Calendario
  tipoLetivoId?: string
}) {
  return (
    <AjudaPintura
      texto={TEXTO_AJUDA_PERIODO}
      corFundo={corLetivoAmostra(calendario, tipoLetivoId)}
      corMarca={null}
    />
  )
}
