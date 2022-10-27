import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();

describe("Edit delegated product test", function () {
  let socketServer;
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
  it("editing delegated product", function () {
    initialStepAfterLogin();
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
    fillAllInputs();
    businessLinesProductsScreen.saveDAProducts();
    businessLinesProductsScreen.editDelegatedProduct(1);
    //cy.get("#delegatedAuthorityProducts-table-edit-1").click();
    cy.get("#delegatedAuthorityProducts-name").clear().type("test1");
    cy.get("#delegatedAuthorityProducts-insurer").clear().type("test1");
    businessLinesProductsScreen.saveDAProducts();
  });
});