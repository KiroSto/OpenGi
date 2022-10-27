import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import Navigation from "../../pageObject/Navigation";
import BrandsScreen from "../../pageObject/BrandsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";
import AgentsScreen from "../../pageObject/AgentsScreen";

const baseUrl = "https://localhost:3000/";
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const navigation = new Navigation();
const agentsScreen = new AgentsScreen();
let socketServer;

describe("Deleting brand", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
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

  it("deleting brand without deleting the other dependencies", function () {
    initialStepAfterLogin();
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    //brandsScreen.getBrand().type("test");
    //brandsScreen.getEmail().type("test@test.com");
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getAgentsButton().click();
    navigation.getAddRowButton().click();
    agentsScreen.getName().type("test");
    agentsScreen.getSelectBrandsButton().click();
    agentsScreen.getTableTogglesAgent(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getBrandsButton().click();
    brandsScreen.deleteBrand(1);
    //cy.get("#brands-table-delete-1").click();
    navigation.getPopupTitle().should("have.text", "The Brand cannot be deleted");
    navigation
      .getPopupParagraph().should(
      "have.text",
      "WARNING: This Brand is being linked to one or more Agents, Introducers and/or Additional Bank Accounts. Please make sure no Agents, Introducers and/or Additional Bank Accounts are linked to this Brand before deleting"
    );
    navigation.getLeftButton().click();
  });
});
