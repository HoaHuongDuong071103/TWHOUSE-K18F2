// hamf này chỉ nhận vào 1 cái Request handler
// và nó chỉ nhận async thui nhe , do nuee hàm

import { RequestHandler, Request, Response, NextFunction } from 'express'

//---------------------------------------
// Buổi 31 (6p cuối)
// hàm bình thường thì làm gì có lỗi
//đây là kiểu dùng generic là định nghĩa là cho mày là <P>
// mà <P> là gì t déo béc , sau này cứ thằng nào là lạ thì coi nó là <P>
// <P> đặt tên khác cũng được
export const wrapAsync = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    // taoj ra cấu trúc try catch
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
