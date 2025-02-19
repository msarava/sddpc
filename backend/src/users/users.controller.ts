import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    try {
      const users = await this.usersService.findAll();
      return users;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error getting users');
    }
  }

  @Get('ping')
  ping() {
    try {
      return 'pong :)';
    } catch (e) {
      console.log(e);
    }
  }
}
