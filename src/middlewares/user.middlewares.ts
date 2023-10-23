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
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  //khi mà người đùng đăng nhập thì
  // họ sẽ gửi chúng ta cái request
  // trong cái requrest (body) nó có email và password
  // nên mình dùng distructuring để lấy được những thuộc tính này
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      // phản hồi về 1 Json chúa thuộc tính err: và nội dung
      error: 'Missing email or password'
    })
  }
  next()
}

// bản thân thằng này là cái middwware
// checkSchema có trong ExpressValidation
export const resgisterValidator = validate(
  checkSchema({
    name: {
      notEmpty: true, // không đc empty
      isString: true, // chuỗi nha không được số
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      }
    },
    email: {
      notEmpty: true, // không đc empty
      isEmail: true, //  kiểm tra chuẩn Email, do kiểm tra chuẩn Email, trong đó nó có length gòi

      trim: true,
      custom: {
        options: async (value, { req }) => {
          // bên kia trả ra nè
          const isExist = await usersService.checkEmail(value)
          if (isExist) {
            throw new Error('Email already exists')
          }
          return true // đéo có pedding chết mẹ luôn
        }
      }
    },
    password: {
      notEmpty: true, // không đc empty
      isString: true, // chuỗi nha không được số
      // trim: false, // không được trim nha 3, password người ta nhập gì kện mẹ ngta
      isLength: {
        options: {
          min: 8,
          max: 50
        }
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
        }
      },
      errorMessage:
        'password mus be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
    },
    confirm_password: {
      notEmpty: true, // không đc empty
      isString: true, // chuỗi nha không được số
      // trim: false, // không được trim nha 3, password người ta nhập gì kện mẹ ngta
      isLength: {
        options: {
          min: 8,
          max: 50
        }
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
        }
      },
      errorMessage:
        'confrim_password mus be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
      custom: {
        // value với req  này là gì?
        // value này là confirm passWord đó
        // do nó nằm trong trường đó mà
        //Req: là cái yêu cầu ma người dùng đưa đó
        options: (value, { req }) => {
          if (value !== req.body.passWord) {
            throw new Error('confirm_passwword does not matchpasword') //
            // throw ra để cho trường bắt lỗi bên validation nó in ra
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
        }
      }
    }
  })
)

// thì á nếu mà có lỗi thì lỗi, sẽ được trả về
// cho req nên là mình sẽ không có biết lỗi là gì
// nên nó sẽ chạy qua bên Controller viết hàm để bắt cái lỗi đó (không nên)
// nên mình sẽ viết cái hàm đó trong Utils (validations)
