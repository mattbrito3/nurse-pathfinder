import React from 'react';
import LegalDocument from '../../components/LegalDocument';

const PoliticaDePrivacidade: React.FC = () => {
  const content = `
    <h2>1. INTRODUÇÃO</h2>
    <p>A Dose Certa ("nós", "nossa", "plataforma") está comprometida em proteger sua privacidade e dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

    <h2>2. DADOS QUE COLETAMOS</h2>
    <h3>2.1 Dados Fornecidos pelo Usuário</h3>
    <ul>
      <li><strong>Informações de identificação:</strong> Nome completo, email, telefone</li>
      <li><strong>Dados de conta:</strong> Nome de usuário, senha, foto de perfil</li>
      <li><strong>Informações profissionais:</strong> Formação acadêmica, especialização, experiência</li>
      <li><strong>Dados de pagamento:</strong> Informações de cartão de crédito (processadas por terceiros seguros)</li>
      <li><strong>Conteúdo educacional:</strong> Flashcards criados, histórico de cálculos, notas de estudo</li>
    </ul>

    <h3>2.2 Dados Coletados Automaticamente</h3>
    <ul>
      <li><strong>Dados de uso:</strong> Páginas visitadas, tempo de permanência, funcionalidades utilizadas</li>
      <li><strong>Dados técnicos:</strong> Endereço IP, tipo de dispositivo, navegador, sistema operacional</li>
      <li><strong>Cookies e tecnologias similares:</strong> Para melhorar a experiência do usuário</li>
      <li><strong>Logs de sistema:</strong> Para segurança e diagnóstico técnico</li>
    </ul>

    <h3>2.3 Dados de Terceiros</h3>
    <ul>
      <li><strong>Autenticação social:</strong> Dados do Google (quando aplicável)</li>
      <li><strong>Serviços de pagamento:</strong> Informações fornecidas pelo Stripe</li>
      <li><strong>Analytics:</strong> Dados de uso agregados para melhorias</li>
    </ul>

    <h2>3. FINALIDADE DO TRATAMENTO</h2>
    <h3>3.1 Finalidades Principais</h3>
    <ul>
      <li><strong>Fornecimento do serviço:</strong> Acesso à plataforma e funcionalidades</li>
      <li><strong>Personalização:</strong> Adaptar conteúdo e recomendações</li>
      <li><strong>Comunicação:</strong> Envio de emails importantes e atualizações</li>
      <li><strong>Suporte:</strong> Atendimento ao cliente e resolução de problemas</li>
      <li><strong>Melhorias:</strong> Análise de uso para otimização da plataforma</li>
    </ul>

    <h3>3.2 Finalidades Secundárias</h3>
    <ul>
      <li><strong>Marketing:</strong> Comunicações sobre novos recursos (com consentimento)</li>
      <li><strong>Pesquisa:</strong> Dados agregados para estudos educacionais</li>
      <li><strong>Segurança:</strong> Prevenção de fraudes e uso inadequado</li>
      <li><strong>Conformidade legal:</strong> Cumprimento de obrigações legais</li>
    </ul>

    <h2>4. BASE LEGAL PARA TRATAMENTO</h2>
    <h3>4.1 Execução de Contrato</h3>
    <ul>
      <li>Fornecimento dos serviços contratados</li>
      <li>Gestão da conta do usuário</li>
      <li>Processamento de pagamentos</li>
    </ul>

    <h3>4.2 Interesse Legítimo</h3>
    <ul>
      <li>Melhorias na plataforma</li>
      <li>Prevenção de fraudes</li>
      <li>Comunicações sobre mudanças importantes</li>
    </ul>

    <h3>4.3 Consentimento</h3>
    <ul>
      <li>Marketing e comunicações promocionais</li>
      <li>Cookies não essenciais</li>
      <li>Compartilhamento com terceiros específicos</li>
    </ul>

    <h2>5. COMPARTILHAMENTO DE DADOS</h2>
    <h3>5.1 Prestadores de Serviços</h3>
    <ul>
      <li><strong>Hospedagem:</strong> Supabase (dados da aplicação)</li>
      <li><strong>Pagamentos:</strong> Stripe (dados de pagamento)</li>
      <li><strong>Email:</strong> Resend (comunicações)</li>
      <li><strong>Analytics:</strong> Google Analytics (dados agregados)</li>
    </ul>

    <h3>5.2 Compartilhamento Obrigatório</h3>
    <ul>
      <li>Autoridades competentes (quando exigido por lei)</li>
      <li>Processo judicial ou administrativo</li>
      <li>Proteção de direitos e segurança</li>
    </ul>

    <h2>6. ARMAZENAMENTO E SEGURANÇA</h2>
    <h3>6.1 Localização dos Dados</h3>
    <ul>
      <li><strong>Servidores principais:</strong> Brasil (conforme LGPD)</li>
      <li><strong>Backup:</strong> Servidores seguros com criptografia</li>
      <li><strong>CDN:</strong> Distribuição global para performance</li>
    </ul>

    <h3>6.2 Medidas de Segurança</h3>
    <ul>
      <li><strong>Criptografia:</strong> Dados em trânsito e em repouso</li>
      <li><strong>Controle de acesso:</strong> Autenticação multifator</li>
      <li><strong>Monitoramento:</strong> Sistemas de detecção de intrusão</li>
      <li><strong>Backup:</strong> Cópias de segurança regulares</li>
      <li><strong>Auditoria:</strong> Logs de acesso e modificações</li>
    </ul>

    <h3>6.3 Retenção de Dados</h3>
    <ul>
      <li><strong>Dados de conta:</strong> Enquanto a conta estiver ativa</li>
      <li><strong>Dados de uso:</strong> 2 anos após último acesso</li>
      <li><strong>Dados de pagamento:</strong> Conforme legislação fiscal</li>
      <li><strong>Logs de segurança:</strong> 5 anos</li>
      <li><strong>Dados anonimizados:</strong> Indefinidamente para pesquisa</li>
    </ul>

    <h2>7. SEUS DIREITOS (LGPD)</h2>
    <h3>7.1 Direitos Fundamentais</h3>
    <ul>
      <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
      <li><strong>Acesso:</strong> Obter cópia dos dados pessoais</li>
      <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
      <li><strong>Anonimização:</strong> Remover identificação pessoal</li>
      <li><strong>Portabilidade:</strong> Transferir dados para outro serviço</li>
      <li><strong>Eliminação:</strong> Deletar dados pessoais</li>
      <li><strong>Informação:</strong> Saber com quem compartilhamos</li>
      <li><strong>Revogação:</strong> Retirar consentimento</li>
    </ul>

    <h3>7.2 Como Exercer Seus Direitos</h3>
    <ul>
      <li><strong>Canal principal:</strong> Email para [EMAIL DPO]</li>
      <li><strong>Formulário online:</strong> Disponível na plataforma</li>
      <li><strong>Prazo de resposta:</strong> 15 dias úteis</li>
      <li><strong>Gratuito:</strong> Sem custo para o usuário</li>
    </ul>

    <h2>8. COOKIES E TECNOLOGIAS SIMILARES</h2>
    <h3>8.1 Tipos de Cookies</h3>
    <ul>
      <li><strong>Essenciais:</strong> Funcionamento básico da plataforma</li>
      <li><strong>Performance:</strong> Análise de uso e melhorias</li>
      <li><strong>Funcionais:</strong> Personalização da experiência</li>
      <li><strong>Marketing:</strong> Publicidade relevante (com consentimento)</li>
    </ul>

    <h2>9. DADOS DE MENORES DE IDADE</h2>
    <h3>9.1 Proteção Especial</h3>
    <ul>
      <li><strong>Consentimento parental:</strong> Necessário para menores de 18 anos</li>
      <li><strong>Supervisão educacional:</strong> Para estudantes institucionais</li>
      <li><strong>Limitações de coleta:</strong> Apenas dados essenciais</li>
      <li><strong>Controles parentais:</strong> Ferramentas de monitoramento</li>
    </ul>

    <h2>10. INCIDENTES DE SEGURANÇA</h2>
    <h3>10.1 Notificação Obrigatória</h3>
    <ul>
      <li><strong>Prazo:</strong> 72 horas após conhecimento</li>
      <li><strong>Autoridade:</strong> ANPD e usuários afetados</li>
      <li><strong>Conteúdo:</strong> Descrição, impacto e medidas tomadas</li>
    </ul>

    <h2>11. CONTATO E DÚVIDAS</h2>
    <h3>11.1 Encarregado de Dados (DPO)</h3>
    <ul>
      <li><strong>Email:</strong> [EMAIL DPO]</li>
      <li><strong>Telefone:</strong> [TELEFONE DPO]</li>
      <li><strong>Endereço:</strong> [ENDEREÇO DPO]</li>
    </ul>

    <h3>11.2 Autoridade Nacional</h3>
    <ul>
      <li><strong>ANPD:</strong> Autoridade Nacional de Proteção de Dados</li>
      <li><strong>Website:</strong> www.gov.br/anpd</li>
      <li><strong>Denúncias:</strong> denuncias@anpd.gov.br</li>
    </ul>

    <h2>12. ALTERAÇÕES NA POLÍTICA</h2>
    <h3>12.1 Notificação de Mudanças</h3>
    <ul>
      <li><strong>Comunicação:</strong> Email e notificação na plataforma</li>
      <li><strong>Prazo:</strong> 30 dias antes da vigência</li>
      <li><strong>Consentimento:</strong> Necessário para mudanças significativas</li>
    </ul>

    <h2>13. DISPOSIÇÕES FINAIS</h2>
    <h3>13.1 Vigência</h3>
    <p>Esta política entra em vigor na data de publicação e permanece válida até nova versão.</p>

    <h3>13.2 Interpretação</h3>
    <p>Em caso de dúvida, esta política deve ser interpretada em conformidade com a LGPD.</p>

    <h3>13.3 Jurisdição</h3>
    <p>Qualquer disputa será resolvida nos termos da legislação brasileira.</p>
  `;

  return (
    <LegalDocument
      title="Política de Privacidade"
      content={content}
      lastUpdated="Janeiro 2025"
      version="1.0"
    />
  );
};

export default PoliticaDePrivacidade; 
