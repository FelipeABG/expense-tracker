import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import validate from './config/config';

@Module({
  imports: [ConfigModule.forRoot({ validate })],
})
export class AppModule {}
