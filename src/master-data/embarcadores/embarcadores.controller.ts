// src/master-data/embarcadores/embarcadores.controller.ts
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
import { EmbarcadoresService } from './embarcadores.service';
import { CreateEmbarcadorDto, UpdateEmbarcadorDto } from './dto/embarcador.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/embarcadores')
export class EmbarcadoresController {
    constructor(private readonly embarcadoresService: EmbarcadoresService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.embarcadoresService.findAll(includeInactive === true);
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.embarcadoresService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.embarcadoresService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createEmbarcadorDto: CreateEmbarcadorDto) {
        return this.embarcadoresService.create(createEmbarcadorDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmbarcadorDto: UpdateEmbarcadorDto,
    ) {
        return this.embarcadoresService.update(id, updateEmbarcadorDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.embarcadoresService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.embarcadoresService.restore(id);
    }
}