import { Router } from 'express'
import {
  emailVerifyTokenController,
  loginControler,
  logoutController,
  resgisterController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  resgisterValidator
} from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handlers'
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
/*
des: đăng nhập
path: /users/register
method: POST
body: {email, password}
*/
usersRouter.get('/login', loginValidator, wrapAsync(loginControler))

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
usersRouter.post('/register', resgisterValidator, wrapAsync(resgisterController))

//------------------------------------------------------------
/*
    des:đăng xuất
    path: /users/logout
    method:POST
    headers:{Authoriation:'Bear<access_token>'}
    body:{refresh_token:string}

*/

// logut nè
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

//-----------------------------------------
// email
/*
    des: verify email token
    khi người dùng đk họ sẽ nhận được mail có link dạng
    http://localhost:3000/users/verify-email?token=</email_verify_token>
    nếu mà em nhấp vào click thì sẽ tạo ra request  gửi email_verify_token  lên server
    Server kiểm tra cái email_verifyu_token có hợp lệ ha không
    thì từ cái decode _email_verify lấy user_id
    và vào user_id đó để update email_verify_token thành '' , verify = 1, update_at ngày hiện taij 
    path: /users/verify-email
    method:Post
    body: {emai_verify_token:string}
    
 
    */

// tại sao là post, là mình gửi lên chứ mình có nhận được gì đâu
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

export default usersRouter
