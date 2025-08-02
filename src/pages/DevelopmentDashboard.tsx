import React from 'react';
import { DevelopmentDashboard } from '../components/DevelopmentDashboard';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const DevelopmentDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DevelopmentDashboard />
      </main>
      <Footer />
    </div>
  );
}; 