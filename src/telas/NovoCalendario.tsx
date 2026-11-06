import { useState, type FormEventHandler } from 'react'
import {
  criarCalendario,
  type Calendario,
  type ErroCampo,
} from '../dominio/calendario'
import { Rodape } from '../ui/Rodape'

type Props = {
  onCriado: (calendario: Calendario) => void
  onVoltar: () => void
  onComoUsar: () => void
}

function erroDoCampo(erros: ErroCampo[], campo: string): string {
  return erros.find((e) => e.campo === campo)?.mensagem ?? ''
}

export function NovoCalendario({ onCriado, onVoltar, onComoUsar }: Props) {
  const [erros, setErros] = useState<ErroCampo[]>([])
  const [ano, setAno] = useState(String(new Date().getFullYear()))

  const enviar: FormEventHandler<HTMLFormElement> = (evento) => {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const resultado = criarCalendario({
      nome: String(dados.get('nome') ?? ''),
      instituicao: String(dados.get('instituicao') ?? ''),
      ano: String(dados.get('ano') ?? ''),
    })
    if (!resultado.ok) {
      setErros(resultado.erros)
      return
    }
    onCriado(resultado.calendario)
  }

  return (
    <main className="pagina">
      <header className="cabecalho-tela">
        <div>
          <h1>Novo calendário</h1>
          <p className="subtitulo">Nome, instituição e ano.</p>
        </div>
        <div className="acoes">
          <button type="button" className="botao botao-secundario" onClick={onComoUsar}>
            Como usar
          </button>
        </div>
      </header>

      <form className="cartao" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="nome">Nome do calendário</label>
          <input id="nome" name="nome" autoComplete="off" />
          {erroDoCampo(erros, 'nome') ? (
            <p className="erro-campo">{erroDoCampo(erros, 'nome')}</p>
          ) : null}
        </div>
        <div className="campo">
          <label htmlFor="instituicao">Instituição</label>
          <input
            id="instituicao"
            name="instituicao"
            autoComplete="organization"
          />
          {erroDoCampo(erros, 'instituicao') ? (
            <p className="erro-campo">{erroDoCampo(erros, 'instituicao')}</p>
          ) : null}
        </div>
        <div className="campo">
          <label htmlFor="ano">Ano</label>
          <input
            id="ano"
            name="ano"
            inputMode="numeric"
            maxLength={4}
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          />
          {erroDoCampo(erros, 'ano') ? (
            <p className="erro-campo">{erroDoCampo(erros, 'ano')}</p>
          ) : null}
        </div>

        <div className="acoes">
          <button type="submit" className="botao botao-principal">
            Criar calendário
          </button>
          <button type="button" className="botao botao-secundario" onClick={onVoltar}>
            Voltar
          </button>
        </div>
      </form>
      <Rodape />
    </main>
  )
}
