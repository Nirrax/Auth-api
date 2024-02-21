import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me')
  updateMe(@GetUser() user: User, @Body() dto: EditUserDto) {
    return this.userService.updateUserById(user.id, dto);
  }

  @Delete('me')
  deleteMe(@GetUser() user: User) {
    return this.userService.deleteUserById(user.id);
  }
}
