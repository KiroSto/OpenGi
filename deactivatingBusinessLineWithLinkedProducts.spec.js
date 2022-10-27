import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import Navigation from "../../pageObject/Navigation";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const navigation = new Navigation();
let socketServer;
describe("Deactivate business line with linked products test", function () {
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
    it.only("deactivating business line with linked products in the business lines and products screen", function () {
        initialStepAfterLogin();
        navigation.getBusinessLinesProductsButton().click();
        businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
        navigation.getBladeCloseButton().click();
        businessLinesProductsScreen.getSelectProductsButton().click();
        businessLinesProductsScreen.getTableTogglesProduct(0,0);
        navigation.getBladeCloseButton().click();
        businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
        navigation.getPopupTitle().should('have.text',"Are you sure you want to deactivate this Business Line?");
        navigation
        .getPopupParagraph().should('have.text',"WARNING: If you click yes, this Business Line and all related Products will be deactivated. Any Delegated Products for this Business Line will be deleted. Any related configuration will be lost.");
        navigation.getRightButton().click();
        navigation.getBladeCloseButton().click();
    });  
});