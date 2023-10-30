// đây là nơi xử lý lỗi tổng
import express, { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('error handle  tôngr  nè')
  // lỗi từ các lỗi sẽ đổ về đây, và không thể nào tránh được
  // cái lỗi mà không có status nên là mình dùng Http___ (500)
  // chỗ này các lỗi quẳng ra đều lấy status và message
  //-------------------------------------------------------------
  // lỗi ErrorwithStatus là lỗi do mình tạo ra
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  //----------------------------------
  // video buổi 29
  // nếu lỗi xuống được đây thì nghĩa là lỗi mặc định (new Error)
  // set cái name, stack, mess và enumerable true
  // tại sao dùng forEach
  // cái hàm getOwnPropertyNames: này nó giúp lấy ra các enumerable true và false lun
  // (trong cả message, name, stack)
  // nêú mà mình for in nó duyệt key thui, và thằng này không duyệt được
  // những thằng có enumerable là false
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  // không nên ném nguyên cục lỗi đâu, vì nó có stack (stack nguy hiểm)
  // vì nên custom nó lại sử dụng omit nhe
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    //                         lỗi này 500
    message: err.mesage,
    errorInfor: omit(err, ['stack']) // dùng omit loại bỏ stack nè
  })

  //--------------------------------------
  // trong khi phát sinh lỗi cũng có 1 số lỗi déo có mesage nên là mình
  // ném ra error (mà trong error có thể có status và message)
  // nhưng mình chỉ muốn lấy message thui
  // nên mình sẽ dùng lodash(nó có 2 phiên bản ), thằng lodash có thằng omit
  // thằng omit này dùng để loại bỏ những thằng mình không thích chỉ cần
  // truyền những thằng đó vào thì mình sẽ được cái trhanwgf mình thích =))
}
