import {
  CredentialCreationOptionsJSON,
  CredentialRequestOptionsJSON,
} from '@github/webauthn-json';
import {
  Body,
  Controller, Get,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { WebAuthNResponse, WebAuthNType } from './interface/WebAuthNResponse';
import { RequestRegister } from './interface/RequestRegister.dto';
import { LoginResponse } from './interface/LoginResponse.dto';
import { Register } from './interface/Register.dto';
import { Login } from './interface/Login.dto';
import { AuthService } from './auth.service';
import { AbortRegister } from './interface/AbortRegister.dto';
import { RequestLogin } from './interface/RequestLogin.dto';
import { Config } from '../config';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private readonly service: AuthService) {
  }

  @Get('/test')
  async testRout() {
    return 'Hello World';
  }

  @Post('/request-register')
  async requestRegister(
    @Body() body: RequestRegister,
  ): Promise<CredentialCreationOptionsJSON> {
    return this.service.requestRegister(body.email, body.displayName);
  }

  @Post('/abort-register')
  async abortRegister(@Body() body: AbortRegister): Promise<boolean> {
    return this.service.abortRegister(body.challenge);
  }

  @Post('/register')
  @HttpCode(204)
  async register(@Body() body: Register): Promise<boolean> {
    const data: WebAuthNResponse = JSON.parse(
      Buffer.from(body.data, 'base64url').toString('utf8'),
    );

    if (data.type !== WebAuthNType.Create) {
      throw new UnauthorizedException();
    }

    if (!Config.ORIGIN.includes('localhost') && Config.ORIGIN !== data.origin) {
      throw new UnauthorizedException('Origin doesn\'t match');
    }

    return this.service.register(data.challenge, body.type, body.id);
  }

  @Post('/request-login')
  async requestLogin(
    @Body() body: RequestLogin,
  ): Promise<CredentialRequestOptionsJSON> {
    return this.service.requestLogin(body.email);
  }

  @Post('/login')
  async login(@Body() body: Login): Promise<LoginResponse> {
    const data: WebAuthNResponse = JSON.parse(
      Buffer.from(body.data, 'base64url').toString('utf8'),
    );

    if (data.type !== WebAuthNType.Get) {
      throw new UnauthorizedException();
    }

    if (!Config.ORIGIN.includes('localhost') && Config.ORIGIN !== data.origin) {
      throw new UnauthorizedException('Origin doesn\'t match');
    }

    const userId = Buffer.from(body.user, 'base64url').toString('utf8');

    return this.service.login(data.challenge, body.id, userId);
  }
}
