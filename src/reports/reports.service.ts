import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
        private readonly prisma: PrismaService,
    ) {}

    async requestReport(userId: string, filters: any) {
        const jobId = crypto.randomUUID();
        const payload = { jobId, userId, filters, createdAt: new Date() };
        this.client.emit('generate-report', payload);
        return { message: 'Processing...', jobId, status: 'pending' };
    }

    async generatePdf(filters: any): Promise<string> {
        console.log('Buscando dados no banco...');

        const whereClause: any = {};

        if (filters?.status) {
            whereClause.status = filters.status;
        }

        if (filters?.categoryId) {
            whereClause.issueType = {
                categoryId: filters.categoryId
            };
        }

        if (filters?.startDate && filters?.endDate) {
            whereClause.createdAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        const problems = await this.prisma.problem.findMany({
            where: whereClause,
            include: {
                issueType: {
                    include: {category: true}
                },
                author: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        console.log(`Encontrados ${problems.length} registros. Gerando PDF...`);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: any[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const result = Buffer.concat(chunks);
                const base64Pdf = `data:application/pdf;base64,${result.toString('base64')}`;
                resolve(base64Pdf);
            });
            doc.on('error', (err) => reject(err));

            doc.fontSize(20).text('Relatório de Problemas Urbanos', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();
            
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            if (problems.length === 0) {
                doc.fontSize(14).text('Nenhum registro encontrado para os filtros selecionados.', { align: 'center' });
            } else {
                problems.forEach((problem, index) => {
                    if (doc.y > 700) doc.addPage();

                    doc.fontSize(14).font('Helvetica-Bold')
                       .text(`#${index + 1} - ${problem.issueType.title} (${problem.issueType.category.name})`);
                    
                    doc.fontSize(10).font('Helvetica').fillColor('black');
                    doc.text(`Status: ${problem.status}`);
                    doc.text(`Data: ${problem.createdAt.toLocaleDateString()}`);
                    doc.text(`Autor: ${problem.author.name || 'Anônimo'}`);
                    
                    doc.moveDown(0.5);
                    doc.font('Helvetica-Oblique').text(`" ${problem.description} "`, { width: 400 });
                    
                    if (problem.imageUrl) {
                        doc.fillColor('blue').text('Ver foto original', { link: problem.imageUrl, underline: true });
                    }

                    doc.fillColor('black');
                    doc.moveDown();
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke(); // Linha cinza separadora
                    doc.moveDown();
                });
            }

            doc.end();
        });
    }
}