import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import { fillAllInputs } from "../../utils/fillOutAllFields";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import IntroducersScreen from "../../pageObject/IntroducersScreen";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const introducersScreen = new IntroducersScreen();

describe("Adding introducer test", function () {
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

  it.only("saving introducer with all the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    navigation.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getIntroducersButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    introducersScreen.getSelectBrandsButton().click();
    introducersScreen.getTableTogglesIntroducers(0,0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    introducersScreen.editIntroducer(1);
    //cy.get("#introducers-table-edit-1").click();
    cy.get("#name").clear().type("test1");
    navigation.getSaveButton().click();
    // check added introducer exists in table
  });
});