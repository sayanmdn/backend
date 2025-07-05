import { WorkOS } from '@workos-inc/node';

class WorkOSService {
  private workos: WorkOS | null = null;
  private clientId: string | null = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    if (process.env.WORKOS_API_KEY && process.env.WORKOS_CLIENT_ID) {
      this.workos = new WorkOS(process.env.WORKOS_API_KEY);
      this.clientId = process.env.WORKOS_CLIENT_ID;
    }
    this.initialized = true;
  }

  private checkInitialization() {
    this.initialize();
    if (!this.workos || !this.clientId) {
      throw new Error('WorkOS is not properly initialized. Please check WORKOS_API_KEY and WORKOS_CLIENT_ID environment variables.');
    }
  }

  getAuthorizationURL(options: {
    state?: string;
    redirectUri?: string;
    provider?: string;
    domain?: string;
    organization?: string;
    connection?: string;
  } = {}) {
    this.checkInitialization();
    
    // Always use the backend as the redirect URI for security
    const backendRedirectUri = `${process.env.APP_URL || 'https://fy5f66hx18.execute-api.ap-south-1.amazonaws.com/dev'}/user/sso/callback`;
    
    const authOptions: any = {
      clientId: this.clientId!,
      redirectUri: backendRedirectUri,
    };

    if (options.state) authOptions.state = options.state;
    if (options.provider) authOptions.provider = options.provider;
    if (options.domain) authOptions.domain = options.domain;
    if (options.organization) authOptions.organization = options.organization;
    if (options.connection) authOptions.connection = options.connection;

    return this.workos!.sso.getAuthorizationUrl(authOptions);
  }

  async authenticateWithCode(code: string, redirectURI?: string) {
    try {
      this.checkInitialization();
      const { profile } = await this.workos!.sso.getProfileAndToken({
        clientId: this.clientId!,
        code,
      });

      return {
        success: true,
        profile,
      };
    } catch (error) {
      console.error('WorkOS authentication error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProfile(accessToken: string) {
    try {
      this.checkInitialization();
      const profile = await this.workos!.sso.getProfile({
        accessToken,
      });

      return {
        success: true,
        profile,
      };
    } catch (error) {
      console.error('WorkOS get profile error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async listConnections(organizationId?: string) {
    try {
      this.checkInitialization();
      const connections = await this.workos!.sso.listConnections({
        organizationId,
      });

      return {
        success: true,
        connections: connections.data,
      };
    } catch (error) {
      console.error('WorkOS list connections error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new WorkOSService();