import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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

      return this.signToken(user.id, user.email);
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

    return this.signToken(user.id, user.email);
  }

  signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
  }
}
