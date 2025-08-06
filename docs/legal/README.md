# Documentação Legal - Dose Certa

## Visão Geral

Esta documentação descreve a implementação dos documentos legais na aplicação Dose Certa, incluindo Termos de Uso, Política de Privacidade, Política de Cookies e Termos de Assinatura.

## Estrutura de Arquivos

```
docs/legal/
├── README.md                           # Esta documentação
├── TERMOS_DE_USO.md                    # Termos de Uso completos
├── POLITICA_DE_PRIVACIDADE.md          # Política de Privacidade completa
└── [outros documentos...]

src/
├── components/
│   ├── FooterLegal.tsx                 # Footer com links legais
│   ├── LegalDocument.tsx               # Componente para exibir documentos
│   └── CookieConsent.tsx               # Banner de consentimento de cookies
├── pages/legal/
│   ├── TermosDeUso.tsx                 # Página dos Termos de Uso
│   ├── PoliticaDePrivacidade.tsx       # Página da Política de Privacidade
│   ├── Cookies.tsx                     # Página da Política de Cookies
│   └── Assinatura.tsx                  # Página dos Termos de Assinatura
└── App.tsx                             # Rotas dos documentos legais
```

## Funcionalidades Implementadas

### 1. Footer Legal
- **Arquivo**: `src/components/Footer.tsx`
- **Funcionalidade**: Links para todos os documentos legais
- **Seções**: Funcionalidades, Suporte, Legal
- **Disclaimer médico**: Aviso sobre natureza educativa

### 2. Componente LegalDocument
- **Arquivo**: `src/components/LegalDocument.tsx`
- **Funcionalidades**:
  - Exibição formatada dos documentos
  - Botões de impressão e download
  - Disclaimer médico destacado
  - Navegação entre documentos
  - Design responsivo

### 3. Banner de Cookies
- **Arquivo**: `src/components/CookieConsent.tsx`
- **Funcionalidades**:
  - Aparece na primeira visita
  - Opções de aceitar/rejeitar
  - Links para políticas relacionadas
  - Armazenamento da preferência no localStorage

### 4. Páginas dos Documentos
- **Termos de Uso**: `/legal/termos-de-uso`
- **Política de Privacidade**: `/legal/politica-de-privacidade`
- **Política de Cookies**: `/legal/cookies`
- **Termos de Assinatura**: `/legal/assinatura`

## Características dos Documentos

### Termos de Uso
- ✅ Disclaimer médico crítico
- ✅ Limitações de responsabilidade
- ✅ Requisitos de idade
- ✅ Condutas proibidas
- ✅ Lei aplicável (Brasil)

### Política de Privacidade
- ✅ Conformidade com LGPD
- ✅ Direitos do usuário
- ✅ Base legal para tratamento
- ✅ Medidas de segurança
- ✅ Contato do DPO

### Política de Cookies
- ✅ Tipos de cookies utilizados
- ✅ Gerenciamento de preferências
- ✅ Cookies de terceiros
- ✅ Como desativar

### Termos de Assinatura
- ✅ Planos disponíveis
- ✅ Preços e formas de pagamento
- ✅ Cancelamento e reembolso
- ✅ Obrigações das partes

## Implementação Técnica

### Rotas
```typescript
// App.tsx
<Route path="/legal/termos-de-uso" element={<TermosDeUso />} />
<Route path="/legal/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
<Route path="/legal/cookies" element={<Cookies />} />
<Route path="/legal/assinatura" element={<Assinatura />} />
```

### Componente LegalDocument
```typescript
interface LegalDocumentProps {
  title: string;
  content: string;
  lastUpdated: string;
  version: string;
}
```

### Cookie Consent
```typescript
// Armazenamento da preferência
localStorage.setItem('cookieConsent', 'accepted' | 'declined');
```

## Conformidade Legal

### LGPD (Lei Geral de Proteção de Dados)
- ✅ Base legal para tratamento
- ✅ Direitos do titular dos dados
- ✅ Medidas de segurança
- ✅ Contato do DPO
- ✅ Notificação de incidentes

### Marco Civil da Internet
- ✅ Termos de uso claros
- ✅ Política de privacidade
- ✅ Responsabilidades definidas

### Código de Defesa do Consumidor
- ✅ Informações claras sobre serviços
- ✅ Direito de arrependimento
- ✅ Política de reembolso

## Manutenção

### Atualizações de Documentos
1. Editar o arquivo markdown em `docs/legal/`
2. Atualizar o conteúdo HTML nas páginas correspondentes
3. Incrementar a versão do documento
4. Atualizar a data de "Última atualização"

### Monitoramento
- Verificar conformidade com novas regulamentações
- Revisar documentos anualmente
- Atualizar informações de contato quando necessário

## Próximos Passos

### Documentos Pendentes
- [ ] Política de Cookies completa
- [ ] Termos de Assinatura detalhados
- [ ] Política de Uso Aceitável
- [ ] Termos de Licença de Software

### Melhorias Técnicas
- [ ] Sistema de versionamento de documentos
- [ ] Histórico de mudanças
- [ ] Notificações de atualizações
- [ ] Assinatura digital de aceitação

### Conformidade
- [ ] Auditoria legal completa
- [ ] Revisão por advogado especializado
- [ ] Testes de conformidade
- [ ] Treinamento da equipe

## Contatos

### Suporte Legal
- **Email**: [EMAIL LEGAL]
- **Telefone**: [TELEFONE LEGAL]
- **Advogado**: [NOME DO ADVOGADO]

### DPO (Encarregado de Dados)
- **Email**: [EMAIL DPO]
- **Telefone**: [TELEFONE DPO]

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0  
**Responsável**: Equipe de Desenvolvimento 
