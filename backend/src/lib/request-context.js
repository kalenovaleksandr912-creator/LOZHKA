export function getSpaceId(request) {
  return request.headers["x-space-id"] ?? process.env.DEFAULT_SPACE_ID ?? "demo-space";
}

export function getUserId(request) {
  return request.headers["x-user-id"] ?? process.env.DEFAULT_USER_ID ?? "demo-alex";
}
