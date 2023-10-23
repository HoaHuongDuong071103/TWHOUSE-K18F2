import { resgisterReqBody } from '~/models/schemas/request/user.request'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema copy'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import usersRouter from '~/routes/users.routes'
//Service
//Database: là vùng để kết nối với nhau chứ không dùng để xử lý,
//vậy nên mới cần cái thằng Service truy xuất dữ liệu  Controller sẽ
class UsersService {
  // ký asscess và Refresh Token
  // hàm nhận vào user_id và bỏ vào payLoad để tạo accessToken
  private signAcessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.Access_Token_EXPIRE_IN }
    })
  }
  // hàm nhận vào user_id và bỏ vào payLoad để tạo RefreshToken
  private signRefreshTYoken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.Refresh_Token_EXPIRE_IN }
    })
  }
  // checkEmail có tồn tại chưa
  async checkEmail(email: string) {
    // nếu mà tìm thấy thì trả ra obj , khhoong có thì là null
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  // payload là cái gói mà người dùng ném ra cho mình
  async register(payload: resgisterReqBody) {
    // phân rả nó ra gòi sài

    // code này có nghĩa là đợi serve vào thư mục người dùng và insert
    // nếu mà thành công thì đưa ra kết quả (kết quả đó là Promise)
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,

        // cái người dung đưa mình là String
        // nên mình mới ép kiểu lại thành date xong quăng lên
        date_of_birth: new Date(payload.date_of_brith),
        //độ lại cái password
        password: hashPassword(payload.password)
      })
    )
    // sau khi mà đang nhập thành công , thì nó sẽ cấp cho mình cái mã userID
    // mình cầm cái mã naỳ nhét dô 2 hàm đó để tạo access và refresh
    const user_id = result.insertedId.toString()
    //                      Promise.all: dùng để xử lý đôngf bộ
    // thay vì đợi anh này xong tới anh kia, thì mình dùng thằng này
    // promise.All trả về cho mình 1 cái mảng
    // khi mà phân ra mảng thì dùng []
    //   ___________OBJ thì {}
    const [access_Token, refresh_token] = await Promise.all([
      this.signAcessToken(user_id),
      this.signRefreshTYoken(user_id)
    ])
    // mình trả cho người dùng obj
    return { access_Token, refresh_token }
  }
}

const usersService = new UsersService()
export default usersService
