
export type BookingStatus = 'Pending' | 'Booked';

export interface TicketItem {
  id: string;
  date: string;
  seat: string;
  price: number;
  status: BookingStatus;
}

export interface FlightSegment {
  id: string;
  flightNo: string;    // 航班号
  depAirport: string;  // 起飞机场
  arrAirport: string;  // 到达机场
  depTime: string;     // 起飞时间 (YYYY-MM-DD HH:mm)
  arrTime: string;     // 到达时间
  price: number;       // 该航段价格
  status: BookingStatus; // 新增条目状态
}

export interface HotelItem {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  price: number;
  status: BookingStatus; // 新增条目状态
}

export interface ConcertPlan {
  id: string;
  concertName: string;
  city: string;
  
  tickets: TicketItem[];
  departureFlights: FlightSegment[];
  returnFlights: FlightSegment[];
  hotels: HotelItem[];
  
  // 以下两个字段保留兼容性或可根据子项逻辑聚合，但本版本移至子项管理
  flightStatus: BookingStatus; 
  hotelStatus: BookingStatus;
  
  remarks: string;
  createdAt: number;
}

export type SortField = 'concertName' | 'city' | 'createdAt' | 'totalCost';
export type SortOrder = 'asc' | 'desc';
