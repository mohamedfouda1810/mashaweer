import { AuthService } from './auth.service';

describe('AuthService', () => {
  const deletedUserId = 'e0aec9a7-e701-42d2-aac4-646985ffe030';
  let prisma: {
    user: {
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
  };
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new AuthService(
      prisma as any,
      {} as any,
      {} as any,
      {} as any,
      { get: jest.fn() } as any,
    );
  });

  it('releases a legacy deleted phone number during registration', async () => {
    prisma.user.findUnique.mockImplementation(({ where }) => {
      if (where.phone) {
        return {
          id: deletedUserId,
          phone: '01012345678',
          email: 'old@example.com',
          deletedAt: new Date(),
        };
      }
      return null;
    });
    prisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      phone: '01012345678',
      role: 'PASSENGER',
      passwordHash: 'hash',
      emailVerificationToken: null,
    });

    await expect(
      service.register({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        phone: '01012345678',
        password: 'password123',
        role: 'PASSENGER' as any,
      }),
    ).resolves.toMatchObject({ message: 'Registration successful!' });

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: deletedUserId, deletedAt: { not: null } },
      data: {
        email: `deleted-${deletedUserId}@deleted.invalid`,
        phone: `deleted-${deletedUserId}`,
      },
    });
  });
});
