import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    //generate password hash
    const hash = await argon.hash(dto.password);

    //save new user to the database
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      //delete passwordHash from response
      delete user.passwordHash;

      return user;
    } catch (error) {
      //catch prisma error
      if (error instanceof PrismaClientKnownRequestError) {
        //duplicate record
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto) {
    //find user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //if user does not exist
    if (!user) throw new ForbiddenException('Credentials incorrect');

    //comapre password
    const passwordMatch = await argon.verify(user.passwordHash, dto.password);

    //if password is incorrect
    if (!passwordMatch) throw new ForbiddenException('Credentials incorrect');

    //delete passwordHash from response
    delete user.passwordHash;

    return user;
  }
}
