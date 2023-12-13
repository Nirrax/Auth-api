import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(req: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: req.user.sub,
      },
    });
    delete user.passwordHash;
    return user;
  }
}
