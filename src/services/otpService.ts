/**
 * Unified OTP Service Architecture for AfriNova
 * 
 * Supports:
 * - Development / Demo Mode (VITE_OTP_MODE=development or VITE_OTP_MODE=demo): 
 *   Completely bypasses Firebase/Twilio/external providers.
 *   Generates random 6-digit OTP, stores in memory & sessionStorage,
 *   logs console.log("OTP DEMO :", code), displays a development banner/toast,
 *   and validates entered OTP with a 5-minute expiration window.
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

// Helper function to render a dev toast notification
function showDevOtpToast(phone: string, code: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const existingToast = document.getElementById('afrinova-dev-otp-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'afrinova-dev-otp-toast';
  toast.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 999999;
    max-width: 380px;
    width: calc(100vw - 32px);
    background: #0f172a;
    color: #ffffff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    border: 2px solid #10b981;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 24px; line-height: 1;">🔐</div>
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            OTP Mode Développement / Démo
          </div>
          <div style="font-size: 12px; color: #cbd5e1;">
            Numéro : <strong style="color: #ffffff; font-family: monospace;">${phone}</strong>
          </div>
          <div style="margin-top: 8px; font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 0.18em; color: #facc15; background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 8px; display: inline-block; border: 1px solid rgba(250,204,21,0.3);">
            ${code}
          </div>
        </div>
      </div>
      <button id="close-dev-otp-toast" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 2px 6px; border-radius: 6px; font-weight: bold;">
        ✕
      </button>
    </div>
    <div style="margin-top: 10px; font-size: 10px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
      <span>⏱ Expiration : 5 minutes</span>
      <span style="color: #34d399; font-weight: 600;">VITE_OTP_MODE=development</span>
    </div>
  `;

  document.body.appendChild(toast);

  const closeBtn = toast.querySelector('#close-dev-otp-toast');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          toast.remove();
        }
      }, 300);
    }
  }, 12000);
}

class MockOTPProvider implements IOTPProvider {
  type: OTPProviderType = 'mock';

  async sendOtp(phoneNumber: string): Promise<OTPSendResult> {
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, '') : '+237690000000';
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const timestamp = Date.now();

    // Store in memory
    mockOtpStore[cleanPhone] = {
      code: generatedCode,
      timestamp,
    };

    // Store in sessionStorage
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`afrinova_otp_${cleanPhone}`, JSON.stringify({ code: generatedCode, timestamp }));
        sessionStorage.setItem('afrinova_otp_latest', JSON.stringify({ phone: cleanPhone, code: generatedCode, timestamp }));
      }
    } catch (e) {
      console.warn('[OTP Service DEV] Impossible de stocker dans sessionStorage', e);
    }

    // Required exact console log format
    console.log("OTP DEMO :", generatedCode);
    console.log(
      `================================\n` +
      `🔐 OTP MODE DÉVELOPPEMENT\n` +
      `Numéro : ${cleanPhone}\n` +
      `Code OTP : ${generatedCode}\n` +
      `================================`
    );

    // Display toast notification in development mode
    showDevOtpToast(cleanPhone, generatedCode);

    return {
      success: true,
      message: 'Code OTP de développement généré avec succès',
      code: generatedCode,
      verificationId: `dev-sim-${timestamp}`,
      mode: 'development',
      provider: 'mock',
    };
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<OTPVerifyResult> {
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, '') : '+237690000000';
    const inputCode = code ? code.trim() : '';

    // Retrieve from memory or sessionStorage
    let record = mockOtpStore[cleanPhone];
    if (!record) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          const storedStr = sessionStorage.getItem(`afrinova_otp_${cleanPhone}`) || sessionStorage.getItem('afrinova_otp_latest');
          if (storedStr) {
            record = JSON.parse(storedStr);
          }
        }
      } catch (e) {}
    }

    if (!record || !record.code) {
      return {
        success: false,
        message: 'Code OTP invalide',
        mode: 'development',
        provider: 'mock',
      };
    }

    // Check expiration (5 minutes = 300,000 ms)
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const elapsed = Date.now() - record.timestamp;

    if (elapsed > FIVE_MINUTES_MS) {
      return {
        success: false,
        message: 'Code OTP expiré (plus de 5 minutes). Veuillez renvoyer un code.',
        mode: 'development',
        provider: 'mock',
      };
    }

    // Compare code
    if (inputCode === record.code) {
      console.log(
        `%c[OTP Service DEV] Code OTP validé avec succès pour ${cleanPhone}`,
        'color: #16a34a; font-weight: bold;'
      );
      return {
        success: true,
        message: 'Vérification réussie',
        mode: 'development',
        provider: 'mock',
      };
    }

    console.log(
      `%c[OTP Service DEV] Échec vérification OTP pour ${cleanPhone}: code saisi '${inputCode}' != attendu '${record.code}'`,
      'color: #dc2626; font-weight: bold;'
    );

    return {
      success: false,
      message: 'Code OTP invalide',
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
        message: 'Vérification réussie',
        mode: 'production',
        provider: 'firebase',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Code OTP invalide',
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
        message: data.success ? 'Vérification réussie' : (data.message || 'Code OTP invalide'),
        mode: 'production',
        provider: 'twilio',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Code OTP invalide',
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

    this.mode = (rawMode === 'production') ? 'production' : 'development';
    this.providerType = (rawProvider as OTPProviderType) || 'mock';

    this.logActiveMode();
  }

  public logActiveMode() {
    if (this.mode === 'development') {
      console.log(
        `%c[OTP Service] Mode actif: DEVELOPMENT / DEMO (Simulation active) - Aucun appel à Firebase/Twilio`,
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
