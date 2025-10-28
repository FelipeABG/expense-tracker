import { User } from "../user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ type: "date" })
    date: Date;

    @Column({ nullable: true })
    recurrance: number;

    @ManyToOne(() => User, (user) => user.expenses)
    user: User;
}
