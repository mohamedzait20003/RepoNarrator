import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Upload metadata for résumés stored in Cloudflare R2. `file_url` now holds the
 * R2 object key (uploads) or the external URL (links); these columns carry the
 * original filename, content type and size needed to serve a proper download.
 * All nullable — links leave them empty.
 */
export class AddResumeFileMeta1783651391658 implements MigrationInterface {
  name = 'AddResumeFileMeta1783651391658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD COLUMN "file_name" TEXT`,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD COLUMN "mime_type" TEXT`,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD COLUMN "size_bytes" INT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resumes" DROP COLUMN "size_bytes"`);
    await queryRunner.query(`ALTER TABLE "resumes" DROP COLUMN "mime_type"`);
    await queryRunner.query(`ALTER TABLE "resumes" DROP COLUMN "file_name"`);
  }
}
