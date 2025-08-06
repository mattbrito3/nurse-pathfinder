import React from 'react';
import LegalDocument from '../../components/LegalDocument';

const Assinatura: React.FC = () => {
  const content = `
            <h2>TERMOS DE ASSINATURA - DOSE CERTA</h2>
    <p><strong>Data de vigência:</strong> Janeiro 2025</p>
    <p><strong>Versão:</strong> 1.0</p>

    <h3>1. DEFINIÇÃO DOS SERVIÇOS</h3>
            <p>A Dose Certa oferece planos de assinatura premium que fornecem acesso a funcionalidades avançadas e recursos exclusivos para estudantes e profissionais de enfermagem.</p>

    <h3>2. PLANOS DISPONÍVEIS</h3>
    
    <h4>2.1 Plano Básico (Gratuito)</h4>
    <ul>
      <li>Acesso limitado à calculadora de medicamentos</li>
      <li>Visualização de flashcards básicos</li>
      <li>Acesso ao glossário médico</li>
      <li>Suporte por email</li>
    </ul>

    <h4>2.2 Plano Estudante</h4>
    <ul>
      <li>Acesso ilimitado a todas as funcionalidades</li>
      <li>Flashcards personalizados</li>
      <li>Histórico completo de cálculos</li>
      <li>Recursos de estudo avançados</li>
      <li>Suporte prioritário</li>
      <li>Conteúdo exclusivo</li>
      <li>Preço especial para estudantes</li>
    </ul>

    <h3>3. PREÇOS E PAGAMENTOS</h3>
    <h4>3.1 Valores</h4>
    <ul>
      <li>Plano Gratuito: Gratuito</li>
      <li>Plano Estudante: R$ 18,99/mês</li>
    </ul>

    <h4>3.2 Formas de Pagamento</h4>
    <ul>
      <li>Cartão de crédito</li>
      <li>Cartão de débito</li>
      <li>PIX</li>
      <li>Boleto bancário</li>
    </ul>

    <h4>3.3 Renovação Automática</h4>
    <p>A assinatura é renovada automaticamente no final de cada período, a menos que seja cancelada pelo usuário.</p>

    <h3>4. CANCELAMENTO E REEMBOLSO</h3>
    <h4>4.1 Cancelamento</h4>
    <ul>
      <li>Pode ser cancelado a qualquer momento</li>
      <li>O acesso permanece ativo até o final do período pago</li>
      <li>Cancelamento através da área de conta ou suporte</li>
    </ul>

    <h4>4.2 Política de Reembolso</h4>
    <ul>
      <li>Reembolso integral em até 7 dias após a compra</li>
      <li>Reembolso proporcional para cancelamentos após 7 dias</li>
      <li>Processamento em até 5 dias úteis</li>
    </ul>

    <h3>5. OBRIGAÇÕES DO USUÁRIO</h3>
    <ul>
      <li>Manter informações de pagamento atualizadas</li>
      <li>Notificar mudanças de dados pessoais</li>
      <li>Respeitar os termos de uso da plataforma</li>
      <li>Não compartilhar credenciais de acesso</li>
    </ul>

    <h3>6. OBRIGAÇÕES DA PLATAFORMA</h3>
    <ul>
      <li>Fornecer acesso aos serviços contratados</li>
      <li>Manter a disponibilidade da plataforma</li>
      <li>Processar pagamentos de forma segura</li>
      <li>Fornecer suporte técnico adequado</li>
    </ul>

    <h3>7. LIMITAÇÕES DE RESPONSABILIDADE</h3>
    <p>A plataforma não se responsabiliza por:</p>
    <ul>
      <li>Interrupções temporárias do serviço</li>
      <li>Perda de dados do usuário</li>
      <li>Problemas de conectividade do usuário</li>
      <li>Uso inadequado das funcionalidades</li>
    </ul>

    <h3>8. MODIFICAÇÕES DOS TERMOS</h3>
    <p>Estes termos podem ser modificados a qualquer momento. Mudanças significativas serão comunicadas com antecedência mínima de 30 dias.</p>

    <h3>9. CONTATO</h3>
    <p>Para dúvidas sobre assinaturas:</p>
    <ul>
      <li>Email: assinaturas@dosecerta.com</li>
      <li>Telefone: [TELEFONE]</li>
      <li>Chat online: Disponível na plataforma</li>
    </ul>

    <h3>10. DISPOSIÇÕES FINAIS</h3>
    <p>Estes termos de assinatura são parte integrante dos Termos de Uso da plataforma e devem ser interpretados em conjunto.</p>
  `;

  return (
    <LegalDocument
      title="Termos de Assinatura"
      content={content}
      lastUpdated="Janeiro 2025"
      version="1.0"
    />
  );
};

export default Assinatura; 
