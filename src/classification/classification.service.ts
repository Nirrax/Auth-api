import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassificationService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  getClassifications(user: User) {
    return this.prisma.classification.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  getClassificationById(user: User, classificationId: number) {
    return this.prisma.classification.findUnique({
      where: {
        userId: user.id,
        id: classificationId,
      },
    });
  }

  async classify(user: User, base64Data: string) {
    const data = base64Data;

    let response;
    try {
      response = await this.httpService
        .post('http://127.0.0.1:8000', data)
        .toPromise();
    } catch (error) {
      console.error(error.message);
    }

    console.log(response.data);
    return response.data;
  }
}
