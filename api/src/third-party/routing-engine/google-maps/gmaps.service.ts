import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import axios from 'axios';

config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});

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
    
    // Add waypoints if provided
    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints
        .map(wp => `${wp[0]},${wp[1]}`)
        .join('|');
      url += `&waypoints=optimize:true|${waypointsStr}`;
    }

    try {
      const response = await axios.get(url);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }
      
      return {
        polyline: response.data.routes?.[0]?.overview_polyline?.points,
        waypoint_order: response.data.routes?.[0]?.waypoint_order ?? [],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Google Maps API Error:', {
          message: error.message,
          response: error.response?.data,
          url,
        });
        throw new Error(`Google Maps request failed: ${error.message}`);
      }
      throw error;
    }
  }
}