import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly termSubject = new BehaviorSubject<string>('');
  readonly term$ = this.termSubject.asObservable();

  get currentTerm(): string {
    return this.termSubject.value;
  }

  setTerm(value: string): void {
    this.termSubject.next(value.trimStart());
  }

  clear(): void {
    this.termSubject.next('');
  }
}
