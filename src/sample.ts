await fetch(
  "https://www.youtube.com/youtubei/v1/notification/get_unseen_count?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
  {
    credentials: "include",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json",
      "X-Goog-Visitor-Id": "CgtQaXROa2N1Q2ZyOCjXsO72BQ%3D%3D",
      Authorization: "SAPISIDHASH 1591449690_399603f8460f3bfaa107b37897279c6367cbfa5c",
      "X-Goog-AuthUser": "0",
      "X-Origin": "https://www.youtube.com",
    },
    referrer: "https://www.youtube.com/",
    body:
      '{"context":{"client":{"hl":"en","gl":"AU","visitorData":"CgtQaXROa2N1Q2ZyOCjXsO72BQ%3D%3D","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0,gzip(gfe)","clientName":"WEB","clientVersion":"2.20200605.00.00","osName":"Windows","osVersion":"10.0","browserName":"Firefox","browserVersion":"77.0","screenWidthPoints":1536,"screenHeightPoints":451,"screenPixelDensity":1,"utcOffsetMinutes":600,"userInterfaceTheme":"USER_INTERFACE_THEME_LIGHT"},"request":{"sessionId":"6834071779288050296","internalExperimentFlags":[],"consistencyTokenJars":[]},"user":{},"clientScreenNonce":"V5jbXvP0MIiFwgOI34CwBA","clickTracking":{"clickTrackingParams":"CAkQovoBGAIiEwiK_siKpO3pAhVSR48KHci5DzM="}}}',
    method: "POST",
    mode: "cors",
  }
);
