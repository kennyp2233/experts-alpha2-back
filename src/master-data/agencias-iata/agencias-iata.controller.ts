
// src/master-data/agencias-iata/agencias-iata.controller.ts
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
import { AgenciasIataService } from './agencias-iata.service';
import { CreateAgenciaIataDto, UpdateAgenciaIataDto } from './dto/agencia-iata.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/agencias-iata')
export class AgenciasIataController {
    constructor(private readonly agenciasIataService: AgenciasIataService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.agenciasIataService.findAll(includeInactive === true);
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.agenciasIataService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.agenciasIataService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createAgenciaIataDto: CreateAgenciaIataDto) {
        return this.agenciasIataService.create(createAgenciaIataDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAgenciaIataDto: UpdateAgenciaIataDto,
    ) {
        return this.agenciasIataService.update(id, updateAgenciaIataDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.agenciasIataService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.agenciasIataService.restore(id);
    }
}