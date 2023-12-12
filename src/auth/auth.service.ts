import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: AuthDto) {
    //generate password hash
    const hash = await argon.hash(dto.password);

    //save new user to the database
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
  }

  signIn() {
    return { msg: 'SignIn' };
  }
}
