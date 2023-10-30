// buổi 29
import { ObjectId } from 'mongodb'
//interface dùng để định nghĩa kiểu dữ liệu
//interface không có thể dùng để tạo ra đối tượng
interface RefreshTokenType {
  _id?: ObjectId //khi tạo cũng k cần, này có sẵn trên MG nên có hay kh cũng oke
  token: string // token này là Refresh nè
  created_at?: Date // k có cũng đc, khi tạo object thì ta sẽ new Date() sau, này của MG lun
  user_id: ObjectId // này trong payLoad nè
}
//class dùng để tạo ra đối tượng
//class sẽ thông qua interface
//thứ tự dùng như sau
//class này < databse < service < controller < route < app.ts < server.ts < index.ts

export default class RefreshToken {
  _id?: ObjectId //khi client gửi lên thì không cần truyền _id
  token: string
  created_at: Date
  user_id: ObjectId
  constructor({ _id, token, created_at, user_id }: RefreshTokenType) {
    this._id = _id // tự có
    this.token = token
    this.created_at = created_at || new Date()
    this.user_id = user_id // này là phải cắp nè
  }
}
