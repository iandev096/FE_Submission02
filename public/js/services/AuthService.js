import { ERROR } from "../constants/error.js";
import JWTService from "./JWTService.js";

const API_URL = `https://freddy.codesubmit.io`;

export class AuthService {
  #jwtService;

  constructor() {
    this.#jwtService = JWTService;
  }

  handleAccessTokenExpired(fn) {
    this.#jwtService.subscribeAccessExp(fn);
  }

  /**
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Could not login");
      }

      const data = await response.json();

      this.#jwtService.setAccessToken(data.access_token);
      this.#jwtService.setRefreshToken(data.refresh_token);

      return data;
    } catch (err) {
      throw err;
    }
  }

  logout() {
    this.#jwtService.clearJwt();
    this.#jwtService.unsubscribeAccess();
  }

  isAuthenticated() {
    const jwtData = this.#jwtService.get();
    if (!jwtData) {
      return false;
    }
    const refreshTokenIsValid = jwtData.refreshTokenExpAt - Date.now() > 0;
    return refreshTokenIsValid;
  }

  async refreshAuth() {
    const isAuthenticated = this.isAuthenticated();
    if (isAuthenticated) {
      try {
        const refreshToken = this.#jwtService.get().refreshToken;
        const response = await fetch(`${API_URL}/refresh`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (response.status !== 200) {
          throw new Error(ERROR.REFRESH_FAILED);
        }

        const data = await response.json();
        this.#jwtService.setAccessToken(data.access_token);

        return data.access_token;
      } catch (err) {
        throw err;
      }
    } else {
      throw new Error(ERROR.NOT_AUTHENTICATED);
    }
  }
}

const instance = new AuthService();
Object.freeze(instance);

export default instance;
