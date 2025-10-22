import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
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
        // If there are no users, returns an empty list
        return await this.userRepository.find();
    }

    async findBy(unique: FindOptionsWhere<User>): Promise<User> {
        const user = await this.userRepository.findOneBy(unique);

        if (!user) {
            throw new NotFoundException("Requested user does not exist");
        }

        return user;
    }

    async create(user: DeepPartial<User>) {
        const existingUser = await this.userRepository.findOne({
            where: { email: user.email },
        });

        if (existingUser) {
            throw new ConflictException("Email address is already registered");
        }

        return await this.userRepository.save(user);
    }

    async delete(unique: FindOptionsWhere<User>) {
        const result = await this.userRepository.delete(unique);

        if (!result.affected) {
            throw new NotFoundException("Requested user does not exist");
        }

        return { message: "User deleted successfully" };
    }
}
