import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Roles } from '@/shared/Decorators/auth-role.decorator';
import { CurrentUser } from '@/shared/Decorators/current-user.decorator';
import { UserRole } from '@/shared/Domain/enums/user-role.enum';
import type { AuthenticatedUser } from '@/shared/Contracts/authenticated-user.contract';
import {
  BaseController,
  type ApiResponse,
} from '@/shared/Domain/base.controller';
import { ResumeService } from '@/modules/resumes/services/resume.service';
import { CreateResumeDto } from '@/modules/resumes/dto/create-resume.dto';
import type {
  ResumeDownloadView,
  ResumeListView,
  ResumeView,
  UploadedResumeFile,
} from '@/modules/resumes/dto/resume.dto';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

@Controller('resumes')
export class ResumeController extends BaseController {
  constructor(private readonly resumes: ResumeService) {
    super();
  }

  @Roles(UserRole.USER)
  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ResumeListView>> {
    return this.ok(await this.resumes.list(user.userId));
  }

  @Roles(UserRole.USER)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES } }),
  )
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateResumeDto,
    @UploadedFile() file?: UploadedResumeFile,
  ): Promise<ApiResponse<ResumeView>> {
    return this.ok(
      await this.resumes.create(user.userId, dto, file),
      'Résumé saved.',
    );
  }

  /** A short-lived presigned download URL (uploads) or the link's own URL. */
  @Roles(UserRole.USER)
  @Get(':id/download')
  async download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ResumeDownloadView>> {
    return this.ok({ Url: await this.resumes.downloadUrl(user.userId, id) });
  }

  @Roles(UserRole.USER)
  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    await this.resumes.remove(user.userId, id);
    return this.message('Résumé deleted.');
  }
}
