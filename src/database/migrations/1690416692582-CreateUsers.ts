import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateUsers1690416692582 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [{
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                }, {
                    name: 'email',
                    type: 'varchar',
                    isNullable: false,
                }, {
                    name: 'name',
                    type: 'varchar',
                    isNullable: false,
                }, {
                    name: 'password',
                    type: 'varchar',
                    isNullable: false,
                }, {
                    name: 'allowZellimCommunicate',
                    type: 'boolean',
                    isNullable: false,
                }, {
                    name: 'recieveInformation',
                    type: 'boolean',
                    isNullable: false,
                }, {
                    name: 'validated',
                    type: 'boolean',
                    isNullable: false,
                    default: false,
                }]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
