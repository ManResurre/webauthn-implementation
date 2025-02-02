import { get, parseRequestOptionsFromJSON } from '@github/webauthn-json/browser-ponyfill';
import {
  CredentialRequestOptionsJSON,
  PublicKeyCredentialWithAssertionJSON,
} from '@github/webauthn-json/src/webauthn-json/basic/json';

export class LoginService {
  extraData = {};
  authOptions?: CredentialRequestOptionsJSON;
  authResponse?: PublicKeyCredentialWithAssertionJSON;
  userId?: string;


  private async getMessageFromResponse(res: Response) {
    const obj = await res.json();
    return Array.isArray(obj.message) ? obj.message.join('\n') : obj.message;
  }

  private async fetchRequestLogin() {
    const res = await fetch('/auth/request-login', {
      ...this.extraData,
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error(await this.getMessageFromResponse(res), { cause: res });
    }

    this.authOptions = await res.json();
  }

  private async authenticateUser() {
    if (!this.authOptions) {
      throw new Error('Credential Request Options is empty!', { cause: this.authOptions });
    }
    const res = await get(parseRequestOptionsFromJSON(this.authOptions));
    this.authResponse = res.toJSON();
  }

  private async submitLogin() {
    if (!this.authResponse) {
      throw new Error('PublicKey Credential With Assertion is empty!', { cause: this.authResponse });
    }

    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.authResponse.rawId,
        user: this.authResponse.response.userHandle,
        data: this.authResponse.response.clientDataJSON,
      }),
    });

    if (!res.ok) {
      throw new Error(await this.getMessageFromResponse(res), { cause: res });
    }

    const { userId } = await res.json();
    this.userId = userId;
  }

  private prepareRequestData(email: string) {
    this.extraData = {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    };
  }

  public processLogin = async (email: string): Promise<string> => {
    this.prepareRequestData(email);
    await this.fetchRequestLogin();
    await this.authenticateUser();
    await this.submitLogin();

    if (!this.userId) {
      throw new Error('Something went wrong!', { cause: this.userId });
    }
    return this.userId;
  };
}
