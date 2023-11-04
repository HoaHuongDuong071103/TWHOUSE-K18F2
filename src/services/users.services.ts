import { resgisterReqBody } from '~/models/requests/user.request'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema copy'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import usersRouter from '~/routes/users.routes'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
//Service
//Database: là vùng để kết nối với nhau chứ không dùng để xử lý,
//vậy nên mới cần cái thằng Service truy xuất dữ liệu  Controller sẽ
class UsersService {
  // ký asscess và Refresh Token
  // hàm nhận vào user_id và bỏ vào payLoad để tạo accessToken
  private signAcessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
      // sau đó thằng signToken  chỉnh sửa thành bắt buộc nên giờ phải truyền
    })
  }
  // hàm nhận vào user_id và bỏ vào payLoad để tạo RefreshToken
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
    })
  }

  // hàm sign Email_verify_Token
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
    })
  }

  // hàm sign Email_verify_Token
  private signForgotPassWordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
    })
  }

  // ký acess_token và refresh token
  private signAcessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAcessToken(user_id), this.signRefreshToken(user_id)])
  }
  //----------------------------------------------------------
  // checkEmail có tồn tại chưa
  async checkEmailExist(email: string) {
    // nếu mà tìm thấy thì trả ra obj , khhoong có thì là null
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  //-----------------------------------------
  // đây là nơi đăng kí nè
  // payload là cái gói mà người dùng ném ra cho mình
  // payLoad là nơi mà lưu trữ  thông tin của  người dùng đưa lên đồ đó
  async register(payload: resgisterReqBody) {
    // tại sao lại phải tạo trước user_id,trong khi mà Monggo sẽ cung cấp mã này cho mình?
    /*
      Buổi 30 (Phút 40)
     ----------- Cách này như wibu z ------------------------------
        _ khi mà mình tạo đối tượng mình up lên server á 
        -- thì môngo sẽ tạo đói tượng user_id  cho mình
        _ thì khi mà mình có cái mã này mà mình cầm đi kí email_verify_token 
        _ thì sau khi mà kí xong thì mình phải timf  và update nó lên trùng với đối tượng đó 
        --------------------------- Cách xịn nè---------------------------
        _ Thay vì mình để nó tự tạo, thì mình tạo 
        _ gòi mình nhanh nhẹn tạo lun email_verify 
        _ gòi sao đó up lên server cùng 1 lượt  lun 
      _ thì mình không cần phải fil ha gì hết và đó cũng là tại sao nên taoj trước 
    
    */
    const user_id = new ObjectId() // đây là đối tuognjw nha
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    // phân rả nó ra gòi sài

    // code này có nghĩa là đợi serve vào thư mục người dùng và insert
    // nếu mà thành công thì đưa ra kết quả (kết quả đó là Promise)
    // Khởi tạo đối tượng
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id, // trên MG nó là _id
        email_verify_token,
        // cái người dung đưa mình là String
        // nên mình mới ép kiểu lại thành date xong quăng lên
        date_of_birth: new Date(payload.date_of_brith),
        //độ lại cái password
        password: hashPassword(payload.password)
      })
    )
    // sau khi mà đang nhập thành công , thì nó sẽ cấp cho mình cái mã userID
    // mình cầm cái mã naỳ nhét dô 2 hàm đó để tạo access và refresh
    ///-------------------------------------------------
    // đây là lệnh lấy đối tượng user_Id do MG tạo ra nè
    // nhưng mà mình tạo rồi nên thôi
    //const user_id = result.insertedId.toString()
    //                      Promise.all: dùng để xử lý đôngf bộ
    ///-------------------------------------------------
    // thay vì đợi anh này xong tới anh kia, thì mình dùng thằng này
    // promise.All trả về cho mình 1 cái mảng
    // khi mà phân ra mảng thì dùng []
    //   ___________OBJ thì {}
    const [access_token, refresh_token] = await this.signAcessAndRefreshToken(user_id.toString())
    // ---------------------------------------------------
    // kí xong thì lưu lại trong db để bảo mật nè
    // nhớ là chỉ lưu Refresh
    // nên trước khi lưu thì phải định nghĩa lại nó
    // muốn tạo cái Refreshtoken thì chỉ cần 2 thứ
    // token và user_Id
    // insert nó là promise nên phải await
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    //-----------------------------------------------------
    // giả lập gửi email do mình hogn có aws =))
    // nên nhớ là cái email_verifyu_token gửi cho email
    console.log(email_verify_token)

    // mình trả cho người dùng obj
    return { access_token, refresh_token }
  }
  //---------------------LOGIN----------------------------------------
  async login(user_id: string) {
    // dùng user_id tạo access và refresh
    const [access_token, refresh_token] = await this.signAcessAndRefreshToken(user_id)

    // lưu refresh_token và db
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    // mình trả cho người dùng obj
    return { access_token, refresh_token }
  }
  //-------------------------LOGOUT----------------------------------------
  async logout(refresh_token: string) {
    // đợi xóa nè
    // refreshTokens: này là nơi lưu trữ token nè
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }

  //------------Update lại user (Buổi 30)-------------------------------------
  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne(
      // viết kiểu này là dùng cái id đầu vào tạo đối tượng
      // gòi tìm coi thằng nào giống và set giá trị cho nó
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified, // thay vì cập nhật số 1 thì viết vầy đỡ gà hơn =)))
            email_verify_token: '',
            //  update_at: new Date() ** viết update kiểu này, có thể đúng, nhưng có thể bị chêch lệch thời gian khi
            // đưa dữ liệu lên server
            // Vậy nên mình phải bộc cái đối tượng này vào mảng, và có cú pháp lấy giờ chuẩn để tránh sai lệch
            update_at: '$$NOW' // viết kiểu này thì khi mà đưa lên MG á, thì MG sẽ tự động cập nhật tg lun, tránh bị sai lệch
          }
        }
      ]
    )
    // tạo ra access và RefreshToken nè
    const [access_token, refresh_token] = await this.signAcessAndRefreshToken(user_id)
    // lưu refresh vào db
    // tại vì cái collection của refreshTokens này chỉ có 2 thuộc tính à
    // token và người xở hữu
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id) // tại sao  lại là ObjId vì mình truyền dô là chuỗi
        //                             mà lưu lên server là obj nên phải ép kiểu
      })
    )
    return { access_token, refresh_token }
  }
  //--- Resend Email (Buổi 30)----------------------
  async resendEmailVerify(user_id: string) {
    // tạo ra email_verify_token
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    // update lại user
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },

      [
        {
          $set: {
            email_verify_token,
            //  update_at: new Date() ** viết update kiểu này, có thể đúng, nhưng có thể bị chêch lệch thời gian khi
            // đưa dữ liệu lên server
            // Vậy nên mình phải bộc cái đối tượng này vào mảng, và có cú pháp lấy giờ chuẩn để tránh sai lệch
            update_at: '$$NOW' // viết kiểu này thì khi mà đưa lên MG á, thì MG sẽ tự động cập nhật tg lun, tránh bị sai lệch
          }
        }
      ]
    )
    // giả sử gửi lại email
    console.log(email_verify_token)
    return { message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS }
  }
  //---------------Lưu forgotPassWord vào db nè (buỏi 30)-------------
  async forgotPassword(user_id: string) {
    // tạo ra forgot_password_token
    const forgot_password_token = await this.signForgotPassWordToken(user_id)
    // update lại user
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          //  update_at: new Date() ** viết update kiểu này, có thể đúng, nhưng có thể bị chêch lệch thời gian khi
          // đưa dữ liệu lên server
          // Vậy nên mình phải bộc cái đối tượng này vào mảng, và có cú pháp lấy giờ chuẩn để tránh sai lệch
          update_at: '$$NOW' // viết kiểu này thì khi mà đưa lên MG á, thì MG sẽ tự động cập nhật tg lun, tránh bị sai lệch
        }
      }
    ])
    // giả lập gửi email
    console.log(forgot_password_token)
    return { message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
  }
}

const usersService = new UsersService()
export default usersService
