// thằng Schema được dùng để mô tả Obj,khi mà lấy dữ liệu từ server dìa
// thằng js nó hong hiểu thằng đó là gì nên nó cần SChema để
// mô tả cái obj có những thuộc tính gì để ts có dễ dàng sử dụng thuộct tính đó

//Mình sẽ có cái thằng Interface cung cấp uesẻr có những cái
// gì để mô tả

// lúc mô tả thì có thể không đủ
// nhưng lúc đưa lên db thì cần đủ

import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

//đặt interface vì theo chuẩn ts thôi, chứ làm thực tế thì khác
interface UserType {
  // mục đích của interface dùng để mô tả obj
  _id?: ObjectId
  name: string // required
  email: string
  date_of_birth?: Date
  password: string
  created_at?: Date //optinal là ?
  updated_at?: Date //lúc mới tạo chưa có gì thì nên cho bằng create_at
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus //optinal là ?

  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

// tạo obj
export default class User {
  _id?: ObjectId // mongo nó sẽ tự cung cấp cho minh
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus

  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string
  constructor(user: UserType) {
    // định nghĩa lại obj từ interface
    const date = new Date() //tạo này cho ngày created_at updated_at bằng nhau
    this._id = user._id || new ObjectId() // tự tạo id
    this.name = user.name || '' // nếu người dùng tạo mà k truyền ta sẽ để rỗng
    this.email = user.email
    this.date_of_birth = user.date_of_birth || new Date()
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified

    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}
