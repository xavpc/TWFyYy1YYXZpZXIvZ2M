import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { config } from 'dotenv';
import axios from 'axios';
import { PlaceSearchResult, PlacesSearchResponse } from './types/places.type';
import { SnapToRoadsResponse } from './types/snap-to-road';

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

  async searchPlaces(
    query: string,
    location?: [number, number],
    radius?: number,
    type?: string
  ): Promise<PlacesSearchResponse> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.error('FATAL: GOOGLE_MAPS_API_KEY is not defined in environment variables.');
      throw new InternalServerErrorException('Server configuration error: API key is missing.');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.GOOGLE_MAPS_API_KEY}`;

    // Add location bias if provided
    if (location && location.length === 2) {
      url += `&location=${location[0]},${location[1]}`;

      // Add radius if location is provided (default 50km)
      const searchRadius = radius || 50000;
      url += `&radius=${searchRadius}`;
    }

    // Add place type filter if provided
    if (type) {
      url += `&type=${type}`;
    }

    try {
      const response = await axios.get(url);

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error(`Google Places API returned non-OK status: ${response.data.status}`, {
          error_message: response.data.error_message,
        });
        const error = new Error(response.data.error_message || `Google Places API error: ${response.data.status}`);
        error['gmaps_status'] = response.data.status;
        throw error;
      }

      // Transform the response to match our interface
      const results: PlaceSearchResult[] = (response.data.results || []).map(place => ({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          }
        },
        types: place.types || [],
        rating: place.rating,
        photos: place.photos ? place.photos.map(photo => photo.photo_reference) : []
      }));

      return {
        results,
        status: response.data.status
      };

    } catch (error) {
      throw error;
    }
  }

  async snapToRoads(coordinates: { lat: number; lng: number }[]): Promise<SnapToRoadsResponse> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.error('FATAL: GOOGLE_MAPS_API_KEY is not defined in environment variables.');
      throw new InternalServerErrorException('Server configuration error: API key is missing.');
    }

    if (!coordinates || coordinates.length === 0) {
      throw new Error('Coordinates array cannot be empty');
    }

    // Convert coordinates to the format Google Roads API expects
    const pathString = coordinates
      .map(coord => `${coord.lat},${coord.lng}`)
      .join('|');

    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${pathString}&interpolate=true&key=${this.GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);

      if (response.status !== 200) {
        console.error(`Google Roads API returned status: ${response.status}`, {
          error: response.data,
        });
        throw new Error(`Google Roads API error: ${response.status}`);
      }

      // Transform the response to match our interface
      const snappedPoints = (response.data.snappedPoints || []).map(point => ({
        lat: point.location.latitude,
        lng: point.location.longitude
      }));

      return { snappedPoints };

    } catch (error) {
      console.error('Error calling Google Roads API:', error.message);
      throw error;
    }
  }
}