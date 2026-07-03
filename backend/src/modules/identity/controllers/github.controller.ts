import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Redirect,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { BaseController } from './base.controller';
import { AuthService, GithubUserData } from '../services/auth.service';

@Controller('auth')
export class GithubController extends BaseController {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;
  private readonly refreshCookieName: string;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    super();
    this.clientId = this.config.get<string>('auth.github.clientId')!;
    this.clientSecret = this.config.get<string>('auth.github.clientSecret')!;
    this.callbackUrl = this.config.get<string>('auth.github.callbackUrl')!;
    this.refreshCookieName = this.config.get<string>('auth.refreshCookieName')!;
  }

  /** Redirects the browser to GitHub's OAuth authorization page. */
  @Get('github')
  @Redirect()
  initiateOAuth() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'read:user user:email',
    });
    return { url: `https://github.com/login/oauth/authorize?${params}` };
  }

  /**
   * GitHub redirects here with ?code=xxx after the user authorises.
   * Exchanges the code for a GitHub access token, fetches the user profile,
   * then signs the user in or creates their account (upsert).
   */
  @Get('github/callback')
  @HttpCode(HttpStatus.OK)
  async callback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) throw new UnauthorizedException('No OAuth code received.');

    const githubUser = await this.exchangeCode(code);
    const { tokens, responseData } =
      await this.authService.githubAuth(githubUser);

    this.setRefreshCookie(res, tokens.refreshToken);
    return this.ok(responseData, 'GitHub sign-in successful.');
  }

  // ── Private ───────────────────────────────────────────────────────────────

  /** Exchanges an OAuth code for GitHub user data via the GitHub REST API. */
  private async exchangeCode(code: string): Promise<GithubUserData> {
    // Step 1: exchange code for access token
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };
    if (!tokenData.access_token) {
      throw new UnauthorizedException('GitHub OAuth token exchange failed.');
    }

    const ghToken = tokenData.access_token;

    // Step 2: fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    const user = (await userRes.json()) as {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
      avatar_url: string;
    };

    // Step 3: fetch primary verified email if not exposed on profile
    let email = user.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      email = emails.find((e) => e.primary && e.verified)?.email ?? null;
    }

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email,
      avatar_url: user.avatar_url,
      accessToken: ghToken,
    };
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(this.refreshCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1_000, // 7 days in ms
      path: '/api/v1/auth',
    });
  }
}
