import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import Navigation from "../../pageObject/Navigation";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../../pageObject/BrandsScreen";
import AccountsScreen from "../../pageObject/AccountsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";

const navigation = new Navigation();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const accountsScreen = new AccountsScreen();
let socketServer;

describe("Accounts test", function () {
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

  it.only("saving account without the mandatory fields", function () {
    initialStepAfterLogin();

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
    navigation.getBladeCloseButton().click();
    navigation.getSaveButton().click();
    navigation.getAccountsButton().click();
    navigation.getNextButton().click();
    navigation.getAccountsButton().click();
    accountsScreen.getFinancialYear12().select("No");
    accountsScreen.getStartDate().click();
    accountsScreen.getEndDate().click();
    accountsScreen.getMainBankAccountName().click();
    cy.get("#startDate-error").should("have.text", "Please select the start date");
    cy.get("#endDate-error").should("have.text", "Please select the end date");
    accountsScreen.getAddAccountsButton().click();
    accountsScreen.getSaveAccountButton().click();
    cy.get("#header-error").should(
      "have.text",
      "Save cannot be performed. There are one or more invalid inputs. Please check the inputs"
    );
    cy.get("#bankAccount-name-error").should("have.text", "Please enter a bank account name");
    cy.get("#brand-error-label").should("have.text", "Please select at least one Brand from the list");
    cy.get("#bankAccounts-cancelButton").click();
  });
});
