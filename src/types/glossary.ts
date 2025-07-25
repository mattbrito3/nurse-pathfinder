// Interfaces para as tabelas do glossário médico

export interface GlossaryCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface MedicalTerm {
  id: string;
  term: string;
  definition: string;
  pronunciation?: string;
  category_id: string;
  synonyms: string[];
  related_terms: string[];
  difficulty_level: 'básico' | 'intermediário' | 'avançado';
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserFavoriteTerm {
  id: string;
  user_id: string;
  term_id: string;
  created_at: string;
}

// Tipos para inserção (campos opcionais)
export interface GlossaryCategoryInsert {
  name: string;
  description: string;
  color: string;
}

export interface MedicalTermInsert {
  term: string;
  definition: string;
  pronunciation?: string;
  category_id: string;
  synonyms: string[];
  related_terms: string[];
  difficulty_level: 'básico' | 'intermediário' | 'avançado';
}