import { ERROR } from "../constants/error.js";
import { drawBarChart, updateChart } from "../lib/chart.js";
import AuthService from "../services/AuthService.js";
import DashboardService from "../services/DashboardService.js";
import { createElem } from "../util/dom.js";
import { handleNavLogout } from "../util/logout.js";
import { numToReadable } from "../util/numbers.js";

let bestSellers = [];
let salesOverTimeWeek = [];
let salesOverTimeYear = [];

function init() {
  const isAuthenticated = AuthService.isAuthenticated();
  if (!isAuthenticated) {
    window.location.replace("login.html");
  }

  fetchPageData(handleDataFetchSuccess);
}

const showAuthModal = () => {
  const modalElem = createAuthModal();
  const mainElem = document.querySelector("main");
  mainElem.append(modalElem);
};

async function fetchPageData(onSuccess, tries = 0) {
  try {
    const data = await DashboardService.fetchDashboardData();
    bestSellers = data.bestSellers;
    salesOverTimeWeek = data.salesOverTimeWeek;
    salesOverTimeYear = data.salesOverTimeYear;
    onSuccess();
  } catch (err) {
    if (err.message === ERROR.TOKEN_EXPIRED) {
      AuthService.refreshAuth().then(() => {
        if (tries < 2) {
          fetchPageData(onSuccess, tries + 1);
        }
      });
    } else if (err.message === ERROR.NOT_AUTHENTICATED) {
      window.location.replace("login.html");
    } else {
      // TODO: show nentwork error modal
      console.error(err);
    }
  }
}

function handleDataFetchSuccess() {
  setStats();
  renderRevenueChart();
  renderBestSellersTable();
  handleNavLogout();
  AuthService.handleAccessTokenExpired(showAuthModal);
}

function setStats() {
  const todayElem = document.querySelector("#todayAmt");
  const thisMonthElem = document.querySelector("#thisMonthAmt");
  const lastMonthElem = document.querySelector("#lastMonthAmt");

  const salesForToday = DashboardService.getSalesForToday(salesOverTimeWeek);
  const salesForThisMonth =
    DashboardService.getSalesForThisMonth(salesOverTimeYear);
  const salesForLastMonth =
    DashboardService.getSalesForPrevMonth(salesOverTimeYear);

  setStatElem(todayElem, salesForToday);
  setStatElem(thisMonthElem, salesForThisMonth);
  setStatElem(lastMonthElem, salesForLastMonth);
}
function setStatElem(elem, salesData) {
  elem.className = "text-sm";
  elem.textContent = `$${numToReadable(salesData.total)} / ${numToReadable(
    salesData.orders
  )}`;
}

function renderRevenueChart() {
  const revenueToggleElem = document.querySelector("#revenueToggle");
  const revenueToggleHeadingElem = document.querySelector(
    "#revenueToggleHeading"
  );

  revenueToggleElem.removeAttribute("disabled");

  const chartContainerElem = document.querySelector("#chartContainer");

  const chartElem = createElem("canvas", "#revenueChart");
  chartElem.classList.add("bg-white", "px-3", "pt-5");
  chartContainerElem.replaceChildren(chartElem);

  const ctx = document.querySelector("#revenueChart").getContext("2d");
  const weekData = salesOverTimeWeek.map((item, idx) => ({
    value: item.total,
    label: idx + 1,
  }));
  const yearData = salesOverTimeYear.map((item, idx) => ({
    value: item.total,
    label: idx + 1,
  }));

  const chart = drawBarChart(weekData, ctx);

  revenueToggleElem.addEventListener("change", (e) => {
    const checked = document.querySelector("#revenueToggle:checked") !== null;

    if (checked) {
      updateChart(yearData, chart);
      revenueToggleHeadingElem.textContent = "REVENUE (LAST 12 MONTHS)";
    } else {
      updateChart(weekData, chart);
      revenueToggleHeadingElem.textContent = "REVENUE (LAST 7 DAYS)";
    }
  });
}

function renderBestSellersTable() {
  const tableStageElem = document.querySelector("#tableStage");

  const tableElem = createElem("div");
  tableElem.classList.add("bg-white", "mb-4");

  const tableHeaderElem = createElem("div");
  tableHeaderElem.classList.add(
    "bestSellersGrid",
    "font-bold",
    "text-xs",
    "uppercase"
  );
  tableHeaderElem.append(
    createElem("h2", "", "Product Name"),
    createElem("h2", "", "Price($)"),
    createElem("h2", "", "#Units Sold"),
    createElem("h2", "", "Revenue($)")
  );

  const tableBodyElem = createElem("div");
  for (const item of bestSellers) {
    const tableRowElem = createElem("div", ".bestSellersGrid");
    const productNameElem = createElem("p", "", item.productName);
    productNameElem.title = item.productName;
    tableRowElem.append(
      productNameElem,
      createElem("p", "", numToReadable(item.price)),
      createElem("p", "", numToReadable(item.unitsSold)),
      createElem("p", "", numToReadable(item.revenue))
    );
    tableBodyElem.append(tableRowElem);
  }

  tableElem.append(tableHeaderElem, tableBodyElem);

  tableStageElem.replaceChildren(tableElem);
}

init();
