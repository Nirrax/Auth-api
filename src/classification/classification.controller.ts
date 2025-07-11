import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Redirect,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ClassificationService } from './classification.service';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { ClassificationDto } from './dto';

@UseGuards(JwtGuard)
@Controller('classification')
export class ClassificationController {
  constructor(private classificationService: ClassificationService) {}

  @Get()
  getClassifications(@GetUser() user: User) {
    return this.classificationService.getClassifications(user);
  }

  @Get('/download/:filename')
  @Redirect('', 301)
  downloadMp3(@Param('filename') fileName: string) {
    return this.classificationService.downloadMp3(fileName);
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
  classify(@GetUser() user: User, @Body() dto: ClassificationDto) {
    return this.classificationService.classify(user, dto);
  }
}
