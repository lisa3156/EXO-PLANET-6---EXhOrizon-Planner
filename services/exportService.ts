
import { ConcertPlan } from '../types';

export const exportToExcel = (plans: ConcertPlan[]) => {
  if (plans.length === 0) {
    alert('没有数据可导出');
    return;
  }

  const excelData = plans.map(plan => {
    // Use nullish coalescing to ensure price is treated as a number
    const totalTicketPrice = plan.tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const totalHotelPrice = plan.hotels.reduce((sum, h) => sum + (h.price || 0), 0);
    // Fix: flightCost is not a property of ConcertPlan; calculate it from flight segments
    const flightCost = [...plan.departureFlights, ...plan.returnFlights].reduce((sum, f) => sum + (f.price || 0), 0);
    
    return {
      '项目名称': plan.concertName,
      '城市': plan.city,
      '场次详情': plan.tickets.map((t, i) => `场次${i+1}: ${t.date} ${t.seat} (¥${t.price})`).join('\n'),
      '门票状态': plan.tickets.every(t => t.status === 'Booked') ? '全部买到' : '部分/全部待买',
      // Fix: FlightSegment does not have a 'detail' property; construct it from flightNo, depAirport, and arrAirport
      '去程航段': plan.departureFlights.map((f, i) => `${i+1}. ${f.flightNo}: ${f.depAirport}->${f.arrAirport} (¥${f.price})`).join('\n'),
      // Fix: FlightSegment does not have a 'detail' property; construct it from flightNo, depAirport, and arrAirport
      '返程航段': plan.returnFlights.map((f, i) => `${i+1}. ${f.flightNo}: ${f.depAirport}->${f.arrAirport} (¥${f.price})`).join('\n'),
      // Fix: Use the calculated flightCost instead of plan.flightCost
      '机票总计': flightCost,
      '住宿详情': plan.hotels.map((h, i) => `${i+1}. ${h.name} (${h.checkIn}~${h.checkOut}) ¥${h.price}`).join('\n'),
      '住宿总计': totalHotelPrice,
      '门票总计': totalTicketPrice,
      // Fix: Use the calculated flightCost for the total budget calculation
      '整个行程总预算': flightCost + totalHotelPrice + totalTicketPrice,
      '记录时间': new Date(plan.createdAt).toLocaleString()
    };
  });

  const wb = (window as any).XLSX.utils.book_new();
  const ws = (window as any).XLSX.utils.json_to_sheet(excelData);

  const colWidths = Object.keys(excelData[0]).map(key => ({
    wch: Math.max(key.length * 2, 15)
  }));
  ws['!cols'] = colWidths;

  (window as any).XLSX.utils.book_append_sheet(wb, ws, "演唱会行程表");
  const fileName = `Concert_Planner_${new Date().toISOString().slice(0, 10)}.xlsx`;
  (window as any).XLSX.writeFile(wb, fileName);
};
