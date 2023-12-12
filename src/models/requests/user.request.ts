// cái này là định nghĩa đối tuọng đối tượng cho Users

import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'
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

// 1 cái payLoad lúc này sẽ có thêm verify do mình truyền vào như bên kia
// nên mình phải định nghĩa (Buổi 31 như ở trong )
export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus // chỗ này định nghĩa lại èn (Buổi 31(video chữa tắt tiếng (1p cuối)))
  exp: number
  iat: number
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ResetPassowrdReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

// thằng này định nghĩa body được truyền lên cái gì
export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string //vì ngta truyền lên string dạng ISO8601, k phải date
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}

export interface FollowReqBody {
  followed_user_id: string
}

// do đây là param nên mình dùng extends để định nghĩa nó (param)
// nếu mà sử dụng cho query thì định nghĩa nó nghen
export interface UnfollowReqParams extends ParamsDictionary {
  user_id: string
}

export interface ChanePasswordReqBody {
  old_password: string
  // thằng này password mới nè
  password: string
  confirm_password: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}
