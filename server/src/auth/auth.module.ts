import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeysModel } from '../models/Keys.model';
import { SessionsModel } from '../models/Sessions.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      synchronize: true,
      logging: false,
      entities: [KeysModel, SessionsModel],
    }),
    TypeOrmModule.forFeature([KeysModel, SessionsModel]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
}
