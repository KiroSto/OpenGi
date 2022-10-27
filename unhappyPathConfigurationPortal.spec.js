import * as mockServer from "../fixtures/mock-server";
import CompanyInformationScreen from "../pageObject/CompanyInformationScreen";
import BusinessLinesProductsScreen from "../pageObject/BusinessLinesProductsScreen";
import BrandsScreen from "../pageObject/BrandsScreen";
import AgentsScreen from "../pageObject/AgentsScreen";
import IntroducersScreen from "../pageObject/IntroducersScreen";
import AccountsScreen from "../pageObject/AccountsScreen";
import MobiusUsersScreen from "../pageObject/MobiusUsersScreen";
import Navigation from "../pageObject/Navigation";
import WarningPopupScreen from "../pageObject/WarningPopupScreen";
import ContactsSection from "../pageObject/ContactsSection";
import { beforeElementContains } from "../utils/checkBeforeElements";
import { warningPageGetFail, warningPageGetSuccess } from "../support/warningPage";
import { generateResponseObj } from "../fixtures/mock-server";
import HeaderMessagesScreen from "../pageObject/HeaderMessagesScreen";
import * as MockSocket from "mock-socket";

const baseUrl = "https://localhost:3000/";
const companyInformationScreen = new CompanyInformationScreen();
const businessLinesProductsScreen = new BusinessLinesProductsScreen();
const brandsScreen = new BrandsScreen();
const agentsScreen = new AgentsScreen();
const introducersScreen = new IntroducersScreen();
const accountsScreen = new AccountsScreen();
const mobiusUsersScreen = new MobiusUsersScreen();
const navigation = new Navigation();
const warningPopupScreen = new WarningPopupScreen();
const contactsSection = new ContactsSection();
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

    it("Unhappy Path e2e onboarding test", function () {
      cy.get("#logout", { timeout: 10000 }).then(() => {
        cy.get("#welcomePopup").should("exist");
        navigation.getPopupButton().click();
        navigation.getHelpButton().click();
        navigation.getPopupButton().click();
      });

      //#region WARNING PAGE IN CASE GET FAILS
      warningPageGetFail(baseUrl);
      warningPageGetSuccess(baseUrl);
      //#endregion

      //#region VALIDATION CHECK
      // navigation buttons check

      cy.visit(baseUrl);
      cy.get("#logout", { timeout: 10000 }).then(() => {
        cy.get("#welcomePopup").should("not.exist");
      });

      navigation.getBusinessLinesProductsButton().click();
      navigation.getBrandsButton().click();
      navigation.getAgentsButton().click();
      navigation.getIntroducersButton().click();
      navigation.getPaymentPlansButton().click();
      navigation.getAccountsButton().click();
      navigation.getMobiusUsersButton().click({ force: true });
      navigation.getSubmitButton().should("be.disabled");
      navigation.getInvalidCompanyInformation().should("exist");
      navigation.getInvalidBusinessLinesProducts().should("exist");
      navigation.getInvalidAccounts().should("exist");
      // mandatory fields check
      navigation.getCompanyInformationButton().click();
      companyInformationScreen.getCompanyName().shouldBeInvalid();
      companyInformationScreen.getCompanyNameError().should("exist");
      companyInformationScreen.getCompanyAddress().shouldBeInvalid();
      companyInformationScreen.getCompanyAddressError().should("exist");
      companyInformationScreen.getCompanyPostCode().shouldBeInvalid();
      companyInformationScreen.getCompanyPostCodeError().should("exist");
      companyInformationScreen.getCompanyEmail().shouldBeInvalid();
      companyInformationScreen.getCompanyEmailError().should("exist");
      companyInformationScreen.getCompanyTel().shouldBeInvalid();
      companyInformationScreen.getCompanyTelError().should("exist");
      companyInformationScreen.getCompanyMainContactName().shouldBeInvalid();
      companyInformationScreen.getCompanyMainContactNameError().should("exist");
      companyInformationScreen.getCompanyMainContactEmail().shouldBeInvalid();
      companyInformationScreen.getCompanyMainContactEmailError().should("exist");
      navigation.getBrandsButton().click();
      navigation.getAddRowButton().click();
      navigation.getSaveButton().click();
      brandsScreen.getBrand().shouldBeInvalid();
      brandsScreen.getHeaderError().should("exist");
      brandsScreen.getBlError().should("exist");
      brandsScreen.getEmail().shouldBeInvalid();
      navigation.getAgentsButton().click();
      navigation.getAddRowButton().click();
      navigation.getSaveButton().click();
      agentsScreen.getName().shouldBeInvalid();
      navigation.getIntroducersButton().click();
      navigation.getAddRowButton().click();
      navigation.getSaveButton().click();
      introducersScreen.getName().shouldBeInvalid();
      navigation.getSaveButton().click();
      navigation.getPaymentPlansButton().click(); // payment plan screen is always valid
      navigation.getAccountsButton().click();
      accountsScreen.getFinancialYear12().select(this.accountsInfo.financialYear12);
      accountsScreen.getStartDate().shouldBeInvalid();
      accountsScreen.getEndDate().click(); //TODO to be changed, only temporary fix
      accountsScreen.getStartDate().click();
      accountsScreen.getEndDate().shouldBeInvalid();
      navigation.getMobiusUsersButton().click({ force: true });
      navigation.getAddRowButton().click();
      navigation.getSaveButton().click();
      mobiusUsersScreen.getFirstName().shouldBeInvalid();
      mobiusUsersScreen.getLastName().shouldBeInvalid();
      mobiusUsersScreen.getEmail().shouldBeInvalid();
      //#endregion
      //#region COMPANY INFORMATION SECTION
      navigation.getCompanyInformationButton().click();

      companyInformationScreen.getCompanyName().type(this.companyInfo.companyName);
      companyInformationScreen.getCompanyAddress().type(this.companyInfo.address);
      companyInformationScreen.getCompanyPostCode().type(this.companyInfo.postCode);
      companyInformationScreen.getCompanyEmail().type(this.companyInfo.companyEmail);
      companyInformationScreen.getCompanyTel().type(this.companyInfo.companyTel);
      companyInformationScreen.getCompanyFCARef().type(this.companyInfo.FCAref);
      companyInformationScreen.getCompanyFCADec().type(this.companyInfo.FCAdec);
      companyInformationScreen.getCurrency().select(this.companyInfo.poundCurrency);
      companyInformationScreen.getCompanyMainContactName().type(this.companyInfo.companyContactName);
      companyInformationScreen.getCompanyMainContactEmail().type(this.companyInfo.companyContactEmail);
      companyInformationScreen.getCompanyMainContactTel().type(this.companyInfo.companyContactTel);
      navigation.getNextButton().click();
      //#endregion

      //#region BUSINESS LINES & PRODUCTS SECTION
      // scenario from existing bug
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
      // add bls
      businessLinesProductsScreen.getSelectBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 4);
      //check if BL is not connected to any brand or product
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      cy.get("#popup-holder").should("not.exist");
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);

      navigation.getBladeCloseButton().click();
      // validate screen without products
      navigation.getNextButton().click();
      navigation.getInvalidBusinessLinesProducts().should("not.exist");
      navigation.getBackButton().click();
      // add products
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 1);
      navigation.getBladeCloseButton().click();
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[1].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      navigation.getBladeCloseButton().click();

      //add bespoke bls
      businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
      businessLinesProductsScreen.saveBespokeBusinessLine();
      businessLinesProductsScreen.getCreateBespokeBLName().shouldBeInvalid();
      navigation.getBladeCloseButton().click();

      //ADD -EDIT- DELETE BESPOKE AND DELEGATED PRODUCTS
      businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
      businessLinesProductsScreen.getCreateBespokeBLName().type("Bespoke BL Delete");
      businessLinesProductsScreen.saveBespokeBusinessLine();
      // add Delegated product with bespoke
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsProductName()
        .type("Product Name Bespoke", { force: true });
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsInsurerName()
        .type("Insurer Name Bespoke", { force: true });
      businessLinesProductsScreen.blDropdown().select("Bespoke BL 2");
      businessLinesProductsScreen.saveDAProducts();

      // add delegated authority products with bl
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsType().select(bls[0].name);
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsProductName()
        .type("Product Name", { force: true });
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsInsurerName()
        .type("Insurer Name", { force: true });
      businessLinesProductsScreen.saveDAProducts();

      //Show popup when BL is used by products and delegated products
      businessLinesProductsScreen.getSelectBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      businessLinesProductsScreen.popupCancel();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      navigation.getRightButton().click();
      navigation.getBladeCloseButton().click();
      businessLinesProductsScreen.getProductsTableNoRows().find("table-data-row-2").should("not.exist");
      businessLinesProductsScreen.getProductsTableNoRows().find("table-data-row-3").should("not.exist");
      businessLinesProductsScreen.getDelegatedProductsTableNoRows().find("table-data-row-4").should("not.exist");
      businessLinesProductsScreen.getSelectBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      navigation.getBladeCloseButton().click();
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 1);
      navigation.getBladeCloseButton().click();
      navigation.getNextButton().click();

      //ADDING BRAND
      // check if Brand sidepanel is invalid
      navigation.getBackButton().click();
      navigation.getInvalidBrands().should("exist");
      navigation.getNextButton().click();

      navigation.getAddRowButton().click();
      brandsScreen.getBrand().type(this.brandsInfo.brand);
      brandsScreen.getEmail().type(this.brandsInfo.email);
      brandsScreen.getTelephone().type(this.brandsInfo.telephone);
      brandsScreen.getAddress().type(this.brandsInfo.address);
      // add business lines to brand
      brandsScreen.getBusinessLinesButton().click();
      businessLinesProductsScreen.getBLDropdown().select("Bespoke Business Lines");
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 1);
      navigation.getBladeCloseButton().click();
      // add products at brand
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select("Bespoke BL 1", { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      navigation.getBladeCloseButton().click();
      navigation.getSaveButton().click();
      businessLinesProductsScreen.editProductIconNotExists(1);
      navigation.getBusinessLinesProductsButton().click();
      //edit bespoke
      businessLinesProductsScreen.editBespoke(1);
      businessLinesProductsScreen.getCreateBespokeBLName().clear().type("Bespoke BL 1 Edited");
      businessLinesProductsScreen.saveBespokeBusinessLine();
      //edit delegated authority products
      businessLinesProductsScreen.editDelegatedProduct(2);
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsProductName()
        .clear()
        .type("Product 1 Edited", { force: true });
      businessLinesProductsScreen.saveDAProducts();
      //delete bespoke
      businessLinesProductsScreen.deleteBespoke(3);
      businessLinesProductsScreen.warningPopupYesBtn().click();
      businessLinesProductsScreen.deleteBespoke(1);
      businessLinesProductsScreen.warningPopupYesBtn().should("not.exist");
      businessLinesProductsScreen.warningPopupCancelBtn();
      //delete delegated authority products
      businessLinesProductsScreen.deleteDelegatedProduct(1);
      businessLinesProductsScreen.warningPopupYesBtn().click();
      businessLinesProductsScreen.deleteDelegatedProduct(1);
      businessLinesProductsScreen.warningPopupYesBtn().should("not.exist");
      businessLinesProductsScreen.warningPopupCancelBtn();
      navigation.getNextButton().click();
      brandsScreen.editBrand(1);
      brandsScreen.getFirstPill().should("have.text", "Bespoke BL 1 Edited");
      navigation.getBusinessLinesProductsButton().click();

      //edit product details
      businessLinesProductsScreen.editProduct(1);
      businessLinesProductsScreen.getTypeOfCommission().select("Percentage %", { force: true });
      businessLinesProductsScreen.getTypeOfCommission().select("Flat Fee", { force: true });
      businessLinesProductsScreen.getNewBusinessCommissionFee().type("11", { force: true });
      beforeElementContains(businessLinesProductsScreen.getNewBusinessCommissionFee().parent(), '"£"');
      businessLinesProductsScreen.getMidTermAdjustmentCommissionFee().type("11", { force: true });
      businessLinesProductsScreen.getRenewalsCommissionFee().type("11", { force: true });
      businessLinesProductsScreen.getBrokerPrefix().type("11", { force: true });
      businessLinesProductsScreen.getBrokerSuffix().type("11", { force: true });
      businessLinesProductsScreen.getBrokerRange().type("11", { force: true });
      businessLinesProductsScreen.getInsurerPrefix().type("11", { force: true });
      businessLinesProductsScreen.getInsurerSuffix().type("11", { force: true });
      businessLinesProductsScreen.getInsurerRange().type("11", { force: true });
      businessLinesProductsScreen.getProductSubmitButton().click();
      // add delegated authority products
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsButton().click();
      businessLinesProductsScreen.saveDAProducts();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsProductName().shouldBeInvalid();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsInsurerName().shouldBeInvalid();
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsProductName()
        .type("Product Name", { force: true });
      businessLinesProductsScreen.saveDAProducts();
      businessLinesProductsScreen.getCreateDelegatedAuthorityProductsInsurerName().shouldBeInvalid();
      businessLinesProductsScreen
        .getCreateDelegatedAuthorityProductsInsurerName()
        .type("Insurer Name", { force: true });
      businessLinesProductsScreen.saveDAProducts();

      navigation.getNextButton().click();
      //#endregion

      //#region BRANDS SECTION
      brandsScreen.deleteBrand(1);
      brandsScreen.warningLeftBtn().click();
      brandsScreen.deleteBrand(1);
      brandsScreen.warningRightBtn().click();
      navigation.getAddRowButton().click();
      brandsScreen.getBrand().type(this.brandsInfo.brand);
      brandsScreen.getEmail().type(this.brandsInfo.email);
      brandsScreen.getTelephone().type(this.brandsInfo.telephone);
      brandsScreen.getAddress().type(this.brandsInfo.address);
      // add business lines to brand
      brandsScreen.getBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 4);
      navigation.getBladeCloseButton().click();
      navigation.getSaveButton().click();
      brandsScreen.editBrand(1);
      // add products at brand
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 1);
      navigation.getBladeCloseButton().click();
      //edit brand product details
      brandsScreen.editProduct(1);
      brandsScreen.getTypeOfCommission().select("Flat Fee", { force: true });
      brandsScreen.getNewBusinessCommissionFee().type("11", { force: true });
      beforeElementContains(brandsScreen.getNewBusinessCommissionFee().parent(), '"£"');
      brandsScreen.getMidTermAdjustmentCommissionFee().type("11", { force: true });
      brandsScreen.getRenewalsCommissionFee().type("11", { force: true });
      businessLinesProductsScreen.getProductSubmitButton().click();
      // Try to add invalid contact
      contactsSection.getSelectContactsButton().click();
      contactsSection.getAddContactsButton().click();
      contactsSection.getSaveButton().click();
      contactsSection.getName().shouldBeInvalid();
      contactsSection.getNameError().should("exist");
      contactsSection.getEmail().shouldBeInvalid();
      contactsSection.getEmailError().should("exist");
      contactsSection.getHeaderError().should("exist");
      contactsSection.getEmail().type("test");
      contactsSection.getSaveButton().click();
      contactsSection.getName().shouldBeInvalid();
      contactsSection.getNameError().should("exist");
      contactsSection.getEmail().shouldBeInvalid();
      contactsSection.getEmailError().should("exist");
      contactsSection.getHeaderError().should("exist");
      contactsSection.getEmail().clear();
      contactsSection.getSaveButton().click();
      contactsSection.getName().shouldBeInvalid();
      contactsSection.getNameError().should("exist");
      contactsSection.getEmail().shouldBeInvalid();
      contactsSection.getEmailError().should("exist");
      contactsSection.getHeaderError().should("exist");
      contactsSection.getName().type(this.contactsInfo.name);
      contactsSection.getEmail().type(this.contactsInfo.email);
      contactsSection.getTelephone().type(this.contactsInfo.telephone);
      contactsSection.getJobTitle().type(this.contactsInfo.jobTitle);
      contactsSection.getSaveButton().click();
      contactsSection.getTableTogglesContacts(0, 0);
      navigation.getBladeCloseButton().click();
      contactsSection.getFirstPill().should("have.text", this.contactsInfo.name);
      contactsSection.getSelectContactsButton().click();
      contactsSection.getFirstTableDataEdit().click();
      contactsSection.getName().clear();
      contactsSection.getName().type(this.contactsInfo.name + "1");
      contactsSection.getSaveButton().click();
      navigation.getBladeCloseButton().click();
      contactsSection.getFirstPill().should("have.text", this.contactsInfo.name + "1");
      navigation.getSaveButton().click();

      navigation.getBackButton().click();

      // show warning popup when deselecting bls that are connected to brand
      businessLinesProductsScreen.getSelectBusinessLinesButton().click();
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      navigation.getRightButton().should("not.exist");
      businessLinesProductsScreen.popupCancel();
      navigation.getBladeCloseButton().click();

      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      navigation.getRightButton().should("not.exist");
      businessLinesProductsScreen.popupCancel();
      navigation.getBladeCloseButton().click();

      navigation.getNextButton().click();
      navigation.getNextButton().click();

      //#endregion

      //#region AGENTS SECTION
      navigation.getAddRowButton().click();
      agentsScreen.getName().type(this.agentsInfo.name);
      agentsScreen.getRef().type(this.agentsInfo.ref);
      agentsScreen.getFcaRef().type(this.agentsInfo.fcaRef);
      agentsScreen.getAddress().type(this.agentsInfo.address);
      agentsScreen.getInvoiceAddress().type(this.agentsInfo.invoiceAddress);
      // Uncheck payNetOfCommission and collectsPayment checkbox
      agentsScreen.clickCollectsPaymentCheckBox().click();
      agentsScreen.clickPayNetOfCommissionCheckBox().click();
      //save without adding a brand
      navigation.getSaveButton().click();
      agentsScreen.getBrandErrorMessage().contains("Please select at least one Brand");
      // link to brands
      agentsScreen.getSelectBrandsButton().click();
      agentsScreen.getTableTogglesAgent(0, 0);
      navigation.getBladeCloseButton().click();
      // filters
      contactsSection.getSelectContactsButton().click();
      contactsSection.getFirstDeleteButton().click();
      contactsSection.getRightButton().click();
      navigation.getBladeCloseButton().click();
      navigation.getSaveButton().click();
      navigation.getBackButton().click();
      brandsScreen.editBrand(1);
      contactsSection.getFirstPill().should("not.exist");
      navigation.getCancelButton().click();
      navigation.getNextButton().click();
      navigation.getNextButton().click();
      //#endregion

      //#region INTRODUCERS SECTION
      navigation.getAddRowButton().click();
      introducersScreen.getName().type(this.introducersInfo.name);
      introducersScreen.getRef().type(this.introducersInfo.ref);
      introducersScreen.getAddress().type(this.introducersInfo.address);
      //save without adding a brand
      navigation.getSaveButton().click();
      agentsScreen.getBrandErrorMessage().contains("Please select at least one Brand");
      // link to brands
      introducersScreen.getSelectBrandsButton().click();
      introducersScreen.getTableTogglesIntroducers(0, 0);
      navigation.getBladeCloseButton().click();
      // filters
      navigation.getSaveButton().click();
      navigation.getNextButton().click();
      // contacts bug scenario
      navigation.getBrandsButton().click();
      brandsScreen.editBrand(1);
      contactsSection.getSelectContactsButton().click();
      contactsSection.getAddContactsButton().click();
      contactsSection.getName().type(this.contactsInfo.name);
      contactsSection.getEmail().type(this.contactsInfo.email);
      contactsSection.getTelephone().type(this.contactsInfo.telephone);
      contactsSection.getJobTitle().type(this.contactsInfo.jobTitle);
      contactsSection.getSaveButton().click();
      contactsSection.getAddContactsButton().click();
      contactsSection.getName().type(this.contactsInfo.name + " second");
      contactsSection.getEmail().type(this.contactsInfo.email + "second");
      contactsSection.getTelephone().type(this.contactsInfo.telephone + "222");
      contactsSection.getJobTitle().type(this.contactsInfo.jobTitle + "s");
      contactsSection.getSaveButton().click();
      contactsSection.getTableTogglesContacts(0, 1);
      navigation.getBladeCloseButton().click();
      navigation.getSaveButton().click();
      navigation.getIntroducersButton().click();
      navigation.getAddRowButton().click();
      contactsSection.getSelectContactsButton().click();
      contactsSection.getSecondDeleteButton().click();
      contactsSection.getLeftButton().click();
      navigation.getBladeCloseButton().click();
      contactsSection.getFirstPill().should("not.exist");
      navigation.getCancelButton().click();
      navigation.getNextButton().click();
      //#endregion

      //#region UPDATES TO BRAND ASSOCIATIONS
      navigation.getBrandsButton().click();
      brandsScreen.editBrand(1);
      agentsScreen.getBusinessLineDropdown().select("All");
      //add bespoke BLs
      brandsScreen.getBusinessLinesButton().click();
      businessLinesProductsScreen.getBLDropdown().select("Bespoke Business Lines");
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 1);
      navigation.getBladeCloseButton().click();
      //add delegated authority products
      businessLinesProductsScreen.getSelectProductsButton().click();
      businessLinesProductsScreen.getProductDropdown().select(bls[0].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(2, 0);
      businessLinesProductsScreen.getProductDropdown().select(bls[1].name, { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      businessLinesProductsScreen.getProductDropdown().select("Bespoke BL 1 Edited", { force: true });
      businessLinesProductsScreen.getTableTogglesProduct(0, 0);
      navigation.getBladeCloseButton().click();
      //check number of products in table (should be 5)
      businessLinesProductsScreen.getProductsTableNoRows().find(".table-row").should("have.length", 5);

      navigation.getBrandsButton().click();
      navigation.getLeftButton().click();
      brandsScreen.editBrand(1);
      brandsScreen.getBusinessLinesButton().click();
      businessLinesProductsScreen.getBLDropdown().select("Bespoke Business Lines");
      businessLinesProductsScreen.getTableTogglesBusinessLine(1, 0);
      navigation.getRightButton().should("not.exist");
      businessLinesProductsScreen.getTableTogglesBusinessLine(0, 0);
      businessLinesProductsScreen.getBLDropdown().select("Standard Business Lines");
      businessLinesProductsScreen.getTableTogglesBusinessLine(1, 0);
      navigation.getBladeCloseButton().click();
      //check number of products in table (should be 2)
      businessLinesProductsScreen.getProductsTableNoRows().find(".table-row").should("have.length", 2);

      //save brand and check if products are the same number in agents screen
      navigation.getSaveButton().click();
      navigation.getNextButton().click();
      navigation.getNextButton().click();
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
      accountsScreen.getEndDate().type(this.accountsInfo.endDate);
      accountsScreen.getMainBankAccountName().type(this.accountsInfo.mainBankAccountName);
      accountsScreen.getAddAccountsButton().click();
      contactsSection.getHeaderError().should("not.exist");
      accountsScreen.getBrandErrorLabel().should("not.exist");
      accountsScreen.getSaveAccountButton().click();
      contactsSection.getHeaderError().should("exist");
      accountsScreen.getBrandErrorLabel().should("exist");
      accountsScreen.getBankAccountName().shouldBeInvalid();
      navigation.getBladeCloseButton().click();
      accountsScreen.getAddAccountsButton().click();
      accountsScreen.getBankAccountName().type(this.accountsInfo.bankAccount);
      accountsScreen.getTableTogglesBrands(0, 0);
      accountsScreen.getSaveAccountButton().click();
      accountsScreen.getAddAccountsButton().click();
      accountsScreen.getBankAccountName().type(this.accountsInfo.bankAccount);
      accountsScreen.getTableTogglesBrands(0, 0);
      accountsScreen.getSaveAccountButton().click();
      // Edit row in account table
      accountsScreen.getEditSelectedRow(1);
      accountsScreen.getBankAccountName().type("Test Edit", { force: true });
      accountsScreen.getSaveAccountButton().click();
      // Delete row in account table
      accountsScreen.getDeleteSelectedRow(1);
      warningPopupScreen.getWarningPopupConfirmationButton().click();
      navigation.getNextButton().click();
      //#endregion

      //#region EDIT BRAND AND CHECK AGENTS, INTRODUCERS AND ACCOUNTS
      navigation.getBrandsButton().click();
      brandsScreen.editBrand(1);
      brandsScreen.getBrand().clear();
      brandsScreen.getBrand().type("Brand Updated");
      navigation.getSaveButton().click();

      navigation.getAgentsButton().click();
      agentsScreen.editAgent(1);
      agentsScreen.getBrandPill(0).should("have.text", "Brand Updated");

      navigation.getIntroducersButton().click();
      introducersScreen.editIntroducer(1);
      introducersScreen.getBrandPill(0).should("have.text", "Brand Updated");

      navigation.getAccountsButton().click();
      accountsScreen.getFirstAccountBrands().should("have.text", "Brand Updated");
      navigation.getNextButton().click();
      //#endregion

      //#region MOBIUS USERS SECTION
      navigation.getAddRowButton().click();
      mobiusUsersScreen.getFirstName().type(this.mobiusUsersInfo.firstName);
      mobiusUsersScreen.getLastName().type(this.mobiusUsersInfo.lastName);
      mobiusUsersScreen.getJobTitle().type(this.mobiusUsersInfo.jobTitle);
      mobiusUsersScreen.getDepartment().type(this.mobiusUsersInfo.department);
      mobiusUsersScreen.getEmail().type(this.mobiusUsersInfo.email);
      mobiusUsersScreen.getAccessLevel().select(this.mobiusUsersInfo.accessLevel);
      navigation.getSaveButton().click();
      navigation.getSubmitButton().should("exist");
      //#endregion

      //#region DASHBOARD
      navigation.getSubmitButton().click();
      navigation.getRightButton().click();

      cy.route({
        url: /broker/,
        method: "GET",
        response: { ...generateResponseObj(), isSubmitted: true },
        status: 200,
      });

      cy.get("#goToDashboard").should("exist");
      cy.get("#goToForm").should("exist");
      navigation.getGoToDashboardButton().click();
      cy.get("#dashboard-holder").should("exist");

      //#endregion
    });
  }
);

