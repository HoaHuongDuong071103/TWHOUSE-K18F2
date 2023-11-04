//MiddleWare
// giả xử là anh đang làm cái route '/login'
// thì người dùng sẽ truyền email và password
// tạo 1 cái request có body là email và password
// làm 1 cái middlware kiểm tra email và password có được
// truyền lên ha không?

/*
Có cái lỗi mắc cười chỗ này nếu mà 
mình định dạng kiểu dữ liệu của req và res mà quên import
thì mình sẽ sử dụng mặc định của fetchAPi

nếu mà import thì mình sẽ sử dụng của expresss, thì express nó 
    thường hay làm mấy cái Api (router đồ đó) , nên nó sẽ
    cung cấp cho mình cái interface để sử dụng sẵn những thẳng này
*/
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

// khi nguời ta đăng nhập
// người ta đưa mình cái email và pwd
// mình 2 cái đó mình check
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            // tìm nè tìm trong db
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            // nếu user không có trong database thì quăng lỗi
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            // req.user này là hosting  nên là thằng user này là gán nhờ
            // anh anh cho em gửi nhờ
            req.user = user // lưu user vào req để dùng ở loginController
            return true
          }
        }
      },

      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

//-----------------------------------------------
// Đằng ký
// bản thân thằng này là cái middwware
// checkSchema có trong ExpressValidation
export const resgisterValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        }, // không đc empty
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        }, // chuỗi nha không được số
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        }, // không đc empty
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        }, // chuỗi nha không được số
        // trim: false, // không được trim nha 3, password người ta nhập gì kện mẹ ngta
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        // cái này dùng để đánh giá password của người ta
        //là mạnh ha không mạnh
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            // returnScore:true : nếu để là true thì nó sẽ hiện sôs trên thang 1-10
            //                   còn là false thì sẽ là true false
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      //-----------------------------
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        }, // không đc empty
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        }, // chuỗi nha không được số
        // trim: false, // không được trim nha 3, password người ta nhập gì kện mẹ ngta
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        // cái này dùng để đánh giá password của người ta
        //là mạnh ha không mạnh
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            // returnScore:true : nếu để là true thì nó sẽ hiện sôs trên thang 1-10
            //                   còn là false thì sẽ là true false
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          // value với req  này là gì?
          // value này là confirm passWord đó
          // do nó nằm trong trường đó mà
          //Req: là cái yêu cầu ma người dùng đưa đó
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD) // throw ra để cho trường bắt lỗi bên validation nó in ra
            }
            return true // không có thằng này thì pendding tới chết
          }
        }
      },
      date_of_birth: {
        // chuẩn chuỗi nè
        isISO8601: {
          options: {
            strict: true, // ép ngta nhập theo chuẩn chuỗi
            strictSeparator: true // chuỗi được quyền thêm gạch ngnag
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

// thì á nếu mà có lỗi thì lỗi, sẽ được trả về
// cho req nên là mình sẽ không có biết lỗi là gì
// nên nó sẽ chạy qua bên Controller viết hàm để bắt cái lỗi đó (không nên)
// nên mình sẽ viết cái hàm đó trong Utils (validations)

//-------------------------------------------------
// check AccessToken ở Header đăng xuát, check coi mình ai
export const accessTokenValidator = validate(
  checkSchema(
    {
      // Authorization : Bearer <access_token>'
      Authorization: {
        trim: true,

        custom: {
          // cái value này là Author đó đó
          options: async (value: string, { req }) => {
            // tại sao lại băm zãy
            // do thăng Authorization : Bearer <access_token>'
            // phải băm gồi lấy vị trí thứ 1 để đc access nha
            const asscessToken = value.split(' ')[1]
            // nếu déo có accessToken thì ném lỗi 401
            if (!asscessToken) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED // 401
              })
            }
            try {
              // nếu có asscess thì mình phải verify(check coi phải của mình hong) cái accessToken
              const decoded_authorization = await verifyToken({
                token: asscessToken,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string // chứx kí bí mật
              })
              // từ cái token thì verify thì đc cái payLoad đó
              // lấy ra cái decoded_authorization (payLoad), lưu vào req để dùng dần
              ;(req as Request).decode_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                // Capitalize giúp in hoa chữ cái  đầu
                message: capitalize((error as JsonWebTokenError).message), // lỗi này chắc chắn là JSON Web Token
                status: HTTP_STATUS.UNAUTHORIZED //401
              })
            }
            return true //đặt đúng chỗ nè bố
          }
        }
      }
    },
    ['headers']
  )
)
// check Refresh_Token ở body đăng xuát
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,

        custom: {
          // value naay la refresh token
          // thằng này không cần sử lý nhiều
          // như là thằng ở trên, kh cần băm ha chọt gì hết
          options: async (value: string, { req }) => {
            // verify refresh_token để lấy decode_refresh_token
            // tại sao phải sử dụng trycatch
            // do là nếu mà không có try catch thì cái lỗi của throw
            // nó sẽ đc đưa cho validate nó sẽ thành lỗi 422 và chúng
            //ta éo thích đều này
            try {
              // chỗ này mã hóa (Buổi 30 đã thêm secretOrPublicKet)
              // lúc này nó sẽ chạy cùng lúc
              // xử lý đồng bộ mất thời gian
              const [decode_refresh_token, refresh_token] = await Promise.all([
                // chỗ này dễ bị lỗi invalid signature
                // verifyToken là check coi chữ kí của mình hong
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({
                  token: value // bởi vì trong db chỉ có thuộc tính token thui
                })
              ])
              //tìm coi cái refresh_token có tồn tại trong db có tồn taij ha không

              //---------------------------
              // nếu có pug thì là token đã được sử dụng
              // hoặc không tồn tại
              // hoặc là đưa tào lao
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              // nếu là lỗi của JsonWebTokenError thì như vầyg
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
              // nếu kh phải thì throw ra
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

//----------------------------------------------------------------------
// Buổi 30 - 1h10
// làm cái email_verify để người dùng nhấp để gửi server nè
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,

        custom: {
          // value naay la email_verify_token
          // thằng này không cần sử lý nhiều
          // như là thằng ở trên, kh cần băm ha chọt gì hết
          options: async (value: string, { req }) => {
            // kiểm tra người dùng có truyền lên email_verify_token
            // nếu kh có  thì lỗi
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED // 401
              })
            }
            // emai_verify_token để lấy decodeed-email_verify_token
            try {
              // hàm decode lại nè
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              // sau khi verify ta được payload của email_verify-token: decoded_email_verify_token
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              // nếu là lỗi của JsonWebTokenError thì như vầyg
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
              // nếu kh phải thì throw ra
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// check email cho ForgotPassWord nè
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            // dựa vào email tìm đối tượng user tương ứng
            const user = await databaseService.users.findOne({
              email: value
            })
            // tìm kh được thì lloi
            if (user == null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            // còn ngon nghẻ thì lưu lun, tí dùng dần
            req.user = user // đối tượng user này được lấy từ MG nên nó
            //                   chỉ có đối tượng _id thui nha
            //            khi nào là payLoad nó mới là user_id
            return true
          }
        }
      }
    },
    ['body']
  )
)

// verifyForgotPassword nè(BVuopi 30)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED // 401
              })
            }
            // emai_verify_token để lấy decodeed-email_verify_token
            try {
              // hàm decode lại nè
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              // sau khi verify ta được payload của email_verify-token: decoded_email_verify_token
              ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token

              //--------------------------------------------
              // chôc này đáng lẽ ở controller
              // nhưng mà sử lý luôn nó cũng không sao
              const { user_id } = decoded_forgot_password_token
              // dưa vào users_id tìm user
              const user = await databaseService.users.findOne({
                _id: new ObjectId(user_id)
              })
              // nếu user === null
              if (user === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                })
              }

              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INCORRECT,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              //-----------------------------------------------------
            } catch (error) {
              // nếu là lỗi của JsonWebTokenError thì như vầyg
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
              // nếu kh phải thì throw ra
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
