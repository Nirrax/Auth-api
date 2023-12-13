import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('AuthService Int', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
    await prisma.cleanDb();
  });

  describe('signup', () => {
    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'email@wp.pl',
          passwordHash: 'pass1',
          firstName: 'firstName',
          lastName: 'lastName',
        },
      });
      expect(user.email).toBe('email@wp.pl');
      expect(user.passwordHash).toBe('pass1');
      expect(user.firstName).toBe('firstName');
      expect(user.lastName).toBe('lastName');
    });
  });

  describe('signin', () => {
    let userEmail: string;
    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'email2@wp.pl',
          passwordHash: 'pass1',
          firstName: 'firstName',
          lastName: 'lastName',
        },
      });
      userEmail = user.email;
    });
    it('should return token', async () => {
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });
      const token = await authService.signToken(user.id, user.email);
      expect(typeof token.access_token).toBe('string');
    });
  });
});
