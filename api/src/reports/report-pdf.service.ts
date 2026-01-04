import { Injectable } from '@nestjs/common';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import * as pug from 'pug';
import puppeteer, { LaunchOptions } from 'puppeteer';
import * as fs from 'fs'
import * as path from 'path';

interface ReportData {
  report_id: string;
  employee_name: string;
  route_name: string;
  vehicle_plate_number: string;
  session_duration: string;
  session_start_time: string;
  session_end_time: string;
  report_timestamp: string;
  collection_points_summary?: {
    total: number;
    collected: number;
    uncollected: number;
    percentage: number;
  };
  remarks?: string;
}

@Injectable()
export class ReportPdfService {
  private readonly fontPath: string;
  private readonly fontBase64: string;
  private readonly pugTemplate: string;

  constructor() {
    // Initialize font
    this.fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');
    const fontBuffer = fs.readFileSync(this.fontPath);
    this.fontBase64 = fontBuffer.toString('base64');
    
    // Initialize Pug template
    this.pugTemplate = this.initializePugTemplate();
  }

  private initializePugTemplate(): string {
    return `
doctype html
html(lang="ja")
  head
    meta(charset="UTF-8")
    style.
      @font-face {
        font-family: "Noto Sans JP";
        src: url(data:font/truetype;charset=utf-8;base64,${this.fontBase64}) format("truetype");
      }
      
      body {
        font-family: "Noto Sans JP", Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        margin: 0;
        padding: 20px;
        background: #fff;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 15px;
      }
      
      .header h1 {
        font-size: 20px;
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #333;
      }
      
      .header .subtitle {
        font-size: 12px;
        color: #666;
        margin: 0;
      }
      
      .main-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      .main-table td {
        vertical-align: top;
        padding: 0 15px;
      }
      
      .section {
        margin-bottom: 25px;
      }
      
      .section-title {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 12px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
      }
      
      .info-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .info-table td {
        padding: 6px 0;
        vertical-align: top;
      }
      
      .info-table .label {
        font-weight: 600;
        color: #555;
        width: 100px;
        padding-right: 15px;
      }
      
      .stats-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      
      .stats-table td {
        text-align: center;
        padding: 12px 8px;
        border: 1px solid #e0e0e0;
        background: #fafafa;
      }
      
      .stat-number {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 4px;
      }
      
      .completion-rate .stat-number {
        font-size: 22px;
      }
      
      .remarks-content {
        background: #f8f8f8;
        padding: 15px;
        border-left: 4px solid #666;
        font-size: 11px;
        line-height: 1.5;
        min-height: 50px;
      }

  body
    .header
      h1 GARBAGE COLLECTION REPORT
      .subtitle レポート概要 (Report Summary)
    
    table.main-table
      tr
        td
          .section
            .section-title Report Information
            table.info-table
              tr
                td.label Report ID:
                td.value= report_id
              tr
                td.label Employee:
                td.value= employee_name
              tr
                td.label Route:
                td.value= route_name
              tr
                td.label Vehicle:
                td.value= vehicle_plate_number
          
          .section
            .section-title Session Details
            table.info-table
              tr
                td.label Duration:
                td.value= session_duration
              tr
                td.label Start Time:
                td.value= session_start_time
              tr
                td.label End Time:
                td.value= session_end_time
              tr
                td.label Generated On:
                td.value= report_timestamp
        
        td
          .section
            .section-title Collection Summary
            if collection_points_summary
              table.stats-table
                tr
                  td
                    span.stat-number= collection_points_summary.total
                    span.stat-label Total Points
                  td
                    span.stat-number= collection_points_summary.collected
                    span.stat-label Collected
                tr
                  td(colspan="2")
                    span.stat-number= collection_points_summary.uncollected
                    span.stat-label Uncollected
                tr
                  td(colspan="2").completion-rate
                    span.stat-number= collection_points_summary.percentage + '%'
                    span.stat-label Completion Rate
            else
              .no-data Collection points data not available
    
    .section
      .section-title Remarks
      .remarks-content= remarks || "No remarks provided"
    `;
  }

  async generatePdf(reportData: ReportData): Promise<Buffer> {
    let browser;
    
    try {
      // Enhance payload with defaults
      const enhancedPayload = {
        ...reportData,
        collection_points_summary: reportData.collection_points_summary || null
      };

      // Render HTML from Pug template
      const html = pug.render(this.pugTemplate, enhancedPayload);

      // Configure Puppeteer launch options
      const launchOptions: LaunchOptions = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };

      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      // Launch browser and generate PDF
      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });

      return pdfBuffer;

    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}