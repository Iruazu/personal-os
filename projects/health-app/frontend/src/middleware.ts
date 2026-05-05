export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api/auth/|_next/static|_next/image|icons/|manifest\\.json|sw\\.js|favicon\\.ico|login$|login/).*)"],
};
