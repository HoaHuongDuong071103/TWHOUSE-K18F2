// Controller
import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayLoad, loginReqBody, logoutReqBody, resgisterReqBody } from '~/models/requests/user.request'
import User from '~/models/schemas/User.schema copy'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { verify } from 'crypto'
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
  // nhưng mà mình muốn nó đưa lên, nên là mình phải định nghĩa nó (định nghĩa nó trong folder Req)
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

//------ Đăng xuất
// req truy cập tới đây là ngon  gòi
export const logoutController = async (req: Request<ParamsDictionary, any, logoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (req: Request, res: Response) => {
  // nếu mà code vào được đây nghĩa là cái emai_verify_token đã họp lệ
  // và mình đã lấy được cái decode  email_verify_token (payLoad)
  //
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad
  // dựa vào user_id tìm user và xem thử nó đã verify chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // nếu mà tìm không thấy thì có lỗi
  if (user == null) {
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
