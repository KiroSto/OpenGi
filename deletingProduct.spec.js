import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();

describe("Deleting product test", function () {
  let socketServer;
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
  it("deleting product without deleting the other dependencies", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
    //businessLinesProductsScreen.getCreateDelegatedAuthorityProductsProductName().type("test");
    //businessLinesProductsScreen.getCreateDelegatedAuthorityProductsInsurerName().type("test");
    fillAllInputs();
    businessLinesProductsScreen.saveDAProducts();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    //brandsScreen.getBrand().type("test");
    //brandsScreen.getEmail().type("test@test.com");
    fillAllInputs();
    brandsScreen.getBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    brandsScreen.getSelectProductsButton().click();
    brandsScreen.getTableTogglesProduct(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getBackButton().click();
    businessLinesProductsScreen.deleteDelegatedProduct(1);
    navigation.getPopupTitle().should("have.text", "This Product cannot be deleted");
    navigation
      .getPopupParagraph()
      .should(
        "have.text",
        "WARNING: This Product is being used by one or more Brands. Please make sure no Brands use this Product before deleting"
      );
    navigation.getLeftButton().click();
  });
});
