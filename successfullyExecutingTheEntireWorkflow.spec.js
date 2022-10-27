import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import AgentsScreen from "../../pageObject/AgentsScreen";
import IntroducersScreen from "../../pageObject/IntroducersScreen";
import AccountsScreen from "../../pageObject/AccountsScreen";
import MobiusUsersScreen from "../../pageObject/MobiusUsersScreen";
import { fillAllInputs, fillAllSelects } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const agentsScreen = new AgentsScreen();
const introducersScreen = new IntroducersScreen();
const accountsScreen = new AccountsScreen();
const mobiusUsersScreen = new MobiusUsersScreen();

let bls = [],
  socketServer;
describe("Successfully executing the entire workflow test", function () {
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

    //bls = mockServer.setBLsLocalStorage();
  });

  afterEach(() => {
    socketServer.close();
  });
  it("executing the entire workflow with all the mandatory fields", function () {
    initialStepAfterLogin();
    fillAllInputs();

    navigation.getNextButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(1, 1);
    navigation.getBladeCloseButton().click();
    businessLinesProductsScreen.getSelectProductsButton().click();
    businessLinesProductsScreen.getTableTogglesProduct(0, 0);
    businessLinesProductsScreen.getBladeCloseButton().click();
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
    navigation.getIntroducersButton().click();
    navigation.getAddRowButton().click();
    //introducersScreen.getName().type("test");
    fillAllInputs();
    introducersScreen.getSelectBrandsButton().click();
    introducersScreen.getTableTogglesIntroducers(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getPaymentPlansButton().click();
    navigation.getNextButton().click();
    navigation.getAccountsButton().click();
    accountsScreen.getStartDate().click();
    accountsScreen.getStartDate().type("2020-01-02");
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    //mobiusUsersScreen.getFirstName().type("test");
    //mobiusUsersScreen.getLastName().type("test");
    //mobiusUsersScreen.getEmail().type("test@test.com");
    //mobiusUsersScreen.getAccessLevel().select("Administrator");
    fillAllInputs();
        fillAllSelects();
    navigation.getSaveButton().click();
    navigation.getSubmitButton().click();
    navigation.getPopupTitle().should("have.text", "Are you sure you want to submit the form?");
    navigation.getRightButton().click();
    cy.get("#goToForm").click();
  });
});
