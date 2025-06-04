import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatgptService {
  public generatedHtml$ = new BehaviorSubject<string>('');

  generatePortfolioCode(resumeText: string): void {
    console.log('Mock HTML being returned for:', resumeText.slice(0, 100));

    const mockHtml = `<section>
  <h1>${resumeText.split('\n')[0]}</h1>
  <p>This is a mock portfolio section generated from your resume.</p>
</section>`;
    this.generatedHtml$.next(mockHtml);
  }
}
