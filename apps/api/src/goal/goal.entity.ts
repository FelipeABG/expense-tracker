import { User } from "../user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FinancialGoal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column()
    value: number;

    @Column({ type: "date" })
    limitDate: Date | string;

    @ManyToOne(() => User, {
        onDelete:
            "CASCADE" /* If a user is deleted, all its financial goals are deleted as well */,
    })
    user: User;
}
