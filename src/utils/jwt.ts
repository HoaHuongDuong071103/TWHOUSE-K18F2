//đây là cắi nơi mình sẽ tạo ra token
//// Token.sgin gồm 3 thứ, payload, SecretBody, Option callback
//payload: userID, ngaỳ hết hạn, token type (đăng nhập, đăng xuất)
// chứ kí bí mật
// option: cung câps thuật toán
//callback: xử lý lỗi, nếu mà có lỗi
//-----------------------------
// Có 2 dạng: bất đồng bộ và đồng bộ
// thường sẽ sử dungj bất đồng bộ
import jwt from 'jsonwebtoken'
import { resolve } from 'path'

// làm hàm nhận vào payload, privatekey, options từ đó ký tên
//Server lun trả cho người dùng resolve
// Server sẽ trả về cho mình nếu reject nếu lỗi
export const signToken = ({
  payload, // có thể thay đổi theo tg
  privateKey = process.env.JWT_SECRET as string, // nếu mà trong quá trình sử dụng mà hong nói gì thì nó sẽ lấy
  //                                                     privayte key bên kia
  options = { algorithm: 'HS256' } // thuật toán cũng như z
}: {
  payload: string | object | Buffer // định nghĩa thuộc tính từng thuộc tính trong obj
  privateKey?: string
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
