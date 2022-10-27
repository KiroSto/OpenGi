using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TicPortalV2SeleniumFramework;
using TicPortalV2SeleniumFramework.Pages;
using TicPortalV2SeleniumFramework.Pages.Connections_Pages;

namespace TicPortalV2SeleniumTests.Tests
{
	[TestClass]
	public class DocumenTests : TestSetUp
	{
		[TestMethod, TestCategory("chrome"), TestCategory("headless"), TestCategory("firefox"), TestCategory("ie")]
		public void ShouldUserNavigateThroughConnectionsTabs()
		{
			UITest(() =>
			{
				string documentName = RandomNumber();
				var loginPage = new LoginPage(this.Driver);
				loginPage.LoginToPortalAdmin()
							.GoToConnections()
							.GoToActiveTab()
							.GoToReceivedTab()
							.GoToRequestedTab()
							.GoToSuspendedTab()
							.NavigateToAddConnection()
							.CheckTextWhenAddingConnections().Should().Be("Here you can see available organizations to connect with", "Text when adding connections is wrong or sth before went wrong. Please investigate.");
				
			});
		}
	}
}