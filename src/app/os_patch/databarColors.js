// กำหนดสีให้ตรงกับสถานะของ Patch (คุมโทนเดียวกับกล่อง Summary)
export const patchStatusColors = {
  "Installed": "bg-green-600",   // สำเร็จ = สีเขียว
  "Manual": "bg-orange-600",     // รอดำเนินการเอง = สีส้ม
  "Approved": "bg-purple-600",   // อนุมัติแล้ว = สีม่วง
  "Rejected": "bg-red-600",      // ปฏิเสธ/ล้มเหลว = สีแดง
};