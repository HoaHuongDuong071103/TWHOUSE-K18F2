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
    //                      mapped giúp biến đổi đẹp hơn, có tên lỗi
    res.status(400).json({ errors: errors.mapped() })
  }
}
