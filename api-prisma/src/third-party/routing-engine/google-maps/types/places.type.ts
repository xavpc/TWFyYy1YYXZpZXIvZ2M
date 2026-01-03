// Add this new interface
export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  photos?: string[];
}

export interface PlacesSearchResponse {
  results: PlaceSearchResult[];
  status: string;
}
