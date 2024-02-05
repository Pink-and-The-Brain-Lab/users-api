import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    allowZellimCommunicate: boolean;

    @Column()
    recieveInformation: boolean;

    @Column()
    validated: boolean;

    @Column()
    cellphoneNumber: string;

    @Column()
    activeProfileId: string;
}

export default User;
