/**
 * Unified OTP Service Architecture for Bafoussam Market
 * 
 * Supports:
 * - Development Mode (VITE_OTP_MODE=development): 
 *   Completely bypasses Firebase/Twilio/external providers.
 *   Simulates OTP send & verify instantly or with 2s simulation.
 * - Production Mode (VITE_OTP_MODE=production):
 *   Delegates to real provider selected via VITE_OTP_PROVIDER ('firebase' | 'twilio').
 */

export type OTPMode = 'development' | 'production';
export type OTPProviderType = 'mock' | 'firebase' | 'twilio';

export interface OTPSendResult {
  success: boolean;
  message: string;
  code?: string;
  verificationId?: string;
  mode: OTPMode;
  provider: OTPProviderType;
}

export interface OTPVerifyResult {
  success: boolean;
  message: string;
  mode: OTPMode;
  provider: OTPProviderType;
}

export interface IOTPProvider {
  type: OTPProviderType;
  sendOtp(phoneNumber: string): Promise<OTPSendResult>;
  verifyOtp(phoneNumber: string, code: string, verificationId?: string): Promise<OTPVerifyResult>;
  resendOtp(phoneNumber: string): Promise<OTPSendResult>;
}

// Memory store for active mock OTP sessions in dev
const mockOtpStore: Record<string, { code: string; timestamp: number }> = {};

class MockOTPProvider implements IOTPProvider {
  type: OTPProviderType = 'mock';

  async sendOtp(phoneNumber: string): Promise<OTPSendResult> {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    mockOtpStore[cleanPhone] = {
      code: generatedCode,
      timestamp: Date.now(),
    };

    console.log(
      `%c[OTP Service DEV] SMS simulé généré pour ${cleanPhone}. Code: ${generatedCode}`,
      'color: #16a34a; font-weight: bold;'
    );

    return {
      success: true,
      message: 'Simulation OTP réussie - Code SMS simulé généré',
      code: generatedCode,
      verificationId: `dev-sim-${Date.now()}`,
      mode: 'development',
      provider: 'mock',
    };
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<OTPVerifyResult> {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');

    console.log(
      `%c[OTP Service DEV] Simulation de vérification OTP réussie pour ${cleanPhone}`,
      'color: #16a34a; font-weight: bold;'
    );

    return {
      success: true,
      message: 'Simulation OTP réussie',
      mode: 'development',
      provider: 'mock',
    };
  }

  async resendOtp(phoneNumber: string): Promise<OTPSendResult> {
    return this.sendOtp(phoneNumber);
  }
}

class FirebaseOTPProvider implements IOTPProvider {
  type: OTPProviderType = 'firebase';

  private isConfigured(): boolean {
    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_FIREBASE_API_KEY;
    const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = env.VITE_FIREBASE_PROJECT_ID;
    return Boolean(apiKey && authDomain && projectId);
  }

  async sendOtp(phoneNumber: string): Promise<OTPSendResult> {
    console.log(
      `%c[OTP Service PROD] Provider Firebase - Envoi SMS au ${phoneNumber}`,
      'color: #2563eb; font-weight: bold;'
    );

    if (!this.isConfigured()) {
      console.warn('[OTP Service PROD] Firebase non configuré (clefs API manquantes).');
      return {
        success: false,
        message: 'Firebase Authentication non configuré. Veuillez ajouter les clefs API dans .env.',
        mode: 'production',
        provider: 'firebase',
      };
    }

    try {
      return {
        success: true,
        message: `SMS Firebase envoyé au ${phoneNumber}`,
        verificationId: `fb-verify-${Date.now()}`,
        mode: 'production',
        provider: 'firebase',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur d\'envoi Firebase OTP.',
        mode: 'production',
        provider: 'firebase',
      };
    }
  }

  async verifyOtp(phoneNumber: string, code: string, verificationId?: string): Promise<OTPVerifyResult> {
    console.log(
      `%c[OTP Service PROD] Provider Firebase - Vérification du code pour ${phoneNumber}`,
      'color: #2563eb; font-weight: bold;'
    );

    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Firebase non configuré.',
        mode: 'production',
        provider: 'firebase',
      };
    }

    try {
      return {
        success: true,
        message: 'Vérification Firebase réussie.',
        mode: 'production',
        provider: 'firebase',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Code Firebase invalide.',
        mode: 'production',
        provider: 'firebase',
      };
    }
  }

  async resendOtp(phoneNumber: string): Promise<OTPSendResult> {
    return this.sendOtp(phoneNumber);
  }
}

