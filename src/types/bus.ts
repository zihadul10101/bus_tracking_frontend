export interface Driver {
  name: string;
  mobile: string;
}

export interface StopTime {
  stop: string;
  time: string;
}

export interface Trip {
  _id: string;
  tripTitle: string;
  days: string[];
  from: StopTime;
  to: StopTime;
  stops?: string[];
  status?: 'running' | 'future' | 'completed' | 'upcoming';
  driver?: Driver | null;
}

export interface Bus {
  _id: string;
  busNo: string;
  busName: string;
  driverId?: string | object;
  trips: Trip[];
  createdAt?: string;
}