import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AerolineasService } from './aerolinea.service';
import {
    CreateAerolineaDto,
    UpdateAerolineaDto,
    AerolineaPlantillaDto,
    CreateAerolineaWithPlantillaDto,
} from './dto/aerolinea.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/aerolineas')
export class AerolineasController {
    constructor(private readonly aerolineasService: AerolineasService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.aerolineasService.findAll(includeInactive === true);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.aerolineasService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createAerolineaDto: CreateAerolineaDto) {
        return this.aerolineasService.create(createAerolineaDto);
    }

    @Post('with-plantilla')
    @Roles('ADMIN')
    async createWithPlantilla(@Body() data: CreateAerolineaWithPlantillaDto) {
        return this.aerolineasService.createWithPlantilla(data);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAerolineaDto: UpdateAerolineaDto,
    ) {
        return this.aerolineasService.update(id, updateAerolineaDto);
    }

    @Patch(':id/plantilla')
    @Roles('ADMIN')
    async updatePlantilla(
        @Param('id', ParseIntPipe) id: number,
        @Body() plantillaDto: AerolineaPlantillaDto,
    ) {
        return this.aerolineasService.updatePlantilla(id, plantillaDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.aerolineasService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.aerolineasService.restore(id);
    }
}