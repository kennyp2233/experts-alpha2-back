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
import { PaisesService } from './paises.controller';
import { CreatePaisDto, UpdatePaisDto } from './dto/pais.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/paises')
export class PaisesController {
    constructor(private readonly paisesService: PaisesService) { }

    @Get()
    async findAll() {
        return this.paisesService.findAll();
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.paisesService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.paisesService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createPaisDto: CreatePaisDto) {
        return this.paisesService.create(createPaisDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePaisDto: UpdatePaisDto,
    ) {
        return this.paisesService.update(id, updatePaisDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.paisesService.remove(id);
    }
}