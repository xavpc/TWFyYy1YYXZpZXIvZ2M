import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Route } from './route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterRouteDto } from './dto/filter-route.dto';
import { Logger } from '@nestjs/common';
import { CollectionPoints } from '../collection-points/collection-points.entity';
import { DeviceRoute } from '../device-route/device-route.entity';

@Injectable()
export class RouteService {
  // private readonly logger = new Logger(RouteService.name);
  
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(CollectionPoints)
    private collectionPointsRepository: Repository<CollectionPoints>,
    @InjectRepository(DeviceRoute)
    private deviceRoutesRepository: Repository<DeviceRoute>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const existingRouteName = await this.routeRepository.findOne({
      where: { route_name: createRouteDto.route_name }
    });
    
    if (existingRouteName) {
      throw new ConflictException(
        `route name: '${createRouteDto.route_name}' already exists`
      );
    }
    const route = this.routeRepository.create(createRouteDto);
    return this.routeRepository.save(route);
  }

  async findAll(filterDto?: FilterRouteDto): Promise<{ data: Route[], total: number }> {
    if (!filterDto) {
      const data = await this.routeRepository.find({
        relations: ['images', 'deviceRoutes', 'deviceRoutes.device'],
        order: { route_name: 'ASC' }
      });
      
      // Add collection points count for each route
      const dataWithCounts = await Promise.all(
        data.map(async (route) => {
          const collectionPointsCount = await this.collectionPointsRepository.count({
            where: { route: { route_id: route.route_id } }
          });

          const devicesCount = await this.deviceRoutesRepository.count({
            where: { route: { route_id: route.route_id } }
          });
          
          return {
            ...route,
            collection_points_count: collectionPointsCount,
            devices_count: devicesCount

          };
        })
      );
      
      return { data: dataWithCounts, total: dataWithCounts.length };
    }

    const {
      route_name,
      search,
      page = 1,
      limit = 10,
      sort_by = 'route_name',
      sort_order = 'updated_at',
    } = filterDto;

    const skip = (page - 1) * limit;
    let where: FindOptionsWhere<Route> | FindOptionsWhere<Route>[] = {};
    

    // Handle global search
    if (search) {
      const searchConditions: FindOptionsWhere<Route>[] = [
        { route_name: ILike(`%${search}%`) },
        { route_id: ILike(`%${search}%`) },
        // Search through related device information
        { deviceRoutes: { device: { device_name: ILike(`%${search}%`) } } },
        { deviceRoutes: { device: { vehicle_plate_num: ILike(`%${search}%`) } } },
        { deviceRoutes: { device: { employee: { first_name: ILike(`%${search}%`) } } } },
        { deviceRoutes: { device: { employee: { last_name: ILike(`%${search}%`) } } } }
      ];

      // Combine search conditions with additional filters
      where = searchConditions.map(condition => {
        const combinedCondition = { ...condition };
        
        // Apply route name filter
        if (route_name && !combinedCondition.route_name) {
          combinedCondition.route_name = ILike(`%${route_name}%`);
        }
        
        return combinedCondition;
      });
    } else {
      // Handle individual field filters when no global search
      const whereCondition: FindOptionsWhere<Route> = {};

      if (route_name) {
        whereCondition.route_name = ILike(`%${route_name}%`);
      }

      where = whereCondition;
    }

    // Get total count
    const total = await this.routeRepository.count({ 
      where,
    });

    // Get paginated data with sorting
    const data = await this.routeRepository.find({
      where,
      skip,
      take: limit,
      order: {
        [sort_by]: sort_order,
      },
    });

    // Add collection points count for each route
    const dataWithCounts = await Promise.all(
      data.map(async (route) => {
        const collectionPointsCount = await this.collectionPointsRepository.count({
          where: { route: { route_id: route.route_id } }
        });

        const devicesCount = await this.deviceRoutesRepository.count({
          where: { route: { route_id: route.route_id } }
        });
        
        return {
          ...route,
          collection_points_count: collectionPointsCount,
          devices_count: devicesCount

        };
      })
    );

    return { data: dataWithCounts, total };
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routeRepository.findOne({ 
      where: { route_id: id },
      relations: ['images', 'deviceRoutes', 'deviceRoutes.device', 'deviceRoutes.device.employee']
    });
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    const collectionPointsCount = await this.collectionPointsRepository.count({
      where: { route: { route_id: route.route_id } }
    });

    return {
      ...route,
      collection_points_count: collectionPointsCount
    } as Route;
  }

  async findByName(routeName: string): Promise<Route> {
    const route = await this.routeRepository.findOne({ 
      where: { route_name: routeName },
      relations: ['images', 'deviceRoutes', 'deviceRoutes.device']
    });
    if (!route) {
      throw new NotFoundException(`Route with name ${routeName} not found`);
    }

    // Add collection points count
    const collectionPointsCount = await this.collectionPointsRepository.count({
      where: { route: { route_id: route.route_id } }
    });

    return {
      ...route,
      collection_points_count: collectionPointsCount
    } as Route;
  }
  
  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);
    
    // Check for route name conflict if updating route_name
    if (updateRouteDto.route_name && updateRouteDto.route_name !== route.route_name) {
      const existingRoute = await this.routeRepository.findOne({
        where: { route_name: updateRouteDto.route_name }
      });
      
      if (existingRoute) {
        throw new ConflictException(
          `Route name: '${updateRouteDto.route_name}' already exists`
        );
      }
    }
    
    Object.assign(route, updateRouteDto);
    return this.routeRepository.save(route);
  }

  async remove(id: string): Promise<void> {
    const result = await this.routeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
  }

  // Enhanced search methods
  async globalSearch(searchTerm: string): Promise<Route[]> {
    const where: FindOptionsWhere<Route>[] = [
      { route_name: ILike(`%${searchTerm}%`) },
      { route_id: ILike(`%${searchTerm}%`) },
      // Search through assigned devices
      { deviceRoutes: { device: { device_name: ILike(`%${searchTerm}%`) } } },
      { deviceRoutes: { device: { vehicle_plate_num: ILike(`%${searchTerm}%`) } } },
      { deviceRoutes: { device: { device_id: ILike(`%${searchTerm}%`) } } },
      // Search through device employees
      { deviceRoutes: { device: { employee: { first_name: ILike(`%${searchTerm}%`) } } } },
      { deviceRoutes: { device: { employee: { last_name: ILike(`%${searchTerm}%`) } } } },
      { deviceRoutes: { device: { employee: { email: ILike(`%${searchTerm}%`) } } } }
    ];

    const results = await this.routeRepository.find({
      where,
      relations: ['images', 'deviceRoutes', 'deviceRoutes.device', 'deviceRoutes.device.employee'],
      order: {
        route_name: 'ASC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No routes found matching '${searchTerm}'`);
    }

    // Add collection points count for each route
    const resultsWithCounts = await Promise.all(
      results.map(async (route) => {
        const collectionPointsCount = await this.collectionPointsRepository.count({
          where: { route: { route_id: route.route_id } }
        });
        
        return {
          ...route,
          collection_points_count: collectionPointsCount
        };
      })
    );

    return resultsWithCounts;
  }

  async searchByField(field: keyof Pick<Route, 'route_name' | 'route_id'>, value: string): Promise<Route[]> {
    const validSearchFields: (keyof Pick<Route, 'route_name' | 'route_id'>)[] = [
      'route_name',
      'route_id'
    ];

    if (!validSearchFields.includes(field)) {
      throw new NotFoundException(`Field ${field} is not a valid searchable field`);
    }

    const where: FindOptionsWhere<Route> = {
      [field]: ILike(`%${value}%`)
    };

    const results = await this.routeRepository.find({
      where,
      relations: ['images', 'deviceRoutes', 'deviceRoutes.device'],
      order: {
        route_name: 'ASC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No routes found matching ${field}: ${value}`);
    }

    // Add collection points count for each route
    const resultsWithCounts = await Promise.all(
      results.map(async (route) => {
        const collectionPointsCount = await this.collectionPointsRepository.count({
          where: { route: { route_id: route.route_id } }
        });
        
        return {
          ...route,
          collection_points_count: collectionPointsCount
        };
      })
    );

    return resultsWithCounts;
  }

  async findByCoordinateRange(
    minLat: number, 
    maxLat: number, 
    minLng: number, 
    maxLng: number
  ): Promise<Route[]> {
    const routes = await this.routeRepository
      .createQueryBuilder('route')
      .where('route.center_latitude BETWEEN :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('route.center_longitude BETWEEN :minLng AND :maxLng', { minLng, maxLng })
      .leftJoinAndSelect('route.images', 'images')
      .leftJoinAndSelect('route.deviceRoutes', 'deviceRoutes')
      .leftJoinAndSelect('deviceRoutes.device', 'device')
      .orderBy('route.route_name', 'ASC')
      .getMany();

    if (routes.length === 0) {
      throw new NotFoundException(
        `No routes found within coordinate range: (${minLat}, ${minLng}) to (${maxLat}, ${maxLng})`
      );
    }

    // Add collection points count for each route
    const routesWithCounts = await Promise.all(
      routes.map(async (route) => {
        const collectionPointsCount = await this.collectionPointsRepository.count({
          where: { route: { route_id: route.route_id } }
        });
        
        return {
          ...route,
          collection_points_count: collectionPointsCount
        };
      })
    );

    return routesWithCounts;
  }

  async findByAssignedDevice(deviceId: string): Promise<Route[]> {
    const routes = await this.routeRepository.find({
      where: { 
        deviceRoutes: { 
          device: { device_id: deviceId } 
        } 
      },
      relations: ['images', 'deviceRoutes', 'deviceRoutes.device', 'deviceRoutes.device.employee'],
      order: { route_name: 'ASC' }
    });

    if (routes.length === 0) {
      throw new NotFoundException(`No routes found for device ID: ${deviceId}`);
    }

    // Add collection points count for each route
    const routesWithCounts = await Promise.all(
      routes.map(async (route) => {
        const collectionPointsCount = await this.collectionPointsRepository.count({
          where: { route: { route_id: route.route_id } }
        });
        
        return {
          ...route,
          collection_points_count: collectionPointsCount
        };
      })
    );

    return routesWithCounts;
  }

  async findByDay(day: string): Promise<Route[]> {
    const routes = await this.routeRepository.find({
      where: { 
        deviceRoutes: { 
          day_assigned: day as any
        } 
      },
      relations: ['images', 'deviceRoutes', 'deviceRoutes.device', 'deviceRoutes.device.employee'],
      order: { route_name: 'ASC' }
    });

    if (routes.length === 0) {
      throw new NotFoundException(`No routes found assigned for ${day}`);
    }

    // Add collection points count for each route
    const routesWithCounts = await Promise.all(
      routes.map(async (route) => {
        const collectionPointsCount = await this.collectionPointsRepository.count({
          where: { route: { route_id: route.route_id } }
        });
        
        return {
          ...route,
          collection_points_count: collectionPointsCount
        };
      })
    );

    return routesWithCounts;
  }

  async getRoutesWithImageCount(): Promise<Array<Route & { image_count: number }>> {
    const routes = await this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.images', 'images')
      .leftJoinAndSelect('route.deviceRoutes', 'deviceRoutes')
      .leftJoinAndSelect('deviceRoutes.device', 'device')
      .loadRelationCountAndMap('route.image_count', 'route.images')
      .loadRelationCountAndMap('route.collection_points_count', 'route.collection_points')
      .orderBy('route.route_name', 'ASC')
      .getMany();

    return routes as Array<Route & { image_count: number; collection_points_count: number }>;
  }

  async getRouteStatistics() {
    const totalRoutes = await this.routeRepository.count();
    
    const routesWithDevices = await this.routeRepository
      .createQueryBuilder('route')
      .innerJoin('route.deviceRoutes', 'deviceRoutes')
      .getCount();
    
    const routesWithImages = await this.routeRepository
      .createQueryBuilder('route')
      .innerJoin('route.images', 'images')
      .getCount();

    const routesWithCollectionPoints = await this.routeRepository
      .createQueryBuilder('route')
      .innerJoin('route.collection_points', 'collection_points')
      .getCount();

    return {
      total_routes: totalRoutes,
      routes_with_assigned_devices: routesWithDevices,
      routes_with_images: routesWithImages,
      routes_with_collection_points: routesWithCollectionPoints,
      routes_without_devices: totalRoutes - routesWithDevices
    };
  }
}