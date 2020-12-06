export interface main {
    feels_like: number;
    humidity: number;
    pressure: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  }
  
export interface weather {
    description: string;
    icon: string;
    id: number;
    main: string;
  }
  
export interface sys {
    country: string;
    id: number;
    sunrise: number;
    sunset: number;
    type: number;
  }
  
export default interface weatherResponse {
    base: string;
    clouds: object;
    cod: number;
    coord: {
      lat: number;
      lon: number;
    };
    dt: number;
    id: number;
    main: main;
    name: string;
    sys: sys;
    timezone: number;
    visibility: number;
    weather: weather[];
    wind: {
      deg: number;
      speed: number;
    };
  }

export interface mockResponse {
  dt: number,
  main: { temp: number },
  cod: number
}