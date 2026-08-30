// Type definitions for the Trip Registration System

export interface Trip {
  trip_id: string;
  name: string;
  quota: number;
  stops: string[];
  current_count: number;
  remaining: number;
}

export interface Student {
  student_id: string;
  title: string;
  name: string;
  middle_name?: string;
  surname: string;
  class?: string;
  class_no?: string;
  trip_id: string;
  created_at: string;
}

export interface RegisterRequest {
  student_id: string;
  title: string;
  name: string;
  middle_name?: string;
  surname: string;
  class?: string;
  class_no?: string;
  trip_id: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error_code?: string;
}

export interface TripStatusResponse {
  trips: Trip[];
}

export type ErrorCode =
  | "ALREADY_REGISTERED"
  | "QUOTA_FULL"
  | "INVALID_INPUT"
  | "INVALID_TRIP"
  | "SERVER_ERROR";
