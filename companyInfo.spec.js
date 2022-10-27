import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import { clickAllInputs } from "../../utils/fillOutAllFields";
import Navigation from "../../pageObject/Navigation";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
// eslint-disable-next-line no-unused-vars
let socketServer;

describe("Company info", function () {
  let socketServer;
    const baseUrl = "https://localhost:3000/";
    
  beforeEach(() => {
    cy.server();

    cy.route(mockServer.getEmptyBroker);
    cy.route(mockServer.putBroker);
    cy.route(mockServer.getProductsList);
    cy.route(mockServer.getBusinessLinesList);
    cy.route(mockServer.getAccessLevelsList);
    cy.route(mockServer.getSingleConnectedUser);
    cy.route(mockServer.getSocketPolling);

    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        cy.stub(win, "WebSocket", (url) => {
          return (socketServer = new MockSocket.WebSocket(url));
        });
      },
    });
  });

  afterEach(() => {
    socketServer.close();
  });

  it("saving company without the mandatory fields", function () {
    initialStepAfterLogin();
    clickAllInputs();
    cy.get("#company-error").should("have.text", "Please enter the Company name");
    cy.get("#address-error").should("have.text", "Please enter the Company address");
    cy.get("#postCode-error").should("have.text", "Please enter the Company postcode");
    cy.get("#email-error").should("have.text", "Please enter the Company email");
    cy.get("#tel-error").should("have.text", "Please enter the Company telephone");
    cy.get("#name-error").should("have.text", "Please enter the main contact name");
    cy.get(":nth-child(2) > .css-p1ue26-Field > #email-error").should(
      "have.text",
      "Please enter the main contact email"
    );
  });
});
