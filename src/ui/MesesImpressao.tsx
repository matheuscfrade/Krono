import {
  corTextoSobre,
  gradeMes,
  LIMITE_MARCAS_DIA,
  NOMES_MESES,
  pinturaDoDia,
  type Calendario,
} from '../dominio/calendario'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function MesesImpressao({ calendario }: { calendario: Calendario }) {
  return (
    <div className="meses meses-impressao">
      {NOMES_MESES.map((nomeMes, indice) => {
        const mes = indice + 1
        const celulas = gradeMes(calendario.ano, mes)
        return (
          <article key={nomeMes} className="mes mes-impressao">
            <h3>
              {nomeMes} {calendario.ano}
            </h3>
            <div className="grade-mes">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="dia-semana">
                  {d}
                </div>
              ))}
              {celulas.map((celula, i) => {
                if (celula.foraDoMes) {
                  return (
                    <div key={`${nomeMes}-fora-${i}`} className="dia dia-fora">
                      {celula.dia}
                    </div>
                  )
                }
                const pintura = pinturaDoDia(calendario, celula.iso)
                const fundo = pintura.fundo
                const marcas = pintura.marcas.slice(0, LIMITE_MARCAS_DIA)
                return (
                  <div
                    key={celula.iso}
                    className="dia dia-impressao"
                    style={
                      fundo
                        ? { background: fundo.cor, color: corTextoSobre(fundo.cor) }
                        : undefined
                    }
                  >
                    <span className="dia-numero">{celula.dia}</span>
                    {marcas.length > 0 || pintura.haMais ? (
                      <span className="dia-marcas" aria-hidden="true">
                        {marcas.map((marca) => (
                          <span
                            key={marca.evento.id}
                            className="dia-marca"
                            style={{ background: marca.tipo.cor }}
                          />
                        ))}
                        {pintura.haMais ? <span className="dia-mais-sinal">+</span> : null}
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}
