import React from 'react';
import { Link } from 'react-router-dom';

const FooterLegal: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Coluna 1 - Sobre */}
          <div>
                               <h3 className="text-lg font-semibold mb-4">Dose Certa</h3>
            <p className="text-gray-300 text-sm">
              Plataforma educativa para estudantes e profissionais de enfermagem.
              Ferramentas de estudo, cálculos e recursos para desenvolvimento profissional.
            </p>
          </div>

          {/* Coluna 2 - Recursos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/calculator" className="text-gray-300 hover:text-white transition-colors">
                  Calculadora de Medicamentos
                </Link>
              </li>
              <li>
                <Link to="/flashcards" className="text-gray-300 hover:text-white transition-colors">
                  Flashcards
                </Link>
              </li>
              <li>
                <Link to="/glossary" className="text-gray-300 hover:text-white transition-colors">
                  Glossário Médico
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Planos e Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:suporte@dosecerta.com" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal/termos-de-uso" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/legal/politica-de-privacidade" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="text-gray-300 hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link to="/legal/assinatura" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Assinatura
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
                                   © {currentYear} Dose Certa. Todos os direitos reservados.
            </div>
            
            {/* Disclaimer médico */}
            <div className="text-xs text-gray-500 text-center md:text-right max-w-md">
              ⚠️ Esta plataforma é exclusivamente educativa e não substitui consultas médicas profissionais.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterLegal; 
