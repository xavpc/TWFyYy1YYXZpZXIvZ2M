export interface CollectionPoints{
    collection_point_id: string;
    collection_point_name: string;
      latitude: number;
      longitude: number;
      route: {
          route_id: string;
          route_name: string;
          center_latitude: number;
          center_longitude: number;
      }
  }