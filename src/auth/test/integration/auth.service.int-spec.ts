import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import * as argon from 'argon2';

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

  describe('signin', () => {
    let userEmail: string;
    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'email2@wp.pl',
          passwordHash: await argon.hash('pass1'),
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

    it('should match the passwords', async () => {
      const password = 'pass1';
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });
      const passwordMatch = await argon.verify(user.passwordHash, password);
      expect(passwordMatch).toBe(true);
    });

    it('should throw error if password does not match', async () => {
      const password = 'pass2';
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });
      const passwordMatch = await argon.verify(user.passwordHash, password);
      expect(passwordMatch).toBe(false);
    });
  });
});
