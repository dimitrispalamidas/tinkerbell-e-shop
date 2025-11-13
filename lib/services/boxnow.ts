/**
 * BOXNOW API Service
 * This service handles all communication with the BOXNOW Partner API using OAuth2
 * Documentation: https://boxnow.gr/en/partner-api
 * API Manual: https://boxnow.gr/media/hidden/BoxNow%20API%20Manual%20(v.7.2).pdf
 */

interface BoxnowOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

interface BoxnowDeliveryRequestParams {
  lockerId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  originLocationId?: string;
  compartmentSize?: 1 | 2 | 3;
}

class BoxnowService {
  private apiUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: BoxnowOAuthToken | null = null;

  constructor() {
    this.apiUrl = process.env.BOXNOW_API_URL || '';
    this.clientId = process.env.BOXNOW_OAUTH_CLIENT_ID || '';
    this.clientSecret = process.env.BOXNOW_OAUTH_CLIENT_SECRET || '';
  }

  /**
   * Get OAuth2 access token
   * Endpoint: POST /api/v1/auth-sessions
   * Tokens are cached and refreshed when expired
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.accessToken.expires_at > Date.now()) {
      return this.accessToken.access_token;
    }

    // Get new token
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get OAuth token: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      // Cache token with expiration
      this.accessToken = {
        access_token: data.access_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 3600,
        expires_at: Date.now() + (data.expires_in || 3600) * 1000 - 60000, // Expire 1 min early
      };

      return this.accessToken.access_token;
    } catch (error) {
      console.error('❌ Error getting BOXNOW OAuth token:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.apiUrl || !this.clientId || !this.clientSecret) {
      throw new Error('BOXNOW API credentials not configured');
    }

    const token = await this.getAccessToken();

    return fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Create a delivery request to a BOXNOW locker
   * Endpoint: POST /api/v1/delivery-requests
   * 
   * This notifies BOXNOW to pick up a package from your warehouse/origin
   * and deliver it to the selected locker
   */
  async createDeliveryRequest(params: BoxnowDeliveryRequestParams): Promise<{ 
    success: boolean; 
    parcelId?: string;
    trackingNumber?: string;
    error?: string;
  }> {
    try {
      if (!this.apiUrl || !this.clientId || !this.clientSecret) {
        throw new Error('BOXNOW API credentials not configured');
      }

      const requestBody = {
        typeOfService: 'standard', // or 'same-day' if available
        orderNumber: params.orderId,
        paymentMode: 'prepaid', // or 'cod' for cash on delivery
        allowReturn: true,
        origin: {
          locationId: params.originLocationId || process.env.BOXNOW_DEFAULT_ORIGIN_ID,
        },
        destination: {
          locationId: params.lockerId,
          contactName: params.customerName,
          contactNumber: params.customerPhone,
          contactEmail: params.customerEmail,
        },
        items: [
          {
            name: `Order #${params.orderId}`,
            compartmentSize: params.compartmentSize || 2, // 1=small, 2=medium, 3=large
          }
        ]
      };

      const response = await this.makeRequest('/api/v1/delivery-requests', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ BOXNOW API error:', response.status, errorData);
        return {
          success: false,
          error: errorData.message || `API error: ${response.statusText}`,
        };
      }

      const result = await response.json();
      
      return {
        success: true,
        parcelId: result.id || result.parcelId,
        trackingNumber: result.trackingNumber || result.id,
      };

    } catch (error) {
      console.error('❌ Error creating BOXNOW delivery request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get parcel information by ID
   * Endpoint: GET /api/v1/parcels/{id}
   */
  async getParcel(parcelId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/api/v1/parcels/${parcelId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get parcel: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching BOXNOW parcel:', error);
      throw error;
    }
  }

  /**
   * List all parcels
   * Endpoint: GET /api/v1/parcels
   */
  async listParcels(filters?: {
    orderNumber?: string;
    parcelId?: string;
    limit?: number;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.orderNumber) params.append('orderNumber', filters.orderNumber);
      if (filters?.parcelId) params.append('parcelId', filters.parcelId);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const endpoint = `/api/v1/parcels${params.toString() ? '?' + params.toString() : ''}`;
      const response = await this.makeRequest(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to list parcels: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing BOXNOW parcels:', error);
      throw error;
    }
  }

  /**
   * Cancel a parcel
   * Endpoint: POST /api/v1/parcels/{id}:cancel
   */
  async cancelParcel(parcelId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(`/api/v1/parcels/${parcelId}:cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Failed to cancel parcel',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling BOXNOW parcel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const boxnowService = new BoxnowService();

// Export types
export type { BoxnowDeliveryRequestParams };
