// dungf thằng này để tạo database, liên kêts code mình với mongo(web)
//Service
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'

// kh đẩy env lên do nó là file chứa password đây lên hacker lấy đc là đi
import { config } from 'dotenv' // sử dụng lại 2 cái biến đó nè
import User from '~/models/schemas/User.schema copy'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Follow.Schema'

config()
// taij sao lại có 2 biến do là mình đã để nó ở 1 nơi khác tăng tính bảo mật
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.f19ddfq.mongodb.net/?retryWrites=true&w=majority`

// tạo sao lại có class chỗ này?
// để cho nó dễ dàng trong việc gọi hàm thoi
// tại sao không nên export cái class này
// do là khi mà export class mà có ai đó muốn sử dụng thì phải tạo obj
// từ cái class này mất công nên là mình tạo giúp ngta xong export lun

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME) // tạ sao mình lại tạo thằng này, tránh để
    // cho mình sử dụng collection của db viết ngắn hơn, chứ bình thường viết dài lắm
  }
  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)

      // Send a ping to confirm a successful connection
      // lệnh ping là lệnh thử truy cập database , nếu truy cập thành công thì trả ra 1
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error) // cần có thằng này để  nơi tập kết lỗi
      // để sau này sử lý lôi
      throw error
    }
  }

  //--------------------------
  // asscessor:properti: nên nó hiểu đây là cái thuộc tính luôn()
  //--------------
  // nói tóm gọn lại là nếu mà mình truy cập dô thằng users này á
  // mà nếu mình có gòi thì nó sẽ cầm thằng collecion này nó đưa cho mình
  // còn chưa thì nó tạo
  //---------------------
  // trong cái collection nó là document nên không có sử dụng được những thuộc tính
  // nên là mình phải định nghĩa cho Collection hiểu nó là User (mới sử dụng được những thuộc tính của
  //obj này)
  get users(): Collection<User> {
    // tại sao lại là String  vì lúc mà truy cập mình có biết nó là ai
    // nên chỉ có mình biết thôi (mìnhf tạo mà trong interface) nên là
    // mình nói cho code hiểu là đay là String yên tâm sử dụng đê
    return this.db.collection(process.env.DB_USERS_COLLECTION as string) // truy cập dô thằng cái collection trong db nè
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string) // truy cập dô thằng cái collection trong db nè
  }

  // nó sẽ giúp cho mình cái collection follower
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
