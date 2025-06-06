// code-preview.component.ts - Complete Updated Version
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatgptService } from '../services/chatgpt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-preview.component.html',
  styleUrls: ['./code-preview.component.scss']
})
export class CodePreviewComponent implements OnDestroy {
  generatedHtml = '';
  copySuccess = false;
  showPreview = false;
  private subscription: Subscription;

  constructor(private chatService: ChatgptService) {
    this.subscription = this.chatService.generatedHtml$.subscribe(code => {
      this.generatedHtml = code;
      console.log('Generated HTML:', code);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  copyCode(): void {
    if (!this.generatedHtml) {
      console.warn('No code to copy');
      return;
    }

    navigator.clipboard.writeText(this.generatedHtml).then(() => {
      console.log('Code copied to clipboard');
      this.copySuccess = true;

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.copySuccess = false;
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);

      // Fallback for older browsers
      this.fallbackCopyToClipboard(this.generatedHtml);
    });
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      console.log('Code copied using fallback method');
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 3000);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }

    document.body.removeChild(textArea);
  }

  downloadCode(): void {
    if (!this.generatedHtml) {
      console.warn('No code to download');
      return;
    }

    const blob = new Blob([this.generatedHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `portfolio-${timestamp}.html`;
    link.href = url;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL object
    window.URL.revokeObjectURL(url);

    console.log('Code downloaded as HTML file');
  }

  previewCode(): void {
    if (!this.generatedHtml) {
      console.warn('No code to preview');
      return;
    }

    this.showPreview = true;
    console.log('Opening preview modal');
  }

  closePreview(): void {
    this.showPreview = false;
    console.log('Closing preview modal');
  }

  // Utility methods for template
  getLineCount(): number {
    if (!this.generatedHtml) return 0;
    return this.generatedHtml.split('\n').length;
  }

  getFileSize(): string {
    if (!this.generatedHtml) return '0 B';

    const bytes = new Blob([this.generatedHtml]).size;
    const sizes = ['B', 'KB', 'MB', 'GB'];

    if (bytes === 0) return '0 B';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);

    return `${size} ${sizes[i]}`;
  }

  // Check if code is available
  get hasCode(): boolean {
    return !!(this.generatedHtml && this.generatedHtml.trim().length > 0);
  }

  // Get formatted code for display
  get formattedCode(): string {
    if (!this.generatedHtml) return '';

    // Optional: Add basic HTML formatting/indentation here
    return this.generatedHtml;
  }

  // Additional helper methods
  get characterCount(): number {
    return this.generatedHtml ? this.generatedHtml.length : 0;
  }

  get isEmpty(): boolean {
    return !this.hasCode;
  }

  getFileSizeBytes(): number {
    if (!this.generatedHtml) return 0;
    return new Blob([this.generatedHtml]).size;
  }

  get isLongCode(): boolean {
    return this.getLineCount() > 100;
  }

  getCodePreview(maxLength: number = 200): string {
    if (!this.generatedHtml) return '';

    if (this.generatedHtml.length <= maxLength) {
      return this.generatedHtml;
    }

    return this.generatedHtml.substring(0, maxLength) + '...';
  }
}