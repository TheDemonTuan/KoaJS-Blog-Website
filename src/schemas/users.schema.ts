export default interface UserSchema {
  id: string;
  avatar?: string;
  display_name: string;
  email: string;
  username: string;
  password?: string;
  is_oauth?: 0 | 1;
  role?: 0 | 1;
  status?: 0 | 1;
}