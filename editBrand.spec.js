import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import Navigation from "../../pageObject/Navigation";
import BrandsScreen from "../../pageObject/BrandsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";
import AgentsScreen from "../../pageObject/AgentsScreen";
import IntroducersScreen from "../../pageObject/IntroducersScreen";
import AccountsScreen from "../../pageObject/AccountsScreen";

const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const agentsScreen = new AgentsScreen();
const baseUrl = "https://localhost:3000/";
const introducersScreen = new IntroducersScreen();
const accountsScreen = new AccountsScreen();

describe("Editing brand test", function () {
  let socketServer;
  const baseUrl = "https://localhost:3000/";
  const navigation = new Navigation();
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

  it.only("editing brand and matching the other dependencies to it", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    //brandsScreen.getBrand().type("test");
    //brandsScreen.getEmail().type("test@test.com");
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getAgentsButton().click();
    navigation.getAddRowButton().click();
    agentsScreen.getName().type("test");
    agentsScreen.getSelectBrandsButton().click();
    agentsScreen.getTableTogglesAgent(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getIntroducersButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    introducersScreen.getSelectBrandsButton().click();
    introducersScreen.getTableTogglesIntroducers(0,0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getAccountsButton().click();
    //cy.get("#startDate").click("${today}{enter}");
    accountsScreen.getStartDate().click();
    accountsScreen.getStartDate().type("2020-01-01");
    accountsScreen.getAddAccountsButton().click();
    accountsScreen.getBankAccountName().type("test");
    accountsScreen.getTableTogglesBrands(0, 0);
    accountsScreen.getSaveAccountButton().click();
    navigation.getBrandsButton().click();
    brandsScreen.editBrand(1);
    //cy.get("#brands-table-edit-1").click();
    cy.get("#brand").clear().type("test1");
    navigation.getSaveButton().click();
    navigation.getAgentsButton().click();
    agentsScreen.editAgent(1);
    //cy.get("#agents-table-edit-1").click();
    cy.get("#pill-brands-0").should("have.text", "test1");
    navigation.getIntroducersButton().click();
    introducersScreen.editIntroducer(1);
    //cy.get("#introducers-table-edit-1").click();
    cy.get("#pill-brands-0").should("have.text", "test1");
    navigation.getAccountsButton().click();
    accountsScreen.getEditSelectedRow(1);
    cy.get("#table-data-label-2").should("have.text", "test1");
});
});