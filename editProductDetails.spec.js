import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();

let bls = [],
  socketServer;
describe("Edit product details test", function () {
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

    bls = mockServer.setBLsLocalStorage();
  });

  afterEach(() => {
    socketServer.close();
  });
  it("editing product details in the business lines and products screen", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
    businessLinesProductsScreen.getTableTogglesProduct(0,0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.editProduct(1);
    businessLinesProductsScreen.getBrokerSuffix().type("5");
    businessLinesProductsScreen.getBrokerRange().type("6");
    businessLinesProductsScreen.getInsurerPrefix().type("7");
    businessLinesProductsScreen.getInsurerSuffix().type("8");
    businessLinesProductsScreen.getInsurerRange().type("9");
    businessLinesProductsScreen.getProductSubmitButton().click();
  });
});
