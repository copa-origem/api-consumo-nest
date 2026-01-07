import { 
    Controller, 
    Post, 
    Body, 
    Req, 
    UseGuards, 
    HttpCode, 
    HttpStatus,
    Inject, 
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { EventPattern, Payload, MessagePattern } from '@nestjs/microservices';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vsf;

const REPORTS_SERVICE = 'REPORTS_SERVICE';

@Controller('reports')
export class ReportsController {
    constructor(private readonly ReportsService: ReportsService) {}

    @Post('export')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    async exportReport(@Req() req, @Body() body: any) {
        const userId = req.user.id;
        const filters = body.filters;

        return this.ReportsService.requestReport(userId, filters);
    }
}