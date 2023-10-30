import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

// dùng để định nghiax các dạng lỗi ở phần error
type ErrorsType = Record<
  string,
  {
    msg: string // quan trọng nhất vẫn kà cái message
    [key: string]: any // là cái gì vậy, muôn thêm bao nhiêu cũng đc
  }
>

// Lỗi nó cũng chỉ là obj thôi, nên mình sẽ dùng thằng này để tạo lỗi
// dùng để mô tả lỗi
export class ErrorWithStatus {
  message: string // thông bóa lỗi ở đâu
  status: number
  // nếu mún tạo lỗi thì đưa cái message, status
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// thằng này dùng để tạo lỗi ngắn và rõ ràng hơnn
// nó dùng để hiện thị thông bá lỗi liên quan đế 422 lỗi người dùng
// một cái enity Error thì có 2 phần mess và error
export class EnityError extends ErrorWithStatus {
  // đầu vào của constructor là obj có 2 thuộc tính message và error
  //                                                                và  nó được định nghĩa bởi obj  khác
  //                                                                tại sao lại có ? bởi vì khi truyền thì người dùng có thể để trống
  //                                                                nên là đâu có ra giá trị mặc định nên phải có ?
  errors: ErrorsType // định nghĩa loiix nè
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY }) //422
    this.errors = errors
  }
}
