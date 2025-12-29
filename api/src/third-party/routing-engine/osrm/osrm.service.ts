import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OsrmService {
  private OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

  async getRoute(start: [number, number], end: [number, number]) {
    const url = `${this.OSRM_URL}/${start.join(',')};${end.join(',')}?overview=full&geometries=geojson`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`OSRM request failed: ${error.message}`);
    }
  }
}
