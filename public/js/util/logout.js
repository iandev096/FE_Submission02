export function handleNavLogout() {
  const logoutElem = document.querySelector("#logout");
  logoutElem.addEventListener("pointerup", (e) => {
    e.preventDefault();
    AuthService.logout();
    window.location.replace("login.html");
  });
}
