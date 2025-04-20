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
import { DestinosService } from './destinos.service';
import { CreateDestinoDto, UpdateDestinoDto } from './dto/destino.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/destinos')
export class DestinosController {
    constructor(private readonly destinosService: DestinosService) { }

    @Get()
    async findAll() {
        return this.destinosService.findAll();
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.destinosService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.destinosService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createDestinoDto: CreateDestinoDto) {
        return this.destinosService.create(createDestinoDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDestinoDto: UpdateDestinoDto,
    ) {
        return this.destinosService.update(id, updateDestinoDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.destinosService.remove(id);
    }
}