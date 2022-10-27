using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2Framework.Pages.Test_Pages;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Base;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Domain_Model_Pages;
using TicPortalV2SeleniumFramework.Pages.Product_Pages;
using TicPortalV2SeleniumFramework.Pages.Rate_Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;
using TicPortalV2SeleniumFramework.Pages.Test_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class TestsTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserCreateTestGroup()
		{
			UITest(() =>
			{
				string testGroupName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
					loginPage.LoginToPortalAdmin()
					.GoToMainTestsPage()
					.CreateNewTestGroup()
					.CreateTestGroup(testGroupName)
					.CheckIfTestGroupExists(testGroupName);
				
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRemoveTestGroup()
		{
			UITest(() =>
			{
				string testGroupName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
					loginPage.LoginToPortalAdmin()
							.GoToMainTestsPage()
							.CreateNewTestGroup()
							.CreateTestGroup(testGroupName)
							.RemoveTestGroup(testGroupName)
							.CheckIfTestGroupExists(testGroupName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateTestCase()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

						loginPage.LoginToPortalAdmin()
								.GoToMainTestsPage()
								.CreateNewTestCase()
								.GoToRiskDetails(testCaseName)
								.SaveTest()								
								.NavigateToTestsPage()
								.SearchForTestCase(testCaseName)
								.CheckIfTestCaseExists(testCaseName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateTestCaseAndAddToTestGroup()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetailsWithGroup(testCaseName, "DoNotDeleteThisTestGroup1")
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName)
						.CheckTestCaseGroup("DoNotDeleteThisTestGroup1");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCanMoveTestCaseToOtherGroup()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetailsWithGroup(testCaseName, "DoNotDeleteThisTestGroup1")
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName)
						.CheckTestCaseGroup("DoNotDeleteThisTestGroup1")
						.MoveTestToOtherGroup("DoNotDeleteThisTestGroup2")
						.SearchForTestCase(testCaseName)
						.CheckTestCaseGroup("DoNotDeleteThisTestGroup2");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCanMoveTestCaseToUngrouped()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetailsWithGroup(testCaseName, "DoNotDeleteThisTestGroup1")
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName)
						.CheckTestCaseGroup("DoNotDeleteThisTestGroup1")
						.MoveTestToOtherGroup("Ungrouped")
						.SearchForTestCase(testCaseName)
						.CheckTestCaseGroup("Ungrouped");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCanMoveTestCaseFromUngroupedToOtherGroup()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName)
						.CheckTestCaseGroup("Ungrouped")
						.MoveTestToOtherGroup("DoNotDeleteThisTestGroup1")
						.SearchForTestCase(testCaseName)
						.CheckTestCaseGroup("DoNotDeleteThisTestGroup1");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserRemoveTestCase()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName)
						.RemoveTestCase(testCaseName)
						.ValidateAndConfirmAlertMessage("Test Removed successfully")
						.GoToMainTestsPage()
						.CheckIfTestCaseWasRemoved(testCaseName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		
		public void ShouldUserRunTestCaseOnZurichProduct()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				string productName = RandomString();

				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateZurichEngineScheme(schemeName)
						.GoToEditSchemePage()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName)
						.GoToProductDetailsPage()
						.EnableProduct()
						.ValidateAndConfirmAlertMessage("Product enabled")
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToZurichRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithProductChoice(productName)
						.RunTestCaseForProductWithErrorHandling(testCaseName)
						.ViewTestResults()
						.ValidateTestReply();


			});
		}
		//Test will be introduced after the full engine's implementation

		public void ShouldUserRunTestCaseOnAxaUkProduct()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				string productName = RandomString();

				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAxaUKEngineScheme(schemeName)
						.GoToEditSchemePage()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName, "Household")
						.GoToProductDetailsPage()
						.EnableProduct()
						.ValidateAndConfirmAlertMessage("Product enabled")
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToAxaUkRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithProductChoice(productName)
						.RunTestCaseForProductWithErrorHandling(testCaseName)
						.ViewTestResults()
						.ValidateTestReply();


			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserViewRisk()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

					loginPage.LoginToPortalAdmin()
							.GoToMainTestsPage()
							.CreateNewTestCase()
							.GoToRiskDetails(testCaseName)
							.SaveTest()
							.NavigateToTestsPage()
							.SearchForTestCase(testCaseName)
							.CheckIfTestCaseExists(testCaseName)
							.ClickOnTestCase(testCaseName)
							.ViewRisk(testCaseName)
							.ConfirmViewRiskWindowAppeared();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		
		public void ShouldUserRunTestCaseWithTestRate()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string rateName = RandomNumber();
				string testName = RandomString();

				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainRatesPage()
						.GoToCreateRatePage()
						.CreateATestRate(rateName)
						.GoToRateVersionTab()
						.CreateRateAndConfirmSuccess()
						.GotoEditRatePage()
						.AddNewRowAndData()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.SubstituteSchemeText(rateName, "NAME", "NUMBER")
						.ValidateAndTest()
						.SearchForTestCase(testName)
						.AddGroup()
						.RunTest()
						.ViewResults(testName)
						.CheckResultMessage()
						.RunTestWithTestRates()
						.ViewResults(testName)
						.CheckResultForTestRate();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
	
		public void ShouldUserRunTestCaseOnPolarisProduct()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				string productName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(schemeName, "Commercial Vehicle")
						.GoToSchemeDetailsPage()
						.GoToPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariant("ApiPolarisCV", "1")
						.CreatePolarisSchemeVersion()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName, "Commercial Vehicle")
						.GoToProductDetailsPage()
						.EnableProduct()
						.ValidateAndConfirmAlertMessage("Product enabled")
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName, "Commercial Vehicle")
						.CreateTestCaseFromFile("PolarisRisk.txt")
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithProductChoice(productName)
						.RunTestCaseForProductWithErrorHandling(testCaseName)
						.ViewTestResults()
						.ValidateTestReply();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
	
		public void ShouldUserRunTestCaseOnPolarisScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(schemeName, "Commercial Vehicle")
						.GoToSchemeDetailsPage()
						.GoToPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariant("ApiPolarisCV", "1")
						.CreatePolarisSchemeVersion()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName, "Commercial Vehicle")
						.CreateTestCaseFromFile("PolarisRisk.txt")
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithTicSchemeChoice(schemeName)
						.RunTestCaseForScheme(testCaseName)
						.ViewTestResults()
						.ValidateTestReply();

			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"),TestCategory("customPolaris")]
		
		public void ShouldUserRunTestCaseOnCustomPolarisScheme()
		{


			UITest(() =>
			{
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				string testCaseName = RandomNumber();


				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateCustomPolarisEngineScheme(schemeName)
						.GoToSchemeDetailsPage()
						.GoToCustomPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariantbyIndex(1, "1")
						.CreateNewCustomPolarisSchemeVersion()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.SelectRiskDetails(testCaseName, "COMMCOMB")
						.CreateTestCaseFromFile("CustomPolarisRisk.txt")
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithTicSchemeChoice(schemeName)
						.RunTestCaseForScheme(testCaseName)
						.ViewTestResults()
						.ValidateTestReply();
			});            
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("customPolaris")]
	
		public void ShouldUserRunTestCaseOnCustomPolarisProduct()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				string productName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
					   .GoToMainSchemesPage()
					   .GoToCreateSchemePage()
					   .CreateCustomPolarisEngineScheme(schemeName)
					   .GoToSchemeDetailsPage()
					   .GoToCustomPolarisSchemeVersionPage()
					   .SelectSchemeSetAndVariantbyIndex(1, "1")
					   .CreateNewCustomPolarisSchemeVersion()
					   .GoToProductsPage()
						.GoToCreateProductPage()
						.CreateCustomPolarisProductWithVersion(productName, schemeName)
						.GoToProductDetailsPage()
						.EnableProduct()
						.ValidateAndConfirmAlertMessage("Product enabled")
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.SelectRiskDetails(testCaseName, "COMMCOMB")
						.CreateTestCaseFromFile("CustomPolarisRisk.txt")
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithProductChoice(productName)
						.RunTestCaseForProductWithErrorHandling(testCaseName)
						.ViewTestResults()
						.ValidateTestReply();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserCreateATestCaseForACustomLob()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string domainModelName = RandomString();
				string testCaseName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToDomainModels()
						.ClickOnCreateDomainModel()
						.CreateLineOfBusinessByUploadingAFile(CheckBrowser, domainModelName, "TestClass", "TestClass.cs")
						.PublishLob()
						.CheckIfDomainModelNameIsCorrect(domainModelName)
						.GoToCreateDomainModelsPageByEditingIt()
						.CheckIfUploadedLobIsFine()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName, domainModelName)
						.CreateNewRiskDetailsPage()
						.CreateTestCaseForLob()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName);
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserEditTestCase()
		{
			UITest(() =>
			{
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.CheckIfTestCaseExists(testCaseName)
						.ClickOnTestCase(testCaseName)
						.ClickOnEditTestCase(testCaseName)
						.ChangeExpectedPremium("100000000")
						.SaveTest()
						.NavigateToTestsPage()
						.SearchForTestCase(testCaseName)
						.ClickOnTestCase(testCaseName)
						.ClickOnEditTestCase(testCaseName)
						.ConfirmExpectedPremiumIsCorrect("100000000");
				
				});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRunTestCaseOnScheme()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddDeclineToSchemeCode()
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithTicSchemeChoice(schemeName)
						.RunTestCaseForScheme(testCaseName)
						.ViewTestResults()
						.ValidateTestDecline();
				

			
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRunTestCaseOnSchemeWithEnrichments()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddEnrichmentHandlingToScheme()
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.AddEnrichments()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithTicSchemeChoice(schemeName)
						.RunTestCaseForScheme(testCaseName)
						.ViewTestResults()
						.ValidateTestEnrichments();



			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldSchemeandProductWithEnrichmentsGiveSameResults()
		{
			UITest(() =>
			{
				string schemeName = "ApiEchoEnrichmentCV";
				string productName = "ApiEnrichmentEchoCV";
				string testCaseName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.AddEnrichments()
						.GoToRiskDetails(testCaseName, "Commercial Vehicle")
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithTicSchemeChoice(schemeName)
						.RunTestCaseForScheme(testCaseName)
						.ViewTestResults()
						.ValidateEnrichments()
						.GoToMainTestsPage()
						.GoToTestExplorerWithProductChoice(productName)
						.RunTestCaseForProduct(testCaseName)
						.ViewTestResults()
						.ValidateProductEnrichments();



			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserRunTestCaseOnProduct()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testCaseName = RandomNumber();
				string productName = RandomString();

				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.AddNetPremiumToSchemeCode()
						.PublishScheme("This can be deleted")
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName)
						.GoToProductDetailsPage()
						.EnableProduct()
						.GoToMainTestsPage()
						.CreateNewTestCase()
						.GoToRiskDetails(testCaseName)
						.SaveTest()
						.NavigateToTestsPage()
						.GoToTestExplorerWithProductChoice(productName)
						.RunTestCaseForProduct(testCaseName)
						.ViewTestResults()
						.ConfirmThereAreNoErrors();
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
	
		public void ShouldUserRunTestCaseWithLiveResults()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string testName = RandomString();

				var loginPage = new LoginPage(this.Driver);

					loginPage.LoginToPortalAdmin()
							.GoToMainTestsPage()
							.CreateNewTestCase()
							.GoToRiskDetailsLive(testName)
							.SetHouseNo()
							.SaveTest()
							.NavigateToTestsPage()
							.GoToMainSchemesPage()
							.GoToCreateSchemePage()
							.CreateAsyncScheme(schemeName)
							.GoToEditSchemePage()
							.PublishScheme("This can be deleted")
							.GoToSchemeDetailsFromPublishSubpage()
							.GoToMainSchemesPage()
							.SearchForTheScheme(schemeName)
							.EditScheme(schemeName)
							.SchemeFromFile()
							.ValidateAndTest()
							.SearchForTestCase(testName)
							.AddGroup()
							.RunTestWithLiveResponce()
							.ViewTestResults(testName)
							.ConfirmTestoutputIsCorrect();
				});
		}
	}
}