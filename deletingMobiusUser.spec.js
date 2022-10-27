import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import MobiusUsers from "../../pageObject/MobiusUsersScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

describe("Deleting mobius user test", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
  const mobiusUsers = new MobiusUsers();

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

  it("deleting mobius user", function () {
    initialStepAfterLogin();
    navigation.getMobiusUsersButton().click();
    navigation.getAddRowButton().click();
    cy.get("#accessLevel").select("Administrator");
    fillAllInputs();
    navigation.getSaveButton().click();
    mobiusUsers.deleteMobiusUser(1);
    navigation.getPopupTitle().should("have.text", "Are you sure you want to delete this Mobius User?");
    navigation
      .getPopupParagraph()
      .should("have.text", "WARNING: If you click yes, this Mobius User's details will be lost.");
    navigation.getRightButton().click();
  });
});
