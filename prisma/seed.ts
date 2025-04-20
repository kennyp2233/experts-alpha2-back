import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🌱 Iniciando seed de roles básicos...');

        // Crear roles básicos del sistema
        const rolesData = [
            {
                nombre: 'ADMIN',
                descripcion: 'Administrador del sistema con acceso completo'
            },
            {
                nombre: 'CLIENTE',
                descripcion: 'Cliente que solicita servicios de transporte'
            },
            {
                nombre: 'FINCA',
                descripcion: 'Finca productora que provee flores para transporte'
            }
        ];

        console.log('Creando roles básicos...');
        for (const roleData of rolesData) {
            const existingRole = await prisma.rol.findUnique({
                where: { nombre: roleData.nombre },
            });

            if (!existingRole) {
                await prisma.rol.create({
                    data: roleData,
                });
                console.log(`✅ Rol ${roleData.nombre} creado`);
            } else {
                console.log(`⏩ Rol ${roleData.nombre} ya existe`);
            }
        }

        // Crear usuario administrador por defecto
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const existingAdmin = await prisma.usuario.findUnique({
            where: { email: 'admin@example.com' },
        });

        if (!existingAdmin) {
            const admin = await prisma.usuario.create({
                data: {
                    usuario: 'admin',
                    email: 'admin@example.com',
                    pass: hashedPassword,
                    activo: true,
                },
            });

            // Asignar rol de administrador al usuario
            const adminRole = await prisma.rol.findUnique({
                where: { nombre: 'ADMIN' },
            });

            if (adminRole?.id) {
                await prisma.usuarioRol.create({
                    data: {
                        id_usuario: admin.id,
                        id_rol: adminRole.id,
                        estado: 'APROBADO',
                        metadata: {},
                    },
                });
            } else {
                console.error('❌ Error: Rol ADMIN no encontrado, no se pudo asignar al usuario administrador');
            }

            console.log('✅ Usuario administrador creado');
            console.log('   - Email: admin@example.com');
            console.log('   - Contraseña: admin123');
        } else {
            console.log('⏩ Usuario administrador ya existe');
        }

        // Crear tipos de documentos básicos para fincas
        const tiposDocumentoData = [
            {
                nombre: 'RUC',
                descripcion: 'Registro Único de Contribuyentes',
                es_obligatorio: true
            },
            {
                nombre: 'Certificado Fitosanitario',
                descripcion: 'Certificado emitido por la autoridad fitosanitaria',
                es_obligatorio: true
            }
        ];

        console.log('Creando tipos de documentos básicos para fincas...');
        for (const tipoDocData of tiposDocumentoData) {
            const existingTipoDoc = await prisma.tipoDocumentoFinca.findFirst({
                where: { nombre: tipoDocData.nombre },
            });

            if (!existingTipoDoc) {
                await prisma.tipoDocumentoFinca.create({
                    data: tipoDocData,
                });
                console.log(`✅ Tipo de documento ${tipoDocData.nombre} creado`);
            } else {
                console.log(`⏩ Tipo de documento ${tipoDocData.nombre} ya existe`);
            }
        }

        console.log('✅ Seed completado exitosamente');
    } catch (error) {
        console.error('❌ Error durante el seed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();