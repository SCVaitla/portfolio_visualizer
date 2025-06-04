import { Component } from '@angular/core';
import { UploadResumeComponent } from './upload-resume/upload-resume.component';
import { CodePreviewComponent } from './code-preview/code-preview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UploadResumeComponent, CodePreviewComponent], // ✅ Register components
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }
