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
describe("Existing bug", function () {
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
  it("existing bug", function () {
    initialStepAfterLogin();
    fillAllInputs();
    navigation.getNextButton().click();
    businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
      businessLinesProductsScreen.getCreateBespokeBLName().type("Bespoke BL 1");
      businessLinesProductsScreen.saveBespokeBusinessLine();
      businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
      businessLinesProductsScreen.getCreateBespokeBLName().type("Bespoke BL 2");
      businessLinesProductsScreen.saveBespokeBusinessLine();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsType().select("Bespoke BL 2");
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsProductName().type("Product 2", { force: true });
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsInsurerName().type("Insurer 2", { force: true });
      businessLinesProductsScreen.saveDAProducts();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsType().select("Bespoke BL 1");
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsProductName().type("Product 1", { force: true });
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsInsurerName().type("Insurer 1", { force: true });
      businessLinesProductsScreen.saveDAProducts();
      navigation.getNextButton().click();
      navigation.getAddRowButton().click();
      brandsScreen.getBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(1, 0);
      navigation.getBladeCloseButton().click();
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().contains("Bespoke BL 1").should("not.exist");
      navigation.getBladeCloseButton().click();
      navigation.getBusinessLinesProductsButton().click();
      navigation.getLeftButton().click();
    });
});