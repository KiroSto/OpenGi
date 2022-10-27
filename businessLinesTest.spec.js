import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";

describe("Business lines test", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
  const businessLinesProductsScreen = new BusinessLinesProductsScreen();

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

  it("saving business line without the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    navigation.getNextButton().click();
    navigation.getBusinessLinesProductsButton().click();
    navigation.getHeaderError().should("have.text", "Please select or add at least one Business Line");
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
    businessLinesProductsScreen.saveBespokeBusinessLine();
    navigation.getBladeError().should(
      "have.text",
      "Save cannot be performed. There are one or more invalid inputs. Please check the inputs"
    );
    cy.get("#bespokeBusinessLines-name-error").should("have.text", "Please enter the Business Line name");
    businessLinesProductsScreen.cancelBespoke();
    businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
    businessLinesProductsScreen.saveDAProducts();
    navigation.getBladeError().should(
      "have.text",
      "Save cannot be performed. There are one or more invalid inputs. Please check the inputs"
    );
    cy.get("#delegatedAuthorityProducts-name-error").should("have.text", "Please enter the Product name");
    cy.get("#delegatedAuthorityProducts-insurer-error").should("have.text", "Please enter the Insurer name");
    businessLinesProductsScreen.cancelDAProducts();
  });
});
