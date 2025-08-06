import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface LegalDocumentProps {
  title: string;
  content: string;
  lastUpdated: string;
  version: string;
}

const LegalDocument: React.FC<LegalDocumentProps> = ({
  title,
  content,
  lastUpdated,
  version
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar ao Início
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Document Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
              <div className="flex justify-center space-x-6 text-sm text-gray-600">
                <span>Versão: {version}</span>
                <span>Última atualização: {lastUpdated}</span>
              </div>
            </div>

            {/* Disclaimer médico destacado */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                                             <strong>AVISO IMPORTANTE:</strong> A Dose Certa é uma plataforma exclusivamente educativa. 
                    Não utilize as informações fornecidas para tomar decisões médicas finais. 
                    Sempre consulte profissionais de saúde qualificados.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                <p>Precisa de ajuda? Entre em contato conosco:</p>
                <p className="font-medium">suporte@dosecerta.com</p>
              </div>
              
              <div className="flex space-x-4">
                <Link
                  to="/legal/termos-de-uso"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Termos de Uso
                </Link>
                <Link
                  to="/legal/politica-de-privacidade"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Política de Privacidade
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocument; 
