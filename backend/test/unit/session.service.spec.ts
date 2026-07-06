import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { SessionService } from '../../src/modules/identity/services/session.service';
import { TokenService } from '../../src/modules/identity/services/token.service';
import { Session } from '../../src/modules/identity/entities/session.entity';
import { User } from '../../src/modules/identity/entities/user.entity';
import { UserRole } from '../../src/shared/Domain/enums/user-role.enum';

const PAIR = { accessToken: 'access', refreshToken: 'refresh', sit: 111 };

function makeUser(): User {
  return {
    id: 'user-1',
    role: UserRole.USER,
    email: 'user@example.com',
    name: 'Test User',
    avatarUrl: 'https://img/av.png',
  } as User;
}

describe('SessionService', () => {
  let sessions: jest.Mocked<
    Pick<
      Repository<Session>,
      'create' | 'save' | 'findOne' | 'update' | 'createQueryBuilder'
    >
  >;
  let tokenService: jest.Mocked<
    Pick<TokenService, 'generatePair' | 'verifyRefreshPair' | 'decodeRefresh'>
  >;
  let service: SessionService;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue({});
    const qb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute,
    };

    sessions = {
      create: jest.fn((v) => v as Session),
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    tokenService = {
      generatePair: jest.fn(),
      verifyRefreshPair: jest.fn(),
      decodeRefresh: jest.fn(),
    };

    service = new SessionService(
      sessions as unknown as Repository<Session>,
      tokenService as unknown as TokenService,
    );
  });

  describe('createSession', () => {
    it('issues a pair, persists the session, and returns the response payload', async () => {
      tokenService.generatePair.mockReturnValue(PAIR);

      const result = await service.createSession(makeUser());

      expect(result.tokens).toBe(PAIR);
      expect(result.responseData).toEqual({
        AccessToken: 'access',
        Role: UserRole.USER,
        Profile: {
          Email: 'user@example.com',
          Name: 'Test User',
          AvatarUrl: 'https://img/av.png',
        },
      });
      expect(sessions.save).toHaveBeenCalledTimes(1);
      expect(sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', sit: 111 }),
      );
    });
  });

  describe('refresh', () => {
    it('rotates the pair for a live session reusing the same sit', async () => {
      tokenService.verifyRefreshPair.mockReturnValue({
        userId: 'user-1',
        role: 'user',
        sit: 111,
      });
      sessions.findOne.mockResolvedValue({
        id: 'sess-1',
        revokedAt: null,
      } as Session);
      const newPair = { ...PAIR, accessToken: 'access-2' };
      tokenService.generatePair.mockReturnValue(newPair);

      const result = await service.refresh('old-access', 'refresh');

      expect(result).toBe(newPair);
      expect(tokenService.generatePair).toHaveBeenCalledWith(
        'user-1',
        'user',
        111,
      );
      expect(sessions.update).toHaveBeenCalledWith(
        'sess-1',
        expect.objectContaining({ lastActiveAt: expect.any(Date) as unknown }),
      );
    });

    it('rejects when the session was revoked', async () => {
      tokenService.verifyRefreshPair.mockReturnValue({
        userId: 'user-1',
        role: 'user',
        sit: 111,
      });
      sessions.findOne.mockResolvedValue({
        id: 'sess-1',
        revokedAt: new Date(),
      } as Session);

      await expect(service.refresh('old-access', 'refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects when no session row exists', async () => {
      tokenService.verifyRefreshPair.mockReturnValue({
        userId: 'user-1',
        role: 'user',
        sit: 111,
      });
      sessions.findOne.mockResolvedValue(null);

      await expect(service.refresh('old-access', 'refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('does nothing when no refresh token is supplied', async () => {
      await service.logout(undefined);
      expect(tokenService.decodeRefresh).not.toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
    });

    it('revokes the session identified by the token', async () => {
      tokenService.decodeRefresh.mockReturnValue({
        userId: 'user-1',
        sit: 111,
      });

      await service.logout('refresh');

      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('silently ignores a tampered token', async () => {
      tokenService.decodeRefresh.mockImplementation(() => {
        throw new Error('bad token');
      });

      await expect(service.logout('tampered')).resolves.toBeUndefined();
      expect(execute).not.toHaveBeenCalled();
    });
  });
});
