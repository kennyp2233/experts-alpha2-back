import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Param,
    ParseIntPipe,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AllowPending } from '../auth/decorators/allow-pending.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentoFincaDto } from './dto/create-document.dto';
import { ReviewDocumentoFincaDto } from './dto/review-document.dto';
import { UploadDocumentoFileDto } from './dto/upload-document-file.dto';
import { UpdateDocumentoFincaDto } from './dto/update-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    @Roles('FINCA')
    @AllowPending()
    async createDocument(@Body() createDocDto: CreateDocumentoFincaDto, @Request() req) {
        // The service will extract farm ID from user metadata
        return this.documentsService.createDocument(createDocDto, req.user.id);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    @Roles('FINCA')
    @AllowPending()
    async uploadDocumentFile(
        @Body() uploadDto: UploadDocumentoFileDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        if (!file) {
            throw new BadRequestException('No se ha proporcionado ningún archivo');
        }
        return this.documentsService.uploadDocumentFile(uploadDto, file, req.user.id);
    }

    @Post('review')
    @Roles('ADMIN')
    async reviewDocument(
        @Body() reviewDto: ReviewDocumentoFincaDto,
        @Request() req,
    ) {
        return this.documentsService.reviewDocument(reviewDto, req.user.id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    @Roles('FINCA')
    @AllowPending()
    async updateDocument(
        @Param('id') id: string,
        @Body() updateDto: UpdateDocumentoFincaDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        updateDto.id = id;
        if (!file) {
            throw new BadRequestException('No se ha proporcionado ningún archivo');
        }
        return this.documentsService.updateDocument(updateDto, file, req.user.id);
    }

    @Get('pending')
    @Roles('ADMIN')
    async getPendingDocuments() {
        return this.documentsService.getPendingDocuments();
    }

    @Get('my-documents')
    @Roles('FINCA')
    @AllowPending()
    async getMyDocuments(@Request() req) {
        // New endpoint to get documents for the current user's farm
        return this.documentsService.getUserFarmDocuments(req.user.id);
    }

    @Get('finca/:id')
    @Roles('ADMIN')
    async getFincaDocuments(@Param('id', ParseIntPipe) fincaId: number) {
        // Kept for admin access to any farm's documents
        return this.documentsService.getFincaDocuments(fincaId);
    }

    @Get('types')
    @Roles('FINCA', 'ADMIN')
    @AllowPending()
    async getRequiredDocumentTypes() {
        return this.documentsService.getRequiredDocumentTypes();
    }
}