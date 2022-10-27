using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Product_Pages;
using TicPortalV2SeleniumFramework.Pages.Scheme_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class NegativeProductsTests : TestSetUp
	{
		//
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldNotUserCreateProductWithoutAName()
		{
			UITest(() =>
			{
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithoutAName()
						.GetAlertMessageString().Should().Contain("Product name cannot be empty.");
				
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldNotUserCreateProductWithoutAnEnrichment()
		{
			UITest(() =>
			{
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithoutEnrichment("Product Name").GetAlertMessageString().Should().Contain("Data enrichment is empty. Please choose the enrichment or remove empty entry.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldNotUserAddProductNextVersionBeforeTheEarlierOne()
		{
			UITest(() =>
			{
				var productName = RandomString();
				var schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);				
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName)
						.GoToProductDetailsPage()
						.GoToManageTab()
						.GoToEditProductPage()
						.PublishProductInThePast().GetAlertMessageString().Should().Contain("New version can not start before previous versions.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"),]
		public void ShouldNotUserChangeStartDateToBlank()
		{
			UITest(() =>
			{
				var productName = RandomString();
				var schemeName = RandomString();
				var newProductName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithoutAScheme(productName)
						.GoToProductDetailsPage()
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage = new ProductsPage(this.Driver);
				productsPage.ClickEditProductButton(productName)
				.PublishProductWithoutDate().GetAlertMessageString().Should().Contain("Cannot be empty");
				
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless")]
		public void ShouldNotUserChangeStartDateToPastOne()
		{
			UITest(() =>
			{
				var productName = RandomString();
				var schemeName = RandomString();
				var newProductName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.GoToProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithVersion(productName, schemeName)
						.GoToProductDetailsPage()
						.GoToMainProductsPage()
						.GoToDisabledProductsTab();
				ProductsPage productsPage = new ProductsPage(this.Driver);
				productsPage.ClickEditProductButton(productName)
				.PublishProductInThePast().GetAlertMessageString().Should().Contain("New version can not start before previous versions."); ;
				
			});
		}
	}
}