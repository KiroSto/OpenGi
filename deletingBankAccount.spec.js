import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import AccountsScreen from "../../pageObject/AccountsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const accountsScreen = new AccountsScreen();

const baseUrl = "https://localhost:3000/";

let socketServer;

describe("Deleting account test", function () {
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

  it.only("deleting account", function () {
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
    navigation.getAccountsButton().click();
    accountsScreen.getStartDate().click();
    accountsScreen.getStartDate().type("2020-01-01");
    accountsScreen.getAddAccountsButton().click();
    accountsScreen.getBankAccountName().type("test");
    accountsScreen.getTableTogglesBrands(0, 0);
    accountsScreen.getSaveAccountButton().click();
    accountsScreen.getDeleteSelectedRow(1);
    //cy.get("#bank-accounts-table-delete-1").click();
    navigation.getPopupTitle().should('have.text',"Are you sure you want to delete this Bank Account?");
    navigation
    .getPopupParagraph().should('have.text',"WARNING: If you click yes, this Bank Account will be deleted");
    navigation.getRightButton().click();
  });
});