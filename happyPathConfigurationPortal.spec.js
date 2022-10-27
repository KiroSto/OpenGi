import * as mockServer from "../fixtures/mock-server";
import CompanyInformationScreen from "../pageObject/CompanyInformationScreen";
import BusinessLinesProductsScreen from "../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../pageObject/BrandsScreen";
import AgentsScreen from "../pageObject/AgentsScreen";
import IntroducersScreen from "../pageObject/IntroducersScreen";
import AccountsScreen from "../pageObject/AccountsScreen";
import MobiusUsersScreen from "../pageObject/MobiusUsersScreen";
import Navigation from "../pageObject/Navigation";
import ContactsSection from "../pageObject/ContactsSection";
import { beforeElementContains } from "../utils/checkBeforeElements";
import { DashboardScreen } from "../pageObject/DashboardScreen";
import { checkReadOnlyVersion } from "../support/checkReadOnlyVersion";
import { generateResponseObj } from "../fixtures/mock-server";
import * as MockSocket from "mock-socket";
import HeaderMessagesScreen from "../pageObject/HeaderMessagesScreen";

const baseUrl = "https://localhost:3000/";
const companyInformationScreen = new CompanyInformationScreen();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const agentsScreen = new AgentsScreen();
const introducersScreen = new IntroducersScreen();
const accountsScreen = new AccountsScreen();
const mobiusUsersScreen = new MobiusUsersScreen();
const contactsSection = new ContactsSection();
const dashboardScreen = new DashboardScreen();
const navigation = new Navigation();
const headerMessagesScreen = new HeaderMessagesScreen();

let bls = [];
let socketServer;

