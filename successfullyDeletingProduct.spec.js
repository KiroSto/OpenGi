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

let bls = [],
  socketServer;
describe("Successfully deleting product test", function () {
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
  it.only("deleting product by deleting all of the other dependencies", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(1, 1);
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
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 1);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
    businessLinesProductsScreen.getTableTogglesProduct(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    brandsScreen.deleteBrand(1);
    navigation.getPopupTitle().should("have.text", "Are you sure you want to delete this Brand?");
    navigation.getPopupParagraph().should("have.text", "WARNING: If you click yes, this Brand's details will be lost.");
    navigation.getRightButton().click();
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.deleteDelegatedProduct(1);
    navigation.getPopupTitle().should("have.text", "Are you sure you want to delete this Product?");
    navigation
      .getPopupParagraph()
      .should(
        "have.text",
        "WARNING: If you click yes, this Product will be  deleted. Any related configuration will also be lost."
      );
    navigation.getRightButton().click();
  });
});
