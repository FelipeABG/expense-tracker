import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import validate from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DB_URL'),
        autoLoadEntities: true,
        synchronize: true, //IMPORTANT: set to false in production environments
      }),
    }),
  ],
})
export class AppModule {}
