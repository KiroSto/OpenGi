using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2Framework.Pages.Test_Pages;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Connections_Pages;
using TicPortalV2SeleniumFramework.Pages.Documents_Pages;
using TicPortalV2SeleniumFramework.Pages.Domain_Model_Pages;
using TicPortalV2SeleniumFramework.Pages.General_Pages;
using TicPortalV2SeleniumFramework.Pages.Knowledgebase_Pages;
using TicPortalV2SeleniumFramework.Pages.News_Pages;
using TicPortalV2SeleniumFramework.Pages.Product_Pages;
using TicPortalV2SeleniumFramework.Pages.Rate_Pages;
using TicPortalV2SeleniumFramework.Pages.Reports_Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;
using TicPortalV2SeleniumFramework.Pages.Test_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class PermissionsTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserUseCustomRoleWithNoPermissions()
		{
			UITest(() =>
			{
				var roleName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToConnections()
						.GoToSuspendedTab()
						.CheckReinstateConnections()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName)
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName, "2")
						.SignOut();
				
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("2")
						.VerifyAllTabsAreUnavailable()
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole("Beta-Testers", "2")
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.DeleteCustomRole(roleName);
						
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		[DoNotParallelize]
		public void ShouldUserUseCustomRoleWithViewPermissions()
		{
			UITest(() =>
			{
				var roleName = RandomString();
				var rateName = RandomString();
				var lobName = RandomString();
				var productName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToConnections()
						.GoToSuspendedTab()
						.CheckReinstateConnections()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName)
						.SetAllViewPermissions()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName, "3")
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName)
						.ValidateAndConfirmAlertMessage("Product has been created successfully")
						.SignOut();

				loginPage.UseDifferentAccount()
						.LoginToPortalUser("3")
						.GoToProductsPage()
						.GoToCreateProductPage()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToProductsPage()
						.ClickOnEditBtn()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage = new ProductsPage(this.Driver);
				productsPage.SearchForProduct(productName)
				.TryToRemoveGivenProduct(productName)
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage2 = new ProductsPage(this.Driver);
				productsPage2.ClickOnViewBtn()
				.CheckProductNameIsVisible()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme("a new one")
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainSchemesPage()
						.ClickOnEditBtn()
						.ValidateSchemeWithoutWaitingForSuccess()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainSchemesPage()
						.TryToRemoveSchemRandomItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainSchemesPage()
						.ClickOnViewBtn()
						.CheckIfSchemeNameIsDisplayed()
						.GoToMainRatesPage()
						.GoToCreateRatePage()
						.CreateARateWithSimpleIndexForPermissions(rateName)
						.GoToRateVersionTab()
						.ClickCreateRate()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainRatesPage()
						.ClickOnEditBtn()
						.TryToPublishRateWhenEditing()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainRatesPage()
						.TryToRemoveRandomRateItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainRatesPage()
						.ClickOnViewBtn()
						.CheckIfRateNameIsDisplayed()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails("blaTest")
						.SaveTest()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainTestsPage()
						.ClickOnViewRiskBtn()
						.ClickOnOkBtnOnViewRiskWindow()
						.ClickOnEditBtn()
						.GoStraightToRiskDetailsPage()
						.SaveTest()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainTestsPage()
						.ClickOnRandomTestCase()
						.TryToRemoveRandomTestItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.SuspendRandomConnection()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.GoToSuspendedTab()
						.ReinstateRandomConnection()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.NavigateToAddConnection()
						.RequestRandomConnection()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.TryToRemoveRandomDomainModel()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusiness(lobName)
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.ClickOnEditDomainModel()
						.TryToPublishLob()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.ClickOnViewDomainModel()
						.CheckIfDomainModelExists()
						.GoToDocumentsPage()
						.ClickOnViewBtnOnDocuments()
						.CheckIfDocumentsTitleIsOnPlace("Document Details")
						.GoToRefersTab()
						.CheckIfGetReportExists()
						.SignOut();

				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole("Beta-Testers", "3")
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.DeleteCustomRole(roleName);

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		[DoNotParallelize]
		public void ShouldUserUseCustomRoleWithEditPermissions()
		{
			UITest(() =>
			{
				var roleName = RandomString();
				var rateName = RandomString();
				var lobName = RandomString();
				var productName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToConnections()
						.GoToSuspendedTab()
						.CheckReinstateConnections()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName)
						.SetAllEditPermissions()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName, "4")
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName)
						.ValidateAndConfirmAlertMessage("Product has been created successfully")
						.SignOut();

				loginPage.UseDifferentAccount()
						.LoginToPortalUser("4")
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName)
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage = new ProductsPage(this.Driver);
				productsPage.ClickEditProductButton(productName)
				.PublishProductInTheFuture()
						.ValidateAndConfirmAlertMessage("Product has been updated successfully")
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage1 = new ProductsPage(this.Driver);
				productsPage1.SearchForProduct(productName)
				.TryToRemoveGivenProduct(productName)
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage2 = new ProductsPage(this.Driver);
				productsPage2.ClickOnViewBtn()
				.CheckProductNameIsVisible()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme("a new one")
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainSchemesPage()
						.ClickOnEditBtn()
						.ValidateScheme()
						.ValidateAndConfirmAlertMessage("Scheme compiled successfully")
						.GoToMainSchemesPage()
						.TryToRemoveSchemRandomItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainSchemesPage()
						.ClickOnViewBtn()
						.CheckIfSchemeNameIsDisplayed()
						.GoToMainRatesPage()
						.GoToCreateRatePage()
						.CreateARateWithSimpleIndexForPermissions(rateName)
						.GoToRateVersionTab()
						.ClickCreateRate()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainRatesPage()
						.ClickOnEditBtn()
						.TryToPublishRateWhenEditing()
						.ValidateAndConfirmAlertMessage("Rate published successfully")
						.GoToMainRatesPage()
						.TryToRemoveRandomRateItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainRatesPage()
						.ClickOnViewBtn()
						.CheckIfRateNameIsDisplayed()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails("blaTest")
						.SaveTest()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainTestsPage()
						.ClickOnViewRiskBtn()
						.ClickOnOkBtnOnViewRiskWindow()
						.ClickOnEditBtn()
						.GoStraightToRiskDetailsPage()
						.SaveTest()
						.ValidateAndConfirmAlertMessage("Test saved successfully")
						.GoToMainTestsPage()
						.ClickOnRandomTestCase()
						.TryToRemoveRandomTestItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.SuspendRandomConnection()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.GoToSuspendedTab()
						.ReinstateRandomConnection()
						.ValidateAndConfirmAlertMessage("Reinstated")
						.GoToConnections()
						.NavigateToAddConnection()
						.RequestRandomConnection()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.TryToRemoveRandomDomainModel()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusiness(lobName)
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.ClickOnEditDomainModel()
						.TryToPublishLob()
						.ValidateAndConfirmAlertMessage("Created successfully")
						.GoToDomainModels()
						.ClickOnViewDomainModel()
						.CheckIfDomainModelExists()
						.GoToDocumentsPage()
						.ClickOnViewBtnOnDocuments()
						.CheckIfDocumentsTitleIsOnPlace("Document Details")
						.GoToRefersTab()
						.CheckIfGetReportExists()
						.SignOut();

				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole("Beta-Testers", "4")
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.DeleteCustomRole(roleName);

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserUseCustomRoleWithCreatePermissions()
		{
			UITest(() =>
			{
				var productName = RandomString();
				var schemeName = RandomString();
				var roleName = RandomString();
				var rateName = RandomString();
				var lobName = RandomString();
				var testCaseName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToConnections()
						.GoToSuspendedTab()
						.CheckReinstateConnections()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName)
						.SetAllCreatePermissions()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName, "5")
						.SignOut();


				loginPage.UseDifferentAccount()
						.LoginToPortalUser("5")
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName)
						.ValidateAndConfirmAlertMessage("Product has been created successfully")
						.GoToProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage = new ProductsPage(this.Driver);
				productsPage.ClickEditProductButton(productName)
				.PublishProductInTheFuture()
						.ValidateAndConfirmAlertMessage("Product has been updated successfully")
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage1 = new ProductsPage(this.Driver);
				productsPage1.SearchForProduct(productName)
				.TryToRemoveGivenProduct(productName)
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage2 = new ProductsPage(this.Driver);
				productsPage2.ClickOnViewBtn()
				.CheckProductNameIsVisible()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.ValidateAndConfirmAlertMessage("Scheme created successfully")
						.GoToMainSchemesPage()
						.ClickOnEditBtn()
						.ValidateScheme()
						.ValidateAndConfirmAlertMessage("Scheme compiled successfully")
						.GoToMainSchemesPage()
						.TryToRemoveSchemRandomItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainSchemesPage()
						.ClickOnViewBtn()
						.CheckIfSchemeNameIsDisplayed()
						.GoToMainRatesPage()
						.GoToCreateRatePage()
						.CreateARateWithSimpleIndexForPermissions(rateName)
						.GoToRateVersionTab()
						.ClickCreateRate()
						.ValidateAndConfirmAlertMessage("Rate file uploaded successfully.")
						.GoToMainRatesPage()
						.ClickOnEditBtn()
						.TryToPublishRateWhenEditing()
						.ValidateAndConfirmAlertMessage("Rate published successfully")
						.GoToMainRatesPage()
						.TryToRemoveRandomRateItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToMainRatesPage()
						.ClickOnViewBtn()
						.CheckIfRateNameIsDisplayed()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.ValidateAndConfirmAlertMessage("Test saved successfully")
						.GoToMainTestsPage()
						.ClickOnViewRiskBtn()
						.ClickOnOkBtnOnViewRiskWindow()
						.ClickOnEditBtn()
						.GoStraightToRiskDetailsPage()
						.SaveTest()
						.ValidateAndConfirmAlertMessage("Test saved successfully")
						.GoToMainTestsPage()
						.ClickOnRandomTestCase()
						.TryToRemoveRandomTestItem()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.SuspendRandomConnection()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToConnections()
						.GoToSuspendedTab()
						.ReinstateRandomConnection()
						.ValidateAndConfirmAlertMessage("Reinstated")
						.GoToConnections()
						.NavigateToAddConnection()
						.GoToDomainModels()
						.TryToRemoveRandomDomainModel()
						.ValidateAndConfirmAlertMessage("You do not have permission to access this feature")
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusiness(lobName)
						.ValidateAndConfirmAlertMessage("Created successfully")
						.GoToDomainModels()
						.ClickOnEditDomainModel()
						.TryToPublishLob()
						.ValidateAndConfirmAlertMessage("Created successfully")
						.GoToDomainModels()
						.ClickOnViewDomainModel()
						.CheckIfDomainModelExists()
						.GoToRefersTab()
						.CheckIfGetReportExists()
						.SignOut();

				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole("Beta-Testers", "5")
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.DeleteCustomRole(roleName);
			});
		}

		//All is turned on

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldUserUseCustomRoleWithAllPermissionsOn()
		{
			UITest(() =>
			{
				var productName = RandomString();
				var schemeName = RandomString();
				var roleName = RandomString();
				var rateName = RandomString();
				var lobName = RandomString();
				var testCaseName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToConnections()
						.GoToSuspendedTab()
						.CheckReinstateConnections()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName)
						.SetAllPermissions()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName, "1")
						.SignOut();


				loginPage.UseDifferentAccount()
						.LoginToPortalUser("1")
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName)
						.ValidateAndConfirmAlertMessage("Product has been created successfully")
						.GoToProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage = new ProductsPage(this.Driver);
				productsPage.ClickEditProductButton(productName)
				.PublishProductInTheFuture()
						.ValidateAndConfirmAlertMessage("Product has been updated successfully")
						.GoToMainProductsPage()
						.ClickOnViewBtn()
						.CheckProductNameIsVisible()
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage2 = new ProductsPage(this.Driver);
				productsPage2.RemoveProductThoroughly(productName)

						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.ValidateAndConfirmAlertMessage("Scheme created successfully")
						.GoToMainSchemesPage()
						.ClickOnEditBtn()
						.ValidateScheme()
						.ValidateAndConfirmAlertMessage("Scheme compiled successfully")
						.GoToMainSchemesPage()
						.ClickOnViewBtn()
						.CheckIfSchemeNameIsDisplayed()
						.GoToMainSchemesPage()
						.RemoveSchemeThoroughly(schemeName)

						.GoToMainRatesPage()
						.GoToCreateRatePage()
						.CreateARateWithSimpleIndexForPermissions(rateName)
						.GoToRateVersionTab()
						.ClickCreateRate()
						.ValidateAndConfirmAlertMessage("Rate file uploaded successfully.")
						.GoToMainRatesPage()
						.ClickOnEditBtn()
						.TryToPublishRateWhenEditing()
						.ValidateAndConfirmAlertMessage("Rate published successfully")
						.GoToMainRatesPage()
						.ClickOnViewBtn()
						.CheckIfRateNameIsDisplayed()
						.GoToMainRatesPage()
						.RemoveRateThoroughly(rateName)


						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.ValidateAndConfirmAlertMessage("Test saved successfully")
						.GoToMainTestsPage()
						.ClickOnViewRiskBtn()
						.ClickOnOkBtnOnViewRiskWindow()
						.ClickOnEditBtn()
						.GoStraightToRiskDetailsPage()
						.SaveTest()
						.ValidateAndConfirmAlertMessage("Test saved successfully")
						.GoToMainTestsPage()
						.ClickOnTestCase(testCaseName)
						.RemoveTestCase(testCaseName)
						.ValidateAndConfirmAlertMessage("Test Removed successfully")
						.GoToMainTestsPage()
						.CheckIfTestCaseWasRemoved(testCaseName)

						.GoToConnections()
						.SuspendRandomConnection()
						.ValidateAndConfirmAlertMessage("Suspended")
						.GoToConnections()
						.GoToSuspendedTab()
						.ReinstateRandomConnection()
						.ValidateAndConfirmAlertMessage("Reinstated")

						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusiness(lobName)
						.ValidateAndConfirmAlertMessage("Created successfully")
						.GoToDomainModels()
						.ClickOnEditDomainModel()
						.TryToPublishLob()
						.ValidateAndConfirmAlertMessage("Created successfully")
						.GoToDomainModels()
						.ClickOnViewDomainModel()
						.CheckIfDomainModelExists()
						.GoToDomainModels()
						.RemoveDomainModel(lobName)
						.ConfirmDomainModelWasRemoved(lobName)

						.GoToDocumentsPage()
						.ClickOnViewBtnOnDocuments()
						.CheckIfDocumentsTitleIsOnPlace("Document Details")
						.GoToRefersTab()
						.CheckIfGetReportExists()
						.SignOut();

				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole("Beta-Testers", "1")
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.DeleteCustomRole(roleName);

				


				});
		}

		
		
		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldSchemeTypesPermissionsWork()
		{
			UITest(() =>
			{
				string avivaSchemeName = RandomString();

				string ticSchemeName = RandomString();

				string polarisSchemeName = RandomString();

				string roleName1 = RandomString();

				string roleName2 = RandomString();

				string roleName3 = RandomString();
				var loginPage = new LoginPage(this.Driver);
					loginPage.LoginToPortalAdmin()
								.GoToSettingsPage()
								.GoToRolesAdminPage()
								.CreateCustomRole(roleName1)
								.SetAvivaSchemeType()
								.GoToSettingsPage()
								.GoToUsersAdminPage()
								.ChangeMyUsersRole(roleName1, "7")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalUser("7")
								.GoToMainSchemesPage()
								.GoToCreateSchemePage()
								.CreateAvivaEngineScheme(avivaSchemeName)
								.ValidateAndConfirmAlertMessage("Scheme created successfully")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalAdmin()
								.GoToSettingsPage()
								.GoToRolesAdminPage()
								.CreateCustomRole(roleName2)
								.SetTicSchemeType()
								.GoToSettingsPage()
								.GoToUsersAdminPage()
								.ChangeMyUsersRole(roleName2, "7")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalUser("7")
								.GoToMainSchemesPage()
								.GoToCreateSchemePage()
								.CreateAsyncScheme(ticSchemeName)
								.GoToEditSchemePage()
								.GoToMainSchemesPage()
								.SearchForTheScheme(ticSchemeName)
								.ClickOnViewBtn()
								.CheckIfSchemeNameIsDisplayed()
								.GoToDasboardPage()
								.GoToMainSchemesPage()
								.SearchForTheScheme(avivaSchemeName)
								.ConfirmSchemeDoesntExist()
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalAdmin()
								.GoToSettingsPage()
								.GoToRolesAdminPage()
								.CreateCustomRole(roleName3)
								.SetPolarisSchemeType()
								.GoToSettingsPage()
								.GoToUsersAdminPage()
								.ChangeMyUsersRole(roleName3, "7")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalUser("7")
								.GoToMainSchemesPage()
								.GoToCreateSchemePage()
								.CreatePolarisEngineScheme(polarisSchemeName)
								.GoToSchemeDetailsPage()
								.ConfirmPolarisEnvironment()
								.GoToMainSchemesPage()
								.SearchForTheScheme(avivaSchemeName)
								.ConfirmSchemeDoesntExist()
								.GoToDasboardPage()
								.GoToMainSchemesPage()
								.SearchForTheScheme(ticSchemeName)
								.ConfirmSchemeDoesntExist()
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalAdmin()
								.GoToSettingsPage()
								.GoToUsersAdminPage()
								.ChangeMyUsersRole(roleName1, "7")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalUser("7")
								.GoToMainSchemesPage()
								.SearchForTheScheme(ticSchemeName)
								.ConfirmSchemeDoesntExist()
								.GoToDasboardPage()
								.GoToMainSchemesPage()
								.SearchForTheScheme(polarisSchemeName)
								.ConfirmSchemeDoesntExist()
								.GoToDasboardPage()
								.GoToMainSchemesPage()
								.RemoveSchemeThoroughly(avivaSchemeName)
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalAdmin()
								.GoToSettingsPage()
								.GoToUsersAdminPage()
								.ChangeMyUsersRole(roleName2, "7")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalUser("7")
								.GoToMainSchemesPage()
								.RemoveSchemeThoroughly(ticSchemeName)
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalAdmin()
								.GoToSettingsPage()
								.GoToUsersAdminPage()
								.ChangeMyUsersRole(roleName3, "7")
								.SignOut();
					loginPage.UseDifferentAccount()
								.LoginToPortalUser("7")
								.GoToMainSchemesPage()
								.RemoveSchemeThoroughly(polarisSchemeName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldKitsuneJsonIhpSchemeTypesPermissionsWork()
		{
			UITest(() =>
			{
				string kitsuneSchemeName = RandomString();
				string jsonIhpSchemeName = RandomString();
				string batchedJsonIhpSchemeName = RandomString();
				string roleName1 = RandomString();
				string roleName2 = RandomString();
				string roleName3 = RandomString();
				
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName1)
						.SetKitsuneSchemeType()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName1, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateKitsuneEngineScheme(kitsuneSchemeName)
						.ValidateAndConfirmAlertMessage("Scheme created successfully")
						.GoToMainSchemesPage()
						.SearchForTheScheme(kitsuneSchemeName)
						.EditScheme(kitsuneSchemeName)
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName2)
						.SetJsonIhpSchemeType()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName2, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateJsonIhpEngineScheme(jsonIhpSchemeName)
						.ValidateAndConfirmAlertMessage("Scheme created successfully")
						.GoToMainSchemesPage()
						.SearchForTheScheme(jsonIhpSchemeName)
						.EditScheme(jsonIhpSchemeName)
						.GoToMainSchemesPage()
						.SearchForTheScheme(kitsuneSchemeName)
						.ConfirmSchemeDoesntExist()
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName1, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.SearchForTheScheme(jsonIhpSchemeName)
						.ConfirmSchemeDoesntExist()
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.RemoveSchemeThoroughly(kitsuneSchemeName)
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName2, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.RemoveSchemeThoroughly(jsonIhpSchemeName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldAxaUkJsonIhpSchemeTypesPermissionsWork()
		{
			UITest(() =>
			{
				string jsonIhpSchemeName = RandomString();
				string axaukSchemename = RandomString();
				string batchedJsonIhpSchemeName = RandomString();
				string roleName1 = RandomString();
				string roleName2 = RandomString();
				string roleName3 = RandomString();

				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName1)
						.SetAxaUkSchemeType()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName1, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAxaUKEngineScheme(axaukSchemename)
						.ValidateAndConfirmAlertMessage("Scheme created successfully")
						.GoToMainSchemesPage()
						.SearchForTheScheme(axaukSchemename)
						.EditScheme(axaukSchemename)
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToRolesAdminPage()
						.CreateCustomRole(roleName2)
						.SetJsonIhpSchemeType()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName2, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateJsonIhpEngineScheme(jsonIhpSchemeName)
						.ValidateAndConfirmAlertMessage("Scheme created successfully")
						.GoToMainSchemesPage()
						.SearchForTheScheme(jsonIhpSchemeName)
						.EditScheme(jsonIhpSchemeName)
						.GoToMainSchemesPage()
						.SearchForTheScheme(axaukSchemename)
						.ConfirmSchemeDoesntExist()
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName1, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.SearchForTheScheme(jsonIhpSchemeName)
						.ConfirmSchemeDoesntExist()
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.RemoveSchemeThoroughly(axaukSchemename)
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalAdmin()
						.GoToSettingsPage()
						.GoToUsersAdminPage()
						.ChangeMyUsersRole(roleName2, "6")
						.SignOut();
				loginPage.UseDifferentAccount()
						.LoginToPortalUser("6")
						.GoToMainSchemesPage()
						.RemoveSchemeThoroughly(jsonIhpSchemeName);
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldAllNavigationTabsWorkCorrectly()
		{
			UITest(() =>
			{
				
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				//check all tabs are visible
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.ProductsTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.SchemesTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.RatesTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.TestsTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.DomainModelsTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.QuoteManipulationTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.DocumentsTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.ConnectionsTab), "Element is not present. Please investigate");
				Assert.AreEqual(true, dashboardPage.GivenElementExists(dashboardPage.ReportsTab), "Element is not present. Please investigate");
				// go to connections
				ConnectionsPage connectionsPage = dashboardPage.GoToConnections();
				// assert
				Assert.AreEqual(true, connectionsPage.GivenElementExists(connectionsPage.CardContent), "Connections page is not visible. Please investigae.");
				// go to reports and assert
				RefersPage refersPage = connectionsPage.GoToRefersTab();
				refersPage.CheckIfGetReportExists();
				DeclinesPage declinesPage = refersPage.GoToDeclinesTab();
				declinesPage.CheckIfGetReportExists();
				SchemeErrorsPage schemeErrorsPage = declinesPage.GoToSchemeErrorsTab();
				schemeErrorsPage.CheckIfGetReportExists();
				schemeErrorsPage.SetQueryTo7Days();
				schemeErrorsPage.ViewRandomRisk();
				Assert.AreEqual("Request Risk", schemeErrorsPage.GetTextFromModal(), "Request Risk not visible, something went wrong, please investigate");
				schemeErrorsPage.CloseModal();
				LiveRunResultsPage liveRunResultsPage = schemeErrorsPage.GoToLiveRunResults();
				Assert.AreEqual(true, liveRunResultsPage.GivenElementExists(liveRunResultsPage.Index), "Live Run page is not visible. Please investigate.");
				UnindexedRatesPage unindexedRatesPage = liveRunResultsPage.GoToUnindexedRates();
				Assert.AreEqual(true, unindexedRatesPage.GivenElementExists(unindexedRatesPage.rateName), "Unindexed rates page is not visible. Please investigate.");
				OldRatesPage oldRatesPage = unindexedRatesPage.GoToOldRates();
				RateDetailsPage rateDetailsPage = oldRatesPage.ClickOnView();
				Assert.IsTrue(rateDetailsPage.RateSideDescriptionPresent(), "Rate side description is not present, didn't go to rate details page.");
				//go to products
				ProductsPage productsPage = rateDetailsPage.GoToProductsPage();
				//assert
				Assert.AreEqual(true, productsPage.GivenElementExists(productsPage.CreateProduct), "Products page is not visible. Please investigate.");
				//go to schemes
				SchemesPage schemesPage = productsPage.GoToMainSchemesPage();
				//assert
				Assert.AreEqual(true, schemesPage.GivenElementExists(schemesPage.CreateScheme.ElementSelector), "Schemes page is not visible. Please investigate.");
				//go to rates
				RatesPage ratespage = schemesPage.GoToMainRatesPage();
				//assert
				Assert.AreEqual(true, ratespage.GivenElementExists(ratespage.CreateNewRate), "Rates page is not visible. Please investigate.");
				// go to tests
				TestsPage testspage = ratespage.GoToMainTestsPage();
				// assert
				Assert.AreEqual(true, testspage.GivenElementExists(testspage.CreateTestGroup), "Tests page is not visible. Please investigate.");
				//go to domains
				DomainModelsPage domainModelsPage = testspage.GoToDomainModels();
				// assert
				Assert.AreEqual(true, domainModelsPage.GivenElementExists(domainModelsPage.CreateDomainModel), "Domain page is not visible. Please investigate.");
				//go to documents
				DocumentsPage documentsPage = domainModelsPage.GoToDocumentsPage();
				//assert
				Assert.IsTrue(documentsPage.CheckIfDocumentsPageIsEnabled(), "Documents page is not visible. Please investigate.");
				// go to knowledgebase
				KnowledgebasePages knowledgebasePages = documentsPage.GoToKnowledgebasePage();
				//assert
				Assert.IsTrue(knowledgebasePages.CheckIfKnowledgebasePagesWork(), "Knowledge base page is not visible. Please investigate.");
				//go to news
				NewsPages newsPages = knowledgebasePages.GoToNewsPage();
				// assert
				Assert.IsTrue(newsPages.CheckIfNewsPagesWork(), "News page is not visible. Please investigate.");
				// go to downloads
				DownloadsPages downloadsPages = newsPages.GoToDownloadsPage();
				// assert availableDownloads
				Assert.IsTrue(downloadsPages.CheckIfDownloadsPagesWork(), "Downloads page is not visible. Please investigate.");
				// go to integration
				IntegrationPages integrationPages = downloadsPages.GoToInteractionPage();
				// assert ViewMotorBtn
				Assert.IsTrue(integrationPages.CheckIfIntegrationPagesWork(), "Integration page is not visible. Please investigate.");
			});
		}
	}
	
}