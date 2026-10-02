import { BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const userId = '9eb51ed8-09f2-4782-8dbe-5634472b05d7';
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let service: AdminService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new AdminService(prisma as any, {} as any);
  });

  it('releases login identifiers when soft-deleting a user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: userId,
      role: 'PASSENGER',
      email: 'user@example.com',
      phone: '01012345678',
      deletedAt: null,
    });
    prisma.user.update.mockResolvedValue({});

    await expect(service.deleteUser(userId)).resolves.toEqual({
      deleted: true,
      softDeleted: true,
      userId,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId, deletedAt: null },
      data: expect.objectContaining({
        email: `deleted-${userId}@deleted.invalid`,
        phone: `deleted-${userId}`,
        deletedAt: expect.any(Date),
      }),
    });
  });

  it('does not delete an admin account', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: userId,
      role: 'ADMIN',
      deletedAt: null,
    });

    await expect(service.deleteUser(userId)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
