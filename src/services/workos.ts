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

  getAuthorizationURL(state?: string, redirectURI?: string) {
    this.checkInitialization();
    return this.workos!.sso.getAuthorizationUrl({
      clientId: this.clientId!,
      redirectUri: redirectURI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`,
      state: state,
    });
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