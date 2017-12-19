import { stringify } from "querystring";
import fetch from "node-fetch";

import { prepare, postprocess } from "./src/index";

const baseURL = "https://api.stripe.com";
const version = "2017-02-25";
const proxyHeaders = ["Accept", "Authorization", "Content-Type", "User-Agent"];

export const migrate = (event, context, cb) => {
  const { headers, path, httpMethod, body, queryStringParameters } = event;

  const requestHeaders = proxyHeaders.reduce(
    (mem, headerName) => ({ ...mem, [headerName]: headers[headerName] }),
    {}
  );

  const request = { path, httpMethod, body };
  const prepared = prepare({
    request,
    response: {},
    version
  });

  const queryString = queryStringParameters
    ? "?" + stringify(queryStringParameters)
    : "";

  const url = baseURL + path + queryString;

  console.log("FETCHING ", url);
  fetch(url, {
    method: httpMethod,
    body: prepared.request.body,
    headers: requestHeaders
  })
    .then(res => res.json())
    .then(response => {
      const postprocessed = postprocess({ request, response, version });

      cb(null, {
        statusCode: 200,
        body: JSON.stringify(postprocessed.response)
      });
    });
};

// require("./debug.js");
