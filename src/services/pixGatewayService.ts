/**
 * 💳 GATEWAY PIX DINÂMICO OFICIAL & SPLIT DE PAGAMENTOS
 * Geração de payload padrão Banco Central do Brasil (EMV QRCPS-MPM / CRC16),
 * divisão de split em tempo real (90% Fotógrafo / 9% Plataforma / 1% Fundo Social)
 * e emissão de eventos de confirmação instantânea.
 */

export interface PixSplitBreakdown {
  totalAmount: number;
  photographerAmount: number; // 90%
  platformFee: number;        // 9%
  socialImpactFund: number;   // 1%
}

export interface PixTransaction {
  txid: string;
  payload: string;
  qrCodeUrl: string;
  amount: number;
  split: PixSplitBreakdown;
  merchantName: string;
  merchantCity: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'expired';
}

export type PixStatusCallback = (status: 'pending' | 'approved' | 'expired', tx: PixTransaction) => void;

export class PixGatewayService {
  private static listeners: Set<PixStatusCallback> = new Set();

  /**
   * Calculates 90% / 9% / 1% official split breakdown
   */
  static calculateSplit(totalAmount: number): PixSplitBreakdown {
    const photographerAmount = Number((totalAmount * 0.90).toFixed(2));
    const platformFee = Number((totalAmount * 0.09).toFixed(2));
    const socialImpactFund = Number((totalAmount - photographerAmount - platformFee).toFixed(2));

    return {
      totalAmount,
      photographerAmount,
      platformFee,
      socialImpactFund,
    };
  }

  /**
   * Calculates CRC16-CCITT for standard BACEN EMV Pix Payloads
   */
  static computeCRC16(str: string): string {
    let crc = 0xffff;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    const hex = (crc & 0xffff).toString(16).toUpperCase();
    return hex.padStart(4, '0');
  }

  /**
   * Builds an EMV formatted field: ID(2 chars) + Length(2 chars) + Value
   */
  private static formatEMVField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  /**
   * Generates a real standard BACEN BR Code Pix Copia-e-Cola payload
   */
  static generateBRCode(
    pixKey: string,
    amount: number,
    txid: string,
    merchantName: string = 'MEFLAGROU TECNOLOGIA',
    merchantCity: string = 'SAO PAULO'
  ): string {
    const f00 = this.formatEMVField('00', '01');
    const gui = this.formatEMVField('00', 'br.gov.bcb.pix');
    const key = this.formatEMVField('01', pixKey);
    const f26 = this.formatEMVField('26', `${gui}${key}`);
    const f52 = this.formatEMVField('52', '0000');
    const f53 = this.formatEMVField('53', '986');
    const f54 = this.formatEMVField('54', amount.toFixed(2));
    const f58 = this.formatEMVField('58', 'BR');
    const cleanName = merchantName.slice(0, 25).toUpperCase();
    const f59 = this.formatEMVField('59', cleanName);
    const cleanCity = merchantCity.slice(0, 15).toUpperCase();
    const f60 = this.formatEMVField('60', cleanCity);
    const f62txid = this.formatEMVField('05', txid);
    const f62 = this.formatEMVField('62', f62txid);
    const rawPayloadWithoutCRC = `${f00}${f26}${f52}${f53}${f54}${f58}${f59}${f60}${f62}6304`;
    const crc = this.computeCRC16(rawPayloadWithoutCRC);

    return `${rawPayloadWithoutCRC}${crc}`;
  }

  /**
   * Creates a full dynamic Pix Transaction
   */
  static createDynamicPixTransaction(
    amount: number,
    photographerPixKey: string = 'financeiro@meflagrou.com',
    customTxid?: string
  ): PixTransaction {
    const txid = customTxid || `MF${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    const split = this.calculateSplit(amount);
    const payload = this.generateBRCode(photographerPixKey, amount, txid);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;

    const tx: PixTransaction = {
      txid,
      payload,
      qrCodeUrl,
      amount,
      split,
      merchantName: 'MEFLAGROU TECNOLOGIA',
      merchantCity: 'SAO PAULO',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'pending',
    };

    return tx;
  }

  /**
   * Subscribe to real-time status updates
   */
  static subscribeStatus(callback: PixStatusCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Emit status update to all active listeners
   */
  static notifyListeners(status: 'pending' | 'approved' | 'expired', tx: PixTransaction) {
    this.listeners.forEach((cb) => {
      try {
        cb(status, tx);
      } catch (err) {
        console.error('Error in Pix listener:', err);
      }
    });
  }
}

export const pixGatewayService = PixGatewayService;
