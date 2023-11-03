// cái này là định nghĩa đối tuọng đối tượng cho Users

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enum'

// tại sao toàn là String không vậy là do
// người dùng đưa lên cho mình toàn là chuỗi hong à
export interface resgisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_brith: string
}

export interface loginReqBody {
  email: string
  password: string
}

export interface logoutReqBody {
  refresh_token: string
}

export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenType
}
