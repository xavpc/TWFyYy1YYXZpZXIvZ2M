import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Route, Prisma, DeviceRouteDay } from '@prisma/client';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterRouteDto } from './dto/filter-route.dto';

@Injectable()
export class RouteService {
  constructor(private prisma: PrismaService) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const existingRouteName = await this.prisma.route.findUnique({
      where: { route_name: createRouteDto.route_name },
    });

    if (existingRouteName) {
      throw new ConflictException(
        `route name: '${createRouteDto.route_name}' already exists`,
      );
    }

    return this.prisma.route.create({
      data: createRouteDto,
    });
  }

  async findAll(filterDto?: FilterRouteDto): Promise<{ data: any[]; total: number }> {
    if (!filterDto) {
      const data = await this.prisma.route.findMany({
        include: {
          images: true,
          device_routes: {
            include: { device: true },
          },
        },
        orderBy: { route_name: 'asc' },
      });

      // Add counts for each route
      const dataWithCounts = await Promise.all(
        data.map(async (route) => {
          const [collectionPointsCount, devicesCount, coordinatesCount] = await Promise.all([
            this.prisma.collectionPoints.count({ where: { route_id: route.route_id } }),
            this.prisma.deviceRoute.count({ where: { route_id: route.route_id } }),
            this.prisma.routeCoordinates.count({ where: { route_id: route.route_id } }),
          ]);

          return {
            ...route,
            collection_points_count: collectionPointsCount,
            devices_count: devicesCount,
            has_coordinates: !!coordinatesCount,
          };
        }),
      );

      return { data: dataWithCounts, total: dataWithCounts.length };
    }

    const {
      route_name,
      search,
      page = 1,
      limit = 10,
      sort_by = 'updated_at',
      sort_order = 'DESC',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    let where: Prisma.RouteWhereInput = {};

    if (search) {
      where = {
        OR: [
          { route_name: { contains: search } },
          { route_id: { contains: search } },
          { device_routes: { some: { device: { device_name: { contains: search } } } } },
          { device_routes: { some: { device: { vehicle_plate_num: { contains: search } } } } },
          { device_routes: { some: { device: { employee: { first_name: { contains: search } } } } } },
          { device_routes: { some: { device: { employee: { last_name: { contains: search } } } } } },
        ],
      };

      if (route_name) {
        where = { AND: [where, { route_name: { contains: route_name } }] };
      }
    } else {
      if (route_name) {
        where.route_name = { contains: route_name };
      }
    }

    const total = await this.prisma.route.count();

    const data = await this.prisma.route.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sort_by]: sort_order.toLowerCase() as 'asc' | 'desc',
      },
    });

    // Add counts for each route
    const dataWithCounts = await Promise.all(
      data.map(async (route) => {
        const [collectionPointsCount, devicesCount, coordinatesCount] = await Promise.all([
          this.prisma.collectionPoints.count({ where: { route_id: route.route_id } }),
          this.prisma.deviceRoute.count({ where: { route_id: route.route_id } }),
          this.prisma.routeCoordinates.count({ where: { route_id: route.route_id } }),
        ]);

        return {
          ...route,
          collection_points_count: collectionPointsCount,
          devices_count: devicesCount,
          has_coordinates: !!coordinatesCount,
        };
      }),
    );

    return { data: dataWithCounts, total };
  }

  async findOne(id: string): Promise<any> {
    const route = await this.prisma.route.findUnique({
      where: { route_id: id },
      include: {
        images: true,
        device_routes: {
          include: {
            device: {
              include: { employee: true },
            },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    const collectionPointsCount = await this.prisma.collectionPoints.count({
      where: { route_id: route.route_id },
    });

    return {
      ...route,
      collection_points_count: collectionPointsCount,
    };
  }

  async findByName(routeName: string): Promise<any> {
    const route = await this.prisma.route.findUnique({
      where: { route_name: routeName },
      include: {
        images: true,
        device_routes: {
          include: { device: true },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with name ${routeName} not found`);
    }

    const collectionPointsCount = await this.prisma.collectionPoints.count({
      where: { route_id: route.route_id },
    });

    return {
      ...route,
      collection_points_count: collectionPointsCount,
    };
  }

  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);

    if (updateRouteDto.route_name && updateRouteDto.route_name !== route.route_name) {
      const existingRoute = await this.prisma.route.findUnique({
        where: { route_name: updateRouteDto.route_name },
      });

      if (existingRoute) {
        throw new ConflictException(
          `Route name: '${updateRouteDto.route_name}' already exists`,
        );
      }
    }

    return this.prisma.route.update({
      where: { route_id: id },
      data: updateRouteDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.route.delete({
      where: { route_id: id },
    });
  }

  async globalSearch(searchTerm: string): Promise<any[]> {
    const results = await this.prisma.route.findMany({
      where: {
        OR: [
          { route_name: { contains: searchTerm } },
          { route_id: { contains: searchTerm } },
          { device_routes: { some: { device: { device_name: { contains: searchTerm } } } } },
          { device_routes: { some: { device: { vehicle_plate_num: { contains: searchTerm } } } } },
          { device_routes: { some: { device: { device_id: { contains: searchTerm } } } } },
          { device_routes: { some: { device: { employee: { first_name: { contains: searchTerm } } } } } },
          { device_routes: { some: { device: { employee: { last_name: { contains: searchTerm } } } } } },
          { device_routes: { some: { device: { employee: { email: { contains: searchTerm } } } } } },
        ],
      },
      include: {
        images: true,
        device_routes: {
          include: {
            device: {
              include: { employee: true },
            },
          },
        },
      },
      orderBy: { route_name: 'asc' },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No routes found matching '${searchTerm}'`);
    }

    const resultsWithCounts = await Promise.all(
      results.map(async (route) => {
        const collectionPointsCount = await this.prisma.collectionPoints.count({
          where: { route_id: route.route_id },
        });
        return { ...route, collection_points_count: collectionPointsCount };
      }),
    );

    return resultsWithCounts;
  }

  async searchByField(field: 'route_name' | 'route_id', value: string): Promise<any[]> {
    const validSearchFields = ['route_name', 'route_id'];

    if (!validSearchFields.includes(field)) {
      throw new NotFoundException(`Field ${field} is not a valid searchable field`);
    }

    const results = await this.prisma.route.findMany({
      where: { [field]: { contains: value } },
      include: {
        images: true,
        device_routes: {
          include: { device: true },
        },
      },
      orderBy: { route_name: 'asc' },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No routes found matching ${field}: ${value}`);
    }

    const resultsWithCounts = await Promise.all(
      results.map(async (route) => {
        const collectionPointsCount = await this.prisma.collectionPoints.count({
          where: { route_id: route.route_id },
        });
        return { ...route, collection_points_count: collectionPointsCount };
      }),
    );

    return resultsWithCounts;
  }

  async findByCoordinateRange(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ): Promise<any[]> {
    const routes = await this.prisma.route.findMany({
      where: {
        center_latitude: { gte: minLat, lte: maxLat },
        center_longitude: { gte: minLng, lte: maxLng },
      },
      include: {
        images: true,
        device_routes: {
          include: { device: true },
        },
      },
      orderBy: { route_name: 'asc' },
    });

    if (routes.length === 0) {
      throw new NotFoundException(
        `No routes found within coordinate range: (${minLat}, ${minLng}) to (${maxLat}, ${maxLng})`,
      );
    }

    const routesWithCounts = await Promise.all(
      routes.map(async (route) => {
        const collectionPointsCount = await this.prisma.collectionPoints.count({
          where: { route_id: route.route_id },
        });
        return { ...route, collection_points_count: collectionPointsCount };
      }),
    );

    return routesWithCounts;
  }

  async findByAssignedDevice(deviceId: string): Promise<any[]> {
    const routes = await this.prisma.route.findMany({
      where: {
        device_routes: { some: { device_id: deviceId } },
      },
      include: {
        images: true,
        device_routes: {
          include: {
            device: {
              include: { employee: true },
            },
          },
        },
      },
      orderBy: { route_name: 'asc' },
    });

    if (routes.length === 0) {
      throw new NotFoundException(`No routes found for device ID: ${deviceId}`);
    }

    const routesWithCounts = await Promise.all(
      routes.map(async (route) => {
        const collectionPointsCount = await this.prisma.collectionPoints.count({
          where: { route_id: route.route_id },
        });
        return { ...route, collection_points_count: collectionPointsCount };
      }),
    );

    return routesWithCounts;
  }

  async findByDay(day: string): Promise<any[]> {
    const routes = await this.prisma.route.findMany({
      where: {
        device_routes: { some: { day_assigned: day as DeviceRouteDay } },
      },
      include: {
        images: true,
        device_routes: {
          include: {
            device: {
              include: { employee: true },
            },
          },
        },
      },
      orderBy: { route_name: 'asc' },
    });

    if (routes.length === 0) {
      throw new NotFoundException(`No routes found assigned for ${day}`);
    }

    const routesWithCounts = await Promise.all(
      routes.map(async (route) => {
        const collectionPointsCount = await this.prisma.collectionPoints.count({
          where: { route_id: route.route_id },
        });
        return { ...route, collection_points_count: collectionPointsCount };
      }),
    );

    return routesWithCounts;
  }

  async getRoutesWithImageCount(): Promise<any[]> {
    const routes = await this.prisma.route.findMany({
      include: {
        images: true,
        device_routes: {
          include: { device: true },
        },
        _count: {
          select: {
            images: true,
            collection_points: true,
          },
        },
      },
      orderBy: { route_name: 'asc' },
    });

    return routes.map((route) => ({
      ...route,
      image_count: route._count.images,
      collection_points_count: route._count.collection_points,
    }));
  }

  async getRouteStatistics() {
    const [totalRoutes, routesWithDevices, routesWithImages, routesWithCollectionPoints] =
      await Promise.all([
        this.prisma.route.count(),
        this.prisma.route.count({
          where: { device_routes: { some: {} } },
        }),
        this.prisma.route.count({
          where: { images: { some: {} } },
        }),
        this.prisma.route.count({
          where: { collection_points: { some: {} } },
        }),
      ]);

    return {
      total_routes: totalRoutes,
      routes_with_assigned_devices: routesWithDevices,
      routes_with_images: routesWithImages,
      routes_with_collection_points: routesWithCollectionPoints,
      routes_without_devices: totalRoutes - routesWithDevices,
    };
  }
}
