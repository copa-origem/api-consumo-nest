import { ApiProperty } from '@nestjs/swagger';

export class ExportReportDto {
  @ApiProperty({
    description: 'Filtros aplicados para a geração do relatório',
    example: {
      status: 'PENDENTE',
      category: 'Buracos',
      startDate: '2025-12-01',
      endDate: '2026-01-01'
    },
  })
  filters: any; 
}