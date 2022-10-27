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
	public class PositiveProductTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateProductWithoutAScheme()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithoutAScheme(productName);
				Assert.AreEqual("Product has been created successfully", createProductPage.GetAlertMessageString(), "Product can not be created without a scheme or error message is wrong. Please investigate.");
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateProductWithATag()
		{
			UITest(() =>
			{
				string productName = RandomNumber();
				string tag = RandomString();
				string tagRemove = "\'" + tag + "\'" + " tag removed";
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithoutAScheme(productName);
				Assert.AreEqual("Product has been created successfully", createProductPage.GetAlertMessageString(), "Product can not be created without a scheme or error message is wrong. Please investigate.");
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				productDetailsPage.AddTag(tag);
				Assert.AreEqual(tag, productDetailsPage.CheckDeleteButton().Text, "Tag not added or can't see delete tag button. Please investigate.");
				ProductsPage productsPage2 = productDetailsPage.GoToMainProductsPage();
				productsPage2.GoToDisabledProductsTab();
				productsPage2.SearchForProduct(productName);
				Assert.AreEqual(tag, productsPage2.TagNameInList().Text, "Tag not added or can't see tag in search. Please investigate.");
				productsPage2.ClearProductSearchBox();
				productsPage2.SearchForProductByTag(tag);
				Assert.AreEqual(productName, productsPage2.TabIndexName().Text, "Tag not added or can't search by tag. Please investigate.");
				ProductDetailsPage productDetailsPage2 = productsPage2.ViewProduct();
				productDetailsPage2.RemoveTag();
				productDetailsPage2.RefreshThePortal();
				Assert.AreEqual(tagRemove, productDetailsPage2.GetPanelBody().Text, "Tag not removed or something went wrong. Please investigate");
				ProductsPage productsPage3 = productDetailsPage2.GoToMainProductsPage();
				productsPage3.GoToDisabledProductsTab();
				productsPage3.SearchForProductByTag(tag);
				Assert.AreEqual("There are no items to display", productsPage3.EmptyTagsListTextOnProducts(), " Products list is not empty after removing a Tag. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateProductWithAScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserChangeProductsNameWithoutIssues()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string productNameChange = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");

				productDetailsPage.ChangeProductName(productNameChange);
				Assert.AreEqual(productNameChange, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");

				/*
				ProductsPage productsPage2 = productDetailsPage.GoToMainProductsPage();
				EditProductPage editProductPage = productsPage2.ClickEditProductButton(productName);
				editProductPage.ChangeProductName(productNameChange);
				editProductPage.PublishOnEditPage();
				editProductPage.ConfirmAlertOnce();
				ProductDetailsPage productDetailsPage2 = new ProductDetailsPage();
				Assert.AreEqual(productNameChange, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				*/
				productDetailsPage.CheckIfSchemeLinked(schemeName);
				SchemeDetailsPage schemeDetailsPage = productDetailsPage.ClickOnSchemeLink(schemeName);
				ProductDetailsPage productDetailsPage2 = schemeDetailsPage.ClickOnProductLink(productNameChange);

				Assert.AreEqual(productNameChange, productDetailsPage2.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserNCDTAbleInProduct()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithoutAScheme(productName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");

				productDetailsPage.GoToNCDTab();
				productDetailsPage.CreateNCDTable();
				Assert.AreEqual("New NCD table published successfully", productDetailsPage.GetAlertMessageString(), "NCD was not created successfully. Please investigate.");
				productDetailsPage.ConfirmAlertOnce();
				Assert.AreEqual("30", productDetailsPage.CheckAverageNCD(), "The data in the NCD table is wrong. Please investigate.");
				Assert.AreEqual("2", productDetailsPage.CheckNumberOfYearsNCD(), "The data in the NCD table is wrong. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateProductWithFutureVersionAndCancelIt()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersionInTheFuture(productName, schemeName, CheckBrowser);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				productDetailsPage.GoToVersionsTab();
				productDetailsPage.CancelFutureVersion();
				Assert.IsTrue(productDetailsPage.GetAlertMessageString().Contains("Cancelling this version will also cancel any versions"), "Cancel future version button doesn't work. Please investigate");
				productDetailsPage.ConfirmAlertTwice();
				Assert.IsTrue(productDetailsPage.CheckIfNoProductVersion().Contains("No versions"), "Future version was not cancelled. Please investigate");
			});
		}

		/*
				[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
				public void ShouldUserLoginAndChangeUrl()
				{
					//UITest(() =>
					//{
						string productName = RandomString();
						string schemeName = RandomString();

						var bla = new ApiBase();

						var ticResponse = bla.GetTicResponse(new string[] { "5b5b11aad58c1917a030a9d7" }, new DateTime(2019, 7, 15), "New Business", "AcornRisk.json");

						var bla2 = ticResponse.RequestId.ToString();

						var loginPage = new LoginPage(this.Driver);
						dashboardPage.ChangeUrlToEqifaxLog();
						dashboardPage.EnterRequestId(bla2);

				   // });
				}
		*/

		/*
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox")]
		public void ShouldUserBeAbleToAddEnrichment()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string productName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithEnrichment(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("EquifaxClientEnrichment", productDetailsPage.CheckIfDataEnrichmentLinked(), "Data enrichment link is not visible on Product Details Page. Please investigate.");
				DontThrowExceptionWhenNotNeeded(() =>
				{
					ProductsPage productsPage2 = productDetailsPage.GoToMainProductsPage();
					productsPage2.RemoveProductThoroughly(productName);

					SchemesPage schemesPage3 = editSchemePage.GoToMainSchemesPage();
					schemesPage3.RemoveSchemeThoroughly(schemeName);
				});
			});
		}

	*/

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateProductWithGivenSchemeAndRate()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				string rateName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				RatesPage ratesPage = dashboardPage.GoToMainRatesPage();
				CreateRatePage createRatePage = ratesPage.GoToCreateRatePage();

				createRatePage.CreateARateWithSimpleIndex(rateName);
				Assert.IsTrue(createRatePage.CheckIfIndex1AddedCorrectly().Contains("NUMBER"));
				createRatePage.GoToRateVersionTab();
				createRatePage.ClickCreateRate();
				Assert.AreEqual("Rate file uploaded successfully. Import process will continue. Once completed rate status will change to 'Ready'.", createRatePage.GetAlertMessageString(), "Alert is wrong or sth else. Please investigate.");
				createRatePage.ConfirmAlertOnce();
				var rateDetailsPage = new RateDetailsPage(Driver);

				SchemesPage schemesPage = rateDetailsPage.GoToMainSchemesPage();

				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				editSchemePage.AddRateToScheme(rateName);
				editSchemePage.ValidateScheme();
				editSchemePage.ConfirmContinueAlertOnce();
				editSchemePage.PublishScheme("This can be deleted");
				Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not published correctly when it should. Please investigate");
				editSchemePage.GoToSchemeDetailsFromPublishSubpage();
				editSchemePage.GoToRatesSubPage();
				Assert.IsTrue(editSchemePage.CheckIfRateIsAdded().Contains(rateName));

				ProductsPage productsPage = editSchemePage.GoToMainProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");

				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateProductWithGivenMTARenewalCancelScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				string matschemeName = RandomString();
				string cancSchemeName = RandomString();
				string renSchemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				editSchemePage.PublishScheme("This can be deleted");
				Assert.IsTrue(editSchemePage.GetAlertMessageString().Contains("success"), "Scheme was not published correctly when it should. Please investigate");
				editSchemePage.GoToSchemeDetailsFromPublishSubpage();
				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();
				schemesPage2.GoToCreateSchemePage()
							.CreateMTAScheme(matschemeName)
							.PublishScheme("This can be deleted")
							.GoToSchemeDetailsFromPublishSubpage();
				SchemesPage schemesPage3 = dashboardPage.GoToMainSchemesPage();
				schemesPage3.GoToCreateSchemePage()
							.CreateRenewalScheme(renSchemeName)
							.PublishScheme("This can be deleted")
							.GoToSchemeDetailsFromPublishSubpage();
				SchemesPage schemesPage4 = dashboardPage.GoToMainSchemesPage();
				schemesPage4.GoToCreateSchemePage()
							.CreateCancelationScheme(cancSchemeName)
							.PublishScheme("This can be deleted")
							.GoToSchemeDetailsFromPublishSubpage();
				ProductsPage productsPage = editSchemePage.GoToMainProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithAllTransactionsVersion(productName, schemeName, matschemeName, renSchemeName, cancSchemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(matschemeName).Contains(matschemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(renSchemeName).Contains(renSchemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(cancSchemeName).Contains(cancSchemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingCdlScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateCdlEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingJsonIHPScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateJsonIhpEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage3 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingBatchedJsonIHPScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateBatchedJsonIhpEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage3 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingKitsuneScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateKitsuneEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage3 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingAxaUkScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateAxaUKEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage3 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName, "Household");
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Household", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
        public void ShouldUserBeAbleToCreateProductUsingCustomPolarisScheme()
        {
            UITest(() =>
            {
                string productName = RandomString();
                string schemeName = RandomString();
                var loginPage = new LoginPage(this.Driver);
                DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
                SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
                CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

                createSchemePage.CreateCustomPolarisEngineScheme(schemeName);

                EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
                SchemesPage schemesPage3 = editSchemePage.GoToMainSchemesPage();

                ProductsPage productPage = dashboardPage.GoToMainProductsPage();
                CreateProductPage createProductPage = productPage.GoToCreateProductPage();

                createProductPage.CreateCustomPolarisProductWithVersion(productName, schemeName);
                ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
                Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
                Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
                Assert.AreEqual("COMMCOMB", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
                Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
            });
        }

        [TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingZurichScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateZurichEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToCreateProductUsingRadarScheme()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();

				createSchemePage.CreateRadarEngineScheme(schemeName);

				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();

				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();

				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.AreEqual("This can be deleted", productDetailsPage.CheckDescriptionName().Text, "Description is wrong or not visible. Please investigate");
				Assert.AreEqual(productName, productDetailsPage.CheckProductName().Text, "Product name is wrong or not visible. Please investigate.");
				Assert.AreEqual("Private Motor", productDetailsPage.CheckLobDetails().Text, "Lob on the product details page is wrong or not visible.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToUseZurichSchemeAsMTACancelRenewal()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateZurichEngineScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersion2(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.IsTrue(productDetailsPage.CheckIfMTASchemeLinked(schemeName).Contains(schemeName), "MTA Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfCancellationSchemeLinked(schemeName).Contains(schemeName), "Cancellation Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfRenewalSchemeLinked(schemeName).Contains(schemeName), "Renewal Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToUseFlexibleSchemeAsMTARenewal()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = "ApiPolarisHouse";
				string mtaScheme = "ApiFlexibleMTANotQUotable";
				string renewalScheme = "ApiFlexibleRenewalHouse";
				string cancellationScheme = "ApiCancellationHouse";
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();
				createProductPage.CreateProductWithAllTransactionsVersion(productName, schemeName,mtaScheme,renewalScheme,cancellationScheme,"Household");
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.IsTrue(productDetailsPage.CheckIfMTASchemeLinked(mtaScheme).Contains(mtaScheme), "MTA Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfCancellationSchemeLinked(cancellationScheme).Contains(cancellationScheme), "Cancellation Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfRenewalSchemeLinked(renewalScheme).Contains(renewalScheme), "Renewal Scheme is not linked in Product Summary. Please investigate.");
			});
		}


		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToUseCreateAndUseFlexibleSchemeAsMTARenewal()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string polarisName = RandomString();
				string schemeName = "ApiPolarisHouse";
				string renewalScheme = "ApiFlexibleRenewalHouse";
				string cancellationScheme = "ApiCancellationHouse";
				string mtaName = RandomString();
				string flexibleName = RandomString();
				string RandomChange = RandomString();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateMTAScheme(mtaName)
						.PublishScheme()
						.GoToSchemeDetailsFromPublishSubpage()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreatePolarisEngineScheme(polarisName, "Household")
						.GoToSchemeDetailsPage()
						.GoToPolarisSchemeVersionPage()
						.SelectSchemeSetAndVariant("ApiPolarisHouse", "1")
						.CreateNewCustomPolarisSchemeVersion()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateFlexiblePolarisScheme(flexibleName, "MTA", mtaName, polarisName, lineOfBussines: "Household")
						.GoToMainProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithAllTransactionsVersion(productName, schemeName, flexibleName, renewalScheme, cancellationScheme, "Household");
				ProductDetailsPage productDetailsPage = loginPage.GoToProductDetailsPage();

				Assert.IsTrue(productDetailsPage.CheckIfMTASchemeLinked(flexibleName).Contains(flexibleName), "MTA Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfCancellationSchemeLinked(cancellationScheme).Contains(cancellationScheme), "Cancellation Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfRenewalSchemeLinked(renewalScheme).Contains(renewalScheme), "Renewal Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserBeAbleToUseRadarSchemeAsMTACancelRenewal()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);
				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();
				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateRadarEngineScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				ProductsPage productPage = dashboardPage.GoToMainProductsPage();
				CreateProductPage createProductPage = productPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersion2(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();

				Assert.IsTrue(productDetailsPage.CheckIfMTASchemeLinked(schemeName).Contains(schemeName), "MTA Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfSchemeLinked(schemeName).Contains(schemeName), "Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfCancellationSchemeLinked(schemeName).Contains(schemeName), "Cancellation Scheme is not linked in Product Summary. Please investigate.");
				Assert.IsTrue(productDetailsPage.CheckIfRenewalSchemeLinked(schemeName).Contains(schemeName), "Renewal Scheme is not linked in Product Summary. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserChangeProductStartDateForTheFutureOne()
		{
			UITest(() =>
			{
				string schemeName = RandomString();
				string productName = RandomString();
				string newProductName = RandomNumber();

				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				SchemesPage schemesPage = dashboardPage.GoToMainSchemesPage();
				CreateSchemePage createSchemePage = schemesPage.GoToCreateSchemePage();
				createSchemePage.CreateAsyncScheme(schemeName);
				EditSchemePage editSchemePage = createSchemePage.GoToEditSchemePage();
				SchemesPage schemesPage2 = editSchemePage.GoToMainSchemesPage();

				ProductsPage productsPage = schemesPage2.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithVersion(productName, schemeName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				ProductsPage productsPage2 = productDetailsPage.GoToMainProductsPage();
				productsPage2.GoToDisabledProductsTab();
				EditProductPage editProductPage = productsPage2.ClickEditProductButton(productName);
				editProductPage.ChangeStartDateToTheFutureOne();
				editProductPage.PublishOnEditPage();
				Assert.IsTrue(editProductPage.GetAlertMessageString().Contains("successfully"), "Product start date update failed. Please investigate");
				ProductDetailsPage productDetailsPage2 = editProductPage.GoToProductDetailsPage();
				productDetailsPage2.GoToVersionsTab();
				Assert.IsTrue(productDetailsPage2.CheckVersion101().Contains("1.0.1"), "Version 1.0.1. was not created or sth on the way went wrong. Please investigate.");
				Assert.AreEqual("Cancel", productDetailsPage2.CheckIfFutureVersionExists(), "Cancel button doesn't exist which means that product future version was not created. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserRemoveProduct()
		{
			UITest(() =>
			{
				string productName = RandomString();
				string schemeName = RandomString();
				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithoutAScheme(productName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				ProductsPage productsPage2 = productDetailsPage.GoToMainProductsPage();
				productsPage2.GoToDisabledProductsTab();
				productsPage2.RemoveProductSoftly(productName);
				Assert.AreEqual("There are no items to display", productsPage2.EmptyListTextOnProducts(), "Products list is not empty after removing a given element. Please investigate.");
				productsPage2.GoToRemovedProductsTab();
				productsPage2.RemoveProductFromRemovedProductsTab(productName);
				Assert.AreEqual("There are no items to display", productsPage2.EmptyRemovedListTextOnProducts(), "Removed Products list is not empty after removing a given element. Please investigate.");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserEnableDisableProduct()
		{
			UITest(() =>
			{
				string productName = RandomString();

				var loginPage = new LoginPage(this.Driver);

				DashboardPage dashboardPage = loginPage.LoginToPortalAdmin();

				ProductsPage productsPage = dashboardPage.GoToProductsPage();
				CreateProductPage createProductPage = productsPage.GoToCreateProductPage();
				createProductPage.CreateProductWithoutAScheme(productName);
				ProductDetailsPage productDetailsPage = createProductPage.GoToProductDetailsPage();
				ProductsPage productsPage2 = productDetailsPage.GoToMainProductsPage();
				productsPage2.GoToDisabledProductsTab();
				productsPage2.SearchForProduct(productName);
				ProductDetailsPage productDetailsPage2 = productsPage2.ClickViewProductButton(productName);
				productDetailsPage2.EnableProduct();
				
				Assert.IsTrue(productDetailsPage2.GetAlertMessageString().Contains("Product enabled"), productDetailsPage2.GetAlertMessageString() + " Product can't be enabled. Please investigate");
				productDetailsPage2.ConfirmAlertOnce();
				productDetailsPage2.RefreshThePortal();
				Assert.IsTrue(productDetailsPage2.CheckIfEnabledTickSelected(), "Product disabled after refreshing. Should be enabled. Please investigate");
				ProductsPage productsPage3 = productDetailsPage2.GoToMainProductsPage();
				productsPage3.SearchForProduct(productName);
				Assert.AreEqual("ENABLED", productsPage3.CheckIfProductEnable(productName), "Product status did not change. Please investigate");
				ProductDetailsPage productDetailsPage3 = productsPage3.ClickViewProductButton(productName);
				productDetailsPage3.DisableProduct();
				productDetailsPage3.ConfirmAlertOnce();
				productDetailsPage3.WaitForAlertMessage("Success", 10);
				Assert.IsTrue(productDetailsPage3.GetAlertMessageString().Contains("Product disabled"), "Product can't be disabled. Please investigate");
				productDetailsPage3.ConfirmAlertOnce();
				ProductsPage productsPage4 = productDetailsPage3.GoToMainProductsPage();
				productsPage4.GoToDisabledProductsTab();
				productsPage4.SearchForProduct(productName);
				Assert.AreEqual("DISABLED", productsPage4.CheckIfProductDisabled(productName), "Product status did not change. Please investigate");
			});
		}

		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("ie")]
		public void ShouldUserCreateIHPSchemeAndUseAsChained()
		{
			UITest(() =>
			{
				var productName = RandomString();
				var schemeName = RandomString();
				var schemeNameIHP = RandomString();
				var loginPage = new LoginPage(Driver);

				loginPage.LoginToPortalAdmin()
						.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAsyncScheme(schemeName)
						.GoToEditSchemePage()
						.GoToMainSchemesPage()
						.SearchForTheScheme(schemeName)
						.CheckIfSchemeExists(schemeName);
				loginPage.GoToMainSchemesPage()
						.GoToCreateSchemePage()
						.CreateAvivaEngineScheme(schemeNameIHP)
						.GoToAvivaSchemeDetailsPage()
						.ConfirmAvivaEnvironment();
				loginPage.GoToMainProductsPage()
						.GoToCreateProductPage()
						.CreateProductWithChainScheme(productName, schemeName, schemeNameIHP)
						.GoToProductDetailsPage()
						.CheckIfAllSchemeLinked(new string[] { schemeName, schemeNameIHP }).Should().BeTrue();

			});
		}
	}
}