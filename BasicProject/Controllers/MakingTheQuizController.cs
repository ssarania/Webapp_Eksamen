using Microsoft.AspNetCore.Mvc;

namespace BasicProject.Controllers;

public class MakingQuizController : Controller
{
    public IActionResult MakingQuiz()
    {
        return View();
    }
}