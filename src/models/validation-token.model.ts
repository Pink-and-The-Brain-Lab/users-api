import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('validationTokens')
class ValidationToken {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string;

    @Column()
    email: string;

    @Column()
    validateTokenTime: Date;

    @Column()
    createdAt: Date;

    @Column()
    validated: boolean;
}

export default ValidationToken;
