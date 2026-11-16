import React from 'react'
import ComingSoon from './ComingSoon.jsx'
import { sections } from '../sections.js'

// Editor de produto — construído na etapa 5.
export default function ProductEditor() {
  return <ComingSoon section={{ ...sections.produtos, label: 'Editor de produto', stage: 5, description: 'Título, preço, promoção, descrição, categorias, cores, tamanhos, detalhes e fotos.' }} />
}
