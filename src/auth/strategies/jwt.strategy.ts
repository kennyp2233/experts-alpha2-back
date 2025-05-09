// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        asignacionRoles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Transformar la información de roles para tener un formato más usable
    const roles = user.asignacionRoles
      .filter(ur => ur.estado === 'APROBADO' || ur.estado === 'PENDIENTE')
      .map(ur => ({
        id: ur.id_rol,
        nombre: ur.rol.nombre,
        estado: ur.estado,
        metadata: ur.metadata
      }));

    return {
      id: user.id,
      email: user.email,
      username: user.usuario,
      roles,
    };
  }
}
