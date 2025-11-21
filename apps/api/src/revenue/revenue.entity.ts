import { User } from "../user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Revenue {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ type: "date" })
    date: Date | string;

    @Column()
    value: number;

    @Column({ nullable: true })
    recurrence?: number;

    @ManyToOne(() => User, {
        onDelete:
            "CASCADE" /* If a user is deleted, all its revenues are deleted as well */,
    })
    user: User;
}
