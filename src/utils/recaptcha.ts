import axios from 'axios';
import validator from 'validator';
import { IResponses } from './responses';

/**
 * @description: This is the interface for recaptcha data
 * @interface RecaptchaData
 * @property {2 | 3} version
 * @property {string} response
 * @property {string} secret
 */
export type RecaptchaData = {
  version: 2 | 3,
  response: string,
  secret: string,
}

/**
 * @description: This function verifies the recaptcha response
 * @param {RecaptchaData} recaptchaData
 * @returns {Promise<IResponses>}
 * @example
 * const recaptchaData: RecaptchaData = {
 *  version: 2,
 * response: ctx.request.body['g-recaptcha-response'],
*/
const getResponse = async (recaptchaData: RecaptchaData): Promise<IResponses> => {
  const { response, secret } = recaptchaData;
  if (!response || !secret || validator.isEmpty(response) || validator.isEmpty(secret)) {
    return { success: false, message: 'Please check the captcha box.' };
  };
  try {
    const result = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secret,
        response: response,
      },
    });
    return { success: false, message: 'Captcha verification failed.', data: result.data };
  }
  catch (err) {
    return { success: false, message: 'Captcha verification failed.' }
  };
}

export default async (recaptchaData: RecaptchaData): Promise<IResponses> => {
  try {
    const result: IResponses = await getResponse(recaptchaData);
    if (result.data && result.data.success) {
      result.success = true;
      switch (recaptchaData.version) {
        case 2:
          return result;
        case 3:
          if (result.data.score >= 0.5)
            return result;
          else
            result.success = false;
        default:
          return result;
      }
    }
    else
      return result;
  } catch (err) {
    return { success: false, message: 'Captcha verification failed.' };
  }
}