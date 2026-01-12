import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';

@Injectable()
export class ReportsService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    ) {}

    async requestReport(userId: string, filters: any) {
        const jobId = crypto.randomUUID();

        const payload = {
            jobId,
            userId,
            filters,
            createdAt: new Date(),
        };

        this.client.emit('generate-report', payload);

        return {
            message: 'Solicitation recived. We gonna say when is ready',
            jobId,
            status: 'pending'
        };
    }

    async generatePdf(filters: any): Promise<string> {
        console.log('Iniciando geração do pdf complexa...');

        const denuncias = [
            { titulo: 'Buraco na rua x', data: '12/01/2026', status: 'Aberto'},
            { titulo: 'Luz do poste queimada', data: '11/01/2026', status: 'Resolvido'},
            { titulo: 'Lixo na calçada', data: '10/01/2026', status: 'Aberto'},
        ];

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('Pdf gerado');

        return 'https://cloudinary.com/fake-url-do-relatorio.pdf';
    }
}