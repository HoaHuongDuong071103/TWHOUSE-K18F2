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
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'

// khi nguời ta đăng nhập
// người ta đưa mình cái email và pwd
// mình 2 cái đó mình check
export const loginValidator = validate(
  checkSchema({
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
  })
)
//-----------------------------------------------
// bản thân thằng này là cái middwware
// checkSchema có trong ExpressValidation
export const resgisterValidator = validate(
  checkSchema({
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
  })
)

// thì á nếu mà có lỗi thì lỗi, sẽ được trả về
// cho req nên là mình sẽ không có biết lỗi là gì
// nên nó sẽ chạy qua bên Controller viết hàm để bắt cái lỗi đó (không nên)
// nên mình sẽ viết cái hàm đó trong Utils (validations)
