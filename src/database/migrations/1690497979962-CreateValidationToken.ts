import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateValidationToken1690497979962 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'validationTokens',
                columns: [{
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                }, {
                    name: 'token',
                    type: 'varchar',
                    isNullable: false,
                }, {
                    name: 'email',
                    type: 'varchar',
                    isNullable: false,
                }, {
                    name: 'validateTokenTime',
                    type: 'timestamp',
                    isNullable: false,
                }, {
                    name: 'createdAt',
                    type: 'timestamp',
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
        await queryRunner.dropTable('validationTokens');
    }

}
