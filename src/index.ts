import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
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

app.listen(PORT, () => {
  console.log(`Server đàng  chạy trên ${PORT}`)
})
