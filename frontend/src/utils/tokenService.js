let accessToken = null;

export const setAccessTokenService = (token) => {
  accessToken = token;
};

export const getAccessTokenService = () => accessToken;
