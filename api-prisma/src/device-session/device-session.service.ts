import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceSession, Prisma } from '@prisma/client';
import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
import { UpdateDeviceSessionDto } from './dto/device-session-update.dto';
import { FilterDeviceSessionDto } from './dto/device-session-filter.dto';

@Injectable()
export class DeviceSessionService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceSessionDto: CreateDeviceSessionDto): Promise<DeviceSession> {
    const device_route = await this.prisma.deviceRoute.findUnique({
      where: { device_route_id: createDeviceSessionDto.device_route_id }
    });

    if (!device_route) {
      throw new NotFoundException(
        `Device Route with ID ${createDeviceSessionDto.device_route_id} not found`
      );
    }

    return this.prisma.deviceSession.create({
      data: {
        device_route_id: createDeviceSessionDto.device_route_id,
        start: new Date(),
      }
    });
  }

  async findAll(filterDto?: FilterDeviceSessionDto): Promise<{ data: DeviceSession[], total: number }> {
    if (!filterDto) {
      const data = await this.prisma.deviceSession.findMany({
        include: {
          device_route: {
            include: {
              device: {
                include: { employee: true }
              },
              route: true
            }
          }
        },
        orderBy: { start: 'desc' }
      });
      return { data, total: data.length };
    }

    const {
      session_id,
      device_route_id,
      device_id,
      route_id,
      employee_id,
      start_date,
      end_date,
      date,
      is_active,
      has_report,
      started_after,
      started_before,
      ended_after,
      ended_before,
      device_name,
      vehicle_plate_num,
      employee_name,
      employee_email,
      route_name,
      search,
      page = 1,
      limit = 10,
      sort_by = 'start',
      sort_order = 'DESC'
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DeviceSessionWhereInput = {};
    const deviceRouteWhere: Prisma.DeviceRouteWhereInput = {};
    const deviceWhere: Prisma.DeviceWhereInput = {};
    const employeeWhere: Prisma.EmployeeWhereInput = {};
    const routeWhere: Prisma.RouteWhereInput = {};

    // Handle global search
    if (search) {
      where.OR = [
        { session_id: { contains: search } },
        { device_route: { device: { device_name: { contains: search } } } },
        { device_route: { device: { vehicle_plate_num: { contains: search } } } },
        { device_route: { device: { device_id: { contains: search } } } },
        { device_route: { route: { route_name: { contains: search } } } },
        { device_route: { device: { employee: { first_name: { contains: search } } } } },
        { device_route: { device: { employee: { last_name: { contains: search } } } } },
        { device_route: { device: { employee: { email: { contains: search } } } } },
        { device_route: { device: { employee: { employee_id: { contains: search } } } } },
      ];
    }

    // Apply individual filters
    if (session_id) {
      where.session_id = { contains: session_id };
    }

    if (device_route_id) {
      where.device_route_id = device_route_id;
    }

    if (device_id) {
      deviceWhere.device_id = device_id;
    }

    if (route_id) {
      routeWhere.route_id = route_id;
    }

    if (employee_id) {
      employeeWhere.employee_id = employee_id;
    }

    // Device info filters
    if (device_name) {
      deviceWhere.device_name = { contains: device_name };
    }

    if (vehicle_plate_num) {
      deviceWhere.vehicle_plate_num = { contains: vehicle_plate_num };
    }

    if (route_name) {
      routeWhere.route_name = { contains: route_name };
    }

    // Employee info filters
    if (employee_name) {
      employeeWhere.OR = [
        { first_name: { contains: employee_name } },
        { last_name: { contains: employee_name } }
      ];
    }

    if (employee_email) {
      employeeWhere.email = { contains: employee_email };
    }

    // Status filters
    if (is_active !== undefined) {
      if (is_active) {
        where.end = null;
      } else {
        where.end = { not: null };
      }
    }

    if (has_report !== undefined) {
      if (has_report) {
        where.reports = { isNot: null };
      } else {
        where.reports = null;
      }
    }

    // Date filters
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.start = { gte: startOfDay, lte: endOfDay };
    }

    if (start_date && end_date) {
      where.start = { gte: new Date(start_date), lte: new Date(end_date) };
    } else {
      if (start_date) {
        where.start = { ...where.start as object, gte: new Date(start_date) };
      }
      if (end_date) {
        where.start = { ...where.start as object, lte: new Date(end_date) };
      }
    }

    // Time range filters
    if (started_after) {
      where.start = { ...where.start as object, gt: new Date(started_after) };
    }

    if (started_before) {
      where.start = { ...where.start as object, lt: new Date(started_before) };
    }

    if (ended_after) {
      where.end = { ...where.end as object, gt: new Date(ended_after) };
    }

    if (ended_before) {
      where.end = { ...where.end as object, lt: new Date(ended_before) };
    }

    // Build nested device_route where
    if (Object.keys(employeeWhere).length > 0) {
      deviceWhere.employee = employeeWhere;
    }

    if (Object.keys(deviceWhere).length > 0) {
      deviceRouteWhere.device = deviceWhere;
    }

    if (Object.keys(routeWhere).length > 0) {
      deviceRouteWhere.route = routeWhere;
    }

    if (Object.keys(deviceRouteWhere).length > 0) {
      where.device_route = deviceRouteWhere;
    }

    // Get total count
    const total = await this.prisma.deviceSession.count({ where });

    // Apply sorting and pagination
    const data = await this.prisma.deviceSession.findMany({
      where,
      include: {
        device_route: {
          include: {
            device: {
              include: { employee: true }
            },
            route: true
          }
        },
        reports: true
      },
      orderBy: { [sort_by]: sort_order.toLowerCase() as 'asc' | 'desc' },
      skip,
      take: limit
    });

    return { data, total };
  }


  async findOne(session_id: string): Promise<DeviceSession & { device_route: any }> {
    const session = await this.prisma.deviceSession.findUnique({
      where: { session_id },
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException(`Device Session with ID ${session_id} not found`);
    }

    return session;
  }

  async findByDeviceId(
    device_id: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const where: Prisma.DeviceSessionWhereInput = {
      device_route: {
        device_id
      }
    };

    if (getActive) {
      where.end = null;
    } else {
      where.end = { not: null };
    }

    return this.prisma.deviceSession.findMany({
      where,
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        },
        device_locations: true
      }
    });
  }

  async findActiveSessionByDeviceId(device_id: string): Promise<DeviceSession | null> {
    return this.prisma.deviceSession.findFirst({
      where: {
        device_route: { device_id },
        end: null
      },
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        }
      }
    });
  }

  async update(
    session_id: string,
    updateDeviceSessionDto: UpdateDeviceSessionDto
  ): Promise<DeviceSession> {
    await this.findOne(session_id);

    return this.prisma.deviceSession.update({
      where: { session_id },
      data: updateDeviceSessionDto
    });
  }

  async endSession(session_id: string): Promise<DeviceSession> {
    const session = await this.findOne(session_id);

    if (session.end) {
      throw new NotFoundException(`Session ${session_id} is already ended`);
    }

    return this.prisma.deviceSession.update({
      where: { session_id },
      data: { end: new Date() }
    });
  }

  async endActiveSessionByDeviceId(device_id: string): Promise<DeviceSession | null> {
    const activeSession = await this.findActiveSessionByDeviceId(device_id);

    if (!activeSession) {
      return null;
    }

    return this.prisma.deviceSession.update({
      where: { session_id: activeSession.session_id },
      data: { end: new Date() }
    });
  }

  async remove(session_id: string): Promise<DeviceSession> {
    const session = await this.findOne(session_id);

    return this.prisma.deviceSession.delete({
      where: { session_id }
    });
  }

  async findActiveSessions(): Promise<DeviceSession[]> {
    return this.prisma.deviceSession.findMany({
      where: { end: null },
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        }
      }
    });
  }

  async findSessionsByDate(
    date: Date,
    deviceId?: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Prisma.DeviceSessionWhereInput = {
      start: { gte: startOfDay, lte: endOfDay }
    };

    if (getActive) {
      where.end = null;
    } else {
      where.end = { not: null };
    }

    if (deviceId) {
      where.device_locations = {
        some: { device_id: deviceId }
      };
    }

    return this.prisma.deviceSession.findMany({
      where,
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        }
      }
    });
  }


  async findByDeviceRoute(
    deviceRouteId: string,
    deviceId?: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const where: Prisma.DeviceSessionWhereInput = {
      device_route_id: deviceRouteId
    };

    if (getActive) {
      where.end = null;
    } else {
      where.end = { not: null };
    }

    if (deviceId) {
      where.device_locations = {
        some: { device_id: deviceId }
      };
    }

    return this.prisma.deviceSession.findMany({
      where,
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        }
      }
    });
  }


  async findSessionsByRouteAndDate(
    deviceRouteId: string,
    date: Date,
    deviceId?: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Prisma.DeviceSessionWhereInput = {
      device_route_id: deviceRouteId,
      start: { gte: startOfDay, lte: endOfDay }
    };

    if (getActive) {
      where.end = null;
    } else {
      where.end = { not: null };
    }

    if (deviceId) {
      where.device_locations = {
        some: { device_id: deviceId }
      };
    }

    return this.prisma.deviceSession.findMany({
      where,
      include: {
        device_route: {
          include: {
            device: true,
            route: true
          }
        }
      }
    });
  }

  async removeAll(): Promise<{ count: number }> {
    return this.prisma.deviceSession.deleteMany({});
  }


  async findRecentlyEndedSessions(lookbackHours = 24): Promise<DeviceSession[]> {
    const lookbackDate = new Date();
    lookbackDate.setHours(lookbackDate.getHours() - lookbackHours);

    return this.prisma.deviceSession.findMany({
      where: {
        end: {
          not: null,
          gte: lookbackDate
        }
      },
      include: {
        device_route: {
          include: {
            route: true,
            device: {
              include: { employee: true }
            }
          }
        }
      },
      orderBy: { end: 'desc' }
    });
  }


  async sessionHasReport(session_id: string): Promise<boolean> {
    const reportCount = await this.prisma.reports.count({
      where: { session_id }
    });

    return reportCount > 0;
  }
}
