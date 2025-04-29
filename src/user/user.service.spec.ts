import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUsers()', () => {
    it('should return array of users', async () => {
      // arrange
      const users = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'mail@mail.com',
          passwordHash: '123',
          firstName: '1name',
          lastName: 'lastname',
        } as User,
        {
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'mail@mail.com',
          passwordHash: '123',
          firstName: '2name',
          lastName: 'lastname',
        } as User,
        {
          id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'mail@mail.com',
          passwordHash: '123',
          firstName: '10name',
          lastName: 'lastname',
        } as User,
      ];

      jest.spyOn(mockPrismaService.user, 'findMany').mockReturnValue(users);

      // act
      const result = await userService.getUsers();

      // assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return array with one user', async () => {
      // arrange
      const users = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'mail@mail.com',
          passwordHash: '123',
          firstName: '1name',
          lastName: 'lastname',
        } as User,
      ];

      jest.spyOn(mockPrismaService.user, 'findMany').mockReturnValue(users);

      // act
      const result = await userService.getUsers();

      // assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array', async () => {
      // arrange
      const users = [];

      jest.spyOn(mockPrismaService.user, 'findMany').mockReturnValue(users);

      // act
      const result = await userService.getUsers();

      // assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(3);
    });
  });
});
