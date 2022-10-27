import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();

let bls = [],
  socketServer;
describe("Edit product details in brand test", function () {
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
  it("editing product details in the brand screen", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
    businessLinesProductsScreen.getTableTogglesProduct(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    brandsScreen.getBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    brandsScreen.getSelectProductsButton().click();
    brandsScreen.getTableTogglesProduct(0,0);
    navigation.getBladeCloseButton().click();
    brandsScreen.editProduct(1);
    brandsScreen.getNewBusinessCommissionFee().type("1");
    brandsScreen.getMidTermAdjustmentCommissionFee().type("2");
    brandsScreen.getRenewalsCommissionFee().type("3");
    businessLinesProductsScreen.getProductSubmitButton().click();
  });
});
