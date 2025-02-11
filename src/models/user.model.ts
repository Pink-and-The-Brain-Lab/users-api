import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { nullable: false })
    email: string;

    @Column('text', { nullable: false })
    name: string;

    @Column('text', { nullable: false })
    password: string;

    @Column('boolean', { nullable: false })
    allowZellimCommunicate: boolean;

    @Column('boolean', { nullable: false })
    recieveInformation: boolean;

    @Column('boolean', { nullable: false })
    validated: boolean;

    @Column('text', { nullable: true })
    cellphoneNumber: string;

    @Column('text', { nullable: true })
    activeProfileId: string;
}

export default User;
