const JWT_KEY = "__HAHA__ ";

export class JWTService {
  #accessSubscriberFns = [];
  #refreshSubscriberFns = [];
  #accessTimeout;
  #refreshTimeout;

  constructor() {
    this.initialize();
  }

  /**
   * @returns {{accessToken: string, refreshToken: string, accessTokenExpAt: number, refreshTokenExpAt: number} | undefined}
   */
  get() {
    return JSON.parse(localStorage.getItem(JWT_KEY));
  }

  /**
   * @param {{accessToken: string, refreshToken: string, accessTokenExpAt: number, refreshTokenExpAt: number}} data
   */
  #set(data) {
    const prev = this.get() ?? {};
    const value = {
      ...prev,
      ...data,
    };

    localStorage.setItem(JWT_KEY, JSON.stringify(value));
  }

  /**
   * @param {string} token
   * @param {number} expAt
   * Date.now() + 15 * 60 * 1000 - 15min from now
   */
  setAccessToken(token, expAt = Date.now() + 15 * 60 * 1000) {
    this.#set({ accessToken: token, accessTokenExpAt: expAt });
  }

  /**
   * @param {string} token
   * @param {number} expAt
   * Date.now() + 30 * 24 * 60 * 60 * 1000 - 30days from now
   */
  setRefreshToken(token, expAt = Date.now() + 30 * 24 * 60 * 60 * 1000) {
    this.#set({ refreshToken: token, refreshTokenExpAt: expAt });
  }

  /**
   * @param {{accessToken: string, refreshToken: string, accessTokenExpAt: number, refreshTokenExpAt: number}} jwtData
   */
  initialize(jwtData) {
    const jwtData = this.get();

    if (!jwtData) {
      return;
    }

    const accessTokenExpTimeout = jwtData.accessTokenExpAt - Date.now();
    const refreshTokenExpTimeout = jwtData.refreshTokenExpAt - Date.now();

    if (accessTokenExpTimeout <= 0) {
      this.notifyAccessExpSubscribers();
    }
    if (refreshTokenExpTimeout <= 0) {
      this.notifyRefreshExpSubscribers();
    }

    this.#accessTimeout = setTimeout(
      this.notifyAccessExpSubscribers,
      accessTokenExpTimeout
    );
    this.#refreshTimeout = setTimeout(
      this.notifyRefreshExpSubscribers,
      refreshTokenExpTimeout
    );
  }

  notifyAccessExpSubscribers() {
    for (const fn of this.#accessSubscriberFns) {
      fn();
    }
    clearTimeout(this.#accessTimeout);
  }

  notifyRefreshExpSubscribers() {
    for (const fn of this.#refreshSubscriberFns) {
      fn();
    }
    clearTimeout(this.#refreshTimeout);
  }

  /**
   * @param {function} fn
   */
  subscribeAccessExp(fn) {
    this.#accessSubscriberFns.push(fn);
  }
  /**
   * @param {function} fn
   */
  subscribeRefreshExp(fn) {
    this.#refreshSubscriberFns.push(fn);
  }

  unsubscribeAll() {
    clearTimeout(this.#accessTimeout);
    clearTimeout(this.#refreshTimeout);
    this.#accessSubscriberFns = [];
    this.#refreshSubscriberFns = [];
  }
}

const instance = new JWTService();
Object.freeze(instance);

export default instance;
