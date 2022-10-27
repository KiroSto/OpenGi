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
describe("Confirmation Popup - No Recent Activity popup click Try Again button", function () {
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
    cy.clock(Date.now());

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
  it("confirmation popup - no recent activity popup click try again button", function () {
    cy.visit(baseUrl, {
        onBeforeLoad(win) {
          win.activeTime = cy.activeTime;
        },
      }).then(() => {
        cy.get("#logout", { timeout: 10000 }).then(() => {

    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getNextButton().click();
    navigation.getAddRowButton().click();
    fillAllInputs();
    businessLinesProductsScreen.getSelectBusinessLinesButton().click();
    businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
    businessLinesProductsScreen.getBladeCloseButton().click();
    navigation.getSaveButton().click();
          navigation.getBrandsButton().click();
          brandsScreen.editBrand(1);
          cy.tick(cy.activeTime + 1);
          const btn = cy.get(`button[id="tryAgain"]`);
          btn.should("exist");
          btn.click();
          cy.get(`button[id="button-add-row-dlg"]`).should("have.text", "Add Brand");
        });
      });
    });
});

