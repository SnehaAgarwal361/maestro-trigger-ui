// API service for TriggerUI functionality based on the GitHub repo
interface TriggerApiConfig {
  triggerUrl: string;
  appId: string;
  appSecret: string;
  cbisA2aApiUrl: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface RemediationResponse {
  status: string;
  message: string;
  id?: string;
}

class TriggerApiService {
  private config: TriggerApiConfig;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // These would typically come from environment variables
    this.config = {
      triggerUrl: process.env.VITE_TRIGGER_URL || 'https://api-trigger.example.com',
      appId: process.env.VITE_TRG_APP_INTEGRATION_ID || 'maestro-ui-app',
      appSecret: process.env.VITE_TRG_APP_SECRET || 'demo-secret',
      cbisA2aApiUrl: process.env.VITE_CBIS_A2A_API_URL || 'https://cbis-auth.example.com/oauth/token'
    };
  }

  private generateUUID(): string {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Date.now() + Math.random() * 16) % 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  private computeMAC(): { signature: string; timestamp: string } {
    const timestamp = Date.now().toString();
    const version = '2';
    const baseString = `${this.config.appId}-${version}-${timestamp}`;
    
    // In a real implementation, you'd use crypto-js or similar
    // For demo purposes, we'll simulate the signature
    const signature = btoa(`${baseString}-${this.config.appSecret}`).replace(/[/+=]/g, '');
    
    return { signature, timestamp };
  }

  async generateToken(): Promise<TokenResponse> {
    try {
      const { signature, timestamp } = this.computeMAC();
      const correlationId = this.generateUUID();

      const response = await fetch(this.config.cbisA2aApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CorrelationID': correlationId,
          'X-Auth-Signature': signature,
          'X-Auth-Timestamp': timestamp,
          'X-Auth-AppID': this.config.appId,
          'X-Auth-Version': '2'
        },
        body: JSON.stringify({
          scope: [
            "/v1/schedules::post",
            "/v1/remediation::post",
            "/v2/remediation::post",
            "/v1/application/properties/**::GET",
            "/v1/application/properties/**::PATCH"
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.token = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      return tokenData;
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.token || Date.now() >= this.tokenExpiry - 60000) { // Refresh 1 minute before expiry
      await this.generateToken();
    }
  }

  async addRefresh(file: File, marketCode: string = '036'): Promise<RemediationResponse> {
    try {
      await this.ensureValidToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('processType', 'ADD_REFRESH_TRIGGER');
      formData.append('marketCode', marketCode);

      const response = await fetch(`${this.config.triggerUrl}/v2/remediation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Add refresh failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Add refresh error:', error);
      throw error;
    }
  }

  async stopRefresh(file: File, marketCode: string = '036'): Promise<RemediationResponse> {
    try {
      await this.ensureValidToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('processType', 'STOP_REFRESH');
      formData.append('marketCode', marketCode);

      const response = await fetch(`${this.config.triggerUrl}/v2/remediation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Stop refresh failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stop refresh error:', error);
      throw error;
    }
  }

  async getApplicationProperties(): Promise<any> {
    try {
      await this.ensureValidToken();

      const response = await fetch(`${this.config.triggerUrl}/v1/application/properties/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Get properties failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get properties error:', error);
      throw error;
    }
  }

  isTokenValid(): boolean {
    return this.token !== null && Date.now() < this.tokenExpiry - 60000;
  }

  getTokenStatus(): { hasToken: boolean; expiresIn: number } {
    return {
      hasToken: this.token !== null,
      expiresIn: this.token ? Math.max(0, this.tokenExpiry - Date.now()) : 0
    };
  }
}

export const triggerApiService = new TriggerApiService();
export type { TokenResponse, RemediationResponse };