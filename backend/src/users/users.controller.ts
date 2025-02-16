import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    try {
      const users = this.usersService.findAll();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error getting users');
    }
  }
}
