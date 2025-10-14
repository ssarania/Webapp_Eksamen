using Microsoft.AspNetCore.Mvc;

namespace MVC.Controllers;

public class MakingQuizController : Controller
{
    public IActionResult MakingQuiz()
    {
        return View();
    }
}