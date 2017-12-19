import { parse, stringify } from "querystring";

const typeParam = /(?:^|&)type=/gim;
const managedParam = /(?:^|&)managed=(true|false)(?:&|$)/gim;

export default {
  description: "account s is true when account type is custom",
  prepare: ({ request, response, version }) => {
    // Migration only applies to POST /v1/accounts
    if (request.path !== "/v1/accounts" || request.httpMethod !== "POST") {
      return { request, response, version };
    }

    const params = parse(request.body);

    if (params.type) {
      return { request, response, version };
    }

    params.type = params.managed === "true" ? "custom" : "standard";
    delete params.managed;

    request.body = stringify(params);

    return { request, response, version };
  },
  postprocess: ({ request, response, version }) => {
    // Migration only applies to POST /v1/accounts
    if (request.path !== "/v1/accounts" || request.httpMethod !== "POST") {
      return { request, response, version };
    }

    response.managed = response.type === "custom";
    delete response.type;

    return { request, response, version };
  }
};
