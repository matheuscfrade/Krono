export type PassoTutorial = {
  titulo: string
  texto: string
}

export const PASSOS_TUTORIAL: PassoTutorial[] = [
  {
    titulo: 'Nome, instituição e ano',
    texto:
      'Preencha os três campos e toque em Criar calendário. Os feriados nacionais daquele ano já entram na lista.',
  },
  {
    titulo: 'Comece pelos períodos',
    texto:
      'Na aba Cadastro, em Períodos, lance cada etapa com início e fim. Segunda a sexta viram aula e pintam o mês.',
  },
  {
    titulo: 'Clique no dia',
    texto:
      'Um toque no dia abre o que já está lançado: feriado, evento ou aviso. Dá para editar ou lançar naquela data.',
  },
  {
    titulo: 'Clique e arraste',
    texto:
      'No computador, clique no primeiro dia e arraste até o último. Serve para férias, recesso e eventos, e lista o que cruza o intervalo para editar. No celular, use as abas de Cadastro.',
  },
  {
    titulo: 'Regras e tipos',
    texto:
      'No topo, Regras define o mínimo de dias e os prazos. Tipos de marcação troca as cores e se o tipo combina com dia letivo.',
  },
  {
    titulo: 'Guarde o rascunho',
    texto:
      'Salvar rascunho baixa um arquivo .json. Nada vai para a internet. PDF e Excel usam as mesmas datas do calendário.',
  },
]
