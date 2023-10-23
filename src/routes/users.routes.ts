import { Router } from 'express'
import { loginControler, resgisterController } from '~/controllers/users.controllers'
import { loginValidator, resgisterValidator } from '~/middlewares/user.middlewares'
const usersRouter = Router() // lưu hết tất cả các tính năngb liên quan đến user
// thằng naỳ là middleware(midlewware thì có 3 cái)

// này là giống như cái hàm (nên gọi mới sử dụng được)
// mà ai sẽ là người sử dụng
// cái app này
// thằng này là controller: gửi về dữ liệu nè nên nó phải cần có middleware

// loginValidator là làm gì , có nghĩa là khi mà người dùng truy cập dô đường link
// này thì bên trong cái req mà người đùng đưa lên (đã giải thícj ở middleware)
// thì nó sẽ cầm cái req đó check coi có Oke hong, Oke thì cho lấy dữ liệu
// ngon thì dô thằng loginControler
usersRouter.get('/login', loginValidator, loginControler)

// đây là cái mà mấy lập trình viên hay sài để cho ngươi ta viết mình viết
// cái gì

/*
    Description: register new User
    Path: /register
    Method: POST
    // body gửi lên
    body{
        name:string
        email:string
        password:string
        confirm_password: string
        date_of_birth: string // tại sao không phải Date mà là Strign
                    // là do khi mà người dùng đưa lên cho mình thì đó là  JSON
                    // mà JSOn thif không có kiểu dữ liệu nào là Date hết 
                    // nó chỉ có chuỗi thôi, chuỗi JSON
                    // thì mình có thể nó Strign theo chuổi ISO 8601
        ----------------------------
 // taij sao phải dùng sneack case: do trong Mongo nó như vậy
 // các kiểu dữ liệu của nó dứới dạng sneack case (qui ước nó z)
    }
*/
// register dùng để
usersRouter.post('/register', resgisterValidator, resgisterController)

export default usersRouter
