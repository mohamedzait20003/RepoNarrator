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
  ): Promise<ApiResponse<ResumeView[]>> {
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
