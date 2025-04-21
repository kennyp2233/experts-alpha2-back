// src/master-data/subagencias/subagencias.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { SubagenciasService } from './subagencias.service';
import { CreateSubagenciaDto, UpdateSubagenciaDto } from './dto/subagencia.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/subagencias')
export class SubagenciasController {
    constructor(private readonly subagenciasService: SubagenciasService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.subagenciasService.findAll(includeInactive === true);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subagenciasService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createSubagenciaDto: CreateSubagenciaDto) {
        return this.subagenciasService.create(createSubagenciaDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSubagenciaDto: UpdateSubagenciaDto,
    ) {
        return this.subagenciasService.update(id, updateSubagenciaDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.subagenciasService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.subagenciasService.restore(id);
    }
}