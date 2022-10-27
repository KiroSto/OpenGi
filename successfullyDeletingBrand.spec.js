import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import AgentsScreen from "../../pageObject/AgentsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";

const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const agentsScreen = new AgentsScreen();

let bls = [],
  socketServer;

describe("Successfully deleting brand test", function () {
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
  it.only("deleting brand by deleting all of the other dependencies", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(1, 1);
    navigation.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    //brandsScreen.getBrand().type("test");
    //brandsScreen.getEmail().type("test@test.com");
    fillAllInputs();
    brandsScreen.getBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 1);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getAgentsButton().click();
    navigation.getAddRowButton().click();
    agentsScreen.getName().type("test");
    agentsScreen.getSelectBrandsButton().click();
    agentsScreen.getTableTogglesAgent(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    agentsScreen.deleteFirstAgent(1).click();
    navigation.getPopupTitle().should("have.text", "Are you sure you want to delete this Agent?");
    navigation.getPopupParagraph().should("have.text", "WARNING: If you click yes, this Agent's details will be lost.");
    navigation.getRightButton().click();
    navigation.getBrandsButton().click();
    brandsScreen.deleteBrand(1).click({force: true});
    navigation.getPopupTitle().should("have.text", "Are you sure you want to delete this Brand?");
    navigation.getPopupParagraph().should("have.text", "WARNING: If you click yes, this Brand's details will be lost.");
    navigation.getRightButton().click();
  });
});
