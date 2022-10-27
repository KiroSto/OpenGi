import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import IntroducersScreen from "../../pageObject/IntroducersScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const brandsScreen = new BrandsScreen();
const introducersScreen = new IntroducersScreen();

describe("Introducers test", function () {
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

  it("saving introducer without the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getIntroducersButton().click();
    navigation.getAddRowButton().click();
    navigation.getSaveButton().click();
    brandsScreen.getHeaderError().should(
      "have.text",
      "Save cannot be performed. There are one or more invalid inputs. Please check the inputs"
    );
    introducersScreen.getNameError().should("have.text", "Please enter the Introducer name");
    introducersScreen.getBrandErrorMessage().should("have.text", "Please select at least one Brand");
  });
});
