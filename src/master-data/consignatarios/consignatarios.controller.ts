// src/master-data/consignatarios/consignatarios.controller.ts
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
import { ConsignatariosService } from './consignatarios.service';
import {
    CreateConsignatarioDto,
    UpdateConsignatarioDto,
    UpdateConsignatarioInfoAdicionalDto
} from './dto/consignatario.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/consignatarios')
export class ConsignatariosController {
    constructor(private readonly consignatariosService: ConsignatariosService) { }

    @Get()
    async findAll(@Query('id_cliente') idCliente?: number) {
        return this.consignatariosService.findAll(idCliente);
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.consignatariosService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.consignatariosService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createConsignatarioDto: CreateConsignatarioDto) {
        return this.consignatariosService.create(createConsignatarioDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateConsignatarioDto: UpdateConsignatarioDto,
    ) {
        return this.consignatariosService.update(id, updateConsignatarioDto);
    }

    @Patch(':id/info-adicional')
    @Roles('ADMIN')
    async updateInfoAdicional(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateInfoDto: UpdateConsignatarioInfoAdicionalDto,
    ) {
        return this.consignatariosService.updateInfoAdicional(id, updateInfoDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.consignatariosService.remove(id);
    }
}
