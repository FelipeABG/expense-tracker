import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { userService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [userService],
  controllers: [UserController],
})
export class UserModule {}
