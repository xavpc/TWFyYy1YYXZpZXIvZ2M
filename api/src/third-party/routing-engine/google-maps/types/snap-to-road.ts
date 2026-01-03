export interface SnapToRoadsRequest {
  coordinates: { lat: number; lng: number }[];
}

export interface SnapToRoadsResponse {
  snappedPoints: { lat: number; lng: number }[];
}