describe("Warnings", function () {
  beforeEach(() => {
    cy.server();
    cy.route(mockServer.postBrokerDetailsDelayed);
    cy.route(mockServer.getBrokerDetails);
    cy.route(mockServer.putBroker);
    cy.route(mockServer.getProductsList);
    cy.route(mockServer.getBusinessLinesList);
    cy.route(mockServer.getAccessLevelsList);
    cy.route(mockServer.getMultipleConnectedUsers);
    cy.route(mockServer.getSocketPolling);

    cy.clock(Date.now());
    cy.visit(baseUrl);
    cy.get("#logout", { timeout: 10000 }).then(() => {
      navigation.getPopupButton().click();
    });
    mockServer.setBLsLocalStorage();
  });

  it("Should show number of users editing message", () => {
    cy.get(headerMessagesScreen.getUsersEditingMessage).should("exist");
  });

  it("Should show warning message in header when the PUT request fails", () => {
    // simulating onBlur event to trigger the PUT request
    companyInformationScreen.getCompanyName().type("test");
    cy.route(mockServer.putBrokerFailed);
    companyInformationScreen.getCompanyName().blur();

    // checking if all elements from warning message exits
    cy.get(headerMessagesScreen.getWarningIcon).should("exist");
    cy.get(headerMessagesScreen.getWarningMessage).should("exist");
    cy.get(headerMessagesScreen.getTryAgain).should("exist");
  });

  it("Should succeed to execute PUT request after clicking TryAgain", () => {
    // simulating onBlur event to trigger the PUT request
    companyInformationScreen.getCompanyName().type("test");
    cy.route(mockServer.putBrokerFailed);
    companyInformationScreen.getCompanyName().blur();

    headerMessagesScreen.getTryAgain().click({ force: true });
    cy.get(headerMessagesScreen.getAllChangesSavedMessage).should("exist");
  });

  it("Warning Popup - add brand", function () {
    navigation.getBrandsButton().click();
    brandsScreen.editBrand(1);
    brandsScreen.getAddress().type(this.brandsInfo.address);
    navigation.getCancelButton().click();
    cy.get(`h3[id="popup-title"]`).contains("All changes will be lost");
    brandsScreen.warningRightBtn().click();
    cy.get(`h4`).contains("Edit Brand");
    brandsScreen.getSelectProductsButton().click();
    brandsScreen.getTableTogglesProduct(0, 0);
    cy.get(`h3[id="popup-title"]`).contains("Are you sure you want to deactivate this Product for this Brand?");
    brandsScreen.warningRightBtn().click();
    navigation.getBladeCloseButton().click();
    brandsScreen.backButton().click();
    cy.get(`h3[id="popup-title"]`).contains("All changes will be lost");
  });

  it("Warning Popup - Add bespoke product", function () {
    navigation.getBusinessLinesProductsButton().click();
    businessLinesProductsScreen.getSelectBespokeBusinessLinesButton().click();
    businessLinesProductsScreen.getCreateBespokeBLName().type("Bespoke BL");

    businessLinesProductsScreen.cancelBespoke();
    cy.get(`h3[id="popup-title"]`).contains("All changes will be lost");
  });

  it("Warning Popup - Delete agent", function () {
    navigation.getAgentsButton().click();
    agentsScreen.deleteFirstAgent(1).click();
    cy.get(`h3[id="popup-title"]`).contains("Are you sure you want to delete this Agent?");
  });

  it("Confirmation Popup - No Recent Activity don't show / show popup after 1 hour", function () {
    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        win.activeTime = cy.activeTime;
      },
    }).then(() => {
      cy.get("#logout", { timeout: 10000 }).then(() => {
        cy.tick(cy.activeTime + 1);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
        companyInformationScreen.getCompanyName().focus();
        cy.tick(cy.activeTime + 1);
        cy.get(`h3[id="popup-header"]`).contains("No Recent Activity");
      });
    });
  });

  it("Confirmation Popup - No Recent Activity don't show popup after some activity", function () {
    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        win.activeTime = cy.activeTime;
      },
    }).then(() => {
      cy.get("#logout", { timeout: 10000 }).then(() => {
        companyInformationScreen.getCompanyName().focus();
        cy.tick(cy.activeTime / 12);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
        companyInformationScreen.getCompanyAddress().click();
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
        companyInformationScreen.getCompanyEmail().click();
        cy.tick(cy.activeTime / 6);
        companyInformationScreen.getCurrency().focus();
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
        navigation.getBrandsButton().click();
        cy.tick(cy.activeTime / 2);
        navigation.getAddRowButton().click();
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
        navigation.getAgentsButton().click();
        navigation.getAddRowButton().click();
        agentsScreen.clickCollectsPaymentCheckBox().click();
        cy.tick(cy.activeTime / 2);
        agentsScreen.clickPayNetOfCommissionCheckBox().click();
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
        navigation.getBusinessLinesProductsButton().click();
        navigation.getLeftButton().click();
        businessLinesProductsScreen.getSelectProductsButton().click();
        cy.tick(cy.activeTime / 2);
        businessLinesProductsScreen.getTableTogglesProduct(1, 0);
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
      });
    });
  });

  it("Confirmation Popup - No Recent Activity don't show popup after 10 minutes on multiple entity", function () {
    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        win.activeTime = cy.activeTime;
      },
    }).then(() => {
      cy.get("#logout", { timeout: 10000 }).then(() => {
        companyInformationScreen.getCompanyName().focus();
        cy.tick(cy.activeTime / 12);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
      });
    });
  });

  it("Confirmation Popup - No Recent Activity popup click Try Again Button", function () {
    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        win.activeTime = cy.activeTime;
      },
    }).then(() => {
      cy.get("#logout", { timeout: 10000 }).then(() => {
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

  it("Confirmation Popup - No Recent Activity don't show popup after clicking close/cancel btn", function () {
    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        win.activeTime = cy.activeTime;
      },
    }).then(() => {
      cy.get("#logout", { timeout: 10000 }).then(() => {
        navigation.getBusinessLinesProductsButton().click();
        businessLinesProductsScreen.getSelectBusinessLinesButton().click();
        cy.tick(cy.activeTime / 2);
        businessLinesProductsScreen.getTableTogglesBusinessLine(1, 0);
        businessLinesProductsScreen.popupCancel();
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");

        businessLinesProductsScreen.getBladeCloseButton().click();
        cy.tick(cy.activeTime / 2);
        businessLinesProductsScreen.getSelectProductsButton().click();
        businessLinesProductsScreen.getTableTogglesProduct(0, 0);
        businessLinesProductsScreen.popupCancel();
        cy.tick(cy.activeTime - 10);
        cy.get(`h3[id="popup-header"]`).should("not.exist");
      });
    });
  });
});
