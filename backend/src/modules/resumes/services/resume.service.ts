import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';

import { Resume } from '@/modules/resumes/entities/resume.entity';
import { Subscription } from '@/modules/subscription/entities/subscription.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';
import { ResumeSource } from '@/shared/Domain/enums/resume-source.enum';
import { PlanTier } from '@/shared/Domain/enums/plan-tier.enum';
import type { CreateResumeDto } from '@/modules/resumes/dto/create-resume.dto';
import type {
  ResumeView,
  UploadedResumeFile,
} from '@/modules/resumes/dto/resume.dto';

/** Uploads live under <cwd>/uploads/resumes; fileUrl stores the "resumes/<key>" key. */
const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const RESUME_DIR = join(UPLOADS_ROOT, 'resumes');
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/**
 * Saved résumés — an uploaded file or an external link. The number a user may
 * keep is capped by their plan (Plan.resumeLimit): Free 1, Starter 5, Pro
 * unlimited. To swap on a capped plan, delete an existing résumé first.
 */
@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume) private readonly resumes: Repository<Resume>,
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
  ) {}

  async list(userId: string): Promise<ResumeView[]> {
    const rows = await this.resumes.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.toView(r));
  }

  async create(
    userId: string,
    dto: CreateResumeDto,
    file?: UploadedResumeFile,
  ): Promise<ResumeView> {
    const hasFile = Boolean(file);
    const hasUrl = Boolean(dto.url);
    if (hasFile === hasUrl) {
      throw new BadRequestException(
        'Provide either a file upload or a link URL — exactly one.',
      );
    }

    await this.assertUnderLimit(userId);

    let source: ResumeSource;
    let fileUrl: string;
    if (file) {
      this.validateFile(file);
      fileUrl = await this.store(file);
      source = ResumeSource.UPLOAD;
    } else {
      fileUrl = dto.url!;
      source = ResumeSource.LINK;
    }

    const saved = await this.resumes.save(
      this.resumes.create({ userId, source, fileUrl }),
    );
    return this.toView(saved);
  }

  async remove(userId: string, id: string): Promise<void> {
    const resume = await this.resumes.findOne({ where: { id, userId } });
    if (!resume) throw new NotFoundException('Résumé not found.');

    await this.resumes.remove(resume);
    if (resume.source === ResumeSource.UPLOAD) {
      // Best-effort file cleanup; the row is already gone either way.
      await unlink(join(UPLOADS_ROOT, resume.fileUrl)).catch(() => undefined);
    }
  }

  /** Free 1 / Starter 5 / Pro unlimited (-1) — enforced before create. */
  private async assertUnderLimit(userId: string): Promise<void> {
    const limit = await this.resumeLimit(userId);
    if (limit === -1) return;

    const count = await this.resumes.count({ where: { userId } });
    if (count >= limit) {
      throw new ConflictException(
        `Your plan allows ${limit} saved résumé${
          limit === 1 ? '' : 's'
        }. Delete one to add another.`,
      );
    }
  }

  private async resumeLimit(userId: string): Promise<number> {
    const subscription = await this.subscriptions.findOne({
      where: { userId },
    });
    const plan =
      (subscription?.plan as Plan | undefined) ??
      (await this.plans.findOne({ where: { tier: PlanTier.FREE } }));
    return plan?.resumeLimit ?? 1;
  }

  private validateFile(file: UploadedResumeFile): void {
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('Résumé must be 5 MB or smaller.');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Résumé must be a PDF or Word document.');
    }
  }

  /** Writes the upload under uploads/resumes and returns its storage key. */
  private async store(file: UploadedResumeFile): Promise<string> {
    await mkdir(RESUME_DIR, { recursive: true });
    const key = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(RESUME_DIR, key), file.buffer);
    return `resumes/${key}`;
  }

  private toView(r: Resume): ResumeView {
    return {
      Id: r.id,
      Source: r.source,
      Url: r.source === ResumeSource.LINK ? r.fileUrl : null,
      CreatedAt: r.createdAt.toISOString(),
    };
  }
}
