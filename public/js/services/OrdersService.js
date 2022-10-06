import { ERROR } from "../../constants/error.js";
import { waitFor } from "../util/time.js";
import AuthService from "./AuthService.js";
import JWTService from "./JWTService.js";

const API_URL = `https://freddy.codesubmit.io`;

export class OrdersService {
  #authService;
  #jwtService;

  constructor() {
    this.#authService = AuthService;
    this.#jwtService = JWTService;
  }

  async fetchOrders(queryParams = {}, tries = 0) {
    if (this.#authService.isAuthenticated()) {
      try {
        const accessToken = this.#jwtService.get().accessToken;
        const response = await fetch(
          `${API_URL}/orders?${new URLSearchParams(queryParams)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 401) {
          throw new Error(ERROR.TOKEN_EXPIRED);
        } else if (response.status !== 200 && tries < 3) {
          await waitFor(750);
          return this.fetchOrders(queryParams, tries + 1);
        } else if (response.status !== 200 && tries >= 3) {
          throw new Error(ERROR.DATA_FETCH);
        }

        const data = await response.json();

        return data.orders.map((item) => ({
          productName: item.product.name,
          date: item.created_at,
          price: item.total,
          status: item.status,
          quantity: item.product.quantity,
        }));
      } catch (err) {
        throw err;
      }
    } else {
      throw new Error(ERROR.NOT_AUTHENTICATED);
    }
  }
}

const instance = new OrdersService();
Object.freeze(instance);

export default instance;
