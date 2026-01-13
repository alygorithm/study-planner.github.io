// task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task.model';

// Interfaccia FocusSession
export interface FocusSession {
  subject: string;
  minutes: number;
  completed: boolean;
  day?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private baseUrl = 'https://study-planner-backend-sz33.onrender.com/api/tasks';
  private focusUrl = 'https://study-planner-backend-sz33.onrender.com/api/focus-sessions'; // <-- nuova rotta

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${task._id}`, task);
  }

  // ---------------- Focus ----------------

  addFocusSession(session: FocusSession): Observable<FocusSession> {
    return this.http.post<FocusSession>(this.focusUrl, session);
  }

  getFocusSessions(): Observable<FocusSession[]> {
    return this.http.get<FocusSession[]>(this.focusUrl);
  }
}
