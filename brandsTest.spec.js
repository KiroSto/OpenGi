import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BrandsScreen from "../../pageObject/BrandsScreen";

describe("Brands test", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
  const brandsScreen = new BrandsScreen();
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

  it("saving brand without the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getBrandsButton().click();
    navigation.getAddRowButton().click();
    navigation.getSaveButton().click();
    brandsScreen.getHeaderError().should(
      "have.text",
      "Save cannot be performed. There are one or more invalid inputs. Please check the inputs"
    );
    cy.get("#brand-error").should("have.text", "Please enter the Brand name");
    cy.get("#email-error").should("have.text", "Please enter the Brand email");
    brandsScreen.getBlError().should("have.text", "Please select at least one Business Line");
    navigation.getCancelButton().click();
    brandsScreen.getHeaderError().should("have.text", "Please add at least one Brand");
  });
});
