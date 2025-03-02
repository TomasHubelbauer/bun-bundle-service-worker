export default function trimUrl(url: URL) {
  if (url.origin === location.origin) {
    return url.pathname;
  }

  return url.href;
}
