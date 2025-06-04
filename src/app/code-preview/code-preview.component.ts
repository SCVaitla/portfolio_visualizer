import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatgptService } from '../services/chatgpt.service';

@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [CommonModule], // ✅ ADD THIS
  templateUrl: './code-preview.component.html',
  styleUrls: ['./code-preview.component.scss']
})
export class CodePreviewComponent {
  generatedHtml = '';

  constructor(private chatService: ChatgptService) {
    this.chatService.generatedHtml$.subscribe(code => {
      this.generatedHtml = code;
      console.log('Generated HTML:', code);
    });
  }
}
