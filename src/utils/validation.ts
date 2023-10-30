// tại sao lại viết ở đây
// đây là cái hàm tiện ích và sẽ sử dụng ở nhiều nơi
// nên mình lưu nó ở đây, nó không của riêng ai hết
// nên là sau này mình có thêm cầm nó qua ứng dungj khác sài
// hàm nào ngon ngon bỏ dô

// Cái code này trên Web Validator
import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
// import nè
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema' // cái này vượt tầm hiểu
// biết của con chat gòi, nên là mình sẽ dô cái file đo coi đường dẫn

import { NextFunction, Request, Response } from 'express'
import { EnityError, ErrorWithStatus } from '~/models/Errors'
//RunnableValidationChains<ValidationChain>: cái này lấy ở cái Schema(ctrl bấm hàm)
/*
    RunnableValidationChains này không phải là mảng (validate chain) 
    // nếu là maảng thì dùng for duyệt lấy từng phần tử lấy giá trị thì được

    // nhưng mà nó không phải
    nên là mình kh có chơi kiểu dùng for duyệt từng phần tử
    nên là chỉ lấy mỗi thằng đó thoi rồi run lấy giá trị thoi
*/
// hàm validate nhận vào 1 cái check Schema
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  // và sau đó nó biến cái chuẩn đó thành middleware
  return async (req: Request, res: Response, next: NextFunction) => {
    // validation ở trển á, nên là nó run đợi có lỗi thì nhét lỗi dô req á
    // nó sẽ đi qua cái từng cái check dữ liệu của mình á
    // nó sẽ  đưa lỗi qua req
    await validation.run(req) // run trả ra promise nha nen phải có awai

    // sau đó dùng thằng validationResult bắt lỗi nè
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    /*Do cái lỗi của mình taoj ra bình thường thì mà có lỗi thì nó, sẽ hiện lỗi
      chung với mấy thằng kia, mà mình muốn nó hiện lỗi của riêng nó, nên mình
      tạo 1 cái obj lỗi ở đây có gì tí nữa mình quay lại custome nó là được  
    */
    // tí nữa mình xửa lý
    const errorObject = errors.mapped()
    //mình không cần phải thêm status vì mình đã có gòi
    // cái mình thiếu bây giờ là bên trong eror
    const enityError = new EnityError({ errors: {} })
    //---- dùng để xử lý lỗi khác 422
    // Xử lý errObject
    // đi qua từng key để lấy msg
    // nếu thằng nào giống lỗi thì tạo cái lỗi
    // rồi quằng ra
    for (const key in errorObject) {
      // lấy msg của từng cái lỗi
      const { msg } = errorObject[key]
      //------------------
      //const { msg } = errorObject.key ** là sai nghe, làm déo gì có thuộc tính này
      // nêu là default
      //---------------------------
      // nếu msg có dạng ErrorWithStatus và status !== 422 thì ném ra
      // cho default error Handler(error tổng)
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      // lỗi các lỗi 422 từ errObjectt vào enityError
      // mình sẽ lấy cái key tương ưngs của thằng bên kia về làm key cho
      // minh nhưng mà thay vì lưu hêts thôgn tin thì nó chỉ lưu msg
      enityError.errors[key] = msg // nếu thấy khó hiểu nhìn hình trong notion hoặc xem lại video buổi 29
    }

    ///-------------------------
    // ở đây nó xử lý lỗi lưu chứ không ném về error handler tổng
    //                      mapped giúp biến đổi đẹp hơn, có tên lỗi
    next(enityError) // do lúc này mình đã có lỗi rõ ràng nên là
    // lỗi này sẽ được đưa về error tổng
  }
}
