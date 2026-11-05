import { Rodape } from '../ui/Rodape'

type Props = {
  recado: string
  onNovo: () => void
  onAbrirArquivo: () => void
}

export function Inicio({ recado, onNovo, onAbrirArquivo }: Props) {
  return (
    <main className="pagina pagina-inicio">
      <div className="inicio-hero" aria-hidden="true">
        <div className="inicio-grade">
          {Array.from({ length: 7 * 14 }, (_, i) => (
            <span
              key={i}
              className={`inicio-celula inicio-celula-${(i % 7) + 1}`}
              style={{
                animationDelay: `${(i % 7) * 0.16 + Math.floor(i / 7) * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="inicio-centro">
        <header className="inicio-cabecalho">
          <h1>Krono</h1>
          <p className="subtitulo">
            O jeito fácil de elaborar o calendário acadêmico de sua instituição
          </p>
        </header>

        <section className="cartao inicio-acoes-cartao" aria-labelledby="comecar">
          <h2 id="comecar">Começar</h2>
          <p className="meta">Crie um calendário novo ou abra um arquivo .json.</p>
          <div className="acoes">
            <button type="button" className="botao botao-principal" onClick={onNovo}>
              Novo calendário
            </button>
            <button type="button" className="botao botao-secundario" onClick={onAbrirArquivo}>
              Abrir rascunho
            </button>
          </div>
          {recado ? (
            <p className="recado" role="status">
              {recado}
            </p>
          ) : null}
        </section>
      </div>
      <Rodape />
    </main>
  )
}
