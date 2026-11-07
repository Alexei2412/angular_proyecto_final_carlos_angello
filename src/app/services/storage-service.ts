import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  read<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

   write<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
