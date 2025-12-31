import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OsrmService {
  private OSRM_URL = 'https://17fc-2405-8d40-4cc1-c7e0-86e4-8e63-459a-f171.ngrok-free.app';

  async getRoute(start: [number, number], end: [number, number]) {
    const startCoord = `${start[1]},${start[0]}`;
    const endCoord = `${end[1]},${end[0]}`;
    
    const url = `${this.OSRM_URL}/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson`;
    
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

  async getNearestRoad(coordinate: [number, number], numberOfResults: number = 1) {
    const coord = `${coordinate[1]},${coordinate[0]}`;
    
    const url = `${this.OSRM_URL}/nearest/v1/driving/${coord}?number=${numberOfResults}`;
    
    console.log('OSRM Nearest Request URL:', url);
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('OSRM Nearest Error Details:', {
          message: error.message,
          response: error.response?.data,
          url: url
        });
        throw new Error(`OSRM nearest request failed: ${error.message}. Response: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
}