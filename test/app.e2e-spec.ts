import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignInDto, SignUpDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('SignUp', () => {
      it('should throw error if email empty', () => {
        const dto = {
          password: 'pass1',
          firstName: 'firstName',
          lastName: 'lastName',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        const dto = {
          email: 'email@abc.com',
          firstName: 'firstName',
          lastName: 'lastName',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error if firstName empty', () => {
        const dto = {
          email: 'email@abc.com',
          password: 'pass1',
          lastName: 'lastName',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error if lastName empty', () => {
        const dto = {
          email: 'email@abc.com',
          password: 'pass1',
          firstName: 'firstName',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signup')
          .expectStatus(400);
      });

      it('should signup', () => {
        const dto: SignUpDto = {
          email: 'email@abc.com',
          password: 'pass1',
          firstName: 'firstName',
          lastName: 'lastName',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('SignIn', () => {
      it('should throw error if email empty', () => {
        const dto = {
          password: 'pass1',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        const dto = {
          email: 'email@abc.com',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signin')
          .expectStatus(400);
      });

      it('should signin', () => {
        const dto: SignInDto = {
          email: 'email@abc.com',
          password: 'pass1',
        };
        return pactum
          .spec()
          .post('http:/localhost:3000/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('accessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should throw error when Authorization header is not send', () => {
        return pactum
          .spec()
          .get('http:/localhost:3000/users/me')
          .expectStatus(401);
      });

      it('should throw error when token does not match', () => {
        return pactum
          .spec()
          .get('http:/localhost:3000/users/me')
          .withHeaders({
            Authorization: '',
          })
          .expectStatus(401);
      });

      it('should get current user', () => {
        return pactum
          .spec()
          .get('http:/localhost:3000/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200);
      });
    });
  });
});
