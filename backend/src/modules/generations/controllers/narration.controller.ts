import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { Roles } from '@/shared/Decorators/auth-role.decorator';
import { Quota } from '@/shared/Decorators/quota.decorator';
import { CurrentUser } from '@/shared/Decorators/current-user.decorator';
import { UserRole } from '@/shared/Domain/enums/user-role.enum';
import { QuotaKind } from '@/shared/Domain/enums/quota-kind.enum';
import type { AuthenticatedUser } from '@/shared/Contracts/authenticated-user.contract';
import {
  BaseController,
  type ApiResponse,
} from '@/shared/Domain/base.controller';
import { NarrationService } from '@/modules/generations/services/narration.service';
import { NarrationTailorService } from '@/modules/generations/services/narration-tailor.service';
import { StartNarrationDto } from '@/modules/generations/dto/start-narration.dto';
import { TailorNarrationDto } from '@/modules/generations/dto/tailor-narration.dto';
import { CommitNarrationDto } from '@/modules/generations/dto/commit-narration.dto';
import type {
  CommitView,
  NarrationStartView,
  NarrationView,
  TailorView,
} from '@/modules/generations/dto/narration.dto';

@Controller('narrations')
export class NarrationController extends BaseController {
  constructor(
    private readonly narration: NarrationService,
    private readonly tailorService: NarrationTailorService,
  ) {
    super();
  }

  @Quota(QuotaKind.PROFILE_NARRATION)
  @Roles(UserRole.USER)
  @Post()
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartNarrationDto,
  ): Promise<ApiResponse<NarrationStartView>> {
    return this.ok(
      await this.narration.start(user.userId, dto),
      'Narration started.',
    );
  }

  @Roles(UserRole.USER)
  @Post('tailor')
  async tailor(
    @Body() dto: TailorNarrationDto,
  ): Promise<ApiResponse<TailorView>> {
    return this.ok(await this.tailorService.tailor(dto.draft));
  }

  @Roles(UserRole.USER)
  @Get(':id')
  async status(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<NarrationView>> {
    return this.ok(await this.narration.status(user.userId, id));
  }

  @Roles(UserRole.USER)
  @Post(':id/commit')
  async commit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CommitNarrationDto,
  ): Promise<ApiResponse<CommitView>> {
    return this.ok(
      await this.narration.commit(user.userId, id, dto.content),
      'Committed to your profile.',
    );
  }
}
