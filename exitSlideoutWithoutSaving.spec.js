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

describe("Exit a slide-out without saving test", function () {
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

  it("exiting a slide-out by clicking cancel", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
    //businessLinesProductsScreen.getCreateBespokeBLName().type("test");
    fillAllInputs();
    businessLinesProductsScreen.cancelBespoke();
    navigation.getPopupTitle().should("have.text", "All changes will be lost");
    navigation
      .getPopupParagraph()
      .should(
        "have.text",
        "WARNING: You have unsaved changes made which will be lost if you navigate away. Would you like to continue editing?"
      );
    navigation.getLeftButton().click();
  });
});
