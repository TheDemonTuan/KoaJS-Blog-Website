import BaseModel from './base.model.js';
import UserSchema from '../schemas/users.schema.js';
import { IResponses } from '../utils/responses.js';

export default class UserModal extends BaseModel {

  public constructor() {
    super('users');
  }

  public async createNewUser(user: UserSchema): Promise<IResponses> {
    let connection;
    try {
      connection = await this.conn.getConnection();

      const [[displayNameData], [userEmailData], [userUserNameData]]: any = await Promise.all([
        connection.execute(`SELECT id FROM ${this.table} WHERE display_name = ? limit 1`, [user.display_name]),
        connection.execute(`SELECT id FROM ${this.table} WHERE email = ?`, [user.email]),
        connection.execute(`SELECT id FROM ${this.table} WHERE username = ?`, [user.username]),
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
      return { success: false, message: 'Cant create user, please try again later.' };
    } finally {
      if (connection) connection.release();
    }
  }

  public async findByUsername(username: string): Promise<any> {
    try {
      const [rows, fields]: any = await this.conn.execute(`SELECT * FROM ${this.table} WHERE username = ?`, [username]);
      return rows[0];
    } catch (err: any) {
      return false;
    }
  }

  public async findByEmail(email: string): Promise<any> {
    try {
      const [rows, fields]: any = await this.conn.execute(`SELECT * FROM ${this.table} WHERE email = ?`, [email]);
      return rows[0];
    } catch (err: any) {
      return false;
    }
  }

}
