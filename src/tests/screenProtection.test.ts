import { describe, it, expect, vi } from 'vitest';

describe('🛡️ Anti-Print & Screen Protection Shield Tests', () => {
  it('should format and write protection notice to clipboard', async () => {
    let storedText = '';
    const mockClipboard = {
      writeText: vi.fn(async (text: string) => {
        storedText = text;
      }),
    };

    const copyrightNotice = '🔒 MEFLAGROU.COM • CONTEÚDO PROTEGIDO POR DIREITOS AUTORAIS\nCapturas e prints não autorizados são bloqueados. Compre sua foto digital oficial em alta definição no site.';
    await mockClipboard.writeText(copyrightNotice);

    expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
    expect(storedText).toContain('MEFLAGROU.COM');
    expect(storedText).toContain('DIREITOS AUTORAIS');
  });

  it('should identify prohibited print screen shortcuts', () => {
    const isPrintScreenKey = (key: string) => key === 'PrintScreen';
    const isWindowsSnippingTool = (meta: boolean, ctrl: boolean, shift: boolean, key: string) => 
      (meta || ctrl) && shift && (key === 'S' || key === 's');
    const isPrintPdfShortcut = (meta: boolean, ctrl: boolean, key: string) => 
      (meta || ctrl) && (key === 'P' || key === 'p');

    expect(isPrintScreenKey('PrintScreen')).toBe(true);
    expect(isPrintScreenKey('Enter')).toBe(false);

    expect(isWindowsSnippingTool(true, false, true, 'S')).toBe(true);
    expect(isWindowsSnippingTool(false, true, true, 's')).toBe(true);
    expect(isWindowsSnippingTool(false, false, false, 's')).toBe(false);

    expect(isPrintPdfShortcut(false, true, 'P')).toBe(true);
    expect(isPrintPdfShortcut(true, false, 'p')).toBe(true);
    expect(isPrintPdfShortcut(false, false, 'P')).toBe(false);
  });

  it('should enforce image context menu block rules', () => {
    const shouldBlockContextMenu = (tagName: string, className?: string) => {
      if (tagName === 'IMG') return true;
      if (className && className.includes('photo-card')) return true;
      return false;
    };

    expect(shouldBlockContextMenu('IMG')).toBe(true);
    expect(shouldBlockContextMenu('DIV', 'instagram-photo-card')).toBe(true);
    expect(shouldBlockContextMenu('BUTTON')).toBe(false);
  });
});
