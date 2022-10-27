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
describe("No products", function () {
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
  it("validate screen without products", function () {
    initialStepAfterLogin();
    fillAllInputs();
    navigation.getNextButton().click();
    navigation.getInvalidBusinessLinesProducts().should("not.exist");
    navigation.getBackButton().click();
});
});