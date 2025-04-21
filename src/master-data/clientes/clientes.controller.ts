// src/master-data/clientes/clientes.controller.ts
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
import { ClientesService } from './clientes.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.clientesService.findAll(includeInactive === true);
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.clientesService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createClienteDto: CreateClienteDto) {
        return this.clientesService.create(createClienteDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateClienteDto: UpdateClienteDto,
    ) {
        return this.clientesService.update(id, updateClienteDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.clientesService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.restore(id);
    }
}