import { Router } from 'express'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginControler,
  logoutController,
  resendEmailVerifyController,
  resetPasswordController,
  resgisterController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  resgisterValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/user.middlewares'
import { UpdateMeReqBody } from '~/models/requests/user.request'
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
usersRouter.post('/login', loginValidator, wrapAsync(loginControler))

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

//------------------------------------------
// Forgot PassWord
// Bình thường là sẽ có 2 cách
// Đăng nhập trước gòi verify sau
// ngược lại

/*
      des: resend email verify token 
      khi mà mail  thất lạc, hoặc email_verify_token hết hạn, thì 
      người dùng có nhu cầu resend email_verify_token

     method: post (Tại sao là post do là mình đâu có gửi cho họ đâu, mình gưi cho email của họ mà)
     path:/users/resend-email-verify
      headers:  (tại sao là headers do là mình truyền acess mà)
      headers: {Authorization : "Bearer <access_token>"} // đăng nhập mới được resend
      body{}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

///-----------------------ForGot PAssword
/*
    Des: khi ngưởi dungf quên mk, họ sẽ gửi cái email để xin mình tạo cái 
    forgot_password_token
    path:/users/forgot-password
    method: POST
    // body;{email;string }

*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
    des: khi người dùng nhấp vào link trong email để reset Password
     họ sẽ gửi 1 req kèm theo forgot_passWord_token lên server
     server sẽ kiểm tra forgot_passWord_token có hợp lệ không 

    sau đó chuyển hướng họ đến trang reset password
    path:/users/verify-forgot-password
    method: POSR
    body:{forgot_password_token:string}
*/

usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

//-------------------------------------------------------
//Buổi 31
/*
des: reset password
path: '/reset-password'
method: POST, vì mình chỉ đưa lên chứ mình kh có lấy(GET)
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/

//verifyForgotPasswordTokenValidator : thằng này đã có ở trên gòi
// mình chỉ cần đem xuống mà sử dụng để check ForgotPassWord Token
// còn thằng resetPassWord được dùng để check passWord và confirmed Password
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
 des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordController))

/*
Khi nào dùng tính năng này, khi mà đăng nhập, 
có accessToken thì mới sử dụng được

des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

// Put và patch thì cả 2 thằng dùng để cập nhật
// Put và patch nào ngonn hơn?
/*
  +Put: thì muốn  cập nhật nhiu thì phải đưa hết, 
    ví dụ mún cập nhật 2 mà thuộc tính có tới 5 thì mình phải đưa đến 5

    // Patch ngon hơn
   +Patch thì cập nhật nhiu đưa nhiêu 
*/
//verifiedUserValidator : check coi email verify chưa
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem (param)
*/
usersRouter.get('/:username', wrapAsync(getProfileController))
//chưa có controller getProfileController, nên bây giờ ta làm
export default usersRouter
