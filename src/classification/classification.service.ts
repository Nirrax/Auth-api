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

  async downloadMp3(fileName: string) {
    const url = `http://localhost:8000/download/${fileName}`;
    return { url: url };
  }

  async classify(user: User, dto: ClassificationDto) {
    // send request to microservice
    const response = await this.sendPostRequest(
      dto.base64Data,
      dto.fileName,
      dto.tags,
    );

    // something went wrong on with the python service
    if (response.status != 200)
      throw new HttpException(
        'Validation failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
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
      const response = await this.httpService
        .post('http://127.0.0.1:8000', body)
        .toPromise();

      return response;
    } catch (error) {
      console.error(error.message);
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
