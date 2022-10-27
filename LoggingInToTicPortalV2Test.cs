using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Product_Pages;
using TicPortalV2SeleniumFramework.Pages.Rate_Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class LoggingInToTicPortalV2Test : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserLoginToPortal()
		{
			UITest(() =>
			{
				var dashboardPage = new LoginPage(this.Driver);

				DashboardPage dashboard = dashboardPage.LoginToPortalAdmin();
				Assert.IsTrue(dashboard.EnsurePageDidNotFail("DashboardPage"), "There was a problem while loggin in the TIC Portal");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserSignOutFromPortal()
		{
			UITest(() =>
			{
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				dashboardPage.ClickOnSignOut();
				Assert.IsTrue(loginPage.CheckIfSignOut(), "There was a problem while signing out from the TIC Portal");
			});
		}

	//	[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void WarmupTest()
		{
			DontThrowExceptionWhenNotNeeded(() =>
			{
				UITest(() =>
				{
					string productName = RandomNumber();
					string schemeName = RandomString();
					string rateName = RandomNumber();
					var loginPage = new LoginPage(this.Driver);
					loginPage.LoginToPortalAdmin()
							.GoToMainRatesPage()
							.GoToCreateRatePage()
							.CreateARateWithSimpleIndex(rateName)
							.CheckIfIndex1AddedCorrectly().Contains("NUMBER").Should().BeTrue();
					var createRatePage = new CreateRatePage(this.Driver);
					createRatePage.GoToRateVersionTab();
						createRatePage.ClickCreateRate();
						createRatePage.ConfirmAlertOnce();
					var rateDetailsPage = new RateDetailsPage(this.Driver);

					SchemesPage schemesPage = rateDetailsPage.GoToMainSchemesPage();

					CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
					createSchemePage.CreateAsyncScheme(schemeName);
					EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
					editSchemePage.AddRateToScheme(rateName);
					editSchemePage.ValidateScheme();
					Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not validated correctly when it should. Please investigate");
					editSchemePage.ConfirmContinueAlertOnce();
					editSchemePage.PublishScheme("description is being added");
					Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not validated correctly when it should. Please investigate");
					editSchemePage.ConfirmAlertOnce();
					editSchemePage.GoToRatesSubPage();
					Assert.IsTrue(editSchemePage.CheckIfRateIsAdded().Contains(rateName));

					ProductsPage productsPage = editSchemePage.GoToMainProductsPage();
					CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
					createProductPage.CreateProductWithVersion(productName, schemeName);
					ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

					Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");

					Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				});
			});
		}

		//[TestMethod, TestCategory("ie")]
		public void WarmupTest2()
		{
			DontThrowExceptionWhenNotNeeded(() =>
			{
				UITest(() =>
				{
					string productName = RandomNumber();
					string schemeName = RandomString();
					string rateName = RandomNumber(); var loginPage = new LoginPage(this.Driver);
					DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
					RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
					CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

					createRatePage.CreateARateWithSimpleIndex(rateName);
					Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"));
					createRatePage.GoToRateVersionTab();
					createRatePage.ClickCreateRate();
					createRatePage.ConfirmAlertOnce();
					var rateDetailsPage = new RateDetailsPage(this.Driver);

					SchemesPage schemesPage = rateDetailsPage.GoToMainSchemesPage();

					CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
					createSchemePage.CreateAsyncScheme(schemeName);
					EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
					editSchemePage.AddRateToScheme(rateName);
					editSchemePage.ValidateScheme();
					Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not validated correctly when it should. Please investigate");
					editSchemePage.ConfirmContinueAlertOnce();
					editSchemePage.PublishScheme("description is being added");
					Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not validated correctly when it should. Please investigate");
					editSchemePage.ConfirmAlertOnce();
					editSchemePage.GoToRatesSubPage();
					Assert.IsTrue(editSchemePage.CheckIfRateIsAdded().Contains(rateName));

					ProductsPage productsPage = editSchemePage.GoToMainProductsPage();
					CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
					createProductPage.CreateProductWithVersion(productName, schemeName);
					ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

					Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");

					Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				});
			});
		}
	}
}