// Prisma-based Employee entity
// Re-exports Prisma generated types for backward compatibility

import { Employee as PrismaEmployee, EmployeeStatus, Prisma } from '@prisma/client';

// Re-export the Prisma-generated Employee type
export type Employee = PrismaEmployee;

// Re-export the enum
export { EmployeeStatus };

// Type for creating a new employee
export type CreateEmployeeInput = Prisma.EmployeeCreateInput;

// Type for updating an employee
export type UpdateEmployeeInput = Prisma.EmployeeUpdateInput;

// Type for employee with relations
export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: true;
    devices: true;
  };
}>;
