// src/master-data/funcionarios-agrocalidad/funcionarios-agrocalidad.controller.ts
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
import { FuncionariosAgrocalidadService } from './funcionarios-agrocalidad.service';
import { CreateFuncionarioAgrocalidadDto, UpdateFuncionarioAgrocalidadDto } from './dto/funcionario-agrocalidad.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/funcionarios-agrocalidad')
export class FuncionariosAgrocalidadController {
    constructor(private readonly funcionariosAgrocalidadService: FuncionariosAgrocalidadService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.funcionariosAgrocalidadService.findAll(includeInactive === true);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.funcionariosAgrocalidadService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createFuncionarioDto: CreateFuncionarioAgrocalidadDto) {
        return this.funcionariosAgrocalidadService.create(createFuncionarioDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFuncionarioDto: UpdateFuncionarioAgrocalidadDto,
    ) {
        return this.funcionariosAgrocalidadService.update(id, updateFuncionarioDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.funcionariosAgrocalidadService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.funcionariosAgrocalidadService.restore(id);
    }
}
