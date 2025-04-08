import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743705282328 implements MigrationInterface {
    name = 'Init1743705282328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rating" ("id" SERIAL NOT NULL, "telegramId" bigint NOT NULL, "isLike" boolean NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "storyId" integer, CONSTRAINT "PK_ecda8ad32645327e4765b43649e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "story" ("id" SERIAL NOT NULL, "telegramId" bigint NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "accessModifier" character varying NOT NULL DEFAULT 'private', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_28fce6873d61e2cace70a0f3361" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "rating" ADD CONSTRAINT "FK_472b0244419b6ee0cbba2fc46a4" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP CONSTRAINT "FK_472b0244419b6ee0cbba2fc46a4"`);
        await queryRunner.query(`DROP TABLE "story"`);
        await queryRunner.query(`DROP TABLE "rating"`);
    }

}
