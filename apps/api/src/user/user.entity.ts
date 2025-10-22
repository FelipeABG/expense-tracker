import { Role } from "../role/role.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    email: string;

    @Column()
    hash: string;

    @Column({
        type: "simple-array",
        default: Role.user,
    })
    roles: [];
}
