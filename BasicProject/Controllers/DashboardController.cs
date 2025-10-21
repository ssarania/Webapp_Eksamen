using Microsoft.AspNetCore.Mvc;

namespace BasicProject.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            string userName = "Guest";
            ViewData["Username"] = userName;
            return View();
        }

        public IActionResult Profile()
        {
            string userName = "Guest";
            ViewData["Username"] = userName;
            return View();
        }
    }
}
