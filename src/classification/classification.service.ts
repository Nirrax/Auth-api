import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
    // send request to microservice
    const response = await this.sendRequest(base64Data);

    // save classification to the database
    const classification = await this.SaveClassificationToDb(user, response);

    return classification;
  }

  async sendRequest(base64Data: string) {
    try {
      const response = await this.httpService
        .post('http://127.0.0.1:8000', base64Data)
        .toPromise();

      return response;
    } catch (error) {
      console.error(error.message);
    }
  }

  async SaveClassificationToDb(user: any, response: any) {
    try {
      const classification = await this.prisma.classification.create({
        data: {
          //fileName: response.filename,
          fileName: 'output',
          genre: response.data.genre,
          genreDistribution: response.data.genreDistribution,
          genreSequence: response.data.genreSequence,
          userId: user.id,
        },
      });

      return classification;
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
}
