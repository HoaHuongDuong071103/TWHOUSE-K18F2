// hamf này chỉ nhận vào 1 cái Request handler
// và nó chỉ nhận async thui nhe , do nuee hàm

import { RequestHandler, Request, Response, NextFunction } from 'express'

// hàm bình thường thì làm gì có lỗi
export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // taoj ra cấu trúc try catch
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
