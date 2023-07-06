import { Pool } from 'mysql2/promise';
import pool from '../utils/db'

class BaseModel {

  protected table: string;
  protected conn: Pool = pool.promise();

  protected constructor(table: string) {
    this.table = table;
  }

  public async findAll() {
    try {
      const [rows, fields]: any = await this.conn.query(`SELECT * FROM ${this.table}`);
      return rows;
    } catch (err: any) {
      return false;
    }
  };

  // public findById(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     pool.query(`SELECT * FROM ${this.table} WHERE id = ?`, [id], (err, result) => {
  //       if (err) reject(err);
  //       resolve(result);
  //     });
  //   });
  // }

  // public create(data: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     pool.query(`INSERT INTO ${this.table} SET ?`, [data], (err, result) => {
  //       if (err) reject(err);
  //       resolve(result);
  //     });
  //   });
  // };

  // public updateById(id: number, data: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     pool.query(`UPDATE ${this.table} SET ? WHERE id = ?`, [data, id], (err, result) => {
  //       if (err) reject(err);
  //       resolve(result);
  //     });
  //   });
  // };

  // public deleteById(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     pool.query(`DELETE FROM ${this.table} WHERE id = ?`, [id], (err, result) => {
  //       if (err) reject(err);
  //       resolve(result);
  //     });
  //   });
  // };

}

export default BaseModel;