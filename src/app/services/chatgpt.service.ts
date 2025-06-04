import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatgptService {
  public generatedHtml$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) { }

  generatePortfolioCode(resumeText: string): void {
    const formData = new FormData();
    formData.append('file', new Blob([resumeText], { type: 'text/plain' }), 'resume.txt');

    this.http.post<{ html_code: string }>('http://localhost:8000/generate', formData)
      .subscribe(res => this.generatedHtml$.next(res.html_code));
  }
}
