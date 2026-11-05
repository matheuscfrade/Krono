# Spec: regras parametrizáveis

> Status: **implementada** (2026-11-05).

## Objetivo
O elaborador define as regras do **próprio calendário**: o que conta como dia letivo, o que precisa existir no ano e prazos entre datas. O Krono deixa de trazer a lista da IN do IFMG. Quem usa uma instituição qualquer monta só o que precisa.

**Quem usa:** quem elabora o calendário.

## Contexto
A IN 2/2025 do IFMG (Art. 10) virou uma lista fixa de conferência (férias, exames, matrícula, colação…). Isso não escala e ainda assim faltou regra de **prazo** (ex.: entre o fim do período e as provas finais). Na IN 2/2025 **não há um número de dias** para esse prazo — só a obrigação de constar “avaliações finais e recuperação”. O número fica com a instituição. Esta spec cobre o prazo como regra que a pessoa cria, com o N que ela informar.

## Jornada
1. Abre **Regras deste calendário**. Vê o mínimo de 200, os interruptores de aviso/totais e a lista **Regras deste calendário** (vazia num calendário novo).
2. **Adicionar regra** → escolhe o modelo **Prazo entre duas datas**. Origem: “Fim de cada período”. Destino: tipo Exames finais. Mínimo: 3 dias. Salva. Se os exames começarem no dia seguinte ao fim da etapa, aparece aviso no calendário.
3. Em **Tipos de marcação**, abre Recuperação e liga **Conta como dia letivo**. Os dias de recuperação passam a entrar nos 200 e a pintar fundo de aula.
4. **Adicionar regra** → **Precisa existir**. Tipo: Férias. Se o ano não tiver férias, aviso.
5. Celular: a mesma tela, um campo por linha, botão **Salvar regra** ≥ 44 px.

## Telas

**Regras deste calendário** (diálogo, como hoje)
- Mínimo de dias letivos (número).
- Avisar se o total ficar abaixo ou acima.
- Mostrar totais na tabela.
- Lista de **regras da pessoa**: nome, ligada/desligada, Editar, Apagar.
- **Adicionar regra** (ação principal da lista).
- Sem a lista longa da IN (férias, colação, aluno especial…). Sem semanas temáticas pré-carregadas.

**Formulário da regra**
- Nome (texto).
- Modelo: **Precisa existir** ou **Prazo mínimo**.
- Precisa existir: escolher um **tipo de marcação** (ou, se nenhum tipo servir, uma palavra no nome do evento).
- Prazo mínimo: origem (**Fim de cada período** ou um tipo), destino (um tipo), número de **dias corridos**.
- Gravidade: aviso (padrão) ou erro.
- **Salvar regra** / Cancelar.

**Tipos de marcação** (bloco que já existe)
Em cada tipo, além da cor: rádio Permite / Não permite combinar com dia letivo (spec 16). Totais = dias letivos (spec 17). Reposição e Sábado letivo não mostram o rádio.

Tipos padrão já vêm com esses valores iguais ao comportamento de hoje. A pessoa muda. **Criar tipo** entra nesta spec: nome + cor + os três interruptores.

## Regras
Ver `docs/DOMINIO.md` (atualizar na implementação). Cálculo em `src/dominio`, com testes. Sem React.

**Parâmetros do tipo** (valem para pintura e para a conta dos 200):

| Interruptor | Efeito |
|---|---|
| Tira o dia letivo | Aquele dia deixa de ser aula (como feriado hoje). |
| Conta nos totais | Entra em `totalDiasLetivos` se o dia for aula. |
| Vira aula | O dia **é** aula (sábado inclusive). Domingo continua sem aula. |

Padrão dos tipos prontos (igual ao Krono de agora, até a pessoa mudar):

| Tipo | Tira letivo | Conta nos totais | Vira aula |
|---|---|---|---|
| Feriado, Recesso, Férias, Recuperação, Retirada | sim | não | não |
| Exames finais | sim | não | não |
| Reposição, Sábado letivo | não | sim | sim |
| Evento | não | sim | só no sábado (já é a regra atual; o interruptor Vira aula no tipo Evento, se ligado, vale em qualquer dia útil/sábado) |

[CONFIRMAR] Evento no sábado já vira aula hoje. O interruptor **Vira aula** no tipo Evento, se desligado, volta o sábado a não contar? Proposta: **não mexer no sábado de Evento**; o interruptor só acrescenta “vira aula” em tipos que hoje não viram (Recuperação, Exames, um tipo criado).

**Regra “Precisa existir”:** se ligada e não houver evento daquele tipo (ou com aquela palavra) no ano → conflito 10.

**Regra “Prazo mínimo”:** para cada par origem→destino, se a distância em **dias corridos** (destino.inicio − origem.fim) for menor que N → aviso ou erro. Origem “Fim de cada período”: um aviso por período que descumprir. Destino ausente no ano: não dispara o prazo (a regra Precisa existir cuida disso, se a pessoa criou).

[CONFIRMAR] Dias corridos (inclui sábado e domingo), não só dias úteis.

O interruptor **Exames finais fora da conta** some da tela: vira o parâmetro do tipo Exames finais.

Itens da IN e semanas temáticas **não** entram em calendário novo. Rascunho antigo (formato 1) migra o que estava ligado para regras “Precisa existir”.

## Dados
Formato do rascunho passa para **2**. Arquivo v1 continua abrindo.

`TipoDia` ganha:
```ts
tiraLetivo?: boolean
contaNosTotais?: boolean
viraAula?: boolean
```
Ausente = padrão da tabela acima (migração).

`Calendario.regras`:
```ts
{
  mostrarTotais: boolean
  avisoMinimo: boolean
  regrasUsuario: {
    id: string
    nome: string
    ligada: boolean
    modelo: 'presenca' | 'prazo'
    tipoId?: string
    palavra?: string
    origem?: 'fim-periodo' | string
    destinoTipoId?: string
    minimoDias?: number
    gravidade: 'aviso' | 'erro'
  }[]
}
```
`examesForaDaConta`, `itensConferencia` e `semanasTematicas` saem no v2. Na leitura do v1: exames fora da conta → tipo exames `contaNosTotais: false`; cada item/semana ligado → uma regra `presenca`.

## Casos de erro e mensagens
| Situação | Mensagem |
|---|---|
| Nome da regra vazio | “Escreva o nome da regra.” |
| Precisa existir sem tipo e sem palavra | “Escolha um tipo ou escreva uma palavra.” |
| Prazo sem destino ou N < 1 | “Informe o destino e um número de dias maior que zero.” |
| Tipo novo sem nome | “Escreva o nome do tipo.” |
| Prazo descumprido | “Entre o fim de {período} ({data}) e {destino} ({data}) há {n} dia(s). A regra pede pelo menos {N}.” |
| Precisa existir, ausente | “Este calendário não tem {nome da regra}.” |

## Critérios de aceite
1. Calendário **novo** 2026: tela de regras **sem** “Colação de grau”, “Aluno especial” nem semanas temáticas. Lista de regras vazia.
2. Tipo Recuperação com **Conta como dia letivo** + **Vira aula** ligados: 11/05/2027 (recuperação fora do período, Formiga) entra em `totalDiasLetivos` e pinta fundo de aula.
3. Regra prazo: origem fim do período, destino Exames finais, N = 3. Período termina 15/12/2026 e exames começam 16/12/2026 → aviso. Exames em 18/12 → sem esse aviso.
4. Regra presença tipo Férias, ligada, ano sem férias → aviso. Com férias 01–31/07 → some.
5. Abrir `.json` v1 com `itensConferencia.exames: true` vira regra “Precisa existir / Exames finais”. O arquivo salvo sai como v2.
6. `src/dominio` sem React/DOM. `npm test` cobre 2–5. Nenhuma chamada de rede.
7. Celular 360 px: formulário da regra usável, Salvar ≥ 44 px, sem rolagem lateral.

## Fora do escopo
- Biblioteca compartilhada de regras entre calendários (cada rascunho tem as suas).
- Expressões livres (“se feriado cair em terça…”).
- Prazo em dias **úteis** (só corridos nesta spec).
- Hospedagem (Fase 7).
- Mudar feriados nacionais automáticos.
