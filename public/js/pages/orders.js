import { ERROR } from "../constants/error.js";
import AuthService from "../services/AuthService.js";
import OrdersService from "../services/OrdersService.js";
import { createAuthModal } from "../util/authModal.js";
import { createElem } from "../util/dom.js";
import { handleNavLogout } from "../util/logout.js";
import { numToReadable } from "../util/numbers.js";

let orders = [];
let page = 1;
let searchTerm = "";
let searchPage = 1;

function init() {
  const isAuthenticated = AuthService.isAuthenticated();
  if (!isAuthenticated) {
    window.location.replace("login.html");
  }

  initialzeParams();
  renderPageLabel();

  fetchPageData(handleDataFetchSuccess);
}

async function fetchPageData(onSuccess, tries = 0) {
  try {
    const data = await OrdersService.fetchOrders({ page, q: searchTerm });
    orders = data;
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
      // TODO: show network error modal
      console.error(err);
    }
  }
}

const showAuthModal = () => {
  const modalElem = createAuthModal();
  const mainElem = document.querySelector("main");
  mainElem.append(modalElem);
};

function handleDataFetchSuccess() {
  console.log(orders);
  if (orders.length === 0) {
    renderBackComponent();
    return;
  }
  enablePageNavButtons();
  renderOrdersTable();
  handleSearch();
  handleNavLogout();
  AuthService.handleAccessTokenExpired(showAuthModal);
}

function renderBackComponent() {
  const tableSkeletonElem = document.querySelector("#tableSkeleton");
  tableSkeletonElem.classList.toggle("animate-pulse");
  tableSkeletonElem.classList.add("flex", "justify-center", "items-center");
  const goBackElem = createElem("div");
  goBackElem.classList.add("text-center", "py-8", "px-6", "mx-auto");
  const goBackText = createElem("p", "", "No results found.");
  goBackText.classList.add("uppercase", "font-bold");
  const goBackButton = createElem("button", "", "Go Back");
  goBackButton.classList.add("bg-black", "text-white", "px-4", "py-2");
  goBackButton.addEventListener("pointerup", () => {
    loadPage(1);
  });

  goBackElem.append(goBackText, goBackButton);

  tableSkeletonElem.append(goBackElem);

  console.log(tableSkeletonElem);
}

function handleSearch() {
  const searchInputElem = document.querySelector("#searchForm__input");
  const clearSearchElem = document.querySelector("#clearSearch");
  const searchFormElem = document.querySelector("#searchForm");

  if (searchTerm.trim().length > 1) {
    searchInputElem.value = searchTerm;
    clearSearchElem.classList.remove("hidden");
    clearSearchElem.addEventListener("pointerup", (e) => {
      e.preventDefault();
      searchPage = 1;
      loadPage(1);
    });
  } else {
    clearSearchElem.classList.add("hidden");
  }

  searchInputElem.addEventListener("keyup", () => {
    toggleSeachButtonDisabled(searchInputElem);
  });
  searchInputElem.addEventListener("change", (e) => {
    toggleSeachButtonDisabled(searchInputElem);
    searchTerm = e.target.value;
  });
  searchFormElem.addEventListener("submit", (e) => {
    e.preventDefault();
    loadPage(1, searchTerm);
  });
}

function toggleSeachButtonDisabled(searchInputElem) {
  const searchButtonElem = document.querySelector("#searchButton");

  if (searchInputElem.value.trim().length > 1) {
    searchButtonElem.removeAttribute("disabled");
  } else {
    searchButtonElem.setAttribute("disabled", true);
  }
}

function enablePageNavButtons() {
  const prevElem = document.querySelector("#prev");
  prevElem.removeAttribute("disabled");
  const nextElem = document.querySelector("#next");
  nextElem.removeAttribute("disabled");

  nextElem.addEventListener("pointerup", () => {
    if (searchTerm.trim().length > 0) {
      loadNextPage(searchPage, searchTerm);
    } else {
      loadNextPage(page);
    }
  });
  prevElem.addEventListener("pointerup", () => {
    if (searchTerm.trim().length > 0) {
      loadPrevPage(searchPage, searchTerm);
    } else {
      loadPrevPage(page);
    }
  });
}

function incrementPage(page) {
  return page + 1;
}
function decrementPage(page) {
  return page - 1 > 0 ? page - 1 : 0;
}

function renderOrdersTable() {
  const tableElem = document.querySelector("#table");

  const tableHeaderElem = createElem("div");
  tableHeaderElem.classList.add(
    "ordersGrid",
    "font-bold",
    "text-xs",
    "uppercase"
  );
  tableHeaderElem.append(
    createElem("h2", "", "Product Name"),
    createElem("h2", "", "Date"),
    createElem("h2", "", "Price($)"),
    createElem("h2", "", "Status")
  );

  const tableBodyElem = createElem("div");
  tableBodyElem.classList.add("h-fit", "max-h-[70vh]", "overflow-y-scroll");

  const statusClass = {
    processing: "processing",
    delivered: "delivered",
    shipped: "shipped",
  };
  for (const item of orders) {
    const tableRowElem = createElem("div", ".ordersGrid");
    const productNameElem = createElem("p", "", item.productName);
    productNameElem.title = item.productName;
    tableRowElem.append(
      productNameElem,
      createElem("p", "", new Date(item.date).toDateString()),
      createElem("p", "", numToReadable(item.price)),
      createElem("p", ".capitalize", item.status)
    );
    tableRowElem.classList.add(statusClass[item.status]);
    tableBodyElem.append(tableRowElem);
  }

  tableElem.replaceChildren(tableHeaderElem, tableBodyElem);
}

function initialzeParams() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  page = Number(params.page) ?? page;

  searchTerm = params.q ?? "";
}

function renderPageLabel() {
  const pageLabelElem = document.querySelector("#pageLabel");
  pageLabelElem.textContent = `Page ${page}`;
}

function loadNextPage(page, searchTerm = "") {
  window.location.assign(
    `orders.html?page=${incrementPage(page)}&q=${encodeURIComponent(
      searchTerm
    )}`
  );
}

function loadPrevPage(page, searchTerm = "") {
  window.location.assign(
    `orders.html?page=${decrementPage(page)}&q=${encodeURIComponent(
      searchTerm
    )}`
  );
}

function loadPage(page, searchTerm = "") {
  window.location.assign(
    `orders.html?page=${page}&q=${encodeURIComponent(searchTerm)}`
  );
}

init();
