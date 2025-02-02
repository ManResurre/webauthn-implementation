import { create, parseCreationOptionsFromJSON } from '@github/webauthn-json/browser-ponyfill';
import {
  CredentialCreationOptionsJSON,
} from '@github/webauthn-json/src/webauthn-json/basic/json';

export class RegistrationService {
  private authOptions?: CredentialCreationOptionsJSON;

  private async getMessageFromResponse(res: Response) {
    const obj = await res.json();
    return Array.isArray(obj.message) ? obj.message.join('\n') : obj.message;
  }

  private async requestRegistration(registerEmail: string, registerDisplayName: string) {
    const res = await fetch('/auth/request-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registerEmail,
        displayName: registerDisplayName,
      }),
    });

    if (!res.ok) {
      throw new Error(await this.getMessageFromResponse(res), { cause: res });
    }

    this.authOptions = await res.json();
  }

  private async register() {
    if (!this.authOptions) {
      throw new Error('Credential Request Options is empty!', { cause: this.authOptions });
    }

    const result = await create(parseCreationOptionsFromJSON(this.authOptions));
    const response = result.toJSON();

    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: response.rawId,
        data: response.response.clientDataJSON,
        type: response.type,
      }),
    });

    if (!res.ok) {
      throw new Error(await this.getMessageFromResponse(res), { cause: res });
    }
  }

  private async abortRegister() {
    if (!this.authOptions) {
      throw new Error('Credential Request Options is empty!', { cause: this.authOptions });
    }

    const res = await fetch('/auth/abort-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge: this.authOptions.publicKey.challenge,
      }),
    });

    if (!res.ok) {
      throw new Error(await this.getMessageFromResponse(res), { cause: res });
    }
  }

  processRegistration = async (email: string, displayName: string): Promise<boolean> => {
    await this.requestRegistration(email, displayName);
    try {
      await this.register();
    } catch (error) {
      await this.abortRegister();
      const msg = (error as Error).message;
      throw new Error(msg, { cause: error });
    }

    return true;
  };
}
