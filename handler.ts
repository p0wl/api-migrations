import { stringify } from "querystring";
import fetch from "node-fetch";

import { prepare, postprocess as doPostProcess } from "./src/index";

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
      const postprocessed = doPostProcess({ request, response, version });

      cb(null, {
        statusCode: 200,
        body: JSON.stringify(postprocessed.response)
      });
    });
};

export const preprocess = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  console.log("PREPROCESS GOT REQUEST", request);
  callback(null, request);
};

export const postprocess = (event, context, callback) => {
  const response = event.Records[0].cf.response;
  console.log("POSTPROCESS GOT RESPONSE", response);
  callback(null, response);
};

// require("./debug.js");
