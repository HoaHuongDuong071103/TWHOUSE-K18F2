import { createHash } from 'crypto'
import { config } from 'dotenv'
config()
// tạo 1 hàm nhận vào chuỗi là mã hóa theo chuẩn sha256
// Đây là hàm nhận vào cái gì mã hóa cái đó
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

//hàm nhận vào password và trả về password đã mã hóa
export function hashPassword(passWord: string) {
  return sha256(passWord + process.env.PASSWORD_SECRET)
}
