import * as XLSX from 'xlsx';
import { ConcertPlan } from '../types';

// 导出 JSON
export const exportToJSON = (plans: ConcertPlan[]) => {
  const dataStr = JSON.stringify(plans, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `EXhOrizon_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  linkElement.click();
};

// 导出 Excel
export const exportToExcel = (plans: ConcertPlan[]) => {
  if (plans.length === 0) return alert('没有数据可导出');

  const excelData = plans.map(plan => {
    const ticketTotal = plan.tickets.reduce((s, t) => s + (t.price || 0), 0);
    const flightTotal = [...plan.departureFlights, ...plan.returnFlights].reduce((s, f) => s + (f.price || 0), 0);
    const hotelTotal = plan.hotels.reduce((s, h) => s + (h.price || 0), 0);
    const otherTotal = plan.otherExpenses || 0;
    
    return {
      '项目名称': plan.concertName,
      '城市': plan.city,
      '门票详情': plan.tickets.map(t => `${t.date} ${t.seat} (¥${t.price}) - [${t.status}]`).join('\n'),
      '航班安排': [...plan.departureFlights, ...plan.returnFlights].map(f => `${f.flightNo}${f.seatNumber ? ` (座位:${f.seatNumber})` : ''}: ${f.depAirport}->${f.arrAirport} (¥${f.price}) - [${f.status}]`).join('\n'),
      '住宿详情': plan.hotels.map(h => `${h.name} (${h.checkIn}~${h.checkOut}) ¥${h.price} - [${h.status}]`).join('\n'),
      '其他开销': otherTotal,
      '备注信息': plan.remarks || '无',
      '门票总额': ticketTotal,
      '交通总额': flightTotal,
      '住宿总额': hotelTotal,
      '其他开销总额': otherTotal,
      '行程总预算': ticketTotal + flightTotal + hotelTotal + otherTotal,
      '创建时间': new Date(plan.createdAt).toLocaleString()
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // 设置列宽
  ws['!cols'] = [
    { wch: 25 }, // 项目名称
    { wch: 15 }, // 城市
    { wch: 40 }, // 门票详情
    { wch: 50 }, // 航班安排
    { wch: 40 }, // 住宿详情
    { wch: 15 }, // 其他开销
    { wch: 30 }, // 备注信息
    { wch: 12 }, // 门票总额
    { wch: 12 }, // 交通总额
    { wch: 12 }, // 住宿总额
    { wch: 15 }, // 其他开销总额
    { wch: 15 }, // 行程总预算
    { wch: 20 }  // 创建时间
  ];

  XLSX.utils.book_append_sheet(wb, ws, "演唱会行程计划");
  XLSX.writeFile(wb, `EXhOrizon_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// 导入数据处理
export const handleImportFile = (file: File): Promise<ConcertPlan[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isJSON = file.name.endsWith('.json');
    
    reader.onload = (e: any) => {
      try {
        if (isJSON) {
          const data = JSON.parse(e.target.result);
          resolve(Array.isArray(data) ? data : [data]);
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(firstSheet);
          alert('Excel 导入目前仅支持基础数据查看，完整结构建议使用 JSON 导入。');
          resolve([]);
        }
      } catch (err) {
        reject(err);
      }
    };
    
    if (isJSON) reader.readAsText(file);
    else reader.readAsBinaryString(file);
  });
};
