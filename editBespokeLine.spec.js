import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();

let socketServer;

describe("Edit bespoke line test", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
  beforeEach(() => {
    cy.server();

    cy.route(mockServer.postBrokerDetailsDelayed);
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

  it.only("editing bespoke line", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
    //businessLinesProductsScreen.getCreateBespokeBLName().type("test");
    fillAllInputs();
    businessLinesProductsScreen.saveBespokeBusinessLine();
businessLinesProductsScreen.editBespoke(1);
    //cy.get("#bespokeBusinessLines-table-edit-1").click();
    cy.get("#bespokeBusinessLines-name").clear().type("test1");
    businessLinesProductsScreen.saveBespokeBusinessLine();

});
});