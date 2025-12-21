export interface RouteName {
  route_id: string
  route_name: string
}

export interface RouteData {
  route_coordinates_id?: string
  latitude?: number
  longitude?: number
  sequence?: number
  route: RouteName
}
