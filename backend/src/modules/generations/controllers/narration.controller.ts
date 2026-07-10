import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { Roles } from '@/shared/Decorators/auth-role.decorator';
import { CurrentUser } from '@/shared/Decorators/current-user.decorator';
import { UserRole } from '@/shared/Domain/enums/user-role.enum';
import type { AuthenticatedUser } from '@/shared/Contracts/authenticated-user.contract';
import {
  BaseController,
  type ApiResponse,
} from '@/shared/Domain/base.controller';
import { NarrationService } from '@/modules/generations/services/narration.service';
import { StartNarrationDto } from '@/modules/generations/dto/start-narration.dto';
import type {
  NarrationStartView,
  NarrationView,
} from '@/modules/generations/dto/narration.dto';

/** "Narrate Yourself" — start a profile-README job and poll its status. */
@Controller('narrations')
export class NarrationController extends BaseController {
  constructor(private readonly narration: NarrationService) {
    super();
  }

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
  @Get(':id')
  async status(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<NarrationView>> {
    return this.ok(await this.narration.status(user.userId, id));
  }
}
