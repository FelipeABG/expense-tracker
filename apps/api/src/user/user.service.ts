import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findBy(unique: FindOptionsWhere<User>): Promise<User | null> {
        return await this.userRepository.findOneBy(unique);
    }

    async create(user: DeepPartial<User>) {
        const existingUser = await this.userRepository.findOne({
            where: { email: user.email },
        });

        if (existingUser) {
            throw new ConflictException("User with this email already exists");
        }

        return await this.userRepository.save(user);
    }
}
