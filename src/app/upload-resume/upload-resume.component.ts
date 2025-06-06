import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { ChatgptService } from '../services/chatgpt.service';
import { ChangeDetectorRef } from '@angular/core';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

@Component({
  selector: 'app-upload-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-resume.component.html',
  styleUrls: ['./upload-resume.component.scss']
})
export class UploadResumeComponent {
  resumeText = '';
  selectedFile: File | null = null;
  isDragOver = false;
  isGenerating = false;
  isProcessingFile = false;
  fileError = '';
  showFullScreenLoader = false;

  constructor(private chatService: ChatgptService, private cd: ChangeDetectorRef) { }

  async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.processFile(files[0]);
    }
  }

  async processFile(file: File): Promise<void> {
    this.fileError = '';
    this.resumeText = '';

    if (!this.isValidFile(file)) {
      this.fileError = 'Unsupported file type. Please upload .txt, .pdf, or .docx files.';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.fileError = 'File size too large. Please upload files smaller than 10MB.';
      return;
    }

    this.selectedFile = file;
    this.isProcessingFile = true;

    try {
      const fileType = file.type;

      if (fileType === 'text/plain') {
        await this.extractTxt(file);
      } else if (fileType === 'application/pdf') {
        await this.extractPdf(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        await this.extractDocx(file);
      }

      console.log('File processed successfully:', this.resumeText.slice(0, 100));
    } catch (error) {
      console.error('Error processing file:', error);
      this.fileError = 'Error processing file. Please try again or use a different file.';
      this.selectedFile = null;
      this.resumeText = '';
    } finally {
      this.isProcessingFile = false;
    }
  }

  private isValidFile(file: File): boolean {
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return validTypes.includes(file.type);
  }

  private extractTxt(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          this.resumeText = e.target.result;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read TXT file'));
      reader.readAsText(file);
    });
  }

  private async extractPdf(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(' ');
            text += pageText + '\n';
          }

          this.resumeText = text.trim();
          resolve();
        } catch (error) {
          reject(new Error('Failed to extract text from PDF'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async extractDocx(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = await mammoth.extractRawText({
            arrayBuffer: reader.result as ArrayBuffer
          });
          this.resumeText = result.value.trim();
          resolve();
        } catch (error) {
          reject(new Error('Failed to extract text from DOCX'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    });
  }

  clearFile(): void {
    this.selectedFile = null;
    this.resumeText = '';
    this.fileError = '';
    this.isProcessingFile = false;

    const fileInput = document.getElementById('resumeInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generatePortfolio(): Promise<void> {
    if (!this.resumeText.trim()) {
      this.fileError = 'Please upload a resume first.';
      return;
    }

    this.isGenerating = true;
    this.showFullScreenLoader = true;
    this.fileError = '';

    console.log('📤 Triggering fullscreen loader');

    try {
      const response = await this.chatService.generatePortfolioCode(this.resumeText);
      console.log('✅ Portfolio generated!', response); // log the response here
    } catch (error) {
      console.error('❌ Error generating portfolio:', error);
      this.fileError = 'Failed to generate portfolio. Please try again.';
    } finally {
      setTimeout(() => {
        this.isGenerating = false;
        this.showFullScreenLoader = false;
        console.log('⛔ Loader hidden');
      }, 500); // small delay to visually show the loader for at least a moment
    }
  }



  get hasValidResume(): boolean {
    return this.resumeText.trim().length > 0;
  }

  get canGenerate(): boolean {
    return this.hasValidResume && !this.isGenerating && !this.isProcessingFile;
  }
}
