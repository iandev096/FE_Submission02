import AuthService from "../services/AuthService.js";
import { createElem } from "./dom.js";

export function createAuthModal() {
  const modalElem = createElem("div", ".modal");
  const modalContentElem = createElem("div", ".modalContent");
  const modalHeadingElem = createElem(
    "h1",
    ".modalHeading",
    "Access Token Expired"
  );
  const modalTextElem = createElem(
    "p",
    ".modalText",
    "Do you want to stay logged in?"
  );
  const modalButtonsElem = createElem("div", ".modalButtons");
  const modalButtonNoElem = createElem("button", ".button", "No");
  const modalButtonYesElem = createElem("button", ".button", "Yes");

  modalButtonNoElem.addEventListener("pointerup", (e) => {
    e.preventDefault();
    AuthService.logout();
    window.location.replace("login.html");
  });
  modalButtonYesElem.addEventListener("pointerup", (e) => {
    e.preventDefault();
    AuthService.refreshAuth();
    window.location.reload();
    onYes();
  });

  modalElem.append(modalContentElem);
  modalContentElem.append(modalHeadingElem);
  modalContentElem.append(modalTextElem);
  modalContentElem.append(modalButtonsElem);
  modalButtonsElem.append(modalButtonNoElem);
  modalButtonsElem.append(modalButtonYesElem);

  return modalElem;
}
