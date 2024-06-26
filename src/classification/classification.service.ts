import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ClassificationDto, ResponseDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClassificationService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private config: ConfigService,
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

  async deleteClassificationById(user: User, classificationId: number) {
    const classification = await this.prisma.classification.findUnique({
      where: {
        id: classificationId,
      },
    });

    // check if classification belongs to the user
    if (!classification || classification.userId !== user.id)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.classification.delete({
      where: {
        id: classificationId,
      },
    });
  }

  async downloadMp3(fileName: string) {
    const apiUrl = this.config.get('FASTAPI_URL');
    const url = `${apiUrl}/download/${fileName}`;
    return { url: url };
  }

  async classify(user: User, dto: ClassificationDto) {
    // send request to microservice
    const response = await this.sendPostRequest(
      dto.base64Data,
      dto.fileName,
      dto.tags,
    );

    // something went wrong with the python service
    if (response.status != 200)
      throw new HttpException(
        'Service is temporalily inaccessible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    const responseData = response.data;

    // save classification to the database
    const classification = await this.SaveClassificationToDb(
      user,
      dto.fileName,
      dto.tags,
      responseData,
    );

    return classification;
  }

  async sendPostRequest(base64Data: string, fileName: string, tags: object) {
    try {
      const body = { base64Data: base64Data, fileName: fileName, tags: tags };
      const url = this.config.get('FASTAPI_URL') + '/classify';
      const response = await this.httpService.post(url, body).toPromise();

      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async SaveClassificationToDb(
    user: User,
    fileName: string,
    tags: object,
    dto: ResponseDto,
  ) {
    try {
      const classification = await this.prisma.classification.create({
        data: {
          fileName: fileName,
          genre: dto.genre,
          genreDistribution: dto.genreDistribution,
          genreSequence: dto.genreSequence,
          tags: tags,
          userId: user.id,
        },
      });

      //append file url to the response
      const classificationResponse = {
        ...classification,
        url: dto.fileName,
      };

      return classificationResponse;
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