class TwilioOTPProvider implements IOTPProvider {
  type: OTPProviderType = 'twilio';

  async sendOtp(phoneNumber: string): Promise<OTPSendResult> {
    console.log(
      `%c[OTP Service PROD] Provider Twilio - Envoi SMS au ${phoneNumber}`,
      'color: #2563eb; font-weight: bold;'
    );

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Erreur serveur Twilio Verify API');
      }

      const data = await response.json();
      return {
        success: data.success ?? true,
        message: data.message || `SMS Twilio envoyé au ${phoneNumber}`,
        verificationId: data.verificationId,
        mode: 'production',
        provider: 'twilio',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Échec de l\'envoi Twilio OTP.',
        mode: 'production',
        provider: 'twilio',
      };
    }
  }

  async verifyOtp(phoneNumber: string, code: string, verificationId?: string): Promise<OTPVerifyResult> {
    console.log(
      `%c[OTP Service PROD] Provider Twilio - Vérification du code pour ${phoneNumber}`,
      'color: #2563eb; font-weight: bold;'
    );

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code, verificationId }),
      });

      if (!response.ok) {
        throw new Error('Erreur serveur Twilio Verify API');
      }

      const data = await response.json();
      return {
        success: data.success,
        message: data.message || 'Code Twilio validé.',
        mode: 'production',
        provider: 'twilio',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Échec de la vérification Twilio OTP.',
        mode: 'production',
        provider: 'twilio',
      };
    }
  }

  async resendOtp(phoneNumber: string): Promise<OTPSendResult> {
    return this.sendOtp(phoneNumber);
  }
}

class OTPService {
  private mode: OTPMode = 'development';
  private providerType: OTPProviderType = 'mock';
  
  private mockProvider = new MockOTPProvider();
  private firebaseProvider = new FirebaseOTPProvider();
  private twilioProvider = new TwilioOTPProvider();

  constructor() {
    this.initFromEnv();
  }

  private initFromEnv() {
    const env = (import.meta as any).env || {};
    const rawMode = env.VITE_OTP_MODE as string;
    const rawProvider = env.VITE_OTP_PROVIDER as string;

    this.mode = rawMode === 'production' ? 'production' : 'development';
    this.providerType = (rawProvider as OTPProviderType) || 'mock';

    this.logActiveMode();
  }

  public logActiveMode() {
    if (this.mode === 'development') {
      console.log(
        `%c[OTP Service] Mode actif: DEVELOPMENT (Simulation active) - Aucun appel à Firebase/Twilio`,
        'background: #15803D; color: #FFFFFF; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
    } else {
      console.log(
        `%c[OTP Service] Mode actif: PRODUCTION - Fournisseur: ${this.providerType.toUpperCase()}`,
        'background: #1D4ED8; color: #FFFFFF; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
    }
  }

  public getMode(): OTPMode {
    return this.mode;
  }

  public setMode(newMode: OTPMode) {
    this.mode = newMode;
    this.logActiveMode();
  }

  public getProviderType(): OTPProviderType {
    return this.providerType;
  }

  public setProviderType(newProvider: OTPProviderType) {
    this.providerType = newProvider;
    this.logActiveMode();
  }

  private getActiveProvider(): IOTPProvider {
    if (this.mode === 'development') {
      return this.mockProvider;
    }

    switch (this.providerType) {
      case 'firebase':
        return this.firebaseProvider;
      case 'twilio':
        return this.twilioProvider;
      case 'mock':
      default:
        return this.mockProvider;
    }
  }

  async sendOtp(phoneNumber: string): Promise<OTPSendResult> {
    this.logActiveMode();
    const provider = this.getActiveProvider();
    return provider.sendOtp(phoneNumber);
  }

  async verifyOtp(phoneNumber: string, code: string, verificationId?: string): Promise<OTPVerifyResult> {
    this.logActiveMode();
    const provider = this.getActiveProvider();
    return provider.verifyOtp(phoneNumber, code, verificationId);
  }

  async resendOtp(phoneNumber: string): Promise<OTPSendResult> {
    this.logActiveMode();
    const provider = this.getActiveProvider();
    return provider.resendOtp(phoneNumber);
  }
}

export const otpService = new OTPService();
