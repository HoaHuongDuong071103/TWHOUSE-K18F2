import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()

const PORT = 3000
// dùng để tạp database nè (service)
databaseService.connect()

app.use(express.json()) // lỗi xương máu nè(500 trong postMan) , do những gì mình trả ra
//                      toàn là JSON nên là thằng app nó không có hiểu  nên mới phải
// kêu thằng express này chấm JSON() để app nó hiểu là sử dụng JSON

//localhost:3000/
// đây là khi app lấy dữ liệu mình gửi app cái res
app.get('/', (req, res) => {
  res.send('Hello World')
})

// dùng nè
//Nếu mà dùng đường dẫn đêns localhost:3000/api thì nó cũng dô thằng router
// nhưng nó không có dô cái chỗ /tweets nên không có dữ liẹu
//  localhost:3000/api/tweets thì dô được
app.use('/users', usersRouter) // thằng này là controller: gửi về dữ liệu nè
// nên mình mới cần thêm middleware, khi mà truy cập

/*
  Tại sao lại có thằng xử lý lỗi ở đây (App Tổng )
    - 1: bởi vì nếu đặt ở chỗ routers á 
        -- Không lẻ bây giờ có 100 cái router thì 100 cais error nư này sao
      - Vậy nên nên đặt ở app tổng ở cuối app, khi mà chạy á thì lỗi nó sẽ được dồn 
      về cuối thì dễ dàng sửa hơn,nếu mà có lỗi thì nó ném phát dìa đây, OKK
 */

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server đàng  chạy trên ${PORT}`)
})
