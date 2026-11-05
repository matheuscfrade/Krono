import { useRef } from 'react'
import { formatarDataBr, isoDeDataBr } from '../dominio/calendario'

function soDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8)
}

function mascararDataBr(valor: string): string {
  const bruto = valor.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(bruto) && isoDeDataBr(bruto)) {
    return formatarDataBr(bruto)
  }
  const limpo = valor.replace(/[^\d/]/g, '')
  if (!limpo.includes('/')) {
    const digitos = soDigitos(limpo)
    if (digitos.length <= 2) return digitos
    if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
  }
  const partes = limpo.split('/')
  const diaRaw = (partes[0] ?? '').replace(/\D/g, '')
  const mesRaw = (partes[1] ?? '').replace(/\D/g, '')
  const anoRaw = (partes[2] ?? '').replace(/\D/g, '')
  const dia = diaRaw.slice(0, 2)
  const mesTudo = diaRaw.slice(2) + mesRaw
  const mes = mesTudo.slice(0, 2)
  const ano = (mesTudo.slice(2) + anoRaw).slice(0, 4)
  if (partes.length === 1) return dia
  if (partes.length === 2 && mesTudo.length <= 2) return `${dia}/${mes}`
  return `${dia}/${mes}/${ano}`
}

function posicaoAposDigitos(mascarado: string, quantidade: number): number {
  if (quantidade <= 0) return 0
  let vistos = 0
  for (let i = 0; i < mascarado.length; i += 1) {
    if (mascarado[i] >= '0' && mascarado[i] <= '9') {
      vistos += 1
      if (vistos === quantidade) return i + 1
    }
  }
  return mascarado.length
}

type Props = {
  id: string
  name: string
  defaultValue?: string
}

export function CampoData({ id, name, defaultValue }: Props) {
  const textoRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLInputElement>(null)
  const isoInicial = isoDeDataBr(defaultValue ?? '') ?? ''

  function sincronizarPicker(mascarado: string) {
    const iso = isoDeDataBr(mascarado)
    if (iso && pickerRef.current) pickerRef.current.value = iso
  }

  return (
    <div className="campo-data">
      <input
        ref={textoRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/AAAA"
        maxLength={10}
        defaultValue={isoInicial ? formatarDataBr(isoInicial) : ''}
        onInput={(evento) => {
          const campo = evento.currentTarget
          const cursor = campo.selectionStart ?? campo.value.length
          const noFim = cursor >= campo.value.length
          const digitosAntes = soDigitos(campo.value.slice(0, cursor)).length
          const mascarado = mascararDataBr(campo.value)
          campo.value = mascarado
          const pos = noFim ? mascarado.length : posicaoAposDigitos(mascarado, digitosAntes)
          campo.setSelectionRange(pos, pos)
          sincronizarPicker(mascarado)
        }}
      />
      <div className="campo-data-calendario">
        <span className="campo-data-icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <input
          ref={pickerRef}
          type="date"
          className="campo-data-nativo"
          aria-label="Escolher no calendário"
          tabIndex={-1}
          defaultValue={isoInicial}
          onChange={(evento) => {
            const iso = evento.currentTarget.value
            if (!iso || !textoRef.current) return
            textoRef.current.value = formatarDataBr(iso)
          }}
          onClick={(evento) => {
            const campo = evento.currentTarget
            if (typeof campo.showPicker === 'function') {
              campo.showPicker()
            }
          }}
        />
      </div>
    </div>
  )
}
