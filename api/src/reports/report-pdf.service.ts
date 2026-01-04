import { Injectable } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface UncollectedPoints {
  collection_point_name: string;
  route_name: string;
}

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
  not_collected_points: UncollectedPoints[];
}

@Injectable()
export class ReportPdfService {
  private readonly fontPath: string;
  private readonly fontBase64: string;
  private browser: Browser | null = null;

  constructor() {
    this.fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');
    const fontBuffer = fs.readFileSync(this.fontPath);
    this.fontBase64 = fontBuffer.toString('base64');
  }

private generateHtml(data: ReportData): string {
  const {
    report_id,
    employee_name,
    route_name,
    vehicle_plate_number,
    session_duration,
    session_start_time,
    session_end_time,
    report_timestamp,
    collection_points_summary,
    remarks,
    not_collected_points
  } = data;

  // Generate collection summary HTML
  const collectionSummaryHtml = collection_points_summary ? `
    <div class="section">
      <div class="section-title">Collection Summary</div>
      <table class="stats-table">
        <tr>
          <td>
            <span class="stat-number">${collection_points_summary.total}</span>
            <span class="stat-label">Total Points</span>
          </td>
          <td>
            <span class="stat-number">${collection_points_summary.collected}</span>
            <span class="stat-label">Collected</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <span class="stat-number">${collection_points_summary.uncollected}</span>
            <span class="stat-label">Uncollected</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" class="completion-rate">
            <span class="stat-number">${collection_points_summary.percentage}%</span>
            <span class="stat-label">Completion Rate</span>
          </td>
        </tr>
      </table>
    </div>
  ` : `
    <div class="section">
      <div class="section-title">Collection Summary</div>
      <div class="no-data">Collection points data not available</div>
    </div>
  `;

  // Generate uncollected points HTML - FIX IS HERE
  let uncollectedPointsHtml: string;
  
  if (not_collected_points && not_collected_points.length > 0) {
    // We have detailed uncollected points data
    uncollectedPointsHtml = `
      <div class="uncollected-count">Total uncollected: ${not_collected_points.length} point(s)</div>
      <table class="uncollected-table">
        <thead>
          <tr>
            <th>Collection Point Name</th>
            <th>Route Name</th>
          </tr>
        </thead>
        <tbody>
          ${not_collected_points.map(point => `
            <tr>
              <td>${this.escapeHtml(point.collection_point_name)}</td>
              <td>${this.escapeHtml(point.route_name)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (collection_points_summary && collection_points_summary.uncollected > 0) {
    // We don't have detailed data, but we know there are uncollected points
    uncollectedPointsHtml = `
      <div class="uncollected-count">Total uncollected: ${collection_points_summary.uncollected} point(s)</div>
      <div class="no-data">Detailed uncollected points data not available, but ${collection_points_summary.uncollected} points were not collected.</div>
    `;
  } else {
    // No uncollected points
    uncollectedPointsHtml = `
      <div class="no-uncollected">✓ All collection points were successfully collected!</div>
    `;
  }

    return `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @font-face {
              font-family: "Noto Sans JP";
              src: url(data:font/truetype;charset=utf-8;base64,${this.fontBase64}) format("truetype");
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: "Noto Sans JP", Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: #fff;
              padding: 20px;
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
              word-wrap: break-word;
            }

            .uncollected-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            
            .uncollected-table th {
              background: #f5f5f5;
              border: 1px solid #ddd;
              padding: 6px 8px;
              font-weight: bold;
              text-align: left;
              font-size: 10px;
              color: #555;
            }
            
            .uncollected-table td {
              border: 1px solid #ddd;
              padding: 6px 8px;
              font-size: 10px;
              vertical-align: top;
              word-wrap: break-word;
            }
            
            .uncollected-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            
            .no-uncollected {
              background: #e8f5e8;
              padding: 12px;
              border-left: 4px solid #4caf50;
              font-size: 11px;
              text-align: center;
              color: #2e7d32;
              font-weight: 600;
            }
            
            .uncollected-count {
              font-size: 11px;
              color: #666;
              margin-bottom: 8px;
              font-style: italic;
            }

            .no-data {
              padding: 10px;
              text-align: center;
              color: #666;
              font-style: italic;
            }

            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GARBAGE COLLECTION REPORT</h1>
            <div class="subtitle">レポート概要 (Report Summary)</div>
          </div>
          
          <table class="main-table">
            <tr>
              <td>
                <div class="section">
                  <div class="section-title">Report Information</div>
                  <table class="info-table">
                    <tr>
                      <td class="label">Report ID:</td>
                      <td class="value">${this.escapeHtml(report_id)}</td>
                    </tr>
                    <tr>
                      <td class="label">Employee:</td>
                      <td class="value">${this.escapeHtml(employee_name)}</td>
                    </tr>
                    <tr>
                      <td class="label">Route:</td>
                      <td class="value">${this.escapeHtml(route_name)}</td>
                    </tr>
                    <tr>
                      <td class="label">Vehicle:</td>
                      <td class="value">${this.escapeHtml(vehicle_plate_number)}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="section">
                  <div class="section-title">Session Details</div>
                  <table class="info-table">
                    <tr>
                      <td class="label">Duration:</td>
                      <td class="value">${this.escapeHtml(session_duration)}</td>
                    </tr>
                    <tr>
                      <td class="label">Start Time:</td>
                      <td class="value">${this.escapeHtml(session_start_time)}</td>
                    </tr>
                    <tr>
                      <td class="label">End Time:</td>
                      <td class="value">${this.escapeHtml(session_end_time)}</td>
                    </tr>
                    <tr>
                      <td class="label">Generated On:</td>
                      <td class="value">${this.escapeHtml(report_timestamp)}</td>
                    </tr>
                  </table>
                </div>
              </td>
              
              <td>
                ${collectionSummaryHtml}
              </td>
            </tr>
          </table>
          
          <div class="section">
            <div class="section-title">Remarks</div>
            <div class="remarks-content">${this.escapeHtml(remarks || "No remarks provided")}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Uncollected Points</div>
            ${uncollectedPointsHtml}
          </div>
        </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

async generatePdf(reportData: ReportData): Promise<Buffer> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    // Set environment variable to bypass font waiting
    process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = 'true';
    
    const enhancedPayload = {
      ...reportData,
      collection_points_summary: reportData.collection_points_summary,
      not_collected_points: reportData.not_collected_points || []
    };

    const html = this.generateHtml(enhancedPayload);

    browser = await chromium.launch({
      headless: true,
      // Use system Chromium when in Docker/production
      executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-font-subpixel-positioning',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-translate',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    page = await browser.newPage();

    await page.setContent(html, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle
      timeout: 30000
    });

    // Wait for fonts to be ready
    await page.waitForFunction(() => {
      return document.fonts.ready;
    }, { timeout: 10000 }).catch(() => {
      console.log('Font loading timeout - proceeding anyway');
    });

    // Additional wait to ensure rendering
    await page.waitForTimeout(1000);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '20px', 
        right: '20px', 
        bottom: '20px', 
        left: '20px' 
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });

    return pdfBuffer;

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.log('Error closing page:', e);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.log('Error closing browser:', e);
      }
    }
  }
}

  async onApplicationShutdown() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.log('Error closing browser on shutdown:', error);
      }
      this.browser = null;
    }
  }
}