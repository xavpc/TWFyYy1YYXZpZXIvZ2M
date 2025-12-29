import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OsrmService {
  private OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

  async getRoute(start: [number, number], end: [number, number]) {
    const startCoord = `${start[1]},${start[0]}`; 
    const endCoord = `${end[1]},${end[0]}`;
    
    const url = `${this.OSRM_URL}/${startCoord};${endCoord}?overview=full&geometries=geojson`;
    
    console.log('OSRM Request URL:', url);

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('OSRM Error Details:', {
          message: error.message,
          response: error.response?.data,
          url: url
        });
        throw new Error(`OSRM request failed: ${error.message}. Response: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
}