import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionsModel } from '../models/Sessions.model';
import { randomBytes } from 'crypto';
import {
  CredentialCreationOptionsJSON,
  CredentialRequestOptionsJSON,
  PublicKeyCredentialDescriptorJSON,
} from '@github/webauthn-json';

import { KeysModel } from '../models/Keys.model';
import { makeUUID } from '@utils';

import { LoginResponse } from './interface/LoginResponse.dto';
import { Config } from '../config';

@Injectable()
export class AuthService {
  async requestRegister(
    email: string,
    displayName: string,
  ): Promise<CredentialCreationOptionsJSON> {
    const challenge = randomBytes(32).toString('base64url');
    const userId = makeUUID(email);

    const existing = await KeysModel.findOneBy({
      userId,
    });

    if (existing) {
      throw new UnauthorizedException();
    }

    await KeysModel.create({
      userId,
      challenge,
      type: 'public-key',
      expireAt: this.getDelayedDate(5),
    }).save();

    const id = Buffer.from(makeUUID(email), 'utf8').toString('base64url');

    return {
      publicKey: {
        challenge: challenge,
        rp: { id: Config.RP_ID, name: Config.RP_NAME },
        user: {
          id: id,
          name: email,
          displayName: displayName,
        },
        pubKeyCredParams: [],
        authenticatorSelection: {
          userVerification: 'preferred',
        },
        timeout: this.minutesToMilliseconds(5),
        extensions: {
          credProps: true,
        },
      },
    };
  }

  async requestLogin(email?: string): Promise<CredentialRequestOptionsJSON> {
    const challenge = randomBytes(32).toString('base64url');
    let allowCredentials: PublicKeyCredentialDescriptorJSON[] = [];
    let userId = undefined;

    if (email) {
      userId = makeUUID(email);

      const keys = await KeysModel.findBy(
        {
          userId,
        },
      );

      allowCredentials = keys.map((rawValue: KeysModel) => {
        const value = rawValue;
        return {
          id: value.keyId,
          type: value.type,
        } as PublicKeyCredentialDescriptorJSON;
      });
    }

    const sm = new SessionsModel();
    sm.challenge = challenge;
    sm.expireAt = this.getDelayedDate(5);
    sm.userId = userId;
    await sm.save();

    return {
      publicKey: {
        challenge: challenge,
        rpId: Config.RP_ID,
        userVerification: 'preferred',
        allowCredentials,
        timeout: this.minutesToMilliseconds(5),
      },
    };
  }

  async register(
    challenge: string,
    type: string,
    keyId: string,
  ): Promise<boolean> {
    const existing = await KeysModel.findOneBy({
      challenge,
      type,
    }) as KeysModel;

    existing.keyId = keyId;
    existing.expireAt = undefined;
    await existing.save();

    return true;
  }

  async login(
    challenge: string,
    keyId: string,
    userId: string,
  ): Promise<LoginResponse> {
    const existing = (
      await SessionsModel.findOneBy({
        challenge,
      })
    );

    if (!existing || !(userId || existing.userId)) {
      throw new UnauthorizedException();
    }

    const existingUser = await KeysModel.findOneBy({
      keyId,
      userId: userId || existing.userId,
    });

    if (!existingUser) {
      throw new UnauthorizedException();
    }

    return {
      userId: existingUser.userId,
    };
  }

  async abortRegister(challenge: string): Promise<boolean> {
    const existing = await KeysModel.delete({
      challenge,
    });

    return existing.affected >= 1;
  }

  private getDelayedDate = (minutes: number) =>
    new Date(new Date().getTime() + minutes * 60000);

  private minutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;
}
