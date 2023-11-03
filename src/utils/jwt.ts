//đây là cắi nơi mình sẽ tạo ra token
//// Token.sgin gồm 3 thứ, payload, SecretBody, Option callback
//payload: userID, ngaỳ hết hạn, token type (đăng nhập, đăng xuất)
// chứ kí bí mật
// option: cung câps thuật toán
//callback: xử lý lỗi, nếu mà có lỗi
//-----------------------------
// Có 2 dạng: bất đồng bộ và đồng bộ
// thường sẽ sử dungj bất đồng bộ
import { error } from 'console'
import jwt from 'jsonwebtoken'
import { resolve } from 'path'
import { decode } from 'punycode'
import { TokenPayLoad } from '~/models/requests/user.request'

// làm hàm nhận vào payload, privatekey, options từ đó ký tên
//Server lun trả cho người dùng resolve
// Server sẽ trả về cho mình nếu reject nếu lỗi
export const signToken = ({
  payload, // có thể thay đổi theo tg
  privateKey, // nếu mà trong quá trình sử dụng mà hong nói gì thì nó sẽ lấy
  //                                                     privayte key bên kia, thay nè ở buổi 30
  options = { algorithm: 'HS256' } // thuật toán cũng như z
}: {
  payload: string | object | Buffer // định nghĩa thuộc tính từng thuộc tính trong obj
  privateKey: string
  options: jwt.SignOptions
}) => {
  // định nghĩa luôn là Prmoise trả ra String
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}

//--------------------------------------------------------
// đây là check cái token phải của mình hong
// video 29
// hàm nhận vào token, và secretOrPublicKey?
// token phải bắt buộc đưa dô nè
//Tại sao secretOrPublicKey lại là optional
// vì ngay lúc đầu mình kí á (hàm trên)
// thì đã sign nó bằng passWord (JWT_SECRET) mặc định gòi
// nên bây giờ đưa cũng đc, kh thì cũng chả sao
export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  // cần phải đưa nó về promise trước
  // tại sao thì đã nói gòi
  return new Promise<TokenPayLoad>((resolve, reject) => {
    // jwt.verify này có sẵn
    // nó cần truyền vào token, secret__, callback(decode là payLoad)
    jwt.verify(token, secretOrPublicKey, (error, decode) => {
      if (error) throw reject(error) // lỗi này có trả ra JsonWebTokenError, lỗi này không có status
      //                                 nó chỉ có name và message
      resolve(decode as TokenPayLoad) // TokenPayLoad trong interface
    })
  })
}
