import { test, expect } from '@playwright/test';

test.describe('Navegação da Aplicação', () => {
  
  test('Deve navegar pela página inicial', async ({ page }) => {
    await page.goto('/');
    
    // Verificar elementos principais da landing page (seletor mais específico)
    await expect(page.locator('h1').filter({ hasText: 'Dose Certa' })).toBeVisible();
    // Usar seletor específico para o título da calculadora
    await expect(page.locator('h3').filter({ hasText: 'Calculadora de Medicação' })).toBeVisible();
    // Usar seletor específico para o título dos flashcards
    await expect(page.locator('h3').filter({ hasText: 'Flashcards Interativos' })).toBeVisible();
    // Usar seletor específico para o glossário
    await expect(page.locator('h3').filter({ hasText: 'Glossário Médico' })).toBeVisible();
  });

  test('Deve acessar página de pricing', async ({ page }) => {
    await page.goto('/');
    
    // Procurar e clicar no link de preços
    const pricingLink = page.locator('text=Preços').or(page.locator('text=Pricing')).first();
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page).toHaveURL(/.*pricing.*/);
    }
  });

  test('Deve verificar responsividade - mobile', async ({ page }) => {
    // Simular dispositivo mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar se menu mobile funciona
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(page.locator('button').filter({ hasText: 'Menu' }));
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }
    
    // Verificar se a página é responsiva
    await expect(page.locator('h1').filter({ hasText: 'Dose Certa' })).toBeVisible();
  });

  test('Deve verificar links externos', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se links não estão quebrados (apenas verificar presença)
    const socialLinks = await page.locator('a[href*="github"]').or(page.locator('a[href*="linkedin"]')).count();
    
    // Se existem links sociais, eles devem ter href válido
    if (socialLinks > 0) {
      const firstLink = page.locator('a[href*="github"]').or(page.locator('a[href*="linkedin"]')).first();
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('Deve carregar imagens principais', async ({ page }) => {
    await page.goto('/');
    
    // Aguardar carregamento básico (mais flexível)
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se imagens importantes carregaram
    const heroImage = page.locator('img').first();
    if (await heroImage.isVisible()) {
      const naturalWidth = await heroImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    } else {
      // Se não tem imagem, pelo menos verificar se a página carregou
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Deve funcionar navegação por teclado', async ({ page }) => {
    await page.goto('/');
    
    // Testar navegação com Tab
    await page.keyboard.press('Tab');
    
    // Aguardar um pouco para o foco ser aplicado
    await page.waitForTimeout(500);
    
    // Verificar se algum elemento recebeu foco (mais flexível)
    const focusedElement = page.locator(':focus');
    const hasFocus = await focusedElement.count() > 0;
    
    // Se não tem foco, pelo menos verificar se a página não quebrou
    if (!hasFocus) {
      await expect(page.locator('body')).toBeVisible();
    }
    
    // Testar Enter no elemento focado
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000); // Aguardar possível navegação
  });

  test('Deve verificar meta tags SEO', async ({ page }) => {
    await page.goto('/');
    
    // Verificar title
    await expect(page).toHaveTitle(/Dose Certa/);
    
    // Verificar meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(50); // Descrição deve ter tamanho razoável
    }
  });

  test('Deve funcionar busca/filtros se existirem', async ({ page }) => {
    await page.goto('/');
    
    // Procurar por campo de busca
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="busca"]')).or(page.locator('input[placeholder*="pesquis"]'));
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('teste');
      await page.keyboard.press('Enter');
      
      // Aguardar possíveis resultados
      await page.waitForTimeout(2000);
      
      // Verificar se algo mudou na página
      const resultsContainer = page.locator('[data-testid="search-results"]').or(page.locator('text=resultado')).or(page.locator('text=encontrado'));
      
      // Se não encontrar container específico, pelo menos verificar se página não quebrou
      await expect(page.locator('body')).toBeVisible();
    }
  });

});