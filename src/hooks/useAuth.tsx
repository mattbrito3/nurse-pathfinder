import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signUpWithoutEmailConfirmation: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  testEdgeFunction: () => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error };
  };

  const signUpWithoutEmailConfirmation = async (email: string, password: string, fullName: string) => {
    try {
      console.log('🔄 Chamando Edge Function create-confirmed-user...', { email, fullName });
      
      // Verificar se a Edge Function está disponível
      console.log('🔍 Verificando disponibilidade da Edge Function...');
      
      // Chamar Edge Function para criar usuário confirmado
      const { data, error } = await supabase.functions.invoke('create-confirmed-user', {
        body: {
          email,
          password,
          fullName
        }
      });
      
      console.log('📡 Resposta da Edge Function:', { data, error });
      
      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        return { error };
      }
      
      if (data.error) {
        console.error('❌ Erro retornado pela Edge Function:', data.error);
        return { error: { message: data.error } };
      }
      
      console.log('✅ Usuário criado com sucesso via Edge Function');
      return { error: null };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return { error };
    }
  };

  const testEdgeFunction = async () => {
    try {
      console.log('🧪 Testando Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('test-edge-function');
      
      console.log('📡 Resposta do teste:', { data, error });
      
      if (error) {
        console.error('❌ Erro no teste:', error);
        return { error };
      }
      
      console.log('✅ Teste da Edge Function funcionou!');
      return { error: null };
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signUpWithoutEmailConfirmation,
    testEdgeFunction,
    signIn,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}