// Type definitions for the Trip Registration System

export interface City {
  city_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
}

export interface Student {
  student_id: string;
  name: string;
  surname: string;
  class?: string;
  class_no?: string;
  city_id: string;
  created_at: string;
}

export interface RegisterRequest {
  student_id: string;
  name: string;
  surname: string;
  class?: string;
  class_no?: string;
  city_id: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error_code?: string;
}

export interface CityStatusResponse {
  cities: City[];
}

export type ErrorCode = 
  | "ALREADY_REGISTERED"
  | "QUOTA_FULL"
  | "INVALID_INPUT"
  | "INVALID_CITY"
  | "SERVER_ERROR";
