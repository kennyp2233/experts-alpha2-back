import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterFarmDto } from './dto/register-farm.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateUser(email: string, pass: string) {
        const user = await this.prisma.usuario.findUnique({
            where: { email },
            include: {
                asignacionRoles: {
                    include: {
                        rol: true,
                    },
                },
            },
        });

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(pass, user.pass);

        if (!isPasswordValid) {
            return null;
        }

        if (!user.activo) {
            throw new ForbiddenException('Usuario inactivo');
        }

        // Transformar la información de roles para tener un formato más usable
        const roles = user.asignacionRoles
            .filter(ur => ur.estado === 'APROBADO')
            .map(ur => ({
                id: ur.id_rol,
                nombre: ur.rol.nombre,
                metadata: ur.metadata
            }));

        return {
            id: user.id,
            email: user.email,
            username: user.usuario,
            roles,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new BadRequestException('Credenciales inválidas');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };

        return {
            user,
            access_token: this.jwtService.sign(payload),
        };
    }

    async registerClient(registerDto: RegisterClientDto) {
        // Verificar si el email o usuario ya existen
        const existingUser = await this.prisma.usuario.findFirst({
            where: {
                OR: [
                    { email: registerDto.email },
                    { usuario: registerDto.username },
                ],
            },
        });

        if (existingUser) {
            throw new ConflictException('El correo electrónico o nombre de usuario ya está en uso');
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Transacción para crear usuario y cliente
        const result = await this.prisma.$transaction(async (prisma) => {
            // Crear el usuario
            const newUser = await prisma.usuario.create({
                data: {
                    usuario: registerDto.username,
                    email: registerDto.email,
                    pass: hashedPassword,
                },
            });

            // Crear cliente asociado
            const newClient = await prisma.cliente.create({
                data: {
                    nombre: registerDto.nombre,
                    telefono: registerDto.telefono,
                    ruc: registerDto.ruc,
                    direccion: registerDto.direccion,
                    ciudad: registerDto.ciudad,
                    pais: registerDto.pais,
                    email: registerDto.email,
                },
            });

            // Buscar el rol de cliente
            const clienteRol = await prisma.rol.findFirst({
                where: { nombre: 'CLIENTE' },
            });

            if (!clienteRol) {
                throw new BadRequestException('Rol de cliente no encontrado');
            }

            // Asignar el rol al usuario
            await prisma.usuarioRol.create({
                data: {
                    id_usuario: newUser.id,
                    id_rol: clienteRol.id,
                    estado: 'APROBADO', // Los clientes se aprueban automáticamente
                    metadata: {
                        id_cliente: newClient.id,
                    },
                },
            });

            // Inicializar puntos de fidelización para el cliente
            await prisma.puntosFidelizacion.create({
                data: {
                    id_cliente: newClient.id,
                },
            });

            return { user: newUser, client: newClient };
        });

        // Crear token JWT
        const payload = {
            sub: result.user.id,
            email: result.user.email,
            username: result.user.usuario,
        };

        return {
            message: 'Cliente registrado exitosamente',
            user: {
                id: result.user.id,
                email: result.user.email,
                username: result.user.usuario,
            },
            access_token: this.jwtService.sign(payload),
        };
    }

    async registerFarm(registerDto: RegisterFarmDto) {
        // Verificar si el email o usuario ya existen
        const existingUser = await this.prisma.usuario.findFirst({
            where: {
                OR: [
                    { email: registerDto.email },
                    { usuario: registerDto.username },
                ],
            },
        });

        if (existingUser) {
            throw new ConflictException('El correo electrónico o nombre de usuario ya está en uso');
        }

        // Verificar si la finca ya existe (por RUC)
        const existingFinca = await this.prisma.finca.findFirst({
            where: {
                OR: [
                    { ruc_finca: registerDto.ruc_finca },
                ],
            },
        });

        if (existingFinca) {
            throw new ConflictException('La finca ya está registrada con ese RUC');
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Transacción para crear usuario y finca con los nuevos campos
        const result = await this.prisma.$transaction(async (prisma) => {
            // Crear el usuario
            const newUser = await prisma.usuario.create({
                data: {
                    usuario: registerDto.username,
                    email: registerDto.email,
                    pass: hashedPassword,
                },
            });

            // Crear finca asociada con todos los campos disponibles
            const newFinca = await prisma.finca.create({
                data: {
                    nombre_finca: registerDto.nombre_finca,
                    tag: registerDto.tag,
                    ruc_finca: registerDto.ruc_finca,
                    tipo_documento: registerDto.tipo_documento,
                    genera_guias_certificadas: registerDto.genera_guias_certificadas,
                    i_general_telefono: registerDto.i_general_telefono,
                    i_general_email: registerDto.i_general_email,
                    i_general_ciudad: registerDto.i_general_ciudad,
                    i_general_provincia: registerDto.i_general_provincia,
                    i_general_pais: registerDto.i_general_pais,
                    i_general_cod_sesa: registerDto.i_general_cod_sesa,
                    i_general_cod_pais: registerDto.i_general_cod_pais,
                    // Nuevos campos
                    a_nombre: registerDto.a_nombre,
                    a_codigo: registerDto.a_codigo,
                    a_direccion: registerDto.a_direccion,
                },
            });

            // Buscar el rol de finca
            const fincaRol = await prisma.rol.findFirst({
                where: { nombre: 'FINCA' },
            });

            if (!fincaRol) {
                throw new BadRequestException('Rol de finca no encontrado');
            }

            // Asignar el rol al usuario (estado PENDIENTE porque requiere verificación)
            await prisma.usuarioRol.create({
                data: {
                    id_usuario: newUser.id,
                    id_rol: fincaRol.id,
                    estado: 'PENDIENTE', // Las fincas requieren aprobación
                    metadata: {
                        id_finca: newFinca.id,
                    },
                },
            });

            // Asociar productos si se proporcionaron
            if (registerDto.productos && registerDto.productos.length > 0) {
                for (const producto of registerDto.productos) {
                    await prisma.fincaProducto.create({
                        data: {
                            id_finca: newFinca.id,
                            id_producto: producto.id_producto,
                        },
                    });
                }
            }

            // Asociar choferes si se proporcionaron
            if (registerDto.choferes && registerDto.choferes.length > 0) {
                for (const chofer of registerDto.choferes) {
                    await prisma.fincaChofer.create({
                        data: {
                            id_finca: newFinca.id,
                            id_chofer: chofer.id_chofer,
                        },
                    });
                }
            }

            // Buscar tipos de documentos obligatorios para fincas
            const documentosObligatorios = await prisma.tipoDocumentoFinca.findMany({
                where: { es_obligatorio: true },
            });

            // Crear registros de documentos pendientes para la finca
            for (const tipoDoc of documentosObligatorios) {
                await prisma.documentoFinca.create({
                    data: {
                        id_finca: newFinca.id,
                        id_tipo_documento: tipoDoc.id,
                        estado: 'PENDIENTE',
                    },
                });
            }

            return { user: newUser, finca: newFinca };
        });

        // Crear token JWT
        const payload = {
            sub: result.user.id,
            email: result.user.email,
            username: result.user.usuario,
        };

        return {
            message: 'Finca registrada exitosamente. Por favor complete los documentos requeridos para la verificación',
            user: {
                id: result.user.id,
                email: result.user.email,
                username: result.user.usuario,
            },
            finca: {
                id: result.finca.id,
                nombre: result.finca.nombre_finca,
                tag: result.finca.tag,
            },
            access_token: this.jwtService.sign(payload),
        };
    }


    async getProfile(userId: string) {
        const user = await this.prisma.usuario.findUnique({
            where: { id: userId },
            include: {
                asignacionRoles: {
                    include: {
                        rol: true,
                    },
                },
            },
        });

        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        // Transformar la información de roles
        const roles = user.asignacionRoles.map(ur => ({
            id: ur.id_rol,
            nombre: ur.rol.nombre,
            estado: ur.estado,
            metadata: ur.metadata,
        }));

        // Obtener información adicional según roles
        const userInfo = {
            id: user.id,
            usuario: user.usuario,
            email: user.email,
            activo: user.activo,
            createdAt: user.createdAt,
            roles,
        };

        // Si es una finca, obtener info de la finca
        const fincaRole = roles.find(r => r.nombre === 'FINCA' && r.estado === 'APROBADO');
        if (fincaRole && fincaRole.metadata && fincaRole.metadata['id_finca']) {
            const finca = await this.prisma.finca.findUnique({
                where: { id: fincaRole.metadata['id_finca'] },
                include: {
                    documentos: true,
                },
            });

            if (finca) {
                userInfo['finca'] = finca;
            }
        }

        // Si es un cliente, obtener info del cliente
        const clienteRole = roles.find(r => r.nombre === 'CLIENTE' && r.estado === 'APROBADO');
        if (clienteRole && clienteRole.metadata && clienteRole.metadata['id_cliente']) {
            const cliente = await this.prisma.cliente.findUnique({
                where: { id: clienteRole.metadata['id_cliente'] },
                include: {
                    puntosFidelizacion: true,
                },
            });

            if (cliente) {
                userInfo['cliente'] = cliente;
            }
        }

        return userInfo;
    }
}