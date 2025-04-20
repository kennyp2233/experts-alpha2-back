import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.usuario.findMany({
            select: {
                id: true,
                usuario: true,
                email: true,
                activo: true,
                createdAt: true,
                updatedAt: true,
                asignacionRoles: {
                    include: {
                        rol: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.usuario.findUnique({
            where: { id },
            include: {
                asignacionRoles: {
                    include: {
                        rol: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string) {
        // Verificar que el usuario existe
        const user = await this.findOne(id);

        // Si no es el propio usuario o un administrador, no permitir la actualización
        if (id !== currentUserId) {
            // Verificar si el usuario actual es administrador
            const isAdmin = await this.prisma.usuarioRol.findFirst({
                where: {
                    id_usuario: currentUserId,
                    rol: {
                        nombre: 'ADMIN',
                    },
                    estado: 'APROBADO',
                },
            });

            if (!isAdmin) {
                throw new ForbiddenException('No tienes permiso para actualizar este usuario');
            }
        }

        // Preparar datos para actualizar
        const updateData: any = {};

        if (updateUserDto.usuario) {
            // Verificar si el nombre de usuario ya está en uso
            const existingUsername = await this.prisma.usuario.findFirst({
                where: {
                    usuario: updateUserDto.usuario,
                    id: { not: id },
                },
            });

            if (existingUsername) {
                throw new BadRequestException('El nombre de usuario ya está en uso');
            }

            updateData.usuario = updateUserDto.usuario;
        }

        if (updateUserDto.email) {
            // Verificar si el email ya está en uso
            const existingEmail = await this.prisma.usuario.findFirst({
                where: {
                    email: updateUserDto.email,
                    id: { not: id },
                },
            });

            if (existingEmail) {
                throw new BadRequestException('El correo electrónico ya está en uso');
            }

            updateData.email = updateUserDto.email;
        }

        if (updateUserDto.password) {
            // Hashear la nueva contraseña
            updateData.pass = await bcrypt.hash(updateUserDto.password, 10);
        }

        if (updateUserDto.activo !== undefined) {
            // Solo los administradores pueden cambiar el estado activo
            const isAdmin = await this.prisma.usuarioRol.findFirst({
                where: {
                    id_usuario: currentUserId,
                    rol: {
                        nombre: 'ADMIN',
                    },
                    estado: 'APROBADO',
                },
            });

            if (!isAdmin) {
                throw new ForbiddenException('Solo los administradores pueden cambiar el estado activo');
            }

            updateData.activo = updateUserDto.activo;
        }

        // Actualizar el usuario
        return this.prisma.usuario.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                usuario: true,
                email: true,
                activo: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async approveUserRole(userId: string, roleId: number, adminId: string) {
        // Verificar que el usuario que aprueba es administrador
        const isAdmin = await this.prisma.usuarioRol.findFirst({
            where: {
                id_usuario: adminId,
                rol: {
                    nombre: 'ADMIN',
                },
                estado: 'APROBADO',
            },
        });

        if (!isAdmin) {
            throw new ForbiddenException('Solo los administradores pueden aprobar roles');
        }

        // Verificar que el usuario y el rol existen
        const userRole = await this.prisma.usuarioRol.findFirst({
            where: {
                id_usuario: userId,
                id_rol: roleId,
            },
            include: {
                usuario: true,
                rol: true,
            },
        });

        if (!userRole) {
            throw new NotFoundException(`Asignación de rol no encontrada para el usuario ${userId} y rol ${roleId}`);
        }

        // Si ya está aprobado, no hacer nada
        if (userRole.estado === 'APROBADO') {
            return {
                message: 'El rol ya está aprobado',
                userRole,
            };
        }

        // Actualizar el estado del rol
        const updatedUserRole = await this.prisma.usuarioRol.update({
            where: {
                id: userRole.id,
            },
            data: {
                estado: 'APROBADO',
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                    },
                },
                rol: true,
            },
        });

        return {
            message: `Rol ${updatedUserRole.rol.nombre} aprobado para el usuario ${updatedUserRole.usuario.usuario}`,
            userRole: updatedUserRole,
        };
    }

    async rejectUserRole(userId: string, roleId: number, adminId: string) {
        // Verificar que el usuario que rechaza es administrador
        const isAdmin = await this.prisma.usuarioRol.findFirst({
            where: {
                id_usuario: adminId,
                rol: {
                    nombre: 'ADMIN',
                },
                estado: 'APROBADO',
            },
        });

        if (!isAdmin) {
            throw new ForbiddenException('Solo los administradores pueden rechazar roles');
        }

        // Verificar que el usuario y el rol existen
        const userRole = await this.prisma.usuarioRol.findFirst({
            where: {
                id_usuario: userId,
                id_rol: roleId,
            },
            include: {
                usuario: true,
                rol: true,
            },
        });

        if (!userRole) {
            throw new NotFoundException(`Asignación de rol no encontrada para el usuario ${userId} y rol ${roleId}`);
        }

        // Si ya está rechazado, no hacer nada
        if (userRole.estado === 'RECHAZADO') {
            return {
                message: 'El rol ya está rechazado',
                userRole,
            };
        }

        // Actualizar el estado del rol
        const updatedUserRole = await this.prisma.usuarioRol.update({
            where: {
                id: userRole.id,
            },
            data: {
                estado: 'RECHAZADO',
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                    },
                },
                rol: true,
            },
        });

        return {
            message: `Rol ${updatedUserRole.rol.nombre} rechazado para el usuario ${updatedUserRole.usuario.usuario}`,
            userRole: updatedUserRole,
        };
    }

    async getPendingApprovals() {
        const pendingRoles = await this.prisma.usuarioRol.findMany({
            where: {
                estado: 'PENDIENTE',
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                        createdAt: true,
                    },
                },
                rol: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return pendingRoles;
    }
}