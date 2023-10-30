// cái này là định nghĩa đối tuọng đối tượng cho Users

// tại sao toàn là String không vậy là do
// người dùng đưa lên cho mình toàn là chuỗi hong à
export interface resgisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_brith: string
}
