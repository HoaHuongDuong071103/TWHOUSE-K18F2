// Controller
import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { resgisterReqBody } from '~/models/schemas/request/user.request'
// check đăng nhập
export const loginControler = (req: Request, res: Response) => {
  const { email, password } = req.body

  // check thử email và password có trong db hong có thì quằng ra-
  // do khoong co db nen minh fit cung de test thui
  if (email === 'test@gmail.com' && password === '123456') {
    return res.json({
      message: 'Login successful', // login thông báo cho người dùng thành công
      result: [
        { name: 'Điệp', yob: 1999 },
        { name: 'Hùng', yob: 2004 },
        { name: 'Được', yob: 1994 }
      ]
    })
  }
  return res.status(400).json({
    err: 'login failer'
  })
}

// lúc mà đưa lên thì mình yêu cầu người ta đưa password với email thoi
// ParamsDictionary : định nghĩa Param
// any: định nghĩa cái gòi quà
//resgisterReqBody: đây là cái mình sẽ định nghiax nè
export const resgisterController = async (req: Request<ParamsDictionary, any, resgisterReqBody>, res: Response) => {
  // chỗ này khi mà mình đăng nhập á
  // mặc dù mình có đưa lên tên và các thuộc tính khác
  // nhưng mà nó không có nhận (nó chỉ nhận email và password mà thoi)
  // nhưng mà mình muốn nó đưa lên, nên là mình phải định nghĩa nó (định nghĩa nó trong folder Req)
  ///const { email, password } = req.body
  try {
    // insetOne là 1 cái hàm(nhét lên db) của Môngo cung cấp: trả về promise
    // usersService dùng hàm register của bên kia truyền vào parametor
    // gòi trả ra kết quả
    const result = await usersService.register(req.body)

    res.json({
      message: 'register successfully',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'register failed',
      error
    })
  }
}
