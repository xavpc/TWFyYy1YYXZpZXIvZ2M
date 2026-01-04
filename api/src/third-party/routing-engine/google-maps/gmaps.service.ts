import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import axios from 'axios';

config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});

function decodePolyline(encoded: string): [number, number][] {
  let index = 0, lat = 0, lng = 0, coordinates: [number, number][] = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

@Injectable()
export class GmapsRoutingService {
  private GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GMAPS_API_KEY;

  async getRoute(
    origin: [number, number],
    destination: [number, number],
    waypoints?: [number, number][]
  ) {
    const originStr = `${origin[0]},${origin[1]}`;
    const destStr = `${destination[0]},${destination[1]}`;

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=driving&key=${this.GOOGLE_MAPS_API_KEY}`;

    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    try {
      const response = await axios.get(url);
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const encoded = response.data.routes[0].overview_polyline.points;
      const decodedPoints = decodePolyline(encoded);
      const coordinates = decodedPoints.map(([lat, lng]) => ({ lat, lng }));

      return { coordinates };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', {
          message: error.message,
          response: error.response?.data,
        });
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }
}
