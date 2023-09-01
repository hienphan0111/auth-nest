import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { PrimsaService } from 'src/primsa/primsa.service';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrimsaService) {}

  async createUser({ name, email, password }: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    delete newUser.password;
    return newUser;
  }
}
