import * as mockServer from "../../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import { initialStepAfterLogin } from "../../utils/initialStepAfterLogin";
import BusinessLinesProductsScreen from "../../pageObject/BusinessLinesProductsScreen";
import Navigation from "../../pageObject/Navigation";
import BrandsScreen from "../../pageObject/BrandsScreen";
import { fillAllInputs } from "../../utils/fillOutAllFields";

const baseUrl = "https://localhost:3000/";
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const navigation = new Navigation();

let socketServer;
describe("Deactivate business line in brand test", function () {
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
    it.only("deactivating business line with linked products in the brand screen", function () {
        initialStepAfterLogin();
        navigation.getBusinessLinesProductsButton().click();
        businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
        navigation.getBladeCloseButton().click();
        businessLinesProductsScreen.getSelectProductsButton().click();
        businessLinesProductsScreen.getTableTogglesProduct(0,0);
        navigation.getBladeCloseButton().click();
        navigation.getNextButton().click();
        navigation.getAddRowButton().click();
        fillAllInputs();
        businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
        businessLinesProductsScreen.getBladeCloseButton().click();
        brandsScreen.getSelectProductsButton().click();
        brandsScreen.getTableTogglesProduct(0,0);
        navigation.getBladeCloseButton().click();
        businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        businessLinesProductsScreen.getTableTogglesBusinessLine(0,0);
        navigation.getPopupTitle().should('have.text',"Are you sure you want to deactivate this Business Line for this Brand?");
        navigation
        .getPopupParagraph().should('have.text',"WARNING: If you click yes, this Business Line and all related Products will be deactivated for this Brand and all linked Agents & Introducers . Any related configuration will also be lost.");
        navigation.getRightButton().click();
    navigation.getBladeCloseButton().click();
    });  
});