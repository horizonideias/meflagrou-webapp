/**
 * 📲 EVOLUTION API - WHATSAPP GATEWAY SERVICE
 * Envio real de mensagens de autenticação e códigos 2FA via Evolution API no VPS.
 */

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isSimulated?: boolean;
}

export class WhatsAppGatewayService {
  private static API_BASE_URL = 'http://72.61.129.14:8085';
  private static API_KEY = 'meflagrou_evolution_master_2026';
  private static INSTANCE_NAME = 'meflagrou';

  /**
   * Cleans phone number to international E.164 Brazilian format (e.g. 5534999998888)
   */
  static formatToWhatsAppJid(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('55')) {
      return digits;
    }
    return `55${digits}`;
  }

  /**
   * Sends 2FA OTP Code via WhatsApp using Evolution API
   */
  static async send2FACode(phone: string, otpCode: string, userName?: string): Promise<SendOtpResult> {
    const formattedNumber = this.formatToWhatsAppJid(phone);
    const firstName = userName ? userName.split(' ')[0] : 'Usuário';

    const messageText = [
      '🔐 *meflagrou.com* • Código de Segurança',
      '',
      `Olá, *${firstName}*!`,
      'Seu código de verificação para acesso seguro é:',
      '',
      `👉 *${otpCode}* 👈`,
      '',
      '⏱️ _Este código expira em 5 minutos._',
      '⚠️ _Não compartilhe este código com ninguém._'
    ].join('\n');

    try {
      const response = await fetch(`${this.API_BASE_URL}/message/sendText/${this.INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.API_KEY,
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: messageText,
          options: {
            delay: 1000,
            presence: 'composing',
            linkPreview: false,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('Evolution API response warning:', errData);
        return {
          success: false,
          error: 'Instância do WhatsApp aguardando conexão.',
          isSimulated: true,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data?.key?.id || 'msg_sent',
        isSimulated: false,
      };
    } catch (err) {
      console.warn('Fallback simulado de WhatsApp (servidor conectando):', err);
      return {
        success: false,
        error: 'Instância do WhatsApp em processo de conexão.',
        isSimulated: true,
      };
    }
  }

  /**
   * Checks if the WhatsApp instance is connected and ready
   */
  static async checkConnectionStatus(): Promise<'connected' | 'connecting' | 'disconnected'> {
    try {
      const res = await fetch(`${this.API_BASE_URL}/instance/connectionState/${this.INSTANCE_NAME}`, {
        headers: {
          'apikey': this.API_KEY,
        },
      });
      if (!res.ok) return 'disconnected';
      const data = await res.json();
      const state = data?.instance?.state?.toLowerCase();
      if (state === 'open' || state === 'connected') return 'connected';
      if (state === 'connecting') return 'connecting';
      return 'disconnected';
    } catch {
      return 'disconnected';
    }
  }
}

export const whatsappGatewayService = WhatsAppGatewayService;
