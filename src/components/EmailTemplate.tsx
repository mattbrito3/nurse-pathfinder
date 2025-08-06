import * as React from 'react';

interface VerificationEmailTemplateProps {
  firstName: string;
  verificationCode: string;
}

export function VerificationEmailTemplate({ 
  firstName, 
  verificationCode 
}: VerificationEmailTemplateProps) {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: '#f6f9fc',
      padding: '40px 20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#2563eb', 
            margin: '0', 
            fontSize: '28px' 
          }}>
                         🩺 Dose Certa
          </h1>
          <p style={{ 
            color: '#64748b', 
            margin: '10px 0 0 0', 
            fontSize: '16px' 
          }}>
            Plataforma de Estudos para Enfermagem
          </p>
        </div>

        {/* Main Content */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#1e293b', 
            margin: '0 0 20px 0', 
            fontSize: '24px' 
          }}>
            Código de Verificação
          </h2>
          
          <p style={{ 
            color: '#475569', 
            fontSize: '16px', 
            lineHeight: '1.5', 
            margin: '0 0 30px 0' 
          }}>
            Olá <strong>{firstName}</strong>! 👋<br />
            Use o código abaixo para verificar sua conta:
          </p>
          
          {/* Verification Code */}
          <div style={{
            backgroundColor: '#f1f5f9',
            border: '2px dashed #2563eb',
            borderRadius: '8px',
            padding: '30px',
            margin: '30px 0'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#2563eb',
              letterSpacing: '8px',
              fontFamily: 'monospace'
            }}>
              {verificationCode}
            </div>
          </div>
          
          <p style={{ 
            color: '#ef4444', 
            fontSize: '14px', 
            margin: '20px 0 0 0' 
          }}>
            ⏰ Este código expira em <strong>10 minutos</strong>
          </p>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '20px',
          margin: '30px 0'
        }}>
          <h3 style={{ 
            color: '#1e293b', 
            margin: '0 0 15px 0', 
            fontSize: '18px' 
          }}>
            📋 Como usar:
          </h3>
          <ol style={{ 
            color: '#475569', 
            fontSize: '14px', 
            lineHeight: '1.6', 
            margin: '0', 
            paddingLeft: '20px' 
          }}>
            <li>Volte para a página de verificação</li>
            <li>Digite o código de 6 dígitos acima</li>
            <li>Clique em "Verificar"</li>
            <li>Sua conta será ativada!</li>
          </ol>
        </div>

        {/* Security Notice */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '30px',
          marginTop: '40px'
        }}>
          <p style={{ 
            color: '#64748b', 
            fontSize: '12px', 
            lineHeight: '1.5', 
            margin: '0' 
          }}>
            🔒 <strong>Segurança:</strong> Se você não solicitou este código, ignore este email. 
            Nunca compartilhe seus códigos de verificação com terceiros.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '12px', 
            margin: '0' 
          }}>
                         © 2024 Dose Certa - Transformando o estudo de enfermagem
          </p>
        </div>
      </div>
    </div>
  );
}
