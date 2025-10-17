using Microsoft.AspNetCore.Mvc;

namespace BasicProject.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
