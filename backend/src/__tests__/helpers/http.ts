import * as chai from "chai";
import { request, default as chaiHttp } from "chai-http";
import { after } from "mocha";
import { app } from "./test-app";

chai.use(chaiHttp);

export const { expect } = chai;

let agent: ReturnType<typeof request.execute> | null = null;

export function createRequest() {
  if (!agent) {
    agent = request.execute(app).keepOpen();
  }
  return agent;
}

export function closeRequest() {
  if (agent) {
    agent.close();
    agent = null;
  }
}

after(() => {
  closeRequest();
});
