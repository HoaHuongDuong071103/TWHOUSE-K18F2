// Buoi 29
// file này dùng để định nghĩa lại Req truyền lên từ client
// mình sẽ định nghĩa lại cái thằng user bên trong req để nó khỏi any

import { Request } from 'express'
import User from './models/schemas/User.schema copy'
import { TokenPayLoad } from './models/requests/user.request'
// định nghĩa lại Request
declare module 'express' {
  interface Request {
    user?: User // định nghĩa nè: có dấu chấm hỏi
    // trong 1 cái req có thể có hoặc là không có User

    // định nghĩa thêm
    decode_authorization?: TokenPayLoad
    decode_refresh_token?: TokenPayLoad
    decoded_email_verify_token?: TokenPayLoad
    decoded_forgot_password_token?: TokenPayLoad
  }
}
