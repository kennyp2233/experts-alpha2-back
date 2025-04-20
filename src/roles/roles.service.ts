import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createRoleDto: CreateRoleDto) {
        // Verificar si ya existe un rol con el mismo nombre
        const existingRole = await this.prisma.rol.findUnique({
            where: { nombre: createRoleDto.nombre },
        });

        if (existingRole) {
            throw new ConflictException(`Ya existe un rol con el nombre ${createRoleDto.nombre}`);
        }

        return this.prisma.rol.create({
            data: createRoleDto,
        });
    }

    async findAll() {
        return this.prisma.rol.findMany({
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number) {
        const role = await this.prisma.rol.findUnique({
            where: { id },
        });

        if (!role) {
            throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        }

        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        // Verificar si el rol existe
        await this.findOne(id);

        // Verificar si ya existe otro rol con el mismo nombre
        if (updateRoleDto.nombre) {
            const existingRole = await this.prisma.rol.findFirst({
                where: {
                    nombre: updateRoleDto.nombre,
                    id: { not: id },
                },
            });

            if (existingRole) {
                throw new ConflictException(`Ya existe un rol con el nombre ${updateRoleDto.nombre}`);
            }
        }

        return this.prisma.rol.update({
            where: { id },
            data: updateRoleDto,
        });
    }

    async remove(id: number) {
        // Verificar si el rol existe
        await this.findOne(id);

        // Verificar si el rol está siendo utilizado
        const usersWithRole = await this.prisma.usuarioRol.findFirst({
            where: { id_rol: id },
        });

        if (usersWithRole) {
            throw new ConflictException(`No se puede eliminar el rol porque está siendo utilizado por usuarios`);
        }

        return this.prisma.rol.delete({
            where: { id },
        });
    }

    async assignRoleToUser(userId: string, roleId: number, metadata: any = {}) {
        // Verificar si el usuario existe
        const user = await this.prisma.usuario.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        // Verificar si el rol existe
        const role = await this.prisma.rol.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
        }

        // Verificar si ya tiene asignado ese rol
        const existingRole = await this.prisma.usuarioRol.findUnique({
            where: {
                id_usuario_id_rol: {
                    id_usuario: userId,
                    id_rol: roleId,
                },
            },
        });

        if (existingRole) {
            throw new ConflictException(`El usuario ya tiene asignado el rol ${role.nombre}`);
        }

        // Asignar el rol al usuario
        return this.prisma.usuarioRol.create({
            data: {
                id_usuario: userId,
                id_rol: roleId,
                estado: 'PENDIENTE',
                metadata: metadata || {},
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
    }

    async getUserRoles(userId: string) {
        // Verificar si el usuario existe
        const user = await this.prisma.usuario.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        // Obtener roles del usuario
        return this.prisma.usuarioRol.findMany({
            where: { id_usuario: userId },
            include: {
                rol: true,
            },
        });
    }

    async getRoleUsers(roleId: number) {
        // Verificar si el rol existe
        const role = await this.prisma.rol.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
        }

        // Obtener usuarios con este rol
        return this.prisma.usuarioRol.findMany({
            where: { id_rol: roleId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                        activo: true,
                    },
                },
            },
        });
    }
}