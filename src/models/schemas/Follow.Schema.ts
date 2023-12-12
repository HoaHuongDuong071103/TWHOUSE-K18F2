import { ObjectId } from 'mongodb'

// mộit cái mô tả được dùng là interface
// định người Type
interface FollowersType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

// một cái class sử dụng cái mô tả đó
// có nghĩa là đối tượng được tạo ra từ cái class này nó được mô tả bằng cái
// interface ở trên
// tạo đối tượng
export class Follower {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
  constructor({ _id, user_id, followed_user_id, created_at }: FollowersType) {
    this._id = _id
    this.user_id = user_id
    this.followed_user_id = followed_user_id
    this.created_at = created_at || new Date()
  }
}
