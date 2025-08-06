import React from 'react';
import LegalDocument from '../../components/LegalDocument';

const Cookies: React.FC = () => {
  const content = `
            <h2>POLÍTICA DE COOKIES - DOSE CERTA</h2>
    <p><strong>Data de vigência:</strong> Janeiro 2025</p>
    <p><strong>Versão:</strong> 1.0</p>

    <h3>1. O QUE SÃO COOKIES?</h3>
    <p>Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita nosso site. Eles nos ajudam a melhorar sua experiência, analisar o uso do site e personalizar conteúdo.</p>

    <h3>2. TIPOS DE COOKIES QUE UTILIZAMOS</h3>
    
    <h4>2.1 Cookies Essenciais</h4>
    <p>Estes cookies são necessários para o funcionamento básico do site e não podem ser desativados.</p>
    <ul>
      <li>Autenticação e sessão do usuário</li>
      <li>Preferências de segurança</li>
      <li>Funcionalidades básicas da plataforma</li>
    </ul>

    <h4>2.2 Cookies de Performance</h4>
    <p>Estes cookies nos ajudam a entender como os visitantes interagem com o site.</p>
    <ul>
      <li>Análise de uso e métricas</li>
      <li>Identificação de problemas técnicos</li>
      <li>Melhorias de performance</li>
    </ul>

    <h4>2.3 Cookies Funcionais</h4>
    <p>Estes cookies permitem que o site lembre de suas escolhas e forneça funcionalidades aprimoradas.</p>
    <ul>
      <li>Preferências de idioma</li>
      <li>Configurações de tema</li>
      <li>Personalização de conteúdo</li>
    </ul>

    <h4>2.4 Cookies de Marketing</h4>
    <p>Estes cookies são usados para rastrear visitantes em sites para exibir anúncios relevantes.</p>
    <ul>
      <li>Publicidade personalizada</li>
      <li>Análise de campanhas</li>
      <li>Redes sociais</li>
    </ul>

    <h3>3. COOKIES DE TERCEIROS</h3>
    <p>Utilizamos serviços de terceiros que podem definir cookies:</p>
    <ul>
      <li><strong>Google Analytics:</strong> Análise de uso do site</li>
      <li><strong>Stripe:</strong> Processamento de pagamentos</li>
      <li><strong>Resend:</strong> Envio de emails</li>
    </ul>

    <h3>4. COMO GERENCIAR COOKIES</h3>
    <h4>4.1 Configurações do Navegador</h4>
    <p>Você pode configurar seu navegador para bloquear ou deletar cookies. Consulte a ajuda do seu navegador para instruções específicas.</p>

    <h4>4.2 Painel de Controle</h4>
    <p>Utilize nosso painel de controle de cookies para gerenciar suas preferências.</p>

    <h3>5. ATUALIZAÇÕES DESTA POLÍTICA</h3>
    <p>Podemos atualizar esta política periodicamente. Mudanças significativas serão comunicadas por email ou notificação na plataforma.</p>

    <h3>6. CONTATO</h3>
    <p>Para dúvidas sobre nossa política de cookies, entre em contato:</p>
    <ul>
      <li>Email: [EMAIL DE CONTATO]</li>
      <li>Telefone: [TELEFONE]</li>
    </ul>
  `;

  return (
    <LegalDocument
      title="Política de Cookies"
      content={content}
      lastUpdated="Janeiro 2025"
      version="1.0"
    />
  );
};

export default Cookies; 
