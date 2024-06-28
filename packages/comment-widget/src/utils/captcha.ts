export const getCaptchaCodeHeader = (code: string): Record<string, string> => {
  if (!code || code.trim().length === 0) {
    return {};
  }
  return {
    'X-Captcha-Code': code,
  };
};

export const isRequireCaptcha = (response: Response) => {
  return response.status === 403 && response.headers.get('X-Require-Captcha');
};
