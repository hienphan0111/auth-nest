import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrimsaService } from 'src/primsa/primsa.service';
import { LoginDto } from './dto/auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrimsaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };

    const secret = process.env.JWT_SECRET;
    return {
      user,
      token: await this.jwt.signAsync(payload, {
        secret,
        expiresIn: '1h',
      }),
      refressToken: await this.jwt.signAsync(payload, {
        secret,
        expiresIn: '7d',
      }),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user && (await compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException();
  }

  async refresh(user: any) {
    const payload = {
      username: user.username,
      sub: user.sub,
    };

    const secret = process.env.JWT_SECRET;
    return {
      user,
      token: await this.jwt.signAsync(payload, {
        secret,
        expiresIn: '1h',
      }),
      refressToken: await this.jwt.signAsync(payload, {
        secret,
        expiresIn: '7d',
      }),
    };
  }
}
