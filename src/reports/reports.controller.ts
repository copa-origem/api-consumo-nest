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
import { EventPattern, Payload, MessagePattern, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExportReportDto } from './dto/export-problems.dto'


@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly notificationsGateway: NotificationsGateway,
        @Inject('RABBITMQ_SERVICE') private readonly rabbitmqClient: any,
    ) {}

    @Post('export')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Trigger background PDF generation',
        description: `
        **Asynchronous Operation:**
        This endpoint pushes a message to the **RabbitMQ** queue and returns immediately.
        
        **How to get the result:**
        1. Client receives HTTP 202 (Accepted).
        2. Client should listen to the WebSocket event **"report-ready"**.
        3. Once the Worker finishes processing, the PDF URL will be pushed via WebSocket.
        `
    })
    @ApiResponse({ 
        status: 202, 
        description: 'Task accepted and queued for processing.',
        schema: {
            example: {
                message: 'Processing...',
                jobId: '14d610001-ff34-48ea-86a1-c1dd684005d',
                status: 'pending'
            }
        }
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Throttle({ default: { limit: 2, ttl: 60000 } })
    async exportReport(@Req() req, @Body() body: ExportReportDto) {
        const userId = req.user.id;
        const filters = body.filters;

        return this.reportsService.requestReport(userId, filters);
    }

    @EventPattern('generate-report')
    async handleGenerateReport(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log('Worker recebeu job:', data.jobId);

        const { userId, filters, jobId } = data;

        const pdfUrl = await this.reportsService.generatePdf(filters);

        console.log(`Warning the user ${userId}  by WebSocket...`);
        this.notificationsGateway.notifyUser(userId, 'report_ready', {
            message: 'Seu relatório está pronto!',
            downloadUrl: pdfUrl,
            jobId: jobId
        });
    }
}