describe(
  "Configuration Portal User Journey",
  {
    retries: {
      runMode: 3,
      openMode: 3,
    },
  },
  function () {
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
      bls = mockServer.setBLsLocalStorage();
    });

    afterEach(() => {
      socketServer.close();
    });

    it("Happy Path e2e onboarding test", function () {
      //#region OPEN PRIVACY AND SECURITY TAB
      cy.get("#logout", { timeout: 10000 }).then(() => {
        navigation.getPrivacyAndSecurityLink().then((link) => {
          cy.request(link.prop("href")).its("status").should("eq", 200);
        });
        navigation.getPopupButton().click();
      });
      //#endregion

      //#region COMPANY INFORMATION SECTION
      navigation.getCompanyInformationButton().click();
      companyInformationScreen.getCompanyName().type(this.companyInfo.companyName);

      companyInformationScreen.getCompanyName().blur();
      headerMessagesScreen.checkSavingMessagesAndIcons();
      headerMessagesScreen.getUsersEditingMessage().should("not.exist");

      companyInformationScreen.getCompanyAddress().type(this.companyInfo.address);
      companyInformationScreen.getCompanyPostCode().type(this.companyInfo.postCode);
      companyInformationScreen.getCompanyEmail().type(this.companyInfo.companyEmail);
      companyInformationScreen.getCompanyTel().type(this.companyInfo.companyTel);
      companyInformationScreen.getCurrency().select(this.companyInfo.currency);

      headerMessagesScreen.checkSavingMessagesAndIcons();

      companyInformationScreen.getCompanyMainContactName().type(this.companyInfo.companyContactName);
      companyInformationScreen.getCompanyMainContactEmail().type(this.companyInfo.companyContactEmail);

      navigation.getNextButton().click();
      //#endregion

      //#region BUSINESS LINES & PRODUCTS SECTION
      // add bls
      businessLinesProductsScreen.getSelectBusinessLinesButton().click();

      // use delayed put to catch the saving messages
      cy.route(mockServer.putBrokerDelayed);
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 4, true);
      // return the initial put
      cy.route(mockServer.putBroker);

      navigation.getBladeCloseButton().click();
      //add bespoke BLs
      businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
      businessLinesProductsScreen.getCreateBespokeBLName().type("Bespoke BL");
      businessLinesProductsScreen.saveBespokeBusinessLine();
      // add products
      businessLinesProductsScreen.getSelectProductsButton().click({ force: true });
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 1);
      navigation.getBladeCloseButton().click();
      businessLinesProductsScreen.getSelectProductsButton().click({ force: true });
      businessLinesProductsScreen.getProductDropdown().select(bls[1].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      navigation.getBladeCloseButton().click();
      //edit product details
      businessLinesProductsScreen.editProduct(2);
      headerMessagesScreen.getClickToSaveMessage().should("exist");
      businessLinesProductsScreen.getTypeOfCommission().select("Percentage %", { force: true });
      businessLinesProductsScreen.getTypeOfCommission().select("Flat Fee", { force: true });
      businessLinesProductsScreen.getNewBusinessCommissionFee().type("11", { force: true });
      beforeElementContains(businessLinesProductsScreen.getNewBusinessCommissionFee().parent(), '"€"');
      businessLinesProductsScreen.getMidTermAdjustmentCommissionFee().type("11", { force: true });
      businessLinesProductsScreen.getRenewalsCommissionFee().type("11", { force: true });
      businessLinesProductsScreen.getBrokerPrefix().type("11", { force: true });
      businessLinesProductsScreen.getBrokerSuffix().type("11", { force: true });
      businessLinesProductsScreen.getBrokerRange().type("11", { force: true });
      businessLinesProductsScreen.getInsurerPrefix().type("11", { force: true });
      businessLinesProductsScreen.getInsurerSuffix().type("11", { force: true });
      businessLinesProductsScreen.getInsurerRange().type("11", { force: true });

      cy.route(mockServer.putBrokerDelayed);
      businessLinesProductsScreen.getProductSubmitButton().click();

      headerMessagesScreen.checkSavingMessagesAndIcons();
      cy.route(mockServer.putBroker);

      businessLinesProductsScreen
        .getProductCommission(mockServer.productsList()[1].productId)
        .contains("Company: €11(NB), €11(MTA), €11(REN);");
      // add delegated authority products
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsType().select(bls[0].name, { force: true });
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsProductName()
        .type("Product Name", { force: true });
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsInsurerName()
        .type("Insurer Name", { force: true });
      businessLinesProductsScreen.saveDAProducts();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsType().select("Bespoke BL", { force: true });
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsProductName()
        .type("Product Name Bespoke", { force: true });
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsInsurerName()
        .type("Insurer Name Bespoke", { force: true });
      businessLinesProductsScreen.saveDAProducts();
      navigation.getNextButton().click();
      //#endregion

      //#region BRANDS SECTION
      navigation.getAddRowButton().click();

      headerMessagesScreen.getClickToSaveMessage().should("exist");
      headerMessagesScreen.getExclamationIcon().should("exist");

      brandsScreen.getBrand().type(this.brandsInfo.brand);
      brandsScreen.getEmail().type(this.brandsInfo.email);
      // add business lines to brand
      brandsScreen.getBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 4);
      businessLinesProductsScreen.getTypeOfBusinessLineDropdown().select("Bespoke Business Lines", { force: true });
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      navigation.getBladeCloseButton().click();
      // add products at brand
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 1);
      businessLinesProductsScreen.getProductDropdown().select("Bespoke BL", { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      navigation.getBladeCloseButton().click();
      brandsScreen.getProduct(mockServer.productsList()[0].productId).contains("Brand Product Commission not set");

      cy.get("#product-table>div").each(
        (element) => {
          if (element[0].innerText.includes("Bespoke BL")) {
            return element[0].innerText;
          }
        }
      ).contains("Commission can't be set for Delegated Authority Product");

      //edit brand product details
      brandsScreen.editProduct(1);
      brandsScreen.getTypeOfCommission().select("Flat Fee", { force: true });
      brandsScreen.getNewBusinessCommissionFee().type("11", { force: true });
      beforeElementContains(brandsScreen.getNewBusinessCommissionFee().parent(), '"€"');
      brandsScreen.getMidTermAdjustmentCommissionFee().type("11", { force: true });
      brandsScreen.getRenewalsCommissionFee().type("11", { force: true });
      businessLinesProductsScreen.getProductSubmitButton().click();
      brandsScreen.getProduct(mockServer.productsList()[0].productId).contains("Brand: €11(NB), €11(MTA), €11(REN);");
      // add contacts at brand
      contactsSection.getSelectContactsButton().click();
      contactsSection.getAddContactsButton().click();
      contactsSection.getName().type(this.contactsInfo.name);
      contactsSection.getEmail().type(this.contactsInfo.email);
      contactsSection.getTelephone().type(this.contactsInfo.telephone);
      contactsSection.getJobTitle().type(this.contactsInfo.jobTitle);
      contactsSection.getSaveButton().click();
      contactsSection.getTableTogglesContacts(0, 0);
      navigation.getBladeCloseButton().click();

      // simulating delay to catch the saving messages
      cy.route(mockServer.putBrokerDelayed);
      navigation.getSaveButton().click();
      headerMessagesScreen.checkSavingMessagesAndIcons();
      // returning to initial put
      cy.route(mockServer.putBroker);

      navigation.getNextButton().click();
      //#endregion

      //#region AGENTS SECTION
      navigation.getAddRowButton().click();
      agentsScreen.getName().type(this.agentsInfo.name);
      // link to brands
      agentsScreen.getSelectBrandsButton().click();
      agentsScreen.getTableTogglesAgent(0, 0);
      navigation.getBladeCloseButton().click();
      //assign contact
      contactsSection.getSelectContactsButton().click();
      contactsSection.getTableTogglesContacts(0, 0);
      navigation.getBladeCloseButton().click();
      navigation.getSaveButton().click();
      navigation.getNextButton().click();
      //#endregion

      //#region INTRODUCERS SECTION
      navigation.getAddRowButton().click();
      introducersScreen.getName().type(this.introducersInfo.name);
      // link to brands
      introducersScreen.getSelectBrandsButton().click();
      introducersScreen.getTableTogglesIntroducers(0, 0);
      navigation.getBladeCloseButton().click();
      //assign contact
      contactsSection.getSelectContactsButton().click();
      contactsSection.getTableTogglesContacts(0, 0);
      navigation.getBladeCloseButton().click();
      navigation.getSaveButton().click();
      navigation.getNextButton().click();
      //#endregion

      //#region PAYMENT PLANS SECTION already has default values
      navigation.getNextTopButton().click();
      //#endregion

      //#region ACCOUNTS SECTION
      accountsScreen.getNbAdminFees().type(this.accountsInfo.nbAdminFees);
      accountsScreen.getMtaAdminFees().type(this.accountsInfo.mtaAdminFees);
      // accountsScreen
      //   .getCancellationAdminFees()
      //   .type(this.accountsInfo.cancellationAdminFees);
      accountsScreen.getRenewalAdminFees().type(this.accountsInfo.renewalAdminFees);
      accountsScreen.getFinancialYear12().select(this.accountsInfo.financialYear12);
      accountsScreen.getStartDate().type(this.accountsInfo.startDate);

      accountsScreen.getStartDate().blur();
      headerMessagesScreen.checkSavingMessagesAndIcons();

      accountsScreen.getEndDate().type(this.accountsInfo.endDate);
      navigation.getNextButton().click();
      //#endregion

      //#region MOBIUS USERS SECTION
      navigation.getAddRowButton().click();
      mobiusUsersScreen.getFirstName().type(this.mobiusUsersInfo.firstName);
      mobiusUsersScreen.getLastName().type(this.mobiusUsersInfo.lastName);
      mobiusUsersScreen.getEmail().type(this.mobiusUsersInfo.email);
      mobiusUsersScreen.getAccessLevel().select(this.mobiusUsersInfo.accessLevel);
      navigation.getSaveButton().click();
      navigation.getSubmitButton().should("exist");
      navigation.getSubmitButton().click();
      navigation.getRightButton().click();
      //#endregion

      //#region DASHBOARD
      navigation.getSubmitLoader().should("exist");
      dashboardScreen.goToDashboard().should("exist");
      dashboardScreen.goToForm().should("exist");
      cy.route({
        url: /broker/,
        method: "GET",
        response: { ...generateResponseObj(), isSubmitted: true },
        status: 200,
      });
      navigation.getGoToDashboardButton().click();
      dashboardScreen.getDashboard().should("exist");

      checkReadOnlyVersion();
    });
    //#endregion
  }
);
