import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import axios from 'axios';

config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});

@Injectable()
export class GmapsService {
  private GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GMAPS_API_KEY; 
  
  async getRoute(start: [number, number], end: [number, number]) {
    const startCoord = `${start[0]},${start[1]}`;
    const endCoord = `${end[0]},${end[1]}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoord}&destination=${endCoord}&mode=driving&key=${this.GOOGLE_MAPS_API_KEY}`;

    console.log('Google Maps Directions API URL:', url);

    try {
      const response = await axios.get(url);
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }
      return response.data;
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

  async getNearestRoad(coordinate: [number, number], numberOfResults = 1): Promise<any> {
    const latlng = `${coordinate[0]},${coordinate[1]}`;
    const url = `https://roads.googleapis.com/v1/nearestRoads?points=${latlng}&key=${this.GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);
      const snappedPoints = response.data.snappedPoints || [];

      return numberOfResults === 1
        ? snappedPoints[0] || null
        : snappedPoints.slice(0, numberOfResults);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Google Roads API Error:', {
          message: error.message,
          response: error.response?.data,
          url,
        });
        throw new Error(`Google Roads API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getSnappedPath(coordinates: [number, number][]): Promise<any> {
    // Roads API can handle up to 100 points per request
    const chunks = this.chunkArray(coordinates, 100);
    let allSnappedPoints: any[] = [];
    
    for (const chunk of chunks) {
      const points = chunk.map(coord => `${coord[0]},${coord[1]}`).join('|');
      const url = `https://roads.googleapis.com/v1/snapToRoads?path=${points}&interpolate=true&key=${this.GOOGLE_MAPS_API_KEY}`;
      
      try {
        const response = await axios.get(url);
        if (response.data.snappedPoints) {
          allSnappedPoints.push(...response.data.snappedPoints);
        }
      } catch (error) {
        console.error('Roads API Error:', error);
        throw error;
      }
    }
    
    return { snappedPoints: allSnappedPoints };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
