import AuthService from "../services/AuthService.js";
import { createElem } from "../util/dom.js";

let formLoading = false;
let submitDisabled = true;
let username = "";
let password = "";
const usernameInputElem = document.querySelector("#loginForm__username");
const passwordInputElem = document.querySelector("#loginForm__password");
const formElem = document.querySelector("#loginForm");
let formStatusElem;

function init() {
  setupListeners();

  const isAuthenticated = AuthService.isAuthenticated();
  if (isAuthenticated) {
    window.location.replace("dashboard.html");
  }
}

function setupListeners() {
  usernameInputElem.addEventListener("keydown", (e) => {
    validateFields(usernameInputElem, passwordInputElem);
  });
  passwordInputElem.addEventListener("keydown", (e) => {
    validateFields(usernameInputElem, passwordInputElem);
  });

  usernameInputElem.addEventListener("change", (e) => {
    validateFields(usernameInputElem, passwordInputElem);
    username = e.target.value;
  });
  passwordInputElem.addEventListener("change", (e) => {
    validateFields(usernameInputElem, passwordInputElem);
    password = e.target.value;
  });

  formElem.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });
}

function validateFields(usernameInput, passwordInput) {
  if (usernameInput.value.length > 3 && passwordInput.value.length > 6) {
    submitDisabled = false;
  } else {
    submitDisabled = true;
  }

  toggleSubmitDisabled(submitDisabled);
}

function toggleSubmitDisabled(submitDisabled) {
  const submitButton = document.querySelector("#loginForm__submit");

  if (submitDisabled) {
    submitButton.setAttribute("disabled", submitDisabled);
  } else {
    submitButton.removeAttribute("disabled");
  }
}

async function handleSubmit() {
  formLoading = true;
  formStatusElem?.remove();
  toggleSubmitDisabled(true);
  try {
    await AuthService.login(username, password);
    window.location.replace("dashboard.html");
  } catch (err) {
    createFormSubmitStatusElem("Could not login. Please try again.");
    console.log("could not login");
  } finally {
    formLoading = false;
    toggleSubmitDisabled(false);
  }
}

function createFormSubmitStatusElem(formSubmitStatus) {
  const defaultClasses = ["font-thin", "mb-8", "text-center", "text-red-500"];
  formStatusElem = createElem("p", "", formSubmitStatus);
  formStatusElem.classList.add(...defaultClasses);
  formElem.prepend(formStatusElem);
}

init();
