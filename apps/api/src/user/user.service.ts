import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(
        limit: number,
        offset: number,
    ): Promise<Omit<User, "hash">[]> {
        // If there are no users, returns an empty list
        const users = await this.userRepository.find({
            take: limit,
            skip: offset,
        });

        return users.map(({ hash, ...rest }) => rest);
    }

    async findBy(where: FindOptionsWhere<User>): Promise<User> {
        const user = await this.userRepository.findOneBy(where);

        if (!user) {
            throw new NotFoundException("Specified user does not exist");
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

    async delete(where: FindOptionsWhere<User>) {
        const result = await this.userRepository.delete(where);

        if (!result.affected) {
            throw new NotFoundException("Requested user does not exist");
        }

        return { message: "User deleted successfully" };
    }

    async update(
        where: FindOptionsWhere<User>,
        changes: QueryDeepPartialEntity<User>,
    ) {
        const user = await this.findBy(where);

        if (!user) {
            throw new NotFoundException("Requested user does not exist");
        }

        //Merge the user changes
        Object.assign(user, changes);

        const updatedUser = await this.userRepository.save(user);
        return updatedUser;
    }
}
