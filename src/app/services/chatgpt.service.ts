import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatgptService {
  public generatedHtml$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) { }

  generatePortfolioCode(resumeText: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', new Blob([resumeText], { type: 'text/plain' }), 'resume.txt');

    return this.http.post<{ html_code?: string }>('http://localhost:8000/generate', formData)
      .toPromise()
      .then(res => {
        const htmlCode = res?.html_code ?? '';
        this.generatedHtml$.next(htmlCode);
        return htmlCode;
      })
      .catch(err => {
        console.error('❌ Error in generatePortfolioCode:', err);
        throw err;
      });
  }

}
