// tại sao lại để enum ở đây
// do enum là class chứa những biến không thay đổi nên
// minhf để nó ở đây
export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

// thằng giúp định dạng type của token
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerificationToken
}
