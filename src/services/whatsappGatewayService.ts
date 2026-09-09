/**
 * 📲 EVOLUTION API - WHATSAPP OMNICHANNEL GATEWAY SERVICE
 * Envio real de mensagens de autenticação 2FA, alertas de novos flagras,
 * entrega de fotos em 8K pós-PIX e recuperação de carrinho via Evolution API no VPS.
 */

export interface SendMessageResult {
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
  static async send2FACode(phone: string, otpCode: string, userName?: string): Promise<SendMessageResult> {
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

    return this.postTextMessage(formattedNumber, messageText);
  }

  /**
   * 📸 Sends instant Flagra alert when AI finds user's face in a new event album
   */
  static async sendFlagraAlertNotification(
    phone: string,
    eventName: string,
    photoCount: number,
    photographerName: string,
    galleryUrl: string = 'https://horizonideias9servidor-meflagrou.rkrxgo.easypanel.host/',
    userName?: string
  ): Promise<SendMessageResult> {
    const formattedNumber = this.formatToWhatsAppJid(phone);
    const firstName = userName ? userName.split(' ')[0] : 'Parceiro';

    const messageText = [
      '📸 *MEFLAGROU* • *VOCÊ FOI FLAGRADO!* ✨',
      '',
      `Fala, *${firstName}*! Nossa IA biométrica facial acaba de encontrar *(${photoCount}) fotos suas* no evento:`,
      `🎪 *${eventName}*`,
      `📷 Fotógrafo: *${photographerName}*`,
      '',
      '🔥 Suas fotos em Ultra HD 8K já estão prontas no seu perfil exclusivo.',
      '',
      `👉 *Toque para ver suas fotos:* ${galleryUrl}`,
      '',
      '⚡ _Garanta antes que o lote mude de preço!_'
    ].join('\n');

    return this.postTextMessage(formattedNumber, messageText);
  }

  /**
   * 💎 Sends purchase confirmation and 8K original high-res download link
   */
  static async sendPurchaseConfirmation(
    phone: string,
    orderId: string,
    photoCount: number,
    totalPaid: number,
    downloadUrl: string = 'https://horizonideias9servidor-meflagrou.rkrxgo.easypanel.host/#vault',
    userName?: string
  ): Promise<SendMessageResult> {
    const formattedNumber = this.formatToWhatsAppJid(phone);
    const firstName = userName ? userName.split(' ')[0] : 'Cliente VIP';

    const messageText = [
      '🎉 *MEFLAGROU* • *PAGAMENTO PIX CONFIRMADO!* 💎',
      '',
      `Obrigado pela compra, *${firstName}*!`,
      `🧾 Pedido: *#${orderId}*`,
      `📸 Total de Fotos: *${photoCount} fotos sem marca d'água*`,
      `💰 Valor Pago: *R$ ${totalPaid.toFixed(2)}*`,
      '',
      '⬇️ *Download Imediato em Resolução Máxima (8K):*',
      `${downloadUrl}`,
      '',
      '🔐 _Suas fotos também ficam salvas para sempre no seu Cofre VIP._'
    ].join('\n');

    return this.postTextMessage(formattedNumber, messageText);
  }

  /**
   * 🛒 Sends cart abandonment reminder with exclusive coupon
   */
  static async sendCartAbandonmentReminder(
    phone: string,
    itemCount: number,
    couponCode: string = 'FLAGRA10',
    checkoutUrl: string = 'https://horizonideias9servidor-meflagrou.rkrxgo.easypanel.host/#cart',
    userName?: string
  ): Promise<SendMessageResult> {
    const formattedNumber = this.formatToWhatsAppJid(phone);
    const firstName = userName ? userName.split(' ')[0] : 'Amigo(a)';

    const messageText = [
      '👀 *MEFLAGROU* • *Suas fotos estão te esperando!*',
      '',
      `Ei, *${firstName}*! Você deixou *${itemCount} fotos incríveis* no seu carrinho.`,
      '',
      `🎁 Liberamos um cupom especial de *10% OFF*: *${couponCode}*`,
      '',
      `👉 *Finalizar com desconto:* ${checkoutUrl}`,
      '',
      '⏳ _Válido somente nas próximas 2 horas._'
    ].join('\n');

    return this.postTextMessage(formattedNumber, messageText);
  }

  /**
   * Internal helper to POST text messages to Evolution API
   */
  private static async postTextMessage(number: string, text: string): Promise<SendMessageResult> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/message/sendText/${this.INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.API_KEY,
        },
        body: JSON.stringify({
          number,
          text,
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
