import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { FincasService } from '../services/fincas.service';
import { CreateFincaDto, UpdateFincaDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Fincas')
@Controller('fincas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FincasController {
    constructor(private readonly fincasService: FincasService) { }

    @Get()
    @Roles('ADMIN', 'FINCA')
    findAll(@Query('includeInactive') includeInactive: boolean) {
        return this.fincasService.findAll(includeInactive);
    }

    @Get('search')
    @Roles('ADMIN', 'FINCA')
    search(@Query('term') term: string) {
        return this.fincasService.search(term);
    }

    @Get(':id')
    @Roles('ADMIN', 'FINCA')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.findOne(id);
    }

    @Post()
    @Roles('ADMIN', 'FINCA')
    create(@Body() createFincaDto: CreateFincaDto) {
        return this.fincasService.create(createFincaDto);
    }

    @Put(':id')
    @Roles('ADMIN', 'FINCA')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFincaDto: UpdateFincaDto,
    ) {
        return this.fincasService.update(id, updateFincaDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.remove(id);
    }

    @Post(':id/restore')
    @Roles('ADMIN')
    restore(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.restore(id);
    }
}