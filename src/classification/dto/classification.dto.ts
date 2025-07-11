import {
  IsArray,
  IsBase64,
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TagsDto {
  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  @IsString()
  artist: string;

  @IsDefined()
  @IsString()
  album: string;

  @IsDefined()
  @IsString()
  year: string;
}

export class ClassificationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsBase64()
  base64Data: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsDefined()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TagsDto)
  tags: TagsDto;
}

export class ResponseDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsDefined()
  @IsObject()
  @IsNotEmpty()
  genreDistribution: object;

  @IsDefined()
  @IsArray()
  @IsNotEmpty()
  genreSequence: string[];

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
