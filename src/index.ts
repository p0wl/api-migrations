import { VERSIONS } from "./versions";

function changesToApply(userVersion) {
  return Object.keys(VERSIONS).reduce((changes, changeVersion) => {
    if (userVersion <= changeVersion) {
      changes = changes.concat(VERSIONS[changeVersion]);
    }
    return changes;
  }, []);
}

export function prepare({ request, response, version }) {
  const changes = changesToApply(version);

  if (!changes.length) {
    return { request, response, version };
  }

  return changes.reduce((mem, change) => change.prepare(mem), {
    request,
    response,
    version
  });
}

export function postprocess({ request, response, version }) {
  const changes = changesToApply(version);

  if (!changes.length) {
    return { request, response, version };
  }

  return changes.reduce((mem, change) => change.postprocess(mem), {
    request,
    response,
    version
  });
}
