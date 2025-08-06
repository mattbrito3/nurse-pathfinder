import React from 'react';
import LegalDocument from '../../components/LegalDocument';

const TermosDeUso: React.FC = () => {
  const content = `
    <h2>1. ACEITAÇÃO DOS TERMOS</h2>
            <p>Ao acessar e utilizar a aplicação Dose Certa ("Plataforma", "Serviço", "Aplicação"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concordar com qualquer parte destes termos, não deve utilizar nossa plataforma.</p>

    <h2>2. DEFINIÇÃO DO SERVIÇO</h2>
    <h3>2.1 Propósito Educativo</h3>
    <p>A Dose Certa é uma plataforma educativa desenvolvida para auxiliar estudantes e profissionais de enfermagem em seu processo de aprendizado e desenvolvimento profissional. Nossa missão é fornecer ferramentas educacionais, recursos de estudo e informações que complementem a formação acadêmica e profissional.</p>

    <h3>2.2 Funcionalidades Principais</h3>
    <ul>
      <li>Calculadora de medicamentos para fins educativos</li>
      <li>Sistema de flashcards para estudo</li>
      <li>Glossário médico educacional</li>
      <li>Ferramentas de planejamento de carreira</li>
      <li>Recursos de estudo e revisão</li>
      <li>Sistema de assinatura premium</li>
    </ul>

    <h2>3. DISCLAIMER MÉDICO CRÍTICO</h2>
    <h3>⚠️ AVISO LEGAL IMPORTANTE</h3>
    <p><strong>A Dose Certa é EXCLUSIVAMENTE uma ferramenta educativa e NÃO deve ser utilizada para:</strong></p>
    <ul>
      <li>Tomar decisões médicas finais</li>
      <li>Diagnosticar pacientes</li>
      <li>Prescrever tratamentos</li>
      <li>Substituir consultas médicas profissionais</li>
      <li>Realizar procedimentos clínicos sem supervisão adequada</li>
    </ul>

    <h3>3.1 Limitações Educativas</h3>
    <ul>
      <li>Todas as informações fornecidas são para fins educativos apenas</li>
      <li>Os cálculos e dados apresentados são exemplos didáticos</li>
      <li>A precisão das informações não garante aplicabilidade clínica</li>
      <li>Sempre consulte profissionais de saúde qualificados para decisões médicas</li>
    </ul>

    <h3>3.2 Responsabilidade do Usuário</h3>
    <p>O usuário reconhece e aceita que:</p>
    <ul>
      <li>É responsável por verificar todas as informações antes de aplicá-las</li>
      <li>Deve sempre seguir protocolos institucionais e orientações de supervisores</li>
      <li>Não deve utilizar a plataforma em situações clínicas reais sem validação profissional</li>
      <li>Deve manter atualização constante através de fontes oficiais e literatura médica</li>
    </ul>

    <h2>4. REQUISITOS DE IDADE E CAPACIDADE LEGAL</h2>
    <h3>4.1 Idade Mínima</h3>
    <ul>
      <li>Usuários devem ter pelo menos 18 anos de idade</li>
      <li>Menores de 18 anos devem ter consentimento parental ou responsável legal</li>
      <li>Estudantes menores de idade devem ter supervisão de instituição educacional</li>
    </ul>

    <h3>4.2 Capacidade Legal</h3>
    <ul>
      <li>Usuário deve ter capacidade legal para celebrar contratos</li>
      <li>Não pode estar sob interdição ou limitação de capacidade</li>
      <li>Deve fornecer informações verdadeiras e precisas</li>
    </ul>

    <h2>5. RESPONSABILIDADES DO USUÁRIO</h2>
    <h3>5.1 Uso Adequado</h3>
    <p>O usuário se compromete a:</p>
    <ul>
      <li>Utilizar a plataforma apenas para fins educativos</li>
      <li>Respeitar direitos autorais e propriedade intelectual</li>
      <li>Não compartilhar credenciais de acesso</li>
      <li>Manter informações de conta seguras e atualizadas</li>
      <li>Reportar uso inadequado ou violações de segurança</li>
    </ul>

    <h3>5.2 Conduta Proibida</h3>
    <p>É expressamente proibido:</p>
    <ul>
      <li>Usar a plataforma para decisões médicas finais</li>
      <li>Compartilhar informações médicas confidenciais</li>
      <li>Utilizar dados da plataforma em situações clínicas sem validação</li>
      <li>Tentar acessar sistemas ou dados não autorizados</li>
      <li>Violar direitos de propriedade intelectual</li>
      <li>Utilizar a plataforma para atividades ilegais</li>
    </ul>

    <h2>6. LIMITAÇÕES DE RESPONSABILIDADE DA PLATAFORMA</h2>
    <h3>6.1 Natureza Educativa</h3>
    <p>A Dose Certa:</p>
    <ul>
      <li>Fornece apenas informações educativas</li>
      <li>Não oferece serviços médicos ou de saúde</li>
      <li>Não substitui formação profissional adequada</li>
      <li>Não garante resultados específicos de aprendizado</li>
    </ul>

    <h3>6.2 Limitações Gerais</h3>
    <p>A plataforma não se responsabiliza por:</p>
    <ul>
      <li>Decisões tomadas com base nas informações fornecidas</li>
      <li>Resultados de uso inadequado das ferramentas</li>
      <li>Danos diretos, indiretos ou consequenciais</li>
      <li>Interrupções temporárias do serviço</li>
      <li>Perda de dados ou informações</li>
    </ul>

    <h2>7. CONSEQUÊNCIAS DE MAU USO</h2>
    <h3>7.1 Medidas Disciplinares</h3>
    <p>Em caso de violação destes termos, a plataforma pode:</p>
    <ul>
      <li>Suspender temporariamente o acesso</li>
      <li>Cancelar permanentemente a conta</li>
      <li>Remover conteúdo inadequado</li>
      <li>Reportar violações às autoridades competentes</li>
    </ul>

    <h2>8. MODIFICAÇÕES DOS TERMOS</h2>
    <h3>8.1 Direito de Modificação</h3>
    <p>Reservamo-nos o direito de:</p>
    <ul>
      <li>Modificar estes termos a qualquer momento</li>
      <li>Adicionar ou remover funcionalidades</li>
      <li>Alterar políticas de uso e privacidade</li>
    </ul>

    <h2>9. LEI APLICÁVEL E FORO</h2>
    <h3>9.1 Jurisdição</h3>
    <ul>
      <li>Estes termos são regidos pelas leis brasileiras</li>
      <li>Qualquer disputa será resolvida no foro da comarca de [CIDADE/ESTADO]</li>
      <li>Lei aplicável: Código Civil Brasileiro e legislação consumerista</li>
    </ul>

    <h2>10. CONTATO</h2>
    <p>Para dúvidas sobre estes termos:</p>
    <ul>
      <li>Email: [EMAIL DE CONTATO]</li>
      <li>Telefone: [TELEFONE]</li>
      <li>Endereço: [ENDEREÇO COMPLETO]</li>
    </ul>
  `;

  return (
    <LegalDocument
      title="Termos de Uso"
      content={content}
      lastUpdated="Janeiro 2025"
      version="1.0"
    />
  );
};

export default TermosDeUso; 
