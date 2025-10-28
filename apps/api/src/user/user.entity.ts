import { Expense } from "../expense/expense.entity";
import { Role } from "../role/role.enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    email: string;

    @Column({})
    hash: string;

    @Column({
        type: "simple-array",
        default: Role.user,
    })
    roles: Role[];

    @OneToMany(() => Expense, (expense) => expense.user)
    expenses: Expense[];
}
