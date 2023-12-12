import { UpdateMeReqBody, resgisterReqBody } from '~/models/requests/user.request'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema copy'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import usersRouter from '~/routes/users.routes'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Follow.Schema'
//Service
//Database: là vùng để kết nối với nhau chứ không dùng để xử lý,
//vậy nên mới cần cái thằng Service truy xuất dữ liệu  Controller sẽ

//--------------------------------------------------------
//Muốn sử dụng chức năng cập nhật (location, address....) thì mình phải xác nhận là người dùng
// đã verify chưa, nếu chưa thì bắt buộc phải verify thì mới cập nhật
// dùng cách này là ký xong gửi lun, khỏi phải query thì nó lâu
class UsersService {
  // ký asscess và Refresh Token
  // hàm nhận vào user_id và bỏ vào payLoad để tạo accessToken
  private signAcessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
      // sau đó thằng signToken  chỉnh sửa thành bắt buộc nên giờ phải truyền
    })
  }
  // hàm nhận vào user_id và bỏ vào payLoad để tạo RefreshToken
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, verify, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
      })
    } else {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, verify },
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
      })
    }
  }

  // hàm sign Email_verify_Token
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken, verify },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
    })
  }

  // hàm sign Email_verify_Token
  private signForgotPassWordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string // lúc đầu thằng này ở bên signToken nó là option
    })
  }

  // ký acess_token và refresh token
  private signAcessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    //                                    chỗ này nhận vào obj nè                      đây cũng thế
    return Promise.all([this.signAcessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
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
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified // tại sao là 0 bởi vì khi kí là chưa có nên mình mạnh dạng cho nó là 0
    })
    // phân rả nó ra gòi sài

    // code này có nghĩa là đợi serve vào thư mục người dùng và insert
    // nếu mà thành công thì đưa ra kết quả (kết quả đó là Promise)
    // Khởi tạo đối tượng
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id, // trên MG nó là _id
        email_verify_token,
        // lấy user kết hợp của user_id
        username: `user${user_id.toString()}`,
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
    const [access_token, refresh_token] = await this.signAcessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified // chôx này cũng z ljun
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    // ---------------------------------------------------
    // kí xong thì lưu lại trong db để bảo mật nè
    // nhớ là chỉ lưu Refresh
    // nên trước khi lưu thì phải định nghĩa lại nó
    // muốn tạo cái Refreshtoken thì chỉ cần 2 thứ
    // token và user_Id
    // insert nó là promise nên phải await
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        exp,
        iat
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
  // tại sao lại nhận giá trị ngoài(buổi 31 1h45p)
  /*
      Vì trước hết á, đăng nhập thì đâu có biết là đã verify ha chưa đâu
      _ không verify thì vẫn đăng nhập được mà
      _ nên chỗ này mình không fill giá trị đại được
      _ nên mình phải nhận nó từ bên ngoài  
  */
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // dùng user_id tạo access và refresh
    const [access_token, refresh_token] = await this.signAcessAndRefreshToken({ user_id, verify })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    // lưu refresh_token và db
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id),
        exp,
        iat
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
    const [access_token, refresh_token] = await this.signAcessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified // tại sao lại là verify laf bởi vì đây là cái hàm
      //                chuyển từ unverfied sang verify nên chỗ này phải là verify
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    // lưu refresh vào db
    // tại vì cái collection của refreshTokens này chỉ có 2 thuộc tính à
    // token và người xở hữu
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id), // tại sao  lại là ObjId vì mình truyền dô là chuỗi
        //                             mà lưu lên server là obj nên phải ép kiểu
        exp,
        iat
      })
    )
    return { access_token, refresh_token }
  }
  //--- Resend Email (Buổi 30)----------------------
  async resendEmailVerify(user_id: string) {
    // tạo ra email_verify_token                                           Tại sao lại là 0
    //                                                                vì resend là chưa kí
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
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
  // cái forgot password này không biết là đã verify chưa
  // Ví dụ nè: thằng verify gòi nó cũng quên , thằng chưa verify nó cũng quên
  // nên là không có đoán mò , tốt nhất vẫn là nhận giá trị đầu vào (Buổi 31(video chữa tắt tiếng(23:30)))
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // tạo ra forgot_password_token
    const forgot_password_token = await this.signForgotPassWordToken({ user_id, verify })
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
  //----------------- Reset password(Buổi 31)
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    // tiến hành tìm dựa vào user_id và update
    // có nghĩa là nó đi tìm thằng có mã _id(object )
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password), // này là cập nhật mật khẩu nè
          forgot_password_token: '', // set về rỗng nè, sau khi set thành rỗng
          //              thì nó không thể sử dụng forgot password 2 lần chỉ 1 lần
          updated_at: '$$NOW'
        }
      }
    ])
    return { message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS }
  }
  //------------------- GetMe(buổi 31)
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        // cho mình nào được và thằng nào được hiển thị ra

        // 0 là kh hiện được
        projection: {
          password: 0,
          email: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  //--------------------
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    // đọc code nè payLoad nè có DOB không
    // Date_of_Brith đó có thay đổi không
    // có thì phải ép kiểu nó thành dạnh date từ cái payLoad có cái thuộc tính cũ
    // không thhì llaays giá trị của payLoad đó
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    // cập nhật lên db nè
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after', //trả về document sau khi update, nếu k thì nó trả về document cũ
        projection: {
          //chặn các property k cần thiết
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user //đây là document sau khi update
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          create_at: 0,
          update_at: 0
        }
      }
    )
    if (user == null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // nếu kh vào if thì nó ngonn return ra cho sài
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    // kiểm tra xem là đã follow chưa
    const isFollowed = await databaseService.followers.findOne({
      // tạo ra đối tượng
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    // nếu đã follow  rồi thì return message là đã floow
    if (isFollowed !== null) {
      return {
        message: USERS_MESSAGES.FOLLOWED
      }
    }
    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    return {
      message: USERS_MESSAGES.FOLLOW_SUCCESS
    }
  }

  // XÓA UNFOLLOW
  async unfollow(user_id: string, followed_user_id: string) {
    // kiểm tra xem đã follow chưa
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    // nếu chưa folllow  thì return mess là đã unfollow rồi
    if (!isFollowed) {
      return { message: USERS_MESSAGES.ALREADY_UNFOLLOWED }
    }

    // nếu chưa folllow thì xuốn đây
    //  truy cập dô db xóa cái đói tượngd dó
    const result = await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    // thành công gồi thì thông báo
    return { message: USERS_MESSAGES.UNFOLLOW_SUCCESS }
  }

  async changePassWord(user_id: string, password: string) {
    // tìm user thông qua user_id
    // cập nhật lại password và forgot_passWord_token
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          // nên lưu password dạng mã hash nha
          password: hashPassword(password),
          // chỉnh sửa lại nè
          forgot_password_token: '',
          update_at: '$$NOW'
        }
      }
    ])
    // nếu mà bạn ở đây chỉ muốn người ta đổi xong thì phải đăng nhập lại
    // bằng cách trả về access và refresh
    // ở đây mình chỉ cho người ta đổi mk thôi, nên trả về message
    return {
      message: USERS_MESSAGES.CHANG_PASSWORD_SUCCESS
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    // tạo mới nè
    const [new_access_token, new_refersh_token] = await Promise.all([
      this.signAcessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp })
    ])
    // sau khi mà mình tạo xong thì mình xóa cái cũ
    // mình chỉ cần dô db xóa tìm gòi xóa
    // Vì 1  người có thể đăng nhập nhiều nơi khác nhau, nên họ sẽ có rất nhiều document trong collection
    // ta không thể dùng user_id tìm document cần update, mà phải dùng token , đọc trong RefreshToken.schema.ts
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    //insert lại document mới
    // tìm ở cái user_id này, và thêm cái refershToken mới

    // này là ngày cấp
    const { iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: new_refersh_token, exp, iat })
    )
    return { access_token: new_access_token, refresh_token: new_refersh_token }
  }
}

const usersService = new UsersService()
export default usersService
