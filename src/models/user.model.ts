import BaseModel from "./base.model";
import UserSchema from '../schemas/users.schema';
import { IResponses } from "../utils/responses";

export default class UserModal extends BaseModel {

  public constructor() {
    super('users');
  }

  public async createNewUser(user: UserSchema): Promise<IResponses> {
    let connection;
    try {
      connection = await this.conn.getConnection();

      const [[displayNameData], [userEmailData], [userUserNameData]]: any = await Promise.all([
        connection.query(`SELECT id FROM ${this.table} WHERE display_name = ? limit 1`, [user.display_name]),
        connection.query(`SELECT id FROM ${this.table} WHERE email = ?`, [user.email]),
        connection.query(`SELECT id FROM ${this.table} WHERE username = ?`, [user.username]),
      ]);

      if (displayNameData.length > 0) {
        return { success: false, message: 'Display name already exists.' };
      } else if (userEmailData.length > 0) {
        return { success: false, message: 'Email already exists.' };
      } else if (userUserNameData.length > 0) {
        return { success: false, message: 'Username already exists.' };
      } else {
        await connection.query(`INSERT INTO ${this.table} SET ?`, [user]);
        return { success: true, message: 'User created successfully.' };
      }
    } catch (err: any) {
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  public async findByUsername(username: string): Promise<any> {
    try {
      const [rows, fields]: any = await this.conn.query(`SELECT * FROM ${this.table} WHERE username = ?`, [username]);
      return rows[0];
    } catch (err: any) {
      return false;
    }
  }

  public async findByEmail(email: string): Promise<any> {
    try {
      const [rows, fields]: any = await this.conn.query(`SELECT * FROM ${this.table} WHERE email = ?`, [email]);
      return rows[0];
    } catch (err: any) {
      return false;
    }
  }

}
