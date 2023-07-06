export default interface UserSchema {
  id: string;
  avatar?: string;
  display_name: string;
  email: string;
  username: string;
  password?: string;
  role?: string;
  status?: string;
}