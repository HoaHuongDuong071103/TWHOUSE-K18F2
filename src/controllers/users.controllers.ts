// Controller
import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  TokenPayLoad,
  VerifyEmailReqBody,
  loginReqBody,
  logoutReqBody,
  resgisterReqBody
} from '~/models/requests/user.request'
import User from '~/models/schemas/User.schema copy'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

import { UserVerifyStatus } from '~/constants/enum'
// check đăng nhập
export const loginControler = async (req: Request<ParamsDictionary, any, loginReqBody>, res: Response) => {
  // lấy user_id từ user của req (nãy gửi đó )
  const user = req.user as User // lúc này, đã định nghĩa gòi (video 29)
  const user_id = user._id as ObjectId // đây là đối tượng trên Môngo , đây là đối tượng id

  //---------------------------------------------------------------
  // dùng user_id đó tạo access_token  và refresh_Token
  // nên nhớ nè: cái login này nhận vào id string
  // mà ngay từ đâù mình lấy đối tượng trên MÔngo dìa thì nó là obj
  // nên là muôn sử dụng cái hàm login này thì phải dùng toString để biến
  // đối tượng thành chuỗi mới sử dụng được không là PUG

  const result = await usersService.login(user_id.toString()) // login dùng tạo acc và refresh

  // vì kí access và refresh thì mình cần phải đưa cái userID thì mới kí đc
  // res về access_token và refresh_token cho  client
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

// lúc mà đưa lên thì mình yêu cầu người ta đưa password với email thoi
// ParamsDictionary : định nghĩa Param
// any: định nghĩa cái gòi quà ()response
//resgisterReqBody: đây là cái mình sẽ định nghiax nè
// không cần try catch luôn vì nó đã được bộc bơir Wrap function
export const resgisterController = async (req: Request<ParamsDictionary, any, resgisterReqBody>, res: Response) => {
  // chỗ này khi mà mình đăng nhập á
  // mặc dù mình có đưa lên tên và các thuộc tính khác
  // nhưng mà nó không có nhận (nó chỉ nhận email và password mà thoi)
  // nhưng mà mình muốn nó đưa lên những thuộc tính khác, nên là mình phải định nghĩa nó (định nghĩa nó trong folder Req)
  ///const { email, password } = req.body

  // insetOne là 1 cái hàm(nhét lên db) của Môngo cung cấp: trả về promise
  // usersService dùng hàm register của bên kia truyền vào parametor
  // gòi trả ra kết quả

  const result = await usersService.register(req.body)

  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

//------ Đăng xuất (Buổi 30)
// req truy cập tới đây là ngon  gòi
export const logoutController = async (req: Request<ParamsDictionary, any, logoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  // nếu mà code vào được đây nghĩa là cái emai_verify_token đã họp lệ
  // và mình đã lấy được cái decode  email_verify_token (payLoad)
  //
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad
  // dựa vào user_id tìm user và xem thử nó đã verify chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // nếu mà tìm không thấy thì có lỗi
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  // ở đây dùng để ngắn chặn người dùng email verify cũ đòi verify lại
  // nếu mà không khớp
  //                              Do mình đã sử dụng body của request như vầy nên mình phải định nghĩa lại
  if (user.email_verify_token !== (req.body.email_verify_token as string)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  //----------------------------------------
  //
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    //------------------------------------------------------------
    // nêu mà tìm được thì báo là tìm đuocnw
    // nếu như mà cái verify này bằng 1
    // nếu mà đúng mà verify bằng 1
    // và không  được bị ban

    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFY_BEFORE
    })
  }
  //------------------------------------
  // coi lại nha 1h30
  //nêú mà xuống được đây có nghãi là user chưa verify
  // mình sẽ update lại user đó
  // update cho verify bằng 1
  //
  const result = await usersService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

// Quên mk (Buổi 30)
// do cái này nó kh có body mà nó chỉ có cái header thôi nên mình kh cânf đnhj nghĩa nó
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // nếu vào được đây thì có nghĩa là access hợp lệ
  // và mình đã lấy được decode_authorization (payLoad này chắc chắn sẽ có userID)
  // mình dùng cái userID đó tồn tại hong
  const { user_id } = req.decode_authorization as TokenPayLoad
  // dựa vào user_id tìm user và xem thử nó đã verify chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // nếu mà tìm không thấy thì có lỗi
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  //------------------------------------------------------------
  // nêu mà tìm được thì báo là tìm đuocnw
  // nếu như mà cái verify này bằng 1
  // nếu mà đúng mà verify bằng 1
  // và không  được bị ban

  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFY_BEFORE
    })
  }
  // bị Ban nè
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN // FORBIDDEN kh được sử dungj dịch vụ
    })
  }
  // còn nếu mà xuống được tận đây thì
  // user này chưa thật sự verify
  // mình sẽ tạo lại email_verify_token
  // cập nhật lại user
  const resutl = await usersService.resendEmailVerify(user_id)
  return res.json(resutl)
}

// forgotPassWord Controller
export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  // đến được đây là biết bạn là ai gòi, nên chỉ cần cầm cái _id này
  // cập nhật cái forgot password cho bạn
  const { _id } = req.user as User
  // dùng _id tìm va cập nhật lại user thêm vào forgot_password_token
  // _id có thể là undefined nên mình đinhj nghĩa là obj
  // gòi ép kiểu thành string
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}

// nếu bị sai ha gì thì đã được sử lý ở Midd gòi nhe
export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
