// Declarações de tipos para o ambiente Deno
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
  
  // APIs globais que existem no Deno
  const Date: DateConstructor;
  const JSON: JSON;
  const Error: ErrorConstructor;
  const console: Console;
  const fetch: typeof fetch;
  const Response: typeof Response;
  const Request: typeof Request;
  
  // String prototype methods
  interface String {
    substring(start: number, end?: number): string;
    repeat(count: number): string;
    includes(searchString: string, position?: number): boolean;
  }
  
  // Array prototype methods
  interface Array<T> {
    some(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
  }
}

export {}; 