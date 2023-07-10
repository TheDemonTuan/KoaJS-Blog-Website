import { Redis } from "ioredis";
import { IAuth } from "./authentication.js";

const redisClient = new Redis({
  enableAutoPipelining: true,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis server successfully!');
});

redisClient.on('error', (err) => {
  console.error(`Can't connect to Redis server`, err);
  redisClient.disconnect();
});

// redisClient.monitor((err, monitor: any) => {
//   monitor.on("monitor", (time: any, args: any, source: any, database: any) => {
//     console.log(time + ": " + args + " " + source + " " + database);
//   });
// });

export const setExpired = async (key: string, expire: number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await redisClient.expire(key, expire));
    } catch (err: any) {
      reject(err);
    }
  });
};

//----------------------------------------------------------SESSION----------------------------------------------------------//
const sessionName: string = 'tdt_sid:';

export const setSession = async (sid: string, value: any): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await redisClient.set(sessionName + sid, JSON.stringify(value)));
    } catch (err: any) {
      reject(err);
    }
  });
};

export const getSession = async (sid: string): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await redisClient.get(sessionName + sid);
      if (result) {
        resolve(JSON.parse(result));
      } else {
        resolve(null);
      }
    } catch (err: any) {
      reject(err);
    }
  });
};

export const delSession = async (rid: string, field: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await redisClient.hdel(sessionName + rid, field));
    } catch (err: any) {
      reject(err);
    }
  });
};

export const setSessionExpire = async (sid: string, expire: number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await redisClient.expire(sessionName + sid, expire));
    } catch (err: any) {
      reject(err);
    }
  });
};

//----------------------------------------------------------USER----------------------------------------------------------//

//------------------------------------INFO------------------------------------//

const userInfoName: string = 'tdt_users-info';

//------------------------------------TOKEN------------------------------------//
const userTokenName = 'tdt_token:';

export const setToken = async (uid: string, tid: string, value: any): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await redisClient.hset(userTokenName + uid, tid, JSON.stringify(value))
      resolve(result);
    } catch (err: any) {
      reject(err);
    }
  });
};

export const getToken = async (uid: string, tid: string): Promise<IAuth | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await redisClient.hget(userTokenName + uid, tid);
      if (result) {
        resolve(JSON.parse(result));
      } else {
        resolve(null);
      }
    } catch (err: any) {
      reject(err)
    }
  });
};

export const getAllToken = async (tid: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await redisClient.hgetall(userTokenName + tid);
      if (result) {
        resolve(result);
      } else {
        resolve(null);
      }
    } catch (err: any) {
      reject(err)
    }
  });
};

export const delToken = async (uid: string, tid: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await redisClient.hdel(userTokenName + uid, tid);
      resolve(result);
    } catch (err: any) {
      reject(err);
    }
  });
};

export const setTokenExpire = async (uid: string, expire: number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await redisClient.expire(userTokenName + uid, expire));
    } catch (err: any) {
      reject(err);
    }
  });
};

export default redisClient;
