import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  private GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Use a more standard name

  async getRoute(
    origin: [number, number],
    destination: [number, number],
    waypoints?: [number, number][]
  ) {
    if (!this.GOOGLE_MAPS_API_KEY) {
      // Fail early if the key is not configured
      console.error('FATAL: GOOGLE_MAPS_API_KEY is not defined in environment variables.');
      throw new InternalServerErrorException('Server configuration error: API key is missing.');
    }

    const originStr = `${origin[0]},${origin[1]}`;
    const destStr = `${destination[0]},${destination[1]}`;

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=driving&key=${this.GOOGLE_MAPS_API_KEY}`;

    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    try {
      const response = await axios.get(url);

      // **MODIFIED: More detailed error checking**
      if (response.data.status !== 'OK') {
        // Log the detailed error message from Google for debugging
        console.error(`Google Maps API returned non-OK status: ${response.data.status}`, {
          error_message: response.data.error_message,
        });
        // Throw an error that includes the status code from Google
        const error = new Error(response.data.error_message || `Google Maps API error: ${response.data.status}`);
        // Attach the status code to the error object for the controller to use
        error['gmaps_status'] = response.data.status;
        throw error;
      }

      if (!response.data.routes || response.data.routes.length === 0) {
        // This case is usually covered by ZERO_RESULTS, but it's good practice to check
        const error = new Error('No routes found between the specified locations.');
        error['gmaps_status'] = 'ZERO_RESULTS';
        throw error;
      }

      const encoded = response.data.routes[0].overview_polyline.points;
      const decodedPoints = decodePolyline(encoded);
      const coordinates = decodedPoints.map(([lat, lng]) => ({ lat, lng }));

      return { coordinates };

    } catch (error) {
      // Re-throw the error so the controller can handle it
      // No need to check for axios error here, we let the controller do the final handling
      throw error;
    }
  }
}