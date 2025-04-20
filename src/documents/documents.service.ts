import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentoFincaDto } from './dto/create-document.dto';
import { ReviewDocumentoFincaDto, DocumentoEstado } from './dto/review-document.dto';
import { UploadDocumentoFileDto } from './dto/upload-document-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
    private uploadsDir: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        // Define la ubicación donde se guardarán los archivos subidos
        this.uploadsDir = this.configService.get<string>('UPLOADS_DIR', path.join(process.cwd(), 'uploads'));

        // Crear el directorio si no existe
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    async createDocument(dto: CreateDocumentoFincaDto) {
        // Verificar si la finca existe
        const finca = await this.prisma.finca.findUnique({
            where: { id: dto.id_finca },
        });

        if (!finca) {
            throw new NotFoundException(`Finca con ID ${dto.id_finca} no encontrada`);
        }

        // Verificar si el tipo de documento existe
        const tipoDocumento = await this.prisma.tipoDocumentoFinca.findUnique({
            where: { id: dto.id_tipo_documento },
        });

        if (!tipoDocumento) {
            throw new NotFoundException(`Tipo de documento con ID ${dto.id_tipo_documento} no encontrado`);
        }

        // Crear el documento
        const documento = await this.prisma.documentoFinca.create({
            data: {
                id_finca: dto.id_finca,
                id_tipo_documento: dto.id_tipo_documento,
                comentario: dto.comentario,
            },
        });

        return {
            message: 'Documento creado exitosamente',
            documento,
        };
    }

    async uploadDocumentFile(dto: UploadDocumentoFileDto, file: Express.Multer.File, userId: string) {
        // Verificar si el documento existe
        const documento = await this.prisma.documentoFinca.findUnique({
            where: { id: dto.id_documento },
            include: {
                finca: true,
            },
        });

        if (!documento) {
            throw new NotFoundException(`Documento con ID ${dto.id_documento} no encontrado`);
        }

        // Verificar que el usuario tiene permiso para subir al documento (es de su finca)
        const userRol = await this.prisma.usuarioRol.findFirst({
            where: {
                id_usuario: userId,
                rol: {
                    nombre: 'FINCA',
                },
                metadata: {
                    path: ['id_finca'],
                    equals: documento.id_finca,
                },
            },
        });

        if (!userRol) {
            throw new ForbiddenException('No tienes permiso para subir documentos a esta finca');
        }

        // Verificar que el documento está en estado PENDIENTE
        if (documento.estado !== 'PENDIENTE') {
            throw new BadRequestException('Solo se pueden actualizar documentos en estado PENDIENTE');
        }

        // Crear nombre de archivo único
        const fileExt = path.extname(file.originalname);
        const fileName = `${randomUUID()}${fileExt}`;
        const fincaDir = path.join(this.uploadsDir, `finca_${documento.id_finca}`);

        // Crear directorio para la finca si no existe
        if (!fs.existsSync(fincaDir)) {
            fs.mkdirSync(fincaDir, { recursive: true });
        }

        // Ruta completa donde se guardará el archivo
        const filePath = path.join(fincaDir, fileName);
        const relativePath = path.relative(process.cwd(), filePath);

        // Escribir el archivo
        fs.writeFileSync(filePath, file.buffer);

        // Actualizar el documento con la información del archivo
        const updatedDoc = await this.prisma.documentoFinca.update({
            where: { id: dto.id_documento },
            data: {
                ruta_archivo: relativePath,
                nombre_archivo: file.originalname,
                tamano_archivo: file.size,
                tipo_mime: file.mimetype,
                fecha_subida: new Date(),
            },
        });

        return {
            message: 'Archivo subido exitosamente',
            documento: updatedDoc,
        };
    }

    async reviewDocument(dto: ReviewDocumentoFincaDto, userId: string) {
        // Verificar si el documento existe
        const documento = await this.prisma.documentoFinca.findUnique({
            where: { id: dto.id },
            include: {
                finca: true,
                tipoDocumento: true,
            },
        });

        if (!documento) {
            throw new NotFoundException(`Documento con ID ${dto.id} no encontrado`);
        }

        // Verificar que el usuario tiene permiso para revisar documentos (es admin)
        const userRol = await this.prisma.usuarioRol.findFirst({
            where: {
                id_usuario: userId,
                rol: {
                    nombre: 'ADMIN',
                },
                estado: 'APROBADO',
            },
        });

        if (!userRol) {
            throw new ForbiddenException('No tienes permiso para revisar documentos');
        }

        // Verificar que el documento tiene un archivo subido
        if (!documento.ruta_archivo) {
            throw new BadRequestException('No se puede revisar un documento sin archivo');
        }

        // Actualizar el documento con la revisión
        const updatedDoc = await this.prisma.documentoFinca.update({
            where: { id: dto.id },
            data: {
                estado: dto.estado,
                comentario: dto.comentario,
                fecha_revision: new Date(),
                id_revisor: userId,
            },
        });

        // Si todos los documentos obligatorios están aprobados, aprobar el rol de finca
        if (dto.estado === DocumentoEstado.APROBADO) {
            const fincaId = documento.id_finca;

            // Obtener todos los documentos obligatorios de la finca
            const documentosObligatorios = await this.prisma.documentoFinca.findMany({
                where: {
                    id_finca: fincaId,
                    tipoDocumento: {
                        es_obligatorio: true,
                    },
                },
            });

            // Verificar si todos están aprobados
            const todosAprobados = documentosObligatorios.every(doc => doc.estado === DocumentoEstado.APROBADO);

            if (todosAprobados) {
                // Buscar el usuario asociado a esta finca
                const usuarioFinca = await this.prisma.usuarioRol.findFirst({
                    where: {
                        rol: {
                            nombre: 'FINCA',
                        },
                        metadata: {
                            path: ['id_finca'],
                            equals: fincaId,
                        },
                    },
                });

                if (usuarioFinca) {
                    // Aprobar el rol de finca
                    await this.prisma.usuarioRol.update({
                        where: { id: usuarioFinca.id },
                        data: {
                            estado: 'APROBADO',
                        },
                    });
                }
            }
        }

        return {
            message: `Documento ${dto.estado.toLowerCase()} exitosamente`,
            documento: updatedDoc,
        };
    }

    async getPendingDocuments() {
        const documents = await this.prisma.documentoFinca.findMany({
            where: {
                estado: 'PENDIENTE',
                ruta_archivo: { not: null }, // Solo documentos que ya tienen archivo subido
            },
            include: {
                finca: {
                    select: {
                        id: true,
                        nombre_finca: true,
                        tag: true,
                        ruc_finca: true,
                    },
                },
                tipoDocumento: true,
            },
            orderBy: {
                fecha_subida: 'asc', // Primero los más antiguos
            },
        });

        return documents;
    }

    async getFincaDocuments(fincaId: number) {
        // Verificar si la finca existe
        const finca = await this.prisma.finca.findUnique({
            where: { id: fincaId },
        });

        if (!finca) {
            throw new NotFoundException(`Finca con ID ${fincaId} no encontrada`);
        }

        // Obtener todos los documentos de la finca
        const documents = await this.prisma.documentoFinca.findMany({
            where: {
                id_finca: fincaId,
            },
            include: {
                tipoDocumento: true,
                revisor: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                tipoDocumento: {
                    nombre: 'asc',
                },
            },
        });

        return documents;
    }

    async getRequiredDocumentTypes() {
        const documentTypes = await this.prisma.tipoDocumentoFinca.findMany({
            orderBy: {
                es_obligatorio: 'desc',
            },
        });

        return documentTypes;
    }
}