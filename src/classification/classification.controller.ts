import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ClassificationService } from './classification.service';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('classification')
export class ClassificationController {
  constructor(private classificationService: ClassificationService) {}

  @Get()
  getClassifications(@GetUser() user: User) {
    return this.classificationService.getClassifications(user);
  }

  @Get(':id')
  getClassificationsById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) classificationId: number,
  ) {
    return this.classificationService.getClassificationById(
      user,
      classificationId,
    );
  }

  @Post()
  classify(@GetUser() user: User, @Body() base64Data: string) {
    return this.classificationService.classify(user, base64Data);
  }
}
