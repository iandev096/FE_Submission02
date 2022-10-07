import { ERROR } from "../constants/error.js";
import { waitFor } from "../util/time.js";
import AuthService from "./AuthService.js";
import JWTService from "./JWTService.js";

const API_URL = `https://freddy.codesubmit.io`;

export class DashboardService {
  #authService;
  #jwtService;

  constructor() {
    this.#authService = AuthService;
    this.#jwtService = JWTService;
  }

  async fetchDashboardData(tries = 0) {
    if (this.#authService.isAuthenticated()) {
      try {
        const accessToken = this.#jwtService.get().accessToken;
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          throw new Error(ERROR.TOKEN_EXPIRED);
        } else if (response.status !== 200 && tries < 3) {
          await waitFor(750);
          return this.fetchDashboardData(tries + 1);
        } else if (response.status !== 200 && tries >= 3) {
          throw new Error(ERROR.DATA_FETCH);
        }

        const data = await response.json();

        return {
          bestSellers: data.dashboard.bestsellers.map((item) => ({
            productName: item.product.name,
            revenue: item.revenue,
            unitsSold: item.units,
            price: item.revenue / item.units,
          })),
          salesOverTimeWeek: Object.entries(data.dashboard.sales_over_time_week)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map((entry) => entry[1]),
          salesOverTimeYear: Object.entries(data.dashboard.sales_over_time_year)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map((entry) => entry[1]),
        };
      } catch (err) {
        throw err;
      }
    } else {
      throw new Error(ERROR.NOT_AUTHENTICATED);
    }
  }

  getSalesForToday(weekSales) {
    const day = new Date().getDay();
    return weekSales[day];
  }

  getSalesForThisMonth(monthSales) {
    const month = new Date().getMonth();
    return monthSales[month];
  }

  getSalesForPrevMonth(monthSales, step = 1) {
    let month = new Date().getMonth() - (step % 12);
    if (month < 0) {
      month += 12;
    }
    return monthSales[step];
  }
}

const instance = new DashboardService();
Object.freeze(instance);

export default instance;
