import { Request } from 'express';

export interface RequestUser extends Request {
  user: {
    userId: string;  
    username: string;
    role: string;
    employee_id?: string;
  };
}

