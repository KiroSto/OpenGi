import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import AgentsScreen from "../../pageObject/AgentsScreen";

describe("Agents test", function () {
  let bls = [];
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
  const agentScreen = new AgentsScreen();

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

  it("saving agent without the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getAgentsButton().click();
    navigation.getAddRowButton().click();
    navigation.getSaveButton().click();
    navigation.getHeaderError().should(
      "have.text",
      "Save cannot be performed. There are one or more invalid inputs. Please check the inputs"
    );
    agentScreen.getNameError().should("have.text", "Please enter the Agent name");
    agentScreen.getBrandErrorMessage().should("have.text", "Please select at least one Brand");
  });
});
