import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BrandsScreen from "../../pageObject/BrandsScreen";
import MobiusUsersScreen from "../../pageObject/MobiusUsersScreen";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const brandsScreen = new BrandsScreen();
const mobiusUsers = new MobiusUsersScreen();

describe("Mobius users test", function () {
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

  it("saving mobius user without the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getMobiusUsersButton().click();
    navigation.getAddRowButton().click();
    navigation.getSaveButton().click();
    brandsScreen
      .getHeaderError()
      .should("have.text", "Save cannot be performed. There are one or more invalid inputs. Please check the inputs");
    mobiusUsers.getFirstNameError().should("have.text", "Please enter the User's first name");
    mobiusUsers.getLastNameError().should("have.text", "Please enter the User's last name");
    mobiusUsers.getEmailError().should("have.text", "Please enter the User email");
    mobiusUsers.getAccessLevelError().should("have.text", "Please select the access level");
  });
});
